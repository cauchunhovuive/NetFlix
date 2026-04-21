const sql = require("mssql");
const fs = require("fs");

const config = {
    user: "sa",
    password: "123456",
    server: "localhost",
    database: "NetflixDB",
    options: { trustServerCertificate: true }
};

async function exportCSV() {
    const pool = await sql.connect(config);

    // Export Movies
    const movies = await pool.request().query("SELECT * FROM Movies");
    const moviesCSV = toCSV(movies.recordset);
    fs.writeFileSync("movies.csv", moviesCSV);
    console.log("✅ movies.csv");

    // Export Users
    const users = await pool.request().query("SELECT UserID, Name, Email FROM Users");
    const usersCSV = toCSV(users.recordset);
    fs.writeFileSync("users.csv", usersCSV);
    console.log("✅ users.csv");

    // Export WatchHistory
    const history = await pool.request().query(`
        SELECT wh.HistoryID, u.Name, m.Title, wh.WatchTime, wh.Rating, wh.CreatedAt
        FROM WatchHistory wh
        JOIN Users u ON wh.UserID = u.UserID
        JOIN Movies m ON wh.MovieID = m.MovieID
    `);
    const historyCSV = toCSV(history.recordset);
    fs.writeFileSync("watchhistory.csv", historyCSV);
    console.log("✅ watchhistory.csv");

    await sql.close();
    console.log("🎉 Export xong! 3 file CSV đã được tạo trong thư mục backend/");
}

function toCSV(records) {
    if (!records.length) return "";
    const headers = Object.keys(records[0]).join(",");
    const rows = records.map(r =>
        Object.values(r).map(v =>
            v === null ? "" : `"${String(v).replace(/"/g, '""')}"`
        ).join(",")
    );
    return [headers, ...rows].join("\n");
}

exportCSV().catch(console.error);