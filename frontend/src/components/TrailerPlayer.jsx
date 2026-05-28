export default function TrailerPlayer({ trailerOpen, trailerQuery, onClose }) {
  if (!trailerOpen || !trailerQuery) return null;

  const searchQuery = encodeURIComponent(`${trailerQuery} official trailer`);

  return (
    <div className="player-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="player-container">
        <button className="player-close" onClick={onClose}>✕ Đóng trailer</button>
        <iframe
          src={`https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; encrypted-media"
          style={{ borderRadius: 14 }}
          title="Trailer"
        />
      </div>
    </div>
  );
}
