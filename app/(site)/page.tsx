import { count, GAMES } from "@/lib/home";
import GameModes from "@/components/home/GameModes";
import LiveBets from "@/components/home/LiveBets";
import Section, { Live, Note, PageContent } from "@/components/home/Section";

export default function Home() {
  const playing = GAMES.reduce((sum, g) => sum + g.playing, 0);

  return (
    <PageContent>
      <h1 className="sr-only">CsgoNeo: CS2 case opening, battles and games</h1>

      {/* The games first, all of them on screen without scrolling. */}
      <Section id="games" title="Games" aside={<Note>{count.format(playing)} playing now</Note>}>
        <GameModes />
      </Section>

      <Section id="bets" title="Latest bets" extra={<Live />}>
        <LiveBets />
      </Section>
    </PageContent>
  );
}
