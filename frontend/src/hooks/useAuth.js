import { useState, useEffect, useRef } from "react";
import { API } from "../api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("auth");
  const [authTab, setAuthTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [authMsg, setAuthMsg] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [formAnimDir, setFormAnimDir] = useState(null);
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setPageVisible(true), 50);
  }, [page]);

  function switchAuthTab(tab) {
    if (tab === authTab) return;
    setFormAnimDir(tab === "login" ? "left" : "right");
    setAuthMsg({ text: "", type: "" });
    setTimeout(() => {
      setAuthTab(tab);
      setFormAnimDir(null);
    }, 300);
  }

  async function doLogin(e) {
    e.preventDefault();
    setAuthMsg({ text: "", type: "" });
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthMsg({ text: data.message || "Sai thông tin đăng nhập", type: "error" });
        setAuthLoading(false);
        return;
      }
      setAuthLoading(false);
      setUser(data.user);
      setPageVisible(false);
      setTimeout(() => {
        setPage("main");
        setAuthTab("login");
      }, 300);
    } catch {
      setAuthMsg({ text: "Không kết nối được server", type: "error" });
      setAuthLoading(false);
    }
  }

  async function doRegister(e) {
    e.preventDefault();
    setAuthMsg({ text: "", type: "" });
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthMsg({ text: data.message || "Lỗi đăng ký", type: "error" });
        setAuthLoading(false);
        return;
      }
      setAuthMsg({ text: "Đăng ký thành công! Đang chuyển về đăng nhập...", type: "success" });
      setAuthLoading(false);
      setTimeout(() => {
        setAuthTab("login");
        setAuthMsg({ text: "", type: "" });
      }, 1500);
    } catch {
      setAuthMsg({ text: "Không kết nối được server", type: "error" });
      setAuthLoading(false);
    }
  }

  return {
    user, setUser,
    page, setPage,
    authTab, setAuthTab,
    loginForm, setLoginForm,
    registerForm, setRegisterForm,
    authMsg, setAuthMsg,
    showPassword, setShowPassword,
    showRegPassword, setShowRegPassword,
    authLoading, setAuthLoading,
    formAnimDir, setFormAnimDir,
    cardRef,
    mousePos, setMousePos,
    pageVisible, setPageVisible,
    doLogin, doRegister, switchAuthTab,
  };
}
