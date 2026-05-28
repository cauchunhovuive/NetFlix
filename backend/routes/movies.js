const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// GET /movies - list all movies
router.get("/", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const query = await session.executeStatement("SELECT * FROM workspace.netflixdb.movies ORDER BY MovieID");
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

// POST /movies - create movie (admin)
router.post("/", async (req, res) => {
    let session;
    try {
        const { title, genre, description, year, tmdb_id, price } = req.body;
        if (!title) return res.status(400).json({ message: "Thiếu tên phim" });
        session = await getSession();
        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.movies (Title, Genre, Description, Year, Price, TMDB_ID)
            VALUES ('${title}', '${genre || ''}', '${description || ''}', ${year || 2024}, ${price || 0}, ${tmdb_id || 'NULL'})
        `);
        res.json({ message: "Thêm phim thành công" });
    } catch (err) {
        console.error("Lỗi thêm phim:", err);
        res.status(500).json({ message: "Lỗi thêm phim" });
    } finally {
        if (session) await session.close();
    }
});

// PUT /movies/:id - update movie (admin)
router.put("/:id", async (req, res) => {
    let session;
    try {
        const { id } = req.params;
        const { title, genre, description, year, tmdb_id, price } = req.body;
        session = await getSession();
        await session.executeStatement(`
            UPDATE workspace.netflixdb.movies
            SET Title = '${title}', Genre = '${genre || ''}', Description = '${description || ''}',
                Year = ${year || 2024}, Price = ${price || 0}, TMDB_ID = ${tmdb_id || 'NULL'}
            WHERE MovieID = ${id}
        `);
        res.json({ message: "Cập nhật phim thành công" });
    } catch (err) {
        console.error("Lỗi cập nhật phim:", err);
        res.status(500).json({ message: "Lỗi cập nhật phim" });
    } finally {
        if (session) await session.close();
    }
});

// DELETE /movies/:id - delete movie (admin)
router.delete("/:id", async (req, res) => {
    let session;
    try {
        const { id } = req.params;
        session = await getSession();
        await session.executeStatement(`DELETE FROM workspace.netflixdb.watchhistory WHERE MovieID = ${id}`);
        await session.executeStatement(`DELETE FROM workspace.netflixdb.movies WHERE MovieID = ${id}`);
        res.json({ message: "Xóa phim thành công" });
    } catch (err) {
        console.error("Lỗi xóa phim:", err);
        res.status(500).json({ message: "Lỗi xóa phim" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
