const { Router } = require("express");
const { getSession, safeCount, safeSum } = require("../db");

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

        const [totalUsers, totalMovies, totalTransactions, totalVouchers, totalRevenue] = await Promise.all([
            safeCount(session, 'users'),
            safeCount(session, 'movies'),
            safeCount(session, 'transactions'),
            safeCount(session, 'vouchers'),
            safeSum(session, 'transactions', 'Amount', "Type = 'topup'"),
        ]);

        res.json({ totalUsers, totalMovies, totalTransactions, totalVouchers, totalRevenue });
    } catch (err) {
        console.error("Lỗi lấy stats:", err);
        res.status(500).json({ message: "Lỗi lấy thống kê" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
