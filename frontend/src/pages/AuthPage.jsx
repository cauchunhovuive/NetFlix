import { useState } from "react";
import RippleButton from "../components/RippleButton";
import AuthParticles from "../components/AuthParticles";

export default function AuthPage({
  pageVisible, authTab, loginForm, registerForm, authMsg,
  showPassword, showRegPassword, authLoading, formAnimDir, cardRef, mousePos,
  onSetMousePos, onSwitchAuthTab, onSetLoginForm, onSetRegisterForm,
  onSetShowPassword, onSetShowRegPassword, onLogin, onRegister,
}) {
  const loginPanelClass = formAnimDir === "right" ? "exit-left"
    : (formAnimDir === "left" ? "enter-right" : "enter-right");
  const registerPanelClass = formAnimDir === "left" ? "exit-right"
    : (formAnimDir === "right" ? "enter-left" : "enter-left");

  const isLoginVisible = !formAnimDir || (formAnimDir === "left");
  const isRegisterVisible = !formAnimDir || (formAnimDir === "right");

  return (
    <div
      className={`auth-bg ${pageVisible ? "page-visible" : "page-hidden"}`}
      onMouseMove={e => {
        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          onSetMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }
      }}
    >
      <AuthParticles />
      <div className="auth-ambient" />
      <div className="auth-grid" />
      <div className="auth-card" ref={cardRef}>
        <div
          className="auth-spotlight"
          style={{
            "--mx": `${mousePos.x}%`,
            "--my": `${mousePos.y}%`,
          }}
        />
        <div className="auth-card-inner">
          <div className="auth-logo">
            <span className="logo-n">N</span>ETFLIX
          </div>
          <div className="auth-tagline">Xem phim không giới hạn</div>
          <div className="auth-tabs">
            <button
              className={authTab === "login" ? "auth-tab active" : "auth-tab"}
              onClick={() => onSwitchAuthTab("login")}
            >Đăng nhập</button>
            <button
              className={authTab === "register" ? "auth-tab active" : "auth-tab"}
              onClick={() => onSwitchAuthTab("register")}
            >Đăng ký</button>
          </div>

          <div className="auth-form-slider">
            <div className={`auth-form-panel ${isLoginVisible ? loginPanelClass : "exit-left"}`}
              style={{ display: authTab === "login" || formAnimDir ? "block" : "none" }}>
              <form onSubmit={onLogin} className="auth-form">
                <div className="form-group">
                  <label>Email</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">✉</span>
                    <input type="email" placeholder="email@example.com" value={loginForm.email}
                      onChange={e => onSetLoginForm({ ...loginForm, email: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">🔒</span>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={loginForm.password}
                      onChange={e => onSetLoginForm({ ...loginForm, password: e.target.value })} required />
                    <button type="button" className="btn-pw-toggle"
                      onClick={() => onSetShowPassword(!showPassword)} tabIndex={-1}
                    >{showPassword ? "🙈" : "👁"}</button>
                  </div>
                </div>
                <RippleButton className={`btn-primary${authLoading ? " loading" : ""}`} disabled={authLoading}>
                  {authLoading ? (
                    <><span className="btn-loading-spinner" /> Đang xử lý...</>
                  ) : (
                    <><span>Đăng nhập</span><span className="btn-arrow">→</span></>
                  )}
                </RippleButton>
              </form>
            </div>

            <div className={`auth-form-panel ${isRegisterVisible ? registerPanelClass : "exit-right"}`}
              style={{ display: authTab === "register" || formAnimDir ? "block" : "none" }}>
              <form onSubmit={onRegister} className="auth-form">
                <div className="form-group">
                  <label>Họ tên</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">👤</span>
                    <input placeholder="Nguyễn Văn A" value={registerForm.name}
                      onChange={e => onSetRegisterForm({ ...registerForm, name: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">✉</span>
                    <input type="email" placeholder="email@example.com" value={registerForm.email}
                      onChange={e => onSetRegisterForm({ ...registerForm, email: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="form-input-wrap">
                    <span className="form-input-icon">🔒</span>
                    <input type={showRegPassword ? "text" : "password"} placeholder="••••••••" value={registerForm.password}
                      onChange={e => onSetRegisterForm({ ...registerForm, password: e.target.value })} required />
                    <button type="button" className="btn-pw-toggle"
                      onClick={() => onSetShowRegPassword(!showRegPassword)} tabIndex={-1}
                    >{showRegPassword ? "🙈" : "👁"}</button>
                  </div>
                </div>
                <RippleButton className={`btn-primary${authLoading ? " loading" : ""}`} disabled={authLoading}>
                  {authLoading ? (
                    <><span className="btn-loading-spinner" /> Đang xử lý...</>
                  ) : (
                    <><span>Tạo tài khoản</span><span className="btn-arrow">→</span></>
                  )}
                </RippleButton>
              </form>
            </div>
          </div>

          <div className="auth-divider"><span>Đăng nhập nhanh</span></div>

          <div className="auth-features">
            <div className="auth-feature"><span className="auth-feature-icon">🎬</span><span>Phim HD</span></div>
            <div className="auth-feature"><span className="auth-feature-icon">🔒</span><span>Bảo mật</span></div>
            <div className="auth-feature"><span className="auth-feature-icon">⚡</span><span>Không giới hạn</span></div>
          </div>

          {authMsg.text && <div className={`msg ${authMsg.type}`}>{authMsg.text}</div>}
        </div>
      </div>
    </div>
  );
}
