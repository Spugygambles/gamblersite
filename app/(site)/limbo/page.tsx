import type { Metadata } from "next";
import Limbo from "@/components/limbo/Limbo";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Limbo — CsgoNeo",
  description: "Name a target multiplier and bet. The roll climbs from 1.00×; reach your target and the bet pays it. Provably fair.",
};

// Limbo: the game fills the page. data-limbo-root marks where the preview
// mounts its copy of it.
export default function LimboPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Limbo</h1>
      <div data-limbo-root>
        <Limbo />
      </div>
    </PageContent>
  );
}
