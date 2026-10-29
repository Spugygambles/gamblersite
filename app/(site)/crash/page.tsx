import type { Metadata } from "next";
import Crash from "@/components/crash/Crash";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Crash — CsgoNeo",
  description: "The multiplier climbs until it crashes. Bet before the round, cash out before the crash. Provably fair.",
};

// Crash: the game fills the page. data-crash-root marks where the preview
// mounts its copy of it.
export default function CrashPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Crash</h1>
      <div data-crash-root>
        <Crash />
      </div>
    </PageContent>
  );
}
