# 🎬 NETFLIX CLONE — Ứng Dụng Xem Phim Hoàn Chỉnh

> **Môn học:** Điện Toán Đám Mây  
> **Kiến trúc:** Client-Server + Databricks SQL + OMDb API  
> **Ngôn ngữ:** JavaScript (React 19 + Node.js/Express 5) + Python (Databricks Spark)

---

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Thư Mục Chi Tiết](#-cấu-trúc-thư-mục-chi-tiết)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [Hướng Dẫn Sử Dụng](#-hướng-dẫn-sử-dụng)
- [Cách Chụp & Thêm Screenshots](#-cách-chụp--thêm-screenshots)
- [API Endpoints](#-api-endpoints)
- [Tính Năng Người Dùng](#-tính-năng-người-dùng)
- [Tính Năng Admin](#-tính-năng-admin)
- [Phân Tích Dữ Liệu với Databricks](#-phân-tích-dữ-liệu-với-databricks-spark-notebook)
- [Hướng Dẫn Databricks Jobs & DLT Pipeline](#-hướng-dẫn-databricks-jobs--dlt-pipeline)
- [Cơ Sở Dữ Liệu (Databricks Delta Tables)](#-cơ-sở-dữ-liệu-databricks-delta-tables)
- [Hooks & Components](#-hooks--components)

---

## 🏗️ Tổng Quan

Ứng dụng web **Netflix Clone** là một nền tảng xem phim trực tuyến với đầy đủ tính năng:

- **Người dùng:** Đăng ký, đăng nhập, duyệt phim, xem thông tin IMDb, mua phim bằng ví điện tử, đánh giá, yêu thích, chat hỗ trợ, đổi theme giao diện.
- **Admin:** Dashboard thống kê, quản lý users, CRUD phim, CRUD voucher, quản lý hội thoại hỗ trợ.
- **Cloud:** Dữ liệu lưu trên **Databricks SQL** (Delta Lake), phân tích với **Apache Spark**.
- **External API:** **OMDb API** để lấy poster, rating IMDb, thông tin phim.

---

## 🧱 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────────┐
│                        React Frontend (Vite)                        │
│  localhost:5173                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ AuthPage │ │MoviesTab │ │WalletTab │ │AdminTab  │ │SupportChat│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│         │            │             │            │            │       │
│         └────────────┴─────────────┴────────────┴────────────┘       │
│                              │ API calls                             │
└──────────────────────────────┼───────────────────────────────────────┘
                               │  HTTP (fetch)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Express Backend (Node.js)                        │
│  localhost:3000                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ auth.js  │ │movies.js │ │wallet.js │ │support.js│ │admin.js  │ │
│  │profile.js│ │watch.js  │ │omdb.js   │ │vouchers.js││fav.js    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                              │                                       │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Databricks SQL  │  │   OMDb API       │  │ MyMemory API     │
│  (Delta Lake)    │  │ (Poster, IMDb)   │  │ (Dịch thuật)     │
│  Cloud Data Lake │  │ omdbapi.com      │  │ api.mymemory.    │
│                  │  │                  │  │ translated.net   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React | 19.2.4 | UI Library |
| Vite | 8.0.4 | Build tool |
| React Compiler | 1.0.0 | Tối ưu re-render |
| CSS | — | Toàn bộ styling (không dùng thư viện ngoài) |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Node.js | >= 18 | Runtime |
| Express | 5.2.1 | Web framework |
| @databricks/sql | 1.13.0 | Kết nối Databricks SQL |
| cors | 2.8.6 | Cross-origin requests |
| dotenv | 17.4.2 | Biến môi trường |

### Database & Analytics
| Công nghệ | Mục đích |
|-----------|----------|
| Databricks SQL (Community Edition) | Lưu trữ dữ liệu cloud |
| Delta Lake | Định dạng table ACID |
| Apache Spark (PySpark) | Phân tích dữ liệu |
| Matplotlib | Biểu đồ trực quan |

### External APIs
| API | Key | Mục đích |
|-----|-----|----------|
| OMDb API | `5a5767ab` | Poster, IMDb rating, thông tin phim |
| MyMemory API | — | Dịch plot phim Anh → Việt |

---

## 📁 Cấu Trúc Thư Mục Chi Tiết

```
NetFlix/
│
├── package.json                          # Root package (Databricks SQL driver)
├── README.md                             # Tài liệu này
│
├── backend/                              # 🖥️ API Server (Express)
│   ├── server.js                         # Entry point — import & mount tất cả routes
│   ├── db.js                             # Kết nối Databricks SQL + helpers
│   ├── seed-free.js                      # Set 10 phim đầu thành miễn phí (Price=0)
│   ├── seed-movies.js                    # Seed 54 phim (⚠️ không chạy được trên CE)
│   ├── seed-queen-of-tears.sql           # SQL seed cho Queen of Tears
│   ├── package.json                      # Dependencies: express, @databricks/sql, cors, dotenv
│   │
│   ├── routes/                           # 📡 Modular route handlers
│   │   ├── auth.js                       # POST /login, POST /register
│   │   ├── movies.js                     # GET/POST /movies, PUT/DELETE /movies/:id
│   │   ├── watch.js                      # POST /watch, GET /history
│   │   ├── wallet.js                     # GET /wallet/:userId, POST /wallet/topup, 
│   │   │                                 # GET /wallet/:userId/transactions,
│   │   │                                 # GET /wallet/:userId/purchases,
│   │   │                                 # POST /wallet/purchase
│   │   ├── vouchers.js                   # GET/POST /vouchers, PUT/DELETE /vouchers/:id,
│   │   │                                 # POST /vouchers/redeem
│   │   ├── support.js                    # GET /support/conversations,
│   │   │                                 # GET /support/messages/:userId,
│   │   │                                 # POST /support/send
│   │   ├── admin.js                      # GET /admin/users, GET /admin/stats,
│   │   │                                 # GET /admin/transactions
│   │   ├── profile.js                    # PUT /user/:id, PUT /user/:id/password
│   │   ├── favorites.js                  # GET /favorites/:userId,
│   │   │                                 # POST /favorites/toggle,
│   │   │                                 # GET /favorites/:userId/with-details
│   │   ├── reviews.js                    # GET /reviews/:movieId, POST /reviews,
│   │   │                                 # DELETE /reviews/:id
│   │   └── omdb.js                       # GET /omdb?t=Title (proxy OMDb API)
│   │
│   └── utils/
│       └── vietsub.js                    # GENRE_MAP (Anh→Việt) + translateText()
│                                         # + vietsubMovie() dùng MyMemory API
│
├── frontend/                             # 🎨 React App (Vite 8)
│   ├── index.html                        # HTML entry point
│   ├── vite.config.js                    # Vite config + React Compiler + Babel
│   ├── eslint.config.js                  # ESLint flat config
│   ├── package.json                      # Dependencies: react, react-dom, dev tools
│   │
│   └── src/
│       ├── main.jsx                      # ReactDOM.createRoot entry
│       ├── App.jsx                       # 🧠 Orchestrator chính:
│       │                                 #   - Gọi tất cả hooks
│       │                                 #   - Quản lý toasts, tabs, keyboard shortcuts
│       │                                 #   - Render AuthPage hoặc Main layout
│       │                                 #   - Props drilling xuống pages/components
│       ├── App.css                       # 🎭 ~2000 dòng CSS (tất cả styling)
│       ├── index.css                     # CSS reset + variables (Vite mẫu)
│       ├── api.js                        # API_BASE_URL + helper getUserId/getMovieId/getTitle
│       │
│       ├── hooks/                        # 🪝 Custom Hooks — mỗi hook = 1 domain
│       │   ├── useAuth.js                # 🔐 State & logic auth (login/register/logout)
│       │   ├── useMovies.js              # 🎬 State & logic movies (fetch, modal, hero, watch)
│       │   ├── useWallet.js              # 💰 State & logic wallet (balance, topup, purchase)
│       │   ├── useVouchers.js            # 🏷️ State & logic vouchers (list, redeem)
│       │   ├── useProfile.js             # 👤 State & logic profile (edit, change password)
│       │   ├── useChat.js                # 💬 State & logic support chat (messages, send)
│       │   ├── useAdmin.js               # ⚙️ State & logic admin (stats, CRUD, support)
│       │   ├── useFavorites.js           # ❤️ State & logic favorites (toggle, fetch)
│       │   ├── useReviews.js             # ⭐ State & logic reviews (fetch, submit, delete)
│       │   └── useTheme.js               # 🎨 State & logic theme (5 themes, local storage)
│       │
│       ├── pages/                        # 📄 Tab pages (render theo tab state)
│       │   ├── AuthPage.jsx              # 🔐 Login/Register form slider + particles + spotlight
│       │   ├── MoviesTab.jsx             # 🎬 Hero banner + genre pills + search + movie grid
│       │   ├── HistoryTab.jsx            # 📋 Watch history list + stats cards
│       │   ├── WalletTab.jsx             # 💰 Balance card + subtabs (transactions/purchased)
│       │   ├── ProfileTab.jsx            # 👤 Profile edit + stats + top movies
│       │   ├── VouchersTab.jsx           # 🏷️ Redeem form + voucher grid
│       │   └── AdminTab.jsx              # ⚙️ Dashboard stats + users/movies/vouchers/support
│       │
│       ├── components/                   # 🧩 Reusable UI components
│       │   ├── AuthParticles.jsx         # ✨ Floating particles animation (auth page)
│       │   ├── HeroBanner.jsx            # 🖼️ Hero section with navigation dots
│       │   ├── PlayerOverlay.jsx         # 📺 Full-screen video player (SpenEmbed)
│       │   ├── PosterImage.jsx           # 🖼️ Movie poster with fallback gradient
│       │   ├── RippleButton.jsx          # 🔘 Button with click ripple effect
│       │   ├── StarRating.jsx            # ⭐ Star rating display component
│       │   ├── Toast.jsx                 # 🔔 Single toast notification
│       │   ├── ToastContainer.jsx        # 📦 Toast stack manager (top-right)
│       │   └── TrailerPlayer.jsx         # 🎬 YouTube trailer iframe embed
│       │
│       ├── modals/                       # 🪟 Modal overlays
│       │   ├── MovieModal.jsx            # 🎞️ Movie detail: poster, OMDb info, watch,
│       │   │                             #     purchase, reviews, trailer, favorites
│       │   └── TopUpModal.jsx            # 💳 Top-up: amount picker, voucher input
│       │
│       ├── chat/                         # 💬 Support chat widget
│       │   └── SupportChat.jsx           # 🗨️ Floating chat FAB + message box
│       │
│       └── utils/
│           └── vietsub.js                # GENRE_MAP + translateGenre() (frontend copy)
│
└── databricks/
    └── Netflix_Analysis.py              # 📊 Spark notebook: Top 10 phim, rating genre,
                                         #   top users, daily trends, visualization
```

---

## ⚙️ Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu
- Node.js >= 18
- npm
- Databricks Community Edition account (free)
- OMDb API key (có sẵn: `5a5767ab`)

---

### 1. Clone Repository

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

Tạo file `backend/.env`:

```env
DATABRICKS_TOKEN=dapid5f2283a08db03c876a85091ed6324d5
DATABRICKS_HOST=dbc-5d5ac2ba-09bc.cloud.databricks.com
DATABRICKS_PATH=/sql/1.0/warehouses/a610c57606d351ac
OMDB_KEY=5a5767ab
```

> ⚠️ Các thông số Databricks ở trên là của Databricks Community Edition.  
> Nếu dùng Databricks riêng, thay bằng thông số của bạn.

Chạy server:

```bash
node server.js
# 🚀 Server dang chay tai http://localhost:3000
```

---

### 3. Cài đặt & Chạy Frontend

```bash
cd frontend
npm install
npm run dev
# App chạy tại http://localhost:5173
```

---

### 4. Seed Dữ Liệu

Có 54 phim mẫu trong `backend/seed-movies.js`, nhưng **không thể chạy trực tiếp** vì Databricks Community Edition không hỗ trợ INSERT/UPDATE/DELETE.

**Cách seed đúng:**

1. Export dữ liệu mẫu từ một nguồn khác
2. Upload CSV lên Databricks Volume
3. Dùng `COPY INTO` để import

Hoặc dùng Databricks SQL Editor để chạy các câu lệnh INSERT thủ công.

---

## 📖 Hướng Dẫn Sử Dụng

> ⚠️ **Lưu ý:** Các ảnh chụp màn hình trong hướng dẫn này là placeholder. Xem phần [Cách Chụp & Thêm Screenshots](#-cách-chụp--thêm-screenshots) để biết cách tự tạo ảnh thật.

---

### 1. 🔐 Đăng Nhập / Đăng Ký

#### Màn hình Đăng nhập

> **Placeholder:** `screenshots/auth-login.png`  
> Chụp màn hình trang đăng nhập với form email/password, particles nền, spotlight effect.

**Các bước:**

1. Mở `http://localhost:5173` → Trang auth xuất hiện với hiệu ứng card float-in
2. Tab **Đăng nhập** được chọn mặc định
3. Nhập **Email** và **Mật khẩu**
4. Bấm **Đăng nhập** → Loading spinner → Redirect sang trang chính
5. Nếu sai thông tin → Message đỏ "Email hoặc mật khẩu không đúng"

**Mẹo:**
- Di chuột quanh thẻ auth để thấy spotlight effect
- Bấm icon 👁 để hiện/ẩn mật khẩu
- Tài khoản Admin mẫu: `admin@netflix.com` / `admin123`

#### Màn hình Đăng ký

> **Placeholder:** `screenshots/auth-register.png`  
> Chụp màn hình trang đăng ký với form name/email/password.

**Các bước:**

1. Bấm tab **Đăng ký** → Form slider animation từ phải sang
2. Nhập **Tên**, **Email**, **Mật khẩu**
3. Bấm **Đăng ký** → Loading spinner → Message xanh "Đăng ký thành công!"
4. Tự động chuyển về tab Đăng nhập sau 1.5s

---

### 2. 🎬 Duyệt & Xem Phim

#### Hero Banner

> **Placeholder:** `screenshots/hero-banner.png`  
> Chụp hero banner với poster phim nổi bật, title, description, buttons.

**Tương tác:**
- Banner tự động xoay qua 5 phim mỗi 6 giây
- Bấm các **dots** dưới banner để chuyển phim thủ công
- Dùng phím `←` `→` trên bàn phím để điều hướng
- Bấm **▶ Phát** để mở modal chi tiết phim
- Bấm **ℹ Thông tin** để mở modal chi tiết

#### Bộ lọc thể loại (Genre Pills)

> **Placeholder:** `screenshots/genre-pills.png`  
> Chụp thanh genre pills với nhiều thể loại, một pill đang active.

- Các pill thể loại: Tất cả, Hành động, Phiêu lưu, Hoạt hình, Hài hước...
- Bấm vào pill để lọc phim theo thể loại
- Pill active có màu đỏ Netflix
- Cuộc ngang để xem thêm thể loại

#### Thanh tìm kiếm

> **Placeholder:** `screenshots/search-bar.png`  
> Chụp thanh tìm kiếm với kết quả lọc.

- Nhập tên phim vào ô tìm kiếm (có icon 🔍)
- Kết quả lọc real-time theo tên phim
- Bấm ✕ để xóa tìm kiếm

#### Grid phim

> **Placeholder:** `screenshots/movie-grid.png`  
> Chụp grid phim với poster, hover effect.

- Cards phim xuất hiện với animation staggered
- **Hover:** Card phóng to (scale 1.06), hiện overlay đen + buttons
- Bấm **▶ Phát** → Mở modal xem phim
- Bấm **ℹ** → Mở modal chi tiết
- Bấm icon ❤ (góc dưới phải card) để thêm vào yêu thích
- Poster fallback với gradient màu + chữ cái đầu nếu không có ảnh

---

### 3. 🪟 Modal Chi Tiết Phim

> **Placeholder:** `screenshots/movie-modal.png`  
> Chụp modal chi tiết phim với poster, thông tin OMDb, form watch, reviews.

**Các tab/chức năng trong modal:**

**Thông tin phim:**
- Poster phim lớn (260px height)
- Tên phim, thể loại (màu đỏ)
- IMDb badge: Rating ⭐, Runtime, Năm phát hành
- Mô tả phim

**Ghi lịch sử xem:**
1. Nhập **Thời gian xem** (phút)
2. Nhập **Đánh giá** (1–5)
3. Bấm **Lưu lịch sử** → Toast xanh "✓ Đã lưu lịch sử xem!"

**Mua phim:**
> **Placeholder:** `screenshots/movie-purchase.png`  
> Chụm modal với nút mua phim hiển thị giá.

- Nếu phim có giá > $0 và chưa mua → Bấm **Mua ngay $X.XX**
- Kiểm tra số dư ví → Nếu đủ → Toast xanh + cập nhật số dư
- Nếu không đủ → Toast đỏ báo lỗi

**Yêu thích:**
- Bấm icon ❤ trên poster modal để thêm/bỏ yêu thích

**Trailer:**
- Bấm **▶ Xem Trailer** → Mở YouTube trailer ngay trong modal

**Đánh giá:**
> **Placeholder:** `screenshots/movie-reviews.png`  
> Chụp phần reviews trong modal.

- Tab **Viết đánh giá:** Chọn sao (1–5) + nhập comment → Gửi
- Tab **Xem đánh giá:** Danh sách review từ người dùng khác
- Avatar + tên + ngày + sao + nội dung

---

### 4. 📋 Lịch Sử Xem

> **Placeholder:** `screenshots/history-tab.png`  
> Chụp tab Lịch sử với stats cards và danh sách.

**Stats cards (3 cards):**
- ⭐ Rating trung bình (VD: 3.5 / 5)
- ⏱ Tổng thời gian (VD: 120 phút)
- 🎬 Tổng số phim đã xem

**Danh sách lịch sử:**
- Avatar user + tên + tên phim
- Rating bằng sao vàng
- Thời gian xem (phút)
- Animation khi hover (dịch phải 4px)

---

### 5. 💰 Ví Điện Tử & Giao Dịch

#### Số dư & Nạp tiền

> **Placeholder:** `screenshots/wallet-balance.png`  
> Chụp tab Ví với balance card và nút nạp tiền.

**Header badge:**
- Số dư hiển thị trên header (VD: `$150.00`)
- Bấm vào badge để mở modal nạp tiền nhanh

**Tab Wallet: Balance Card**
- Số dư lớn (font Bebas Neue, 64px, màu xanh lá)
- Bấm **Nạp tiền** → Mở modal top-up

#### Modal Nạp Tiền

> **Placeholder:** `screenshots/topup-modal.png`  
> Chụp modal nạp tiền với các amount buttons và ô voucher.

1. Chọn số tiền: $5, $10, $20, $50, $100 (hoặc nhập custom)
2. (Tùy chọn) Nhập mã voucher để được giảm thêm
3. Bấm **Xác nhận nạp** → Loading → Toast xanh
4. Số dư cập nhật real-time

#### Lịch sử giao dịch

> **Placeholder:** `screenshots/wallet-transactions.png`  
> Chụp danh sách giao dịch với icon in/out.

- Tab **Giao dịch:** List nạp tiền (icon xanh +) / mua phim (icon đỏ -)
- Mỗi dòng: icon + mô tả + ngày + số tiền

#### Phim đã mua

> **Placeholder:** `screenshots/wallet-purchased.png`  
> Chụp danh sách phim đã mua.

- Tab **Đã mua:** Danh sách phim đã thanh toán
- Icon vàng, tên phim, thể loại, ngày mua

---

### 6. 🏷️ Voucher & Mã Giảm Giá

> **Placeholder:** `screenshots/vouchers-tab.png`  
> Chụp tab Voucher với redeem form và danh sách voucher.

**Redeem mã:**
1. Nhập mã voucher vào ô input (tự động uppercase + letter-spacing)
2. Bấm **Kiểm tra** → Message xanh: "✓ Mã WELCOME10: Giảm 10%..."
3. Mã có thể dùng khi nạp tiền để nhận thêm %

**Danh sách Voucher:**
- Grid các card voucher với gradient top border
- Mỗi card: Mã code (Bebas Neue, 28px), discount %, mô tả, hạn sử dụng

---

### 7. 👤 Hồ Sơ Cá Nhân

> **Placeholder:** `screenshots/profile-tab.png`  
> Chụp tab Tài khoản với profile card, edit form, stats, top movies.

**Layout 2 cột:**

**Cột trái:**
- Avatar (72px, viền đỏ đôi)
- Tên + Email
- Badge Admin nếu là admin
- **Edit form:** Tên, Email → Bấm **Cập nhật**
- **Đổi mật khẩu:** Bấm "Đổi mật khẩu" → Form mở rộng
  - Mật khẩu hiện tại → Mật khẩu mới → Xác nhận → **Đổi mật khẩu**

**Cột phải:**
- **Thống kê:** Số phim đã xem, Tổng thời gian
- **Top 5 phim** xem nhiều nhất:
  - Rank (số), tên phim, thời gian, rating ⭐
  - Animation khi hover (dịch trái)

---

### 8. 💬 Chat Hỗ Trợ

> **Placeholder:** `screenshots/support-chat.png`  
> Chụp chat widget đang mở với tin nhắn.

1. Bấm icon 💬 (FAB đỏ, góc dưới phải) để mở chat
2. Chatbox slide-in từ dưới lên (animation spring)
3. **Lịch sử tin nhắn:** Tin nhắn cũ + mới
   - Tin nhắn user: bubble đỏ, bên phải
   - Tin nhắn admin: bubble tối, bên trái
4. Nhập tin nhắn → Bấm **Gửi** hoặc Enter
5. **Auto-reply:** Nếu admin chưa trả lời trong 10 phút → Tự động gửi "Cảm ơn bạn đã liên hệ..."
6. Bấm ✕ để đóng chat

---

### 9. ❤️ Yêu Thích Phim

> **Placeholder:** `screenshots/favorites-heart.png`  
> Chụp movie card với heart icon active + filter yêu thích.

**Thêm/bỏ yêu thích:**
- **Trên card phim:** Hover → icon ❤ xuất hiện góc dưới → Bấm để toggle
- **Trong modal:** Bấm icon ❤ trên poster
- Heart active có background đỏ

**Lọc yêu thích:**
- Bấm nút **❤ Yêu thích** (cạnh search bar) → Chỉ hiện phim đã thích
- Badge đỏ hiện số lượng phim yêu thích

---

### 10. ⭐ Đánh Giá & Bình Luận

> **Placeholder:** `screenshots/reviews-section.png`  
> Chụp phần đánh giá trong modal với form và danh sách.

**Viết đánh giá:**
1. Chọn số sao (1–5) bằng cách bấm vào icon ⭐
2. (Tùy chọn) Nhập bình luận
3. Bấm **Gửi đánh giá** → Message xanh
4. Nếu đã đánh giá trước → Cập nhật đánh giá cũ

**Xem đánh giá:**
- Tab **Xem đánh giá** (bên cạnh tab Viết)
- Danh sách reviews từ người dùng khác
- Mỗi review: Avatar + tên + sao + ngày + comment

---

### 11. 🎬 Phát Video & Trailer

> **Placeholder:** `screenshots/player-overlay.png`  
> Chụp player overlay toàn màn hình.

**YouTube Trailer:**
1. Trong modal chi tiết phim → Bấm **▶ Xem Trailer**
2. Trailer phát trong iframe YouTube ngay trong modal

**Full-screen Player:**
1. Từ modal → Bấm **Phát** (nếu đã mua)
2. Player overlay toàn màn hình với animation scale-in
3. Bấm **✕ Đóng** hoặc `Esc` để thoát

---

### 12. ⌨️ Phím Tắt Bàn Phím

> **Placeholder:** `screenshots/kbd-hint.png`  
> Chụp thanh hướng dẫn phím tắt ở cuối màn hình.

| Phím | Chức năng |
|------|-----------|
| `←` `→` | Điều hướng hero banner (chỉ ở tab Phim) |
| `Esc` | Đóng player → Đóng modal → Đóng topup → Đóng chat |

- Thanh hướng dẫn phím tắt hiển thị ở cuối màn hình (tab Movies)
- Tự động ẩn trên mobile

---

### 13. 🎨 Đổi Theme Giao Diện

> **Placeholder:** `screenshots/theme-picker.png`  
> Chụp dropdown theme picker với 5 theme.

1. Bấm icon 🎨 trên header (góc phải)
2. Dropdown hiện ra với 5 theme:
   - 🔴 Netflix Đỏ (mặc định)
   - 💚 Lục Bảo
   - 🔵 Đại Dương
   - 💜 Hoàng Gia
   - 🌙 Nửa Đêm
3. Bấm vào theme → CSS variables thay đổi real-time
4. Theme được lưu vào localStorage (nhớ sau khi reload)

---

### 14. ⚙️ Admin Dashboard

#### Dashboard Thống Kê

> **Placeholder:** `screenshots/admin-dashboard.png`  
> Chụp admin dashboard với 4 stat cards và revenue card.

**5 cards thống kê:**
- 👥 Users: Tổng số người dùng
- 🎬 Movies: Tổng số phim
- 💳 Transactions: Tổng số giao dịch
- 🏷️ Vouchers: Tổng số voucher
- 💰 Revenue: Tổng doanh thu (card vàng, nổi bật)

#### Quản lý Users

> **Placeholder:** `screenshots/admin-users.png`  
> Chụp bảng users với avatar, name, email, role.

- Bảng users: Avatar, Name, Email, Role
- Role: Admin (badge đỏ) / User (badge xám)

#### Quản lý Phim (CRUD)

> **Placeholder:** `screenshots/admin-movies.png`  
> Chụp bảng phim với các nút edit/delete.

- Bảng: ID, Title, Genre (badge đỏ), Description, Year, Price
- Bấm **✏️** để sửa → Modal form pre-filled
- Bấm **🗑️** để xóa → Confirm dialog
- Bấm **+ Thêm phim** → Modal form trống

**Form thêm/sửa phim:**
- Title, Genre, Description, Year, Price, TMDB_ID
- Bấm **Lưu** → Message xanh + refresh danh sách

#### Quản lý Voucher (CRUD)

> **Placeholder:** `screenshots/admin-vouchers.png`  
> Chụp bảng voucher với edit/delete.

- Bảng: Code, Discount %, Description, Expiry, Active
- Tương tự CRUD phim

#### Quản lý Hội thoại Support

> **Placeholder:** `screenshots/admin-support.png`  
> Chụp admin support với conversation list và detail.

**Danh sách hội thoại:**
- User name, email, số tin nhắn, thời gian cuối
- Bấm vào conversation → Mở detail

**Detail hội thoại:**
- Lịch sử tin nhắn (user bubble đỏ / admin bubble xanh)
- Ô nhập tin nhắn + **Gửi**
- Tự động refresh danh sách sau khi gửi

---

### 15. 🔔 Toast Notifications

> **Placeholder:** `screenshots/toast-notifications.png`  
> Chụp các loại toast: success (xanh), error (đỏ), info (xanh dương).

Toast xuất hiện ở góc phải trên, tự động biến mất sau 3.5s:
- ✅ **Success** — viền trái xanh lá, icon check — "✓ Nạp $50 thành công!"
- ❌ **Error** — viền trái đỏ, icon X — "Số dư không đủ"
- ℹ️ **Info** — viền trái xanh dương, icon i — thông báo thông thường

Bấm vào toast để tắt thủ công.

---

### 16. 📊 Phân Tích Dữ Liệu với Databricks (Spark Notebook)

> **Placeholder:** `screenshots/databricks-notebook.png`  
> Chụp notebook Databricks đang chạy với kết quả.

Import `databricks/Netflix_Analysis.py` vào Workspace → Run all cells. Kết quả:
- Top 10 phim (bar chart)
- Rating theo thể loại (bar chart)
- Xu hướng theo ngày (line chart)
- Delta tables đã lưu

---

### 17. 🚀 Hướng Dẫn Databricks Jobs & DLT Pipeline

> Phần này hướng dẫn cách sử dụng **Databricks Jobs** và **Delta Live Tables (DLT) Pipelines** (Bronze → Silver → Gold) với dữ liệu Netflix có sẵn.

#### 🐍 Databricks Job Notebook

**Mục đích:** Notebook Python đọc trực tiếp từ Delta tables có sẵn, transform, ghi output Delta.

**Cách tạo:**
1. Login admin → tab **Admin** → chọn tab con cuối cùng
2. Chọn bảng muốn xử lý
3. Bấm **🐍 Tạo job notebook**
4. Copy Python script → Import vào Databricks Workspace
5. Tạo Databricks Job → Add task → Chọn notebook này

**Kết quả thực tế sau khi chạy Job trên Databricks:**
```
📂 Source: workspace.netflixdb
📋 Tables: users, movies, watchhistory, transactions, vouchers, wallet,
          favorites, reviews, support_messages

  ✅ users: 4 rows loaded
  ✅ movies: 75 rows loaded
  ✅ watchhistory: 10 rows loaded
  ✅ transactions: 11 rows loaded
  ✅ vouchers: 4 rows loaded
  ✅ wallet: 3 rows loaded
  ✅ favorites: 7 rows loaded
  ✅ reviews: 2 rows loaded
  ✅ support_messages: 20 rows loaded

  📊 users: 4 rows, 0 null PKs → ✅ Saved: netflix_job_users
  📊 movies: 75 rows, 0 null PKs → ✅ Saved: netflix_job_movies
  📊 watchhistory: 10 rows, 0 null PKs → ✅ Saved: netflix_job_watchhistory
  📊 transactions: 11 rows → ✅ Saved: netflix_job_transactions
  📊 vouchers: 4 rows → ✅ Saved: netflix_job_vouchers
  📊 wallet: 3 rows → ✅ Saved: netflix_job_wallet
  📊 favorites: 7 rows → ✅ Saved: netflix_job_favorites
  📊 reviews: 2 rows → ✅ Saved: netflix_job_reviews
  📊 support_messages: 20 rows → ✅ Saved: netflix_job_support_messages

✅ Job task completed successfully!
  -> 9 Delta tables created: netflix_job_*
```

Sau khi chạy, có thể query trực tiếp trên Databricks SQL:
```sql
SELECT * FROM netflix_job_movies ORDER BY MovieID;
SELECT Title, total_views, avg_rating FROM netflix_pipeline_gold_movie_stats;
```

#### 🏗️ DLT Pipeline — Bronze → Silver → Gold

**Mục đích:** Xây dựng data pipeline declarative với built-in data quality. Bronze đọc từ Delta tables có sẵn, không cần CSV/Volume.

**Cách tạo:**
1. Login admin → tab **Admin** → chọn tab con cuối cùng
2. Chọn bảng muốn xử lý
3. Bấm **🏗️ Tạo DLT pipeline**
4. Copy Python script → Tạo DLT Pipeline trong Databricks
5. Pipeline mode: `Triggered` hoặc `Continuous`
6. Set target catalog/schema → Start pipeline

**Kiến trúc 3-layer (dữ liệu đọc từ Delta tables có sẵn, không qua CSV/Volume):**
```
┌─────────────────────────────────────────────┐
│  workspace.netflixdb.* (Delta tables có sẵn)  │
│  spark.table("workspace.netflixdb.users")    │
│  spark.table("workspace.netflixdb.movies")   │
│  ...                                          │
└─────────────────────┬───────────────────────┘
                      │ spark.table()
                      ▼
┌─────────────────────────────────────────────┐
│  🟣 BRONZE LAYER                            │
│  - bronze_users                             │
│  - bronze_movies                            │
│  - bronze_watchhistory                      │
│  EXPECT: valid_userid, valid_title...       │
└─────────────────────┬───────────────────────┘
                      │ dlt.read()
                      ▼
┌─────────────────────────────────────────────┐
│  ⚪ SILVER LAYER — Clean & Validate          │
│  - silver_users: PII mask (email, password) │
│  - silver_movies: parse genres, validate    │
│  - silver_watchhistory: validate rating     │
│  - silver_transactions: categorize amount   │
└─────────────────────┬───────────────────────┘
                      │ dlt.read()
                      ▼
┌─────────────────────────────────────────────┐
│  🟡 GOLD LAYER — Aggregates & Insights      │
│  - gold_user_stats: views, avg rating       │
│  - gold_movie_stats: popularity             │
│  - gold_revenue_analytics: revenue by date  │
└─────────────────────────────────────────────┘
```

**Data Quality (EXPECT):**
```python
@dlt.expect_all({
    "valid_userid": "UserID IS NOT NULL",
    "valid_email": "Email LIKE '%@%'",
    "valid_rating": "Rating IS NULL OR (Rating >= 1 AND Rating <= 5)",
    "valid_amount": "Amount IS NOT NULL",
    "valid_sender": "SenderType IN ('user', 'admin')",
})
```

**Khi nào dùng Jobs vs DLT Pipelines:**

| Tiêu chí | 🔄 Databricks Jobs | 🏗️ DLT Pipelines |
|----------|-------------------|------------------|
| Mục đích | Orchestrate tasks tổng quát | Xây dựng data pipeline |
| Cách viết | Imperative (code tường minh) | Declarative (@dlt.table) |
| Data quality | Tự xử lý | Built-in EXPECT |
| Streaming | Hạn chế | Native support |
| Use case | ML, ETL batch, automation | Lakehouse data pipelines |
| Phức tạp | Dễ dùng, linh hoạt | Tự động dependency, CDC |

---

#### 🔄 Luồng làm việc tổng thể

```
┌──────────────────────────────────────────────────────────────────┐
│ ADMIN UI (tab Admin → tab con cuối cùng)                         │
│ - Chọn bảng → bấm tạo Job Notebook / DLT Pipeline                │
│ - Copy script → Import vào Databricks                            │
└────────────────────────────┬─────────────────────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          ▼                                     ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│ DATABRICKS JOB           │    │ DLT PIPELINE                 │
│ (đọc từ Delta có sẵn)    │    │ (Bronze→Silver→Gold)         │
│ Transform → Ghi Delta    │    │ Data quality EXPECT tự động  │
└──────────────────────────┘    └──────────────────────────────┘
          │                                     │
          └──────────────────┬──────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ DELTA LAKE TABLES                                               │
│ Dữ liệu sẵn sàng cho: Dashboard, ML, Báo cáo, Analytics         │
└──────────────────────────────────────────────────────────────────┘
```

---

#### SQL Query mẫu trên Delta Tables

```sql
-- Top 10 phim xem nhiều nhất
SELECT Title, total_views, avg_rating
FROM netflix_pipeline_gold_movie_stats
ORDER BY total_views DESC
LIMIT 10;

-- Doanh thu theo tháng
SELECT DATE_TRUNC('month', Date) as month,
       SUM(total_amount) as revenue,
       COUNT(*) as transactions_count
FROM netflix_pipeline_gold_revenue_analytics
GROUP BY ALL
ORDER BY month;

-- Thống kê người dùng tích cực nhất
SELECT Name, total_views, avg_watch_time, avg_rating
FROM netflix_pipeline_gold_user_stats
ORDER BY total_views DESC
LIMIT 20;

---

## 📸 Cách Chụp & Thêm Screenshots

### Yêu cầu

- **Backend** đang chạy tại `http://localhost:3000`
- **Frontend** đang chạy tại `http://localhost:5173`
- **Dữ liệu** đã được seed (có phim, user, lịch sử xem...)

### Tạo thư mục screenshots

```bash
cd NetFlix
mkdir screenshots
```

### Công cụ chụp ảnh

**Option A — Dùng browser DevTools (khuyên dùng):**
1. Mở Chrome → `F12` → tab **Elements**
2. Chọn element cần chụp (VD: `.auth-card`, `.hero`)
3. Chuột phải → **Capture node screenshot**
4. Lưu vào thư mục `screenshots/` với tên theo placeholder

**Option B — Dùng extensions:**
- **Full Page Screen Capture** — chụp toàn trang
- **GoFullPage** — chụp scroll

### Danh sách screenshots cần chụp

| # | File | Nội dung | Kích thước khuyên dùng |
|---|------|----------|----------------------|
| 1 | `auth-login.png` | Trang đăng nhập với particles | 430x600 (card) |
| 2 | `auth-register.png` | Trang đăng ký | 430x600 |
| 3 | `hero-banner.png` | Hero banner + dots + phim | 1920x700 |
| 4 | `genre-pills.png` | Thanh genre pills | 1920x60 |
| 5 | `search-bar.png` | Search bar + kết quả | 1920x400 |
| 6 | `movie-grid.png` | Grid phim với hover effect | 1920x600 |
| 7 | `movie-modal.png` | Modal chi tiết phim | 520x800 |
| 8 | `movie-purchase.png` | Modal với nút mua phim | 520x400 |
| 9 | `movie-reviews.png` | Phần đánh giá trong modal | 520x500 |
| 10 | `history-tab.png` | Tab lịch sử xem + stats | 1920x600 |
| 11 | `wallet-balance.png` | Tab ví + balance card | 1920x400 |
| 12 | `topup-modal.png` | Modal nạp tiền | 500x600 |
| 13 | `wallet-transactions.png` | Danh sách giao dịch | 1920x500 |
| 14 | `wallet-purchased.png` | Phim đã mua | 1920x500 |
| 15 | `vouchers-tab.png` | Tab voucher + redeem | 1920x600 |
| 16 | `profile-tab.png` | Tab hồ sơ + stats | 1920x600 |
| 17 | `support-chat.png` | Chat widget + tin nhắn | 360x480 (chatbox) |
| 18 | `favorites-heart.png` | Card phim với heart icon | 400x600 |
| 19 | `reviews-section.png` | Phần reviews | 520x500 |
| 20 | `player-overlay.png` | Player toàn màn hình | 1920x1080 |
| 21 | `kbd-hint.png` | Thanh phím tắt | 600x50 |
| 22 | `theme-picker.png` | Theme dropdown | 250x350 |
| 23 | `admin-dashboard.png` | Dashboard stats | 1920x500 |
| 24 | `admin-users.png` | Bảng users | 1920x400 |
| 25 | `admin-movies.png` | Bảng phim | 1920x500 |
| 26 | `admin-vouchers.png` | Bảng voucher | 1920x400 |
| 27 | `admin-support.png` | Support conversations | 1920x600 |
| 28 | `toast-notifications.png` | Các loại toast | 400x200 |
| 29 | `databricks-notebook.png` | Spark notebook | 1200x800 |

### Chèn ảnh vào README

Sau khi chụp xong, thay các dòng:
```markdown
> **Placeholder:** `screenshots/auth-login.png`
```
bằng:
```markdown
![Đăng nhập](screenshots/auth-login.png)
```

Hoặc với kích thước tùy chỉnh:
```markdown
<img src="screenshots/auth-login.png" alt="Đăng nhập" width="600"/>
```

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/login` | `{ email, password }` | Đăng nhập → trả về user + Role + WalletBalance |
| POST | `/register` | `{ name, email, password }` | Đăng ký tài khoản mới |

### 🎬 Movies

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/movies` | — | Danh sách tất cả phim (ORDER BY MovieID) |
| POST | `/movies` | `{ title, genre, description, year, price, tmdb_id }` | Thêm phim (admin) |
| PUT | `/movies/:id` | `{ title, genre, description, year, price, tmdb_id }` | Sửa phim (admin) |
| DELETE | `/movies/:id` | — | Xóa phim + watch history liên quan (admin) |

### 📝 Watch History

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| POST | `/watch` | `{ user_id, movie_id, watch_time, rating }` | Ghi lịch sử xem |
| GET | `/history` | — | Lịch sử xem (JOIN users + movies) |

### 👤 Profile

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| PUT | `/user/:id` | `{ name, email }` | Cập nhật hồ sơ |
| PUT | `/user/:id/password` | `{ currentPassword, newPassword }` | Đổi mật khẩu |

### 💰 Wallet

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/wallet/:userId` | — | Số dư ví |
| POST | `/wallet/topup` | `{ user_id, amount, voucher_code }` | Nạp tiền (có thể kèm voucher) |
| GET | `/wallet/:userId/transactions` | — | Lịch sử giao dịch (50 gần nhất) |
| GET | `/wallet/:userId/purchases` | — | Phim đã mua (JOIN movies) |
| POST | `/wallet/purchase` | `{ user_id, movie_id }` | Mua phim |

### 🏷️ Vouchers

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/vouchers` | — | Danh sách voucher |
| POST | `/vouchers` | `{ code, discount, description, expiry_date }` | Tạo voucher (admin) |
| PUT | `/vouchers/:id` | `{ code, discount, description, expiry_date, active }` | Sửa voucher (admin) |
| DELETE | `/vouchers/:id` | — | Xóa voucher (admin) |
| POST | `/vouchers/redeem` | `{ code }` | Kiểm tra mã voucher |

### 💬 Support Chat

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/support/conversations` | — | Danh sách hội thoại (admin, GROUP BY user) |
| GET | `/support/messages/:userId` | — | Tin nhắn của user |
| POST | `/support/send` | `{ user_id, message, sender_type }` | Gửi tin nhắn (user/admin) |

> **Auto-reply:** Khi user gửi tin nhắn và admin chưa reply trong 10 phút, hệ thống tự động gửi tin nhắn "Cảm ơn bạn đã liên hệ..."

### ⚙️ Admin

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/users` | Danh sách users |
| GET | `/admin/stats` | Thống kê: users, movies, transactions, vouchers, revenue |
| GET | `/admin/transactions` | Tất cả giao dịch (JOIN users, 200 gần nhất) |

### 🌐 OMDb Proxy

| Method | Endpoint | Query | Mô tả |
|--------|----------|-------|-------|
| GET | `/omdb` | `?t=MovieTitle` | Proxy OMDb API + dịch Genre/Plot sang Việt |

### ❤️ Favorites

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/favorites/:userId` | — | Danh sách MovieID yêu thích |
| POST | `/favorites/toggle` | `{ user_id, movie_id }` | Thêm/bỏ yêu thích |
| GET | `/favorites/:userId/with-details` | — | Yêu thích + thông tin phim |

### ⭐ Reviews

| Method | Endpoint | Body | Mô tả |
|--------|----------|------|-------|
| GET | `/reviews/:movieId` | — | Đánh giá của phim (JOIN users) |
| POST | `/reviews` | `{ movie_id, user_id, rating, comment }` | Thêm/cập nhật đánh giá |
| DELETE | `/reviews/:id` | — | Xóa đánh giá |

---

## ✨ Tính Năng Người Dùng

### 🔐 Authentication
- **Đăng nhập / Đăng ký** với form slider animation
- **Hiệu ứng particles** nền động
- **Spotlight effect** theo chuột trên thẻ auth
- **Glow border** gradient animation
- **Password toggle** hiện/ẩn mật khẩu
- **Loading spinner** khi submit
- **Validation messages** với animation slide-in

### 🎥 Duyệt Phim
- **Hero banner** auto-rotate 6s với 5 phim đầu
- **Điều hướng dots** + phím tắt `←` `→`
- **Genre pills** filter (đa thể loại, tách bằng dấu phẩy)
- **Search bar** tìm kiếm theo tên phim
- **Movie grid** responsive (lưới thích ứng)
- **Card animation** xuất hiện dần với staggered delay
- **Hover effects:** scale, overlay, action buttons, rank
- **Fallback poster** với gradient + chữ cái đầu

### 📝 Watch History
- **Form ghi lịch sử:** watch_time + rating (1–5)
- **Stats cards:** avg rating, total hours, total views
- **History list** với avatar, stars, time
- **Animation** khi hover (translateX)

### 💰 Wallet & Purchases
- **Wallet badge** trên header (số dư real-time)
- **Top-up modal** với amount buttons ($5, $10, $20, $50, $100)
- **Voucher integration** giảm giá khi nạp
- **Transactions list** (in/out với icon màu)
- **Purchased movies list**
- **Purchase flow** trong MovieModal (kiểm tra số dư, mua, toast)

### 🏷️ Vouchers
- **Redeem form** với input uppercase + letter-spacing
- **Voucher grid** (code, discount %, description, expiry)
- **Gradient top border** animation trên mỗi card

### 👤 Profile
- **Edit profile:** name, email
- **Change password:** current → new + confirm
- **Stats:** watched count, total hours
- **Top 5 movies** most watched (time → rating)
- **Admin badge** nếu role Admin

### 💬 Support Chat
- **Floating FAB** (fixed bottom-right) với scale animation
- **Chatbox widget** (360x480px) với slide-in animation
- **Message bubbles:** user (red, right) / admin (dark, left)
- **Auto-reply** khi chưa có admin trả lời gần đây
- **Loading state** + empty state

### ❤️ Favorites
- **Heart button** trên movie card (hover reveal)
- **Heart button** trong MovieModal poster
- **Filter button** "Yêu thích" với count badge
- **Toggle** thêm/bỏ yêu thích

### ⭐ Reviews
- **Rating stars** (1–5) với hover scale
- **Comment textarea**
- **Review list** với avatar, name, date, stars
- **Update existing** (nếu đã review trước)
- **Tabs:** "Viết đánh giá" / "Xem đánh giá"

### 🎬 Player
- **YouTube trailer** embed qua iframe
- **Full-screen overlay** với scale-in animation
- **SpenEmbed player** (source không dùng YouTube)

### ⌨️ Keyboard Shortcuts
| Phím | Chức năng |
|------|-----------|
| `←` `→` | Điều hướng hero banner (tab Movies) |
| `Esc` | Đóng player → modal → topup → chat |

### 🎨 Theme System
| Theme | Màu chủ đạo | Icon |
|-------|-------------|------|
| Netflix Đỏ | `#e50914` | 🔴 |
| Lục Bảo | `#10b981` | 💚 |
| Đại Dương | `#3b82f6` | 🔵 |
| Hoàng Gia | `#8b5cf6` | 💜 |
| Nửa Đêm | `#f59e0b` | 🌙 |

- **Lưu vào localStorage** (nhớ sau khi reload)
- **CSS variables** thay đổi real-time
- **Dropdown picker** với animation

### 🔔 Toast Notifications
- **3 types:** success (green), error (red), info (blue)
- **Auto-dismiss** (3500ms default)
- **Slide-in từ phải** + click để tắt
- **Max 5 toasts** cùng lúc
- **Thay thế hoàn toàn** `alert()` / `confirm()`

---

## ⚙️ Tính Năng Admin

### 📊 Dashboard
- **4 stat cards:** Users, Movies, Transactions, Vouchers
- **Revenue card** với gold highlight
- **Loading skeleton** (dot animation)
- **Hover effects** với glow + scale

### 👥 Users Management
- **Table:** Avatar, Name, Email, Role (Admin/User)
- **Status badges** (active/inactive)

### 🎬 Movies CRUD
- **Table:** ID, Title, Genre, Description, Year, Price
- **Edit button** → modal pre-filled
- **Delete button** với confirm dialog
- **Add movie** button → modal form
- **Form fields:** title, genre, description, year, price, tmdb_id

### 🏷️ Vouchers CRUD
- **Table:** Code, Discount, Description, Expiry, Active
- **Edit/Delete** tương tự movies
- **Form fields:** code, discount, description, expiry_date

### 💬 Support Management
- **Conversation list:** user name, email, message count, last time
- **Conversation detail:** message history với user/admin labels
- **Reply input** + send button
- **Auto-refresh** conversations list sau khi reply

---

## 🗄️ Cơ Sở Dữ Liệu (Databricks Delta Tables)

Tất cả dữ liệu lưu trong schema `workspace.netflixdb`:

### `users`
| Column | Type | Description |
|--------|------|-------------|
| UserID | INT (PK) | Auto-increment |
| Name | STRING | Tên người dùng |
| Email | STRING | Email (unique) |
| Password | STRING | Mật khẩu (plain text — cần hash trong production) |
| Role | STRING | `'User'` hoặc `'Admin'` |

### `movies`
| Column | Type | Description |
|--------|------|-------------|
| MovieID | INT (PK) | Auto-increment |
| Title | STRING | Tên phim |
| Genre | STRING | VD: `"Action, Sci-Fi"` |
| Description | STRING | Mô tả phim |
| Year | INT | Năm phát hành |
| Price | DECIMAL | Giá mua (0 = miễn phí) |
| TMDB_ID | INT | ID trên TMDB (tra cứu OMDb) |

### `watchhistory`
| Column | Type | Description |
|--------|------|-------------|
| HistoryID | BIGINT (PK) | Auto-increment |
| UserID | INT (FK) | → users.UserID |
| MovieID | INT (FK) | → movies.MovieID |
| WatchTime | INT | Phút đã xem |
| Rating | INT | 1–5 |
| CreatedAt | TIMESTAMP | Thời gian ghi |

### `wallet`
| Column | Type | Description |
|--------|------|-------------|
| WalletID | INT (PK) | Auto-increment |
| UserID | INT (FK) | → users.UserID |
| Balance | DECIMAL | Số dư hiện tại |

### `transactions`
| Column | Type | Description |
|--------|------|-------------|
| TransactionID | BIGINT (PK) | Auto-increment |
| UserID | INT (FK) | → users.UserID |
| Amount | DECIMAL | Dương (topup) / Âm (purchase) |
| Type | STRING | `'topup'` hoặc `'purchase'` |
| Description | STRING | Mô tả giao dịch |
| VoucherID | INT | FK → vouchers (nullable) |
| CreatedAt | TIMESTAMP | Thời gian |

### `userpurchases`
| Column | Type | Description |
|--------|------|-------------|
| PurchaseID | BIGINT (PK) | Auto-increment |
| UserID | INT (FK) | → users.UserID |
| MovieID | INT (FK) | → movies.MovieID |
| Price | DECIMAL | Giá đã mua |
| CreatedAt | TIMESTAMP | Thời gian mua |

### `vouchers`
| Column | Type | Description |
|--------|------|-------------|
| VoucherID | INT (PK) | Auto-increment |
| Code | STRING | Mã giảm giá (uppercase) |
| Discount | INT | Phần trăm giảm (0–100) |
| Description | STRING | Mô tả voucher |
| ExpiryDate | DATE | Ngày hết hạn |
| Active | BOOLEAN | 1 = active, 0 = inactive |
| CreatedAt | TIMESTAMP | Thời gian tạo |

### `favorites`
| Column | Type | Description |
|--------|------|-------------|
| FavoriteID | BIGINT (PK) | Auto-increment |
| UserID | INT (FK) | → users.UserID |
| MovieID | INT (FK) | → movies.MovieID |
| CreatedAt | STRING | Thời gian thêm |

### `reviews`
| Column | Type | Description |
|--------|------|-------------|
| ReviewID | BIGINT (PK) | Auto-increment |
| MovieID | INT (FK) | → movies.MovieID |
| UserID | INT (FK) | → users.UserID |
| Rating | INT | 1–5 |
| Comment | STRING | Nội dung đánh giá |
| CreatedAt | TIMESTAMP | Thời gian |

### `support_messages`
| Column | Type | Description |
|--------|------|-------------|
| MessageID | BIGINT (PK) | Auto-increment |
| UserID | INT (FK) | → users.UserID |
| SenderType | STRING | `'user'` hoặc `'admin'` |
| Message | STRING | Nội dung tin nhắn |
| CreatedAt | TIMESTAMP | Thời gian gửi |

---

## 🧠 Kiến Trúc Code

### Backend (Modular Routes Pattern)

```
server.js (import & mount routes)
  ├── db.js (Databricks connection singleton + helpers)
  ├── routes/auth.js      → POST /login, POST /register
  ├── routes/movies.js    → CRUD movies
  ├── routes/watch.js     → Watch history
  ├── routes/wallet.js    → Wallet + transactions + purchases
  ├── routes/vouchers.js  → Voucher CRUD + redeem
  ├── routes/support.js   → Chat support + auto-reply
  ├── routes/admin.js     → Admin stats + users + transactions
  ├── routes/profile.js   → Profile update + password
  ├── routes/favorites.js → Favorites toggle + fetch
  ├── routes/reviews.js   → Reviews CRUD
  └── routes/omdb.js      → OMDb API proxy + VietSub
```

Mỗi route file:
1. Nhận Express Router
2. Định nghĩa handler async
3. Mở session → thực thi SQL → đóng session
4. Error handling với try/catch/finally

### Frontend (Custom Hooks Pattern)

```
App.jsx (Orchestrator)
  ├── Gọi tất cả hooks → lấy state + actions
  ├── Quản lý global state: toasts, tabs, keyboard
  ├── Props drilling xuống pages & components
  └── Render AuthPage hoặc Main layout
       │
       ├── Hooks (state + async logic)
       │   ├── useAuth.js     → Login/register/logout
       │   ├── useMovies.js   → Movie CRUD, modal, hero
       │   ├── useWallet.js   → Balance, topup, purchase
       │   ├── useVouchers.js → List + redeem
       │   ├── useProfile.js  → Edit + password
       │   ├── useChat.js     → Support messages
       │   ├── useAdmin.js    → Stats, users, CRUD, support
       │   ├── useFavorites.js → Toggle + fetch
       │   ├── useReviews.js  → Submit + fetch
       │   └── useTheme.js    → 5 themes, CSS variables
       │
       ├── Pages (UI)
       │   ├── AuthPage.jsx
       │   ├── MoviesTab.jsx
       │   ├── HistoryTab.jsx
       │   ├── WalletTab.jsx
       │   ├── ProfileTab.jsx
       │   ├── VouchersTab.jsx
       │   └── AdminTab.jsx
       │
       └── Components (reusable UI)
           ├── HeroBanner.jsx
           ├── PlayerOverlay.jsx
           ├── PosterImage.jsx
           ├── RippleButton.jsx
           ├── StarRating.jsx
           ├── Toast.jsx / ToastContainer.jsx
           ├── TrailerPlayer.jsx
           └── AuthParticles.jsx
```

### Data Flow

```
User Action → Component Event Handler → Hook Function → fetch(API) → Express Route → Databricks SQL → Response → Hook State → Re-render
```

### Key Design Decisions

1. **Không dùng React Router** — navigation qua tab state (`useState`)
2. **Không dùng Context API** — props drilling từ App.jsx xuống
3. **Không dùng thư viện UI** — toàn bộ CSS viết tay (~2000 dòng)
4. **Toàn bộ CSS trong 1 file** (`App.css`) — dễ quản lý
5. **Custom hooks** thay vì Redux/Zustand — mỗi hook quản lý 1 domain
6. **Modal state machine** — `"closed"` → `"opening"` → `"open"` → `"closing"` → `"closed"`
7. **Databricks session management** — mở/đóng session trong mỗi request

---

## 🧩 Hooks & Components Chi Tiết

### Custom Hooks

#### `useAuth()`
| Return | Type | Description |
|--------|------|-------------|
| `user` | Object | `{ UserID, Name, Email, Role, WalletBalance }` |
| `page` | String | `"auth"` hoặc `"main"` |
| `doLogin(e)` | Function | POST `/login` → set user |
| `doRegister(e)` | Function | POST `/register` → chuyển về login |
| `switchAuthTab(tab)` | Function | Animation giữa login/register |

#### `useMovies()`
| Return | Type | Description |
|--------|------|-------------|
| `movies` | Array | Danh sách phim |
| `history` | Array | Lịch sử xem (JOIN users + movies) |
| `heroMovie` | Object | Phim hiển thị trên banner |
| `modalState` | String | `"closed"` / `"opening"` / `"open"` / `"closing"` |
| `openMovie(movie)` | Function | Mở modal + fetch OMDb |
| `doWatch(user, cb)` | Function | Ghi lịch sử xem + đánh giá |
| `cardsVisible` | Boolean | Animation grid cards |

#### `useWallet()`
| Return | Type | Description |
|--------|------|-------------|
| `walletBalance` | Number | Số dư hiện tại |
| `purchasedIds` | Set<Number> | Set MovieID đã mua |
| `doTopUp(e, user, cb)` | Function | Nạp tiền (có voucher) |
| `doPurchaseMovie(id, user, ...)` | Function | Mua phim |

#### `useAdmin()`
| Return | Type | Description |
|--------|------|-------------|
| `adminStats` | Object | `{ totalUsers, totalMovies, totalTransactions, totalVouchers, totalRevenue }` |
| `adminUsers` | Array | Danh sách users |
| `adminVouchers` | Array | Danh sách voucher |
| `adminConv` | Array | Hội thoại support |
| `doSaveMovie(e, cb)` | Function | Thêm/sửa phim |
| `doSaveVoucher(e)` | Function | Thêm/sửa voucher |

#### `useTheme()`
| Return | Type | Description |
|--------|------|-------------|
| `themeList` | Array | `[{ key, name, icon, vars, isActive }]` |
| `applyTheme(key)` | Function | Đổi CSS variables + localStorage |

### UI Components

| Component | Props | Description |
|-----------|-------|-------------|
| `AuthParticles` | — | 40 particles floating animation |
| `HeroBanner` | `movie, index, maxIndex, onSetIndex, ...` | Hero section với dots |
| `PlayerOverlay` | `playerOpen, selectedMovie, onClose` | Full-screen video |
| `PosterImage` | `title, posterUrl` | Poster + gradient fallback |
| `RippleButton` | `onClick, className, children` | Button với ripple effect |
| `StarRating` | `rating, maxRating` | Star display component |
| `Toast` | `message, type, onClose` | Single notification |
| `ToastContainer` | `toasts, onRemoveToast` | Stack manager |
| `TrailerPlayer` | `movieTitle` | YouTube iframe embed |

---

## 🔐 Bảo Mật & Lưu ý

1. **Mật khẩu plain text** — project học thuật, không dùng production
2. **SQL injection** — queries dùng template literals (cần escape trong production)
3. **Không xác thực JWT/session** — user object được gửi trực tiếp (dùng cho mục đích học tập)
4. **Databricks token** trong `.env` — không commit lên Git

---

## 👨‍💻 Tác Giả

- **GitHub:** [cauchunhovuive](https://github.com/cauchunhovuive)
- **Môn học:** Điện Toán Đám Mây

---

## 📄 License

Project mã nguồn mở phục vụ mục đích học tập.
