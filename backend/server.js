const express = require("express");
const cors = require("cors");
const { DBSQLClient } = require("@databricks/sql");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE CONFIG ================= */

const serverConfig = {
    host: "dbc-5d5ac2ba-09bc.cloud.databricks.com",
    path: "/sql/1.0/warehouses/a610c57606d351ac",
    token: "dapid5f2283a08db03c876a85091ed6324d5"
};

const client = new DBSQLClient();

async function getSession() {
    const connection = await client.connect(serverConfig);
    return await connection.openSession();
}

/* ================= ROUTES ================= */

app.post("/login", async (req, res) => {
    let session;
    try {
        const { email, password } = req.body;
        session = await getSession();
        const sql = `
            SELECT UserID, Name, Email 
            FROM workspace.netflixdb.users 
            WHERE Email = '${email}' AND Password = '${password}'
        `;
        const query = await session.executeStatement(sql);
        const result = await query.fetchAll();
        await query.close();
        if (result.length === 0) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        res.json({ user: result[0] });
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ message: "Lỗi server khi đăng nhập" });
    } finally {
        if (session) await session.close();
    }
});

app.get("/movies", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const query = await session.executeStatement("SELECT * FROM workspace.netflixdb.movies");
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy dữ liệu phim");
    } finally {
        if (session) await session.close();
    }
});

app.post("/register", async (req, res) => {
    let session;
    try {
        const { name, email, password } = req.body;
        session = await getSession();
        const check = await session.executeStatement(
            `SELECT * FROM workspace.netflixdb.users WHERE Email = '${email}'`
        );
        const rows = await check.fetchAll();
        await check.close();
        if (rows.length > 0) return res.status(400).json({ message: "Email đã tồn tại" });
        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.users (Name, Email, Password)
            VALUES ('${name}', '${email}', '${password}')
        `);
        res.json({ message: "Đăng ký thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    } finally {
        if (session) await session.close();
    }
});

// ✅ Lưu lịch sử xem - KHÔNG truyền HistoryID (tự sinh IDENTITY)
app.post("/watch", async (req, res) => {
    let session;
    try {
        const { user_id, movie_id, watch_time, rating } = req.body;

        if (!user_id || !movie_id || !watch_time || !rating) {
            return res.status(400).json({ message: "Thiếu thông tin" });
        }

        session = await getSession();

        const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.watchhistory (UserID, MovieID, WatchTime, Rating, CreatedAt)
            VALUES (${user_id}, ${movie_id}, ${watch_time}, ${rating}, '${createdAt}')
        `);

        res.json({ message: "Lưu lịch sử thành công" });
    } catch (err) {
        console.error("Lỗi lưu lịch sử:", err);
        res.status(500).json({ message: "Lỗi server khi lưu lịch sử", detail: err.message });
    } finally {
        if (session) await session.close();
    }
});

// Xem lịch sử (Join 3 bảng)
app.get("/history", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const sql = `
    SELECT 
        wh.HistoryID, wh.UserID, u.Name, m.Title, wh.WatchTime, wh.Rating, wh.CreatedAt
    FROM workspace.netflixdb.watchhistory wh
    JOIN workspace.netflixdb.users u ON wh.UserID = u.UserID
    JOIN workspace.netflixdb.movies m ON wh.MovieID = m.MovieID
    ORDER BY wh.CreatedAt DESC
`;
        const query = await session.executeStatement(sql);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy lịch sử");
    } finally {
        if (session) await session.close();
    }
});

/* ================= START ================= */

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});