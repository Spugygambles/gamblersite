"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GRIDS, maxMines, minePositions, seedHash } from "@/lib/mines";
import { CheckIcon, CloseIcon } from "@/components/home/icons";
import type { Seeds } from "./stores";
import styles from "./Mines.module.css";

/** A window over the page, open from the moment it mounts; its X, Escape or a click outside close it. */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`${styles.modal} ${wide ? styles.modalWide : ""}`}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className={styles.modalHead}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className={styles.modalBody}>{children}</div>
    </dialog>
  );
}

/**
 * Provably fair: the seeds behind the games. The server seed's hash is
 * shown ahead of play, the client seed is the player's to change, and the
 * nonce counts the games. Rotating the seeds reveals the old server seed,
 * so any game under it can be checked below, where the mines for a given
 * seed pair and nonce are worked out again.
 */
export function FairnessDialog({
  onClose,
  seeds,
  busy,
  onRotate,
}: {
  onClose: () => void;
  seeds: Seeds;
  /** A game's on: the seeds are locked. */
  busy: boolean;
  /** New server seed, this client seed, nonce back to 0. */
  onRotate: (clientSeed: string) => void;
}) {
  const [draft, setDraft] = useState(seeds.clientSeed);
  const [check, setCheck] = useState({
    serverSeed: seeds.previous?.serverSeed ?? "",
    clientSeed: seeds.previous?.clientSeed ?? "",
    nonce: "0",
    tiles: "25",
    mines: "3",
  });
  const [found, setFound] = useState<number[] | null>(null);
  const [problem, setProblem] = useState("");

  const rotate = () => {
    const clientSeed = draft.trim() || seeds.clientSeed;
    onRotate(clientSeed);
    setDraft(clientSeed);
    // the seeds just retired are the ones to check now
    setCheck((c) => ({ ...c, serverSeed: seeds.serverSeed, clientSeed: seeds.clientSeed, nonce: "0" }));
    setFound(null);
    setProblem("");
  };

  const verify = () => {
    const tiles = Number(check.tiles), mines = Number(check.mines), nonce = Number(check.nonce);
    if (!check.serverSeed || !check.clientSeed) {
      setProblem("Fill in both seeds first.");
      setFound(null);
    } else if (!(GRIDS as readonly number[]).includes(tiles) || mines < 1 || mines > maxMines(tiles) || !(nonce >= 0)) {
      setProblem(`Mines must be 1 to ${maxMines(tiles)}, and the nonce 0 or more.`);
      setFound(null);
    } else {
      setProblem("");
      setFound([...minePositions(check.serverSeed, check.clientSeed, nonce, tiles, mines)].sort((a, b) => a - b));
    }
  };

  const field = (key: "serverSeed" | "clientSeed" | "nonce" | "mines") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCheck({ ...check, [key]: key === "nonce" || key === "mines" ? e.target.value.replace(/\D/g, "") : e.target.value.trim() });

  return (
    <Modal title="Provably fair" onClose={onClose} wide>
      <p className={styles.modalText}>
        Every board is drawn from three things: our server seed, your client seed, and a nonce that counts up with each game. You see
        the server seed&apos;s hash before you play, so it can&apos;t be changed after. Rotate the seeds any time to reveal the old server
        seed and check the games you played under it.
      </p>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Server seed (hashed)</span>
          <input className={`${styles.input} ${styles.mono}`} value={seeds.serverSeed ? seedHash(seeds.serverSeed) : ""} readOnly data-seed-hash />
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Client seed</span>
            <input
              className={`${styles.input} ${styles.mono}`}
              value={draft}
              maxLength={64}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              data-client-seed
            />
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
      {seeds.previous ? (
        <p className={styles.modalText}>
          Your last server seed was revealed when you rotated. It ran for {seeds.previous.nonces} game{seeds.previous.nonces === 1 ? "" : "s"}
          {seeds.previous.nonces > 0 ? `, nonces 0 to ${seeds.previous.nonces - 1}` : ""}.
        </p>
      ) : (
        <p className={styles.modalText}>Rotate the seeds after a game to reveal its server seed, then enter it here to see where the mines were.</p>
      )}
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Server seed</span>
          <input className={`${styles.input} ${styles.mono}`} value={check.serverSeed} onChange={field("serverSeed")} data-check-server />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Client seed</span>
          <input className={`${styles.input} ${styles.mono}`} value={check.clientSeed} onChange={field("clientSeed")} data-check-client />
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nonce</span>
            <input className={styles.input} inputMode="numeric" value={check.nonce} onChange={field("nonce")} data-check-nonce />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Tiles</span>
            <select className={styles.select} value={check.tiles} onChange={(e) => setCheck({ ...check, tiles: e.target.value })}>
              {GRIDS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Mines</span>
            <input className={styles.input} inputMode="numeric" value={check.mines} onChange={field("mines")} data-check-mines />
          </label>
        </div>
        <div>
          <button type="button" className={styles.secondary} onClick={verify} data-verify>
            Work out the mines
          </button>
        </div>
        {problem && <p className={styles.problem}>{problem}</p>}
        {found && (
          <p className={styles.found} data-found>
            <CheckIcon />
            Mines on tiles {found.map((p) => p + 1).join(", ")}
          </p>
        )}
      </div>
    </Modal>
  );
}

export function HowToDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How to play Mines" onClose={onClose}>
      <ol className={styles.steps}>
        <li>Choose your bet, a board size and how many mines are hidden in it. More mines, bigger multipliers.</li>
        <li>
          Place your bet, then turn over tiles. Every gem you find raises the multiplier on your bet. Or press and sweep across the board to
          turn tiles over as you go.
        </li>
        <li>Cash out whenever you like and take the multiplier. Turn over a mine and the bet&apos;s gone.</li>
        <li>Auto lets you mark tiles once and play them round after round, raising or resetting the bet as you win or lose.</li>
      </ol>
      <p className={styles.modalText}>The house keeps 10%: a board&apos;s multipliers are the fair odds of surviving your picks, less that.</p>
    </Modal>
  );
}
