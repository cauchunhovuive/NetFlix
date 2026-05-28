// ⚠️ LƯU Ý: Script này KHÔNG hoạt động trên Databricks Community Edition!
// Databricks CE SQL warehouse không hỗ trợ INSERT/UPDATE/DELETE.
// Script sẽ chạy "thành công" (không báo lỗi) nhưng data KHÔNG được lưu.
//
// ✅ Cách dùng đúng:
//   Cách 1: Copy nội dung backend/seed-sql.sql vào Databricks SQL Editor → Run
//   Cách 2: Upload backend/seed-new-movies.csv lên Databricks Volume → COPY INTO

require("dotenv").config();
const { getSession } = require("./db");

const NEW_MOVIES = [
  // === ACTION ===
  { title: "The Avengers", genre: "Action, Sci-Fi", description: "Biệt đội siêu anh hùng hội tụ để bảo vệ Trái Đất khỏi thần Loki và đội quân Chitauri.", price: 4.99, tmdb_id: 24428 },
  { title: "John Wick", genre: "Action, Thriller", description: "Sát thủ huyền thoại trở lại sau khi chú chó nhỏ bị sát hại.", price: 3.99, tmdb_id: 245891 },
  { title: "Mad Max: Fury Road", genre: "Action, Sci-Fi", description: "Trong thế giới hậu tận thế, Max giúp Furiosa vượt sa mạc để thoát khỏi tay bạo chúa.", price: 4.99, tmdb_id: 76341 },
  { title: "Gladiator", genre: "Action, Drama", description: "Tướng quân La Mã Maximus bị phản bội và trở thành đấu sĩ giác đấu.", price: 3.99, tmdb_id: 98 },
  { title: "The Dark Knight Rises", genre: "Action, Crime", description: "Batman đối mặt với gã khổng lồ Bane đang đe dọa hủy diệt Gotham.", price: 4.99, tmdb_id: 49026 },

  // === SCI-FI ===
  { title: "Interstellar", genre: "Sci-Fi, Drama", description: "Phi hành đoàn du hành qua lỗ sâu để tìm hành tinh mới cho nhân loại.", price: 4.99, tmdb_id: 157336 },
  { title: "The Matrix", genre: "Sci-Fi, Action", description: "Hacker Neo phát hiện thế giới thực chỉ là mô phỏng ảo do máy móc tạo ra.", price: 3.99, tmdb_id: 603 },
  { title: "Arrival", genre: "Sci-Fi, Drama", description: "Nhà ngôn ngữ học đối thoại với người ngoài hành tinh để ngăn chặn thảm họa.", price: 3.99, tmdb_id: 329865 },
  { title: "Blade Runner 2049", genre: "Sci-Fi, Drama", description: "K sĩ truy tìm bí mật bị chôn vùi có thể phá vỡ trật tự xã hội.", price: 4.99, tmdb_id: 335984 },
  { title: "Dune", genre: "Sci-Fi, Adventure", description: "Paul Atreides khám phá sức mạnh trên hành tinh sa mạc Arrakis.", price: 5.99, tmdb_id: 438631 },

  // === HORROR ===
  { title: "The Conjuring", genre: "Horror, Thriller", description: "Nhà điều tra siêu nhiên Ed và Lorraine Warren giải cứu gia đình khỏi ám ảnh.", price: 3.99, tmdb_id: 138843 },
  { title: "Hereditary", genre: "Horror, Drama", description: "Bí mật đen tối của dòng họ dần lộ diện sau cái chết của người bà.", price: 3.99, tmdb_id: 493922 },
  { title: "Get Out", genre: "Horror, Mystery", description: "Chàng trai da màu đến thăm nhà bạn gái và phát hiện âm mưu kinh hoàng.", price: 3.99, tmdb_id: 419430 },
  { title: "The Exorcist", genre: "Horror, Drama", description: "Cô bé bị quỷ ám và cuộc trừ tà đầy ám ảnh.", price: 2.99, tmdb_id: 9552 },
  { title: "A Quiet Place", genre: "Horror, Drama", description: "Gia đình sống trong im lặng để tránh quái vật săn mồi bằng âm thanh.", price: 3.99, tmdb_id: 447332 },

  // === DRAMA ===
  { title: "The Shawshank Redemption", genre: "Drama", description: "Ngân hàng viên Andy Dufresne bị kết án oan và vạch kế hoạch vượt ngục tài tình.", price: 2.99, tmdb_id: 278 },
  { title: "Forrest Gump", genre: "Drama, Romance", description: "Chàng trai chất phác kể lại cuộc đời kỳ diệu với những sự kiện lịch sử nước Mỹ.", price: 3.99, tmdb_id: 13 },
  { title: "The Godfather", genre: "Crime, Drama", description: "Câu chuyện về gia đình mafia Corleone dưới thời Don Vito và Michael.", price: 2.99, tmdb_id: 238 },
  { title: "Parasite", genre: "Drama, Thriller", description: "Gia đình nghèo khéo léo len lỏi vào biệt thự của nhà giàu.", price: 4.99, tmdb_id: 496243 },
  { title: "Oppenheimer", genre: "Drama, History", description: "Cha đẻ của bom nguyên tử đối mặt với lương tâm sau khi tạo ra vũ khí hủy diệt.", price: 5.99, tmdb_id: 872585 },
  { title: "La La Land", genre: "Drama, Romance", description: "Chuyện tình lãng mạn giữa diễn viên khao khát và nghệ sĩ piano jazz.", price: 3.99, tmdb_id: 313369 },

  // === ANIMATION ===
  { title: "Spirited Away", genre: "Animation, Adventure", description: "Cô bé Chihiro lạc vào thế giới thần linh và phải giải cứu cha mẹ.", price: 2.99, tmdb_id: 129 },
  { title: "The Lion King", genre: "Animation, Drama", description: "Sư tử Simba trở về giành lại vương quốc từ tay người chú độc ác.", price: 2.99, tmdb_id: 8587 },
  { title: "Toy Story", genre: "Animation, Comedy", description: "Đồ chơi của cậu bé Andy có cuộc sống bí mật khi không có người.", price: 2.99, tmdb_id: 862 },
  { title: "Spider-Man: Across the Spider-Verse", genre: "Animation, Action", description: "Miles Morales du hành đa vũ trụ gặp gỡ các Người Nhện khác.", price: 5.99, tmdb_id: 569094 },
  { title: "Your Name", genre: "Animation, Romance", description: "Hai học sinh trung học hoán đổi cơ thể và kết nối qua thời gian.", price: 3.99, tmdb_id: 378064 },
  { title: "Coco", genre: "Animation, Adventure", description: "Cậu bé Miguel khám phá thế giới người chết để tìm lại tổ tiên.", price: 3.99, tmdb_id: 354912 },
  { title: "Howl's Moving Castle", genre: "Animation, Fantasy", description: "Cô gái trẻ Sophie bị biến thành bà già và gia nhập lâu đài di động của phù thủy Howl.", price: 2.99, tmdb_id: 4935 },

  // === COMEDY ===
  { title: "The Grand Budapest Hotel", genre: "Comedy, Drama", description: "Người quản lý khách sạn huyền thoại và vụ trộm tranh nổi tiếng.", price: 3.99, tmdb_id: 120467 },
  { title: "Superbad", genre: "Comedy", description: "Ba nam sinh trung học cố gắng mua rượu cho bữa tiệc cuối năm.", price: 3.99, tmdb_id: 8363 },
  { title: "Deadpool", genre: "Comedy, Action", description: "Siêu anh hùng lắm mồm với khả năng tự chữa lành và khiếu hài hước độc đáo.", price: 3.99, tmdb_id: 293660 },
  { title: "Everything Everywhere All at Once", genre: "Comedy, Sci-Fi", description: "Bà chủ tiệm giặt ủi khám phá đa vũ trụ và cứu thế giới.", price: 5.99, tmdb_id: 545611 },
  { title: "Home Alone", genre: "Comedy, Family", description: "Cậu bé Kevin bị bỏ quên ở nhà và bảo vệ ngôi nhà khỏi hai tên trộm.", price: 2.99, tmdb_id: 771 },

  // === ROMANCE ===
  { title: "Titanic", genre: "Romance, Drama", description: "Chuyện tình bi thương giữa Jack và Rose trên con tàu định mệnh.", price: 3.99, tmdb_id: 597 },
  { title: "The Notebook", genre: "Romance, Drama", description: "Tình yêu vượt thời gian và rào cản xã hội của Noah và Allie.", price: 2.99, tmdb_id: 11036 },
  { title: "Eternal Sunshine of the Spotless Mind", genre: "Romance, Sci-Fi", description: "Cặp đôi xóa ký ức về nhau nhưng tình yêu vẫn tìm đường trở lại.", price: 3.99, tmdb_id: 38 },
  { title: "Before Sunrise", genre: "Romance, Drama", description: "Chàng trai Mỹ và cô gái Pháp gặp nhau trên tàu và khám phá Vienna suốt đêm.", price: 2.99, tmdb_id: 76 },
  { title: "Crazy Rich Asians", genre: "Romance, Comedy", description: "Cô gái trẻ về Singapore gặp gia đình tỷ phú của bạn trai.", price: 3.99, tmdb_id: 509967 },

  // === CRIME/THRILLER ===
  { title: "Pulp Fiction", genre: "Crime, Drama", description: "Những câu chuyện đan xen của xã hội đen, võ sĩ quyền anh và băng cướp.", price: 3.99, tmdb_id: 680 },
  { title: "Se7en", genre: "Crime, Thriller", description: "Hai thám tử truy tìm kẻ giết người hàng loạt lấy 7 tội lỗi chết người làm chủ đề.", price: 3.99, tmdb_id: 807 },
  { title: "The Silence of the Lambs", genre: "Crime, Thriller", description: "Nữ thám tử FBI phải nhờ sự giúp đỡ của kẻ giết người hàng loạt Hannibal Lecter.", price: 2.99, tmdb_id: 274 },
  { title: "Inception", genre: "Thriller, Sci-Fi", description: "Kẻ trộm giấc mơ thực hiện vụ đánh cắp ý tưởng bất khả thi.", price: 4.99, tmdb_id: 27205 },
  { title: "Gone Girl", genre: "Thriller, Drama", description: "Người chồng trở thành nghi phạm chính khi vợ mất tích bí ẩn.", price: 3.99, tmdb_id: 210577 },
  { title: "Fight Club", genre: "Drama, Thriller", description: "Nhân viên văn phòng mất ngủ thành lập câu lạc bộ đánh nhau bí mật.", price: 3.99, tmdb_id: 550 },

  // === WAR/HISTORY ===
  { title: "Saving Private Ryan", genre: "War, Drama", description: "Đại đội lính Mỹ xâm nhập chiến tuyến để giải cứu người lính cuối cùng.", price: 3.99, tmdb_id: 857 },
  { title: "Schindler's List", genre: "History, Drama", description: "Doanh nhân Đức cứu hơn 1000 người Do Thái khỏi Holocaust.", price: 2.99, tmdb_id: 424 },
  { title: "1917", genre: "War, Drama", description: "Hai lính trẻ chạy đua với thời gian để ngăn cuộc tấn công thảm khốc.", price: 4.99, tmdb_id: 530915 },
  { title: "The Pianist", genre: "War, Drama", description: "Nghệ sĩ dương cầm Ba Lan vật lộn tồn tại ở Warsaw trong Thế chiến II.", price: 3.99, tmdb_id: 423 },
  { title: "Dunkirk", genre: "War, Action", description: "Cuộc di tản anh hùng của 330,000 lính Đồng minh khỏi bãi biển Dunkirk.", price: 4.99, tmdb_id: 374720 },

  // === FANTASY/ADVENTURE ===
  { title: "Harry Potter and the Sorcerer's Stone", genre: "Fantasy, Adventure", description: "Cậu bé Harry Potter khám phá trường phù thủy Hogwarts và bí mật dòng họ.", price: 3.99, tmdb_id: 671 },
  { title: "The Lord of the Rings: The Fellowship of the Ring", genre: "Fantasy, Adventure", description: "Frodo Baggins và đoàn hộ nhẫn bắt đầu hành trình tiêu hủy chiếc nhẫn.", price: 4.99, tmdb_id: 120 },
  { title: "Avatar", genre: "Adventure, Sci-Fi", description: "Lính thủy đánh bộ ngồi xe lăn hòa nhập vào thế giới Pandora xanh.", price: 4.99, tmdb_id: 19995 },
  { title: "Jurassic Park", genre: "Adventure, Sci-Fi", description: "Công viên khủng long trở thành cơn ác mộng khi bọn khủng long thoát ra.", price: 2.99, tmdb_id: 329 },
  { title: "Pirates of the Caribbean: The Curse of the Black Pearl", genre: "Adventure, Action", description: "Cướp biển Jack Sparrow và thủy thủ đoàn đối mặt với xác sống.", price: 3.99, tmdb_id: 22 },
];

async function main() {
  const session = await getSession();

  // Get max existing MovieID
  const maxQuery = await session.executeStatement(
    "SELECT COALESCE(MAX(MovieID), 0) as maxId FROM workspace.netflixdb.movies"
  );
  const maxResult = await maxQuery.fetchAll();
  await maxQuery.close();
  const startId = Number(maxResult[0]?.maxId) || 20;
  console.log(`📊 Max MovieID hiện tại: ${startId}`);

  let success = 0;
  let errors = 0;

  for (let i = 0; i < NEW_MOVIES.length; i++) {
    const m = NEW_MOVIES[i];
    const movieId = startId + 1 + i;
    try {
      const sql = `
        INSERT INTO workspace.netflixdb.movies (MovieID, Title, Genre, Description, Price, TMDB_ID)
        VALUES (${movieId}, '${m.title.replace(/'/g, "''")}', '${m.genre}', '${m.description.replace(/'/g, "''")}', ${m.price}, ${m.tmdb_id})
      `;
      await session.executeStatement(sql);
      console.log(`  ✅ ID ${movieId}: ${m.title} (${m.genre})`);
      success++;
    } catch (err) {
      console.error(`  ❌ ID ${movieId}: ${m.title} — ${err.message}`);
      errors++;
    }
  }

  // Verify
  const countQuery = await session.executeStatement(
    "SELECT COUNT(*) as cnt FROM workspace.netflixdb.movies"
  );
  const countResult = await countQuery.fetchAll();
  await countQuery.close();
  const total = countResult[0]?.cnt || 0;

  await session.close();
  console.log(`\n🎉 Hoàn tất! ${success} phim thêm thành công, ${errors} lỗi.`);
  console.log(`📊 Tổng số phim hiện tại: ${total}`);
}

main().catch((err) => {
  console.error("Lỗi:", err);
  process.exit(1);
});
