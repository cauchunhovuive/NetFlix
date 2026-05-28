const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// POST /watch - record watch history
router.post("/watch", async (req, res) => {
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

// GET /history - view all watch history
router.get("/history", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const sql = `
            SELECT 
                wh.HistoryID, wh.UserID, wh.MovieID, u.Name, m.Title, wh.WatchTime, wh.Rating, wh.CreatedAt
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

module.exports = router;
