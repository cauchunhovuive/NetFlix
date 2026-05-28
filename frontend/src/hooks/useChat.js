import { useState } from "react";
import { API, getUserId } from "../api";

export function useChat() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  async function fetchChatMessages(user) {
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/support/messages/${getUserId(user)}`);
      const data = await res.json();
      if (!res.ok) {
        setChatMessages([]);
        setChatLoading(false);
        return;
      }
      setChatMessages(data);
    } catch {
      setChatMessages([]);
    }
    setChatLoading(false);
  }

  async function doSendChat(user) {
    const msg = chatText.trim();
    if (!msg) return;
    setChatSending(true);
    try {
      const res = await fetch(`${API}/support/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: getUserId(user), message: msg, sender_type: "user" }),
      });
      if (!res.ok) {
        setChatSending(false);
        return;
      }
      setChatText("");
      await fetchChatMessages(user);
    } catch {}
    setChatSending(false);
  }

  return {
    chatOpen, setChatOpen,
    chatMessages, setChatMessages,
    chatText, setChatText,
    chatSending,
    chatLoading,
    fetchChatMessages,
    doSendChat,
  };
}
