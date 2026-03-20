import { useState, useRef, useCallback, useEffect } from "react";
import { ChatCircleDots, Image, MusicNotes, Play, Pause, SkipBack, SkipForward, EnvelopeIcon } from "@phosphor-icons/react";
import { config } from "../config";
import TabPesan from "./TabPesan";
import TabGaleri from "./TabGaleri";
import TabMusik from "./TabMusik";
import Confetti from "./Confetti";
import TabWish from "./TabWish";

const TABS = ["pesan", "galeri", "musik","wish"];

const TAB_ICONS = {
  pesan:  { icon: <ChatCircleDots size={26} weight="fill" />, bg: "#ffffff", color: "#1a1a1a" },
  galeri: { icon: <Image size={26} weight="fill" />, bg: "#ffffff", color: "#1a1a1a" },
  musik:  { icon: <MusicNotes size={26} weight="fill" />, bg: "#ffffff", color: "#1a1a1a" },
  wish:   { icon: <EnvelopeIcon  size={26} weight="fill" />, bg: "#ffffff", color: "#1a1a1a" },
};

export default function BirthdayPlayer() {

  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(-1);
  const [volume, setVolume] = useState(70);
  const [confetti, setConfetti] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [ytReady, setYtReady] = useState(false);
  const [chatDone, setChatDone] = useState(false);
  const [tabUnlocked, setTabUnlocked] = useState(false);

  const ytRef = useRef(null);
  const currentSongRef = useRef(-1);
  const nextSongFnRef = useRef(null);
  const confettiShown = useRef(false);

  const allSongs = [...config.laguDefault];

  // =========================
  // YOUTUBE INIT
  // =========================

  useEffect(() => {

    const initPlayer = () => {

      if (ytRef.current) return;

      ytRef.current = new window.YT.Player("yt-hidden-player", {
        height: "1",
        width: "1",
        videoId: "",
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: () => setYtReady(true),
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              nextSongFnRef.current?.();
            }
          }
        }
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

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };

  }, []);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    if (ytRef.current && ytReady) {
      ytRef.current.setVolume?.(volume);
    }
  }, [volume, ytReady]);

  // =========================
  // MUSIC CONTROL
  // =========================

  const loadSong = useCallback((idx) => {

    const song = allSongs[idx];

    if (!song || !ytRef.current || !ytReady) return;

    setCurrentSong(idx);
    setIsPlaying(true);

    ytRef.current.loadVideoById(song.youtubeId);

  }, [allSongs, ytReady]);

  const togglePlay = useCallback(() => {

    if (!chatDone || allSongs.length === 0) return;

    if (currentSongRef.current < 0) {
      loadSong(0);
      return;
    }

    if (isPlaying) {
      ytRef.current?.pauseVideo();
      setIsPlaying(false);
    } else {
      ytRef.current?.playVideo();
      setIsPlaying(true);
    }

  }, [isPlaying, allSongs, loadSong, chatDone]);

  const prevSong = useCallback(() => {

    if (!chatDone || allSongs.length === 0) return;

    loadSong(
      (currentSongRef.current - 1 + allSongs.length) % allSongs.length
    );

  }, [allSongs, loadSong, chatDone]);

  const nextSong = useCallback(() => {

    if (allSongs.length === 0) return;

    loadSong(
      (currentSongRef.current + 1) % allSongs.length
    );

  }, [allSongs, loadSong]);

  useEffect(() => {
    nextSongFnRef.current = nextSong;
  }, [nextSong]);

  const handleSongLoad = useCallback((_, playIdx) => {

    if (playIdx !== undefined && playIdx !== null) {
      loadSong(playIdx);
    }

  }, [loadSong]);

  // =========================
  // TAB SWITCH
  // =========================

  const switchTab = (idx) => {

    setActiveTab(idx);
    console.log("Swithc" + idx);

    if (idx === 1 && !confettiShown.current) {
      confettiShown.current = true;
      setConfetti(true);
    }

    if (idx === 3) {
      setTabUnlocked(true);
    }

  };

  const goToTab = (idx) => {
    if (tabUnlocked) {
      switchTab(idx);
    }
  };

  const prevTab = () => {

    if (chatDone) {
      switchTab((activeTab - 1 + TABS.length) % TABS.length);
    }

  };

  const nextTab = () => {

    if (chatDone) {
      switchTab((activeTab + 1) % TABS.length);
    }

  };

  // =========================
  // STYLE
  // =========================

  const disabledStyle = !chatDone ? {
    opacity: 0.35,
    cursor: "not-allowed",
    pointerEvents: "none"
  } : {};

  const disableButtonStyle = !tabUnlocked
  ? {
      opacity: 0.35,
      cursor: "not-allowed",
    }
  : {};

  const disableTabClick = !tabUnlocked
  ? {
      pointerEvents: "none",
      cursor: "not-allowed",
    }
  : {};

  // =========================
  // PROPS
  // =========================

  const musikProps = {
    songs: [],
    currentSong,
    onLoad: handleSongLoad,
    isPlaying,
    onPlayPause: togglePlay,
    onPrev: prevSong,
    onNext: nextSong,
    ytRef,
    ytReady
  };

  return (
    <>
      <div style={{
        position: "fixed",
        width: 1,
        height: 1,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1
      }}>
        <div id="yt-hidden-player" />
      </div>

      <Confetti active={confetti} onDone={() => setConfetti(false)} />

      <div className="player-body">

        <div className={`led ${isPlaying ? "playing" : ""}`} />

        <div className="player-title">
          🎂 HBD {config.namaPenerima.toUpperCase()}! 🎂
        </div>

        {/* SCREEN */}

        <div className="player-screen">

          <div className={`tab-content ${activeTab === 0 ? "active" : ""}`}>
            <TabPesan
              onNext={() => switchTab(1)}
              onFirstReply={() => setChatDone(true)}
            />
          </div>

          <div className={`tab-content ${activeTab === 1 ? "active" : ""}`}>
            <TabGaleri
              key={activeTab === 1 ? "galery-active" : "galery-inactive"}
              onSwitchToMusik={() => switchTab(2)}
              expanded={false}
            />
          </div>

          <div className={`tab-content ${activeTab === 2 ? "active" : ""}`}>
            <TabMusik {...musikProps} expanded={false} onNextTab={() => switchTab(3)} />
          </div>
          
          <div className={`tab-content ${activeTab === 3 ? "active" : ""}`}>
            <TabWish />
          </div>

        </div>

        {/* OPEN */}

        <button
          className="open-btn"
          style={disabledStyle}
          onClick={() => chatDone && setIsOpen(true)}
        >
          ⛶ OPEN
        </button>

        {/* TAB NAV */}

        <div className="tab-nav">

          <button
            className="nav-arrow"
            style={disableButtonStyle}
            onClick={prevTab}
          >
            ◀
          </button>

          {TABS.map((t, i) => {

            const isActive = activeTab === i;
            const iconData = TAB_ICONS[t];

            return (
              <button
                key={t}
                className={`tab-btn ${isActive ? "active" : ""}`}
                style={{
                  ...(activeTab !== 2 ? disableTabClick : {}),
                  ...(i !== 0 && !isActive ? disableButtonStyle : {}),
                  ...(isActive
                    ? { background: iconData.bg, color: iconData.color, opacity: 1 }
                    : { color: "rgba(255,255,255,0.6)" })
                }}
                onClick={() => goToTab(i)}
              >
                {iconData.icon}
              </button>
            );

          })}

          <button
            className="nav-arrow"
            style={disableButtonStyle}
            onClick={nextTab}
          >
            ▶
          </button>

        </div>

        {/* DOT */}

        <div className="dots">
          <div className={`dot ${activeTab < 2 ? "active" : ""}`} />
          <div className={`dot ${activeTab >= 2 ? "active" : ""}`} />
        </div>

        {/* PLAYBACK */}

        <div className="playback-row">

          <button
            className="ctrl-btn"
            style={disableButtonStyle}
            onClick={prevSong}
          >
            <SkipBack size={18} weight="fill" />
          </button>

          <button
            className="ctrl-btn play-btn"
            style={disableButtonStyle}
            onClick={togglePlay}
          >
            {isPlaying
              ? <Pause size={22} weight="fill" />
              : <Play size={22} weight="fill" />
            }
          </button>

          <button
            className="ctrl-btn"
            style={disableButtonStyle}
            onClick={nextSong}
          >
            <SkipForward size={18} weight="fill" />
          </button>

        </div>

        {/* VOLUME */}

        <div className="vol-row">

          <span className="vol-icon">🔈</span>

          <input
            type="range"
            className="vol-slider"
            min="0"
            max="100"
            step="1"
            value={volume}
            style={disableButtonStyle}
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
              {activeTab === 0 && <TabPesan onNext={() => { switchTab(1); setIsOpen(false); }} onFirstReply={() => setChatDone(true)} expanded={true} />}
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

              {activeTab === 3 && (
                <div style={{ overflowY: "auto", height: "100%" }}>
                  <TabWish expanded={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}