import type { ComponentType, SVGProps } from "react";
import { CLAW_MARKS } from "@/lib/claw";

type IconProps = SVGProps<SVGSVGElement>;

export function GamepadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M7.2 6.5h9.6c2.4 0 4.2 1.7 4.6 4.1l.8 4.7c.3 1.9-1.1 3.6-3 3.6-1 0-1.9-.5-2.5-1.3l-1.3-1.8H8.6l-1.3 1.8c-.6.8-1.5 1.3-2.5 1.3-1.9 0-3.3-1.7-3-3.6l.8-4.7c.4-2.4 2.2-4.1 4.6-4.1Zm.3 3.2a.8.8 0 0 0-.8.8v1H5.7a.8.8 0 0 0 0 1.6h1v1a.8.8 0 0 0 1.6 0v-1h1a.8.8 0 0 0 0-1.6h-1v-1a.8.8 0 0 0-.8-.8Zm8.4.4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-1.9 2.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M8.6 2.6c1.2 0 2.4.8 3.4 2.3 1-1.5 2.2-2.3 3.4-2.3 1.6 0 2.7 1.1 2.7 2.5 0 .6-.2 1.2-.6 1.7h2.3c.7 0 1.2.5 1.2 1.2v2.2c0 .6-.4 1-1 1.1h-7.2V6.8h-1.6v4.5H4c-.6-.1-1-.5-1-1.1V8c0-.7.5-1.2 1.2-1.2h2.3a2.7 2.7 0 0 1-.6-1.7c0-1.4 1.1-2.5 2.7-2.5Zm0 1.8c-.5 0-.9.3-.9.8 0 .9 1.2 1.5 3 1.6-.6-1.4-1.3-2.4-2.1-2.4Zm6.8 0c-.8 0-1.5 1-2.1 2.4 1.8-.1 3-.7 3-1.6 0-.5-.4-.8-.9-.8ZM4.4 12.8h6.8v8.6H6c-.9 0-1.6-.7-1.6-1.6v-7Zm8.4 0h6.8v7c0 .9-.7 1.6-1.6 1.6h-5.2v-8.6Z" />
    </svg>
  );
}

export function ChevronIcon({ direction = "down", ...props }: IconProps & { direction?: "down" | "left" | "right" }) {
  const d = { down: "M6 9.5l6 6 6-6", left: "M14.5 6l-6 6 6 6", right: "M9.5 6l6 6-6 6" }[direction];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d={d} />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

// The site currency: a flat gold coin with the claw stamped in it.
export function CoinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <circle cx="12" cy="12" r="10.5" fill="#a9712c" />
      <circle cx="12" cy="11.4" r="10" fill="#dba64a" />
      <circle cx="12" cy="11.4" r="7.1" fill="none" stroke="#b9853a" strokeWidth="1.1" />
      <g fill="#a9712c" transform="translate(7.4 6.8) scale(0.092)">
        {CLAW_MARKS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

// Chat's rain button: a coin dropping into an open hand.
export function HandCoinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path fillRule="evenodd" d="M15.5 2.8a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Zm0 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" />
      <rect x="2" y="12.6" width="3.2" height="8.6" rx="0.8" />
      <path d="M6.2 13.4h3.1c.9 0 1.8.3 2.5.8l1.3.9h3.1c1 0 1.8.8 1.8 1.8v.1l2.9-1.5c.9-.5 2-.1 2.4.8.4.8.1 1.7-.6 2.2l-5.4 3.3c-.9.5-1.9.8-2.9.8H6.2Z" />
    </svg>
  );
}

// The event's currency: a maple leaf in autumn orange, its veins picked
// out in a deeper shade.
export function MapleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden {...props}>
      <path d={MAPLE_LEAF} fill="#e37633" stroke="#e37633" strokeWidth="4" strokeLinejoin="round" />
      <path d="M50 90V22M50 63 16 43.5M50 63l34-19.5M50 75.5 26 68M50 75.5 74 68" fill="none" stroke="#a6461b" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// A maple leaf, flat, in the current colour: the Thanksgiving event's mark.
export const MAPLE_LEAF =
  "M50 4L58 22 67.5 14.7 64.8 35.1 79.2 31.2 79.2 41 98.3 45.5 80.7 58.3 84.8 66.7 65.8 66.3 65.7 77.2 53.3 65.5 52.2 64 53 92 47 92 47.8 64 46.7 65.5 34.3 77.2 34.2 66.3 15.2 66.7 19.3 58.3 1.7 45.5 20.8 41 20.8 31.2 35.2 35.1 32.5 14.7 42 22Z";

export function LeafIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden {...props}>
      <path d={MAPLE_LEAF} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

// Solid icons for the menu: 24px, filled in the current colour, with the
// details cut out.
export const HomeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M11.2 3.4a1.2 1.2 0 0 1 1.6 0l8 7.2c.7.6.3 1.7-.6 1.7H19v7.2c0 .9-.7 1.5-1.5 1.5H15v-5c0-.7-.5-1.2-1.2-1.2h-3.6c-.7 0-1.2.5-1.2 1.2v5H6.5C5.7 21 5 20.4 5 19.5v-7.2h-.2c-.9 0-1.3-1.1-.6-1.7Z" />
  </svg>
);

// ---- The games: solid, chunky shapes on a 24 grid --------------------------

// Cases: an open box, its back flaps folded up and out.
export const CaseIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M2.6 10.2L11.5 14.56L11.5 21.76L2.6 17.4ZM12.5 14.56L21.4 10.2L21.4 17.4L12.5 21.76ZM2.16 9.34L11.56 4.74L10 1.7L0.6 6.3ZM12.44 4.74L21.84 9.34L23.4 6.3L14 1.7Z" />
  </svg>
);

// Battles: two swords crossed, the one underneath broken where the other
// passes over it.
export const SwordsIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M19.35 4.05L18.79 7.16L9.53 16.42L6.98 13.87L16.24 4.61ZM5.35 12.25L11.15 18.05L10.23 18.97L9.1 18.97L4.43 14.3L4.43 13.17ZM5.92 15.78L7.62 17.48L5.78 19.32L4.08 17.62ZM2.42 19.43a1.55 1.55 0 1 0 3.1 0a1.55 1.55 0 1 0 -3.1 0ZM4.65 4.05L7.76 4.61L11.33 8.18L8.78 10.73L5.21 7.16ZM15.22 12.07L17.02 13.87L14.47 16.42L12.67 14.62ZM12.85 18.05L18.65 12.25L19.57 13.17L19.57 14.3L14.9 18.97L13.77 18.97ZM16.38 17.48L18.08 15.78L19.92 17.62L18.22 19.32ZM18.48 19.43a1.55 1.55 0 1 0 3.1 0a1.55 1.55 0 1 0 -3.1 0Z" />
  </svg>
);

// Upgrader: two chevrons pointing up, the lower one fainter.
export const UpgradeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M5.4 12.2 12 5.6l6.6 6.6" />
    <path d="M5.4 19 12 12.4l6.6 6.6" opacity="0.5" />
  </svg>
);

// Mines: a bomb with a shine on it, its cap, the fuse and a spark.
export const BombIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path fillRule="evenodd" d="M2.7 14.3a7.6 7.6 0 1 0 15.2 0a7.6 7.6 0 1 0 -15.2 0ZM5.65 11.5a1.45 1.45 0 1 0 2.9 0a1.45 1.45 0 1 0 -2.9 0ZM5.2 14.2a0.8 0.8 0 1 0 1.6 0a0.8 0.8 0 1 0 -1.6 0Z" />
    <path d="M12.74 9.49L15.99 6.24L18.26 8.51L15.01 11.76Z" />
    <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M16.6 7.4c.6-1.7 1.6-2.8 3-3.4" />
    <path d="M20.9 .8l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6Z" />
  </svg>
);

// Keno: a board of nine, four of them picked.
const KENO_PICKS = [0, 4, 5, 7];

export const KenoIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    {Array.from({ length: 9 }, (_, i) => {
      const x = 2 + (i % 3) * 7.1;
      const y = 2 + Math.floor(i / 3) * 7.1;
      return KENO_PICKS.includes(i) ? (
        <rect key={i} x={x} y={y} width="5.8" height="5.8" rx="1.5" />
      ) : (
        <rect key={i} x={x + 0.75} y={y + 0.75} width="4.3" height="4.3" rx="0.9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      );
    })}
  </svg>
);

// Crash: a rocket heading up and away, with a window, fins and a flame.
export const RocketIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path fillRule="evenodd" d="M19.81 4.19 C19.95 7.86 18.54 10.98 15.99 13.52 L12.32 16.92 L7.08 11.68 L10.48 8.01 C13.02 5.46 16.14 4.05 19.81 4.19 ZM13.4 8.85a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0Z" />
    <path d="M9.52 9.17L4.96 9.84L3.34 11.47L6.45 12.46ZM14.83 14.48L14.16 19.04L12.53 20.66L11.54 17.55ZM7.37 13.24L10.76 16.63L9.42 17.27L6.73 14.58Z" />
    <path d="M7.51 16.49 C7.72 18.97 6.52 20.31 3.27 20.73 C3.69 17.48 5.03 16.28 7.51 16.49 Z" />
  </svg>
);

// Limbo: a gauge, its needle up near the top.
export const GaugeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path fill="none" stroke="currentColor" strokeWidth="2.9" strokeLinecap="butt" strokeDasharray="7.15 1.7" d="M4.39 18.15A8.4 8.4 0 1 1 19.61 18.15" />
    <path d="M15.82 8.49L13.14 15.32L10.86 13.88ZM9.7 14.6a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0Z" />
  </svg>
);

// Coinflip: two coins, one behind the other.
export const CoinflipIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M8.65 6.7A6.7 6.7 0 1 1 17.3 15.35A7.85 7.85 0 0 0 8.65 6.7Z" />
    <path fillRule="evenodd" d="M2.8 14.5a6.7 6.7 0 1 0 13.4 0a6.7 6.7 0 1 0 -13.4 0ZM4.5 14.5a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM5.9 14.5a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z" />
  </svg>
);

// Blackjack: a card tipped behind another, which has a spade cut out of it.
export const CardsIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M8.15 19.55L7.51 19.72L6.42 19.72L5.48 19.17L4.94 18.23L2.04 7.41L2.04 6.33L2.58 5.39L3.52 4.84L8.15 3.6ZM10.09 3.08L11.18 3.08L12.12 3.63L12.42 4.15L6.11 4.15Z" />
    <path fillRule="evenodd" d="M11.6 5.4h7.2a2.2 2.2 0 0 1 2.2 2.2v11.4a2.2 2.2 0 0 1 -2.2 2.2h-7.2a2.2 2.2 0 0 1 -2.2 -2.2v-11.4a2.2 2.2 0 0 1 2.2 -2.2ZM15.2 9.7C16.19 10.88 18.3 12.18 18.3 13.79 18.3 14.78 17.56 15.47 16.69 15.47 16.19 15.47 15.76 15.22 15.51 14.85L15.94 16.52L14.46 16.52L14.89 14.85C14.64 15.22 14.21 15.47 13.71 15.47 12.84 15.47 12.1 14.78 12.1 13.79 12.1 12.18 14.21 10.88 15.2 9.7Z" />
  </svg>
);

export const TrophyIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M7 3h10v6a5 5 0 0 1-10 0Z" />
    <path fill="none" stroke="currentColor" strokeWidth="1.8" d="M7 5H4.6v1.2c0 1.9 1.3 3.4 3.1 3.8M17 5h2.4v1.2c0 1.9-1.3 3.4-3.1 3.8" />
    <path d="M10.8 13.6h2.4v3h-2.4ZM7.6 17.2h8.8c.6 0 1 .4 1 1v2.4H6.6v-2.4c0-.6.4-1 1-1Z" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path
      fillRule="evenodd"
      d="M12 2.6 19.6 5.5v5.9c0 4.7-3.1 8.6-7.6 10-4.5-1.4-7.6-5.3-7.6-10V5.5Zm3.7 6.3-4.6 4.6-1.9-1.9-1.4 1.4 3.3 3.3 6-6Z"
    />
  </svg>
);

/** Each game's menu icon, by its slug. */
export const GAME_ICONS: Record<string, ComponentType<IconProps>> = {
  "case-battles": SwordsIcon,
  cases: CaseIcon,
  upgrader: UpgradeIcon,
  mines: BombIcon,
  keno: KenoIcon,
  crash: RocketIcon,
  limbo: GaugeIcon,
  coinflip: CoinflipIcon,
  blackjack: CardsIcon,
};

// Line icons for the header and chat: 24px, drawn in the current colour.
function Line({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {children}
    </svg>
  );
}

export const ChatIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3.5v-3.5h0a2 2 0 0 1-2-2Z" />
  </Line>
);

export const CheckIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Line>
);

export const SendIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M4.5 12 19.5 5l-4 14.5-3.5-6.5Z" />
    <path d="m12 13 7.5-8" />
  </Line>
);

export const RainIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M7.5 15.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.5 1.2 3.4 3.4 0 0 1-.6 6.8Z" />
    <path d="m8.5 18-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5" />
  </Line>
);

export const ClockIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Line>
);

// A bet slip, for the bets table's heading.
export const SlipIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path
      fillRule="evenodd"
      d="M6 2.5h12A1.5 1.5 0 0 1 19.5 4v17l-2.5-1.6-2.5 1.6-2.5-1.6-2.5 1.6-2.5-1.6L4.5 21V4A1.5 1.5 0 0 1 6 2.5ZM8 7v2h8V7Zm0 4v2h8v-2Zm0 4v2h5v-2Z"
    />
  </svg>
);

// A solid speech bubble, for chat in the phone bar.
export const ChatBubbleIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M6 3.5h12A2.5 2.5 0 0 1 20.5 6v9a2.5 2.5 0 0 1-2.5 2.5h-6.2L7 21.2v-3.7H6A2.5 2.5 0 0 1 3.5 15V6A2.5 2.5 0 0 1 6 3.5Z" />
  </svg>
);

// The community's homes, as their own marks.
export const DiscordIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
  </svg>
);

export const XIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export const YouTubeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
  </svg>
);
