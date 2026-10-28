import PromoBanner from "./PromoBanner";
import { CaseArt } from "./PromoArt";
import styles from "./EventsRow.module.css";

// Today's free case, ready to open.
export default function RewardsCard() {
  return (
    <PromoBanner href="/rewards" title="Daily case" line="Free case every 24 hours" cta="Claim" panel="#1d3d4c" art={<CaseArt />}>
      <span className={styles.ready}>Ready</span>
    </PromoBanner>
  );
}
