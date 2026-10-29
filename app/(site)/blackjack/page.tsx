import type { Metadata } from "next";
import Blackjack from "@/components/blackjack/Blackjack";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Blackjack — CsgoNeo",
  description: "Beat the dealer to 21. Six decks shuffled from the seeds every hand, dealer stands on 17, blackjack pays 3 to 2. Provably fair.",
};

// Blackjack: the game fills the page. data-blackjack-root marks where the
// preview mounts its copy of it.
export default function BlackjackPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Blackjack</h1>
      <div data-blackjack-root>
        <Blackjack />
      </div>
    </PageContent>
  );
}
