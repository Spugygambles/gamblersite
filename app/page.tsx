import BlackjackArt from "@/components/BlackjackArt";
import CoinflipArt from "@/components/CoinflipArt";
import GameBanner from "@/components/GameBanner";
import KenoArt from "@/components/KenoArt";
import LimboArt from "@/components/LimboArt";
import CrashArt from "@/components/CrashArt";
import MinesArt from "@/components/MinesArt";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f121a] px-4 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="mb-5 text-lg font-bold uppercase tracking-wide text-white">
          Games
        </h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          <GameBanner title="Coinflip" art={<CoinflipArt />} />
          <GameBanner title="Blackjack" art={<BlackjackArt />} />
          <GameBanner title="Mines" art={<MinesArt />} />
          <GameBanner title="Keno" art={<KenoArt />} />
          <GameBanner title="Crash" art={<CrashArt />} />
          <GameBanner title="Limbo" art={<LimboArt />} />
        </div>
      </div>
    </main>
  );
}
