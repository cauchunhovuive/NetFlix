import { useState, useEffect } from "react";
import RippleButton from "../components/RippleButton";
import PosterImage from "../components/PosterImage";
import { translateGenre } from "../utils/vietsub";

export default function MoviesTab({
  movies, loadingMovies, cardsVisible, selectedGenre, filteredMovies,
  genres, heroMovie, heroIndex, purchasedIds, favoriteIds,
  onSetSelectedGenre, onOpenMovie, onSetHeroIndex, onToggleFavorite,
  searchQuery, onSetSearchQuery, user,
}) {
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Apply search + favorites filter
  let displayMovies = filteredMovies;
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    displayMovies = displayMovies.filter((m) =>
      m.Title?.toLowerCase().includes(q)
    );
  }
  if (showFavoritesOnly) {
    displayMovies = displayMovies.filter((m) => favoriteIds.has(Number(m.MovieID)));
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(displayMovies.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedMovies = displayMovies.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, showFavoritesOnly, selectedGenre]);

  return (
    <>
      {heroMovie && !searchQuery && !showFavoritesOnly && (
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-pattern" />
          <div className="hero-poster-bg">
            <PosterImage title={heroMovie.Title} index={heroIndex}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(2px) scale(1.05)" }} />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />🔥 Nổi bật hôm nay
            </div>
            <h1 className="hero-title">{heroMovie.Title}</h1>
            <div className="hero-meta">
              <span className="hero-meta-badge">{translateGenre(heroMovie.Genre) || "Phim"}</span>
              <span className="hero-meta-dot">·</span><span>HD</span>
              <span className="hero-meta-dot">·</span><span>{heroMovie.Year || "2024"}</span>
            </div>
            <p className="hero-desc">
              {heroMovie.Description
                ? (heroMovie.Description.length > 140 ? heroMovie.Description.slice(0, 140) + "…" : heroMovie.Description)
                : "Một bộ phim hấp dẫn đang chờ bạn khám phá. Nhấn xem ngay để trải nghiệm!"}
            </p>
            <div className="hero-actions">
              <RippleButton className="btn-hero-play" onClick={() => onOpenMovie(heroMovie)}>
                <span className="play-icon">▶</span> Xem ngay
              </RippleButton>
              <RippleButton className="btn-hero-info" onClick={() => onOpenMovie(heroMovie)}>
                <span>ⓘ</span> Thông tin
              </RippleButton>
            </div>
            {movies.length > 1 && (
              <div className="hero-dots">
                {movies.slice(0, Math.min(movies.length, 5)).map((_, i) => (
                  <button key={i} className={`hero-dot ${i === heroIndex ? "active" : ""}`}
                    onClick={() => onSetHeroIndex(i)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="main-content">
        {/* Search bar */}
        <div className="search-bar-row">
          <div className="search-bar-wrap">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Tìm kiếm phim..."
              value={searchQuery}
              onChange={(e) => onSetSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-bar-clear" onClick={() => onSetSearchQuery("")}>✕</button>
            )}
          </div>
          <button
            className={`fav-filter-btn ${showFavoritesOnly ? "active" : ""}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title="Yêu thích"
          >
            {showFavoritesOnly ? "❤️" : "🤍"} Yêu thích
            {favoriteIds.size > 0 && <span className="fav-count">{favoriteIds.size}</span>}
          </button>
        </div>

        {/* Only show genre pills when not searching */}
        {!searchQuery && !showFavoritesOnly && (
          <div className="genre-pills-wrap">
            <div className="genre-pills">
              {genres.map(g => (
                <RippleButton key={g} className={selectedGenre === g ? "genre-pill active" : "genre-pill"}
                  onClick={() => onSetSelectedGenre(g)}>{g}</RippleButton>
              ))}
            </div>
          </div>
        )}

        <div className="section-header">
          <h2 className="section-title">
            {searchQuery
              ? <>Kết quả cho "<span>{searchQuery}</span>"</>
              : showFavoritesOnly
                ? <><span>❤️</span> Yêu thích</>
                : selectedGenre === "Tất cả" ? <>Tất cả <span>phim</span></> : <><span>{selectedGenre}</span></>
            }
          </h2>
          <span className="section-count">{displayMovies.length} phim</span>
        </div>

        {loadingMovies ? (
          <div className="loading">
            <div className="loading-dots"><span /><span /><span /></div>
            <div>Đang tải phim...</div>
          </div>
        ) : (
          <div className="movies-grid">
            {paginatedMovies.map((m, i) => (
              <div key={m.MovieID}
                className={`movie-card ${cardsVisible ? "card-visible" : ""}`}
                style={{ animationDelay: `${Math.min(i * 50, 500)}ms` }}
                onClick={() => onOpenMovie(m)}
              >
                <div className="movie-thumb">
                  <PosterImage title={m.Title} index={i} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {parseFloat(m.Price) > 0 && (
                    <div className="premium-badge"><span>👑</span><span>PREMIUM</span></div>
                  )}
                  <div className="movie-card-overlay" />
                  <div className="movie-card-shine" />
                  <div className="movie-card-actions">
                    <button className="btn-card-play" onClick={e => { e.stopPropagation(); onOpenMovie(m); }}>
                      {parseFloat(m.Price) > 0 && !purchasedIds.has(Number(m.MovieID)) ? `💰 $${m.Price}` : "▶ Xem"}
                    </button>
                    <button className="btn-card-info" onClick={e => { e.stopPropagation(); onOpenMovie(m); }}>⋯</button>
                  </div>
                  <div className="movie-card-rank">{i + 1}</div>
                  {/* Favorite heart button — only for regular users */}
                  {user?.Role !== "Admin" && (
                    <button
                      className={`fav-heart-btn ${favoriteIds.has(Number(m.MovieID)) ? "active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(m.MovieID); }}
                      title={favoriteIds.has(Number(m.MovieID)) ? "Bỏ yêu thích" : "Thêm yêu thích"}
                    >
                      {favoriteIds.has(Number(m.MovieID)) ? "❤️" : "🤍"}
                    </button>
                  )}
                </div>
                <div className="movie-info">
                  <div className="movie-title">{m.Title}</div>
                  <div className="movie-genre-tag">{translateGenre(m.Genre)}</div>
                  <div className="movie-desc">{m.Description}</div>
                </div>
              </div>
            ))}
            {paginatedMovies.length === 0 && (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <div className="empty-state-icon">
                  {searchQuery ? "🔍" : showFavoritesOnly ? "❤️" : "🎬"}
                </div>
                <div className="empty-state-text">
                  {searchQuery
                    ? `Không tìm thấy phim "${searchQuery}"`
                    : showFavoritesOnly
                      ? "Chưa có phim yêu thích nào"
                      : "Không có phim nào trong thể loại này"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹ Trước
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pn;
                if (totalPages <= 7) pn = i + 1;
                else if (safePage <= 4) pn = i + 1;
                else if (safePage >= totalPages - 3) pn = totalPages - 6 + i;
                else pn = safePage - 3 + i;
                return (
                  <button
                    key={pn}
                    className={`page-num ${safePage === pn ? "active" : ""}`}
                    onClick={() => setPage(pn)}
                  >
                    {pn}
                  </button>
                );
              })}
            </div>
            <button
              className="page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau ›
            </button>
            <span className="page-info">Trang {safePage}/{totalPages}</span>
          </div>
        )}
      </main>
    </>
  );
}
