# 🎬 Netflix Clone — Ứng dụng Xem Phim

Ứng dụng web quản lý và theo dõi lịch sử xem phim, xây dựng theo kiến trúc **Client-Server**, tích hợp **OMDb API** và phân tích dữ liệu trên **Databricks**.

> 📦 Project môn Điện Toán Đám Mây

---

## 🧱 Kiến trúc hệ thống

```
┌─────────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│   React Frontend    │ ─────► │   Express Backend     │ ─────► │   SQL Server    │
│   localhost:5173    │        │   localhost:3000       │        │   NetflixDB     │
└─────────────────────┘        └──────────────────────┘        └─────────────────┘
           │                              │
           │                              ▼
           │                   ┌──────────────────────┐
           └──────────────────►│      OMDb API         │
                               │  (Kiểm tra & poster) │
                               └──────────────────────┘

                   Data Flow → Databricks
                   ┌──────────────────────────────────────┐
                   │  SQL Server → export.js → CSV files  │
                   │              ↓                       │
                   │  Upload lên Databricks Volume        │
                   │              ↓                       │
                   │  Spark Notebook phân tích            │
                   │              ↓                       │
                   │  Delta Lake Tables + Visualize       │
                   └──────────────────────────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | SQL Server (Microsoft) |
| External API | OMDb API |
| Cloud / Analytics | Databricks Community Edition, Apache Spark, Delta Lake |
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
│   ├── server.js           # API routes
│   ├── export.js           # Script export CSV cho Databricks
│   └── package.json
└── README.md
```

---

## ⚙️ Hướng dẫn cài đặt & chạy

### Yêu cầu
- Node.js >= 18
- SQL Server (local)
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

Cấu hình database trong `server.js`:
```js
const config = {
    user: "sa",
    password: "123456",       // ← đổi thành password của bạn
    server: "localhost",
    database: "NetflixDB",
    options: { trustServerCertificate: true }
};
```

Khởi tạo database SQL Server:
```sql
CREATE DATABASE NetflixDB;

CREATE TABLE Users (
    UserID   INT PRIMARY KEY IDENTITY,
    Name     NVARCHAR(100),
    Email    NVARCHAR(100) UNIQUE,
    Password NVARCHAR(100)
);

CREATE TABLE Movies (
    MovieID     INT PRIMARY KEY IDENTITY,
    Title       NVARCHAR(200),
    Genre       NVARCHAR(100),
    Description NVARCHAR(MAX)
);

CREATE TABLE WatchHistory (
    HistoryID INT PRIMARY KEY IDENTITY,
    UserID    INT FOREIGN KEY REFERENCES Users(UserID),
    MovieID   INT FOREIGN KEY REFERENCES Movies(MovieID),
    WatchTime INT,
    Rating    FLOAT,
    CreatedAt DATETIME DEFAULT GETDATE()
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

## ☁️ Triển khai trên Databricks

### Export data ra CSV
```bash
cd backend
node export.js
# Tạo ra: movies.csv, users.csv, watchhistory.csv
```

### Upload lên Databricks
1. Vào **Databricks Community Edition**
2. **Data Ingestion** → **Upload files**
3. Upload 3 file CSV vào Volume `/Volumes/main/default/data_netflix/`

### Chạy Notebook phân tích
Notebook `Netflix_Analysis` trên Databricks Workspace thực hiện:
- Load data từ Volume bằng Apache Spark
- Phân tích phim được xem nhiều nhất
- Thống kê rating trung bình theo thể loại
- Visualize biểu đồ bằng matplotlib
- Lưu kết quả vào **Delta Lake Tables**

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
    
