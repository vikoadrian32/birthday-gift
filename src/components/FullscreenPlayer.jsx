import { useState } from "react";

export default function FullscreenPlayer({
  onClose, activeTab, setActiveTab,
  songs, currentSong, isPlaying,
  onPlay, onPrev, onNext, onSongSelect,
  onUpload, volume, onVolume,
}) {
  const tabs = ["💬 Chat", "🖼️ Galeri", "🎵 Musik"];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#0d0505",
      zIndex: 200,
      display: "flex", flexDirection: "column",
      fontFamily: "'VT323', monospace",
      animation: "slideUp 0.3s ease",
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .fs-tab { flex: 1; padding: 10px; background: transparent; border: none;
          color: rgba(255,255,255,0.4); font-family: 'Press Start 2P',monospace;
          font-size: 7px; letter-spacing: 1px; cursor: pointer; transition: all 0.15s;
          border-bottom: 2px solid transparent; }
        .fs-tab.active { color: #D4A017; border-bottom-color: #D4A017; }
        .fs-song { display: flex; align-items: center; gap: 10px; padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: background 0.15s; }
        .fs-song:hover { background: rgba(107,26,26,0.3); }
        .fs-song.active { background: rgba(107,26,26,0.5); }
        .fs-song-num { color: rgba(255,255,255,0.3); font-size: 14px; width: 20px; text-align: center; }
        .fs-song-title { flex: 1; color: #c8f0a0; font-size: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .fs-song-dur { color: rgba(255,255,255,0.4); font-size: 14px; }
        .fs-ctrl { width: 50px; height: 50px; border-radius: 50%; border: none; cursor: pointer;
          font-size: 18px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; }
        .fs-ctrl:active { transform: scale(0.92); }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderBottom: "1px solid rgba(107,26,26,0.5)" }}>
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: "8px",
          color: "#D4A017", letterSpacing: "2px" }}>
          {tabs[activeTab].split(" ")[1]}
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none",
          color: "rgba(255,255,255,0.5)", fontSize: "20px", cursor: "pointer", lineHeight: 1 }}>
          ✕
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(107,26,26,0.4)" }}>
        {tabs.map((t, i) => (
          <button key={i} className={`fs-tab ${activeTab === i ? "active" : ""}`}
            onClick={() => setActiveTab(i)}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === 2 && <FSMusik songs={songs} currentSong={currentSong}
          isPlaying={isPlaying} onSongSelect={onSongSelect} onUpload={onUpload} />}
        {activeTab === 0 && <div style={{ padding: "20px", color: "rgba(255,255,255,0.5)",
          fontFamily: "'VT323',monospace", fontSize: "16px", textAlign: "center" }}>
          Buka di player utama untuk chat 💬
        </div>}
        {activeTab === 1 && <div style={{ padding: "20px", color: "rgba(255,255,255,0.5)",
          fontFamily: "'VT323',monospace", fontSize: "16px", textAlign: "center" }}>
          Buka di player utama untuk galeri 🖼️
        </div>}
      </div>

      {/* Now playing bar */}
      {songs.length > 0 && currentSong >= 0 && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid rgba(107,26,26,0.5)",
          background: "#1a0808" }}>
          <div style={{ color: "#c8f0a0", fontSize: "14px", marginBottom: "8px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {songs[currentSong]?.judul || "—"} — {songs[currentSong]?.artis || ""}
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        gap: "16px", padding: "12px 16px 20px",
        background: "#150606", borderTop: "1px solid rgba(107,26,26,0.3)" }}>
        <button className="fs-ctrl" onClick={onPrev}
          style={{ background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "16px" }}>⏮</button>
        <button className="fs-ctrl" onClick={onPlay}
          style={{ width: 60, height: 60, background: "#2ea02e", color: "#fff", fontSize: "22px" }}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="fs-ctrl" onClick={onNext}
          style={{ background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: "16px" }}>⏭</button>
        <input type="range" min="0" max="100" step="1" value={volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          style={{ flex: 1, maxWidth: 120 }} />
      </div>
    </div>
  );
}

function FSMusik({ songs, currentSong, isPlaying, onSongSelect, onUpload }) {
  const fileRef = { current: null };
  const allSongs = songs;

  return (
    <div>
      {allSongs.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)",
          fontFamily: "'VT323',monospace", fontSize: "16px" }}>
          Belum ada lagu<br />Upload MP3 di bawah 🎵
        </div>
      ) : (
        allSongs.map((s, i) => (
          <div key={i} className={`fs-song ${i === currentSong ? "active" : ""}`}
            onClick={() => onSongSelect(i)}>
            <span className="fs-song-num">{i === currentSong && isPlaying ? "♪" : i + 1}</span>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div className="fs-song-title">{s.judul}</div>
              {s.artis && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{s.artis}</div>}
            </div>
          </div>
        ))
      )}

      <label style={{ display: "block", margin: "16px", padding: "10px",
        border: "1px dashed rgba(107,26,26,0.5)", borderRadius: "6px",
        textAlign: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)",
        fontFamily: "'VT323',monospace", fontSize: "15px" }}>
        ＋ Upload MP3
        <input type="file" accept=".mp3,audio/*" multiple style={{ display: "none" }}
          onChange={onUpload} />
      </label>
    </div>
  );
}