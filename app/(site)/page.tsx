import { GAMES } from "@/lib/home";
import GameModes from "@/components/home/GameModes";
import LiveBets from "@/components/home/LiveBets";
import Section, { Count, PageContent } from "@/components/home/Section";
import { GamepadIcon, SlipIcon } from "@/components/home/icons";

export default function Home() {
  return (
    <PageContent>
      <h1 className="sr-only">CsgoNeo: CS2 case opening, battles and games</h1>

      {/* The games first, all of them on screen without scrolling. */}
      <Section id="games" title="Games" icon={<GamepadIcon />} extra={<Count>{GAMES.length}</Count>}>
        <GameModes />
      </Section>

      <Section id="bets" title="Recent bets" icon={<SlipIcon />}>
        <LiveBets />
      </Section>
    </PageContent>
  );
}
