require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const moviesRoutes = require("./routes/movies");
const watchRoutes = require("./routes/watch");
const walletRoutes = require("./routes/wallet");
const voucherRoutes = require("./routes/vouchers");
const supportRoutes = require("./routes/support");
const adminRoutes = require("./routes/admin");
const profileRoutes = require("./routes/profile");
const favoriteRoutes = require("./routes/favorites");
const reviewRoutes = require("./routes/reviews");
const omdbRoutes = require("./routes/omdb");

const app = express();
app.use(cors());
app.use(express.json());

// ================= ROUTES =================

app.use("/", authRoutes);          // POST /login, POST /register
app.use("/movies", moviesRoutes);  // GET/POST /movies, PUT/DELETE /movies/:id
app.use("/", watchRoutes);         // POST /watch, GET /history
app.use("/wallet", walletRoutes);  // GET/POST /wallet/...
app.use("/vouchers", voucherRoutes); // GET/POST/PUT/DELETE /vouchers/...
app.use("/support", supportRoutes);  // GET /support/conversations, GET /support/messages/:userId, POST /support/send
app.use("/", adminRoutes);         // GET /admin/users, GET /admin/stats
app.use("/", profileRoutes);       // PUT /user/:id, PUT /user/:id/password
app.use("/favorites", favoriteRoutes); // GET/POST /favorites/...
app.use("/reviews", reviewRoutes);   // GET/POST/DELETE /reviews/...
app.use("/omdb", omdbRoutes);       // GET /omdb?t=...  (proxy OMDb API)

// ================= START =================

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server dang chay tai http://localhost:${PORT}`);
});
