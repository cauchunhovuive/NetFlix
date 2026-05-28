# 🎬 Netflix Clone — Ứng dụng Xem Phim

Ứng dụng web quản lý và theo dõi phim, xây dựng với kiến trúc **Client-Server**, tích hợp **OMDb API**, **Databricks SQL**, hỗ trợ **ví điện tử**, **voucher**, **admin dashboard** và **chat hỗ trợ**.

> 📦 Project môn Điện Toán Đám Mây

---

## 🧱 Kiến trúc hệ thống

```
┌─────────────────────────┐       ┌──────────────────────────┐       ┌──────────────────────┐
│    React Frontend       │ ───►  │    Express Backend        │ ───►  │  Databricks SQL      │
│    localhost:5173       │       │    localhost:3000          │       │  (Cloud Data Lake)   │
└─────────────────────────┘       └──────────────────────────┘       └──────────────────────┘
         │                                    │
         │                                    ▼
         │                          ┌──────────────────────────┐
         └─────────────────────────►│     OMDb API              │
                                    │  (Poster, IMDb rating)    │
                                    └──────────────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React 19, Vite 8, CSS |
| Backend | Node.js, Express 5 |
| Database | Databricks SQL (Databricks Community Edition) |
| External API | OMDb API |
| Cloud / Analytics | Databricks, Apache Spark, Delta Lake |

---

## 📁 Cấu trúc thư mục — Chức năng từng file (tiếng Việt)

```
NetFlix/
├── backend/                           # 🖥️ API Server (Express, modular routes)
│   ├── server.js                      # Điểm vào backend — import & mount tất cả routes
│   ├── db.js                          # Kết nối Databricks SQL + helper (safeCount, safeSum)
│   ├── routes/
│   │   ├── auth.js                    # 🔐 Đăng nhập (POST /login) & Đăng ký (POST /register)
│   │   ├── movies.js                  # 🎬 CRUD phim — GET danh sách, POST thêm, PUT sửa, DELETE xóa
│   │   ├── watch.js                   # 📝 Lưu lịch sử xem (POST /watch) & Lấy lịch sử (GET /history)
│   │   ├── wallet.js                  # 💰 Ví điện tử — số dư, nạp tiền, giao dịch, mua phim
│   │   ├── vouchers.js                # 🏷️ Quản lý voucher — CRUD + redeem mã giảm giá
│   │   ├── support.js                 # 💬 Chat hỗ trợ — lấy hội thoại, gửi tin nhắn
│   │   ├── admin.js                   # ⚙️ Admin — thống kê & danh sách user
│   │   ├── profile.js                 # 👤 Cập nhật hồ sơ & đổi mật khẩu
│   │   ├── favorites.js               # ❤️ Quản lý danh sách yêu thích
│   │   ├── reviews.js                 # ⭐ Đánh giá & bình luận phim
│   │   └── omdb.js                    # 🌐 Proxy OMDb API (tra cứu thông tin phim)
│   ├── export.js                      # 📤 Export dữ liệu ra CSV để upload lên Databricks
│   ├── seed-free.js                   # 🌱 Script seed dữ liệu mẫu (miễn phí)
│   ├── utils/
│   │   └── vietsub.js                 # 🔤 Map thể loại phim từ Anh → Việt
│   └── .env                           # 🔑 Biến môi trường (DATABRICKS_TOKEN, HOST, PATH, OMDB_KEY)
│
├── frontend/                          # 🎨 React App (Vite)
│   └── src/
│       ├── main.jsx                   # Điểm vào React DOM
│       ├── App.jsx                    # 🧠 Điều phối chính — gọi hooks, quản lý state, render tabs
│       ├── App.css                    # 🎭 Toàn bộ CSS toàn cục (variables, animations, components)
│       ├── api.js                     # 📡 Hằng số API_URL + helper lấy ID/Title từ object
│       │
│       ├── hooks/                     # 🪝 Custom Hooks — mỗi hook quản lý 1 domain riêng
│       │   ├── useAuth.js             # 🔐 State auth: login, register, logout, auth messages
│       │   ├── useMovies.js           # 🎬 State phim: danh sách, lịch sử, modal, OMDb, player
│       │   ├── useWallet.js           # 💰 State ví: số dư, nạp tiền, giao dịch, mua phim
│       │   ├── useVouchers.js         # 🏷️ State voucher: danh sách, redeem mã
│       │   ├── useProfile.js          # 👤 State hồ sơ: sửa tên/email, đổi mật khẩu
│       │   ├── useChat.js             # 💬 State chat: tin nhắn, gửi/nhận support
│       │   ├── useAdmin.js            # ⚙️ State admin: thống kê, users, CRUD, hội thoại support
│       │   ├── useFavorites.js        # ❤️ State yêu thích: thêm/bỏ, danh sách favorite IDs
│       │   ├── useReviews.js          # ⭐ State đánh giá: gửi & lấy review cho phim
│       │   └── useTheme.js            # 🎨 State theme: danh sách themes, đổi theme
│       │
│       ├── components/                # 🧩 Component dùng chung (thuần UI, nhận props)
│       │   ├── AuthParticles.jsx      # ✨ Hiệu ứng hạt nền động khi đăng nhập/đăng ký
│       │   ├── HeroBanner.jsx         # 🖼️ Banner phim nổi bật với dots điều hướng
│       │   ├── PlayerOverlay.jsx      # 📺 Overlay phát video (toàn màn hình)
│       │   ├── PosterImage.jsx        # 🖼️ Poster phim + fallback gradient + chữ cái
│       │   ├── RippleButton.jsx       # 🔘 Nút bấm hiệu ứng gợn sóng khi click
│       │   ├── StarRating.jsx         # ⭐ Hiển thị rating bằng sao
│       │   ├── Toast.jsx              # 🔔 Thông báo toast (auto-dismiss, click để tắt)
│       │   ├── ToastContainer.jsx     # 📦 Container chứa danh sách toast (góc phải trên)
│       │   └── TrailerPlayer.jsx      # 🎬 YouTube trailer embed (iframe search playlist)
│       │
│       ├── pages/                     # 📄 Các tab trang (được App.jsx render theo tab)
│       │   ├── AuthPage.jsx           # 🔐 Trang đăng nhập / đăng ký (form slider, particles)
│       │   ├── MoviesTab.jsx          # 🎬 Danh sách phim + genre filter + search + hero
│       │   ├── HistoryTab.jsx         # 📋 Lịch sử xem + thống kê (tổng giờ, rating TB)
│       │   ├── WalletTab.jsx          # 💰 Ví điện tử — số dư, giao dịch, phim đã mua
│       │   ├── ProfileTab.jsx         # 👤 Hồ sơ cá nhân + thống kê + top phim đã xem
│       │   ├── VouchersTab.jsx        # 🏷️ Danh sách voucher + ô nhập mã redeem
│       │   └── AdminTab.jsx           # ⚙️ Dashboard + quản lý users/movies/vouchers/support
│       │
│       ├── modals/                    # 🪟 Modal overlay (lớp phủ trung tâm)
│       │   ├── MovieModal.jsx         # 🎞️ Chi tiết phim: poster, OMDb info, watch form, mua, reviews, trailer
│       │   └── TopUpModal.jsx         # 💳 Nạp tiền vào ví (chọn số tiền, nhập voucher)
│       │
│       ├── chat/                      # 💬 Widget chat hỗ trợ
│       │   └── SupportChat.jsx        # 🗨️ Floating chat — FAB + hộp chat real-time
│       │
│       └── utils/
│           └── vietsub.js             # 🔤 Mảng map thể loại: "Action" → "Hành động", "Sci-Fi" → "Khoa học viễn tưởng"
│
└── README.md                          # 📖 Tài liệu hướng dẫn project (chính là file này)
```

---

## ⚙️ Hướng dẫn cài đặt & chạy

### Yêu cầu
- Node.js >= 18
- npm

---

### 1. Clone repository

```bash
git clone https://github.com/cauchunhovuive/NetFlix.git
cd NetFlix
```

---

### 2. Cấu hình Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:

```env
DATABRICKS_TOKEN=dapid5f2283a08db03c876a85091ed6324d5
DATABRICKS_HOST=dbc-5d5ac2ba-09bc.cloud.databricks.com
DATABRICKS_PATH=/sql/1.0/warehouses/a610c57606d351ac
OMDB_KEY=5a5767ab
```

> **Lưu ý:** Các thông số Databricks host, path, token đều được cấu hình qua `.env`, không cần sửa code.

Chạy server:

```bash
node server.js
# Server chạy tại http://localhost:3000
```

---

### 2.5. Seed thêm phim mẫu (tùy chọn)

Mặc định database có sẵn 20 phim. Để thêm 54 phim nổi tiếng (Action, Drama, Horror, Animation...):

**Cách 1 — Qua Databricks SQL Editor (khuyên dùng):**
```bash
# Mở file backend/seed-sql.sql, copy nội dung
# Vào Databricks Community Edition → SQL Editor
# Paste & Run
```

**Cách 2 — Upload CSV lên Databricks:**
```bash
# Upload backend/seed-new-movies.csv lên Volume
# Sau đó chạy:
# COPY INTO workspace.netflixdb.movies
# FROM '/Volumes/main/default/data_netflix/seed-new-movies.csv'
# FILEFORMAT = CSV
```

> ℹ️ `seed-movies.js` (Node.js) không hoạt động với Databricks Community Edition do hạn chế DML.

---

### 3. Cài đặt & chạy Frontend

```bash
cd frontend
npm install
npm run dev
# App chạy tại http://localhost:5173
```

---

## 📡 API Endpoints

### 🔐 Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/login` | Đăng nhập (trả về user + Role + WalletBalance) |
| POST | `/register` | Đăng ký tài khoản mới |

### 🎬 Movies

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/movies` | Lấy danh sách phim (sắp xếp theo MovieID) |
| POST | `/movies` | Thêm phim mới (admin) |
| PUT | `/movies/:id` | Cập nhật phim (admin) |
| DELETE | `/movies/:id` | Xóa phim (admin) |

### 📝 Watch History

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/watch` | Lưu lịch sử xem + đánh giá |
| GET | `/history` | Lấy lịch sử xem (join users + movies) |

### 👤 Profile

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| PUT | `/user/:id` | Cập nhật tên/email |
| PUT | `/user/:id/password` | Đổi mật khẩu |

### 💰 Wallet

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/wallet/:userId` | Lấy số dư ví |
| POST | `/wallet/topup` | Nạp tiền (có thể kèm voucher) |
| GET | `/wallet/:userId/transactions` | Lịch sử giao dịch |
| GET | `/wallet/:userId/purchases` | Phim đã mua |
| POST | `/wallet/purchase` | Mua phim |

### 🏷️ Vouchers

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/vouchers` | Danh sách voucher |
| POST | `/vouchers` | Tạo voucher (admin) |
| PUT | `/vouchers/:id` | Cập nhật voucher (admin) |
| DELETE | `/vouchers/:id` | Xóa voucher (admin) |
| POST | `/vouchers/redeem` | Kiểm tra mã voucher |

### 💬 Support Chat

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/support/conversations` | Danh sách hội thoại (admin) |
| GET | `/support/messages/:userId` | Tin nhắn của user |
| POST | `/support/send` | Gửi tin nhắn (user/admin) |

### ⚙️ Admin

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/users` | Danh sách user |
| GET | `/admin/stats` | Thống kê tổng quan (users, movies, transactions, vouchers, revenue) |

---

## ✨ Tính năng

### Người dùng
- 🔐 Đăng ký / Đăng nhập với hiệu ứng particles + spotlight
- 🎥 Duyệt phim theo thể loại + tìm kiếm với poster từ OMDb
- ⭐ Xem thông tin IMDb (rating, runtime, năm)
- 📝 Ghi lại lịch sử xem + đánh giá sao
- 📊 Thống kê cá nhân (tổng thời gian xem, rating trung bình, top phim)
- 💰 Ví điện tử — nạp tiền (kèm voucher giảm giá)
- 🛒 Mua phim bằng số dư trong ví
- 🏷️ Danh sách + redeem voucher
- 👤 Chỉnh sửa hồ sơ, đổi mật khẩu
- 💬 Chat hỗ trợ trực tiếp
- ❤️ Yêu thích phim
- ⭐ Đánh giá & bình luận phim
- 🎬 Xem YouTube trailer ngay trong app
- ⌨️ Phím tắt: ← → điều hướng banner, Escape đóng overlay
- 🔔 Thông báo toast thay vì alert trình duyệt
- 🎨 Đổi theme giao diện (5 màu sắc khác nhau)

### Admin
- 📊 Dashboard thống kê: users, movies, transactions, vouchers, doanh thu
- 👥 Quản lý user
- 🎬 CRUD phim (thêm/sửa/xóa)
- 🏷️ CRUD voucher (thêm/sửa/xóa)
- 💬 Quản lý hội thoại hỗ trợ + trả lời tin nhắn

---

## ☁️ Triển khai trên Databricks

### 1. Export data từ Databricks SQL ra CSV

Script export kết nối tới **Databricks SQL** (giống backend) và xuất dữ liệu ra 3 file CSV.

```bash
cd backend
node export.js
# Tạo ra:
#   ✅ movies.csv      — Danh sách phim (MovieID, Title, Genre...)
#   ✅ users.csv       — Danh sách user (UserID, Name, Email...)
#   ✅ watchhistory.csv — Lịch sử xem (HistoryID, UserID, MovieID, WatchTime, Rating, CreatedAt)
```

> **Yêu cầu:** File `backend/.env` phải có đủ `DATABRICKS_HOST`, `DATABRICKS_PATH`, `DATABRICKS_TOKEN`

### 2. Upload lên Databricks Volume

1. Vào **Databricks Community Edition** → **Catalog** (hoặc **Data**)
2. Tạo Volume nếu chưa có (default: `/Volumes/main/default/data_netflix/`)
3. Vào Volume → **Upload files**
4. Upload 3 file CSV: `movies.csv`, `users.csv`, `watchhistory.csv`

> **Lưu ý:** Volume path mặc định là `/Volumes/main/default/data_netflix/`. Nếu khác, sửa lại trong notebook.

### 3. Phân tích với Spark Notebook

Mở file `databricks/Netflix_Analysis.py` trong Databricks Workspace:
1. **Workspace** → **Import** → Chọn file `databricks/Netflix_Analysis.py`
2. Hoặc copy-paste nội dung vào notebook mới
3. Chọn cluster (Community Edition có sẵn cluster free)
4. Chạy từng cell (Shift+Enter)

Notebook thực hiện:
| Cell | Phân tích |
|------|-----------|
| 🔄 | Load 3 CSV từ Volume bằng Apache Spark |
| 🎬 | **Top 10 phim được xem nhiều nhất** |
| ⭐ | **Rating trung bình theo thể loại** (tách genre, aggregate) |
| 👤 | **Top người dùng xem nhiều** |
| 📅 | **Xu hướng xem theo thời gian** |
| 📊 | **Visualize biểu đồ** với matplotlib (bar chart, line chart) |
| 💾 | **Lưu kết quả vào Delta Lake Tables** |

### Kết quả đầu ra (Delta Tables)

Sau khi chạy notebook, các bảng sau sẽ được tạo trong metastore:
| Table | Mô tả |
|-------|-------|
| `netflix_analysis_top_movies` | Top phim + lượt xem + rating TB |
| `netflix_analysis_genre_ratings` | Rating TB theo từng thể loại |
| `netflix_analysis_daily_views` | Lượt xem theo ngày |

Có thể query các bảng này bằng SQL sau khi lưu:
```sql
SELECT * FROM netflix_analysis_top_movies ORDER BY ViewCount DESC;
SELECT * FROM netflix_analysis_genre_ratings ORDER BY AvgRating DESC;
SELECT * FROM netflix_analysis_daily_views ORDER BY WatchDate;
```

---

## 🌐 External API

**OMDb API** — `http://www.omdbapi.com` (Key: `5a5767ab`)

Dùng để lấy:
- Poster phim
- IMDb Rating
- Thể loại, năm phát hành, thời lượng

---

## 🧠 Kiến trúc code

### Backend (Modular Routes)
- `server.js` chỉ import và mount các route modules
- `db.js` quản lý kết nối Databricks + helper functions (`safeCount`, `safeSum`)
- Mỗi nhóm endpoint nằm trong file riêng tại `routes/`

### Frontend (Custom Hooks)
- **App.jsx** đóng vai trò orchestration: gọi hooks → lấy state + actions → truyền props xuống components
- **Hooks** (`useAuth`, `useMovies`, `useWallet`, `useVouchers`, `useProfile`, `useChat`, `useAdmin`) — mỗi hook quản lý state + fetch logic cho một domain riêng
- **Components** nhận props và render UI thuần túy

---

## 👨‍💻 Tác giả

- **GitHub:** [cauchunhovuive](https://github.com/cauchunhovuive)
