import React, { useMemo } from "react";

interface MeteorsProps {
  number?: number;
  color?: "black" | "white";
  active?: boolean;
}

export const Meteors: React.FC<MeteorsProps> = ({ number = 36, color = "white", active = true }) => {
  const isWhite = color === "white";

  // 🌠 Progressive Crescendo Meteor Physics:
  // Starts One-by-One -> Then All Together in a Cluster -> Then Increases to High Density
  const meteors = useMemo(() => {
    return Array.from({ length: number }).map((_, idx) => {
      let delaySeconds = 0;
      let durationSeconds = 6.5;

      if (idx === 0) {
        // 1st Single Meteor
        delaySeconds = 0.3;
        durationSeconds = 5.2;
      } else if (idx === 1) {
        // 2nd Single Meteor
        delaySeconds = 1.6;
        durationSeconds = 5.0;
      } else if (idx === 2) {
        // 3rd Single Meteor
        delaySeconds = 2.8;
        durationSeconds = 4.8;
      } else if (idx >= 3 && idx <= 7) {
        // Cluster Burst: "All together"
        delaySeconds = 3.8 + (idx - 3) * 0.25;
        durationSeconds = 5.5 + Math.random() * 2;
      } else {
        // High Density Crescendo Shower
        delaySeconds = 5.0 + Math.random() * 6.5;
        durationSeconds = 6.0 + Math.random() * 3.5;
      }

      return {
        id: idx,
        top: -15 + Math.random() * 75 + "%",
        left: 10 + Math.random() * 95 + "%",
        animationDelay: `${delaySeconds.toFixed(2)}s`,
        animationDuration: `${durationSeconds.toFixed(2)}s`,
        tailWidth: Math.floor(Math.random() * (190 - 120) + 120) + "px",
      };
    });
  }, [number]);

  // Background Twinkling White Celestial Stars (Loaded and visible immediately)
  const stars = useMemo(() => {
    return Array.from({ length: 55 }).map((_, idx) => ({
      id: idx,
      top: Math.random() * 100 + "%",
      left: Math.random() * 100 + "%",
      size: Math.random() > 0.8 ? 2.5 : Math.random() > 0.4 ? 1.5 : 1,
      animationDelay: "-" + (Math.random() * 4).toFixed(2) + "s",
      opacity: (Math.random() * 0.7 + 0.3).toFixed(2),
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background Twinkling Stars Field - Active immediately */}
      {stars.map((star) => (
        <span
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white animate-twinkle opacity-0"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.animationDelay,
            boxShadow:
              star.size > 2
                ? "0 0 6px 1px rgba(255, 255, 255, 0.9)"
                : "0 0 3px 0.5px rgba(255, 255, 255, 0.6)",
          }}
        />
      ))}

      {/* 🌠 Progressive Crescendo Meteors (Fires One by One -> All Together -> High Density) */}
      {active &&
        meteors.map((el) => (
          <span
            key={`meteor-${el.id}`}
            className={`animate-meteor-shower absolute h-1.5 w-1.5 rounded-full opacity-0 ${
              isWhite
                ? "bg-white shadow-[0_0_10px_3px_rgba(255,255,255,1)]"
                : "bg-slate-950 shadow-[0_0_8px_2px_rgba(15,23,42,0.8)]"
            }`}
            style={{
              top: el.top,
              left: el.left,
              animationDelay: el.animationDelay,
              animationDuration: el.animationDuration,
            }}
          >
            {/* Luminous Glowing Cyan/White Tail */}
            <div
              className={`pointer-events-none absolute top-1/2 right-0 h-[1.8px] -translate-y-1/2 ${
                isWhite
                  ? "bg-gradient-to-l from-white via-cyan-300 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.9)]"
                  : "bg-gradient-to-l from-slate-950 via-slate-700 to-transparent shadow-[0_0_8px_rgba(15,23,42,0.3)]"
              }`}
              style={{ width: el.tailWidth }}
            />
          </span>
        ))}
    </div>
  );
};