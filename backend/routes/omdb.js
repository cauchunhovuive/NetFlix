const express = require("express");
const router = express.Router();
const { vietsubMovie } = require("../utils/vietsub");

const OMDB_KEY = process.env.OMDB_KEY;
const OMDB_BASE = "https://www.omdbapi.com";

// GET /omdb?t=MovieTitle - proxy request to OMDb, giữ key ở server
router.get("/", async (req, res) => {
    try {
        const { t } = req.query;
        if (!t) {
            return res.status(400).json({ message: "Thieu tham so t (title)" });
        }

        const url = `${OMDB_BASE}/?t=${encodeURIComponent(t)}&apikey=${OMDB_KEY}`;
        const omdbRes = await fetch(url);
        const data = await omdbRes.json();

        if (data.Response === "False") {
            return res.status(404).json({ message: "Khong tim thay phim tren OMDb" });
        }

        // VietSub — dịch thông tin sang tiếng Việt
        const vi = await vietsubMovie(data);

        res.json({ ...data, ...vi });
    } catch (err) {
        console.error("Loi goi OMDb:", err);
        res.status(500).json({ message: "Loi ket noi OMDb" });
    }
});

module.exports = router;
