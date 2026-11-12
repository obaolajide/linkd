"use client";

import { useEffect, useState, useCallback } from "react";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";

interface Message {
  _id: string;
  text: string;
  type: "text" | "link";
  createdAt: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMessages(data);
    } catch {
      setError("Could not load messages. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void fetchMessages();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [fetchMessages]);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>linkd</h1>
        <button style={styles.refreshBtn} onClick={fetchMessages}>
          ↻ Refresh
        </button>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {loading ? (
          <div style={styles.center}>
            <p style={styles.muted}>Loading messages...</p>
          </div>
        ) : error ? (
          <div style={styles.center}>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retryBtn} onClick={fetchMessages}>
              Retry
            </button>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input */}
      <div style={styles.footer}>
        <MessageInput onMessageSent={fetchMessages} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "#f7f7f7",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e0e0e0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  refreshBtn: {
    backgroundColor: "transparent",
    border: "1px solid #d0d0d0",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#444444",
  },
  body: {
    flex: 1,
    overflowY: "auto",
  },
  footer: {
    position: "sticky",
    bottom: 0,
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e0e0e0",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    gap: "12px",
  },
  muted: {
    color: "#999999",
    fontSize: "14px",
  },
  errorText: {
    color: "#cc0000",
    fontSize: "14px",
  },
  retryBtn: {
    padding: "8px 16px",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
};
