import StarRating from "../components/StarRating";

export default function HistoryTab({ history, loadingHistory, avgRating, totalMins }) {
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
        <div className="history-list">
          {history.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-text">Chưa có lịch sử xem nào</div>
            </div>
          )}
          {history.map((r, i) => (
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
      )}
    </main>
  );
}
