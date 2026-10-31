import type { Metadata } from "next";
import CaseOpening from "@/components/cases/CaseOpening";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Cases — CsgoNeo",
  description: "Open a case and watch the reel stop on your drop. Every case lists what's inside and the odds. Provably fair.",
};

// Cases: every case to pick from, or with ?case=<slug> that case's own
// page, so a link to a case opens on it. data-cases-root marks where the
// preview mounts its copy.
export default async function CasesPage({ searchParams }: { searchParams: Promise<{ case?: string | string[] }> }) {
  const { case: picked } = await searchParams;
  return (
    <PageContent>
      <h1 className="sr-only">Cases</h1>
      <div data-cases-root>
        <CaseOpening initial={typeof picked === "string" ? picked : null} />
      </div>
    </PageContent>
  );
}
