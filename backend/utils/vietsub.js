/* ===== VietSub — dịch thông tin phim sang tiếng Việt ===== */

const GENRE_MAP = {
    "Action": "Hành động",
    "Adventure": "Phiêu lưu",
    "Animation": "Hoạt hình",
    "Biography": "Tiểu sử",
    "Comedy": "Hài hước",
    "Crime": "Tội phạm",
    "Documentary": "Tài liệu",
    "Drama": "Chính kịch",
    "Family": "Gia đình",
    "Fantasy": "Kỳ ảo",
    "Film Noir": "Phim đen",
    "History": "Lịch sử",
    "Horror": "Kinh dị",
    "Music": "Âm nhạc",
    "Musical": "Nhạc kịch",
    "Mystery": "Bí ẩn",
    "Romance": "Lãng mạn",
    "Sci-Fi": "Khoa học viễn tưởng",
    "Sport": "Thể thao",
    "Thriller": "Gay cấn",
    "War": "Chiến tranh",
    "Western": "Cao bồi",
};

/**
 * Dịch genre từ tiếng Anh sang tiếng Việt
 * Ví dụ: "Action, Sci-Fi" → "Hành động, Khoa học viễn tưởng"
 */
function translateGenre(genreStr) {
    if (!genreStr || genreStr === "N/A") return "";
    return genreStr
        .split(",")
        .map((g) => {
            const trimmed = g.trim();
            return GENRE_MAP[trimmed] || trimmed;
        })
        .join(", ");
}

/**
 * Dịch văn bản bằng MyMemory API (free, 50k ký tự/ngày)
 * Dùng email để tăng limit lên 50k/ngày
 */
async function translateText(text, source = "en", target = "vi") {
    if (!text || text === "N/A") return text;

    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}&de=demo@codebuff.com`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        }
        return text; // fallback về gốc nếu lỗi
    } catch (err) {
        console.error("Loi dich MyMemory:", err.message);
        return text;
    }
}

/**
 * Nhận data từ OMDb, trả về object chứa các trường đã dịch
 */
async function vietsubMovie(omdbData) {
    if (!omdbData) return {};

    const vi = {};

    // Genre — dùng map tĩnh (nhanh, chính xác)
    vi.GenreVI = translateGenre(omdbData.Genre);

    // Plot — cần dịch bằng API
    vi.PlotVI = await translateText(omdbData.Plot);

    return vi;
}

module.exports = { translateGenre, translateText, vietsubMovie, GENRE_MAP };
