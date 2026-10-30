import type { Metadata } from "next";
import Deposit from "@/components/deposit/Deposit";
import { PageContent } from "@/components/home/Section";

export const metadata: Metadata = {
  title: "Wallet — CsgoNeo",
  description: "Your wallet: deposit, withdraw and promo codes. 500 Robux to the dollar.",
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
