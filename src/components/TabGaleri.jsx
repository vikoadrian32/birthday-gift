import { useState } from "react";
import { config } from "../config";

export default function TabGaleri({ onSwitchToMusik, expanded = false }) {
  const [activeTab, setActiveTab] = useState("foto");
  const [lightbox, setLightbox] = useState(null);

  const fotoKiri  = config.foto.filter((_, i) => i % 2 === 0);
  const fotoKanan = config.foto.filter((_, i) => i % 2 !== 0);
  const heights   = [110, 135, 280, 85, 100, 90];
  const rotations = [-2, 1.5, -1, 2.5, -1.8, 1.2];

  return (
    <>
      <style>{`
        .masonry-wrap {
          display: flex;
          gap: 16px;
          padding: 7px 4px;
          align-items: flex-start;
        }
        .masonry-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
        }
        .masonry-card {
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          flex-shrink: 0;
        }
        .masonry-card:hover {
          box-shadow: 4px 6px 16px rgba(0,0,0,0.4) !important;
          z-index: 10;
          position: relative;
        }
        .masonry-img {
          width: 100%;
          object-fit: cover;
          display: block;
          border-radius: 1px;
        }
        .masonry-placeholder {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background: linear-gradient(135deg, rgba(200,200,200,0.3), rgba(200,200,200,0.1));
          color: rgba(0,0,0,0.2);
          border-radius: 1px;
        }
        .masonry-label {
          font-family: 'VT323', monospace;
          font-size: 13px;
          text-align: center;
          padding: 4px 2px 0;
          background: transparent;
          color: #555;
        }
      `}</style>

      {/* Header */}
      <div className="galeri-header">
        <span className="galeri-title">Galeri</span>
        <button className="galeri-music-link" onClick={onSwitchToMusik}>
          ♪ Musik ➤
        </button>
      </div>

      {/* Sub tabs */}
      <div className="galeri-tabs">
        <button
          className={`galeri-tab-btn ${activeTab === "foto" ? "active" : ""}`}
          onClick={() => setActiveTab("foto")}
        >
          📷 Foto ({config.foto.length})
        </button>
        <button
          className={`galeri-tab-btn ${activeTab === "video" ? "active" : ""}`}
          onClick={() => setActiveTab("video")}
        >
          🎬 Video (0)
        </button>
      </div>

      {/* Canvas area */}
      {activeTab === "foto" ? (
        config.foto.length > 0 ? (
          <div style={{
            background: "#e8e0d0",
            borderRadius: "8px",
            margin: "8px",
            padding: "12px",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15)",
            overflowY: "auto",
            maxHeight: expanded ? "calc(90vh - 160px)" : "195px",
          }}>
            <div className="masonry-wrap">
              {/* Kolom Kiri */}
              <div className="masonry-col">
                {fotoKiri.map((f, i) => {
                  const h = heights[(i * 2) % heights.length];
                  const rot = rotations[(i * 2) % rotations.length];
                  return (
                    <div
                      key={f.id}
                      className="masonry-card"
                      style={{
                        transform: `rotate(${rot}deg)`,
                        background: "#fff",
                        padding: "5px 5px 18px 5px",
                        borderRadius: "3px",
                        border: "none",
                        boxShadow: "2px 3px 8px rgba(0,0,0,0.3)",
                        overflow: "visible",
                      }}
                      onClick={() => f.src && setLightbox(f)}
                    >
                      {f.src ? (
                        <img src={f.src} alt={f.label} className="masonry-img" style={{ height: h }} />
                      ) : (
                        <div className="masonry-placeholder" style={{ height: h }}>📷</div>
                      )}
                      <div className="masonry-label">{f.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Kolom Kanan */}
              <div className="masonry-col" style={{ marginTop: 28 }}>
                {fotoKanan.map((f, i) => {
                  const h = heights[(i * 2 + 1) % heights.length];
                  const rot = rotations[(i * 2 + 1) % rotations.length];
                  return (
                    <div
                      key={f.id}
                      className="masonry-card"
                      style={{
                        transform: `rotate(${rot}deg)`,
                        background: "#fff",
                        padding: "5px 5px 18px 5px",
                        borderRadius: "3px",
                        border: "none",
                        boxShadow: "2px 3px 8px rgba(0,0,0,0.3)",
                        overflow: "visible",
                      }}
                      onClick={() => f.src && setLightbox(f)}
                    >
                      {f.src ? (
                        <img src={f.src} alt={f.label} className="masonry-img" style={{ height: h }} />
                      ) : (
                        <div className="masonry-placeholder" style={{ height: h }}>📷</div>
                      )}
                      <div className="masonry-label">{f.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"30px 10px", fontFamily:"'VT323',monospace", fontSize:"15px", color:"rgba(26,42,10,0.5)" }}>
            Belum ada foto.<br />Tambah di config.js 📷
          </div>
        )
      ) : (
        <div style={{ textAlign:"center", padding:"30px 10px", fontFamily:"'VT323',monospace", fontSize:"15px", color:"rgba(26,42,10,0.5)" }}>
          Belum ada video.<br />Tambah nanti ya 🎬
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.src} alt={lightbox.label} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}