import { useEffect, useRef } from "react";

const COLORS = ["#6B1A1A", "#D4A017", "#8B2525", "#FFF5E6", "#A33030", "#c0392b", "#f0c040"];

export default function Confetti({ active, onDone }) {
  const pieces = useRef(
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 1.4 + Math.random() * 2,
      delay: Math.random() * 0.8,
    }))
  );

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onDone, 3500);
    return () => clearTimeout(timer);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="confetti-container">
      {pieces.current.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            top: "-12px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
