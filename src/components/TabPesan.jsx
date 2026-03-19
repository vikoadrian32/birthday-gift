import { useState, useRef, useEffect } from "react";
import { config } from "../config";

function TypingBubble() {
  return (
    <div className="chat-bubble" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "10px 14px" }}>
      <span style={dotStyle(0)} />
      <span style={dotStyle(0.2)} />
      <span style={dotStyle(0.4)} />
    </div>
  );
}

function dotStyle(delay) {
  return {
    display: "inline-block",
    width: "7px", height: "7px",
    borderRadius: "50%",
    background: "#666",
    animation: `typingDot 1s ease-in-out ${delay}s infinite`,
  };
}

const getNow = () => {
  const d = new Date();
  return d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0");
};

export default function TabPesan({ onNext, onFinish, onFirstReply, expanded = false }) {
  const [pesan, setPesan]           = useState([]);
  const [typing, setTyping]         = useState(false);
  const [input, setInput]           = useState("");
  const [replyCount, setReplyCount] = useState(0);
  const [step, setStep]             = useState(0);
  const [finished, setFinished]     = useState(false);

  const chatRef  = useRef(null);
  const initDone = useRef(false);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [pesan, typing]);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const first = config.pesanAwal[0];
    setTimeout(() => {
      setPesan([{ ...first, waktu: getNow() }]);
      setStep(1);
    }, 500);
  }, []);

  const kirim = () => {
    const teks = input.trim();
    if (!teks || finished) return;

    setPesan((prev) => [...prev, { id: Date.now(), teks, dari: "dia", waktu: getNow() }]);
    setInput("");

    const next = replyCount + 1;
    setReplyCount(next);

    // Begitu user kirim pesan pertama → unlock semua tombol di parent
    if (next === 1) onFirstReply?.();

    if (step === 1) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setPesan((prev) => [...prev, { ...config.pesanAwal[1], waktu: getNow() }]);
        setStep(2);
      }, 1200);
    }

    if (next >= 2) {
      setTimeout(() => setTyping(true), 700);
      setTimeout(() => {
        setTyping(false);
        const akhir = config.pesanAkhir;
        setPesan((prev) => [...prev, { id: Date.now() + 1, teks: akhir.teks, dari: akhir.dari, waktu: getNow() }]);
        setFinished(true);
        onFinish?.(); // ← beritahu BirthdayPlayer bahwa chat sudah selesai
      }, 2000);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") kirim(); };

  return (
    <>
      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .next-wrapper {
          display: flex;
          justify-content: center;
          padding: 10px 12px 6px;
        }
        .next-btn-retro {
          width: 100%;
          padding: 8px 0;
          background: linear-gradient(180deg, #8B2525 0%, #6B1A1A 50%, #4A0E0E 100%);
          color: #D4A017;
          border-top: 2px solid #c04040;
          border-left: 2px solid #c04040;
          border-right: 2px solid #2a0808;
          border-bottom: 2px solid #2a0808;
          border-radius: 4px;
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          letter-spacing: 2px;
          cursor: pointer;
          box-shadow: 0 4px 0 #1a0505, 0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: all 0.1s ease;
          text-shadow: 0 0 8px rgba(212,160,23,0.6);
        }
        .next-btn-retro:hover {
          background: linear-gradient(180deg, #a03030 0%, #7a2020 50%, #5a1212 100%);
          color: #f0c040;
        }
        .next-btn-retro:active {
          transform: translateY(3px);
          box-shadow: 0 1px 0 #1a0505;
        }
      `}</style>

      <div className="pesan-header">— PESAN —</div>

      <div
        className="chat-area"
        ref={chatRef}
        style={expanded ? { height: "calc(90vh - 165px)" } : {}}
      >
        {pesan.map((p) => (
          <div key={p.id || p.teks} className={`chat-bubble ${p.dari === "dia" ? "sent" : ""}`}>
            {p.teks}
            <span className="bubble-time">{p.waktu}</span>
          </div>
        ))}
        {typing && <TypingBubble />}
      </div>

      {!finished && (
        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Ketik pesan..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="send-btn" onClick={kirim}>➤</button>
        </div>
      )}

      {finished && (
        <div className="next-wrapper">
          <button className="next-btn-retro" onClick={onNext}>
            ▶ BUKA GALERI ◀
          </button>
        </div>
      )}
    </>
  );
}