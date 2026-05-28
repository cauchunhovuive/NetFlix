import { useState, useCallback } from "react";
import { API } from "../api";

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ text: "", type: "" });

  const fetchReviews = useCallback(async (movieId) => {
    if (!movieId) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`${API}/reviews/${movieId}`);
      setReviews(await res.json());
    } catch {
      setReviews([]);
    }
    setReviewsLoading(false);
  }, []);

  const submitReview = useCallback(async (movieId, userId, rating, comment, onSuccess) => {
    if (!movieId || !userId || !rating) {
      setReviewMsg({ text: "Vui lòng nhập đánh giá", type: "error" });
      return;
    }
    try {
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movie_id: movieId, user_id: userId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMsg({ text: data.message, type: "success" });
        if (onSuccess) onSuccess();
        setTimeout(() => setReviewMsg({ text: "", type: "" }), 2000);
      } else {
        setReviewMsg({ text: data.message || "Lỗi gửi đánh giá", type: "error" });
      }
    } catch {
      setReviewMsg({ text: "Lỗi kết nối server", type: "error" });
    }
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      await fetch(`${API}/reviews/${reviewId}`, { method: "DELETE" });
    } catch {}
  }, []);

  const resetReviews = useCallback(() => {
    setReviews([]);
    setReviewMsg({ text: "", type: "" });
  }, []);

  return {
    reviews, setReviews,
    reviewsLoading,
    reviewMsg, setReviewMsg,
    fetchReviews, submitReview, deleteReview,
    resetReviews,
  };
}
