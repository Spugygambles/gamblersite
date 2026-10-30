import type { Metadata } from "next";
import Account from "@/components/account/Account";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Account — CsgoNeo",
  description: "Your profile, stats, game history, transactions and affiliates.",
};

// The account pages, one page with a side menu. data-account-root marks
// where the preview mounts its copy.
export default function AccountPage() {
  return (
    <PageContent>
      <div data-account-root>
        <Account />
      </div>
    </PageContent>
  );
}
