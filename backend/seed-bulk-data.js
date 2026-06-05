// ═══════════════════════════════════════════════════════════════
// 🚀 Seed Bulk Data — Sinh dữ liệu lớn cho Databricks Training
// ═══════════════════════════════════════════════════════════════
//
// Script này sinh dữ liệu giả cho các bảng:
//   users (200), watchhistory (5000+), favorites (1000+),
//   reviews (2000+), transactions (3000+), support_messages (500+)
//
// ✅ Cách dùng:
//   1. Đảm bảo DATABRICKS_HOST, PATH, TOKEN trong .env
//   2. Chạy: node backend/seed-bulk-data.js
//
// ⚠️ Lưu ý: Databricks CE SQL warehouse KHÔNG hỗ trợ INSERT/UPDATE/DELETE.
//   Nếu dùng CE, hãy dùng script export-csv-for-databricks.js thay thế.
// ═══════════════════════════════════════════════════════════════

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { getSession } = require("./db");

// ==============================================================
// 1. DỮ LIỆU MẪU
// ==============================================================

const FIRST_NAMES = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ",
  "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Mai", "Hà", "Đinh",
  "Trương", "Tô", "Tạ", "Cao", "Lâm", "Lương", "Thái", "Trịnh", "Đoàn",
];

const MIDDLE_NAMES = [
  "Văn", "Hữu", "Đức", "Minh", "Quốc", "Công", "Hoàng", "Gia", "Bảo",
  "Thị", "Kim", "Ngọc", "Thanh", "Hồng", "Phương", "Khánh", "Yến", "Mộng",
];

const LAST_NAMES_MALE = [
  "Anh", "Bình", "Cường", "Dũng", "Đạt", "Hải", "Hiếu", "Hùng", "Khoa",
  "Long", "Mạnh", "Nam", "Phong", "Quân", "Sơn", "Tài", "Thắng", "Trí",
  "Tuấn", "Việt", "Vinh", "Duy", "Khánh", "Lâm", "Phú", "Quang", "Tâm",
  "Tiến", "Trung", "Tùng",
];

const LAST_NAMES_FEMALE = [
  "An", "Chi", "Dung", "Hà", "Hằng", "Hoa", "Hương", "Lan", "Linh",
  "Mai", "My", "Nga", "Ngân", "Ngọc", "Nhi", "Như", "Phương", "Quỳnh",
  "Thảo", "Thùy", "Trang", "Tuyết", "Vân", "Vy", "Yến", "Thu", "Hiền",
  "Trinh", "Oanh", "Giang",
];

const REVIEW_COMMENTS = [
  "Phim hay tuyệt vời! Nội dung cuốn hút từ đầu đến cuối.",
  "Diễn xuất xuất sắc, đặc biệt là vai chính.",
  "Một bộ phim đáng xem, kịch bản chặt chẽ.",
  "Hiệu ứng đẹp mắt, âm thanh sống động như rạp chiếu.",
  "Phim hơi dài nhưng rất đáng để xem hết.",
  "Tuyệt phẩm! Không thể bỏ qua nếu bạn yêu thích thể loại này.",
  "Xem một lần là nghiền, đã xem đi xem lại nhiều lần.",
  "Nội dung sâu sắc, nhiều bài học ý nghĩa.",
  "Phim giải trí nhẹ nhàng, phù hợp xem cuối tuần.",
  "Kịch bản có nhiều nút thắt bất ngờ, rất hấp dẫn.",
  "Đạo diễn đã làm rất tốt, cảnh quay đẹp mê hồn.",
  "Một trải nghiệm điện ảnh tuyệt vời, 10/10.",
  "Phim cảm động, nước mắt rơi lúc nào không hay.",
  "Rất đáng đồng tiền bát gạo, sẽ mua vé xem tiếp phần 2.",
  "Âm nhạc trong phim quá hay, nghe nghiền ngay bài OST.",
  "Không gian phim đẹp, tái hiện chân thực bối cảnh.",
  "Diễn viên phụ cũng diễn xuất rất tốt, không thua kém vai chính.",
  "Có thể xem cùng gia đình, phim mang nhiều thông điệp tích cực.",
  "Phim hơi đáng sợ nhưng rất cuốn hút.",
  "Tình tiết gây cấn, không thể rời mắt khỏi màn hình.",
  "Một kiệt tác điện ảnh, xứng đáng với mọi lời khen.",
  "Xem xong muốn xem lại ngay, nghiện mất rồi.",
  "Phim hài hước, xả stress cực tốt.",
  "Kết phim bất ngờ, không đoán trước được.",
  "Màu sắc và ánh sáng trong phim được xử lý rất chuyên nghiệp.",
];

const SUPPORT_MESSAGES_USER = [
  "Tôi không thể xem được phim, bị lỗi khi tải.",
  "Làm thế nào để nạp tiền vào ví?",
  "Tôi đã mua phim nhưng không thấy trong danh sách của tôi.",
  "Ứng dụng bị lag khi xem phim, mong admin fix sớm.",
  "Tôi quên mật khẩu, làm sao để lấy lại?",
  "Sao phim này có phụ đề tiếng Việt không ạ?",
  "Tôi muốn hủy giao dịch vừa nãy, có được không?",
  "Chất lượng phim hơi thấp, có thể nâng lên HD không?",
  "Mã voucher của tôi hết hạn rồi, có gia hạn được không?",
  "Tôi không nhận được email xác nhận đăng ký.",
  "Số dư trong ví bị trừ sai, mong admin kiểm tra.",
  "Phim tải rất chậm, có cách nào cải thiện không?",
  "Giao diện web rất đẹp, admin làm tốt lắm!",
  "Có phim mới nào hot không admin?",
  "Tôi muốn xóa tài khoản của mình, giúp tôi với.",
];

const SUPPORT_REPLIES = [
  "Cảm ơn bạn đã liên hệ. Chúng tôi đang kiểm tra và sẽ phản hồi sớm nhất.",
  "Vấn đề của bạn đã được ghi nhận. Đội ngũ kỹ thuật sẽ xử lý trong 24h.",
  "Bạn vui lòng thử refresh trang hoặc đăng nhập lại nhé.",
  "Chúng tôi đã fix lỗi này. Cảm ơn bạn đã báo cáo!",
  "Thông tin của bạn đã được cập nhật. Vui lòng kiểm tra lại.",
  "Voucher của bạn vẫn còn hiệu lực. Thử nhập lại mã nhé!",
  "Đội ngũ support sẽ liên hệ bạn qua email trong thời gian sớm nhất.",
  "Cảm ơn bạn đã yêu thích dịch vụ của chúng tôi! ❤️",
];

// ==============================================================
// 2. HÀM TIỆN ÍCH
// ==============================================================

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPicks(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(startDaysAgo, endDaysAgo) {
  const now = new Date();
  const start = new Date(now.getTime() - startDaysAgo * 86400000);
  const end = new Date(now.getTime() - endDaysAgo * 86400000);
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function escapeSql(str) {
  return (str || "").replace(/'/g, "''");
}

// Databricks trả về column names ở uppercase, cần case-insensitive access
function getMovieId(movie) {
  if (!movie) return null;
  return movie.MovieID ?? movie.MOVIEID ?? movie.movieid ?? movie.movie_id ?? null;
}

function getMovieTitle(movie) {
  if (!movie) return 'Unknown';
  return movie.Title ?? movie.TITLE ?? movie.title ?? 'Unknown';
}

function getMoviePrice(movie) {
  if (!movie) return 0;
  return parseFloat(movie.Price ?? movie.PRICE ?? movie.price ?? 0) || 0;
}

function generateUserName(index) {
  const isMale = Math.random() > 0.5;
  const firstName = randomPick(FIRST_NAMES);
  const middleName = randomPick(MIDDLE_NAMES);
  const lastName = isMale ? randomPick(LAST_NAMES_MALE) : randomPick(LAST_NAMES_FEMALE);
  const name = `${firstName} ${middleName} ${lastName}`;
  const email = `${lastName.toLowerCase()}.${firstName.toLowerCase()}${index}@gmail.com`;
  return { name, email };
}

// ==============================================================
// 3. SINH DỮ LIỆU
// ==============================================================

function generateUsers(count, startId = 1) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const { name, email } = generateUserName(id);
    const password = "password123";
    const role = i < 2 ? "Admin" : "User"; // 2 admins
    users.push({ user_id: id, name, email, password, role });
  }
  return users;
}

function generateWatchHistory(users, movies, count) {
  const records = [];
  for (let i = 1; i <= count; i++) {
    const user = randomPick(users);
    const movie = randomPick(movies);
    const movieId = getMovieId(movie);
    if (!movieId) continue;
    const watchTime = randomInt(5, 180);
    const rating = randomInt(1, 5);
    const createdAt = randomDate(90, 1);
    records.push({
      user_id: user.user_id,
      movie_id: movieId,
      watch_time: watchTime,
      rating,
      created_at: createdAt,
    });
  }
  return records;
}

function generateFavorites(users, movies, maxFavoritesPerUser) {
  const records = [];
  for (const user of users) {
    const favCount = randomInt(0, maxFavoritesPerUser);
    const favMovies = randomPicks(movies, favCount);
    for (const movie of favMovies) {
      const movieId = getMovieId(movie);
      if (!movieId) continue;
      records.push({
        user_id: user.user_id,
        movie_id: movieId,
        created_at: randomDate(90, 1),
      });
    }
  }
  return records;
}

function generateReviews(users, movies, maxReviewsPerUser) {
  const records = [];
  const usedPairs = new Set();
  for (const user of users) {
    const reviewCount = randomInt(0, maxReviewsPerUser);
    const reviewedMovies = randomPicks(movies, reviewCount);
    for (const movie of reviewedMovies) {
      const movieId = getMovieId(movie);
      if (!movieId) continue;
      const pair = `${user.user_id}-${movieId}`;
      if (usedPairs.has(pair)) continue;
      usedPairs.add(pair);
      records.push({
        user_id: user.user_id,
        movie_id: movieId,
        rating: randomInt(1, 5),
        comment: randomPick(REVIEW_COMMENTS),
        created_at: randomDate(90, 1),
      });
    }
  }
  return records;
}

function generateTransactions(users, movies) {
  const records = [];

  // Topup transactions — mỗi user topup 2-8 lần
  for (const user of users) {
    const topupCount = randomInt(2, 8);
    for (let i = 0; i < topupCount; i++) {
      const amount = randomFloat(5, 100);
      const createdAt = randomDate(90, 1);
      records.push({
        user_id: user.user_id,
        amount,
        type: "topup",
        description: `Nạp $${amount}`,
        voucher_id: null,
        created_at: createdAt,
      });
    }
  }

  // Purchase transactions — mỗi user mua 1-10 phim
  for (const user of users) {
    const purchaseCount = randomInt(1, 10);
    const purchasedMovies = randomPicks(movies, purchaseCount);
    for (const movie of purchasedMovies) {
      const price = getMoviePrice(movie) || randomFloat(2.99, 5.99);
      const createdAt = randomDate(90, 1);
      records.push({
        user_id: user.user_id,
        amount: -price,
        type: "purchase",
        description: `Phim: ${getMovieTitle(movie)}`,
        voucher_id: null,
        created_at: createdAt,
      });
    }
  }

  return records;
}

function generateSupportMessages(users) {
  const records = [];
  for (const user of users) {
    const msgCount = randomInt(0, 5);
    if (msgCount === 0) continue;
    for (let i = 0; i < msgCount; i++) {
      const msg = randomPick(SUPPORT_MESSAGES_USER);
      const createdAt = randomDate(90, 1);
      records.push({
        user_id: user.user_id,
        sender_type: "user",
        message: msg,
        created_at: createdAt,
      });
      // Auto reply from admin (80% chance)
      if (Math.random() < 0.8) {
        const reply = randomPick(SUPPORT_REPLIES);
        const replyTime = new Date(new Date(createdAt).getTime() + randomInt(1, 60) * 60000)
          .toISOString().replace('T', ' ').slice(0, 19);
        records.push({
          user_id: user.user_id,
          sender_type: "admin",
          message: reply,
          created_at: replyTime,
        });
      }
    }
  }
  return records;
}

// ==============================================================
// 4. HÀM INSERT VÀO DATABRICKS
// ==============================================================

async function insertUsers(session, users) {
  console.log("👤 Đang insert users...");
  let count = 0;
  const BATCH = 20;
  for (let i = 0; i < users.length; i += BATCH) {
    const batch = users.slice(i, i + BATCH);
    let sql = "INSERT INTO workspace.netflixdb.users (UserID, Name, Email, Password, Role) VALUES ";
    const values = batch.map(u =>
      `(${u.user_id}, '${escapeSql(u.name)}', '${escapeSql(u.email)}', '${escapeSql(u.password)}', '${u.role}')`
    );
    sql += values.join(", ");
    try {
      await session.executeStatement(sql);
      count += batch.length;
      process.stdout.write(`\r  ✅ ${count} users inserted`);
    } catch (err) {
      console.error(`\n  ❌ Lỗi insert users batch: ${err.message}`);
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} users`);
  return count;
}

async function insertWatchHistory(session, records) {
  console.log("\n📺 Đang insert watch history...");
  let count = 0;
  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    let sql = "INSERT INTO workspace.netflixdb.watchhistory (UserID, MovieID, WatchTime, Rating, CreatedAt) VALUES ";
    const values = batch.map(r =>
      `(${r.user_id}, ${r.movie_id}, ${r.watch_time}, ${r.rating}, '${r.created_at}')`
    );
    sql += values.join(", ");
    try {
      await session.executeStatement(sql);
      count += batch.length;
      process.stdout.write(`\r  ✅ ${count} records inserted`);
    } catch (err) {
      console.error(`\n  ❌ Lỗi insert watch history batch: ${err.message}`);
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} watch history records`);
  return count;
}

async function insertFavorites(session, records) {
  console.log("\n❤️ Đang insert favorites...");
  let count = 0;
  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    let sql = "INSERT INTO workspace.netflixdb.favorites (UserID, MovieID, CreatedAt) VALUES ";
    const values = batch.map(r =>
      `(${r.user_id}, ${r.movie_id}, '${r.created_at}')`
    );
    sql += values.join(", ");
    try {
      await session.executeStatement(sql);
      count += batch.length;
      process.stdout.write(`\r  ✅ ${count} records inserted`);
    } catch (err) {
      console.error(`\n  ❌ Lỗi insert favorites batch: ${err.message}`);
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} favorites`);
  return count;
}

async function insertReviews(session, records) {
  console.log("\n⭐ Đang insert reviews...");
  let count = 0;
  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    let sql = "INSERT INTO workspace.netflixdb.reviews (MovieID, UserID, Rating, Comment, CreatedAt) VALUES ";
    const values = batch.map(r =>
      `(${r.movie_id}, ${r.user_id}, ${r.rating}, '${escapeSql(r.comment)}', '${r.created_at}')`
    );
    sql += values.join(", ");
    try {
      await session.executeStatement(sql);
      count += batch.length;
      process.stdout.write(`\r  ✅ ${count} records inserted`);
    } catch (err) {
      console.error(`\n  ❌ Lỗi insert reviews batch: ${err.message}`);
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} reviews`);
  return count;
}

async function insertTransactions(session, records) {
  console.log("\n💳 Đang insert transactions...");
  let count = 0;
  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    let sql = "INSERT INTO workspace.netflixdb.transactions (UserID, Amount, Type, Description, VoucherID, CreatedAt) VALUES ";
    const values = batch.map(r =>
      `(${r.user_id}, ${r.amount}, '${r.type}', '${escapeSql(r.description)}', ${r.voucher_id !== null ? r.voucher_id : 'NULL'}, '${r.created_at}')`
    );
    sql += values.join(", ");
    try {
      await session.executeStatement(sql);
      count += batch.length;
      process.stdout.write(`\r  ✅ ${count} records inserted`);
    } catch (err) {
      console.error(`\n  ❌ Lỗi insert transactions batch: ${err.message}`);
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} transactions`);
  return count;
}

async function insertUserPurchases(session, records) {
  console.log("\n🎬 Đang insert user purchases...");
  let count = 0;
  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    let sql = "INSERT INTO workspace.netflixdb.userpurchases (UserID, MovieID, Price, CreatedAt) VALUES ";
    const values = batch.map(r =>
      `(${r.user_id}, ${r.movie_id}, ${r.price}, '${r.created_at}')`
    );
    sql += values.join(", ");
    try {
      await session.executeStatement(sql);
      count += batch.length;
      process.stdout.write(`\r  ✅ ${count} records inserted`);
    } catch (err) {
      console.error(`\n  ❌ Lỗi insert user purchases batch: ${err.message}`);
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} user purchases`);
  return count;
}

async function insertSupportMessages(session, records) {
  console.log("\n💬 Đang insert support messages...");
  let count = 0;
  const BATCH = 50;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    let sql = "INSERT INTO workspace.netflixdb.support_messages (UserID, SenderType, Message, CreatedAt) VALUES ";
    const values = batch.map(r =>
      `(${r.user_id}, '${r.sender_type}', '${escapeSql(r.message)}', '${r.created_at}')`
    );
    sql += values.join(", ");
    try {
      await session.executeStatement(sql);
      count += batch.length;
      process.stdout.write(`\r  ✅ ${count} records inserted`);
    } catch (err) {
      console.error(`\n  ❌ Lỗi insert support messages batch: ${err.message}`);
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} support messages`);
  return count;
}

function generateUserPurchases(users, movies) {
  const records = [];
  const usedPairs = new Set();
  for (const user of users) {
    const purchaseCount = randomInt(1, 10);
    const purchasedMovies = randomPicks(movies, purchaseCount);
    for (const movie of purchasedMovies) {
      const movieId = getMovieId(movie);
      if (!movieId) continue;
      const pair = `${user.user_id}-${movieId}`;
      if (usedPairs.has(pair)) continue;
      usedPairs.add(pair);
      const price = getMoviePrice(movie) || randomFloat(2.99, 5.99);
      records.push({
        user_id: user.user_id,
        movie_id: movieId,
        price,
        created_at: randomDate(90, 1),
      });
    }
  }
  return records;
}

// ==============================================================
// 5. CẬP NHẬT WALLET & USER PURCHASES
// ==============================================================

async function updateWallets(session, users) {
  console.log("\n💰 Đang cập nhật wallet balances...");
  let count = 0;
  for (const user of users) {
    const balance = randomFloat(0, 200);
    try {
      await session.executeStatement(`
        INSERT INTO workspace.netflixdb.wallet (UserID, Balance)
        VALUES (${user.user_id}, ${balance})
      `);
      count++;
      if (count % 50 === 0) process.stdout.write(`\r  ✅ ${count} wallets updated`);
    } catch (err) {
      // Wallet might already exist
      try {
        await session.executeStatement(`
          UPDATE workspace.netflixdb.wallet SET Balance = ${balance}
          WHERE UserID = ${user.user_id}
        `);
        count++;
      } catch (e) {
        // Skip
      }
    }
  }
  console.log(`\n  ✅ Hoàn tất: ${count} wallets`);
  return count;
}

// ==============================================================
// 6. MAIN
// ==============================================================

async function main() {
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║   🚀 SEED BULK DATA — Netflix Databricks Training ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  // Lấy danh sách movies hiện có
  const session = await getSession();
  console.log("📡 Đã kết nối Databricks SQL warehouse\n");

  // Đọc movies hiện có
  const moviesQuery = await session.executeStatement(
    "SELECT MovieID, Title, Price FROM workspace.netflixdb.movies ORDER BY MovieID"
  );
  const movies = await moviesQuery.fetchAll();
  await moviesQuery.close();

  if (movies.length === 0) {
    console.error("❌ Không có movie nào trong database! Chạy seed-movies.js trước.");
    await session.close();
    process.exit(1);
  }
  console.log(`🎬 Đã tìm thấy ${movies.length} movies\n`);

  // Đọc max UserID hiện tại để tránh conflict
  console.log("🔍 Đang kiểm tra UserID hiện tại...");
  let startUserId = 1;
  try {
    const maxUserQuery = await session.executeStatement(
      "SELECT COALESCE(MAX(UserID), 0) as maxId FROM workspace.netflixdb.users"
    );
    const maxUserResult = await maxUserQuery.fetchAll();
    await maxUserQuery.close();
    startUserId = Number(maxUserResult[0]?.maxId) + 1;
    console.log(`📊 Max UserID hiện tại: ${startUserId - 1}, sẽ bắt đầu từ: ${startUserId}`);
  } catch (e) {
    console.log(`📊 Không có users hiện có, bắt đầu từ ID 1`);
  }

  // Sinh dữ liệu
  console.log("🔄 Đang sinh dữ liệu...\n");

  const userCount = 200;
  const watchHistoryCount = 7000;
  const maxFavoritesPerUser = 15;
  const maxReviewsPerUser = 10;

  const users = generateUsers(userCount, startUserId);
  const watchHistory = generateWatchHistory(users, movies, watchHistoryCount);
  const favorites = generateFavorites(users, movies, maxFavoritesPerUser);
  const reviews = generateReviews(users, movies, maxReviewsPerUser);
  const transactions = generateTransactions(users, movies);
  const userPurchases = generateUserPurchases(users, movies);
  const supportMessages = generateSupportMessages(users);

  console.log(`📊 Tổng quan dữ liệu sẽ insert:`);
  console.log(`   👤 Users:           ${users.length}`);
  console.log(`   📺 Watch History:   ${watchHistory.length}`);
  console.log(`   ❤️ Favorites:       ${favorites.length}`);
  console.log(`   ⭐ Reviews:         ${reviews.length}`);
  console.log(`   💳 Transactions:    ${transactions.length}`);
  console.log(`   🎬 User Purchases:  ${userPurchases.length}`);
  console.log(`   💬 Support Messages: ${supportMessages.length}`);
  console.log(`   💰 Wallets:         ${users.length}`);
  console.log("");

  // Insert vào Databricks
  await insertUsers(session, users);
  await insertWatchHistory(session, watchHistory);
  await insertFavorites(session, favorites);
  await insertReviews(session, reviews);
  await insertTransactions(session, transactions);
  await insertUserPurchases(session, userPurchases);
  await insertSupportMessages(session, supportMessages);
  await updateWallets(session, users);

  // Verify
  console.log("\n\n📊 === VERIFY ===");
  const tables = ["users", "movies", "watchhistory", "favorites", "reviews", "transactions", "userpurchases", "wallet", "support_messages"];
  for (const table of tables) {
    try {
      const q = await session.executeStatement(`SELECT COUNT(*) as cnt FROM workspace.netflixdb.${table}`);
      const r = await q.fetchAll();
      await q.close();
      console.log(`   📊 ${table.padEnd(18)}: ${r[0]?.cnt || 0}`);
    } catch (e) {
      console.log(`   📊 ${table.padEnd(18)}: ❌ Error`);
    }
  }

  await session.close();
  console.log("\n🎉 Hoàn tất! Dữ liệu đã sẵn sàng cho Databricks training!");
  console.log("📌 Export CSV: node backend/export-csv-for-databricks.js");
}

main().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
