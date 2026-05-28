import { useState, useEffect } from "react";
import StarRating from "../components/StarRating";

export default function HistoryTab({ history, loadingHistory, avgRating, totalMins }) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedHistory = history.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset page when history changes (e.g. after new watch entry)
  useEffect(() => {
    setPage(1);
  }, [history.length]);

  return (
    <main className="main-content">
      <div className="stats-row">
        {[
          { label: "Tổng lượt xem", value: history.length, sub: "tất cả người dùng", color: "var(--red)" },
          { label: "Rating trung bình", value: avgRating, sub: "trên thang 5 sao", color: "var(--gold)" },
          {
            label: "Tổng thời gian",
            value: <>{Math.floor(totalMins / 60)}<span style={{fontSize:22}}>h</span> {totalMins % 60}<span style={{fontSize:22}}>p</span></>,
            sub: "đã xem", color: "var(--green)"
          },
        ].map(({ label, value, sub, color }, i) => (
          <div key={i} className="stat-card" style={{ "--accent": color }}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-sub">{sub}</div>
            <div className="stat-glow" style={{ background: color }} />
          </div>
        ))}
      </div>

      <div className="section-header" style={{ marginBottom: "1rem" }}>
        <h2 className="section-title">Lịch sử <span>xem</span></h2>
        <span className="section-count">{history.length} lượt</span>
      </div>

      {loadingHistory ? (
        <div className="loading">
          <div className="loading-dots"><span /><span /><span /></div>
          <div>Đang tải lịch sử...</div>
        </div>
      ) : (
        <>
          <div className="history-list">
            {paginatedHistory.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">Chưa có lịch sử xem nào</div>
              </div>
            )}
            {paginatedHistory.map((r, i) => (
              <div key={r.HistoryID ?? i} className="history-row" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                <div className="avatar">{(r.Name || "U").slice(0, 2).toUpperCase()}</div>
                <div className="h-info">
                  <div className="h-user">{r.Name}</div>
                  <div className="h-movie">🎬 {r.Title}</div>
                </div>
                <div className="h-meta">
                  <StarRating rating={r.Rating || 0} />
                  <div className="h-time">{r.WatchTime} phút · {new Date(r.CreatedAt).toLocaleDateString("vi-VN")}</div>
                </div>
              </div>
            ))}
          </div>

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
        </>
      )}
    </main>
  );
}
