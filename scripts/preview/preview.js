// Brings the static snapshot of the homepage to life without React: the
// same behaviour as the site's components, in plain script.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Class names in the snapshot look like "ChatPanel-module__AbC1__message":
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

  // ---- Players online: one number, shown in chat, drifting a little and
  // pulled back toward where it began (components/home/useOnlineCount.ts).
  const onlineEls = document.querySelectorAll("[data-online]");
  if (onlineEls.length) {
    const start = Number(onlineEls[0].textContent) || 517;
    let count = start;
    setInterval(() => {
      count = Math.max(380, Math.min(720, count + Math.round((Math.random() - 0.5) * 9 + (start - count) * 0.04)));
      onlineEls.forEach((el) => (el.textContent = String(count)));
    }, 3800);
  }

  // ---- Countdowns on the promo cards, as "6d 2h", "2h 13m" or "13m"
  // (components/home/useCountdown.ts), updated every half minute.
  const ENDS = {
    "/deposit": () => {
      const d = new Date();
      d.setHours(24, 0, 0, 0);
      return d;
    },
    "/turkey-hunt": () => {
      // The end of the Monday after Thanksgiving (the fourth Thursday in
      // November); next year's once it's over.
      const endOf = (year) => {
        const first = new Date(year, 10, 1).getDay();
        return new Date(year, 10, 1 + ((4 - first + 7) % 7) + 25, 23, 59, 59);
      };
      const now = new Date();
      const end = endOf(now.getFullYear());
      return end > now ? end : endOf(now.getFullYear() + 1);
    },
    "/race": () => {
      const d = new Date();
      const days = (8 - d.getUTCDay()) % 7 || 7;
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
    },
  };
  const formatLeft = (ms) => {
    const m = Math.max(0, Math.floor(ms / 60000));
    const d = Math.floor(m / 1440);
    const h = Math.floor((m % 1440) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m`;
  };
  const timers = [];
  document.querySelectorAll("main a[href]").forEach((card) => {
    const ends = ENDS[card.getAttribute("href")];
    const el = [...card.querySelectorAll("span")].find((s) => classOf(s, "timer"));
    if (ends && el) timers.push({ ends, end: ends().getTime(), el });
  });
  const tick = () => {
    for (const t of timers) {
      // Once one's up, count down to the next.
      if (t.end <= Date.now()) t.end = t.ends().getTime();
      t.el.lastChild.textContent = formatLeft(t.end - Date.now());
    }
  };
  tick();
  setInterval(tick, 30000);

  // ---- The frame (components/home/AppShell.tsx): the menu and chat
  // buttons, the drawer and chat sliding over the page on smaller screens,
  // and Escape or the dimmed page closing them.
  const shell = document.querySelector("[data-shell]");
  if (shell) {
    const WIDE_CHAT = "(min-width: 1440px)";
    const OVERLAY_CHAT = "(max-width: 1199px)";
    const RAIL_MENU = "(min-width: 768px) and (max-width: 1279px)";
    const DRAWER_MENU = "(max-width: 767px)";
    const matches = (q) => matchMedia(q).matches;
    let menu = "auto";
    let talk = "auto";
    const menuIsRail = () => menu === "collapsed" || (menu === "auto" && matches(RAIL_MENU));
    const chatIsShown = () => talk === "open" || (talk === "auto" && matches(WIDE_CHAT));
    const sync = () => {
      shell.dataset.sidebar = menu;
      shell.dataset.chat = talk;
      const menuShown = matches(DRAWER_MENU) ? menu === "open" : !menuIsRail();
      shell.querySelectorAll('[data-shell-toggle="sidebar"]').forEach((b) => b.setAttribute("aria-expanded", String(menuShown)));
      shell.querySelectorAll('[data-shell-toggle="chat"]').forEach((b) => b.setAttribute("aria-expanded", String(chatIsShown())));
    };
    const dismiss = () => {
      if (menu === "open") menu = "auto";
      if (talk === "open" && matches(OVERLAY_CHAT)) talk = "closed";
      sync();
    };
    shell.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-shell-toggle]");
      const which = toggle && toggle.dataset.shellToggle;
      if (which === "sidebar") {
        if (matches(DRAWER_MENU)) menu = menu === "open" ? "auto" : "open";
        else menu = menuIsRail() ? "expanded" : "collapsed";
        sync();
        if (menu === "open") shell.querySelector('[data-shell-part="sidebar"] a').focus();
      } else if (which === "chat") {
        talk = chatIsShown() ? "closed" : "open";
        sync();
      } else if (which === "dismiss" || e.target.closest('[data-shell-part="sidebar"] a')) {
        dismiss();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const closing = [menu === "open" && matches(DRAWER_MENU) && "sidebar", talk === "open" && matches(OVERLAY_CHAT) && "chat"];
      const part = document.activeElement && document.activeElement.closest("[data-shell-part]");
      const from = part && part.dataset.shellPart;
      dismiss();
      if (from && closing.includes(from)) shell.querySelector(`[data-shell-toggle="${from}"]`).focus();
    });
    addEventListener("resize", sync);
    sync();
  }

  // ---- Chat (components/home/ChatPanel.tsx): the rain clock, joining the
  // rain, and sending a message, which shows up straight away.
  const chat = document.querySelector('aside[aria-label="Chat"]');
  if (chat) {
    const clock = chat.querySelector("[data-rain-clock]");
    const nextRain = () => {
      const d = new Date();
      d.setMinutes(Math.floor(d.getMinutes() / 15) * 15 + 15, 0, 0);
      return d;
    };
    const showClock = () => {
      const s = Math.max(0, Math.round((nextRain().getTime() - Date.now()) / 1000));
      clock.lastChild.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    };
    if (clock) {
      showClock();
      setInterval(showClock, 1000);
    }

    const join = [...chat.querySelectorAll("button")].find((b) => b.textContent.trim() === "Join");
    if (join) {
      join.addEventListener("click", () => {
        join.disabled = true;
        join.textContent = "Joined";
      });
    }

    const log = chat.querySelector('[role="log"]');
    const list = log.querySelector("ol");
    const form = chat.querySelector("form");
    const input = form.querySelector("input");
    const send = form.querySelector('button[type="submit"]');
    log.scrollTop = log.scrollHeight;
    const AVATARS = ["#56649e", "#4c8068", "#a06a4a", "#7a5d96", "#4a7a8c", "#937c46", "#9a5060"];
    const avatarOf = (name) => AVATARS[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATARS.length];
    const tierOf = (level) => (level >= 80 ? "gold" : level >= 50 ? "purple" : level >= 20 ? "blue" : "");
    // The player, as the header shows them ("Account, level 70").
    const account = document.querySelector('header button[aria-label^="Account"]');
    const me = { name: "Spugy", level: Number(((account && account.getAttribute("aria-label")) || "").replace(/\D/g, "")) || 70 };
    input.addEventListener("input", () => (send.disabled = !input.value.trim()));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      // A copy of the newest message from a player, filled in as ours.
      const model = [...list.children].reverse().find((li) => classOf(li, "message"));
      const li = model.cloneNode(true);
      const msgCls = classOf(model, "message");
      li.classList.add(sibling(msgCls, "mine"));
      const avatar = li.firstElementChild;
      avatar.textContent = me.name[0].toUpperCase();
      avatar.style.background = avatarOf(me.name);
      const level = [...li.querySelectorAll("span")].find((s) => classOf(s, "level"));
      ["gold", "purple", "blue"].forEach((t) => level.classList.remove(sibling(msgCls, t)));
      if (tierOf(me.level)) level.classList.add(sibling(msgCls, tierOf(me.level)));
      level.lastChild.textContent = String(me.level);
      [...li.querySelectorAll("span")].find((s) => classOf(s, "name")).textContent = me.name;
      [...li.querySelectorAll("p")].find((s) => classOf(s, "text")).textContent = text;
      list.append(li);
      log.scrollTop = log.scrollHeight;
      input.value = "";
      send.disabled = true;
    });
  }

  // ---- Theme picker (preview only): try the homepage in other colours.
  // The themes live in preview.css; Pumpkin is the site's own. The choice is
  // remembered on this device.
  const THEMES = [
    ["pumpkin", "Pumpkin", "#dc7a3e"],
    ["cranberry", "Cranberry", "#c24a43"],
    ["maple", "Maple gold", "#d6a043"],
    ["sage", "Sage", "#8ba35e"],
    ["classic", "Classic gold", "#f5c32c"],
    ["midnight", "Midnight blue", "#2f7bf5"],
  ];
  const STORE = "csgoneo-theme";
  const picker = document.createElement("div");
  picker.className = "palette-picker";
  picker.setAttribute("role", "group");
  picker.setAttribute("aria-label", "Try a colour");
  const label = document.createElement("span");
  label.className = "name";
  const swatches = document.createElement("span");
  swatches.className = "swatches";
  picker.append(label, swatches);
  const useTheme = (id) => {
    const [, name] = THEMES.find((t) => t[0] === id) || THEMES[0];
    document.documentElement.dataset.palette = id;
    label.textContent = name;
    swatches.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
    try {
      localStorage.setItem(STORE, id);
    } catch {
      // Storage can be off; the choice just won't be remembered.
    }
  };
  for (const [id, name, color] of THEMES) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.id = id;
    b.style.setProperty("--swatch", color);
    b.setAttribute("aria-label", name);
    b.title = name;
    b.addEventListener("click", () => useTheme(id));
    swatches.append(b);
  }
  document.body.append(picker);
  let saved = "pumpkin";
  try {
    saved = localStorage.getItem(STORE) || "pumpkin";
  } catch {
    // Fall back to Pumpkin.
  }
  useTheme(THEMES.some((t) => t[0] === saved) ? saved : "pumpkin");

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
    toast.textContent =
      a.getAttribute("href") === "/" ? "You're on the homepage." : "Preview: this page isn't built yet. Only the homepage is.";
    toast.classList.add("show");
    clearTimeout(hide);
    hide = setTimeout(() => toast.classList.remove("show"), 2600);
  });
})();
