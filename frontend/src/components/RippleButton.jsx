import { useCallback, useState } from "react";

export function useRipple() {
  const [ripples, setRipples] = useState([]);
  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rip => rip.id !== id)), 600);
  }, []);
  return { ripples, addRipple };
}

export default function RippleButton({ className, onClick, children, disabled, style }) {
  const { ripples, addRipple } = useRipple();
  return (
    <button
      className={`ripple-btn ${className || ""}`}
      style={{ position: "relative", overflow: "hidden", ...style }}
      onClick={e => { if (!disabled) { addRipple(e); onClick?.(e); } }}
      disabled={disabled}
    >
      {children}
      {ripples.map(r => (
        <span key={r.id} className="ripple-circle" style={{ left: r.x, top: r.y }} />
      ))}
    </button>
  );
}
