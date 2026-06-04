import { useState } from "react";
import RippleButton from "../components/RippleButton";

function AdminPagination({ page, totalPages, onSetPage }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page <= 1}
        onClick={() => onSetPage(p => Math.max(1, p - 1))}>‹ Trước</button>
      <div className="page-numbers">
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pn;
          if (totalPages <= 7) pn = i + 1;
          else if (page <= 4) pn = i + 1;
          else if (page >= totalPages - 3) pn = totalPages - 6 + i;
          else pn = page - 3 + i;
          return (
            <button key={pn} className={`page-num ${page === pn ? "active" : ""}`}
              onClick={() => onSetPage(pn)}>{pn}</button>
          );
        })}
      </div>
      <button className="page-btn" disabled={page >= totalPages}
        onClick={() => onSetPage(p => Math.min(totalPages, p + 1))}>Sau ›</button>
      <span className="page-info">Trang {page}/{totalPages}</span>
    </div>
  );
}

export default function AdminTab({
  user, adminTab, adminStats, adminStatsLoading, adminMsg, adminLoading,
  adminUsers, movies, adminVouchers,
  adminTransactions, adminTransactionsLoading,
  adminMovieForm, adminEditingMovie,
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
  const [movieSearch, setMovieSearch] = useState("");
  const [voucherSearch, setVoucherSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [txPage, setTxPage] = useState(1);
  const [moviePage, setMoviePage] = useState(1);
  const [voucherPage, setVoucherPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter & paginate movies
  const filteredMovies = movies.filter(m => {
    if (!movieSearch) return true;
    const q = movieSearch.toLowerCase();
    return (m.Title || "").toLowerCase().includes(q)
      || (m.Genre || "").toLowerCase().includes(q)
      || (m.Description || "").toLowerCase().includes(q);
  });
  const movieTotalPages = Math.max(1, Math.ceil(filteredMovies.length / ITEMS_PER_PAGE));
  const safeMoviePage = Math.min(moviePage, movieTotalPages);
  const paginatedMovies = filteredMovies.slice(
    (safeMoviePage - 1) * ITEMS_PER_PAGE,
    safeMoviePage * ITEMS_PER_PAGE
  );

  // Filter & paginate vouchers
  const filteredVouchers = adminVouchers.filter(v => {
    if (!voucherSearch) return true;
    const q = voucherSearch.toLowerCase();
    return (v.Code || "").toLowerCase().includes(q)
      || (v.Description || "").toLowerCase().includes(q);
  });
  const voucherTotalPages = Math.max(1, Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE));
  const safeVoucherPage = Math.min(voucherPage, voucherTotalPages);
  const paginatedVouchers = filteredVouchers.slice(
    (safeVoucherPage - 1) * ITEMS_PER_PAGE,
    safeVoucherPage * ITEMS_PER_PAGE
  );

  // Filter & paginate transactions
  const filteredTxs = adminTransactions.filter(tx => {
    if (!txSearch) return true;
    const q = txSearch.toLowerCase();
    return (tx.Description || "").toLowerCase().includes(q)
      || (tx.Name || "").toLowerCase().includes(q)
      || (tx.Email || "").toLowerCase().includes(q)
      || String(tx.TransactionID || "").includes(q)
      || String(tx.Amount || "").includes(q)
      || (tx.Type || "").toLowerCase().includes(q);
  });
  const txTotalPages = Math.max(1, Math.ceil(filteredTxs.length / ITEMS_PER_PAGE));
  const safeTxPage = Math.min(txPage, txTotalPages);
  const paginatedTxs = filteredTxs.slice(
    (safeTxPage - 1) * ITEMS_PER_PAGE,
    safeTxPage * ITEMS_PER_PAGE
  );

  // Filter & paginate users
  const filteredUsers = adminUsers.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (u.Name || "").toLowerCase().includes(q)
      || (u.Email || "").toLowerCase().includes(q);
  });
  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safeUserPage = Math.min(userPage, userTotalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeUserPage - 1) * ITEMS_PER_PAGE,
    safeUserPage * ITEMS_PER_PAGE
  );

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
          { key: "transactions", label: "💳 Giao dịch" },
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
            <input className="admin-input" style={{maxWidth:280}} placeholder="🔍 Tìm phim..."
              value={movieSearch}
              onChange={e => { setMovieSearch(e.target.value); setMoviePage(1); }} />
            <span className="section-count">{filteredMovies.length}/{movies.length} phim</span>
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
                {paginatedMovies.map(m => (
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
          <AdminPagination page={safeMoviePage} totalPages={movieTotalPages} onSetPage={setMoviePage} />

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
            <input className="admin-input" style={{maxWidth:280}} placeholder="🔍 Tìm voucher..."
              value={voucherSearch}
              onChange={e => { setVoucherSearch(e.target.value); setVoucherPage(1); }} />
            <span className="section-count">{filteredVouchers.length}/{adminVouchers.length} voucher</span>
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
                {paginatedVouchers.map(v => (
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
          <AdminPagination page={safeVoucherPage} totalPages={voucherTotalPages} onSetPage={setVoucherPage} />

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

      {/* Transactions */}
      {adminTab === "transactions" && (
        <>
          <div className="admin-toolbar">
            <input className="admin-input" style={{maxWidth:320}} placeholder="🔍 Tìm giao dịch (mô tả, user, email, ID, số tiền, loại)..."
              value={txSearch}
              onChange={e => { setTxSearch(e.target.value); setTxPage(1); }} />
            <span className="section-count">{filteredTxs.length}/{adminTransactions.length} giao dịch</span>
          </div>
          {adminTransactionsLoading ? (
            <div className="loading">
              <div className="loading-dots"><span /><span /><span /></div>
              <div>Đang tải giao dịch...</div>
            </div>
          ) : adminTransactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-text">Chưa có giao dịch nào</div>
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>ID</th><th>Người dùng</th><th>Email</th><th>Số tiền</th><th>Loại</th><th>Mô tả</th><th>VoucherID</th><th>Ngày tạo</th></tr>
                  </thead>
                  <tbody>
                    {paginatedTxs.map(tx => (
                      <tr key={tx.TransactionID}>
                        <td>#{tx.TransactionID}</td>
                        <td className="admin-user-name">
                          <div className="admin-user-avatar">{(tx.Name || "U").slice(0, 2).toUpperCase()}</div>
                          <span>{tx.Name || "—"}</span>
                        </td>
                        <td>{tx.Email || "—"}</td>
                        <td>
                          <span className={`tx-amount ${tx.Type === 'topup' ? 'tx-amount-plus' : 'tx-amount-minus'}`}>
                            {tx.Type === 'topup' ? '+' : ''}${parseFloat(tx.Amount).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status ${tx.Type === 'topup' ? 'active' : ''}`}>
                            {tx.Type === 'topup' ? '📥 Nạp' : '🎬 Mua'}
                          </span>
                        </td>
                        <td className="admin-desc-cell">{tx.Description || "—"}</td>
                        <td>{tx.VoucherID ? <span className="admin-genre-tag">#{tx.VoucherID}</span> : "—"}</td>
                        <td>{tx.CreatedAt ? new Date(tx.CreatedAt).toLocaleString("vi-VN") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AdminPagination page={safeTxPage} totalPages={txTotalPages} onSetPage={setTxPage} />
            </>
          )}
        </>
      )}

      {/* Users */}
      {adminTab === "users" && (
        <>
          <div className="admin-toolbar">
            <input className="admin-input" style={{maxWidth:280}} placeholder="🔍 Tìm người dùng..."
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); setUserPage(1); }} />
            <span className="section-count">{filteredUsers.length}/{adminUsers.length} người dùng</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Tên</th><th>Email</th><th>Vai trò</th></tr>
              </thead>
              <tbody>
                {paginatedUsers.map(u => (
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
          <AdminPagination page={safeUserPage} totalPages={userTotalPages} onSetPage={setUserPage} />
        </>
      )}


    </main>
  );
}
