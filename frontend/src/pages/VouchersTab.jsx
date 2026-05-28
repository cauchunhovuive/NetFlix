import RippleButton from "../components/RippleButton";

export default function VouchersTab({
  vouchers, loadingVouchers, redeemCode, redeemMsg, redeemLoading,
  onSetRedeemCode, onRedeem,
}) {
  return (
    <main className="main-content">
      <div className="section-header">
        <h2 className="section-title">Mã <span>giảm giá</span></h2>
      </div>

      <div className="voucher-redeem-card">
        <div className="voucher-redeem-icon">🏷️</div>
        <div className="voucher-redeem-title">Nhập mã giảm giá</div>
        <div className="voucher-redeem-row">
          <input className="voucher-input" placeholder="VD: SUMMER2024"
            value={redeemCode}
            onChange={e => onSetRedeemCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && onRedeem()}
            maxLength={20} />
          <RippleButton className="btn-redeem" onClick={onRedeem} disabled={redeemLoading}>
            {redeemLoading ? <span className="btn-loading-spinner" /> : "Áp dụng"}
          </RippleButton>
        </div>
        {redeemMsg.text && <div className={`msg ${redeemMsg.type}`} style={{marginTop:12}}>{redeemMsg.text}</div>}
      </div>

      <div className="section-header" style={{marginTop:"2rem",marginBottom:"1rem"}}>
        <h2 className="section-title">Danh sách <span>voucher</span></h2>
        <span className="section-count">{vouchers.length} mã</span>
      </div>

      {loadingVouchers ? (
        <div className="loading">
          <div className="loading-dots"><span /><span /><span /></div>
          <div>Đang tải voucher...</div>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <div className="empty-state-text">Hiện chưa có voucher nào</div>
        </div>
      ) : (
        <div className="voucher-grid">
          {vouchers.map((v, i) => (
            <div key={v.VoucherID ?? i} className="voucher-card" style={{animationDelay:`${i*60}ms`}}>
              <div className="voucher-card-top">
                <div className="voucher-code">{v.Code}</div>
                <div className="voucher-discount">-{v.Discount}%</div>
              </div>
              <div className="voucher-desc">{v.Description || "Không có mô tả"}</div>
              <div className="voucher-expiry">
                📅 HSD: {v.ExpiryDate ? new Date(v.ExpiryDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
