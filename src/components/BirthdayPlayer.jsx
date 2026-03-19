import { useState, useRef, useCallback, useEffect } from "react";
import { config } from "../config";
import TabPesan from "./TabPesan";
import TabGaleri from "./TabGaleri";
import TabMusik from "./TabMusik";
import Confetti from "./Confetti";

const TABS = ["pesan", "galeri", "musik"];
const TAB_ICONS = { pesan: "💬", galeri: "🖼️", musik: "🎵" };

export default function BirthdayPlayer() {
  const [activeTab, setActiveTab]         = useState(0);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [currentSong, setCurrentSong]     = useState(-1);
  const [volume, setVolume]               = useState(70);
  const [confetti, setConfetti]           = useState(false);
  const [isOpen, setIsOpen]               = useState(false);

  const audioRef = useRef(null);
  const allSongs = [...config.laguDefault, ...uploadedSongs];

  const loadSong = useCallback((idx) => {
    const audio = audioRef.current;
    if (!audio || !allSongs[idx]) return;
    audio.src = allSongs[idx].src;
    setCurrentSong(idx);
    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [allSongs]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (allSongs.length === 0) { alert("Upload lagu dulu ya! 🎵"); return; }
    if (currentSong < 0) { loadSong(0); return; }
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  }, [isPlaying, currentSong, allSongs, loadSong]);

  const prevSong = useCallback(() => {
    if (allSongs.length === 0) return;
    loadSong((currentSong - 1 + allSongs.length) % allSongs.length);
  }, [currentSong, allSongs, loadSong]);

  const nextSong = useCallback(() => {
    if (allSongs.length === 0) return;
    loadSong((currentSong + 1) % allSongs.length);
  }, [currentSong, allSongs, loadSong]);

  const handleSongLoad = (newSongs, playIdx) => {
    if (newSongs) setUploadedSongs((prev) => [...prev, ...newSongs]);
    if (playIdx !== undefined && playIdx !== null) loadSong(playIdx);
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => nextSong();
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [nextSong]);

  const prevTab = () => setActiveTab((p) => (p - 1 + TABS.length) % TABS.length);
  const nextTab = () => setActiveTab((p) => (p + 1) % TABS.length);

  // Props lengkap untuk TabMusik
  const musikProps = {
    songs: uploadedSongs,
    currentSong,
    onLoad: handleSongLoad,
    audioRef,
    isPlaying,
    onPlayPause: togglePlay,
    onPrev: prevSong,
    onNext: nextSong,
  };

  return (
    <>
      <audio ref={audioRef} />
      <Confetti active={confetti} onDone={() => setConfetti(false)} />

      <div className="player-body">
        <div className={`led ${isPlaying ? "playing" : ""}`} />

        <div className="player-title">
          🎂 HBD {config.namaPenerima.toUpperCase()}! 🎂
        </div>

        <div className="player-screen">
          <div className={`tab-content ${activeTab === 0 ? "active" : ""}`}>
            <TabPesan onNext={() => setActiveTab(1)} />
          </div>
          <div className={`tab-content ${activeTab === 1 ? "active" : ""}`}>
            <TabGaleri onSwitchToMusik={() => setActiveTab(2)} />
          </div>
          <div className={`tab-content ${activeTab === 2 ? "active" : ""}`}>
            {/* expanded=false → tombol kontrol disembunyikan */}
            <TabMusik {...musikProps} expanded={false} />
          </div>
        </div>

        <button className="open-btn" onClick={() => setIsOpen(true)}>
          ⛶ OPEN
        </button>

        <div className="tab-nav">
          <button className="nav-arrow" onClick={prevTab}>◀</button>
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`tab-btn ${activeTab === i ? "active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {TAB_ICONS[t]}
            </button>
          ))}
          <button className="nav-arrow" onClick={nextTab}>▶</button>
        </div>

        <div className="dots">
          <div className={`dot ${activeTab < 2 ? "active" : ""}`} />
          <div className={`dot ${activeTab >= 2 ? "active" : ""}`} />
        </div>

        <div className="playback-row">
          <button className="ctrl-btn" onClick={prevSong}>⏮</button>
          <button className="ctrl-btn play-btn" onClick={togglePlay}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="ctrl-btn" onClick={nextSong}>⏭</button>
        </div>

        <div className="vol-row">
          <span className="vol-icon">🔈</span>
          <input
            type="range" className="vol-slider"
            min="0" max="100" step="1" value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
      </div>

      {/* ── MODAL EXPANDED ── */}
      {isOpen && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.82)",
            zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              width: "100%", maxWidth: "500px",
              height: "90vh",
              background: "#c8e8a8",
              borderRadius: "16px",
              border: "4px solid #2a1010",
              boxShadow: "inset 0 3px 10px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.6)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex", justifyContent: "flex-end",
              padding: "8px 12px",
              background: "rgba(255,255,255,0.25)",
              borderBottom: "2px solid rgba(0,0,0,0.1)",
              flexShrink: 0,
            }}>
              <button onClick={() => setIsOpen(false)} style={{
                background: "none", border: "none",
                color: "#4a1a1a", fontSize: "20px", cursor: "pointer",
              }}>✕</button>
            </div>

            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {activeTab === 0 && (
                <TabPesan onNext={() => { setActiveTab(1); setIsOpen(false); }} expanded={true} />
              )}
              {activeTab === 1 && (
                <div style={{ overflowY: "auto", height: "100%" }}>
                  <TabGaleri onSwitchToMusik={() => { setActiveTab(2); setIsOpen(false); }} expanded={true} />
                </div>
              )}
              {activeTab === 2 && (
                <div style={{ overflowY: "auto", height: "100%" }}>
                  {/* expanded=true → tombol prev/play/next muncul */}
                  <TabMusik {...musikProps} expanded={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}