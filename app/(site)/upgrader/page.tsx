import type { Metadata } from "next";
import Upgrader from "@/components/upgrader/Upgrader";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Upgrader — CsgoNeo",
  description: "Put coins on the line for a skin worth more. The wheel decides: land in the zone and the skin is yours. Provably fair.",
};

// Upgrader: the game fills the page. data-upgrader-root marks where the
// preview mounts its copy of it.
export default function UpgraderPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Upgrader</h1>
      <div data-upgrader-root>
        <Upgrader />
      </div>
    </PageContent>
  );
}
