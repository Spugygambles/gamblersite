// Spugy's screen effects: digital rain behind the page, and a way to skip the
// boot screen. Plain script, so the site and its static preview share it.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Boot screen: it plays and clears itself on a CSS timer; a click or a
  // key clears it now. Once it's gone it's taken out of the way.
  const boot = document.querySelector("[data-boot]");
  if (boot && !boot.hidden) {
    const listening = new AbortController();
    const skip = () => boot.setAttribute("data-done", "");
    addEventListener("pointerdown", skip, { signal: listening.signal });
    addEventListener("keydown", skip, { signal: listening.signal });
    boot.addEventListener("animationend", (e) => {
      if (e.target !== boot || !e.animationName.includes("power-off")) return;
      boot.hidden = true;
      listening.abort();
    });
  }

  // ---- Digital rain: columns of glyphs falling behind the page.
  const canvas = document.querySelector("canvas[data-rain]");
  if (!canvas || reduce) return;
  const ctx = canvas.getContext("2d");
  const GLYPHS = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789$#%&*+=<>";
  const SIZE = 16;
  let drops = [];

  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const n = Math.ceil(innerWidth / SIZE);
    // Each column starts somewhere above the screen, so they don't fall in step.
    drops = Array.from({ length: n }, (_, i) => drops[i] ?? -Math.random() * (innerHeight / SIZE));
  };
  resize();
  addEventListener("resize", resize);

  let last = 0;
  const frame = (t) => {
    requestAnimationFrame(frame);
    // About 18 frames a second is plenty, and nothing while the tab is hidden.
    if (document.hidden || t - last < 55) return;
    last = t;
    ctx.fillStyle = "rgba(10, 14, 12, 0.14)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${SIZE}px monospace`;
    for (let i = 0; i < drops.length; i++) {
      const y = drops[i] * SIZE;
      ctx.fillStyle = Math.random() < 0.05 ? "#d9ffe6" : "#3ff06e";
      ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * SIZE, y);
      drops[i] = y > canvas.height && Math.random() > 0.975 ? 0 : drops[i] + 1;
    }
  };
  requestAnimationFrame(frame);
})();
