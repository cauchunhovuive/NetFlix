import RippleButton from "../components/RippleButton";

export default function SupportChat({
  user, chatOpen, chatMessages, chatLoading, chatText, chatSending,
  onSetChatOpen, onFetchChatMessages, onSetChatText, onSendChat,
}) {
  if (!user) return null;

  return (
    <>
      <button
        className={`chat-fab ${chatOpen ? "chat-fab-active" : ""}`}
        onClick={() => {
          if (!chatOpen) onFetchChatMessages();
          onSetChatOpen(!chatOpen);
        }}
        title="Hỗ trợ"
      >
        {chatOpen ? "✕" : "💬"}
      </button>

      {chatOpen && (
        <div className="chatbox">
          <div className="chatbox-header">
            <span>💬 Hỗ trợ người dùng</span>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>Chat trực tuyến</span>
          </div>
          <div className="chatbox-messages">
            {chatLoading ? (
              <div className="chatbox-loading">
                <div className="loading-dots"><span /><span /><span /></div>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="chatbox-empty">
                <div className="chatbox-empty-icon">💬</div>
                <div className="chatbox-empty-text">Bạn cần hỗ trợ gì? Hãy gửi tin nhắn cho chúng tôi!</div>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={msg.MessageID ?? i}
                  className={`chat-msg ${msg.SenderType === "user" ? "chat-msg-user" : "chat-msg-admin"}`}>
                  <div className="chat-msg-avatar">{msg.SenderType === "user" ? "👤" : "🎧"}</div>
                  <div className="chat-msg-content">
                    <div className="chat-msg-bubble">{msg.MESSAGE || msg.Message}</div>
                    <div className="chat-msg-time">
                      {msg.CreatedAt ? new Date(msg.CreatedAt).toLocaleString("vi-VN") : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <form className="chatbox-input" onSubmit={e => { e.preventDefault(); onSendChat(); }}>
            <input className="chatbox-input-field" placeholder="Nhập tin nhắn..."
              value={chatText}
              onChange={e => onSetChatText(e.target.value)}
              maxLength={500} />
            <button type="submit" className="chatbox-send-btn" disabled={chatSending || !chatText.trim()}>
              {chatSending ? <span className="btn-loading-spinner" /> : "Gửi"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
