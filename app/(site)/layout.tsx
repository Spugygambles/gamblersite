import type { ReactNode } from "react";
import AppShell from "@/components/home/AppShell";
import ChatPanel from "@/components/home/ChatPanel";
import MobileBar from "@/components/home/MobileBar";
import SiteFooter from "@/components/home/SiteFooter";
import SiteHeader from "@/components/home/SiteHeader";
import ProfileModal from "@/components/profile/ProfileModal";

// The frame every page of the site sits in: the header, chat, the bar
// along the bottom on phones, and the footer, with the player's account
// window ready to open over any of it. It stays put, chat and all, as you
// move between pages.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppShell header={<SiteHeader />} chat={<ChatPanel />} tabBar={<MobileBar />}>
        {children}
        <SiteFooter />
      </AppShell>
      <ProfileModal />
    </>
  );
}
