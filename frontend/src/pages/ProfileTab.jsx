import RippleButton from "../components/RippleButton";
import { getUserId } from "../api";

export default function ProfileTab({
  user, editForm, passwordForm, editMsg, editingPassword, editLoading,
  myWatchedCount, myHistory, myTotalMins, topMovies,
  onSetEditForm, onSetPasswordForm, onUpdateProfile, onChangePassword, onSetEditingPassword,
}) {
  return (
    <main className="main-content">
      <div className="section-header" style={{ marginBottom: "1.5rem" }}>
        <h2 className="section-title">Tài <span>khoản</span></h2>
      </div>
      <div className="profile-layout">
        <div className="profile-grid-left">
          <div className="profile-card">
            <div className="profile-avatar-wrap">
              <span>{(user?.Name || "U").slice(0, 2).toUpperCase()}</span>
              <div className="profile-avatar-ring" />
            </div>
            <div className="profile-name">{user?.Name}</div>
            <div className="profile-email">{user?.Email}</div>
            {user?.Role === "Admin" && <div className="profile-badge-admin">⚙️ Quản trị viên</div>}
            <hr className="profile-sep" />
            <div className="profile-row">
              <span className="profile-row-label">ID</span>
              <span className="profile-row-value">#{getUserId(user)}</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Phim đã xem</span>
              <span className="profile-row-value" style={{color:"var(--red)"}}>{myWatchedCount} phim</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Tổng thời gian</span>
              <span className="profile-row-value">{Math.floor(myTotalMins / 60)}h {myTotalMins % 60}p</span>
            </div>
            <div className="profile-row">
              <span className="profile-row-label">Lượt xem</span>
              <span className="profile-row-value" style={{color:"var(--gold)"}}>{myHistory.length} lượt</span>
            </div>
          </div>

          <div className="profile-stats-card">
            <div className="profile-stats-title">Phim xem nhiều nhất</div>
            {topMovies.length === 0 ? (
              <div className="empty-state" style={{padding:"2rem"}}>
                <div className="empty-state-icon">🎬</div>
                <div className="empty-state-text">Chưa có dữ liệu</div>
              </div>
            ) : (
              <div className="top-movies-list">
                {topMovies.map((m, i) => (
                  <div key={m.title} className="top-movie-row" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="top-movie-rank">{i + 1}</div>
                    <div className="top-movie-info">
                      <div className="top-movie-title">{m.title}</div>
                      <div className="top-movie-time">{m.time} phút đã xem</div>
                    </div>
                    <div className="top-movie-rating">★ {m.rating}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="profile-edit-card">
          <div className="profile-stats-title">✏️ Chỉnh sửa thông tin</div>
          <form onSubmit={onUpdateProfile} className="profile-edit-form">
            <div className="form-group">
              <label>Họ tên</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">👤</span>
                <input value={editForm.name}
                  onChange={e => onSetEditForm({ ...editForm, name: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">✉</span>
                <input type="email" value={editForm.email}
                  onChange={e => onSetEditForm({ ...editForm, email: e.target.value })} required />
              </div>
            </div>
            <RippleButton className="btn-primary" disabled={editLoading}>
              {editLoading ? <><span className="btn-loading-spinner" /> Đang lưu...</> : "💾 Lưu thay đổi"}
            </RippleButton>
          </form>

          <div className="profile-pw-section">
            <button className="profile-pw-toggle-btn" onClick={() => onSetEditingPassword(!editingPassword)}>
              {editingPassword ? "▾ Ẩn đổi mật khẩu" : "▸ Đổi mật khẩu"}
            </button>
            {editingPassword && (
              <form onSubmit={onChangePassword} className="profile-edit-form" style={{marginTop:10}}>
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">🔒</span>
                    <input type="password" placeholder="••••••••" value={passwordForm.current}
                      onChange={e => onSetPasswordForm({ ...passwordForm, current: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">🔑</span>
                    <input type="password" placeholder="••••••••" value={passwordForm.newPass}
                      onChange={e => onSetPasswordForm({ ...passwordForm, newPass: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">✓</span>
                    <input type="password" placeholder="••••••••" value={passwordForm.confirm}
                      onChange={e => onSetPasswordForm({ ...passwordForm, confirm: e.target.value })} required />
                  </div>
                </div>
                <RippleButton className="btn-secondary" disabled={editLoading}>
                  {editLoading ? <><span className="btn-loading-spinner" /> Đang xử lý...</> : "🔄 Đổi mật khẩu"}
                </RippleButton>
              </form>
            )}
          </div>

          {editMsg.text && <div className={`msg ${editMsg.type}`}>{editMsg.text}</div>}
        </div>
      </div>
    </main>
  );
}
