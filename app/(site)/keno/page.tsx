import type { Metadata } from "next";
import Keno from "@/components/keno/Keno";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Keno — CsgoNeo",
  description: "Pick up to ten of forty numbers, choose your risk, and see how many of the ten drawn are yours. Provably fair.",
};

// Keno: the game fills the page. data-keno-root marks where the preview
// mounts its copy of it.
export default function KenoPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Keno</h1>
      <div data-keno-root>
        <Keno />
      </div>
    </PageContent>
  );
}
