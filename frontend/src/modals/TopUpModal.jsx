import RippleButton from "../components/RippleButton";

export default function TopUpModal({
  showTopUp, walletBalance, topUpAmount, topUpVoucher, topUpLoading, topUpMsg,
  onSetShowTopUp, onSetTopUpAmount, onSetTopUpVoucher, onTopUp,
}) {
  if (!showTopUp) return null;

  return (
    <div className="admin-modal-overlay" onClick={e => {
      if (e.target === e.currentTarget) { onSetShowTopUp(false); onSetTopUpMsg?.({ text: "", type: "" }); }
    }}>
      <div className="admin-modal" style={{maxWidth:440}}>
        <div className="admin-modal-title">
          💰 Nạp tiền vào ví
          <button className="admin-modal-close" onClick={() => { onSetShowTopUp(false); onSetTopUpMsg?.({ text: "", type: "" }); }}>✕</button>
        </div>
        <form onSubmit={onTopUp} className="admin-form">
          <div className="form-group">
            <label>Số dư hiện tại</label>
            <div style={{fontSize:32,fontFamily:'"Bebas Neue",sans-serif',letterSpacing:2,color:'var(--green)'}}>
              ${parseFloat(walletBalance).toFixed(2)}
            </div>
          </div>
          <div className="form-group">
            <label>Chọn số tiền</label>
            <div className="topup-amounts">
              {[10, 20, 50, 100, 200].map(amt => (
                <button key={amt} type="button"
                  className={`topup-amount-btn ${topUpAmount === amt ? "active" : ""}`}
                  onClick={() => { onSetTopUpAmount(amt); onSetTopUpMsg?.({ text: "", type: "" }); }}
                >${amt}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Hoặc nhập số tiền</label>
            <input className="admin-input" type="number" min="1" placeholder="Nhập số tiền..."
              value={topUpAmount}
              onChange={e => { onSetTopUpAmount(e.target.value); onSetTopUpMsg?.({ text: "", type: "" }); }} />
          </div>
          <div className="form-group">
            <label>Mã giảm giá (nếu có)</label>
            <input className="admin-input" placeholder="Nhập mã voucher..." maxLength={20}
              value={topUpVoucher}
              onChange={e => { onSetTopUpVoucher(e.target.value.toUpperCase()); onSetTopUpMsg?.({ text: "", type: "" }); }} />
          </div>
          {topUpMsg.text && <div className={`msg ${topUpMsg.type}`} style={{marginTop:0}}>{topUpMsg.text}</div>}
          <div className="admin-form-actions">
            <RippleButton className="btn-primary" disabled={topUpLoading}>
              {topUpLoading ? <><span className="btn-loading-spinner" /> Đang xử lý...</> : `💳 Nạp $${topUpAmount || 0}`}
            </RippleButton>
            <button type="button" className="btn-cancel"
              onClick={() => { onSetShowTopUp(false); onSetTopUpMsg?.({ text: "", type: "" }); }}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}
