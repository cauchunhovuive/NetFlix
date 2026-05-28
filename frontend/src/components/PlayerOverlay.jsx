export default function PlayerOverlay({ playerOpen, selectedMovie, onClose }) {
  if (!playerOpen || !selectedMovie) return null;

  return (
    <div className="player-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="player-container">
        <button className="player-close" onClick={onClose}>✕ Đóng</button>
        <iframe
          src={`https://vidsrc.to/embed/movie/${selectedMovie.TMDB_ID}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media"
          style={{ borderRadius: 14 }}
        />
      </div>
    </div>
  );
}
