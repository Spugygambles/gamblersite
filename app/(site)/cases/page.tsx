import type { Metadata } from "next";
import CaseOpening from "@/components/cases/CaseOpening";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Cases — CsgoNeo",
  description: "Open a case and watch the reel stop on your skin. Every case lists what's inside and the odds. Provably fair.",
};

// Case opening: the opener at the top with the case picked, every case to
// pick from under it. data-cases-root marks where the preview mounts its
// copy of it.
export default function CasesPage() {
  return (
    <PageContent>
      <h1 className="sr-only">Cases</h1>
      <div data-cases-root>
        <CaseOpening />
      </div>
    </PageContent>
  );
}
