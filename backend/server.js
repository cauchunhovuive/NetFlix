const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */

const config = {
    user: "sa",
    password: "123456",
    server: "localhost",
    database: "NetflixDB",
    options: {
        trustServerCertificate: true
    }
};

// Tạo pool và export để dùng lại
const poolPromise = sql.connect(config)
    .then(pool => {
        console.log("Connected to SQL Server");
        return pool;
    })
    .catch(err => {
        console.log("Database connection failed:", err);
        process.exit(1); // Dừng server nếu không kết nối được
    });

/* ================= ROUTES ================= */

// movies
app.get("/movies", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Movies");
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching movies");
    }
});

// watch - dùng parameterized query để tránh SQL Injection
app.post("/watch", async (req, res) => {
    try {
        const { user_id, movie_id, watch_time, rating } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input("user_id", sql.Int, user_id)
            .input("movie_id", sql.Int, movie_id)
            .input("watch_time", sql.Int, watch_time)
            .input("rating", sql.Float, rating)
            .query(`
                INSERT INTO WatchHistory (UserID, MovieID, WatchTime, Rating)
                VALUES (@user_id, @movie_id, @watch_time, @rating)
            `);

        res.send("Watch history saved");
    } catch (err) {
        console.log(err);
        res.status(500).send("Error saving watch history");
    }
});

// history
app.get("/history", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                wh.HistoryID,
                wh.UserID,
                wh.MovieID,
                u.Name,
                m.Title,
                wh.WatchTime,
                wh.Rating,
                wh.CreatedAt
            FROM WatchHistory wh
            JOIN Users u ON wh.UserID = u.UserID
            JOIN Movies m ON wh.MovieID = m.MovieID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching history");
    }
});
// Đăng ký
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const pool = await poolPromise;

        // Kiểm tra email đã tồn tại chưa
        const check = await pool.request()
            .input("email", sql.NVarChar, email)
            .query("SELECT * FROM Users WHERE Email = @email");

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        await pool.request()
            .input("name", sql.NVarChar, name)
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, password)
            .query("INSERT INTO Users (Name, Email, Password) VALUES (@name, @email, @password)");

        res.json({ message: "Đăng ký thành công" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Đăng nhập
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, password)
            .query("SELECT UserID, Name, Email FROM Users WHERE Email = @email AND Password = @password");

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }

        res.json({ user: result.recordset[0] });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi server" });
    }
});
/* ================= START SERVER ================= */

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});