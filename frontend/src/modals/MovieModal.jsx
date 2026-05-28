import { useState } from "react";
import RippleButton from "../components/RippleButton";
import StarRating from "../components/StarRating";
import TrailerPlayer from "../components/TrailerPlayer";
import { translateGenre } from "../utils/vietsub";

export default function MovieModal({
  modalState, selectedMovie, streamUrl, streamMsg, streamLoading,
  omdbData, watchForm, watchMsg, purchaseLoading, purchasedIds,
  onCloseModal, onWatchMovie, onWatch, onSetWatchForm, onPurchaseMovie, onSetPlayerOpen,
  // New props
  favoriteIds, onToggleFavorite, user,
  reviews, reviewsLoading, reviewMsg, onFetchReviews, onSubmitReview,
}) {
  const [reviewTab, setReviewTab] = useState("view"); // "view" | "add"
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [trailerOpen, setTrailerOpen] = useState(false);

  if (!selectedMovie || modalState === "closed") return null;

  const movieId = Number(selectedMovie.MovieID);
  const isFavorited = favoriteIds?.has(movieId);

  function handleSubmitReview() {
    onSubmitReview(movieId, user?.UserID, reviewRating, reviewComment, () => onFetchReviews(movieId));
  }

  function openTrailer() {
    setTrailerOpen(true);
  }

  function closeTrailer() {
    setTrailerOpen(false);
  }

  return (
    <div
      className={`modal-overlay ${modalState === "open" ? "overlay-visible" : ""} ${modalState === "closing" ? "overlay-closing" : ""}`}
      onClick={e => { if (e.target === e.currentTarget) onCloseModal(); }}
    >
      <div className={`modal modal-wide ${modalState === "open" ? "modal-visible" : ""} ${modalState === "closing" ? "modal-closing" : ""}`}>
        <div className="modal-poster">
          {streamUrl ? (
            <img src={streamUrl} alt={selectedMovie.Title} />
          ) : (
            <div className="modal-poster-fallback"
              style={{ background: "linear-gradient(135deg,#1a0a2e,#0f0820)" }}>
              <div className="modal-poster-letter">{(selectedMovie.Title || "?")[0].toUpperCase()}</div>
            </div>
          )}
          <div className="modal-poster-overlay" />
          <button className="modal-close-x" onClick={onCloseModal}>✕</button>

          {/* Favorite + Trailer buttons on poster */}
          <div className="modal-poster-actions">
            <button
              className={`modal-fav-btn ${isFavorited ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(movieId); }}
              title={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
            >
              {isFavorited ? "❤️" : "🤍"}
            </button>
            <button className="modal-trailer-btn" onClick={(e) => { e.stopPropagation(); openTrailer(); }} title="Xem trailer">
              ▶ Trailer
            </button>
          </div>
        </div>

        <div className="modal-body">
          <h2 className="modal-title">{selectedMovie.Title}</h2>
          <div className="modal-genre">{omdbData?.GenreVI || selectedMovie.Genre}</div>

          {streamMsg.text && (
            <div className={streamMsg.type === "success" ? "modal-omdb-badge" : `msg ${streamMsg.type}`}>
              {streamMsg.text}
            </div>
          )}

          {omdbData?.PlotVI ? (
            <p className="modal-desc">{omdbData.PlotVI}</p>
          ) : omdbData?.Plot && omdbData.Plot !== "N/A" ? (
            <p className="modal-desc">{omdbData.Plot}</p>
          ) : (
            <p className="modal-desc">{selectedMovie.Description || "Không có mô tả."}</p>
          )}

          <div className="modal-actions">
            {parseFloat(selectedMovie.Price) > 0 && !purchasedIds.has(movieId) ? (
              <RippleButton className="btn-modal-buy" onClick={() => onPurchaseMovie(selectedMovie.MovieID)} disabled={purchaseLoading}>
                {purchaseLoading ? <><span className="btn-loading-spinner" /> Đang xử lý...</> : `💰 Mua phim $${selectedMovie.Price}`}
              </RippleButton>
            ) : (
              <>
                <RippleButton className="btn-modal-play" onClick={onWatchMovie} disabled={streamLoading}>
                  {streamLoading ? <><span className="spinner" /> Đang tải...</> : "🔍 Kiểm tra OMDb"}
                </RippleButton>
                {selectedMovie.TMDB_ID && (
                  <RippleButton className="btn-modal-stream" onClick={() => onSetPlayerOpen(true)}>
                    ▶ Xem phim
                  </RippleButton>
                )}
              </>
            )}
          </div>

          <div className="watch-form">
            <p className="watch-form-title">Ghi lại lịch sử xem</p>
            <div className="watch-row">
              <div className="watch-field">
                <label>Thời gian (phút)</label>
                <input type="number" placeholder="90" min="1"
                  value={watchForm.watch_time}
                  onChange={e => onSetWatchForm({ ...watchForm, watch_time: e.target.value })} />
              </div>
              <div className="watch-field">
                <label>Đánh giá (1–5)</label>
                <input type="number" placeholder="5" min="1" max="5"
                  value={watchForm.rating}
                  onChange={e => onSetWatchForm({ ...watchForm, rating: e.target.value })} />
              </div>
            </div>
            <RippleButton className="btn-watch" onClick={onWatch}>Lưu lịch sử xem</RippleButton>
            {watchMsg.text && <div className={`msg ${watchMsg.type}`} style={{ marginTop: 8 }}>{watchMsg.text}</div>}
          </div>

          {/* ===== REVIEWS SECTION ===== */}
          <div className="review-section">
            <div className="review-header">
              <h3 className="review-title">💬 Đánh giá & Bình luận</h3>
              <div className="review-tabs">
                <button
                  className={`review-tab ${reviewTab === "view" ? "active" : ""}`}
                  onClick={() => { setReviewTab("view"); if (reviews.length === 0) onFetchReviews(movieId); }}
                >
                  Xem ({reviews.length})
                </button>
                <button
                  className={`review-tab ${reviewTab === "add" ? "active" : ""}`}
                  onClick={() => setReviewTab("add")}
                >
                  ✏️ Viết
                </button>
              </div>
            </div>

            {reviewTab === "add" ? (
              <div className="review-form">
                <div className="review-rating-row">
                  <label>Đánh giá:</label>
                  <div className="review-stars">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button
                        key={n}
                        className={`review-star-btn ${n <= reviewRating ? "active" : ""}`}
                        onClick={() => setReviewRating(n)}
                      >
                        {n <= reviewRating ? "★" : "☆"}
                      </button>
                    ))}
                    <span className="review-rating-label">{reviewRating}/10</span>
                  </div>
                </div>
                <textarea
                  className="review-textarea"
                  placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                />
                <RippleButton className="btn-review-submit" onClick={handleSubmitReview}>
                  Gửi đánh giá
                </RippleButton>
                {reviewMsg.text && (
                  <div className={`msg ${reviewMsg.type}`} style={{ marginTop: 8 }}>{reviewMsg.text}</div>
                )}
              </div>
            ) : (
              <div className="review-list">
                {reviewsLoading ? (
                  <div className="review-loading">
                    <span className="spinner" /> Đang tải...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="review-empty">
                    <span className="review-empty-icon">💬</span>
                    <span>Chưa có đánh giá nào. Hãy là người đầu tiên!</span>
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.ReviewID} className="review-item">
                      <div className="review-item-header">
                        <div className="review-item-avatar">
                          {(r.UserName || "?")[0].toUpperCase()}
                        </div>
                        <div className="review-item-info">
                          <span className="review-item-name">{r.UserName || "User"}</span>
                          <span className="review-item-date">
                            {r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                        <div className="review-item-rating">
                          <span className="review-item-stars">
                            {Array.from({ length: 10 }, (_, i) => (
                              <span key={i} className={i < (r.Rating || 0) ? "star-filled" : "star-empty"}>
                                {i < (r.Rating || 0) ? "★" : "☆"}
                              </span>
                            ))}
                          </span>
                          <span className="review-item-score">{r.Rating}/10</span>
                        </div>
                      </div>
                      {r.Comment && <p className="review-item-comment">{r.Comment}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <RippleButton className="btn-close" onClick={onCloseModal} style={{ marginTop: 16 }}>Đóng</RippleButton>
        </div>
      </div>

      {/* Trailer player */}
      <TrailerPlayer
        trailerOpen={trailerOpen}
        trailerQuery={selectedMovie.Title}
        onClose={closeTrailer}
      />
    </div>
  );
}
