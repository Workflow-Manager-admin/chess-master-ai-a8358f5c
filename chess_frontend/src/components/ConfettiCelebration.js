import React, { useEffect } from "react";
import "./ConfettiCelebration.css";

/**
 * ConfettiCelebration animates a confetti burst effect for chess win.
 * Props:
 *   show: boolean - Whether to display the confetti.
 *   duration: ms - How long to show confetti before hiding (default: 2400ms).
 *   onDone: function - Callback fired after confetti disappears.
 */
// PUBLIC_INTERFACE
function ConfettiCelebration({ show, duration = 2400, onDone }) {
  useEffect(() => {
    if (!show) return;
    // Allow time for confetti to fall, then fire onDone
    const t = setTimeout(() => {
      onDone && onDone();
    }, duration);
    return () => clearTimeout(t);
  }, [show, duration, onDone]);

  if (!show) return null;
  // Generate simple particles
  const count = 36;
  const confetti = Array.from({ length: count }, (_, i) => ({
    key: "c" + i,
    left: 35 + 30 * Math.random(),
    top: 30 + 30 * Math.random(),
    deg: 360 * Math.random(),
    color: [
      "#d45a5a", // Red
      "#f0d9b5", // Board-light
      "#b58863", // Board-accent
      "#43abce", // Blue
      "#e87a41", // Orange
      "#fff",    // White
      "#3a3a3a", // Board-dark
    ][i % 7],
    scale: 0.9 + Math.random() * 0.4,
    delay: Math.random() * 0.2,
  }));
  return (
    <div className="confetti-celebration-root" aria-hidden>
      {confetti.map(({ key, left, top, deg, color, scale, delay }) => (
        <div
          key={key}
          className="confetti-piece"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            transform: `rotate(${deg}deg) scale(${scale})`,
            background: color,
            animationDelay: `${delay}s`,
          }}
        ></div>
      ))}
    </div>
  );
}

export default ConfettiCelebration;
