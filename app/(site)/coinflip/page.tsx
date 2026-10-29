import type { Metadata } from "next";
import Coinflip from "@/components/coinflip/Coinflip";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Coinflip — CsgoNeo",
  description: "Call gold or silver, create a flip or join one, and let the coin decide. Provably fair.",
};

// Coinflip: the game fills the page. data-coinflip-root marks where the
// preview mounts its copy of it.
export default function CoinflipPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Coinflip</h1>
      <div data-coinflip-root>
        <Coinflip />
      </div>
    </PageContent>
  );
}
