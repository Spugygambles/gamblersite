"use client";

import { useState } from "react";
import { Modal } from "@/components/mines/Dialogs";
import { seedHash, type Seeds } from "@/lib/seeds";
import { isWin, percent, rollOf } from "@/lib/upgrader";
import { CheckIcon } from "@/components/home/icons";
import styles from "./Upgrader.module.css";

/**
 * Provably fair, for the Upgrader: the shared seeds, and a check that
 * works a spin out again from the retired server seed, the client seed,
 * the nonce, the chance and the zones.
 */
export function FairnessDialog({ onClose, seeds, busy, onRotate }: { onClose: () => void; seeds: Seeds; busy: boolean; onRotate: (clientSeed: string) => void }) {
  const [draft, setDraft] = useState(seeds.clientSeed);
  const [check, setCheck] = useState({
    serverSeed: seeds.previous?.serverSeed ?? "",
    clientSeed: seeds.previous?.clientSeed ?? "",
    nonce: "0",
    chance: "45",
    zones: "1",
  });
  const [found, setFound] = useState<{ roll: number; won: boolean } | null>(null);
  const [problem, setProblem] = useState("");

  const rotate = () => {
    const clientSeed = draft.trim() || seeds.clientSeed;
    onRotate(clientSeed);
    setDraft(clientSeed);
    setCheck((c) => ({ ...c, serverSeed: seeds.serverSeed, clientSeed: seeds.clientSeed, nonce: "0" }));
    setFound(null);
    setProblem("");
  };

  const verify = () => {
    const nonce = Number(check.nonce), chance = Number(check.chance) / 100, zones = Number(check.zones);
    if (!check.serverSeed || !check.clientSeed) {
      setProblem("Fill in both seeds first.");
      setFound(null);
    } else if (!(nonce >= 0) || !(chance > 0 && chance <= 1) || !(zones >= 1 && zones <= 5)) {
      setProblem("The nonce is 0 or more, the chance is between 0 and 100, and the zones 1 to 5.");
      setFound(null);
    } else {
      setProblem("");
      const roll = rollOf(check.serverSeed, check.clientSeed, nonce);
      setFound({ roll, won: isWin(roll, chance, zones) });
    }
  };

  const field = (key: keyof typeof check, digits: RegExp | null) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCheck({ ...check, [key]: digits ? e.target.value.replace(digits, "") : e.target.value.trim() });

  return (
    <Modal title="Provably fair" onClose={onClose} wide>
      <p className={styles.modalText}>
        Every spin is one roll drawn from our server seed, your client seed and a nonce that counts up with each game, across every game
        on the site. You see the server seed&apos;s hash before you play, so it can&apos;t be changed after. Rotate the seeds any time to
        reveal the old server seed and check the spins you played under it.
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

      <h3 className={styles.modalSub}>Check a spin</h3>
      <p className={styles.modalText}>
        {seeds.previous
          ? `Your last server seed was revealed when you rotated. It ran for ${seeds.previous.nonces} game${seeds.previous.nonces === 1 ? "" : "s"}.`
          : "Rotate the seeds after a spin to reveal its server seed, then enter it here with the spin's chance and zones."}
      </p>
      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Server seed</span>
          <input className={`${styles.input} ${styles.mono}`} value={check.serverSeed} onChange={field("serverSeed", null)} data-check-server />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Client seed</span>
          <input className={`${styles.input} ${styles.mono}`} value={check.clientSeed} onChange={field("clientSeed", null)} data-check-client />
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nonce</span>
            <input className={styles.input} inputMode="numeric" value={check.nonce} onChange={field("nonce", /\D/g)} data-check-nonce />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Chance %</span>
            <input className={styles.input} inputMode="decimal" value={check.chance} onChange={field("chance", /[^\d.]/g)} data-check-chance />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Zones</span>
            <input className={styles.input} inputMode="numeric" value={check.zones} onChange={field("zones", /\D/g)} data-check-zones />
          </label>
        </div>
        <div>
          <button type="button" className={styles.secondary} onClick={verify} data-verify>
            Work out the spin
          </button>
        </div>
        {problem && <p className={styles.problem}>{problem}</p>}
        {found && (
          <p className={styles.found} data-found>
            <CheckIcon />
            Rolled {percent(found.roll)} round the wheel: {found.won ? "a win" : "a loss"}
          </p>
        )}
      </div>
    </Modal>
  );
}

export function HowToDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="How the Upgrader works" onClose={onClose}>
      <ol className={styles.steps}>
        <li>Type a bet, then pick up to four skins from the list. Their value together is what you&apos;re playing for.</li>
        <li>The wheel shows your chance: the orange stretch of the ring. The bigger the upgrade, the smaller it gets.</li>
        <li>Press Upgrade. The ring spins and stops under the pointer. Orange under the pointer and the skins are yours.</li>
        <li>Zones split the same chance into equal stretches round the ring. The quick multipliers set your bet from the skins you picked.</li>
      </ol>
      <p className={styles.modalText}>The house keeps 10%: your chance is the fair odds of the upgrade, less that.</p>
    </Modal>
  );
}
