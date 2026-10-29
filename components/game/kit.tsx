"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/mines/Dialogs";
import { CheckIcon, CoinIcon, GearIcon, InfoIcon, ShieldIcon } from "@/components/home/icons";
import { rotateSeeds, seedHash, useSeeds } from "@/lib/seeds";
import styles from "./game.module.css";

/*
 * The pieces every game is built from, so they all look and work the
 * same: the frame (controls down the left, the stage beside them), the
 * Manual/Auto tabs, the bet field, segmented choices, readouts, the tools
 * row, the history chips, and the provably-fair and how-to windows. Each
 * game's own stylesheet does only what's its own.
 */

export { styles as kit };

/** Controls on the left, the stage on the right; stacked when narrow. */
export function GameFrame({ controls, stage, attrs }: { controls: ReactNode; stage: ReactNode; attrs?: Record<string, string | number | boolean | undefined> }) {
  return (
    <div className={styles.wrap} {...attrs}>
      <div className={styles.game}>
        <aside className={styles.controls} aria-label="Bet" data-controls>
          {controls}
        </aside>
        <div className={styles.stage} data-stage>
          {stage}
        </div>
      </div>
    </div>
  );
}

export function ModeTabs<T extends string>({ modes, mode, onChange, disabled }: { modes: readonly [T, string][]; mode: T; onChange: (m: T) => void; disabled?: boolean }) {
  return (
    <div className={styles.modes} role="tablist" aria-label="Mode">
      {modes.map(([m, label]) => (
        <button key={m} type="button" role="tab" aria-selected={mode === m} className={styles.modeTab} disabled={disabled} onClick={() => onChange(m)} data-mode-tab={m}>
          {label}
        </button>
      ))}
    </div>
  );
}

/** The bet amount with ½, 2× and Max; `bet` is what useBet gives. */
export function BetField({ bet, disabled, max = true, label = "Bet amount" }: { bet: ReturnType<typeof import("./useBet").useBet>; disabled?: boolean; max?: boolean; label?: string }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.betRow}>
        <CoinIcon className={styles.betCoin} />
        <input
          className={styles.betInput}
          inputMode="decimal"
          value={bet.betText}
          disabled={disabled}
          aria-invalid={bet.short && !disabled ? true : undefined}
          onChange={(e) => bet.type(e.target.value)}
          onBlur={bet.blur}
          data-bet
        />
        <button type="button" className={styles.betStep} disabled={disabled} onClick={bet.half} data-bet-half>
          ½
        </button>
        <button type="button" className={styles.betStep} disabled={disabled} onClick={bet.double} data-bet-double>
          2×
        </button>
        {max && (
          <button type="button" className={styles.betStep} disabled={disabled} onClick={bet.max} data-bet-max>
            Max
          </button>
        )}
      </span>
      {bet.short && !disabled && (
        <span className={styles.fieldHint} data-short>
          Not enough balance
        </span>
      )}
    </label>
  );
}

/** A row of choices, one of them on (a radio group) or any of them (plain buttons). */
export function Choices<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
  attr,
}: {
  label: string;
  options: readonly { value: T; label: ReactNode }[];
  value?: T;
  onChange: (v: T) => void;
  disabled?: boolean;
  /** The data attribute each button gets, with its value. */
  attr?: string;
}) {
  const radio = value !== undefined;
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.choices} role={radio ? "radiogroup" : "group"} aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role={radio ? "radio" : undefined}
            aria-checked={radio ? value === o.value : undefined}
            className={styles.choice}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            {...(attr ? { [attr]: o.value } : {})}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Readout({ label, value, up, attr }: { label: ReactNode; value: ReactNode; up?: boolean; attr?: string }) {
  return (
    <p className={styles.readout}>
      <span className={styles.readoutLabel}>{label}</span>
      <span className={`${styles.readoutValue} ${up ? styles.up : ""} tabular`} {...(attr ? { [attr]: "" } : {})}>
        {value}
      </span>
    </p>
  );
}

/** The row along the bottom of the controls: provably fair, how to play, and anything else. */
export function Tools({ onFair, onHow, children }: { onFair: () => void; onHow: () => void; children?: ReactNode }) {
  return (
    <div className={styles.tools}>
      {children}
      <button type="button" className={styles.tool} aria-label="Provably fair" onClick={onFair} data-fairness>
        <ShieldIcon />
      </button>
      <button type="button" className={styles.tool} aria-label="How to play" onClick={onHow} data-how-to>
        <InfoIcon />
      </button>
    </div>
  );
}

export const ToolIcons = { Gear: GearIcon };

/** The last results, newest first: text in green for a win, red for a loss, plain otherwise. */
export function History({ items, label = "Last games" }: { items: { id: number; text: string; won?: boolean | null }[]; label?: string }) {
  return (
    <ol className={styles.history} aria-label={label} data-history>
      {items.map((h) => (
        <li key={h.id} className={`${styles.past} ${h.won === true ? styles.pastWon : h.won === false ? styles.pastLost : ""} tabular`} data-won={h.won === true ? "true" : h.won === false ? "false" : undefined}>
          {h.text}
        </li>
      ))}
    </ol>
  );
}

export function HowTo({ title, steps, note, onClose }: { title: string; steps: ReactNode[]; note?: ReactNode; onClose: () => void }) {
  return (
    <Modal title={title} onClose={onClose}>
      <ol className={styles.steps}>
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {note && <p className={styles.modalText}>{note}</p>}
    </Modal>
  );
}

/**
 * Provably fair, for any game: the shared seeds (hash shown, client seed
 * yours to change, nonce counting up), rotation revealing the old server
 * seed, and a check that works a game out again from a seed pair and a
 * nonce. `verify` says what that game was, in words.
 */
export function FairDialog({
  onClose,
  busy,
  intro,
  verify,
}: {
  onClose: () => void;
  busy: boolean;
  /** One sentence on what the draws decide in this game. */
  intro: ReactNode;
  verify: (serverSeed: string, clientSeed: string, nonce: number) => string;
}) {
  const seeds = useSeeds();
  const [draft, setDraft] = useState(seeds.clientSeed);
  const [check, setCheck] = useState({ serverSeed: seeds.previous?.serverSeed ?? "", clientSeed: seeds.previous?.clientSeed ?? "", nonce: "0" });
  const [found, setFound] = useState("");
  const [problem, setProblem] = useState("");

  const rotate = () => {
    if (busy) return;
    const clientSeed = draft.trim() || seeds.clientSeed;
    const retired = { serverSeed: seeds.serverSeed, clientSeed: seeds.clientSeed };
    rotateSeeds(clientSeed);
    setDraft(clientSeed);
    setCheck({ ...retired, nonce: "0" });
    setFound("");
    setProblem("");
  };

  const run = () => {
    const nonce = Number(check.nonce);
    if (!check.serverSeed || !check.clientSeed) {
      setProblem("Fill in both seeds first.");
      setFound("");
    } else if (!(nonce >= 0)) {
      setProblem("The nonce is 0 or more.");
      setFound("");
    } else {
      setProblem("");
      setFound(verify(check.serverSeed, check.clientSeed, nonce));
    }
  };

  return (
    <Modal title="Provably fair" onClose={onClose} wide>
      <p className={styles.modalText}>
        {intro} The draws come from our server seed, your client seed and a nonce that counts up with each game, shared across every game on
        the site. You see the server seed&apos;s hash before you play, so it can&apos;t be changed after. Rotate the seeds any time to reveal the
        old server seed and check the games you played under it.
      </p>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Server seed (hashed)</span>
          <input className={`${styles.input} ${styles.mono}`} value={seeds.serverSeed ? seedHash(seeds.serverSeed) : ""} readOnly data-seed-hash />
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Client seed</span>
            <input className={`${styles.input} ${styles.mono}`} value={draft} maxLength={64} disabled={busy} onChange={(e) => setDraft(e.target.value)} data-client-seed />
          </label>
          <label className={styles.field} style={{ maxWidth: 110 }}>
            <span className={styles.fieldLabel}>Nonce</span>
            <input className={`${styles.input} ${styles.mono}`} value={seeds.nonce} readOnly data-nonce />
          </label>
        </div>
        <div>
          <button type="button" className={styles.secondary} disabled={busy} onClick={rotate} data-rotate>
            Rotate seeds
          </button>
        </div>
      </div>
      <h3 className={styles.modalSub}>Check a game</h3>
      <p className={styles.modalText}>
        {seeds.previous
          ? `Your last server seed was revealed when you rotated. It ran for ${seeds.previous.nonces} game${seeds.previous.nonces === 1 ? "" : "s"}.`
          : "Rotate the seeds after a game to reveal its server seed, then enter it here with the game's nonce."}
      </p>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Server seed</span>
          <input className={`${styles.input} ${styles.mono}`} value={check.serverSeed} onChange={(e) => setCheck({ ...check, serverSeed: e.target.value.trim() })} data-check-server />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Client seed</span>
          <input className={`${styles.input} ${styles.mono}`} value={check.clientSeed} onChange={(e) => setCheck({ ...check, clientSeed: e.target.value.trim() })} data-check-client />
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.field} style={{ maxWidth: 140 }}>
            <span className={styles.fieldLabel}>Nonce</span>
            <input className={styles.input} inputMode="numeric" value={check.nonce} onChange={(e) => setCheck({ ...check, nonce: e.target.value.replace(/\D/g, "") })} data-check-nonce />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>&nbsp;</span>
            <button type="button" className={styles.secondary} onClick={run} data-verify>
              Work it out
            </button>
          </div>
        </div>
        {problem && <p className={styles.problem}>{problem}</p>}
        {found && (
          <p className={styles.found} data-found>
            <CheckIcon />
            {found}
          </p>
        )}
      </div>
    </Modal>
  );
}
