const { Router } = require("express");
const { getSession } = require("../db");

const router = Router();

// GET /wallet/:userId - get wallet balance
router.get("/:userId", async (req, res) => {
    let session;
    try {
        const { userId } = req.params;
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT COALESCE(Balance, 0) as Balance
            FROM workspace.netflixdb.wallet
            WHERE UserID = ${userId}
        `);
        const result = await query.fetchAll();
        await query.close();
        if (result.length === 0) {
            await session.executeStatement(`INSERT INTO workspace.netflixdb.wallet (UserID, Balance) VALUES (${userId}, 0)`);
            return res.json({ balance: 0 });
        }
        res.json({ balance: result[0].Balance || 0 });
    } catch (err) {
        console.error("Lỗi lấy ví:", err);
        res.status(500).json({ message: "Lỗi lấy thông tin ví" });
    } finally {
        if (session) await session.close();
    }
});

// POST /wallet/topup - add money to wallet
router.post("/topup", async (req, res) => {
    let session;
    try {
        const { user_id, amount, voucher_code } = req.body;
        if (!user_id || !amount || amount <= 0) {
            return res.status(400).json({ message: "Số tiền không hợp lệ" });
        }
        session = await getSession();
        let finalAmount = amount;
        let voucherId = null;
        let voucherDesc = "";

        if (voucher_code) {
            const vQuery = await session.executeStatement(`
                SELECT * FROM workspace.netflixdb.vouchers 
                WHERE Code = '${voucher_code}' AND Active = 1
            `);
            const vResult = await vQuery.fetchAll();
            await vQuery.close();
            if (vResult.length > 0) {
                const voucher = vResult[0];
                if (voucher.ExpiryDate) {
                    const expiryDate = new Date(voucher.ExpiryDate);
                    const today = new Date();
                    if (expiryDate < today) {
                        return res.status(400).json({ message: "Mã voucher đã hết hạn" });
                    }
                }
                voucherId = voucher.VoucherID;
                const discount = parseFloat(voucher.Discount) || 0;
                const discountAmount = (finalAmount * discount) / 100;
                finalAmount = finalAmount + discountAmount;
                voucherDesc = ` (KM: -${discount}% từ ${voucher.Code})`;
            }
        }

        const checkWallet = await session.executeStatement(`
            SELECT Balance FROM workspace.netflixdb.wallet WHERE UserID = ${user_id}
        `);
        const walletRows = await checkWallet.fetchAll();
        await checkWallet.close();

        if (walletRows.length === 0) {
            await session.executeStatement(`INSERT INTO workspace.netflixdb.wallet (UserID, Balance) VALUES (${user_id}, 0)`);
        }

        await session.executeStatement(`
            UPDATE workspace.netflixdb.wallet 
            SET Balance = COALESCE(Balance, 0) + ${finalAmount}
            WHERE UserID = ${user_id}
        `);

        const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const description = `Nạp $${amount}${voucherDesc}`;
        const voucherIdStr = voucherId ? voucherId : 'NULL';
        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.transactions (UserID, Amount, Type, Description, VoucherID, CreatedAt)
            VALUES (${user_id}, ${finalAmount}, 'topup', '${description}', ${voucherIdStr}, '${createdAt}')
        `);

        const balQuery = await session.executeStatement(`
            SELECT Balance FROM workspace.netflixdb.wallet WHERE UserID = ${user_id}
        `);
        const balResult = await balQuery.fetchAll();
        await balQuery.close();

        res.json({
            message: voucherId ? `✓ Nạp $${amount} thành công + KM ${voucherDesc.trim()}!` : `✓ Nạp $${amount} thành công!`,
            balance: balResult[0]?.Balance || finalAmount
        });
    } catch (err) {
        console.error("Lỗi nạp tiền:", err);
        res.status(500).json({ message: "Lỗi nạp tiền", detail: err.message });
    } finally {
        if (session) await session.close();
    }
});

// GET /wallet/:userId/transactions
router.get("/:userId/transactions", async (req, res) => {
    let session;
    try {
        const { userId } = req.params;
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT * FROM workspace.netflixdb.transactions 
            WHERE UserID = ${userId}
            ORDER BY CreatedAt DESC
            LIMIT 50
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy giao dịch:", err);
        res.status(500).json({ message: "Lỗi lấy lịch sử giao dịch" });
    } finally {
        if (session) await session.close();
    }
});

// GET /wallet/:userId/purchases
router.get("/:userId/purchases", async (req, res) => {
    let session;
    try {
        const { userId } = req.params;
        session = await getSession();
        const query = await session.executeStatement(`
            SELECT up.*, m.Title, m.Genre, m.Description
            FROM workspace.netflixdb.userpurchases up
            JOIN workspace.netflixdb.movies m ON up.MovieID = m.MovieID
            WHERE up.UserID = ${userId}
            ORDER BY up.CreatedAt DESC
        `);
        const result = await query.fetchAll();
        await query.close();
        res.json(result);
    } catch (err) {
        console.error("Lỗi lấy phim đã mua:", err);
        res.status(500).json({ message: "Lỗi lấy phim đã mua" });
    } finally {
        if (session) await session.close();
    }
});

// POST /wallet/purchase - buy a movie
router.post("/purchase", async (req, res) => {
    let session;
    try {
        const { user_id, movie_id } = req.body;
        if (!user_id || !movie_id) {
            return res.status(400).json({ message: "Thiếu thông tin" });
        }
        session = await getSession();

        const movieQuery = await session.executeStatement(`
            SELECT Title, Price FROM workspace.netflixdb.movies WHERE MovieID = ${movie_id}
        `);
        const movieResult = await movieQuery.fetchAll();
        await movieQuery.close();

        if (movieResult.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy phim" });
        }

        const movie = movieResult[0];
        const price = parseFloat(movie.Price) || 0;

        if (price <= 0) {
            return res.status(400).json({ message: "Phim này miễn phí, không cần mua" });
        }

        const checkQuery = await session.executeStatement(`
            SELECT * FROM workspace.netflixdb.userpurchases 
            WHERE UserID = ${user_id} AND MovieID = ${movie_id}
        `);
        const checkResult = await checkQuery.fetchAll();
        await checkQuery.close();

        if (checkResult.length > 0) {
            return res.status(400).json({ message: "Bạn đã mua phim này rồi" });
        }

        const walletQuery = await session.executeStatement(`
            SELECT Balance FROM workspace.netflixdb.wallet WHERE UserID = ${user_id}
        `);
        const walletResult = await walletQuery.fetchAll();
        await walletQuery.close();

        const balance = parseFloat(walletResult[0]?.Balance) || 0;

        if (balance < price) {
            return res.status(400).json({
                message: `Số dư không đủ. Cần $${price}, bạn có $${balance.toFixed(2)}`
            });
        }

        await session.executeStatement(`
            UPDATE workspace.netflixdb.wallet SET Balance = Balance - ${price}
            WHERE UserID = ${user_id}
        `);

        const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.userpurchases (UserID, MovieID, Price, CreatedAt)
            VALUES (${user_id}, ${movie_id}, ${price}, '${createdAt}')
        `);

        await session.executeStatement(`
            INSERT INTO workspace.netflixdb.transactions (UserID, Amount, Type, Description, CreatedAt)
            VALUES (${user_id}, -${price}, 'purchase', 'Phim: ${movie.Title}', '${createdAt}')
        `);

        const newBalQuery = await session.executeStatement(`
            SELECT Balance FROM workspace.netflixdb.wallet WHERE UserID = ${user_id}
        `);
        const newBalResult = await newBalQuery.fetchAll();
        await newBalQuery.close();

        res.json({
            message: `✓ Đã mua phim "${movie.Title}" thành công!`,
            balance: newBalResult[0]?.Balance || 0
        });
    } catch (err) {
        console.error("Lỗi mua phim:", err);
        res.status(500).json({ message: "Lỗi mua phim", detail: err.message });
    } finally {
        if (session) await session.close();
    }
});

module.exports = router;
