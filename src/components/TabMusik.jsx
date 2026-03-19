import { useState, useEffect, useRef } from "react";
import { config } from "../config";

const getThumb = (youtubeId) =>
  `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

export default function TabMusik({
  songs = [],
  currentSong,
  onLoad,
  isPlaying,
  onPlayPause,
  onPrev,
  onNext,
  expanded = false,
  onYTReady,
}) {
  const [progress, setProgress]     = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const timerRef    = useRef(null);
  const playerRef   = useRef(null);
  const readyRef    = useRef(false); // apakah YT player sudah siap

  const allSongs   = [...config.laguDefault, ...songs];
  const activeSong = currentSong >= 0 && allSongs[currentSong] ? allSongs[currentSong] : null;

  // ── Load YouTube IFrame API sekali ──
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }
    if (!document.getElementById("yt-api-script")) {
      const tag = document.createElement("script");
      tag.id  = "yt-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = createPlayer;
    return () => { window.onYouTubeIframeAPIReady = null; };
  }, []);

  const createPlayer = () => {
    if (playerRef.current) return;
    playerRef.current = new window.YT.Player("yt-hidden-player", {
      height: "1",
      width: "1",
      videoId: "",
      playerVars: { autoplay: 0, controls: 0, rel: 0, playsinline: 1 },
      events: {
        onReady: (e) => {
          readyRef.current = true;
          onYTReady && onYTReady(e.target);
        },
        onStateChange: (e) => {
          // ENDED = 0
          if (e.data === 0) onNext && onNext();
        },
      },
    });
  };

  // ── Ganti lagu saat currentSong berubah ──
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current || !activeSong?.youtubeId) return;

    // Reset progress dulu
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    // Langsung load & play video baru (menghentikan yang lama otomatis)
    if (isPlaying) {
      player.loadVideoById(activeSong.youtubeId);
    } else {
      player.cueVideoById(activeSong.youtubeId);
    }
  }, [currentSong]); // hanya trigger saat lagu ganti

  // ── Sync play/pause (tanpa ganti lagu) ──
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;
    if (isPlaying) {
      player.playVideo?.();
    } else {
      player.pauseVideo?.();
    }
  }, [isPlaying]);

  // ── Progress timer ──
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== "function") return;
      const cur = player.getCurrentTime() || 0;
      const dur = player.getDuration() || 0;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress(dur ? (cur / dur) * 100 : 0);
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  const handleSeek = (e) => {
    const player = playerRef.current;
    if (!player || typeof player.seekTo !== "function") return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    player.seekTo(ratio * (player.getDuration() || 0), true);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const thumbSrc = (song) =>
    song?.thumbnail || (song?.youtubeId ? getThumb(song.youtubeId) : null);

  return (
    <div className="musik-area">

      {/* YouTube player tersembunyi */}
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
        <div id="yt-hidden-player" />
      </div>

      {/* ── NOW PLAYING ── */}
      <div className="np-card">
        <div className="np-thumb-wrap">
          {thumbSrc(activeSong) ? (
            <img className="np-thumb" src={thumbSrc(activeSong)} alt={activeSong?.judul} />
          ) : (
            <div className="np-thumb-placeholder"><span>♪</span></div>
          )}
          {isPlaying && <div className="np-thumb-glow" />}
        </div>

        <div className="np-info">
          <div className="np-title">{activeSong ? activeSong.judul : "Pilih Lagu"}</div>
          <div className="np-artist">{activeSong ? (activeSong.artis || "—") : "pilih lagu di bawah"}</div>
          <div className="np-status">{isPlaying ? "▶ Playing" : activeSong ? "⏸ Paused" : ""}</div>
        </div>

        {activeSong && (
          <div className="np-dur">{formatTime(duration)}</div>
        )}
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="prog-wrap">
        <span className="prog-time">{formatTime(currentTime)}</span>
        <div className="prog-track" onClick={handleSeek}>
          <div className="prog-fill" style={{ width: `${progress}%` }}>
            <div className="prog-thumb" />
          </div>
        </div>
        <span className="prog-time">{formatTime(duration)}</span>
      </div>

      {/* ── CONTROLS — hanya muncul saat expanded ── */}
      {expanded && (
        <div className="musik-ctrl-row">
          <button className="musik-ctrl-btn" onClick={onPrev}>⏮</button>
          <button className="musik-ctrl-btn play" onClick={onPlayPause}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className="musik-ctrl-btn" onClick={onNext}>⏭</button>
        </div>
      )}

      {/* ── SONG LIST ── */}
      <div className="song-list-new" style={expanded ? { maxHeight: "calc(90vh - 320px)" } : {}}>
        {allSongs.length > 0 ? (
          allSongs.map((s, i) => (
            <div
              key={i}
              className={`song-row ${i === currentSong ? "active" : ""}`}
              onClick={() => onLoad(null, i)}
            >
              <div className="song-row-thumb">
                {thumbSrc(s) ? (
                  <img src={thumbSrc(s)} alt={s.judul} />
                ) : (
                  <span>{i === currentSong ? "♪" : "○"}</span>
                )}
              </div>
              <div className="song-row-info">
                <div className="song-row-title">{s.judul}</div>
                <div className="song-row-artist">{s.artis || "—"}</div>
              </div>
              <div className="song-row-dur">
                {i === currentSong ? formatTime(duration) : "--:--"}
              </div>
            </div>
          ))
        ) : (
          <div className="song-empty">Belum ada lagu</div>
        )}
      </div>
    </div>
  );
}