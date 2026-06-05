// ═══════════════════════════════════════════════════════════════
// 📤 Export CSV cho Databricks Training
// ═══════════════════════════════════════════════════════════════
//
// Script này export dữ liệu từ Databricks SQL warehouse ra file CSV
// để upload lên Databricks Volume cho việc training.
//
// ✅ Cách dùng:
//   1. node backend/export-csv-for-databricks.js
//   2. File CSV sẽ được lưu vào thư mục data-export/
//   3. Upload các file CSV lên Databricks Volume
//   4. Chạy databricks/Netflix_Analysis.py trên Databricks
// ═══════════════════════════════════════════════════════════════

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getSession } = require("./db");

const EXPORT_DIR = path.join(__dirname, "..", "data-export");

// ═══ Table schemas & queries ═══

const TABLES = {
  users: {
    query: "SELECT UserID, Name, Email, Role FROM workspace.netflixdb.users ORDER BY UserID",
    description: "Danh sách người dùng",
  },
  movies: {
    query: "SELECT MovieID, Title, Genre, Description, Year, Price, TMDB_ID FROM workspace.netflixdb.movies ORDER BY MovieID",
    description: "Danh sách phim",
  },
  watchhistory: {
    query: "SELECT HistoryID, UserID, MovieID, WatchTime, Rating, CreatedAt FROM workspace.netflixdb.watchhistory ORDER BY HistoryID",
    description: "Lịch sử xem phim",
  },
  favorites: {
    query: "SELECT FavoriteID, UserID, MovieID, CreatedAt FROM workspace.netflixdb.favorites ORDER BY FavoriteID",
    description: "Phim yêu thích",
  },
  reviews: {
    query: "SELECT ReviewID, MovieID, UserID, Rating, Comment, CreatedAt FROM workspace.netflixdb.reviews ORDER BY ReviewID",
    description: "Đánh giá phim",
  },
  transactions: {
    query: "SELECT TransactionID, UserID, Amount, Type, Description, VoucherID, CreatedAt FROM workspace.netflixdb.transactions ORDER BY TransactionID",
    description: "Giao dịch ví",
  },
  vouchers: {
    query: "SELECT VoucherID, Code, Discount, Description, ExpiryDate, Active, CreatedAt FROM workspace.netflixdb.vouchers ORDER BY VoucherID",
    description: "Mã giảm giá",
  },
  wallet: {
    query: "SELECT WalletID, UserID, Balance FROM workspace.netflixdb.wallet ORDER BY WalletID",
    description: "Số dư ví",
  },
  userpurchases: {
    query: "SELECT UserID, MovieID, Price, CreatedAt FROM workspace.netflixdb.userpurchases ORDER BY UserID, CreatedAt",
    description: "Phim đã mua",
  },
  support_messages: {
    query: "SELECT MessageID, UserID, SenderType, Message, CreatedAt FROM workspace.netflixdb.support_messages ORDER BY MessageID",
    description: "Tin nhắn hỗ trợ",
  },
};

// ═══ CSV helpers ═══

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

// ═══ Main ═══

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   📤 EXPORT CSV — Upload lên Databricks Volume   ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Tạo thư mục export
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
    console.log(`📁 Đã tạo thư mục: ${EXPORT_DIR}\n`);
  }

  const session = await getSession();
  console.log("📡 Đã kết nối Databricks SQL warehouse\n");

  const results = {};

  for (const [name, config] of Object.entries(TABLES)) {
    console.log(`📤 Exporting ${name} (${config.description})...`);
    try {
      const query = await session.executeStatement(config.query);
      const rows = await query.fetchAll();
      await query.close();

      const csv = toCSV(rows);
      const filePath = path.join(EXPORT_DIR, `${name}.csv`);
      fs.writeFileSync(filePath, csv, "utf-8");

      const fileSize = (Buffer.byteLength(csv, "utf-8") / 1024).toFixed(1);
      results[name] = { rows: rows.length, file: `${name}.csv`, size: `${fileSize} KB` };
      console.log(`   ✅ ${rows.length} rows → ${name}.csv (${fileSize} KB)`);
    } catch (err) {
      results[name] = { rows: 0, file: `${name}.csv`, error: err.message };
      console.log(`   ❌ Lỗi: ${err.message}`);
    }
  }

  await session.close();

  // Tổng kết
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║   📊 TỔNG KẾT EXPORT                              ║");
  console.log("╚═══════════════════════════════════════════════════╝");
  let totalRows = 0;
  for (const [name, r] of Object.entries(results)) {
    const status = r.error ? `❌ ${r.error}` : `✅ ${r.rows} rows`;
    console.log(`   ${name.padEnd(20)}: ${status}`);
    totalRows += r.rows;
  }
  console.log(`\n   📦 Tổng số dòng: ${totalRows}`);
  console.log(`   📁 Thư mục: ${EXPORT_DIR}`);
  console.log(`   📌 Upload các file .csv lên Databricks Volume: /Volumes/main/default/data_netflix/\n`);

  console.log("🔗 Các bước tiếp theo:");
  console.log("   1. Upload file CSV lên Databricks Volume (data_netflix/)");
  console.log("   2. Mở databricks/Netflix_Analysis.py trên Databricks");
  console.log("   3. Chạy notebook để phân tích dữ liệu");
  console.log("   4. Hoặc dùng export API: POST /admin/export/volume-sql\n");

  // Ghi README
  const readmePath = path.join(EXPORT_DIR, "README.txt");
  const readme = `📤 DATABRICKS DATA EXPORT
=========================
Generated: ${new Date().toISOString()}
Total rows: ${totalRows}

CÁCH DÙNG:
1. Upload tất cả file .csv lên Databricks Volume:
   /Volumes/main/default/data_netflix/

2. Mở databricks/Netflix_Analysis.py trên Databricks Notebook

3. Chạy notebook để phân tích dữ liệu

CÁC FILE:
${Object.entries(results).map(([name, r]) => `  - ${name}.csv: ${r.rows} rows ${r.error ? '(ERROR)' : ''}`).join('\n')}
`;
  fs.writeFileSync(readmePath, readme, "utf-8");
  console.log(`📄 Đã ghi README: ${readmePath}`);
}

main().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
