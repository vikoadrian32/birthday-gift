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
  onNextTab,
  ytRef,
  ytReady,
}) {
  const [progress, setProgress]       = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const timerRef = useRef(null);

  const allSongs   = [...config.laguDefault, ...songs];
  const activeSong = currentSong >= 0 && allSongs[currentSong] ? allSongs[currentSong] : null;

  // Reset progress saat lagu ganti
  useEffect(() => {
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [currentSong]);

  // Progress timer — baca langsung dari ytRef milik BirthdayPlayer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isPlaying || !ytReady) return;
    timerRef.current = setInterval(() => {
      const player = ytRef?.current;
      if (!player || typeof player.getCurrentTime !== "function") return;
      const cur = player.getCurrentTime() || 0;
      const dur = player.getDuration() || 0;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress(dur ? (cur / dur) * 100 : 0);
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, ytReady, currentSong]);

  const handleSeek = (e) => {
    const player = ytRef?.current;
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
         <style>{`
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
          <div className="np-title">{activeSong ? activeSong.judul : "Play lagunya dlu yuk"}</div>
          <div className="np-artist">{activeSong ? (activeSong.artis || "—") : "di pilih ya!"}</div>
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
      {onNextTab && (
        <div className="next-wrapper">
          <button className="next-btn-retro" onClick={onNextTab}>
            ▶ NEXT YA!! ◀
          </button>
        </div>
      )}
    </div>
  );
}