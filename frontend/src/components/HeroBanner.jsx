import RippleButton from "./RippleButton";
import PosterImage from "./PosterImage";
import { translateGenre } from "../utils/vietsub";

export default function HeroBanner({ heroMovie, heroIndex, movies, onOpenMovie, onSetHeroIndex }) {
  if (!heroMovie) return null;

  return (
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
          <span className="hero-badge-dot" />
          🔥 Nổi bật hôm nay
        </div>
        <h1 className="hero-title">{heroMovie.Title}</h1>
        <div className="hero-meta">
          <span className="hero-meta-badge">{translateGenre(heroMovie.Genre) || "Phim"}</span>
          <span className="hero-meta-dot">·</span>
          <span>HD</span>
          <span className="hero-meta-dot">·</span>
          <span>{heroMovie.Year || "2024"}</span>
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
  );
}
