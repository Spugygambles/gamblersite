// Brings the static snapshots of the site's pages to life without React:
// the same behaviour as the site's components, in plain script. Each part
// looks for what it works on and leaves pages without it alone.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Class names in the snapshot look like "ChatPanel-module__AbC1__message":
  // given one, swap its last part to get its siblings from the same module.
  const sibling = (cls, name) => cls.replace(/__[^_]+$/, `__${name}`);
  const classOf = (el, suffix) => [...el.classList].find((c) => c.endsWith(`__${suffix}`));

  // Each player's colour behind their initial (components/home/avatar.ts).
  const AVATARS = ["#56649e", "#4c8068", "#a06a4a", "#7a5d96", "#4a7a8c", "#937c46", "#9a5060"];
  const avatarOf = (name) => AVATARS[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATARS.length];

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

  // ---- The frame (components/home/AppShell.tsx): the chat buttons, chat
  // sliding over the page on smaller screens, and Escape or the dimmed page
  // closing it.
  const shell = document.querySelector("[data-shell]");
  if (shell) {
    const WIDE_CHAT = "(min-width: 1440px)";
    const OVERLAY_CHAT = "(max-width: 1199px)";
    const matches = (q) => matchMedia(q).matches;
    let talk = "auto";
    const chatIsShown = () => talk === "open" || (talk === "auto" && matches(WIDE_CHAT));
    const sync = () => {
      shell.dataset.chat = talk;
      shell.querySelectorAll('[data-shell-toggle="chat"]').forEach((b) => b.setAttribute("aria-expanded", String(chatIsShown())));
    };
    const dismiss = () => {
      if (talk === "open" && matches(OVERLAY_CHAT)) talk = "closed";
      sync();
    };
    shell.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-shell-toggle]");
      const which = toggle && toggle.dataset.shellToggle;
      if (which === "chat") {
        talk = chatIsShown() ? "closed" : "open";
        sync();
      } else if (which === "dismiss") {
        dismiss();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || talk !== "open" || !matches(OVERLAY_CHAT)) return;
      const fromChat = document.activeElement && document.activeElement.closest('[data-shell-part="chat"]');
      dismiss();
      if (fromChat) {
        const toggle = [...shell.querySelectorAll('[data-shell-toggle="chat"]')].find(
          (t) => !t.closest('[data-shell-part="chat"]') && t.getClientRects().length > 0,
        );
        if (toggle) toggle.focus();
      }
    });
    addEventListener("resize", sync);
    sync();
  }

  // ---- The games menu in the header (components/home/GamesMenu.tsx): its
  // button opens it, and a click outside, Escape or picking a game closes it.
  const gamesButton = document.querySelector("[data-games-toggle]");
  if (gamesButton) {
    const menu = document.getElementById(gamesButton.getAttribute("aria-controls"));
    const show = (open) => {
      menu.hidden = !open;
      gamesButton.setAttribute("aria-expanded", String(open));
    };
    gamesButton.addEventListener("click", () => show(menu.hidden));
    document.addEventListener("pointerdown", (e) => {
      if (!menu.hidden && !gamesButton.parentElement.contains(e.target)) show(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || menu.hidden) return;
      show(false);
      gamesButton.focus();
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) show(false);
    });
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

    const join = chat.querySelector("[data-rain-join]");
    if (join) {
      join.addEventListener("click", () => {
        join.disabled = true;
        join.setAttribute("aria-label", "Joined the rain");
      });
    }

    const log = chat.querySelector('[role="log"]');
    const list = log.querySelector("ol");
    const form = chat.querySelector("form");
    const input = form.querySelector("input");
    const send = form.querySelector('button[type="submit"]');
    log.scrollTop = log.scrollHeight;
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

  // ---- Bets (components/home/LiveBets.tsx): tabs for the big and lucky
  // wins, and how many rows to show. The sample bets come from the same
  // seeded numbers as lib/home.ts, so the table matches what the site drew.
  const betTable = document.querySelector('main table[class*="LiveBets-module__"]');
  if (betTable) {
    const cls = (name) => sibling(classOf(betTable, "table"), name);
    const tbody = betTable.tBodies[0];
    const template = tbody.rows[0].cloneNode(true);
    const GAMES = ["case-battles", "cases", "upgrader", "mines", "keno", "crash", "limbo", "coinflip", "blackjack"];
    const NAMES = {
      "case-battles": "Case Battles",
      cases: "Cases",
      upgrader: "Upgrader",
      mines: "Mines",
      keno: "Keno",
      crash: "Crash",
      limbo: "Limbo",
      coinflip: "Coinflip",
      blackjack: "Blackjack",
    };
    const PLAYERS = [
      "kyro", "MaxiM", "nova", "deadeye", "Spl1t", "frostbyte", "lunar", "zenn", "Obi", "vexx",
      "tiko", "rook", "ghostR", "mira", "jaxx", "Pele", "sk8r", "dusk", "Wren", "hydra",
    ];
    const WAGERS = [0.25, 0.5, 1, 2, 2.5, 5, 10, 12.5, 20, 25, 50, 100, 250];
    const makeBet = (id, random) => {
      const game = GAMES[Math.floor(random() * GAMES.length)];
      const player = random() < 0.15 ? null : PLAYERS[Math.floor(random() * PLAYERS.length)];
      const wager = WAGERS[Math.floor(random() * WAGERS.length)];
      const r = random();
      let multiplier = r < 0.42 ? 0 : r < 0.82 ? 1.1 + random() * 1.9 : r < 0.95 ? 3 + random() * 17 : 20 + random() * 280;
      if (multiplier === 0 && game === "cases") multiplier = 0.1 + random() * 0.8;
      return { id, game, player, wager, multiplier: Math.round(multiplier * 100) / 100 };
    };
    const seeded = (seed) => {
      let s = (seed * 2654435761) >>> 0 || 1;
      return () => {
        s ^= s << 13;
        s ^= s >>> 17;
        s ^= s << 5;
        return ((s >>> 0) % 100000) / 100000;
      };
    };
    const random = seeded(7);
    const bets = Array.from({ length: 120 }, (_, i) => makeBet(120 - i, random));
    const SHOWS = {
      all: () => true,
      big: (b) => b.multiplier >= 1 && b.wager * b.multiplier >= 100,
      lucky: (b) => b.multiplier >= 10,
    };
    const TAB_IDS = ["all", "big", "lucky"];
    let tab = "all";
    let rows = 8;
    const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const setAmount = (cell, value) => {
      cell.querySelector("span").lastChild.textContent = money.format(value);
    };
    const rowFor = (b) => {
      const tr = template.cloneNode(true);
      const [game, player, wager, mult, payout] = tr.cells;
      const won = b.multiplier >= 1;
      // The game's icon, borrowed from the header's games menu.
      const icon = document.querySelector(`#games-menu a[href="/${b.game}"] svg`);
      const gameSpan = game.querySelector("span");
      gameSpan.firstElementChild.replaceWith(icon.cloneNode(true));
      gameSpan.lastElementChild.textContent = NAMES[b.game];
      const [avatar, name] = player.querySelector("span").children;
      avatar.textContent = b.player ? b.player[0].toUpperCase() : "?";
      avatar.style.background = b.player ? avatarOf(b.player) : "";
      name.textContent = b.player || "Hidden";
      name.classList.toggle(cls("hidden"), !b.player);
      setAmount(wager, b.wager);
      const chip = mult.querySelector("span");
      chip.textContent = `${b.multiplier.toFixed(2)}×`;
      chip.classList.toggle(cls("up"), won);
      payout.classList.toggle(cls("win"), won);
      payout.classList.toggle(cls("loss"), !won);
      setAmount(payout, b.wager * b.multiplier);
      return tr;
    };
    const render = () => tbody.replaceChildren(...bets.filter(SHOWS[tab]).slice(0, rows).map(rowFor));

    const tabs = [...betTable.parentElement.querySelectorAll('[role="tablist"] [role="tab"]')];
    tabs.forEach((button, i) =>
      button.addEventListener("click", () => {
        tab = TAB_IDS[i];
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t === button)));
        render();
      }),
    );
    const select = betTable.parentElement.querySelector("select");
    if (select) {
      select.addEventListener("change", () => {
        rows = Number(select.value);
        render();
      });
    }
  }

  // ---- The Turkey Hunt (components/event): the countdown, a box per digit,
  // ticking every second to the end of the Monday after Thanksgiving
  // (lib/event.ts); the picture cards switching panels, by click or arrow
  // key; and the calendar's Claim button, which marks today claimed.
  const countdown = document.querySelector("[data-countdown]");
  if (countdown) {
    const huntEnds = () => {
      const now = new Date();
      const endOf = (year) => {
        const first = new Date(year, 10, 1).getDay();
        return new Date(year, 10, 1 + ((4 - first + 7) % 7) + 25, 23, 59, 59);
      };
      const end = endOf(now.getFullYear());
      return end > now ? end : endOf(now.getFullYear() + 1);
    };
    const units = Object.fromEntries([...countdown.querySelectorAll("[data-unit]")].map((el) => [el.dataset.unit, el]));
    const tick = () => {
      const s = Math.max(0, Math.floor((huntEnds().getTime() - Date.now()) / 1000));
      const parts = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
      for (const [unit, el] of Object.entries(units)) {
        const digits = [...String(parts[unit]).padStart(2, "0")];
        while (el.children.length < digits.length) el.append(el.firstElementChild.cloneNode(true));
        while (el.children.length > digits.length) el.lastElementChild.remove();
        digits.forEach((digit, i) => (el.children[i].textContent = digit));
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  const tabs = [...document.querySelectorAll("[data-event-tab]")];
  const selectTab = (id, focus) => {
    for (const tab of tabs) {
      const on = tab.dataset.eventTab === id;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    }
    document.querySelectorAll("[data-event-panel]").forEach((panel) => (panel.hidden = panel.dataset.eventPanel !== id));
  };
  for (const tab of tabs) {
    tab.addEventListener("click", () => selectTab(tab.dataset.eventTab));
    tab.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const at = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      selectTab(tabs[(at + step + tabs.length) % tabs.length].dataset.eventTab, true);
    });
  }

  document.querySelectorAll("[data-claim]").forEach((button) => {
    button.addEventListener("click", () => {
      const day = button.closest("[data-day-state]");
      const done = document.querySelector('[data-day-state="claimed"]');
      if (!day || !done) return;
      day.className = done.className;
      day.dataset.dayState = "claimed";
      button.replaceWith(done.querySelector("[data-status]").cloneNode(true));
      // one more day claimed, and its leaves added to the total under it
      const claimed = document.querySelector("[data-claimed-count]");
      if (!claimed) return;
      claimed.textContent = String(Number(claimed.textContent) + 1);
      const leaves = parseInt(day.querySelector('[class*="__gift"]')?.textContent ?? "", 10) || 0;
      const note = claimed.closest("p")?.lastElementChild;
      if (note) note.textContent = note.textContent.replace(/^[\d,]+/, (n) => (Number(n.replace(/,/g, "")) + leaves).toLocaleString("en-US"));
    });
  });

  // ---- The account window (components/profile/ProfileModal.tsx): any
  // [data-profile-open] opens it on the profile; its menu switches sections,
  // by click or arrow key; the close button, Escape or a click outside
  // closes it and hands focus back. Inside, switches flip, Save wakes when
  // its field changes, and self exclusion's button wakes once a length is
  // picked and the box ticked. The bets are further down.
  const account = document.querySelector("[data-profile-dialog]");
  if (account) {
    let opener = null;
    const sections = [...account.querySelectorAll("[data-profile-tab]")];
    const show = (id, focus) => {
      for (const tab of sections) {
        const on = tab.dataset.profileTab === id;
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus) tab.focus();
      }
      account.querySelectorAll("[data-profile-panel]").forEach((panel) => (panel.hidden = panel.dataset.profilePanel !== id));
    };
    document.addEventListener("click", (e) => {
      const button = e.target.closest && e.target.closest("[data-profile-open]");
      if (!button || account.open) return;
      opener = button;
      show("profile");
      account.showModal();
      sections[0].focus();
    });
    account.addEventListener("close", () => opener && opener.focus());
    account.addEventListener("click", (e) => {
      if (e.target === account || e.target.closest("[data-profile-close]")) return account.close();
      const to = e.target.closest("[data-profile-tab], [data-profile-goto]");
      if (to) show(to.dataset.profileTab || to.dataset.profileGoto);
      const flip = e.target.closest("[data-switch]");
      if (flip) flip.setAttribute("aria-checked", String(flip.getAttribute("aria-checked") !== "true"));
      const save = e.target.closest("[data-save]");
      if (save) {
        const field = save.parentElement.querySelector("[data-field]");
        field.defaultValue = field.value;
        save.disabled = true;
      }
    });
    // Bets (BetTable.tsx, BetHistory.tsx): a click on a bet's row opens
    // what proves it fair, and a click on one of those values copies it.
    // The history's rows are all on the page; a tab for each game and the
    // pager pick which eight show.
    account.addEventListener("click", (e) => {
      const main = e.target.closest("[data-bet-main]");
      if (main) {
        const bet = main.closest("[data-bet]");
        const details = bet.querySelector("[data-bet-details]");
        details.hidden = !details.hidden;
        bet.dataset.open = String(!details.hidden);
        bet.querySelector("[data-bet-toggle]").setAttribute("aria-expanded", String(!details.hidden));
      }
      const copy = e.target.closest("[data-copy]");
      if (copy) {
        navigator.clipboard?.writeText(copy.dataset.copy).catch(() => {});
        copy.dataset.copied = "true";
        setTimeout(() => (copy.dataset.copied = "false"), 1200);
      }
    });
    const history = account.querySelector("[data-bet-history]");
    if (history) {
      const PER_PAGE = 8;
      const rows = [...history.querySelectorAll("[data-bet]")];
      let game = "all";
      let page = 1;
      const render = () => {
        const list = rows.filter((r) => game === "all" || r.dataset.game === game);
        const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
        page = Math.min(Math.max(page, 1), pages);
        const shown = new Set(list.slice((page - 1) * PER_PAGE, page * PER_PAGE));
        rows.forEach((r) => (r.hidden = !shown.has(r)));
        history.querySelector("[data-bet-empty]").hidden = list.length > 0;
        history.querySelectorAll("[data-bet-game]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.betGame === game)));
        const start = Math.max(1, Math.min(page - 1, pages - 2));
        history.querySelectorAll("[data-page-slot]").forEach((b, i) => {
          b.textContent = start + i;
          b.hidden = start + i > pages;
          if (start + i === page) b.setAttribute("aria-current", "page");
          else b.removeAttribute("aria-current");
        });
        history.querySelector("[data-page-gap]").hidden = start + 2 >= pages;
        history.querySelector('[data-page="prev"]').disabled = page === 1;
        history.querySelector('[data-page="next"]').disabled = page === pages;
      };
      history.addEventListener("click", (e) => {
        const tab = e.target.closest("[data-bet-game]");
        const slot = e.target.closest("[data-page-slot]");
        const step = e.target.closest("[data-page]");
        if (tab) [game, page] = [tab.dataset.betGame, 1];
        else if (slot) page = Number(slot.textContent);
        else if (step) page += step.dataset.page === "next" ? 1 : -1;
        else return;
        render();
      });
    }
    account.addEventListener("keydown", (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step || !e.target.closest("[data-profile-tab]")) return;
      e.preventDefault();
      const at = sections.findIndex((t) => t.getAttribute("aria-selected") === "true");
      show(sections[(at + step + sections.length) % sections.length].dataset.profileTab, true);
    });
    account.addEventListener("input", (e) => {
      const field = e.target.closest("[data-field]");
      if (field) field.parentElement.querySelector("[data-save]").disabled = field.value === field.defaultValue;
    });
    account.addEventListener("change", (e) => {
      if (!e.target.matches("[data-exclusion-period], [data-exclusion-sure]")) return;
      const period = account.querySelector("[data-exclusion-period]").value;
      const sure = account.querySelector("[data-exclusion-sure]").checked;
      account.querySelector("[data-exclusion-lock]").disabled = !period || !sure;
    });
  }

  // ---- Links: only some pages are built so far (their links point at
  // their files); the rest say so instead of leading nowhere. The note
  // shows just under the link, since the Claude app can make the page's
  // window taller than the screen.
  const toast = document.createElement("div");
  toast.className = "preview-toast";
  toast.setAttribute("role", "status");
  document.body.append(toast);
  let hide = 0;
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="/"]');
    if (!a) return;
    e.preventDefault();
    // In the account window, the note goes inside it, so it shows over the
    // darkened page, and is placed from the window's corner.
    const host = a.closest("dialog[open]");
    (host || document.body).append(toast);
    const box = host ? host.getBoundingClientRect() : { left: -scrollX, top: -scrollY, width: document.documentElement.clientWidth };
    const r = a.getBoundingClientRect();
    const half = Math.min(170, box.width / 2 - 16);
    const x = Math.min(Math.max(r.left - box.left + r.width / 2, half + 16), box.width - half - 16);
    toast.style.left = `${x}px`;
    toast.style.top = `${r.bottom - box.top + 8}px`;
    toast.textContent = "Preview: this page isn't built yet. Only the homepage, the Turkey Hunt and the terms are.";
    toast.classList.add("show");
    clearTimeout(hide);
    hide = setTimeout(() => toast.classList.remove("show"), 2600);
  });
})();
