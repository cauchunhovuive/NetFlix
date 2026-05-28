import RippleButton from "../components/RippleButton";

export default function AdminTab({
  user, adminTab, adminStats, adminStatsLoading, adminMsg, adminLoading,
  adminUsers, movies, adminVouchers, adminMovieForm, adminEditingMovie,
  adminShowMovieForm, adminVoucherForm, adminEditingVoucher, adminShowVoucherForm,
  adminConv, adminConvLoading, adminConvMessages, adminConvUserId,
  adminReplyText, adminReplySending,
  onSetAdminTab, onSetAdminMsg, onSaveMovie, onDeleteMovie, onOpenEditMovie,
  onSetAdminMovieForm, onSetAdminShowMovieForm, onSetAdminEditingMovie,
  onSaveVoucher, onDeleteVoucher, onOpenEditVoucher,
  onSetAdminVoucherForm, onSetAdminShowVoucherForm, onSetAdminEditingVoucher,
  onFetchAdminConvs, onOpenAdminConv, onAdminReply,
  onSetAdminReplyText, onSetAdminConvUserId, onSetAdminConvMessages,
}) {
  return (
    <main className="main-content">
      <div className="section-header">
        <h2 className="section-title">Quản trị <span>hệ thống</span></h2>
      </div>

      <div className="admin-tabs">
        {[
          { key: "dashboard", label: "📊 Tổng quan" },
          { key: "movies", label: "🎬 Quản lý phim" },
          { key: "vouchers", label: "🏷️ Quản lý voucher" },
          { key: "users", label: "👥 Người dùng" },
          { key: "support", label: "💬 Hỗ trợ" },
        ].map(({ key, label }) => (
          <button key={key}
            className={`admin-tab-btn ${adminTab === key ? "active" : ""}`}
            onClick={() => { onSetAdminTab(key); onSetAdminMsg({ text: "", type: "" }); }}
          >{label}</button>
        ))}
      </div>

      {adminMsg.text && <div className={`msg ${adminMsg.type}`} style={{marginBottom:16}}>{adminMsg.text}</div>}

      {/* Dashboard */}
      {adminTab === "dashboard" && (
        <>
          {adminStatsLoading ? (
            <div className="loading">
              <div className="loading-dots"><span /><span /><span /></div>
              <div>Đang tải thống kê...</div>
            </div>
          ) : !adminStats ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">Không thể tải dữ liệu thống kê</div>
            </div>
          ) : (
            <>
              <div className="dashboard-stats-row">
                {[
                  { label: "Người dùng", value: adminStats.totalUsers, icon: "👥", color: "var(--red)" },
                  { label: "Phim", value: adminStats.totalMovies, icon: "🎬", color: "var(--green)" },
                  { label: "Giao dịch", value: adminStats.totalTransactions, icon: "💳", color: "var(--gold)" },
                  { label: "Voucher", value: adminStats.totalVouchers, icon: "🏷️", color: "#8b5cf6" },
                ].map(({ label, value, icon, color }, i) => (
                  <div key={i} className="dashboard-stat-card" style={{ "--accent": color, animationDelay: `${i * 80}ms` }}>
                    <div className="dashboard-stat-icon">{icon}</div>
                    <div className="dashboard-stat-info">
                      <div className="dashboard-stat-value" style={{ color }}>{value}</div>
                      <div className="dashboard-stat-label">{label}</div>
                    </div>
                    <div className="dashboard-stat-glow" style={{ background: color }} />
                  </div>
                ))}
              </div>
              <div className="dashboard-revenue-card">
                <div className="dashboard-revenue-icon">💰</div>
                <div className="dashboard-revenue-info">
                  <div className="dashboard-revenue-label">Tổng doanh thu</div>
                  <div className="dashboard-revenue-value">${parseFloat(adminStats.totalRevenue).toLocaleString()}</div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Movies Management */}
      {adminTab === "movies" && (
        <>
          <div className="admin-toolbar">
            <span className="section-count">{movies.length} phim</span>
            <RippleButton className="btn-admin-add" onClick={() => {
              onSetAdminEditingMovie(null);
              onSetAdminMovieForm({ title: "", genre: "", description: "", year: 2024, price: "", tmdb_id: "" });
              onSetAdminShowMovieForm(true);
              onSetAdminMsg({ text: "", type: "" });
            }}>+ Thêm phim</RippleButton>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Tên phim</th><th>Thể loại</th><th>Năm</th><th>Giá</th><th>Mô tả</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {movies.map(m => (
                  <tr key={m.MovieID}>
                    <td>#{m.MovieID}</td>
                    <td className="admin-movie-title">{m.Title}</td>
                    <td><span className="admin-genre-tag">{m.Genre || "—"}</span></td>
                    <td>{m.Year || "—"}</td>
                    <td className="admin-price-cell">
                      {parseFloat(m.Price) > 0
                        ? <span className="admin-price-premium">💰 ${parseFloat(m.Price).toFixed(2)}</span>
                        : <span className="admin-price-free">Miễn phí</span>}
                    </td>
                    <td className="admin-desc-cell">
                      {m.Description ? m.Description.slice(0, 60) + (m.Description.length > 60 ? "…" : "") : "—"}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-edit" onClick={() => onOpenEditMovie(m)}>✏️</button>
                        <button className="admin-btn-delete" onClick={() => onDeleteMovie(m.MovieID)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {adminShowMovieForm && (
            <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onSetAdminShowMovieForm(false); }}>
              <div className="admin-modal">
                <div className="admin-modal-title">
                  {adminEditingMovie ? "✏️ Chỉnh sửa phim" : "➕ Thêm phim mới"}
                  <button className="admin-modal-close" onClick={() => onSetAdminShowMovieForm(false)}>✕</button>
                </div>
                <form onSubmit={onSaveMovie} className="admin-form">
                  <div className="form-group">
                    <label>Tên phim *</label>
                    <input className="admin-input" value={adminMovieForm.title}
                      onChange={e => onSetAdminMovieForm({ ...adminMovieForm, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Thể loại</label>
                    <input className="admin-input" value={adminMovieForm.genre}
                      onChange={e => onSetAdminMovieForm({ ...adminMovieForm, genre: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea className="admin-textarea" value={adminMovieForm.description}
                      onChange={e => onSetAdminMovieForm({ ...adminMovieForm, description: e.target.value })} rows={3} />
                  </div>
                  <div className="admin-form-row">
                    <div className="form-group" style={{flex:1}}>
                      <label>Năm</label>
                      <input className="admin-input" type="number" value={adminMovieForm.year}
                        onChange={e => onSetAdminMovieForm({ ...adminMovieForm, year: e.target.value })} />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                      <label>Giá ($)</label>
                      <input className="admin-input" type="number" min="0" step="0.01" value={adminMovieForm.price}
                        onChange={e => onSetAdminMovieForm({ ...adminMovieForm, price: e.target.value })} placeholder="0 = miễn phí" />
                    </div>
                  </div>
                  <div className="admin-form-row">
                    <div className="form-group" style={{flex:1}}>
                      <label>TMDB ID</label>
                      <input className="admin-input" type="number" value={adminMovieForm.tmdb_id}
                        onChange={e => onSetAdminMovieForm({ ...adminMovieForm, tmdb_id: e.target.value })} />
                    </div>
                  </div>
                  <div className="admin-form-actions">
                    <RippleButton className="btn-primary" disabled={adminLoading}>
                      {adminLoading ? <><span className="btn-loading-spinner" /> Đang xử lý...</>
                        : (adminEditingMovie ? "💾 Cập nhật" : "➕ Thêm phim")}
                    </RippleButton>
                    <button type="button" className="btn-cancel" onClick={() => onSetAdminShowMovieForm(false)}>Hủy</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Vouchers Management */}
      {adminTab === "vouchers" && (
        <>
          <div className="admin-toolbar">
            <span className="section-count">{adminVouchers.length} voucher</span>
            <RippleButton className="btn-admin-add" onClick={() => {
              onSetAdminEditingVoucher(null);
              onSetAdminVoucherForm({ code: "", discount: "", description: "", expiry_date: "" });
              onSetAdminShowVoucherForm(true);
              onSetAdminMsg({ text: "", type: "" });
            }}>+ Tạo voucher</RippleButton>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Mã</th><th>Giảm</th><th>Mô tả</th><th>Hạn sử dụng</th><th>Trạng thái</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {adminVouchers.map(v => (
                  <tr key={v.VoucherID}>
                    <td>#{v.VoucherID}</td>
                    <td className="admin-voucher-code">{v.Code}</td>
                    <td className="admin-voucher-discount">-{v.Discount}%</td>
                    <td className="admin-desc-cell">
                      {v.Description ? v.Description.slice(0, 40) + (v.Description.length > 40 ? "…" : "") : "—"}
                    </td>
                    <td>{v.ExpiryDate ? new Date(v.ExpiryDate).toLocaleDateString("vi-VN") : "—"}</td>
                    <td><span className={`admin-status ${v.Active ? "active" : "inactive"}`}>{v.Active ? "Hoạt động" : "Tắt"}</span></td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn-edit" onClick={() => onOpenEditVoucher(v)}>✏️</button>
                        <button className="admin-btn-delete" onClick={() => onDeleteVoucher(v.VoucherID)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {adminShowVoucherForm && (
            <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onSetAdminShowVoucherForm(false); }}>
              <div className="admin-modal">
                <div className="admin-modal-title">
                  {adminEditingVoucher ? "✏️ Chỉnh sửa voucher" : "➕ Tạo voucher mới"}
                  <button className="admin-modal-close" onClick={() => onSetAdminShowVoucherForm(false)}>✕</button>
                </div>
                <form onSubmit={onSaveVoucher} className="admin-form">
                  <div className="admin-form-row">
                    <div className="form-group" style={{flex:1}}>
                      <label>Mã voucher *</label>
                      <input className="admin-input" value={adminVoucherForm.code}
                        onChange={e => onSetAdminVoucherForm({ ...adminVoucherForm, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER2024" required />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                      <label>Giảm (%) *</label>
                      <input className="admin-input" type="number" min="1" max="100" value={adminVoucherForm.discount}
                        onChange={e => onSetAdminVoucherForm({ ...adminVoucherForm, discount: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <input className="admin-input" value={adminVoucherForm.description}
                      onChange={e => onSetAdminVoucherForm({ ...adminVoucherForm, description: e.target.value })}
                      placeholder="Giảm 20% cho gói Premium" />
                  </div>
                  <div className="form-group">
                    <label>Ngày hết hạn</label>
                    <input className="admin-input" type="date" value={adminVoucherForm.expiry_date}
                      onChange={e => onSetAdminVoucherForm({ ...adminVoucherForm, expiry_date: e.target.value })} />
                  </div>
                  <div className="admin-form-actions">
                    <RippleButton className="btn-primary" disabled={adminLoading}>
                      {adminLoading ? <><span className="btn-loading-spinner" /> Đang xử lý...</>
                        : (adminEditingVoucher ? "💾 Cập nhật" : "➕ Tạo voucher")}
                    </RippleButton>
                    <button type="button" className="btn-cancel" onClick={() => onSetAdminShowVoucherForm(false)}>Hủy</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Support */}
      {adminTab === "support" && (
        <>
          <div className="admin-toolbar">
            <span className="section-count">{adminConv.length} hội thoại</span>
          </div>

          {!adminConvUserId ? (
            <>
              {adminConvLoading ? (
                <div className="loading">
                  <div className="loading-dots"><span /><span /><span /></div>
                  <div>Đang tải hội thoại...</div>
                </div>
              ) : adminConv.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💬</div>
                  <div className="empty-state-text">Chưa có hội thoại nào</div>
                </div>
              ) : (
                <div className="admin-conv-list">
                  {adminConv.map((conv, i) => (
                    <div key={conv.UserID ?? i} className="admin-conv-row" onClick={() => onOpenAdminConv(conv.UserID)}>
                      <div className="admin-conv-avatar">{(conv.Name || "U").slice(0, 2).toUpperCase()}</div>
                      <div className="admin-conv-info">
                        <div className="admin-conv-name">{conv.Name}</div>
                        <div className="admin-conv-email">{conv.Email}</div>
                      </div>
                      <div className="admin-conv-meta">
                        <div className="admin-conv-count">{conv.msg_count} tin</div>
                        <div className="admin-conv-time">
                          {conv.last_time ? new Date(conv.last_time).toLocaleDateString("vi-VN") : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="admin-conv-detail">
              <div className="admin-conv-detail-header">
                <button className="admin-conv-back" onClick={() => {
                  onSetAdminConvUserId(null);
                  onSetAdminConvMessages([]);
                  onFetchAdminConvs();
                }}>← Quay lại</button>
                <span style={{fontWeight:600}}>Hội thoại với User #{adminConvUserId}</span>
              </div>
              <div className="admin-conv-messages">
                {adminConvMessages.map((msg, i) => (
                  <div key={msg.MessageID ?? i}
                    className={`admin-conv-msg ${msg.SenderType === "admin" ? "admin-conv-msg-admin" : "admin-conv-msg-user"}`}>
                    <div className="admin-conv-msg-label">{msg.SenderType === "admin" ? "🎧 Admin" : "👤 User"}</div>
                    <div className="admin-conv-msg-text">{msg.MESSAGE || msg.Message}</div>
                    <div className="admin-conv-msg-time">{msg.CreatedAt ? new Date(msg.CreatedAt).toLocaleString("vi-VN") : ""}</div>
                  </div>
                ))}
              </div>
              <form className="admin-conv-reply" onSubmit={e => { e.preventDefault(); onAdminReply(); }}>
                <input className="admin-input" placeholder="Nhập phản hồi..."
                  value={adminReplyText}
                  onChange={e => onSetAdminReplyText(e.target.value)}
                  maxLength={500} />
                <button type="submit" className="btn-admin-add" disabled={adminReplySending || !adminReplyText.trim()}>
                  {adminReplySending ? <span className="btn-loading-spinner" /> : "Gửi"}
                </button>
              </form>
            </div>
          )}
        </>
      )}

      {/* Users */}
      {adminTab === "users" && (
        <>
          <div className="admin-toolbar">
            <span className="section-count">{adminUsers.length} người dùng</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Tên</th><th>Email</th><th>Vai trò</th></tr>
              </thead>
              <tbody>
                {adminUsers.map(u => (
                  <tr key={u.UserID}>
                    <td>#{u.UserID}</td>
                    <td className="admin-user-name">
                      <div className="admin-user-avatar">{u.Name?.slice(0, 2).toUpperCase() || "U"}</div>
                      <span>{u.Name}</span>
                    </td>
                    <td>{u.Email}</td>
                    <td>
                      <span className={`admin-status ${u.Role === "Admin" ? "active" : ""}`}>
                        {u.Role === "Admin" ? "⚙️ Admin" : "👤 User"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
