import { useState } from "react";
import { API, getUserId } from "../api";

export function useWallet() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [purchasedMovies, setPurchasedMovies] = useState([]);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(50);
  const [topUpVoucher, setTopUpVoucher] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpMsg, setTopUpMsg] = useState({ text: "", type: "" });
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [walletTab, setWalletTab] = useState("transactions");
  const [purchasedIds, setPurchasedIds] = useState(new Set());

  async function fetchWallet(user) {
    try {
      const res = await fetch(`${API}/wallet/${getUserId(user)}`);
      const data = await res.json();
      if (!res.ok) {
        console.warn("Wallet error:", data.message);
        setWalletBalance(0);
        return;
      }
      setWalletBalance(parseFloat(data.balance) || 0);
    } catch (e) {
      console.warn("Wallet fetch failed:", e);
      setWalletBalance(0);
    }
  }

  async function fetchTransactions(user) {
    setLoadingTransactions(true);
    try {
      const res = await fetch(`${API}/wallet/${getUserId(user)}/transactions`);
      const data = await res.json();
      if (!res.ok) {
        console.warn("Transactions error:", data.message);
        setTransactions([]);
        setLoadingTransactions(false);
        return;
      }
      setTransactions(data);
    } catch (e) {
      console.warn("Failed to fetch transactions:", e);
      setTransactions([]);
    }
    setLoadingTransactions(false);
  }

  async function fetchPurchasedMovies(user) {
    try {
      const res = await fetch(`${API}/wallet/${getUserId(user)}/purchases`);
      const data = await res.json();
      if (!res.ok) {
        console.warn("Purchases error:", data.message);
        setPurchasedMovies([]);
        setPurchasedIds(new Set());
        return;
      }
      setPurchasedMovies(data);
      setPurchasedIds(new Set(data.map((p) => Number(p.MovieID))));
    } catch (e) {
      console.warn("Failed to fetch purchases:", e);
      setPurchasedMovies([]);
      setPurchasedIds(new Set());
    }
  }

  async function doTopUp(e, user, onRefreshTransactions) {
    e.preventDefault();
    if (!topUpAmount || topUpAmount <= 0) {
      setTopUpMsg({ text: "Nhập số tiền hợp lệ", type: "error" });
      return;
    }
    setTopUpLoading(true);
    setTopUpMsg({ text: "", type: "" });
    try {
      const body = { user_id: getUserId(user), amount: parseFloat(topUpAmount) };
      if (topUpVoucher.trim()) body.voucher_code = topUpVoucher.trim().toUpperCase();
      const res = await fetch(`${API}/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setTopUpMsg({ text: data.message, type: "error" });
        setTopUpLoading(false);
        return;
      }
      setTopUpMsg({ text: data.message, type: "success" });
      setWalletBalance(parseFloat(data.balance));
      setTopUpAmount(50);
      setTopUpVoucher("");
      setTopUpLoading(false);
      if (onRefreshTransactions) onRefreshTransactions(user);
    } catch {
      setTopUpMsg({ text: "Lỗi kết nối server", type: "error" });
      setTopUpLoading(false);
    }
  }

  async function doPurchaseMovie(movieId, user, onRefreshPurchases, onRefreshTransactions, onToast) {
    setPurchaseLoading(true);
    try {
      const res = await fetch(`${API}/wallet/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: getUserId(user), movie_id: movieId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (onToast) onToast(data.message || "Lỗi mua phim", "error");
        setPurchaseLoading(false);
        return;
      }
      if (onToast) onToast(data.message, "success");
      setWalletBalance(parseFloat(data.balance));
      setPurchaseLoading(false);
      if (onRefreshPurchases) onRefreshPurchases(user);
      if (onRefreshTransactions) onRefreshTransactions(user);
    } catch {
      if (onToast) onToast("Lỗi kết nối server", "error");
      setPurchaseLoading(false);
    }
  }

  function resetWallet() {
    setWalletBalance(0);
    setTransactions([]);
    setPurchasedMovies([]);
    setPurchasedIds(new Set());
  }

  return {
    walletBalance, setWalletBalance,
    transactions,
    loadingTransactions,
    purchasedMovies,
    showTopUp, setShowTopUp,
    topUpAmount, setTopUpAmount,
    topUpVoucher, setTopUpVoucher,
    topUpLoading,
    topUpMsg, setTopUpMsg,
    purchaseLoading,
    walletTab, setWalletTab,
    purchasedIds,
    fetchWallet,
    fetchTransactions,
    fetchPurchasedMovies,
    doTopUp,
    doPurchaseMovie,
    resetWallet,
  };
}
