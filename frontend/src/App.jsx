import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:3000";

const BG_COLORS = ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#2b2d42", "#1b1b2f"];
const EMOJIS = ["🎬", "🎭", "🎥", "🍿", "🎞️", "🎦"];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("auth");
  const [tab, setTab] = useState("movies");
  const [authTab, setAuthTab] = useState("login");

  // Auth state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });

  // Data state
  const [movies, setMovies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filter state
  const [selectedGenre, setSelectedGenre] = useState("Tất cả");

  // Modal state
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchForm, setWatchForm] = useState({ watch_time: "", rating: "" });
  const [watchMsg, setWatchMsg] = useState({ text: "", type: "" });

  // Stream state
  const [streamUrl, setStreamUrl] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamMsg, setStreamMsg] = useState({ text: "", type: "" });

  // Player state
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    if (page === "main") {
      fetchMovies();
      fetchHistory();
    }
  }, [page]);

  async function fetchMovies() {
    setLoadingMovies(true);
    try {
      const res = await fetch(`${API}/movies`);
      setMovies(await res.json());
    } catch {
      setMovies([]);
    }
    setLoadingMovies(false);
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/history`);
      setHistory(await res.json());
    } catch {
      setHistory([]);
    }
    setLoadingHistory(false);
  }

  async function doLogin(e) {
    e.preventDefault();
    setAuthMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { setAuthMsg({ text: data.message || "Sai thông tin đăng nhập", type: "error" }); return; }
      setUser(data.user);
      setPage("main");
      setTab("movies");
    } catch {
      setAuthMsg({ text: "Không kết nối được server", type: "error" });
    }
  }

  async function doRegister(e) {
    e.preventDefault();
    setAuthMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) { setAuthMsg({ text: data.message || "Lỗi đăng ký", type: "error" }); return; }
      setAuthMsg({ text: "Đăng ký thành công! Hãy đăng nhập.", type: "success" });
      setTimeout(() => { setAuthTab("login"); setAuthMsg({ text: "", type: "" }); }, 1500);
    } catch {
      setAuthMsg({ text: "Không kết nối được server", type: "error" });
    }
  }

  async function doWatch() {
    const watch_time = parseInt(watchForm.watch_time);
    const rating = parseInt(watchForm.rating);
    if (!watch_time || !rating || rating < 1 || rating > 5) {
      setWatchMsg({ text: "Nhập thời gian và đánh giá hợp lệ (1-5)", type: "error" }); return;
    }
    try {
      const res = await fetch(`${API}/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.UserID, movie_id: selectedMovie.MovieID, watch_time, rating }),
      });
      if (res.ok) {
        setWatchMsg({ text: "Đã lưu lịch sử xem!", type: "success" });
        fetchHistory();
        setTimeout(() => { closeModal(); }, 1200);
      }
    } catch {
      setWatchMsg({ text: "Lỗi lưu dữ liệu", type: "error" });
    }
  }

  async function doWatchMovie() {
    setStreamLoading(true);
    setStreamMsg({ text: "", type: "" });
    setStreamUrl(null);
    try {
      const res = await fetch(
        `http://www.omdbapi.com/?t=${encodeURIComponent(selectedMovie.Title)}&apikey=5a5767ab`
      );
      const data = await res.json();

      if (data.Response === "False") {
        setStreamMsg({ text: "Không tìm thấy phim trên OMDb.", type: "error" });
        setStreamLoading(false);
        return;
      }

      setStreamMsg({
        text: `✅ ${data.Title} (${data.Year}) · IMDb: ${data.imdbRating}⭐ · ${data.Runtime} · ${data.Genre}`,
        type: "success"
      });

      if (data.Poster && data.Poster !== "N/A") {
        setStreamUrl(data.Poster);
      }
    } catch {
      setStreamMsg({ text: "Không kết nối được OMDb", type: "error" });
    }
    setStreamLoading(false);
  }

  function closeModal() {
    setSelectedMovie(null);
    setWatchMsg({ text: "", type: "" });
    setWatchForm({ watch_time: "", rating: "" });
    setStreamUrl(null);
    setStreamMsg({ text: "", type: "" });
    setStreamLoading(false);
    setPlayerOpen(false);
  }

  function doLogout() {
    setUser(null);
    setPage("auth");
    setLoginForm({ email: "", password: "" });
    setRegisterForm({ name: "", email: "", password: "" });
    setAuthMsg({ text: "", type: "" });
  }

  // Lấy danh sách genre không trùng
  const genres = ["Tất cả", ...new Set(movies.map(m => m.Genre).filter(Boolean))];

  // Lọc phim theo genre
  const filteredMovies = selectedGenre === "Tất cả"
    ? movies
    : movies.filter(m => m.Genre === selectedGenre);

  const avgRating = history.length ? (history.reduce((s, r) => s + (r.Rating || 0), 0) / history.length).toFixed(1) : "—";
  const totalMins = history.reduce((s, r) => s + (r.WatchTime || 0), 0);

  if (page === "auth") {
    return (
      <div className="auth-bg">
        <div className="auth-card">
          <div className="auth-logo">NETFLIX</div>

          <div className="auth-tabs">
            <button className={authTab === "login" ? "auth-tab active" : "auth-tab"} onClick={() => { setAuthTab("login"); setAuthMsg({ text: "", type: "" }); }}>Đăng nhập</button>
            <button className={authTab === "register" ? "auth-tab active" : "auth-tab"} onClick={() => { setAuthTab("register"); setAuthMsg({ text: "", type: "" }); }}>Đăng ký</button>
          </div>

          {authTab === "login" ? (
            <form onSubmit={doLogin} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="email@example.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input type="password" placeholder="••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary">Đăng nhập</button>
            </form>
          ) : (
            <form onSubmit={doRegister} className="auth-form">
              <div className="form-group">
                <label>Tên</label>
                <input placeholder="Nguyễn Văn A" value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="email@example.com" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input type="password" placeholder="••••••" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary">Đăng ký</button>
            </form>
          )}

          {authMsg.text && <div className={`msg ${authMsg.type}`}>{authMsg.text}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg">
      {/* Header */}
      <header className="header">
        <div className="logo">NETFLIX</div>
        <nav className="nav">
          {["movies", "history", "profile"].map(t => (
            <button key={t} className={tab === t ? "nav-btn active" : "nav-btn"} onClick={() => setTab(t)}>
              {t === "movies" ? "Phim" : t === "history" ? "Lịch sử" : "Tài khoản"}
            </button>
          ))}
        </nav>
        <div className="header-right">
          <span className="user-name">👤 {user?.Name}</span>
          <button className="btn-logout" onClick={doLogout}>Đăng xuất</button>
        </div>
      </header>

      <main className="main-content">
        {/* Movies Tab */}
        {tab === "movies" && (
          <div>
{/* Genre Filter Select */}
<div className="genre-select-wrap">
  <select
    className="genre-select"
    value={selectedGenre}
    onChange={e => setSelectedGenre(e.target.value)}
  >
    {genres.map(g => (
      <option key={g} value={g}>{g}</option>
    ))}
  </select>
</div>

            <p className="section-label">
              {selectedGenre === "Tất cả" ? "Tất cả phim" : selectedGenre} · {filteredMovies.length} phim
            </p>

            {loadingMovies ? <div className="loading">Đang tải...</div> : (
              <div className="movies-grid">
                {filteredMovies.map((m, i) => (
                  <div key={m.MovieID} className="movie-card" onClick={() => {
                    setSelectedMovie(m);
                    setWatchMsg({ text: "", type: "" });
                    setWatchForm({ watch_time: "", rating: "" });
                    setStreamUrl(null);
                    setStreamMsg({ text: "", type: "" });
                    setPlayerOpen(false);
                  }}>
                    <div className="movie-thumb" style={{ background: BG_COLORS[i % BG_COLORS.length] }}>
                      <span className="movie-emoji">{EMOJIS[i % EMOJIS.length]}</span>
                    </div>
                    <div className="movie-info">
                      <div className="movie-title">{m.Title}</div>
                      <div className="movie-genre">{m.Genre}</div>
                      <div className="movie-desc">{m.Description}</div>
                    </div>
                  </div>
                ))}
                {filteredMovies.length === 0 && (
                  <div className="loading">Không có phim nào trong thể loại này</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {tab === "history" && (
          <div>
            <div className="stats-row">
              <div className="stat-card"><div className="stat-label">Tổng lượt xem</div><div className="stat-value">{history.length}</div></div>
              <div className="stat-card"><div className="stat-label">Rating trung bình</div><div className="stat-value">{avgRating} ★</div></div>
              <div className="stat-card"><div className="stat-label">Tổng thời gian</div><div className="stat-value">{Math.round(totalMins / 60)}h {totalMins % 60}p</div></div>
            </div>
            <p className="section-label">Lịch sử xem</p>
            {loadingHistory ? <div className="loading">Đang tải...</div> : (
              <div className="history-list">
                {history.length === 0 && <div className="loading">Chưa có lịch sử xem</div>}
                {history.map(r => (
                  <div key={r.HistoryID} className="history-row">
                    <div className="avatar">{(r.Name || "U").slice(0, 2).toUpperCase()}</div>
                    <div className="h-info">
                      <div className="h-user">{r.Name}</div>
                      <div className="h-movie">{r.Title}</div>
                    </div>
                    <div className="h-meta">
                      <div className="h-rating">{"★".repeat(r.Rating || 0)}{"☆".repeat(5 - (r.Rating || 0))}</div>
                      <div className="h-time">{r.WatchTime} phút · {new Date(r.CreatedAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === "profile" && (
          <div>
            <p className="section-label">Tài khoản</p>
            <div className="profile-card">
              <div className="profile-avatar">{(user?.Name || "U").slice(0, 2).toUpperCase()}</div>
              <div className="profile-name">{user?.Name}</div>
              <div className="profile-email">{user?.Email}</div>
              <hr className="profile-sep" />
              <div className="profile-row"><span>User ID</span><span>#{user?.UserID}</span></div>
              <div className="profile-row"><span>Email</span><span>{user?.Email}</span></div>
              <div className="profile-row"><span>Phim đã xem</span><span>{new Set(history.filter(h => h.UserID === user?.UserID).map(h => h.MovieID)).size} phim</span></div>
            </div>
          </div>
        )}
      </main>

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal">
            <div className="modal-header" style={{ background: BG_COLORS[movies.indexOf(selectedMovie) % BG_COLORS.length] }}>
              {streamUrl ? (
                <img
                  src={streamUrl}
                  alt="poster"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <span style={{ fontSize: 48 }}>{EMOJIS[movies.indexOf(selectedMovie) % EMOJIS.length]}</span>
              )}
            </div>

            <div className="modal-body">
              <h2 className="modal-title">{selectedMovie.Title}</h2>
              <div className="modal-genre">{selectedMovie.Genre}</div>
              <p className="modal-desc">{selectedMovie.Description || "Không có mô tả"}</p>

              {/* Nút kiểm tra phim (OMDb) */}
              <button
                className="btn-play"
                onClick={doWatchMovie}
                disabled={streamLoading}
              >
                {streamLoading
                  ? <><span className="spinner" /> Đang kiểm tra...</>
                  : streamUrl
                    ? "↺ Kiểm tra lại"
                    : "🔍 Kiểm tra phim"}
              </button>

              {streamMsg.text && (
                <div className={`msg ${streamMsg.type}`} style={{ marginTop: 8 }}>
                  {streamMsg.text}
                </div>
              )}

              {/* Nút xem phim qua SpenEmbed */}
              {selectedMovie.TMDB_ID && (
                <button
                  className="btn-stream"
                  onClick={() => setPlayerOpen(true)}
                >
                  ▶ Xem phim
                </button>
              )}

              {/* Form lưu lịch sử */}
              <div className="watch-form">
                <p className="watch-label">Ghi lại lịch sử xem</p>
                <div className="watch-row">
                  <div className="watch-field">
                    <label>Thời gian (phút)</label>
                    <input type="number" placeholder="90" min="1" value={watchForm.watch_time} onChange={e => setWatchForm({ ...watchForm, watch_time: e.target.value })} />
                  </div>
                  <div className="watch-field">
                    <label>Đánh giá (1–5)</label>
                    <input type="number" placeholder="5" min="1" max="5" value={watchForm.rating} onChange={e => setWatchForm({ ...watchForm, rating: e.target.value })} />
                  </div>
                </div>
                <button className="btn-watch" onClick={doWatch}>Lưu lịch sử xem</button>
                {watchMsg.text && <div className={`msg ${watchMsg.type}`} style={{ marginTop: 8 }}>{watchMsg.text}</div>}
              </div>

              <button className="btn-close" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Player Overlay - SpenEmbed iframe */}
      {playerOpen && selectedMovie && (
        <div className="player-overlay" onClick={e => { if (e.target === e.currentTarget) setPlayerOpen(false); }}>
          <div className="player-container">
            <button className="player-close" onClick={() => setPlayerOpen(false)}>✕</button>
            <iframe
              src={`https://spencerdevs.xyz/movie/${selectedMovie.TMDB_ID}?theme=e50914`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; encrypted-media"
              style={{ borderRadius: 12 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}