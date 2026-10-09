import type { Metadata } from "next";
import StreamBanner from "@/components/StreamBanner";

export const metadata: Metadata = {
  title: "Rustwild stream banner",
};

// The stream banner on its own, edge to edge: open this page as a browser
// source in OBS (1920 wide by 360 tall) to show it live on stream.
export default function StreamBannerPage() {
  return (
    <main style={{ margin: 0 }}>
      <StreamBanner />
    </main>
  );
}
