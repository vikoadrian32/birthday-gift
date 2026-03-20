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


const getPesanById = (id) => config.pesanAwal.find((p) => p.id === id);

function OpsiPanel({ opsiAktif, onPilih }) {
  return (
    <div style={{
      padding: "10px 12px 8px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      borderTop: "1px solid #8aae6e",
    }}>
      <div style={{
        fontSize: "7px",
        fontFamily: "'Press Start 2P', monospace",
        color: "#4a6e36",
        letterSpacing: "1.5px",
        marginBottom: "2px",
        textAlign: "right",
      }}>
        PILIH BALASAN
      </div>
      {opsiAktif.map((opsiObj, i) => (
        <button
          key={i}
          className="opsi-btn-new"
          style={{ animationDelay: `${i * 0.12}s` }}
          onClick={() => onPilih(opsiObj)}
        >
          <span className="opsi-arrow">›</span>
          <span className="opsi-teks">{opsiObj.teks}</span>
        </button>
      ))}
    </div>
  );
}

export default function TabPesan({ onNext, onFinish, onFirstReply, expanded = false }) {
  const [pesan, setPesan]         = useState([]);
  const [typing, setTyping]       = useState(false);
  const [opsiAktif, setOpsiAktif] = useState(null);
  const [finished, setFinished]   = useState(false);

  const initDone   = useRef(false);
  const replyCount = useRef(0);
  const chatRef    = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [pesan, typing, opsiAktif]);

  
  const tampilkanPesan = (msgObj, delay = 600) => {
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setPesan((prev) => [...prev, {
          id: Date.now() + Math.random(),
          teks: msgObj.teks,
          dari: msgObj.dari,
          waktu: getNow(),
        }]);
        if (msgObj.opsi?.length) {
          setTimeout(() => setOpsiAktif(msgObj.opsi), 300);
        }
      }, 1200);
    }, delay);
  };

  const tampilkanPesanAkhir = () => {
    setTimeout(() => setTyping(true), 700);
    setTimeout(() => {
      setTyping(false);
      const akhir = config.pesanAkhir;
      setPesan((prev) => [
        ...prev,
        { id: Date.now() + 1, teks: akhir.teks, dari: akhir.dari, waktu: getNow() },
      ]);
      setFinished(true);
      onFinish?.();
    }, 2000);
  };

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    const first = getPesanById(1);
    setTimeout(() => {
      setPesan([{ ...first, waktu: getNow() }]);
      if (first.opsi?.length) setTimeout(() => setOpsiAktif(first.opsi), 300);
    }, 500);
  }, []);

  const handlePilihOpsi = (opsiObj) => {
    if (finished) return;
    setOpsiAktif(null);

    // Bubble jawaban Vanesa
    setPesan((prev) => [...prev, {
      id: Date.now() + Math.random(),
      teks: opsiObj.teks,
      dari: "dia",
      waktu: getNow(),
    }]);

    replyCount.current += 1;
    if (replyCount.current === 1) onFirstReply?.();

    const { balasan, nextId } = opsiObj;

    if (balasan) {
      // Tampilkan balasan dari teman
      setTimeout(() => setTyping(true), 700);
      setTimeout(() => {
        setTyping(false);
        setPesan((prev) => [...prev, {
          id: Date.now() + Math.random(),
          teks: balasan.teks,
          dari: balasan.dari,
          waktu: getNow(),
        }]);

        if (balasan.opsi?.length) {
          // Balasan punya opsi lanjutan → munculkan
          setTimeout(() => setOpsiAktif(balasan.opsi), 300);
        } else if (nextId) {
          // Balasan tanpa opsi tapi ada nextId → lompat ke pesan itu
          const nextMsg = getPesanById(nextId);
          if (nextMsg) tampilkanPesan(nextMsg, 800);
          else tampilkanPesanAkhir();
        } else {
          // Balasan tanpa opsi dan tanpa nextId → selesai
          tampilkanPesanAkhir();
        }
      }, 2000);

    } else if (nextId) {
      // Tidak ada balasan → langsung lompat ke pesan dengan id = nextId
      const nextMsg = getPesanById(nextId);
      if (nextMsg) tampilkanPesan(nextMsg, 700);
      else tampilkanPesanAkhir();

    } else {
      // Tidak ada balasan, tidak ada nextId → selesai
      tampilkanPesanAkhir();
    }
  };

  return (
    <>
      <style>{`
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes arrowFloat {
          from { transform: translateX(0px); opacity: 0.5; }
          to   { transform: translateX(3px); opacity: 1; }
        }
        @keyframes arrowPulse {
          from { transform: translateX(2px) scale(1); }
          to   { transform: translateX(5px) scale(1.2); }
        }
        .opsi-btn-new {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px 12px;
          background: #b8d4a0;
          border: 1.5px solid #8aae6e;
          border-radius: 4px;
          cursor: pointer;
          animation: slideIn 0.35s ease forwards;
          opacity: 0;
          text-align: left;
        }
        .opsi-btn-new:hover {
          background: #b8d4a0;
          border: 1.5px solid #8aae6e;
        }
        .opsi-arrow {
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
          flex-shrink: 0;
          display: inline-block;
          color: #3a6e24;
          animation: arrowFloat 1.2s ease-in-out infinite alternate;
        }
        .opsi-teks {
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          letter-spacing: 0.8px;
          color: #000000;
          line-height: 1.7;
        }
        .opsi-btn-new:active {
          transform: scale(0.97) !important;
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

      <div className="pesan-header">— Message —</div>

      <div
        className="chat-area"
        ref={chatRef}
        style={expanded ? { height: "calc(90vh - 165px)" } : {}}
      >
        {pesan.map((p) => (
          <div key={p.id} className={`chat-bubble ${p.dari === "dia" ? "sent" : ""}`}>
            {p.teks}
            <span className="bubble-time">{p.waktu}</span>
          </div>
        ))}
        {typing && <TypingBubble />}
      </div>

      {!finished && opsiAktif && !typing && (
        <OpsiPanel opsiAktif={opsiAktif} onPilih={handlePilihOpsi} />
      )}

      {finished && (
        <div className="next-wrapper">
          <button className="next-btn-retro" onClick={onNext}>
            ▶ NEXT YA!! ◀
          </button>
        </div>
      )}
    </>
  );
}