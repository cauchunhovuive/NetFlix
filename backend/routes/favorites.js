const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// Ensure table exists
async function ensureTable(session) {
    try {
        await session.executeStatement(`
            CREATE TABLE IF NOT EXISTS workspace.netflixdb.favorites (
                FavoriteID BIGINT GENERATED ALWAYS AS IDENTITY,
                UserID INT,
                MovieID INT,
                CreatedAt STRING
            ) USING DELTA
        `);
    } catch (e) {
        // Table may already exist — may need DROP TABLE first if schema changed
    }
}

// GET /favorites/:userId - get user's favorite movie IDs
router.get("/:userId", async (req, res) => {
    let session;
    try {
        const { userId } = req.params;
        session = await getSession();
        await ensureTable(session);
        const query = await session.executeStatement(`
            SELECT MovieID FROM workspace.netflixdb.favorites WHERE UserID = ${userId}
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result.map(r => Number(r.MovieID)));
    } catch (err) {
        console.error("Lỗi lấy favorites:", err);
        res.status(500).json({ message: "Lỗi lấy danh sách yêu thích" });
    } finally {
        if (session) await session.close();
    }
});

// POST /favorites/toggle - toggle favorite
router.post("/toggle", async (req, res) => {
    let session;
    try {
        const { user_id, movie_id } = req.body;
        if (!user_id || !movie_id) return res.status(400).json({ message: "Thiếu thông tin" });
        session = await getSession();
        await ensureTable(session);

        // Check if already favorited
        const check = await session.executeStatement(`
            SELECT * FROM workspace.netflixdb.favorites WHERE UserID = ${user_id} AND MovieID = ${movie_id}
        `);
        const rows = await check.fetchAll();
        await check.close();

        if (rows.length > 0) {
            // Remove
            await session.executeStatement(`
                DELETE FROM workspace.netflixdb.favorites WHERE UserID = ${user_id} AND MovieID = ${movie_id}
            `);
            res.json({ favorited: false, message: "Đã bỏ yêu thích" });
        } else {
            // Add
            const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
            await session.executeStatement(`
                INSERT INTO workspace.netflixdb.favorites (UserID, MovieID, CreatedAt)
                VALUES (${user_id}, ${movie_id}, '${createdAt}')
            `);
            res.json({ favorited: true, message: "Đã thêm vào yêu thích" });
        }
    } catch (err) {
        console.error("Lỗi toggle favorite:", err);
        res.status(500).json({ message: "Lỗi cập nhật yêu thích" });
    } finally {
        if (session) await session.close();
    }
});

// GET /favorites/:userId/with-details - get favorites with movie details
router.get("/:userId/with-details", async (req, res) => {
    let session;
    try {
        const { userId } = req.params;
        session = await getSession();
        await ensureTable(session);
        const query = await session.executeStatement(`
            SELECT f.FavoriteID, f.MovieID, f.CreatedAt,
                   m.Title, m.Genre, m.Description, m.Year, m.Price, m.TMDB_ID
            FROM workspace.netflixdb.favorites f
            JOIN workspace.netflixdb.movies m ON f.MovieID = m.MovieID
            WHERE f.UserID = ${userId}
            ORDER BY f.CreatedAt DESC
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy favorites with details:", err);
        res.status(500).json({ message: "Lỗi lấy danh sách yêu thích" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
