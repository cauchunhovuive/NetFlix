const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

router.post("/login", async (req, res) => {
    let session;
    try {
        const { email, password } = req.body;
        session = await getSession();
        const sql = `
            SELECT UserID, Name, Email, COALESCE(Role, 'User') as Role
            FROM workspace.netflixdb.users 
            WHERE Email = '${email}' AND Password = '${password}'
        `;
        const query = await session.executeStatement(sql);
        const result = await query.fetchAll();
        await query.close();
        if (result.length === 0) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        const user = result[0];
        // Get wallet balance
        let balance = 0;
        try {
            const wQuery = await session.executeStatement(`
                SELECT Balance FROM workspace.netflixdb.wallet WHERE UserID = ${user.UserID}
            `);
            const wResult = await wQuery.fetchAll();
            await wQuery.close();
            if (wResult.length > 0) {
                balance = wResult[0].Balance || 0;
            }
        } catch(e) {
            // Wallet table might not exist yet
        }
        user.WalletBalance = parseFloat(balance) || 0;
        res.json({ user });
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ message: "Lỗi server khi đăng nhập" });
    } finally {
        if (session) await session.close();
    }
});

router.post("/register", async (req, res) => {
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

module.exports = router;
