import { useState, useEffect } from "react";
import { API, BG_COLORS } from "../api";

export default function PosterImage({ title, index, style = {} }) {
  const [src, setSrc] = useState(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!title) return;
    fetch(`${API}/omdb?t=${encodeURIComponent(title)}`)
      .then(r => r.json())
      .then(d => {
        if (d.Poster && d.Poster !== "N/A") setSrc(d.Poster);
        setTried(true);
      })
      .catch(() => setTried(true));
  }, [title]);

  if (src) return <img src={src} alt={title} style={style} onError={() => setSrc(null)} />;

  return (
    <div className="movie-thumb-fallback" style={{ background: BG_COLORS[index % BG_COLORS.length], ...style }}>
      <div className="movie-thumb-letter">{(title || "?")[0].toUpperCase()}</div>
    </div>
  );
}
