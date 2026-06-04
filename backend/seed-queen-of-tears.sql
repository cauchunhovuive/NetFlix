-- ============================================
-- Thêm phim: Queen of Tears (Nữ Hoàng Nước Mắt)
-- Chạy script này trong Databricks SQL Editor
-- ============================================

-- Tìm MovieID mới (max + 1)
-- (Thay 75 bằng max MovieID hiện tại + 1 nếu cần)

INSERT INTO workspace.netflixdb.movies (MovieID, Title, Genre, Description, Price, TMDB_ID)
VALUES (
  75,
  'Queen of Tears',
  'Drama, Romance',
  'Hong Hae-in, nữ thừa kế thế hệ thứ 3 của tập đoàn Queens, đã kết hôn 3 năm với Baek Hyun-woo, con trai một trưởng làng. Họ cùng nhau vượt qua cuộc khủng hoảng hôn nhân cho đến khi một khởi đầu kỳ diệu giúp họ viết lại câu chuyện tình yêu.',
  3.99,
  215720
);

-- Kiểm tra
SELECT * FROM workspace.netflixdb.movies WHERE Title = 'Queen of Tears';

-- Xem tổng số phim
SELECT COUNT(*) as total_movies FROM workspace.netflixdb.movies;
