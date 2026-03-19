import { useState, useRef, useCallback, useEffect } from "react";
import { ChatCircleDots, Image, MusicNotes } from "@phosphor-icons/react";
import { config } from "../config";
import TabPesan from "./TabPesan";
import TabGaleri from "./TabGaleri";
import TabMusik from "./TabMusik";
import Confetti from "./Confetti";

const TABS = ["pesan", "galeri", "musik"];
const TAB_ICONS = {
  pesan:  { icon: <ChatCircleDots size={26} weight="fill" />, bg: "#ffffff", color: "#1a1a1a" },
  galeri: { icon: <Image         size={26} weight="fill" />, bg: "#ffffff", color: "#1a1a1a" },
  musik:  { icon: <MusicNotes    size={26} weight="fill" />, bg: "#ffffff", color: "#1a1a1a" },
};

export default function BirthdayPlayer() {
  const [activeTab, setActiveTab]   = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentSong, setCurrentSong] = useState(-1);
  const [volume, setVolume]         = useState(70);
  const [confetti, setConfetti]     = useState(false);
  const [isOpen, setIsOpen]         = useState(false);
  const [ytReady, setYtReady]       = useState(false);
  const [chatDone, setChatDone]     = useState(false); // ← unlock semua kontrol

  const ytRef         = useRef(null);
  const currentSongRef = useRef(-1);
  const nextSongFnRef  = useRef(null);

  const allSongs = [...config.laguDefault];

  // ── Inisialisasi YouTube IFrame API ──
  useEffect(() => {
    const initPlayer = () => {
      if (ytRef.current) return;
      ytRef.current = new window.YT.Player("yt-hidden-player", {
        height: "1", width: "1", videoId: "",
        playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady: () => setYtReady(true),
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) nextSongFnRef.current?.();
          },
        },
      });
    };
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = initPlayer;
    }
    return () => { window.onYouTubeIframeAPIReady = null; };
  }, []);

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  useEffect(() => {
    if (ytRef.current && ytReady) ytRef.current.setVolume?.(volume);
  }, [volume, ytReady]);

  const loadSong = useCallback((idx) => {
    const song = allSongs[idx];
    if (!song || !ytRef.current || !ytReady) return;
    setCurrentSong(idx);
    setIsPlaying(true);
    ytRef.current.loadVideoById(song.youtubeId);
  }, [allSongs, ytReady]);

  const togglePlay = useCallback(() => {
    if (!chatDone || allSongs.length === 0) return;
    if (currentSongRef.current < 0) { loadSong(0); return; }
    if (isPlaying) { ytRef.current?.pauseVideo(); setIsPlaying(false); }
    else { ytRef.current?.playVideo(); setIsPlaying(true); }
  }, [isPlaying, allSongs, loadSong, chatDone]);

  const prevSong = useCallback(() => {
    if (!chatDone || allSongs.length === 0) return;
    loadSong((currentSongRef.current - 1 + allSongs.length) % allSongs.length);
  }, [allSongs, loadSong, chatDone]);

  const nextSong = useCallback(() => {
    if (allSongs.length === 0) return;
    loadSong((currentSongRef.current + 1) % allSongs.length);
  }, [allSongs, loadSong]);

  useEffect(() => { nextSongFnRef.current = nextSong; }, [nextSong]);

  const handleSongLoad = useCallback((_, playIdx) => {
    if (playIdx !== undefined && playIdx !== null) loadSong(playIdx);
  }, [loadSong]);

  const goToTab = (idx) => { if (chatDone) setActiveTab(idx); };
  const prevTab = () => { if (chatDone) setActiveTab((p) => (p - 1 + TABS.length) % TABS.length); };
  const nextTab = () => { if (chatDone) setActiveTab((p) => (p + 1) % TABS.length); };

  // Style untuk tombol yang di-disable
  const disabledStyle = !chatDone ? {
    opacity: 0.35,
    cursor: "not-allowed",
    pointerEvents: "none",
  } : {};

  const musikProps = {
    songs: [], currentSong,
    onLoad: handleSongLoad,
    isPlaying,
    onPlayPause: togglePlay,
    onPrev: prevSong,
    onNext: nextSong,
    ytRef, ytReady,
  };

  return (
    <>
      <div style={{ position: "fixed", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none", zIndex: -1 }}>
        <div id="yt-hidden-player" />
      </div>

      <Confetti active={confetti} onDone={() => setConfetti(false)} />

      <div className="player-body">
        <div className={`led ${isPlaying ? "playing" : ""}`} />

        <div className="player-title">
          🎂 HBD {config.namaPenerima.toUpperCase()}! 🎂
        </div>

        <div className="player-screen">
          <div className={`tab-content ${activeTab === 0 ? "active" : ""}`}>
            <TabPesan
              onNext={() => setActiveTab(1)}
              onFirstReply={() => setChatDone(true)}
            />
          </div>
          <div className={`tab-content ${activeTab === 1 ? "active" : ""}`}>
            <TabGaleri onSwitchToMusik={() => setActiveTab(2)} />
          </div>
          <div className={`tab-content ${activeTab === 2 ? "active" : ""}`}>
            <TabMusik {...musikProps} expanded={false} />
          </div>
        </div>

        {/* OPEN — hanya aktif setelah chat selesai */}
        <button
          className="open-btn"
          style={disabledStyle}
          onClick={() => chatDone && setIsOpen(true)}
        >
          ⛶ OPEN
        </button>

        {/* Tab nav */}
        <div className="tab-nav">
          <button className="nav-arrow" style={disabledStyle} onClick={prevTab}>◀</button>
          {TABS.map((t, i) => {
            const isActive = activeTab === i;
            const iconData = TAB_ICONS[t];
            return (
              <button
                key={t}
                className={`tab-btn ${isActive ? "active" : ""}`}
                style={{
                  ...(i !== 0 ? disabledStyle : {}),
                  ...(isActive ? { background: iconData.bg, color: iconData.color } : { color: "rgba(255,255,255,0.6)" }),
                }}
                onClick={() => goToTab(i)}
              >
                {iconData.icon}
              </button>
            );
          })}
          <button className="nav-arrow" style={disabledStyle} onClick={nextTab}>▶</button>
        </div>

        <div className="dots">
          <div className={`dot ${activeTab < 2 ? "active" : ""}`} />
          <div className={`dot ${activeTab >= 2 ? "active" : ""}`} />
        </div>

        {/* Playback controls */}
        <div className="playback-row">
          <button className="ctrl-btn" style={disabledStyle} onClick={prevSong}>⏮</button>
          <button className="ctrl-btn play-btn" style={disabledStyle} onClick={togglePlay}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="ctrl-btn" style={disabledStyle} onClick={nextSong}>⏭</button>
        </div>

        <div className="vol-row">
          <span className="vol-icon">🔈</span>
          <input
            type="range" className="vol-slider"
            min="0" max="100" step="1" value={volume}
            style={disabledStyle}
            onChange={(e) => chatDone && setVolume(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Modal expanded */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: "500px", height: "90vh", background: "#c8e8a8", borderRadius: "16px", border: "4px solid #2a1010", boxShadow: "inset 0 3px 10px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", background: "rgba(255,255,255,0.25)", borderBottom: "2px solid rgba(0,0,0,0.1)", flexShrink: 0 }}>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#4a1a1a", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {activeTab === 0 && <TabPesan onNext={() => { setActiveTab(1); setIsOpen(false); }} onFirstReply={() => setChatDone(true)} expanded={true} />}
              {activeTab === 1 && (
                <div style={{ overflowY: "auto", height: "100%" }}>
                  <TabGaleri onSwitchToMusik={() => { setActiveTab(2); setIsOpen(false); }} expanded={true} />
                </div>
              )}
              {activeTab === 2 && (
                <div style={{ overflowY: "auto", height: "100%" }}>
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