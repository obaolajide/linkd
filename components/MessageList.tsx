"use client";

import { webUrl } from "@/lib/share";

interface Message {
  _id: string;
  text: string;
  type: "text" | "link";
  createdAt: string;
  title?: string;
}

interface Props {
  messages: Message[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageList({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No messages yet. Send one from any device.</p>
      </div>
    );
  }

  return (
    <ul style={styles.list}>
      {messages.map((msg) => (
        <li key={msg._id} style={styles.item}>
          <div style={styles.topRow}>
            <span
              style={{
                ...styles.badge,
                backgroundColor: msg.type === "link" ? "#e8f0fe" : "#f0f0f0",
                color: msg.type === "link" ? "#1a73e8" : "#444444",
              }}
            >
              {msg.type === "link" ? " link" : " text"}
            </span>
            <span style={styles.date}>{formatDate(msg.createdAt)}</span>
          </div>

          <div style={styles.textRow}>
            {msg.type === "link" && webUrl(msg.text) ? (
              <a href={msg.text} target="_blank" rel="noopener noreferrer" style={styles.link}>
                {msg.title || msg.text}
              </a>
            ) : (
              <p style={styles.text}>{msg.text}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    listStyle: "none",
    margin: 0,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  item: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  date: {
    fontSize: "11px",
    color: "#999999",
  },
  textRow: {
    marginTop: "2px",
  },
  text: {
    margin: 0,
    fontSize: "14px",
    color: "#222222",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  link: {
    fontSize: "14px",
    color: "#1a73e8",
    wordBreak: "break-all",
    textDecoration: "underline",
  },
  empty: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    color: "#999999",
    fontSize: "14px",
  },
};
