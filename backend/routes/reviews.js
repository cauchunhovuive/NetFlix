const express = require("express");
const router = express.Router();
const { getSession } = require("../db");

// Auto-create table (Databricks Delta syntax)
async function ensureTable(session) {
    try {
        await session.executeStatement(`
            CREATE TABLE IF NOT EXISTS workspace.netflixdb.reviews (
                ReviewID BIGINT GENERATED ALWAYS AS IDENTITY,
                MovieID INT,
                UserID INT,
                Rating INT,
                Comment STRING,
                CreatedAt TIMESTAMP
            ) USING DELTA
        `);
    } catch (e) {
        // Table may already exist — may need DROP TABLE first if schema changed
    }
}

// GET /reviews/:movieId - lay review cua phim
router.get("/:movieId", async (req, res) => {
    let session;
    try {
        const { movieId } = req.params;
        session = await getSession();
        await ensureTable(session);
        const query = await session.executeStatement(`
            SELECT r.*, u.Name as UserName
            FROM workspace.netflixdb.reviews r
            JOIN workspace.netflixdb.users u ON r.UserID = u.UserID
            WHERE r.MovieID = ${movieId}
            ORDER BY r.CreatedAt DESC
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lay review:", err);
        res.status(500).json({ message: "Lỗi lay danh sach danh gia" });
    } finally {
        if (session) await session.close();
    }
});

// POST /reviews - them review
router.post("/", async (req, res) => {
    let session;
    try {
        const { movie_id, user_id, rating, comment } = req.body;
        if (!movie_id || !user_id || !rating) {
            return res.status(400).json({ message: "Thieu thong tin" });
        }
        session = await getSession();
        await ensureTable(session);
        const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const safeComment = (comment || "").replace(/'/g, "''");
        // Check if already reviewed
        const check = await session.executeStatement(`
            SELECT ReviewID FROM workspace.netflixdb.reviews WHERE MovieID = ${movie_id} AND UserID = ${user_id}
        `);
        const existing = await check.fetchAll();
        await check.close();
        if (existing.length > 0) {
            // Update existing
            await session.executeStatement(`
                UPDATE workspace.netflixdb.reviews
                SET Rating = ${rating}, Comment = '${safeComment}', CreatedAt = '${createdAt}'
                WHERE MovieID = ${movie_id} AND UserID = ${user_id}
            `);
            res.json({ message: "Da cap nhat danh gia" });
        } else {
            await session.executeStatement(`
                INSERT INTO workspace.netflixdb.reviews (MovieID, UserID, Rating, Comment, CreatedAt)
                VALUES (${movie_id}, ${user_id}, ${rating}, '${safeComment}', '${createdAt}')
            `);
            res.json({ message: "Da them danh gia" });
        }
    } catch (err) {
        console.error("Loi them review:", err);
        res.status(500).json({ message: "Loi them danh gia" });
    } finally {
        if (session) await session.close();
    }
});

// DELETE /reviews/:id
router.delete("/:id", async (req, res) => {
    let session;
    try {
        const { id } = req.params;
        session = await getSession();
        await ensureTable(session);
        await session.executeStatement(`DELETE FROM workspace.netflixdb.reviews WHERE ReviewID = ${id}`);
        res.json({ message: "Da xoa danh gia" });
    } catch (err) {
        console.error("Loi xoa review:", err);
        res.status(500).json({ message: "Loi xoa danh gia" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
