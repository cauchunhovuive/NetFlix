import { useState, useEffect } from "react";
import { API, getUserId } from "../api";

export function useProfile(user) {
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [editMsg, setEditMsg] = useState({ text: "", type: "" });
  const [editingPassword, setEditingPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.Name || "", email: user.Email || "" });
    }
  }, [user]);

  async function doUpdateProfile(e, setUser) {
    e.preventDefault();
    setEditMsg({ text: "", type: "" });
    setEditLoading(true);
    try {
      const res = await fetch(`${API}/user/${getUserId(user)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditMsg({ text: data.message || "Lỗi cập nhật", type: "error" });
        setEditLoading(false);
        return;
      }
      setUser((u) => ({ ...u, Name: editForm.name, Email: editForm.email }));
      setEditMsg({ text: "✓ Cập nhật thông tin thành công", type: "success" });
      setEditLoading(false);
    } catch {
      setEditMsg({ text: "Không kết nối được server", type: "error" });
      setEditLoading(false);
    }
  }

  async function doChangePassword(e) {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      setEditMsg({ text: "Mật khẩu mới không khớp", type: "error" });
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setEditMsg({ text: "Mật khẩu phải có ít nhất 6 ký tự", type: "error" });
      return;
    }
    setEditMsg({ text: "", type: "" });
    setEditLoading(true);
    try {
      const res = await fetch(`${API}/user/${getUserId(user)}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditMsg({ text: data.message || "Lỗi đổi mật khẩu", type: "error" });
        setEditLoading(false);
        return;
      }
      setEditMsg({ text: "✓ Đổi mật khẩu thành công", type: "success" });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setEditingPassword(false);
      setEditLoading(false);
    } catch {
      setEditMsg({ text: "Không kết nối được server", type: "error" });
      setEditLoading(false);
    }
  }

  function resetProfile() {
    setEditMsg({ text: "", type: "" });
  }

  return {
    editForm, setEditForm,
    passwordForm, setPasswordForm,
    editMsg, setEditMsg,
    editingPassword, setEditingPassword,
    editLoading,
    doUpdateProfile, doChangePassword,
    resetProfile,
  };
}
