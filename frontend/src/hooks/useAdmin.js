import { useState } from "react";
import { API, getUserId } from "../api";

export function useAdmin() {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [adminStats, setAdminStats] = useState(null);
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminMsg, setAdminMsg] = useState({ text: "", type: "" });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminVouchers, setAdminVouchers] = useState([]);
  const [adminMovieForm, setAdminMovieForm] = useState({
    title: "", genre: "", description: "", year: 2024, price: "", tmdb_id: "",
  });
  const [adminEditingMovie, setAdminEditingMovie] = useState(null);
  const [adminShowMovieForm, setAdminShowMovieForm] = useState(false);
  const [adminVoucherForm, setAdminVoucherForm] = useState({
    code: "", discount: "", description: "", expiry_date: "",
  });
  const [adminEditingVoucher, setAdminEditingVoucher] = useState(null);
  const [adminShowVoucherForm, setAdminShowVoucherForm] = useState(false);
  const [adminTransactions, setAdminTransactions] = useState([]);
  const [adminTransactionsLoading, setAdminTransactionsLoading] = useState(false);
  const [adminConv, setAdminConv] = useState([]);
  const [adminConvLoading, setAdminConvLoading] = useState(false);
  const [adminConvMessages, setAdminConvMessages] = useState([]);
  const [adminConvUserId, setAdminConvUserId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [adminReplySending, setAdminReplySending] = useState(false);

  async function fetchAdminStats() {
    setAdminStatsLoading(true);
    try {
      const res = await fetch(`${API}/admin/stats`);
      const data = await res.json();
      if (!res.ok) {
        setAdminStats(null);
        setAdminStatsLoading(false);
        return;
      }
      setAdminStats(data);
    } catch {
      setAdminStats(null);
    }
    setAdminStatsLoading(false);
  }

  async function fetchAdminUsers() {
    try {
      const res = await fetch(`${API}/admin/users`);
      const data = await res.json();
      setAdminUsers(data);
    } catch {
      setAdminUsers([]);
    }
  }

  async function fetchAdminVouchers() {
    try {
      const res = await fetch(`${API}/vouchers`);
      setAdminVouchers(await res.json());
    } catch {
      setAdminVouchers([]);
    }
  }

  async function fetchAdminTransactions() {
    setAdminTransactionsLoading(true);
    try {
      const res = await fetch(`${API}/admin/transactions`);
      setAdminTransactions(await res.json());
    } catch {
      setAdminTransactions([]);
    }
    setAdminTransactionsLoading(false);
  }

  async function fetchAdminConvs() {
    setAdminConvLoading(true);
    try {
      const res = await fetch(`${API}/support/conversations`);
      setAdminConv(await res.json());
    } catch {
      setAdminConv([]);
    }
    setAdminConvLoading(false);
  }

  async function openAdminConv(userId) {
    setAdminConvUserId(userId);
    setAdminReplyText("");
    setAdminReplySending(false);
    try {
      const res = await fetch(`${API}/support/messages/${userId}`);
      setAdminConvMessages(await res.json());
    } catch {
      setAdminConvMessages([]);
    }
  }

  async function doAdminReply() {
    const msg = adminReplyText.trim();
    if (!msg || !adminConvUserId) return;
    setAdminReplySending(true);
    try {
      const res = await fetch(`${API}/support/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: adminConvUserId, message: msg, sender_type: "admin" }),
      });
      if (!res.ok) {
        setAdminReplySending(false);
        return;
      }
      setAdminReplyText("");
      await openAdminConv(adminConvUserId);
      await fetchAdminConvs();
    } catch {}
    setAdminReplySending(false);
  }

  function openEditMovie(movie) {
    setAdminEditingMovie(movie);
    setAdminMovieForm({
      title: movie.Title || "",
      genre: movie.Genre || "",
      description: movie.Description || "",
      year: movie.Year || 2024,
      price: movie.Price ? String(movie.Price) : "",
      tmdb_id: movie.TMDB_ID ? String(movie.TMDB_ID) : "",
    });
    setAdminShowMovieForm(true);
    setAdminMsg({ text: "", type: "" });
  }

  async function doSaveMovie(e, onMovieSaved) {
    e.preventDefault();
    setAdminMsg({ text: "", type: "" });
    setAdminLoading(true);
    const body = {
      title: adminMovieForm.title,
      genre: adminMovieForm.genre,
      description: adminMovieForm.description,
      year: parseInt(adminMovieForm.year) || 2024,
      price: parseFloat(adminMovieForm.price) || 0,
      tmdb_id: parseInt(adminMovieForm.tmdb_id) || null,
    };
    try {
      const url = adminEditingMovie
        ? `${API}/movies/${adminEditingMovie.MovieID}`
        : `${API}/movies`;
      const method = adminEditingMovie ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminMsg({ text: data.message, type: "error" });
        setAdminLoading(false);
        return;
      }
      setAdminMsg({
        text: adminEditingMovie ? "✓ Đã cập nhật phim" : "✓ Đã thêm phim",
        type: "success",
      });
      setAdminShowMovieForm(false);
      setAdminEditingMovie(null);
      setAdminMovieForm({ title: "", genre: "", description: "", year: 2024, price: "", tmdb_id: "" });
      setAdminLoading(false);
      if (onMovieSaved) onMovieSaved();
    } catch {
      setAdminMsg({ text: "Lỗi kết nối server", type: "error" });
      setAdminLoading(false);
    }
  }

  async function doDeleteMovie(movieId, onMovieDeleted) {
    if (!confirm("Xóa phim này?")) return;
    try {
      await fetch(`${API}/movies/${movieId}`, { method: "DELETE" });
      setAdminMsg({ text: "✓ Đã xóa phim", type: "success" });
      if (onMovieDeleted) onMovieDeleted();
    } catch {
      setAdminMsg({ text: "Lỗi xóa phim", type: "error" });
    }
  }

  function openEditVoucher(v) {
    setAdminEditingVoucher(v);
    setAdminVoucherForm({
      code: v.Code || "",
      discount: String(v.Discount || ""),
      description: v.Description || "",
      expiry_date: v.ExpiryDate ? v.ExpiryDate.split(" ")[0] : "",
    });
    setAdminShowVoucherForm(true);
    setAdminMsg({ text: "", type: "" });
  }

  async function doSaveVoucher(e) {
    e.preventDefault();
    setAdminMsg({ text: "", type: "" });
    setAdminLoading(true);
    try {
      const body = {
        code: adminVoucherForm.code.toUpperCase(),
        discount: parseInt(adminVoucherForm.discount) || 0,
        description: adminVoucherForm.description,
        expiry_date: adminVoucherForm.expiry_date || new Date().toISOString().split("T")[0],
      };
      let url = `${API}/vouchers`;
      let method = "POST";
      if (adminEditingVoucher) {
        url = `${API}/vouchers/${adminEditingVoucher.VoucherID}`;
        method = "PUT";
        body.active = adminEditingVoucher.Active !== undefined ? adminEditingVoucher.Active : 1;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminMsg({ text: data.message, type: "error" });
        setAdminLoading(false);
        return;
      }
      setAdminMsg({
        text: adminEditingVoucher ? "✓ Đã cập nhật voucher" : "✓ Đã tạo voucher",
        type: "success",
      });
      setAdminShowVoucherForm(false);
      setAdminEditingVoucher(null);
      setAdminVoucherForm({ code: "", discount: "", description: "", expiry_date: "" });
      setAdminLoading(false);
      fetchAdminVouchers();
    } catch {
      setAdminMsg({ text: "Lỗi kết nối server", type: "error" });
      setAdminLoading(false);
    }
  }

  async function doDeleteVoucher(voucherId) {
    if (!confirm("Xóa voucher này?")) return;
    try {
      await fetch(`${API}/vouchers/${voucherId}`, { method: "DELETE" });
      setAdminMsg({ text: "✓ Đã xóa voucher", type: "success" });
      fetchAdminVouchers();
    } catch {
      setAdminMsg({ text: "Lỗi xóa voucher", type: "error" });
    }
  }

  function resetAdmin() {
    setAdminUsers([]);
    setAdminVouchers([]);
    setAdminStats(null);
    setAdminTransactions([]);
  }

  return {
    adminTab, setAdminTab,
    adminStats, setAdminStats,
    adminStatsLoading,
    adminMsg, setAdminMsg,
    adminLoading,
    adminUsers, setAdminUsers,
    adminVouchers,
    adminMovieForm, setAdminMovieForm,
    adminEditingMovie, setAdminEditingMovie,
    adminShowMovieForm, setAdminShowMovieForm,
    adminVoucherForm, setAdminVoucherForm,
    adminEditingVoucher, setAdminEditingVoucher,
    adminShowVoucherForm, setAdminShowVoucherForm,
    adminTransactions, setAdminTransactions,
    adminTransactionsLoading,
    adminConv, setAdminConv,
    adminConvLoading,
    adminConvMessages, setAdminConvMessages,
    adminConvUserId, setAdminConvUserId,
    adminReplyText, setAdminReplyText,
    adminReplySending,
    fetchAdminStats,
    fetchAdminUsers,
    fetchAdminVouchers,
    fetchAdminTransactions,
    fetchAdminConvs,
    openAdminConv,
    doAdminReply,
    openEditMovie,
    doSaveMovie,
    doDeleteMovie,
    openEditVoucher,
    doSaveVoucher,
    doDeleteVoucher,
    resetAdmin,
  };
}
