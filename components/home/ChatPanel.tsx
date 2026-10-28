"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CHAT_SAMPLE, PLAYER, RAIN_POT, type ChatMessage } from "@/lib/home";
import { avatarOf } from "./avatar";
import { CheckIcon, ClockIcon, CloseIcon, CoinIcon, HandCoinIcon, LeafIcon, RainIcon, SendIcon } from "./icons";
import { RainWord } from "./PromoArt";
import { useOnlineCount } from "./useOnlineCount";
import styles from "./ChatPanel.module.css";

// The rain falls every quarter hour.
function nextRain() {
  const d = new Date();
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15 + 15, 0, 0);
  return d;
}

// Time to the next rain as "4:07", ticking every second. Blank until
// mounted so the server and the first client render agree.
function RainClock() {
  const [left, setLeft] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const s = Math.max(0, Math.round((nextRain().getTime() - Date.now()) / 1000));
      setLeft(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left ?? "\u00a0";
}

const coins = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Level chips get a colour as players climb.
const tierOf = (level: number) => (level >= 80 ? styles.gold : level >= 50 ? styles.purple : level >= 20 ? styles.blue : "");

/**
 * Chat down the right, with the rain on top: a pot shared between the
 * players who join before it falls, on a slim card. The messages run from
 * the top, newest at the bottom. Messages you send show up straight away;
 * they stay on this device until chat is wired to the server.
 */
export default function ChatPanel() {
  const online = useOnlineCount();
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_SAMPLE);
  const [draft, setDraft] = useState("");
  const [joined, setJoined] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { name: PLAYER.name, level: PLAYER.level, text, mine: true }]);
    setDraft("");
  };

  return (
    <aside className={styles.chat} aria-label="Chat">
      <div className={styles.head}>
        <h2 className={styles.title}>Chat</h2>
        <span className={styles.online}>
          <span className={styles.dot} aria-hidden />
          <span className="tabular" data-online>
            {online}
          </span>{" "}
          online
        </span>
        <button type="button" className={styles.close} data-shell-toggle="chat" aria-label="Close chat">
          <CloseIcon />
        </button>
      </div>

      <div className={styles.rain}>
        <h3 className={styles.rainName}>
          <span className={styles.rainKicker}>
            Coin
            <CoinIcon />
          </span>
          <RainWord className={styles.rainWord} />
          <span className="sr-only"> rain</span>
        </h3>
        <div className={styles.potBox}>
          <CoinIcon className={styles.potCoin} />
          <span className={styles.potText}>
            <span className={`${styles.pot} tabular`}>{coins.format(RAIN_POT)}</span>
            <span className={`${styles.rainTime} tabular`} data-rain-clock>
              <ClockIcon />
              <span className="sr-only">Falls in </span>
              <RainClock />
            </span>
          </span>
          <button
            type="button"
            className={styles.join}
            disabled={joined}
            onClick={() => setJoined(true)}
            aria-label={joined ? "Joined the rain" : "Join the rain"}
            data-rain-join
          >
            <HandCoinIcon className={styles.joinIcon} />
            <CheckIcon className={styles.joinedIcon} />
          </button>
        </div>
      </div>

      <div ref={logRef} className={styles.log} role="log" aria-label="Messages">
        <ol className={styles.messages}>
          {messages.map((m, i) =>
            "system" in m ? (
              <li key={i} className={styles.system}>
                {m.system === "rain" ? <RainIcon /> : <LeafIcon />}
                {m.text}
              </li>
            ) : (
              <li key={i} className={`${styles.message} ${m.mine ? styles.mine : ""}`}>
                <span className={styles.avatar} style={{ background: avatarOf(m.name) }} aria-hidden>
                  {m.name[0].toUpperCase()}
                </span>
                <div className={styles.body}>
                  <p className={styles.meta}>
                    <span className={`${styles.level} ${tierOf(m.level)}`}>
                      <span className="sr-only">Level </span>
                      {m.level}
                    </span>
                    <span className={styles.name}>{m.name}</span>
                  </p>
                  <p className={styles.text}>{m.text}</p>
                </div>
              </li>
            ),
          )}
        </ol>
      </div>

      <form className={styles.compose} onSubmit={send}>
        <label className="sr-only" htmlFor="chat-input">
          Message
        </label>
        <input
          id="chat-input"
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Say something…"
          maxLength={200}
          autoComplete="off"
        />
        <button type="submit" className={styles.send} aria-label="Send" disabled={!draft.trim()}>
          <SendIcon />
        </button>
      </form>
    </aside>
  );
}
