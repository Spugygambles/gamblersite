// Brings the static snapshot of the homepage to life without React: the
// same behaviour as the site's components, in plain script.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Class names in the snapshot look like "SiteHeader-module__AbC1__navLink":
  // given one, swap its last part to get its siblings from the same module.
  const sibling = (cls, name) => cls.replace(/__[^_]+$/, `__${name}`);
  const classOf = (el, suffix) => [...el.classList].find((c) => c.endsWith(`__${suffix}`));

  // ---- Banner art: plays as the page loads and again on each hover, like
  // components/useBannerPlay.ts. Lengths match each art's play time.
  const PLAY_MS = {
    BattleArt: 2200,
    BlackjackArt: 1400,
    CaseArt: 2100,
    CoinflipArt: 1250,
    CrashArt: 3000,
    KenoArt: 3800,
    LimboArt: 2200,
    MinesArt: 3600,
    UpgraderArt: 3800,
  };
  document.querySelectorAll("[data-playing], [data-flipping]").forEach((stage) => {
    const name = [...stage.classList].map((c) => c.split("-module__")[0]).find((n) => n in PLAY_MS);
    if (!name) return;
    const attr = stage.hasAttribute("data-flipping") ? "data-flipping" : "data-playing";
    const ms = PLAY_MS[name];
    let playing = true;
    const stop = () => {
      stage.removeAttribute(attr);
      playing = false;
    };
    setTimeout(stop, ms);
    const banner = stage.closest("[data-game-banner]") || stage;
    banner.addEventListener("mouseenter", () => {
      if (playing || reduce) return;
      stage.removeAttribute("data-intro");
      // The coin lands on the other face each throw.
      if (stage.dataset.face) stage.dataset.face = stage.dataset.face === "heads" ? "tails" : "heads";
      void stage.offsetWidth;
      stage.setAttribute(attr, "true");
      playing = true;
      setTimeout(stop, ms);
    });
  });

  // ---- Players online: drifts a little, pulled back toward where it began.
  const online = document.querySelector('[aria-label="Live drops"] .tabular');
  if (online) {
    const start = Number(online.textContent) || 517;
    let count = start;
    setInterval(() => {
      count = Math.max(380, Math.min(720, count + Math.round((Math.random() - 0.5) * 9 + (start - count) * 0.04)));
      online.textContent = String(count);
    }, 3800);
  }

  // ---- Countdowns on the event cards, ticking every second.
  const pad = (n) => String(n).padStart(2, "0");
  const ENDS = {
    "/deposit": () => {
      const d = new Date();
      d.setHours(24, 0, 0, 0);
      return d;
    },
    "/pumpkin-hunt": () => {
      const now = new Date();
      const end = new Date(now.getFullYear(), 9, 31, 23, 59, 59);
      return end > now ? end : new Date(now.getFullYear() + 1, 9, 31, 23, 59, 59);
    },
    "/race": () => {
      const d = new Date();
      const days = (8 - d.getUTCDay()) % 7 || 7;
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
    },
  };
  const timers = [];
  document.querySelectorAll("a[data-spotlight]").forEach((card) => {
    const ends = ENDS[card.getAttribute("href")];
    const timer = [...card.querySelectorAll("span")].find((s) => classOf(s, "timer"));
    if (!ends || !timer) return;
    const text = [...timer.childNodes].reverse().find((n) => n.nodeType === Node.TEXT_NODE);
    if (text) timers.push({ end: ends().getTime(), text });
  });
  const tick = () => {
    for (const t of timers) {
      const s = Math.max(0, Math.floor((t.end - Date.now()) / 1000));
      const d = Math.floor(s / 86400);
      const hms = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
      t.text.data = d > 0 ? `${d}d ${hms}` : hms;
    }
  };
  tick();
  setInterval(tick, 1000);

  // ---- Cards light up under the pointer (components/home/Spotlight.tsx).
  if (matchMedia("(hover: hover)").matches) {
    document.addEventListener(
      "pointermove",
      (e) => {
        const el = e.target.closest && e.target.closest("[data-spotlight]");
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      },
      { passive: true },
    );
  }

  // ---- Header: the games menu and the phone menu.
  const header = document.querySelector("header");
  const menuBtn = header && header.querySelector("button[aria-controls]");
  const drawer = menuBtn && document.getElementById(menuBtn.getAttribute("aria-controls"));
  const gamesBtn = header && [...header.querySelectorAll("nav button[aria-expanded]")][0];
  let dropdown = null;

  const closeGames = (focus) => {
    if (!dropdown) return;
    dropdown.remove();
    dropdown = null;
    gamesBtn.setAttribute("aria-expanded", "false");
    gamesBtn.querySelector("svg:last-of-type").classList.remove(sibling(classOf(gamesBtn, "navLink"), "chevronUp"));
    if (focus) gamesBtn.focus();
  };

  if (gamesBtn && drawer) {
    const btnCls = classOf(gamesBtn, "navLink");
    gamesBtn.addEventListener("click", () => {
      if (dropdown) return closeGames(false);
      dropdown = document.createElement("div");
      dropdown.className = sibling(btnCls, "dropdown");
      drawer.querySelectorAll(`.${sibling(btnCls, "drawerGames")} a`).forEach((a) => dropdown.append(a.cloneNode(true)));
      gamesBtn.after(dropdown);
      gamesBtn.setAttribute("aria-expanded", "true");
      gamesBtn.querySelector("svg:last-of-type").classList.add(sibling(btnCls, "chevronUp"));
    });
    document.addEventListener("pointerdown", (e) => {
      if (dropdown && !gamesBtn.parentElement.contains(e.target)) closeGames(false);
    });
    gamesBtn.parentElement.addEventListener("focusout", (e) => {
      if (!gamesBtn.parentElement.contains(e.relatedTarget)) closeGames(false);
    });
  }

  let drawerOpen = false;
  const menuIcon = menuBtn && menuBtn.innerHTML;
  const closeIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';
  const setDrawer = (open, focus) => {
    drawerOpen = open;
    drawer.hidden = !open;
    drawer.classList.toggle(sibling(classOf(drawer, "drawer"), "drawerOpen"), open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.innerHTML = open ? closeIcon : menuIcon;
    if (open) drawer.querySelector("a")?.focus();
    else if (focus) menuBtn.focus();
  };
  if (menuBtn && drawer) menuBtn.addEventListener("click", () => setDrawer(!drawerOpen, false));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (dropdown) closeGames(true);
    if (drawerOpen) setDrawer(false, true);
  });

  // ---- Links: only the homepage exists so far, so the rest say so
  // instead of leading nowhere.
  const toast = document.createElement("div");
  toast.className = "preview-toast";
  toast.setAttribute("role", "status");
  document.body.append(toast);
  let hide = 0;
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="/"]');
    if (!a) return;
    e.preventDefault();
    if (dropdown && dropdown.contains(a)) closeGames(false);
    if (drawerOpen && drawer.contains(a)) setDrawer(false, false);
    toast.textContent =
      a.getAttribute("href") === "/" ? "You're on the homepage." : "Preview: this page isn't built yet. Only the homepage is.";
    toast.classList.add("show");
    clearTimeout(hide);
    hide = setTimeout(() => toast.classList.remove("show"), 2600);
  });
})();
