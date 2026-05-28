const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// GET /support/conversations - list all conversations (admin)
router.get("/conversations", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT sm.UserID, u.Name, u.Email, COUNT(sm.MessageID) as msg_count,
                   MAX(sm.CreatedAt) as last_time
            FROM workspace.netflixdb.support_messages sm
            JOIN workspace.netflixdb.users u ON sm.UserID = u.UserID
            GROUP BY sm.UserID, u.Name, u.Email
            ORDER BY last_time DESC
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy conversations:", err);
        res.status(500).json({ message: "Lỗi lấy danh sách hội thoại" });
    } finally {
        if (session) await session.close();
    }
});

// GET /support/messages/:userId - get messages for a user
router.get("/messages/:userId", async (req, res) => {
    let session;
    try {
        const { userId } = req.params;
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT * FROM workspace.netflixdb.support_messages
            WHERE UserID = ${userId}
            ORDER BY CreatedAt ASC
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy tin nhắn:", err);
        res.status(500).json({ message: "Lỗi lấy tin nhắn" });
    } finally {
        if (session) await session.close();
    }
});

// POST /support/send - send a support message
router.post("/send", async (req, res) => {
    let session;
    try {
        const { user_id, message, sender_type } = req.body;
        if (!user_id || !message || !message.trim()) {
            return res.status(400).json({ message: "Thiếu thông tin tin nhắn" });
        }
        session = await getSession();
        const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const sanitizedMsg = message.replace(/'/g, "''");

        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.support_messages (UserID, SenderType, Message, CreatedAt)
            VALUES (${user_id}, '${sender_type || 'user'}', '${sanitizedMsg}', '${createdAt}')
        `);

        // Auto-reply when user sends a message
        if ((sender_type || 'user') === 'user') {
            const replyMsg = "Cảm ơn bạn đã liên hệ với bộ phận hỗ trợ. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất. Vui lòng chờ admin xử lý.";
            const replyTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
            await session.executeStatement(`
                INSERT INTO workspace.netflixdb.support_messages (UserID, SenderType, Message, CreatedAt)
                VALUES (${user_id}, 'admin', '${replyMsg}', '${replyTime}')
            `);
        }

        res.json({ message: "✓ Đã gửi tin nhắn", createdAt });
    } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
        res.status(500).json({ message: "Lỗi gửi tin nhắn" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
