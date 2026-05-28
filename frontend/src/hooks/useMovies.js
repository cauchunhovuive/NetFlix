import { useState, useEffect } from "react";
import { API } from "../api";

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState("Tất cả");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchForm, setWatchForm] = useState({ watch_time: "", rating: "" });
  const [watchMsg, setWatchMsg] = useState({ text: "", type: "" });

  const [streamUrl, setStreamUrl] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamMsg, setStreamMsg] = useState({ text: "", type: "" });
  const [omdbData, setOmdbData] = useState(null);

  const [playerOpen, setPlayerOpen] = useState(false);
  const [heroMovie, setHeroMovie] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);

  const [modalState, setModalState] = useState("closed");

  useEffect(() => {
    if (movies.length > 0 && !heroMovie) {
      setHeroMovie(movies[0]);
      setHeroIndex(0);
    }
  }, [movies]);

  // Auto-rotate hero
  useEffect(() => {
    if (movies.length < 2) return;
    const interval = setInterval(() => {
      setHeroIndex((i) => {
        const next = (i + 1) % Math.min(movies.length, 5);
        setHeroMovie(movies[next]);
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [movies]);

  async function fetchMovies() {
    setLoadingMovies(true);
    try {
      const res = await fetch(`${API}/movies`);
      const data = await res.json();
      setMovies(data);
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

  async function openMovie(movie) {
    setSelectedMovie(movie);
    setModalState("opening");
    setWatchMsg({ text: "", type: "" });
    setWatchForm({ watch_time: "", rating: "" });
    setStreamUrl(null);
    setStreamMsg({ text: "", type: "" });
    setOmdbData(null);
    setPlayerOpen(false);

    setTimeout(() => setModalState("open"), 30);

    try {
      const res = await fetch(`${API}/omdb?t=${encodeURIComponent(movie.Title)}`);
      if (res.ok) {
        const data = await res.json();
        setOmdbData(data);
        if (data.Poster && data.Poster !== "N/A") setStreamUrl(data.Poster);
        setStreamMsg({
          text: `IMDb ${data.imdbRating}⭐ · ${data.Runtime} · ${data.Year}`,
          type: "success",
        });
      }
    } catch {}
  }

  async function doWatchMovie() {
    setStreamLoading(true);
    setStreamMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API}/omdb?t=${encodeURIComponent(selectedMovie.Title)}`);
      if (res.ok) {
        const data = await res.json();
        setOmdbData(data);
        setStreamMsg({
          text: `IMDb ${data.imdbRating}⭐ · ${data.Runtime} · ${data.Year}`,
          type: "success",
        });
        if (data.Poster && data.Poster !== "N/A") setStreamUrl(data.Poster);
      } else {
        setStreamMsg({ text: "Không tìm thấy phim trên OMDb.", type: "error" });
      }
    } catch {
      setStreamMsg({ text: "Không kết nối được OMDb", type: "error" });
    }
    setStreamLoading(false);
  }

  async function doWatch(user, closeModal, fetchHistoryFn) {
    const watch_time = parseInt(watchForm.watch_time);
    const rating = parseInt(watchForm.rating);
    if (!watch_time || !rating || rating < 1 || rating > 5) {
      setWatchMsg({ text: "Nhập thời gian và đánh giá hợp lệ (1–5)", type: "error" });
      return;
    }
    try {
      const res = await fetch(`${API}/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.UserID,
          movie_id: selectedMovie.MovieID,
          watch_time,
          rating,
        }),
      });
      if (res.ok) {
        setWatchMsg({ text: "✓ Đã lưu lịch sử xem!", type: "success" });
        fetchHistoryFn();
        setTimeout(() => closeModal(), 1200);
      } else {
        const data = await res.json();
        setWatchMsg({ text: data.message || "Lỗi lưu dữ liệu", type: "error" });
      }
    } catch {
      setWatchMsg({ text: "Lỗi kết nối server", type: "error" });
    }
  }

  function closeModal() {
    setModalState("closing");
    setTimeout(() => {
      setSelectedMovie(null);
      setWatchMsg({ text: "", type: "" });
      setWatchForm({ watch_time: "", rating: "" });
      setStreamUrl(null);
      setStreamMsg({ text: "", type: "" });
      setOmdbData(null);
      setStreamLoading(false);
      setPlayerOpen(false);
      setModalState("closed");
    }, 280);
  }

  function resetMovies() {
    setMovies([]);
    setHistory([]);
    setHeroMovie(null);
    setCardsVisible(false);
  }

  return {
    movies, setMovies,
    history,
    loadingMovies, loadingHistory,
    selectedGenre, setSelectedGenre,
    selectedMovie, setSelectedMovie,
    watchForm, setWatchForm,
    watchMsg, setWatchMsg,
    streamUrl, setStreamUrl,
    streamLoading, setStreamLoading,
    streamMsg, setStreamMsg,
    omdbData, setOmdbData,
    playerOpen, setPlayerOpen,
    heroMovie, setHeroMovie,
    heroIndex, setHeroIndex,
    cardsVisible, setCardsVisible,
    modalState, setModalState,
    fetchMovies, fetchHistory,
    openMovie, doWatchMovie, doWatch, closeModal,
    resetMovies,
  };
}
