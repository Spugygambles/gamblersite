import type { Metadata } from "next";
import GemVault from "@/components/gems/GemVault";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Gem Vault — CsgoNeo",
  description: "Every 5,000 Robux you wager earns a gem. Spend gems on cases in the vault.",
};

// The Gem Vault. data-gems-root marks where the preview mounts its copy.
export default function GemsPage() {
  return (
    <PageContent>
      <div data-gems-root>
        <GemVault />
      </div>
    </PageContent>
  );
}
