require("dotenv").config();
const { DBSQLClient } = require("@databricks/sql");
const fs = require("fs");

const serverConfig = {
    host: process.env.DATABRICKS_HOST,
    path: process.env.DATABRICKS_PATH,
    token: process.env.DATABRICKS_TOKEN,
};

async function fetchAll(session, sql) {
    const query = await session.executeStatement(sql);
    const rows = await query.fetchAll();
    await query.close();
    return rows;
}

function toCSV(records) {
    if (!records || records.length === 0) return "";
    const headers = Object.keys(records[0]).join(",");
    const rows = records.map((r) =>
        Object.values(r)
            .map((v) => {
                if (v === null || v === undefined) return "";
                const str = String(v);
                // Escape double quotes
                if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            })
            .join(",")
    );
    return [headers, ...rows].join("\n");
}

async function main() {
    console.log("🔌 Connecting to Databricks...");
    const client = new DBSQLClient();
    const connection = await client.connect(serverConfig);
    const session = await connection.openSession();

    const catalog = "workspace";
    const schema = "netflixdb";
    const tables = ["users", "movies", "watchhistory"];

    for (const table of tables) {
        console.log(`  → Exporting ${catalog}.${schema}.${table}...`);
        try {
            const rows = await fetchAll(
                session,
                `SELECT * FROM ${catalog}.${schema}.${table} ORDER BY 1`
            );
            const csv = toCSV(rows);
            fs.writeFileSync(`${table}.csv`, csv);
            console.log(`    ✅ ${table}.csv (${rows.length} rows)`);
        } catch (err) {
            console.error(`    ❌ Lỗi export ${table}:`, err.message);
        }
    }

    await session.close();
    await client.close();
    console.log("\n🎉 Export hoàn tất! 3 file CSV đã được tạo:");
    console.log("   - movies.csv");
    console.log("   - users.csv");
    console.log("   - watchhistory.csv");
    console.log("\n📤 Upload các file này lên Databricks Volume để phân tích với Spark.");
}

main().catch((err) => {
    console.error("Lỗi:", err);
    process.exit(1);
});
