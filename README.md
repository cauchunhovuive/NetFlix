# 🎬 Netflix Clone — Ứng dụng Xem Phim

Ứng dụng web quản lý và theo dõi lịch sử xem phim, xây dựng theo kiến trúc **Client-Server**, tích hợp **OMDb API** và lưu trữ dữ liệu trực tiếp trên **Databricks SQL Warehouse**.

> 📦 Project môn Điện Toán Đám Mây

---

## 🧱 Kiến trúc hệ thống

```
┌─────────────────────┐        ┌──────────────────────┐        ┌──────────────────────────┐
│   React Frontend    │ ─────► │   Express Backend     │ ─────► │  Databricks SQL Warehouse│
│   localhost:5173    │        │   localhost:3000       │        │  (Delta Lake Tables)     │
└─────────────────────┘        └──────────────────────┘        └──────────────────────────┘
           │                              │
           │                              ▼
           │                   ┌──────────────────────┐
           └──────────────────►│      OMDb API         │
                               │  (Kiểm tra & poster) │
                               └──────────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | Databricks SQL Warehouse, Delta Lake |
| External API | OMDb API, |
| Cloud | Databricks Community Edition |
| Version Control | Git, GitHub |

---

## 📁 Cấu trúc thư mục

```
NetFlix/
├── frontend/               # React app
│   └── src/
│       ├── App.jsx         # Component chính
│       └── App.css         # Styles
├── backend/                # Express API
│   ├── server.js           # API routes + kết nối Databricks
│   └── package.json
└── README.md
```

---

## ⚙️ Hướng dẫn cài đặt & chạy

### Yêu cầu
- Node.js >= 18
- Tài khoản Databricks (Community Edition hoặc có workspace)
- npm

---

### 1. Clone repository

```bash
git clone https://github.com/cauchunhovuive/NetFlix.git
cd NetFlix
```

---

### 2. Cài đặt & chạy Backend

```bash
cd backend
npm install
```

Cấu hình kết nối trong `server.js`:
```js
const { DBSQLClient } = require('@databricks/sql');

const client = new DBSQLClient();
await client.connect({
    host:  process.env.DATABRICKS_HOST,
    path:  process.env.DATABRICKS_HTTP_PATH,
    token: process.env.DATABRICKS_TOKEN,
});
```

Khởi tạo schema trên Databricks SQL:
```sql
CREATE TABLE IF NOT EXISTS Users (
    UserID   BIGINT GENERATED ALWAYS AS IDENTITY,
    Name     STRING,
    Email    STRING,
    Password STRING
);

CREATE TABLE IF NOT EXISTS Movies (
    MovieID     BIGINT GENERATED ALWAYS AS IDENTITY,
    Title       STRING,
    Genre       STRING,
    Description STRING
);

CREATE TABLE IF NOT EXISTS WatchHistory (
    HistoryID BIGINT GENERATED ALWAYS AS IDENTITY,
    UserID    BIGINT,
    MovieID   BIGINT,
    WatchTime INT,
    Rating    DOUBLE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Thêm phim mẫu
INSERT INTO Movies (Title, Genre, Description) VALUES
('Avengers', 'Action', NULL),
('Spider Man', 'Action', NULL),
('Titanic', 'Romance', NULL),
('The Dark Knight', 'Action', NULL),
('Inception', 'Sci-Fi', NULL),
('Interstellar', 'Sci-Fi', NULL),
('The Godfather', 'Crime', NULL),
('Forrest Gump', 'Drama', NULL),
('The Lion King', 'Animation', NULL),
('Harry Potter', 'Fantasy', NULL),
('Joker', 'Thriller', NULL),
('Avatar', 'Sci-Fi', NULL),
('John Wick', 'Action', NULL);
```

Chạy server:
```bash
node server.js
# Server chạy tại http://localhost:3000
```

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

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/movies` | Lấy danh sách phim |
| POST | `/register` | Đăng ký tài khoản |
| POST | `/login` | Đăng nhập |
| POST | `/watch` | Lưu lịch sử xem |
| GET | `/history` | Lấy lịch sử xem |

---

## ✨ Tính năng

- 🔐 Đăng ký / Đăng nhập tài khoản
- 🎥 Danh sách phim với poster từ OMDb API
- 🔍 Kiểm tra thông tin phim (IMDb rating, thể loại, thời lượng)
- 📝 Ghi lại lịch sử xem + đánh giá
- 📊 Thống kê: tổng lượt xem, rating trung bình, tổng thời gian
- 👤 Trang tài khoản cá nhân

---

## 🌐 External API

**OMDb API** — `http://www.omdbapi.com`

Dùng để kiểm tra phim có tồn tại và lấy thông tin:
- Poster phim
- IMDb Rating
- Thể loại, năm phát hành, thời lượng

---

## 👨‍💻 Tác giả

- **GitHub:** [cauchunhovuive](https://github.com/cauchunhovuive)
