import { count } from "@/lib/home";
import { HUNTERS, MY_HUNT, PRIZES } from "@/lib/event";
import { CoinIcon, TrophyIcon } from "@/components/home/icons";
import Hunters from "./Hunters";
import PanelIntro from "./PanelIntro";
import styles from "./Board.module.css";

const money = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * The hunters' board: how it's ranked and what it pays, where the player
 * stands, then the top ten.
 */
export default function Board() {
  const tenth = HUNTERS[HUNTERS.length - 1].turkeys;
  return (
    <>
      <PanelIntro
        info={[
          {
            icon: <TrophyIcon className={styles.trophy} />,
            title: "How it's ranked",
            text: (
              <>
                By <b>turkeys caught</b> since the hunt began. When two hunters tie, whoever got there first stays ahead.
              </>
            ),
          },
          {
            icon: <CoinIcon />,
            title: "What the top ten win",
            text: (
              <>
                The top ten share <b>{money.format(PRIZES.reduce((a, b) => a + b, 0))} coins</b>, paid within a day of the hunt ending.
              </>
            ),
          },
        ]}
        stats={[
          { label: "Your place", value: `#${MY_HUNT.rank}`, note: `of ${count.format(MY_HUNT.hunters)} hunters` },
          { label: "Turkeys caught", value: count.format(MY_HUNT.turkeys), note: `${count.format(tenth - MY_HUNT.turkeys)} behind 10th place` },
        ]}
      />
      <div className={styles.board}>
        <Hunters />
      </div>
    </>
  );
}
