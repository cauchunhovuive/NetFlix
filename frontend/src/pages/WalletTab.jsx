import RippleButton from "../components/RippleButton";

export default function WalletTab({
  walletBalance, transactions, loadingTransactions, purchasedMovies,
  walletTab, purchaseLoading,
  onSetWalletTab, onSetShowTopUp, onPurchaseMovie,
}) {
  return (
    <main className="main-content">
      <div className="section-header">
        <h2 className="section-title">Ví <span>của tôi</span></h2>
      </div>

      <div className="wallet-balance-card">
        <div className="wallet-balance-label">Số dư khả dụng</div>
        <div className="wallet-balance-amount">${parseFloat(walletBalance).toFixed(2)}</div>
        <RippleButton className="btn-wallet-topup" onClick={() => onSetShowTopUp(true)}>
          💳 Nạp tiền
        </RippleButton>
        <div className="wallet-balance-hint">Dùng voucher để nhận thêm ưu đãi khi nạp!</div>
      </div>

      <div className="wallet-subtabs">
        <button className={`wallet-subtab ${walletTab === "transactions" ? "active" : ""}`}
          onClick={() => onSetWalletTab("transactions")}>📋 Lịch sử giao dịch</button>
        <button className={`wallet-subtab ${walletTab === "purchases" ? "active" : ""}`}
          onClick={() => onSetWalletTab("purchases")}>🎬 Phim đã mua</button>
      </div>

      {walletTab === "transactions" && (
        <>
          <div className="section-header" style={{marginBottom:"1rem",marginTop:"1.5rem"}}>
            <h2 className="section-title">Giao dịch <span>gần đây</span></h2>
            <span className="section-count">{transactions.length} giao dịch</span>
          </div>
          {loadingTransactions ? (
            <div className="loading">
              <div className="loading-dots"><span /><span /><span /></div>
              <div>Đang tải giao dịch...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-text">Chưa có giao dịch nào</div>
            </div>
          ) : (
            <div className="tx-list">
              {transactions.map((tx, i) => (
                <div key={tx.TransactionID ?? i} className="tx-row" style={{animationDelay:`${i*40}ms`}}>
                  <div className={`tx-icon ${tx.Type === "topup" ? "tx-icon-in" : "tx-icon-out"}`}>
                    {tx.Type === "topup" ? "📥" : "🎬"}
                  </div>
                  <div className="tx-info">
                    <div className="tx-desc">{tx.Description || tx.Type}</div>
                    <div className="tx-date">{tx.CreatedAt ? new Date(tx.CreatedAt).toLocaleDateString("vi-VN") : "—"}</div>
                  </div>
                  <div className={`tx-amount ${tx.Type === "topup" ? "tx-amount-plus" : "tx-amount-minus"}`}>
                    {tx.Type === "topup" ? "+" : ""}${parseFloat(tx.Amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {walletTab === "purchases" && (
        <>
          <div className="section-header" style={{marginBottom:"1rem",marginTop:"1.5rem"}}>
            <h2 className="section-title">Phim đã <span>mua</span></h2>
            <span className="section-count">{purchasedMovies.length} phim</span>
          </div>
          {purchasedMovies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎬</div>
              <div className="empty-state-text">Bạn chưa mua phim nào</div>
            </div>
          ) : (
            <div className="purchased-list">
              {purchasedMovies.map((p, i) => (
                <div key={p.PurchaseID ?? i} className="purchased-row" style={{animationDelay:`${i*40}ms`}}>
                  <div className="purchased-icon">🎬</div>
                  <div className="purchased-info">
                    <div className="purchased-title">{p.Title}</div>
                    <div className="purchased-meta">{p.Genre || ""}{p.Genre && " · "}${parseFloat(p.Price).toFixed(2)}</div>
                  </div>
                  <div className="purchased-date">
                    {p.CreatedAt ? new Date(p.CreatedAt).toLocaleDateString("vi-VN") : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
