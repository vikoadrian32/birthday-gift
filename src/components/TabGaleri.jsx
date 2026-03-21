import { useRef,useEffect, useState } from "react";
import { config } from "../config";

export default function TabGaleri({ onSwitchToMusik, expanded = false }) {
  const [activeTab, setActiveTab] = useState("foto");
  const [lightbox, setLightbox] = useState(null);

  const fotoKiri  = config.foto.filter((_, i) => i % 2 === 0);
  const fotoKanan = config.foto.filter((_, i) => i % 2 !== 0);
  const heights   = [110, 135, 280, 85, 100, 90];
  const rotations = [-2, 1.5, -1, 2.5, -1.8, 1.2];

  const [showBtn, setShowBtn] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Reset dulu setiap kali
    setShowBtn(false);

    const el = scrollRef.current;
    if (!el) return;

    // Delay kecil agar DOM sudah benar-benar visible & terukur
    const timeout = setTimeout(() => {
      const check = () => {
        if (el.scrollHeight <= el.clientHeight) setShowBtn(true);
      };

      const images = el.querySelectorAll("img");
      if (images.length === 0) { check(); return; }

      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded >= images.length) check();
      };

      images.forEach((img) => {
        if (img.complete) loaded++;
        else img.addEventListener("load", onLoad);
      });

      if (loaded >= images.length) check();

      return () => {
        images.forEach((img) => img.removeEventListener("load", onLoad));
      };
    }, 150); // tunggu tab visible

    return () => clearTimeout(timeout);
  }, []);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 30;
    if (nearBottom) setShowBtn(true);
  };
  

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

      {/* Header */}
      <div className="galeri-header">
        <span className="galeri-title">Galeri</span>
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
          <div style={{ margin: "8px", position: "relative" }}>

            {/* Canvas foto utama */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              style={{
                background: "#e8e0d0",
                borderRadius: "0 0 8px 8px",
                padding: "16px 12px 12px",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.15)",
                overflowY: "auto",
                maxHeight: expanded ? "calc(90vh - 180px)" : "185px",
                position: "relative",
              }}
            >
               <div style={{ position: "relative", marginBottom: "-2px" }}>
                <svg width="100%" height="60" viewBox="0 0 300 60" preserveAspectRatio="none">
                  {/* Tali kiri */}
                  <path d="M0,8 Q75,35 150,12 Q225,35 300,8" fill="none" stroke="#D4A017" strokeWidth="1.2" strokeDasharray="none"/>

                  {/* Flag HAPPY */}
                  {['H','A','P','P','Y'].map((l, i) => {
                    const x = 8 + i * 28; 
                    return (
                      <g key={i}>
                        <polygon
                          points={`${x},10 ${x+20},10 ${x+20},32 ${x+10},40 ${x},32`}
                          fill="#6B1A1A" stroke="#D4A017" strokeWidth="1"
                        />
                        <text x={x+10} y={27} textAnchor="middle"
                          fontFamily="serif" fontSize="11" fontWeight="bold" fill="#D4A017">
                          {l}
                        </text>
                      </g>
                    );
                  })}

                  
                  <path d="M150,12 Q225,35 300,8" fill="none" stroke="#D4A017" strokeWidth="1.2"/>

               
                  {['B','I','R','T','H','D','A','Y'].map((l, i) => {
                    const x = 152 + i * 18.5;
                    return (
                      <g key={i}>
                        <polygon
                          points={`${x},14 ${x+15},14 ${x+15},32 ${x+7.5},40 ${x},32`}
                          fill="#8B2525" stroke="#D4A017" strokeWidth="0.8"
                        />
                        <text x={x+7.5} y={28} textAnchor="middle"
                          fontFamily="serif" fontSize="9" fontWeight="bold" fill="#D4A017">
                          {l}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            
              <div style={{
                position: "absolute", top: 6, left: 8,
                fontSize: 14, opacity: 0.4, color: "#D4A017",
              }}>✦</div>
              <div style={{
                position: "absolute", top: 6, right: 8,
                fontSize: 14, opacity: 0.4, color: "#D4A017",
              }}>✦</div>

              
              {[
                {top:10,left:'15%',color:'#D4A017',size:5},
                {top:10,left:'35%',color:'#8B2525',size:4},
                {top:10,left:'55%',color:'#D4A017',size:6},
                {top:10,left:'75%',color:'#8B2525',size:4},
                {top:10,left:'90%',color:'#D4A017',size:5},
              ].map((d,i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: d.top, left: d.left,
                  width: d.size, height: d.size,
                  borderRadius: "50%",
                  background: d.color,
                  opacity: 0.5,
                }}/>
              ))}

              <div className="masonry-wrap">
                {/* Kolom Kiri */}
                <div className="masonry-col">
                  {fotoKiri.map((f, i) => {
                    const h = heights[(i * 2) % heights.length];
                    const rot = rotations[(i * 2) % rotations.length];
                    return (
                      <div key={f.id} className="masonry-card"
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
                      <div key={f.id} className="masonry-card"
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

      {showBtn && (
        <div className="next-wrapper">
          <button className="next-btn-retro" onClick={onSwitchToMusik}>
            NEXT LAGI.... ➤
          </button>
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