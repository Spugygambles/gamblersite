import { CaseIcon, CoinIcon, MapleIcon, TrophyIcon } from "@/components/home/icons";
import { TurkeyArt } from "@/components/home/PromoArt";
import type { RewardKind } from "@/lib/event";
import styles from "./RewardIcon.module.css";

// A small picture of a reward, by its kind.
export default function RewardIcon({ kind }: { kind: RewardKind }) {
  return (
    <span className={`${styles.icon} ${styles[kind]}`} aria-hidden>
      {kind === "leaves" && <MapleIcon />}
      {kind === "case" && <CaseIcon />}
      {kind === "coins" && <CoinIcon />}
      {kind === "badge" && <TurkeyArt />}
      {kind === "cup" && <TrophyIcon />}
    </span>
  );
}
