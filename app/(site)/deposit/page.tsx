import type { Metadata } from "next";
import Deposit from "@/components/deposit/Deposit";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Deposit — CsgoNeo",
  description: "Add Robux to your balance: 500 Robux to the dollar, with 5% extra on every deposit.",
};

// data-deposit-root marks where the preview mounts its copy.
export default function DepositPage() {
  return (
    <PageContent>
      <div data-deposit-root>
        <Deposit />
      </div>
    </PageContent>
  );
}
