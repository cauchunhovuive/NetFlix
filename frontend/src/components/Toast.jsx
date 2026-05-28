import { useEffect, useRef } from "react";

const ICONS = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
};

export default function Toast({ toast, onRemove }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 3500);
    return () => clearTimeout(timerRef.current);
  }, []);

  function handleClick() {
    clearTimeout(timerRef.current);
    onRemove(toast.id);
  }

  return (
    <div className={`toast toast-${toast.type}`} onClick={handleClick}>
      <span className="toast-icon">{ICONS[toast.type] || ICONS.info}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={(e) => { e.stopPropagation(); handleClick(); }}>✕</button>
    </div>
  );
}
