import Link from "next/link";
import { CaseSticker } from "@/components/event/Stickers";
import styles from "./Profile.module.css";

/** The player's skins. None yet, so it says where they come from. */
export default function Inventory() {
  return (
    <>
      <h2 className={styles.title}>Inventory</h2>
      <div className={styles.empty}>
        <CaseSticker className={styles.emptyArt} />
        <p className={styles.emptyTitle}>No skins yet</p>
        <p className={styles.emptyText}>Skins you unbox in cases or win in battles land here, ready to withdraw to Steam or sell for coins.</p>
        <Link href="/cases" className={styles.primary}>
          Open a case
        </Link>
      </div>
    </>
  );
}
