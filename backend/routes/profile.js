const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// PUT /user/:id - update profile
router.put("/user/:id", async (req, res) => {
    let session;
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        session = await getSession();
        await session.executeStatement(`
            UPDATE workspace.netflixdb.users
            SET Name = '${name}', Email = '${email}'
            WHERE UserID = ${id}
        `);
        res.json({ message: "Cập nhật thành công" });
    } catch (err) {
        console.error("Lỗi cập nhật user:", err);
        res.status(500).json({ message: "Lỗi cập nhật thông tin" });
    } finally {
        if (session) await session.close();
    }
});

// PUT /user/:id/password - change password
router.put("/user/:id/password", async (req, res) => {
    let session;
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        session = await getSession();
        const check = await session.executeStatement(`
            SELECT * FROM workspace.netflixdb.users WHERE UserID = ${id} AND Password = '${currentPassword}'
        `);
        const rows = await check.fetchAll();
        await check.close();
        if (rows.length === 0) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
        }
        await session.executeStatement(`
            UPDATE workspace.netflixdb.users SET Password = '${newPassword}' WHERE UserID = ${id}
        `);
        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        console.error("Lỗi đổi mật khẩu:", err);
        res.status(500).json({ message: "Lỗi đổi mật khẩu" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
