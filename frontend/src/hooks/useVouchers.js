import { useState } from "react";
import { API } from "../api";

export function useVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState({ text: "", type: "" });
  const [redeemLoading, setRedeemLoading] = useState(false);

  async function fetchVouchers() {
    setLoadingVouchers(true);
    try {
      const res = await fetch(`${API}/vouchers`);
      setVouchers(await res.json());
    } catch {
      setVouchers([]);
    }
    setLoadingVouchers(false);
  }

  async function doRedeem() {
    if (!redeemCode.trim()) {
      setRedeemMsg({ text: "Nhập mã voucher", type: "error" });
      return;
    }
    setRedeemLoading(true);
    setRedeemMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API}/vouchers/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRedeemMsg({ text: data.message, type: "error" });
        setRedeemLoading(false);
        return;
      }
      setRedeemMsg({
        text: `✓ Mã ${data.voucher.Code}: Giảm ${data.voucher.Discount}% - ${data.voucher.Description || "Không có mô tả"}`,
        type: "success",
      });
      setRedeemCode("");
      setRedeemLoading(false);
    } catch {
      setRedeemMsg({ text: "Không kết nối được server", type: "error" });
      setRedeemLoading(false);
    }
  }

  function resetVouchers() {
    setVouchers([]);
  }

  return {
    vouchers, setVouchers,
    loadingVouchers,
    redeemCode, setRedeemCode,
    redeemMsg, setRedeemMsg,
    redeemLoading,
    fetchVouchers,
    doRedeem,
    resetVouchers,
  };
}
