const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// GET /vouchers - list all vouchers
router.get("/", async (req, res) => {
    let session;
    try {
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT * FROM workspace.netflixdb.vouchers ORDER BY VoucherID DESC
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy voucher:", err);
        res.status(500).json({ message: "Lỗi lấy voucher" });
    } finally {
        if (session) await session.close();
    }
});

// POST /vouchers - create voucher (admin)
router.post("/", async (req, res) => {
    let session;
    try {
        const { code, discount, description, expiry_date } = req.body;
        if (!code || !discount) return res.status(400).json({ message: "Thiếu mã hoặc giảm giá" });
        session = await getSession();
        const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.vouchers (Code, Discount, Description, ExpiryDate, CreatedAt, Active)
            VALUES ('${code}', ${discount}, '${description || ''}', '${expiry_date || createdAt}', '${createdAt}', 1)
        `);
        res.json({ message: "Tạo voucher thành công" });
    } catch (err) {
        console.error("Lỗi tạo voucher:", err);
        res.status(500).json({ message: "Lỗi tạo voucher" });
    } finally {
        if (session) await session.close();
    }
});

// PUT /vouchers/:id - update voucher (admin)
router.put("/:id", async (req, res) => {
    let session;
    try {
        const { id } = req.params;
        const { code, discount, description, expiry_date, active } = req.body;
        session = await getSession();
        await session.executeStatement(`
            UPDATE workspace.netflixdb.vouchers
            SET Code = '${code}', Discount = ${discount}, Description = '${description || ''}',
                ExpiryDate = '${expiry_date}', Active = ${active ? 1 : 0}
            WHERE VoucherID = ${id}
        `);
        res.json({ message: "Cập nhật voucher thành công" });
    } catch (err) {
        console.error("Lỗi cập nhật voucher:", err);
        res.status(500).json({ message: "Lỗi cập nhật voucher" });
    } finally {
        if (session) await session.close();
    }
});

// DELETE /vouchers/:id - delete voucher (admin)
router.delete("/:id", async (req, res) => {
    let session;
    try {
        const { id } = req.params;
        session = await getSession();
        await session.executeStatement(`DELETE FROM workspace.netflixdb.vouchers WHERE VoucherID = ${id}`);
        res.json({ message: "Xóa voucher thành công" });
    } catch (err) {
        console.error("Lỗi xóa voucher:", err);
        res.status(500).json({ message: "Lỗi xóa voucher" });
    } finally {
        if (session) await session.close();
    }
});

// POST /vouchers/redeem - validate a voucher code
router.post("/redeem", async (req, res) => {
    let session;
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: "Thiếu mã voucher" });
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT * FROM workspace.netflixdb.vouchers WHERE Code = '${code}' AND Active = 1
        `);
        const result = await query.fetchAll();
        await query.close();
        if (result.length === 0) {
            return res.status(404).json({ message: "Mã voucher không hợp lệ hoặc đã hết hạn" });
        }
        res.json({ message: "Nhập mã thành công!", voucher: result[0] });
    } catch (err) {
        console.error("Lỗi redeem voucher:", err);
        res.status(500).json({ message: "Lỗi xử lý voucher" });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
