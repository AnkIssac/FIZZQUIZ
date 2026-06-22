import confetti from 'canvas-confetti';

export function burstConfetti() {
  const colors = ['#6C4EF2', '#F2A84E', '#4ECF7A', '#F25E9E', '#F2D14E'];
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0 }, colors }), 120);
  setTimeout(() => confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1 }, colors }), 220);
}

export function celebrationConfetti() {
  const colors = ['#6C4EF2', '#F2A84E', '#4ECF7A', '#F25E9E', '#F2D14E'];
  const end = Date.now() + 2200;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
