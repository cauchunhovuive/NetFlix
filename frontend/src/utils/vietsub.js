/* ===== VietSub — dịch thông tin phim sang tiếng Việt (Frontend) ===== */

const GENRE_MAP = {
  Action: "Hành động",
  Adventure: "Phiêu lưu",
  Animation: "Hoạt hình",
  Biography: "Tiểu sử",
  Comedy: "Hài hước",
  Crime: "Tội phạm",
  Documentary: "Tài liệu",
  Drama: "Chính kịch",
  Family: "Gia đình",
  Fantasy: "Kỳ ảo",
  "Film Noir": "Phim đen",
  History: "Lịch sử",
  Horror: "Kinh dị",
  Music: "Âm nhạc",
  Musical: "Nhạc kịch",
  Mystery: "Bí ẩn",
  Romance: "Lãng mạn",
  "Sci-Fi": "Khoa học viễn tưởng",
  Sport: "Thể thao",
  Thriller: "Gay cấn",
  War: "Chiến tranh",
  Western: "Cao bồi",
};

/**
 * Dịch genre từ tiếng Anh sang tiếng Việt
 * Ví dụ: "Action, Sci-Fi" → "Hành động, Khoa học viễn tưởng"
 */
export function translateGenre(genreStr) {
  if (!genreStr) return "";
  return genreStr
    .split(",")
    .map((g) => {
      const trimmed = g.trim();
      return GENRE_MAP[trimmed] || trimmed;
    })
    .join(", ");
}
