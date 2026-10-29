import type { Metadata } from "next";
import CaseBattles from "@/components/battles/CaseBattles";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Case Battles — CsgoNeo",
  description: "Open the same cases head to head, round by round. The best drops take the lot. 1v1, 1v1v1 and 2v2, provably fair.",
};

// Case Battles: the game fills the page. data-battles-root marks where the
// preview mounts its copy of it.
export default function CaseBattlesPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Case Battles</h1>
      <div data-battles-root>
        <CaseBattles />
      </div>
    </PageContent>
  );
}
