import GameModes from "@/components/home/GameModes";
import LiveBets from "@/components/home/LiveBets";
import Section, { Live, PageContent } from "@/components/home/Section";

export default function Home() {
  return (
    <PageContent>
      <h1 className="sr-only">CsgoNeo: CS2 case opening, battles and games</h1>

      {/* The games first, all of them on screen without scrolling. */}
      <Section id="games" title="Games">
        <GameModes />
      </Section>

      <Section id="bets" title="Latest bets" extra={<Live />}>
        <LiveBets />
      </Section>
    </PageContent>
  );
}
