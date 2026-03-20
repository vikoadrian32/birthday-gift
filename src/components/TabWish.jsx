import { useState, useRef, useEffect } from "react";
import { config } from "../config";
import { gsap } from "gsap";

const COLORS = {
  body:  "#6B1A1A",
  flap:  "#4A0E0E",
  gold:  "#D4A017",
  paper: "#FFF5E6",
  paperLine: "rgba(107,26,26,0.12)",
};

function EnvelopeScene({ wish, onClose }) {
  const overlayRef  = useRef(null);
  const envRef      = useRef(null);
  const flapRef     = useRef(null);
  const sealRef     = useRef(null);
  const letterRef   = useRef(null);
  const msgRef      = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // 1. Overlay fade in
    tl.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    )

    // 2. Envelope zoom masuk ke tengah
    .fromTo(envRef.current,
      { scale: 0.4, opacity: 0, y: 60 },
      { scale: 1,   opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.6)" }
    )

    // 3. Envelope goyang
    .to(envRef.current, { rotation: -4, duration: 0.08 })
    .to(envRef.current, { rotation:  4, duration: 0.08 })
    .to(envRef.current, { rotation: -3, duration: 0.07 })
    .to(envRef.current, { rotation:  3, duration: 0.07 })
    .to(envRef.current, { rotation:  0, duration: 0.08 })

    // 4. Seal mengecil & hilang
    .to(sealRef.current, {
      scale: 0, opacity: 0, duration: 0.25, ease: "back.in(2)"
    })

    // 5. Flap terbuka
    .to(flapRef.current, {
      rotateX: -175,
      duration: 0.7,
      ease: "power3.out",
      transformOrigin: "top center",
    }, "-=0.1")

    // 6. Kertas naik keluar dari dalam envelope
    .to(letterRef.current, {
      y: -130,
      opacity: 1,
      duration: 0.65,
      ease: "power2.out",
    }, "-=0.3")

    // 7. Pesan muncul di kertas
    .fromTo(msgRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    )

    // 8. Tombol close muncul
    .fromTo(closeBtnRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );

  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(msgRef.current,    { opacity: 0, y: 10, duration: 0.2 })
      .to(letterRef.current, { y: 0, opacity: 0, duration: 0.4, ease: "power2.in" }, "-=0.1")
      .to(flapRef.current,   { rotateX: 0, duration: 0.4, ease: "power2.in" }, "-=0.3")
      .to(sealRef.current,   { scale: 1, opacity: 1, duration: 0.2, ease: "back.out(2)" })
      .to(envRef.current,    { scale: 0.3, opacity: 0, y: 60, duration: 0.35, ease: "back.in(1.5)" })
      .to(overlayRef.current,{ opacity: 0, duration: 0.2 });
  };

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 400,
        display: "flex", alignItems: "center", justifyContent: "center",
        perspective: "800px",
      }}
      onClick={handleClose}
    >
      <div
        ref={envRef}
        style={{
          position: "relative",
          width: 260,
          transformStyle: "preserve-3d",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── KERTAS (di belakang envelope, naik ke atas) ── */}
        <div ref={letterRef} style={{
          position: "absolute",
          top: "50%", left: "5%", right: "5%",
          background: COLORS.paper,
          borderRadius: "6px",
          padding: "20px 16px 16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          zIndex: 10,
          opacity: 0,
          minHeight: 160,
        }}>
          {/* Garis kertas */}
          {[...Array(7)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              top: 36 + i * 20, left: 12, right: 12,
              height: 1, background: COLORS.paperLine,
            }} />
          ))}

          {/* Header surat */}
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "6px", color: COLORS.body,
            textAlign: "center", marginBottom: "14px",
            letterSpacing: "2px", position: "relative", zIndex: 1,
          }}>
            ✦ WISH ✦
          </div>

          {/* Isi pesan */}
          <div ref={msgRef} style={{
            fontFamily: "'VT323', monospace",
            fontSize: "19px", color: "#2a1a1a",
            lineHeight: 1.5, textAlign: "center",
            position: "relative", zIndex: 1,
            minHeight: 70,
          }}>
            {wish.teks}
          </div>

          {/* Dari */}
          <div style={{
            fontFamily: "'VT323', monospace",
            fontSize: "16px", color: COLORS.body,
            textAlign: "right", marginTop: "10px",
            position: "relative", zIndex: 1,
          }}>
            — {wish.dari}
          </div>
        </div>

        {/* ── ENVELOPE BODY ── */}
        <div style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.6",
          zIndex: 2,
        }}>
          {/* Body */}
          <div style={{
            position: "absolute", inset: 0,
            background: COLORS.body,
            borderRadius: "6px",
            border: `2px solid ${COLORS.gold}`,
            overflow: "hidden",
          }}>
            {/* Lipatan diagonal */}
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${COLORS.flap} 50%, transparent 50%)`,
              opacity: 0.25,
            }} />
            {/* Lipatan bawah (segitiga) */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
              background: `linear-gradient(to top, rgba(0,0,0,0.2), transparent)`,
            }} />
          </div>

          {/* Seal */}
          <div ref={sealRef} style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 30, height: 30, borderRadius: "50%",
            background: COLORS.gold,
            border: `2px solid ${COLORS.flap}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, color: COLORS.flap,
            fontFamily: "'Press Start 2P', monospace",
            zIndex: 5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}>♥</div>

          {/* Flap atas */}
          <div
            ref={flapRef}
            style={{
              position: "absolute", top: 0, left: -1, right: -1,
              height: "52%", zIndex: 4,
              transformStyle: "preserve-3d",
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 100 52" preserveAspectRatio="none">
              <polygon points="0,0 100,0 50,52" fill={COLORS.flap} />
              <polygon points="0,0 100,0 50,52" fill="none"
                stroke={COLORS.gold} strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* ── TOMBOL CLOSE ── */}
        <div ref={closeBtnRef} style={{ opacity: 0, marginTop: 16 }}>
          <button
            onClick={handleClose}
            style={{
              display: "block", width: "100%",
              padding: "9px 0",
              background: `linear-gradient(180deg, #8B2525, #4A0E0E)`,
              color: COLORS.gold,
              border: `2px solid ${COLORS.gold}`,
              borderRadius: "5px",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "7px", letterSpacing: "1px",
              cursor: "pointer",
              boxShadow: "0 3px 0 #1a0505",
            }}
          >
            ✕ CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Thumbnail envelope di grid ──
function EnvelopeThumbnail({ wish, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer", userSelect: "none",
        position: "relative", width: "100%", aspectRatio: "1.5",
        transition: "transform 0.2s",
      }}
      onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -4, duration: 0.2 })}
      onMouseLeave={(e) => gsap.to(e.currentTarget, { y:  0, duration: 0.2 })}
    >
      {/* Body */}
      <div style={{
        position: "absolute", inset: 0,
        background: COLORS.body,
        borderRadius: "5px",
        border: `2px solid ${COLORS.gold}`,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${COLORS.flap} 50%, transparent 50%)`,
          opacity: 0.25,
        }} />
      </div>

      {/* Flap */}
      <div style={{
        position: "absolute", top: 0, left: -1, right: -1,
        height: "52%", zIndex: 3,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 100 52" preserveAspectRatio="none">
          <polygon points="0,0 100,0 50,52" fill={COLORS.flap} />
          <polygon points="0,0 100,0 50,52" fill="none"
            stroke={COLORS.gold} strokeWidth="1.5" />
        </svg>
      </div>

      {/* Seal */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 24, height: 24, borderRadius: "50%",
        background: COLORS.gold, border: `2px solid ${COLORS.flap}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, color: COLORS.flap,
        fontFamily: "'Press Start 2P', monospace",
        zIndex: 4, boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
      }}>♥</div>

      {/* Nama */}
      <div style={{
        position: "absolute", bottom: 4, left: 0, right: 0,
        textAlign: "center",
        fontFamily: "'VT323', monospace", fontSize: 13,
        color: COLORS.gold, zIndex: 5,
      }}>
        — {wish.dari} —
      </div>
    </div>
  );
}

export default function TabWish({ expanded = false }) {
  const [active, setActive] = useState(null);
  const wishes = config.wishes || [];

  return (
    <>
      {/* Header */}
      <div style={{
        padding: "8px 10px",
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "7px", color: "#2a1a1a",
        textAlign: "center", letterSpacing: "1px",
        borderBottom: "2px solid rgba(0,0,0,0.1)",
        background: "rgba(255,255,255,0.2)",
      }}>
        — 💌 WISH —
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        padding: "14px",
        overflowY: "auto",
        maxHeight: expanded ? "calc(90vh - 100px)" : "210px",
      }}>
        {wishes.map((w) => (
          <EnvelopeThumbnail
            key={w.id}
            wish={w}
            onClick={() => setActive(w)}
          />
        ))}
      </div>

      {/* Scene animasi envelope */}
      {active && (
        <EnvelopeScene
          wish={active}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}