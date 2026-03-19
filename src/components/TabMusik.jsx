import { useState, useEffect } from "react";
import { config } from "../config";

export default function TabMusik({ songs, currentSong, onLoad, audioRef, isPlaying, onPlayPause, onPrev, onNext, expanded = false }) {

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState({});

  const allSongs = [...config.laguDefault, ...songs];
  const activeSong = currentSong >= 0 && allSongs[currentSong] ? allSongs[currentSong] : null;

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const handleLoadedMetadata = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioRef]);

  useEffect(() => {
    allSongs.forEach((song, i) => {
      if (durations[i] !== undefined) return;
      const a = new Audio(song.src);
      a.addEventListener("loadedmetadata", () => {
        setDurations(prev => ({ ...prev, [i]: a.duration }));
      });
    });
  }, [allSongs.length]);

  const handleSeek = (e) => {
    const audio = audioRef?.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * audio.duration;
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="musik-area">

      {/* ── NOW PLAYING ── */}
      <div className="np-card">
        <div className="np-thumb-wrap">
          {activeSong?.thumbnail ? (
            <img className="np-thumb" src={activeSong.thumbnail} alt={activeSong.judul} />
          ) : (
            <div className="np-thumb-placeholder"><span>♪</span></div>
          )}
          {isPlaying && <div className="np-thumb-glow" />}
        </div>

        <div className="np-info">
          <div className="np-title">{activeSong ? activeSong.judul : "Pilih Lagu"}</div>
          <div className="np-artist">{activeSong ? (activeSong.artis || "—") : "upload MP3 di bawah"}</div>
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

      {/* ── CONTROLS — hanya tampil saat expanded (modal OPEN) ── */}
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
                {s.thumbnail ? (
                  <img src={s.thumbnail} alt={s.judul} />
                ) : (
                  <span>{i === currentSong ? "♪" : "○"}</span>
                )}
              </div>
              <div className="song-row-info">
                <div className="song-row-title">{s.judul}</div>
                <div className="song-row-artist">{s.artis || "—"}</div>
              </div>
              <div className="song-row-dur">
                {durations[i] ? formatTime(durations[i]) : "--:--"}
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