import { useState, useCallback } from "react";
import { API } from "../api";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

  const fetchFavorites = useCallback(async (user) => {
    if (!user?.UserID) return;
    setFavLoading(true);
    try {
      const res = await fetch(`${API}/favorites/${user.UserID}`);
      const ids = await res.json();
      setFavoriteIds(new Set(ids.map(Number)));
    } catch {
      setFavoriteIds(new Set());
    }
    setFavLoading(false);
  }, []);

  const fetchFavoriteDetails = useCallback(async (user) => {
    if (!user?.UserID) return;
    try {
      const res = await fetch(`${API}/favorites/${user.UserID}/with-details`);
      setFavoriteMovies(await res.json());
    } catch {
      setFavoriteMovies([]);
    }
  }, []);

  const toggleFavorite = useCallback(async (movieId, user) => {
    if (!user?.UserID || !movieId) return false;
    try {
      const res = await fetch(`${API}/favorites/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.UserID, movie_id: movieId }),
      });
      const data = await res.json();
      if (data.favorited) {
        setFavoriteIds((prev) => new Set([...prev, Number(movieId)]));
      } else {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(Number(movieId));
          return next;
        });
      }
      return data.favorited;
    } catch {
      return false;
    }
  }, []);

  const resetFavorites = useCallback(() => {
    setFavoriteIds(new Set());
    setFavoriteMovies([]);
  }, []);

  return {
    favoriteIds, setFavoriteIds,
    favoriteMovies, setFavoriteMovies,
    favLoading,
    fetchFavorites, fetchFavoriteDetails,
    toggleFavorite,
    resetFavorites,
  };
}
