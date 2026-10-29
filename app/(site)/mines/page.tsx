import type { Metadata } from "next";
import MinesGame from "@/components/mines/MinesGame";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Mines — CsgoNeo",
  description: "Turn over tiles for gems and cash out before you hit a mine. Boards from 25 to 64 tiles, 1 to 63 mines, provably fair.",
};

// Mines: the game fills the page. data-mines-root marks where the preview
// mounts its copy of it.
export default function Mines() {
  return (
    <PageContent>
      <h1 className="sr-only">Mines</h1>
      <div data-mines-root>
        <MinesGame />
      </div>
    </PageContent>
  );
}
