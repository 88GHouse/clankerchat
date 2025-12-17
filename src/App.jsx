import { useState, useEffect } from "react";

const CLANKER = { 
  id: "clanker", 
  name: "Clanker", 
  role: "Clanker", 
  color: "#4f46e5" 
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: crypto.randomUUID(),
      senderId: "user",
      senderName: "user",
      role: "User",
      color: "#ffffff",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    let replyText = "Clanker is silent."; // default fallback
try {
  const res = await fetch("/api/clanker-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clankerId: CLANKER.id,
      userText: text,
    }),
  });

  if (!res.ok) {
    // If backend returns 4xx/5xx
    throw new Error(`Server responded with ${res.status}`);
  }

  const autoReply = await res.json();
  console.log("Backend reply:", autoReply);

  if (autoReply && typeof autoReply.reply === "string") {
    replyText = autoReply.reply;
  } else {
    replyText = "Clanker received no reply.";
  }
} catch (err) {
  console.error("Fetch failed:", err);
  replyText = "Backend error — clanker is silent.";
}


    const replyMsg = {
      id: crypto.randomUUID(),
      senderId: CLANKER.id,
      senderName: CLANKER.name,
      role: CLANKER.role,
      color: CLANKER.color,
      text: replyText,
      ts: Date.now() + 1,
    };
    setMessages((prev) => [...prev, replyMsg]);
  };

  useEffect(() => {
    localStorage.setItem("clanker-messages", JSON.stringify(messages));
  }, [messages]);

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Clanker Chat</h1>
      </header>

      <main style={styles.chat}>
        {messages.length === 0 && (
          <div style={styles.empty}>No messages yet. Say something to Clanker!</div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ ...styles.msg, borderLeft: `4px solid ${m.color}` }}>
            <div style={styles.msgMeta}>
              <span style={{ color: m.color, fontWeight: 700 }}>{m.senderName}</span>
              <span style={styles.role}>({m.role})</span>
            </div>
            <div>{m.text}</div>
          </div>
        ))}
      </main>

      <footer style={styles.footer}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </footer>
    </div>
  );
}

const styles = {
  app: { maxWidth: 800, margin: "0 auto", fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, gap: 8 },
  title: { margin: 0 },
  chat: { background: "#0f172a", color: "white", padding: 16, minHeight: 400, borderRadius: 8 },
  empty: { opacity: 0.8 },
  msg: { background: "#1f2937", padding: 12, borderRadius: 6, marginBottom: 10 },
  msgMeta: { marginBottom: 6 },
  role: { marginLeft: 8, opacity: 0.7 },
  footer: { display: "flex", gap: 8, padding: 16 },
  input: { flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 6 },
  button: { padding: "10px 14px", background: "#4f46e5", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }
};

export default App;
