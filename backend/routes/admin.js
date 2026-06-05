const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// GET /admin/users - list all users (admin)
router.get("/admin/users", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT UserID, Name, Email, COALESCE(Role, 'User') as Role
            FROM workspace.netflixdb.users ORDER BY UserID
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy user:", err);
        res.status(500).json({ message: "Lỗi lấy danh sách user" });
    } finally {
        if (session) await session.close();
    }
});

// GET /admin/transactions - list all transactions with user info (admin)
router.get("/admin/transactions", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT t.*, u.Name, u.Email
            FROM workspace.netflixdb.transactions t
            JOIN workspace.netflixdb.users u ON t.UserID = u.UserID
            ORDER BY t.CreatedAt DESC
            LIMIT 200
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy giao dịch:", err);
        res.status(500).json({ message: "Lỗi lấy danh sách giao dịch" });
    } finally {
        if (session) await session.close();
    }
});

// GET /admin/stats - dashboard statistics (admin)
router.get("/admin/stats", async (req, res) => {
    let session;
    try {
        session = await getSession();

        // ═══ 1. Tổng quan (1 query duy nhất) ═══
        const overviewSql = `
            SELECT
                (SELECT COUNT(*) FROM workspace.netflixdb.users) as totalUsers,
                (SELECT COUNT(*) FROM workspace.netflixdb.movies) as totalMovies,
                (SELECT COUNT(*) FROM workspace.netflixdb.transactions) as totalTransactions,
                (SELECT COUNT(*) FROM workspace.netflixdb.vouchers) as totalVouchers,
                (SELECT COALESCE(SUM(ABS(Amount)), 0) FROM workspace.netflixdb.transactions WHERE Type = 'purchase') as totalRevenue
        `;

        const overviewQuery = await session.executeStatement(overviewSql);
        const overviewResult = await overviewQuery.fetchAll();
        await overviewQuery.close();

        if (overviewResult.length === 0) {
            return res.json({
                totalUsers: 0, totalMovies: 0, totalTransactions: 0, totalVouchers: 0, totalRevenue: 0,
                dailyRevenue: [], genreDistribution: [],
            });
        }

        const row = overviewResult[0];

        // ═══ 2. Doanh thu 30 ngày gần nhất ═══
        let dailyRevenue = [];
        try {
            const drQuery = await session.executeStatement(`
                SELECT CAST(CreatedAt AS DATE) as date,
                       COALESCE(SUM(ABS(Amount)), 0) as revenue
                FROM workspace.netflixdb.transactions
                WHERE Type = 'purchase'
                  AND CreatedAt >= DATEADD(DAY, -30, CURRENT_DATE)
                GROUP BY CAST(CreatedAt AS DATE)
                ORDER BY date
            `);
            const drRows = await drQuery.fetchAll();
            await drQuery.close();
            dailyRevenue = drRows.map(r => ({
                date: r.DATE || r.date || '',
                revenue: parseFloat(r.REVENUE || r.revenue || 0),
            }));
        } catch (e) {
            console.warn('Không thể lấy daily revenue:', e.message);
        }

        // ═══ 3. Phân bố thể loại phim ═══
        let genreDistribution = [];
        try {
            const gdQuery = await session.executeStatement(`
                SELECT TRIM(value) as genre, COUNT(*) as count
                FROM workspace.netflixdb.movies
                LATERAL VIEW EXPLODE(SPLIT(Genre, ',')) as value
                WHERE Genre IS NOT NULL AND Genre != ''
                GROUP BY TRIM(value)
                ORDER BY count DESC
            `);
            const gdRows = await gdQuery.fetchAll();
            await gdQuery.close();
            genreDistribution = gdRows.map(r => ({
                genre: r.GENRE || r.genre || 'Unknown',
                count: Number(r.COUNT || r.count || 0),
            }));
        } catch (e) {
            console.warn('Không thể lấy genre distribution:', e.message);
        }

        // ═══ 4. Top người dùng nạp nhiều nhất ═══
        let topTopUpUsers = [];
        try {
            const tuQuery = await session.executeStatement(`
                SELECT u.Name,
                       COUNT(*) as topups,
                       COALESCE(SUM(ABS(t.Amount)), 0) as totalAmount
                FROM workspace.netflixdb.transactions t
                JOIN workspace.netflixdb.users u ON t.UserID = u.UserID
                WHERE t.Type = 'topup'
                GROUP BY u.Name
                ORDER BY totalAmount DESC
                LIMIT 10
            `);
            const tuRows = await tuQuery.fetchAll();
            await tuQuery.close();
            topTopUpUsers = tuRows.map(r => ({
                name: r.NAME || r.name || 'Unknown',
                topups: Number(r.TOPUPS || r.topups || 0),
                totalAmount: parseFloat(r.TOTALAMOUNT || r.totalamount || r.totalAmount || 0),
            }));
        } catch (e) {
            console.warn('Không thể lấy top topup users:', e.message);
        }

        res.json({
            totalUsers: Number(row.TOTALUSERS ?? row.totalUsers ?? row.totalusers ?? 0),
            totalMovies: Number(row.TOTALMOVIES ?? row.totalMovies ?? row.totalmovies ?? 0),
            totalTransactions: Number(row.TOTALTRANSACTIONS ?? row.totalTransactions ?? row.totaltransactions ?? 0),
            totalVouchers: Number(row.TOTALVOUCHERS ?? row.totalVouchers ?? row.totalvouchers ?? 0),
            totalRevenue: parseFloat(row.TOTALREVENUE ?? row.totalRevenue ?? row.totalrevenue ?? 0) || 0,
            dailyRevenue,
            genreDistribution,
            topTopUpUsers,
        });
    } catch (err) {
        console.error("Lỗi lấy stats:", err);
        res.status(500).json({ message: "Lỗi lấy thống kê" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
