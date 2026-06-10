import confetti from "canvas-confetti";

/**
 * Triggers a beautiful confetti animation themed around the specific milestone reached.
 * @param milestone The progress milestone reached (10, 20, 30, ..., 100)
 */
export function triggerConfetti(milestone: number) {
  if (typeof window === "undefined") return;

  let colors: string[] = [];
  let duration = 1.5 * 1000;

  switch (milestone) {
    case 10: // Bronze
      colors = ["#b45309", "#d97706", "#f59e0b"];
      break;
    case 20: // Silver
      colors = ["#94a3b8", "#cbd5e1", "#f1f5f9"];
      break;
    case 30: // Gold
      colors = ["#eab308", "#facc15", "#fef08a"];
      break;
    case 40: // Platinum
      colors = ["#0d9488", "#2dd4bf", "#99f6e4"];
      break;
    case 50: // Emerald
      colors = ["#059669", "#34d399", "#a7f3d0"];
      break;
    case 60: // Diamond
      colors = ["#2563eb", "#60a5fa", "#bfdbfe"];
      break;
    case 70: // Master
      colors = ["#7c3aed", "#a78bfa", "#ddd6fe"];
      break;
    case 80: // Grandmaster
      colors = ["#e11d48", "#fb7185", "#ffe4e6"];
      break;
    case 90: // Challenger
      colors = ["#f59e0b", "#f97316", "#ea580c"];
      break;
    case 100: // Challenger Max / Grand Finale
      colors = ["#eab308", "#facc15", "#fef08a", "#f59e0b", "#ff4500"];
      duration = 3.0 * 1000;
      break;
    default:
      colors = ["#3b82f6", "#10b981", "#ef4444"];
  }

  // If milestone is 100%, trigger the grand finale continuous effect
  if (milestone === 100) {
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors,
      });
      if (Math.random() < 0.25) {
        confetti({
          particleCount: 20,
          angle: 90,
          spread: 80,
          origin: { x: Math.random() * 0.4 + 0.3, y: 0.5 },
          colors,
        });
      }
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } else {
    // Standard burst from left & right
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.8 },
      colors,
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.8 },
      colors,
    });
  }
}
