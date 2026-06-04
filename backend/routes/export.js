const { Router } = require("express");
const { getSession, safeCount } = require("../db");

const router = Router();

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function toCSV(records) {
    if (!records || records.length === 0) return "";
    const headers = Object.keys(records[0]).join(",");
    const rows = records.map((r) =>
        Object.values(r)
            .map((v) => {
                if (v === null || v === undefined) return "";
                const str = String(v);
                if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            })
            .join(",")
    );
    return [headers, ...rows].join("\n");
}

function toJSONLines(records) {
    if (!records || records.length === 0) return "";
    return records.map((r) => JSON.stringify(r)).join("\n");
}

// ═══════════════════════════════════════════════════════════════
// TABLE SCHEMAS
// ═══════════════════════════════════════════════════════════════

const TABLE_SCHEMAS = {
    users: {
        columns: [
            { name: "UserID", type: "INT", description: "ID người dùng (PK)" },
            { name: "Name", type: "STRING", description: "Tên người dùng" },
            { name: "Email", type: "STRING", description: "Email" },
            { name: "Password", type: "STRING", description: "Mật khẩu" },
            { name: "Role", type: "STRING", description: "Vai trò: User / Admin" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.users ORDER BY UserID",
        description: "Danh sách người dùng",
        bronze_note: "Chứa PII — cần masking ở silver layer",
        silver_transforms: [`-- Mask email: regexp_replace(Email, '@', '***@') as Email`,
            `-- Hash password: sha2(Password, 256) as Password`],
        expect: ["valid_userid: UserID IS NOT NULL", "valid_email: Email LIKE '%@%'"],
    },
    movies: {
        columns: [
            { name: "MovieID", type: "INT", description: "ID phim (PK)" },
            { name: "Title", type: "STRING", description: "Tên phim" },
            { name: "Genre", type: "STRING", description: "Thể loại" },
            { name: "Description", type: "STRING", description: "Mô tả phim" },
            { name: "Year", type: "INT", description: "Năm phát hành" },
            { name: "Price", type: "DECIMAL", description: "Giá phim" },
            { name: "TMDB_ID", type: "INT", description: "ID TMDB" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.movies ORDER BY MovieID",
        description: "Danh sách phim",
        bronze_note: "Dữ liệu gốc từ OMDb + backend",
        silver_transforms: [`-- Parse genres: split(Genre, ',') as Genres`,
            `-- Ensure Year is valid: CASE WHEN Year > 1900 THEN Year ELSE NULL END as Year`],
        expect: ["valid_movieid: MovieID IS NOT NULL", "valid_title: Title IS NOT NULL AND LENGTH(Title) > 0"],
    },
    watchhistory: {
        columns: [
            { name: "HistoryID", type: "BIGINT", description: "ID lịch sử (PK)" },
            { name: "UserID", type: "INT", description: "ID người dùng (FK)" },
            { name: "MovieID", type: "INT", description: "ID phim (FK)" },
            { name: "WatchTime", type: "INT", description: "Thời gian xem (phút)" },
            { name: "Rating", type: "INT", description: "Đánh giá (1-5)" },
            { name: "CreatedAt", type: "TIMESTAMP", description: "Thời gian ghi" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.watchhistory ORDER BY HistoryID",
        description: "Lịch sử xem phim",
        bronze_note: "Dữ liệu gốc từ user interaction",
        silver_transforms: [`-- Validate rating range: CASE WHEN Rating BETWEEN 1 AND 5 THEN Rating ELSE NULL END as Rating`,
            `-- Parse timestamp: to_timestamp(CreatedAt) as CreatedAt`],
        expect: ["valid_rating: Rating IS NULL OR (Rating >= 1 AND Rating <= 5)",
                 "valid_watchtime: WatchTime IS NULL OR WatchTime > 0"],
    },
    transactions: {
        columns: [
            { name: "TransactionID", type: "BIGINT", description: "ID giao dịch (PK)" },
            { name: "UserID", type: "INT", description: "ID người dùng (FK)" },
            { name: "Amount", type: "DECIMAL", description: "Số tiền" },
            { name: "Type", type: "STRING", description: "Loại: topup / purchase" },
            { name: "Description", type: "STRING", description: "Mô tả" },
            { name: "VoucherID", type: "INT", description: "ID voucher (FK)" },
            { name: "CreatedAt", type: "TIMESTAMP", description: "Thời gian" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.transactions ORDER BY TransactionID",
        description: "Giao dịch ví",
        bronze_note: "Dữ liệu tài chính",
        silver_transforms: [`-- Categorize amount: CASE WHEN Amount > 0 THEN 'inflow' ELSE 'outflow' END as FlowType`],
        expect: ["valid_amount: Amount IS NOT NULL", "valid_type: Type IN ('topup', 'purchase')"],
    },
    vouchers: {
        columns: [
            { name: "VoucherID", type: "INT", description: "ID voucher (PK)" },
            { name: "Code", type: "STRING", description: "Mã giảm giá" },
            { name: "Discount", type: "INT", description: "Phần trăm giảm" },
            { name: "Description", type: "STRING", description: "Mô tả" },
            { name: "ExpiryDate", type: "DATE", description: "Ngày hết hạn" },
            { name: "Active", type: "BOOL", description: "Trạng thái" },
            { name: "CreatedAt", type: "TIMESTAMP", description: "Thời gian tạo" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.vouchers ORDER BY VoucherID",
        description: "Mã giảm giá",
        bronze_note: "Dữ liệu chương trình khuyến mãi",
        silver_transforms: [],
        expect: ["valid_code: Code IS NOT NULL", "valid_discount: Discount BETWEEN 0 AND 100"],
    },
    wallet: {
        columns: [
            { name: "WalletID", type: "INT", description: "ID ví (PK)" },
            { name: "UserID", type: "INT", description: "ID người dùng (FK)" },
            { name: "Balance", type: "DECIMAL", description: "Số dư" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.wallet ORDER BY WalletID",
        description: "Số dư ví",
        bronze_note: "Snapshot số dư hiện tại",
        silver_transforms: [`-- Ensure no negative balance: CASE WHEN Balance < 0 THEN 0 ELSE Balance END as Balance`],
        expect: ["valid_balance: Balance >= 0"],
    },
    favorites: {
        columns: [
            { name: "FavoriteID", type: "BIGINT", description: "ID yêu thích (PK)" },
            { name: "UserID", type: "INT", description: "ID người dùng (FK)" },
            { name: "MovieID", type: "INT", description: "ID phim (FK)" },
            { name: "CreatedAt", type: "STRING", description: "Thời gian thêm" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.favorites ORDER BY FavoriteID",
        description: "Phim yêu thích",
        bronze_note: "Dữ liệu tương tác người dùng",
        silver_transforms: [],
        expect: ["valid_userid: UserID IS NOT NULL", "valid_movieid: MovieID IS NOT NULL"],
    },
    reviews: {
        columns: [
            { name: "ReviewID", type: "BIGINT", description: "ID đánh giá (PK)" },
            { name: "MovieID", type: "INT", description: "ID phim (FK)" },
            { name: "UserID", type: "INT", description: "ID người dùng (FK)" },
            { name: "Rating", type: "INT", description: "Đánh giá (1-5)" },
            { name: "Comment", type: "STRING", description: "Bình luận" },
            { name: "CreatedAt", type: "TIMESTAMP", description: "Thời gian" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.reviews ORDER BY ReviewID",
        description: "Đánh giá phim",
        bronze_note: "Dữ liệu từ user review",
        silver_transforms: [`-- Validate rating: CASE WHEN Rating BETWEEN 1 AND 5 THEN Rating ELSE NULL END as Rating`],
        expect: ["valid_rating: Rating BETWEEN 1 AND 5"],
    },
    support_messages: {
        columns: [
            { name: "MessageID", type: "BIGINT", description: "ID tin nhắn (PK)" },
            { name: "UserID", type: "INT", description: "ID người dùng (FK)" },
            { name: "SenderType", type: "STRING", description: "Loại người gửi" },
            { name: "Message", type: "STRING", description: "Nội dung" },
            { name: "CreatedAt", type: "TIMESTAMP", description: "Thời gian" },
        ],
        sql: "SELECT * FROM workspace.netflixdb.support_messages ORDER BY MessageID",
        description: "Tin nhắn hỗ trợ",
        bronze_note: "Dữ liệu từ support chat",
        silver_transforms: [],
        expect: ["valid_sender: SenderType IN ('user', 'admin')"],
    },
};

const TABLE_NAMES = Object.keys(TABLE_SCHEMAS);

// ═══════════════════════════════════════════════════════════════
// GET /admin/export/tables
// ═══════════════════════════════════════════════════════════════

router.get("/admin/export/tables", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const tablesInfo = [];
        for (const name of TABLE_NAMES) {
            const count = await safeCount(session, name);
            tablesInfo.push({
                name,
                rowCount: count,
                columns: TABLE_SCHEMAS[name].columns,
                description: TABLE_SCHEMAS[name].description,
            });
        }
        res.json({ tables: tablesInfo, exportedAt: new Date().toISOString() });
    } catch (err) {
        console.error("Lỗi lấy danh sách bảng:", err);
        res.status(500).json({ message: "Lỗi lấy danh sách bảng", detail: err.message });
    } finally {
        if (session) await session.close();
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /admin/export/csv
// ═══════════════════════════════════════════════════════════════

router.post("/admin/export/csv", async (req, res) => {
    let session;
    try {
        const { tables, format = "csv" } = req.body;
        const selected = tables && tables.length > 0
            ? tables.filter((t) => TABLE_NAMES.includes(t))
            : TABLE_NAMES;
        if (selected.length === 0) {
            return res.status(400).json({ message: "Không có bảng hợp lệ nào được chọn" });
        }
        session = await getSession();
        const results = {};
        for (const name of selected) {
            try {
                const query = await session.executeStatement(TABLE_SCHEMAS[name].sql);
                const rows = await query.fetchAll();
                await query.close();
                results[name] = {
                    rowCount: rows.length,
                    content: format === "jsonl" ? toJSONLines(rows) : toCSV(rows),
                    format,
                    columns: TABLE_SCHEMAS[name].columns.map((c) => c.name),
                };
            } catch (err) {
                results[name] = {
                    rowCount: 0, content: "", format,
                    columns: TABLE_SCHEMAS[name].columns.map((c) => c.name),
                    error: err.message,
                };
            }
        }
        res.json({ results, exportedAt: new Date().toISOString(), totalTables: selected.length });
    } catch (err) {
        console.error("Lỗi export dữ liệu:", err);
        res.status(500).json({ message: "Lỗi export dữ liệu", detail: err.message });
    } finally {
        if (session) await session.close();
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /admin/export/job-notebook
// Sinh notebook Databricks để chạy như 1 task trong Job
// ═══════════════════════════════════════════════════════════════

router.post("/admin/export/job-notebook", async (req, res) => {
    try {
        const {
            tables = TABLE_NAMES,
            sourceCatalog = "workspace",
            sourceSchema = "netflixdb",
        } = req.body;
        const selected = tables.filter((t) => TABLE_NAMES.includes(t));
        const sourcePath = `${sourceCatalog}.${sourceSchema}`;

        const loadSections = selected.map((name) => {
            const s = TABLE_SCHEMAS[name];
            return [
                `# TABLE: ${name} — ${s.description}`,
                `${name}_df = spark.table("${sourcePath}.${name}")`,
                `print(f"  ✅ ${name}: {${name}_df.count()} rows loaded from ${sourcePath}.${name}")`,
            ].join("\n");
        }).join("\n\n");

        const script = `# Databricks notebook source
# ═══════════════════════════════════════════════════════════
# 🚀 Netflix Job Task — Transform & Write Delta
# ═══════════════════════════════════════════════════════════
# Dùng notebook này như 1 task trong Databricks Job.
# Dữ liệu đọc trực tiếp từ Delta tables có sẵn (${sourcePath}).
#
# Generated: ${new Date().toISOString()}
# Tables: ${selected.join(", ")} | Source: ${sourcePath}
#
# Cách dùng:
#   1. Import notebook vào Databricks Workspace
#   2. Tạo Databricks Job → Add task → Select notebook này
#   3. Set parameters hoặc dùng value mặc định
# ═══════════════════════════════════════════════════════════

# MAGIC %md
# # 🚀 Netflix Job Task — Đọc từ Delta có sẵn -> Transform -> Ghi Delta
# ## Task này đọc dữ liệu từ existing Delta tables, transform, ghi ra output tables mới.

# COMMAND ----------

# MAGIC %md
# ## 1. Cấu hình

# COMMAND ----------

from pyspark.sql.functions import col, current_timestamp

source_path = "${sourcePath}"

print(f"📂 Source: {source_path}")
print(f"📋 Tables: ${selected.join(", ")}")

# COMMAND ----------

# MAGIC %md
# ## 2. Đọc dữ liệu từ Delta tables có sẵn

# COMMAND ----------

${loadSections}

# COMMAND ----------

# MAGIC %md
# ## 3. Transform & Ghi Delta

# COMMAND ----------

${selected.map((name) => {
    return [
        `# ${name}`,
        `${name}_out = ${name}_df.withColumn("_job_run_time", current_timestamp())`,
        `# Check data quality`,
        `total = ${name}_out.count()`,
        `nulls = ${name}_out.filter(col("${TABLE_SCHEMAS[name].columns[0].name}").isNull()).count()`,
        `print(f"  📊 ${name}: {total} rows, {nulls} null PKs")`,
        ``,
        `# Write to Delta output table`,
        `${name}_out.write.mode("overwrite").saveAsTable("netflix_job_${name}")`,
        `print(f"  ✅ Saved: netflix_job_${name}")`,
    ].join("\n");
}).join("\n\n")}

# COMMAND ----------

# MAGIC %md
# ## 4. Hoàn tất

# COMMAND ----------

print("✅ Job task completed successfully!")
display(spark.sql("SHOW TABLES LIKE 'netflix_job_*'"))
`;

        res.json({
            script,
            metadata: {
                generatedAt: new Date().toISOString(),
                tables: selected,
                sourcePath,
                scriptLength: script.length,
                language: "python",
                type: "job_notebook",
                note: "Đọc trực tiếp từ Delta tables có sẵn — không cần Volume/CSV",
            },
        });
    } catch (err) {
        console.error("Lỗi sinh job notebook:", err);
        res.status(500).json({ message: "Lỗi sinh job notebook", detail: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /admin/export/job-multi-task
// Sinh multi-task Databricks Job config (DAG workflow)
// ═══════════════════════════════════════════════════════════════

router.post("/admin/export/job-multi-task", async (req, res) => {
    try {
        const {
            tables = TABLE_NAMES,
            sourceCatalog = "workspace",
            sourceSchema = "netflixdb",
            notebookPath = "/Users/netflix_admin/jobs/Netflix_ETL_Task",
            jobName = "Netflix ETL Multi-Task Pipeline",
            schedule = { enabled: false, cron: "0 0 6 * * ?", timezone: "Asia/Ho_Chi_Minh" },
            cluster = {
                spark_version: "14.3.x-scala2.12",
                node_type_id: "i3.xlarge",
                num_workers: 2,
                autotermination_minutes: 30,
            },
        } = req.body;

        const selected = tables.filter((t) => TABLE_NAMES.includes(t));
        const sourcePath = `${sourceCatalog}.${sourceSchema}`;

        // ─── Build multi-task DAG ───
        // Tasks: Clean (validate), Enrich (join data), Aggregate (compute stats), Report (SQL query)
        // Note: Skip "ingest" — dữ liệu đã có sẵn trong Delta tables, không cần load từ CSV
        const tasks = [
            {
                task_key: "01_Clean_Validate",
                description: "Đọc từ Delta tables có sẵn, kiểm tra data quality, loại bỏ records lỗi",
                notebook_task: {
                    notebook_path: notebookPath + "_clean",
                    base_parameters: {
                        source_catalog: sourceCatalog,
                        source_schema: sourceSchema,
                        tables: selected.join(","),
                        layer: "silver",
                        drop_invalid: "true",
                    },
                },
                email_notifications: {
                    on_failure: ["admin@netflix.com"],
                },
                max_retries: 2,
                min_retry_interval_millis: 60000,
                retry_on_timeout: true,
                timeout_seconds: 1800,
            },
            {
                task_key: "02_Enrich_Join",
                description: "Enrich watchhistory với user/movie info từ Delta tables",
                depends_on: [{ task_key: "01_Clean_Validate" }],
                notebook_task: {
                    notebook_path: notebookPath + "_enrich",
                    base_parameters: {
                        source_catalog: sourceCatalog,
                        source_schema: sourceSchema,
                        tables: selected.join(","),
                        layer: "gold",
                    },
                },
                max_retries: 1,
                timeout_seconds: 1200,
            },
        ];

        // Add aggregate tasks for high-volume tables
        if (selected.includes("watchhistory")) {
            tasks.push({
                task_key: "03_Aggregate_Stats",
                description: "Tính toán thống kê user & movie từ Delta tables",
                depends_on: [{ task_key: "02_Enrich_Join" }],
                notebook_task: {
                    notebook_path: notebookPath + "_stats",
                    base_parameters: {
                        source_catalog: sourceCatalog,
                        source_schema: sourceSchema,
                        compute_user_stats: "true",
                        compute_movie_stats: "true",
                        layer: "gold",
                    },
                },
                max_retries: 1,
                timeout_seconds: 900,
            });
        }

        // Add SQL report task
        const lastTask = selected.includes("watchhistory") ? "03_Aggregate_Stats" : "02_Enrich_Join";
        tasks.push({
            task_key: "99_SQL_Reports",
            description: "Generate daily business reports từ Delta tables",
            depends_on: [{ task_key: lastTask }],
            sql_task: {
                query: {
                    query_id: "REPLACE_WITH_YOUR_SQL_QUERY_ID",
                },
            },
            timeout_seconds: 600,
        });

        const jobConfig = {
            name: jobName,
            description: `Multi-task ETL pipeline: ${selected.length} tables from ${sourcePath} (${selected.join(", ")})`,
            tags: {
                project: "Netflix Clone",
                type: "multi-task-etl",
                environment: "production",
                source: sourcePath,
                tables: selected.join(","),
            },
            email_notifications: {
                on_start: [],
                on_success: [],
                on_failure: ["admin@netflix.com"],
                no_alert_for_skipped_runs: false,
            },
            webhook_notifications: {
                on_failure: [{
                    id: "slack-alert",
                    url: "https://hooks.slack.com/services/REPLACE_WITH_SLACK_WEBHOOK",
                }],
            },
            max_retries: 2,
            min_retry_interval_millis: 300000,
            retry_on_timeout: true,
            timeout_seconds: 7200,
            new_cluster: {
                spark_version: cluster.spark_version,
                node_type_id: cluster.node_type_id,
                num_workers: cluster.num_workers,
                autotermination_minutes: cluster.autotermination_minutes,
                spark_env_vars: {
                    NETFLIX_SOURCE_CATALOG: sourceCatalog,
                    NETFLIX_SOURCE_SCHEMA: sourceSchema,
                    NETFLIX_TABLES: selected.join(","),
                },
            },
            tasks,
            queue: {
                enabled: true,
            },
        };

        // Add schedule if enabled
        if (schedule.enabled && schedule.cron) {
            jobConfig.schedule = {
                quartz_cron_expression: schedule.cron,
                timezone_id: schedule.timezone || "Asia/Ho_Chi_Minh",
                pause_status: "PAUSED",
            };
        }

        // Generate DAG visualization string
        const dagLines = tasks.map((t) => {
            const deps = t.depends_on ? t.depends_on.map((d) => d.task_key).join(", ") : "(root)";
            return `  ${t.task_key} ← ${deps}`;
        }).join("\n");

        res.json({
            jobConfig,
            dagVisualization: dagLines,
            metadata: {
                jobName,
                generatedAt: new Date().toISOString(),
                tables: selected,
                sourcePath,
                totalTasks: tasks.length,
                scheduleEnabled: schedule.enabled,
                validForDatabricks: true,
                databricksApiEndpoint: "POST /api/2.1/jobs/create",
                note: "Dữ liệu đọc trực tiếp từ Delta tables có sẵn — không cần Volume/CSV",
            },
        });
    } catch (err) {
        console.error("Lỗi sinh multi-task job:", err);
        res.status(500).json({ message: "Lỗi sinh job config", detail: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /admin/export/dlt-pipeline
// Sinh DLT Pipeline definition (Delta Live Tables — declarative)
// ═══════════════════════════════════════════════════════════════

router.post("/admin/export/dlt-pipeline", async (req, res) => {
    try {
        const {
            tables = TABLE_NAMES,
            sourceCatalog = "workspace",
            sourceSchema = "netflixdb",
            pipelineName = "Netflix DLT Pipeline — Bronze → Silver → Gold",
            mode = "triggered",
        } = req.body;

        const selected = tables.filter((t) => TABLE_NAMES.includes(t));
        const sourcePath = `${sourceCatalog}.${sourceSchema}`;

        // ─── Bronze tables: đọc từ Delta tables có sẵn ───
        const bronzeTables = selected.map((name) => {
            const s = TABLE_SCHEMAS[name];
            return [
                ``,
                `@dlt.table(`,
                `    comment="Raw ${s.description} — từ ${sourcePath}.${name} (Delta table có sẵn)"`,
                `)`,
                `@dlt.expect_all({`,
                s.expect.map((e) => `    "${e.split(":")[0].trim()}": "${e.split(":").slice(1).join(":").trim()}"`).join(",\n"),
                `})`,
                `def bronze_${name}():`,
                `    return spark.table("${sourcePath}.${name}")`,
            ].join("\n");
        }).join("\n");

        // ─── Silver tables: clean + validate ───
        const silverTables = selected.map((name) => {
            const s = TABLE_SCHEMAS[name];
            const transforms = s.silver_transforms.length > 0
                ? `\n    # Apply silver transforms\n    df = (df${s.silver_transforms.join("\n        ")})`
                : `\n    # No additional transforms needed`;
            const selectCols = s.columns.map((c) => c.name).join(", ");

            return [
                ``,
                `@dlt.table(`,
                `    comment="Cleaned ${s.description} — ready for analytics"`,
                `)`,
                `@dlt.expect_all({`,
                s.expect.map((e) => `    "${e.split(":")[0].trim()}": "${e.split(":").slice(1).join(":").trim()}"`).join(",\n"),
                `})`,
                `def silver_${name}():`,
                `    df = dlt.read("bronze_${name}")`,
                transforms,
                ``,
                `    return df.select("${selectCols}")`,
            ].join("\n");
        }).join("\n");

        // ─── Gold tables: aggregates & insights ───
        let goldTables = "";

        if (selected.includes("watchhistory")) {
            goldTables += [
                ``,
                `@dlt.table(`,
                `    comment="User viewing statistics (gold layer)"`,
                `)`,
                `def gold_user_stats():`,
                `    return (`,
                `        dlt.read("silver_watchhistory")`,
                `        .join(dlt.read("silver_users").select("UserID", "Name"), "UserID")`,
                `        .groupBy("UserID", "Name")`,
                `        .agg(`,
                `            count("*").alias("total_views"),`,
                `            round(avg("WatchTime"), 0).alias("avg_watch_time"),`,
                `            sum("WatchTime").alias("total_watch_time"),`,
                `            round(avg("Rating"), 2).alias("avg_rating"),`,
                `        )`,
                `    )`,
            ].join("\n") + "\n";

            goldTables += [
                ``,
                `@dlt.table(`,
                `    comment="Movie popularity statistics (gold layer)"`,
                `)`,
                `def gold_movie_stats():`,
                `    return (`,
                `        dlt.read("silver_watchhistory")`,
                `        .join(dlt.read("silver_movies").select("MovieID", "Title", "Genre"), "MovieID")`,
                `        .groupBy("MovieID", "Title", "Genre")`,
                `        .agg(`,
                `            count("*").alias("total_views"),`,
                `            round(avg("Rating"), 2).alias("avg_rating"),`,
                `            sum("WatchTime").alias("total_watch_time"),`,
                `        )`,
                `    )`,
            ].join("\n");
        }

        if (selected.includes("transactions")) {
            goldTables += [
                ``,
                `@dlt.table(`,
                `    comment="Revenue & transaction analytics (gold layer)"`,
                `)`,
                `def gold_revenue_analytics():`,
                `    return (`,
                `        dlt.read("silver_transactions")`,
                `        .groupBy("Type", to_date("CreatedAt").alias("Date"))`,
                `        .agg(`,
                `            count("*").alias("tx_count"),`,
                `            round(sum("Amount"), 2).alias("total_amount"),`,
                `        )`,
                `        .orderBy("Date")`,
                `    )`,
            ].join("\n");
        }

        // Fallback gold if no enrichable data
        if (!goldTables) {
            goldTables = selected.map((name) => {
                return [
                    ``,
                    `@dlt.table(`,
                    `    comment="Ready-to-use ${TABLE_SCHEMAS[name].description} (gold)"`,
                    `)`,
                    `def gold_${name}():`,
                    `    return dlt.read("silver_${name}")`,
                ].join("\n");
            }).join("\n");
        }

        // ─── Assemble full DLT script ───
        const script = `# Databricks notebook source
# ═══════════════════════════════════════════════════════════
# 🏗️ Netflix DLT Pipeline — Bronze → Silver → Gold
# ═══════════════════════════════════════════════════════════
# Delta Live Tables pipeline định nghĩa bằng Python.
# Dữ liệu Bronze đọc trực tiếp từ Delta tables có sẵn (${sourcePath}).
#
# Generated: ${new Date().toISOString()}
# Tables: ${selected.join(", ")} | Source: ${sourcePath}
# Mode: ${mode}
#
# Cách dùng:
#   1. Tạo DLT Pipeline → Pipeline mode: ${mode}
#   2. Source code → Chọn notebook này
#   3. Target → Chọn catalog/schema
#   4. Start pipeline
# ═══════════════════════════════════════════════════════════

import dlt
from pyspark.sql.functions import col, count, sum, avg, round, to_date, current_timestamp

# ═════════════════════════════════════════════════════════
# BRONZE LAYER — Raw data từ Delta tables có sẵn
# ═════════════════════════════════════════════════════════
# Dữ liệu đã có sẵn trong ${sourcePath}.*, đọc trực tiếp bằng spark.table()
# Không cần load từ Volume/CSV — database đã chạy trên Databricks!
# ═════════════════════════════════════════════════════════${bronzeTables}

# ═════════════════════════════════════════════════════════
# SILVER LAYER — Clean & Validate
# ═════════════════════════════════════════════════════════
# Mục đích: Làm sạch dữ liệu, chuẩn hóa định dạng
# Data quality: EXPECT kiểm tra toàn vẹn dữ liệu
# ═════════════════════════════════════════════════════════${silverTables}

# ═════════════════════════════════════════════════════════
# GOLD LAYER — Aggregates & Business Insights
# ═════════════════════════════════════════════════════════
# Mục đích: Tổng hợp dữ liệu phục vụ báo cáo, dashboard
# ═════════════════════════════════════════════════════════${goldTables}

# ═════════════════════════════════════════════════════════
# Pipeline catalog
# ═════════════════════════════════════════════════════════

print("=" * 60)
print("  🏗️  DLT PIPELINE CATALOG")
print("=" * 60)
${selected.map((name) => {
    return `print(f"  📄 bronze_${name} — Raw from ${sourcePath}.${name}")`;
}).join("\n")}
${selected.map((name) => {
    return `print(f"  📄 silver_${name} — Cleaned ${TABLE_SCHEMAS[name].description}")`;
}).join("\n")}
if "watchhistory" in ${JSON.stringify(selected)}:
    print("  📄 gold_user_stats — User statistics")
    print("  📄 gold_movie_stats — Movie statistics")
if "transactions" in ${JSON.stringify(selected)}:
    print("  📄 gold_revenue_analytics — Revenue analytics")
print("=" * 60)
print("  ✅ DLT Pipeline ready!")
print(f"  Mode: ${mode}")
print(f"  📂 Source: ${sourcePath}.* (Delta tables có sẵn)")
print("=" * 60)
`;

        res.json({
            script,
            metadata: {
                pipelineName,
                generatedAt: new Date().toISOString(),
                tables: selected,
                sourcePath,
                mode,
                scriptLength: script.length,
                language: "python",
                type: "dlt_pipeline",
                tableCount: {
                    bronze: selected.length,
                    silver: selected.length,
                    gold: (selected.includes("watchhistory") ? 2 : 0) + (selected.includes("transactions") ? 1 : 0) || selected.length,
                },
                note: "Dữ liệu Bronze đọc trực tiếp từ Delta tables có sẵn — không cần Volume/CSV",
            },
        });
    } catch (err) {
        console.error("Lỗi sinh DLT pipeline:", err);
        res.status(500).json({ message: "Lỗi sinh DLT pipeline", detail: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /admin/export/job-config
// Sinh single-task Databricks Job config (đơn giản)
// ═══════════════════════════════════════════════════════════════

router.post("/admin/export/job-config", async (req, res) => {
    // Note: Endpoint kept for backward compatibility. Dùng multi-task job cho production.
    try {
        const {
            tables = TABLE_NAMES,
            sourceCatalog = "workspace",
            sourceSchema = "netflixdb",
            pipelineName = "Netflix Data Pipeline",
            schedule = { enabled: false, cron: "0 0 * * *", timezone: "Asia/Ho_Chi_Minh" },
            cluster = {
                spark_version: "14.3.x-scala2.12",
                node_type_id: "i3.xlarge",
                num_workers: 2,
                autotermination_minutes: 30,
            },
        } = req.body;
        const selected = tables.filter((t) => TABLE_NAMES.includes(t));
        const sourcePath = `${sourceCatalog}.${sourceSchema}`;

        const jobConfig = {
            name: pipelineName,
            description: `Pipeline xử lý dữ liệu Netflix: ${selected.join(", ")} từ ${sourcePath}`,
            tags: { project: "Netflix Clone", type: "data-pipeline", source: sourcePath, tables: selected.join(",") },
            new_cluster: {
                spark_version: cluster.spark_version,
                node_type_id: cluster.node_type_id,
                num_workers: cluster.num_workers,
                autotermination_minutes: cluster.autotermination_minutes,
                spark_env_vars: {
                    NETFLIX_TABLES: selected.join(","),
                    NETFLIX_SOURCE: sourcePath,
                },
            },
            notebook_task: {
                notebook_path: `/Users/netflix_admin/pipelines/${pipelineName.replace(/\s+/g, "_")}`,
                base_parameters: { tables: selected.join(","), source_catalog: sourceCatalog, source_schema: sourceSchema },
            },
            email_notifications: { on_success: [], on_failure: [], no_alert_for_skipped_runs: false },
            max_retries: 2,
            min_retry_interval_millis: 300000,
            retry_on_timeout: true,
            timeout_seconds: 3600,
        };
        if (schedule.enabled && schedule.cron) {
            jobConfig.schedule = { quartz_cron_expression: schedule.cron, timezone_id: schedule.timezone || "Asia/Ho_Chi_Minh", pause_status: "UNPAUSED" };
        }
        res.json({ jobConfig, metadata: { pipelineName, generatedAt: new Date().toISOString(), tables: selected, sourcePath, scheduleEnabled: schedule.enabled, validForDatabricks: true } });
    } catch (err) {
        console.error("Lỗi sinh job config:", err);
        res.status(500).json({ message: "Lỗi sinh job config", detail: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// POST /admin/export/volume-sql
// Sinh COPY INTO SQL
// ═══════════════════════════════════════════════════════════════

router.post("/admin/export/volume-sql", async (req, res) => {
    try {
        const { tables = TABLE_NAMES, format = "csv", volumePath = "/Volumes/main/default/data_netflix/" } = req.body;
        const selected = tables.filter((t) => TABLE_NAMES.includes(t));
        let sqlScript = `-- ═══════════════════════════════════════════════\n-- COPY INTO — Import dữ liệu Netflix lên Databricks\n-- Generated: ${new Date().toISOString()}\n-- Format: ${format}\n-- Volume: ${volumePath}\n-- ═══════════════════════════════════════════════\n\n`;
        sqlScript += `CREATE SCHEMA IF NOT EXISTS workspace.netflixdb;\n\n`;
        for (const name of selected) {
            const schema = TABLE_SCHEMAS[name];
            const cols = schema.columns.map((c) => `    ${c.name} ${c.type}`).join(",\n");
            const filePath = `${volumePath}${name}.${format}`;
            sqlScript += `-- ═══ ${name} — ${schema.description} ═══\n`;
            sqlScript += `DROP TABLE IF EXISTS workspace.netflixdb.${name};\n\n`;
            sqlScript += `CREATE TABLE workspace.netflixdb.${name} (\n${cols}\n) USING DELTA;\n\n`;
            if (format === "csv") {
                sqlScript += `COPY INTO workspace.netflixdb.${name}\nFROM '${filePath}'\nFILEFORMAT = CSV\nFORMAT_OPTIONS ('header' = 'true', 'inferSchema' = 'true')\nCOPY_OPTIONS ('mergeSchema' = 'true');\n\n`;
            } else {
                sqlScript += `COPY INTO workspace.netflixdb.${name}\nFROM '${filePath}'\nFILEFORMAT = JSON\nCOPY_OPTIONS ('mergeSchema' = 'true');\n\n`;
            }
        }
        sqlScript += `-- ✅ Hoàn tất!\n`;
        for (const name of selected) {
            sqlScript += `SELECT COUNT(*) as cnt_${name} FROM workspace.netflixdb.${name};\n`;
        }
        res.json({ sqlScript, metadata: { generatedAt: new Date().toISOString(), tables: selected, format, volumePath, scriptLength: sqlScript.length, language: "sql" } });
    } catch (err) {
        console.error("Lỗi sinh SQL script:", err);
        res.status(500).json({ message: "Lỗi sinh SQL script", detail: err.message });
    }
});

module.exports = router;
