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

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden {...props}>
      <path d="M4 7h16M4 12h16M4 17h11" />
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

// The rewards currency: a cut purple gem.
export function GemIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M2.2 9.1 6.4 4h11.2l4.2 5.1L12 20.6Z" fill="#6c33dc" />
      <path d="M2.2 9.1h19.6L12 20.6Z" fill="#7f45f0" />
      <path d="M6.4 4 8.6 9.1 12 4Z" fill="#b997ff" />
      <path d="M12 4l3.4 5.1L17.6 4Z" fill="#9a6bff" />
      <path d="M8.6 9.1h6.8L12 20.6Z" fill="#9b6cff" />
      <path d="M2.2 9.1h6.4L12 20.6Z" fill="#5a26c4" />
      <path d="M8.6 9.1 12 4l3.4 5.1Z" fill="#cfb6ff" />
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

export const CaseIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M2.8 8.2 12 3.6l9.2 4.6V10H2.8Z" />
    <path
      fillRule="evenodd"
      d="M4 11.4h16V19a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19Zm6.4 1.4v2.6c0 .4.3.7.7.7h1.8c.4 0 .7-.3.7-.7v-2.6Z"
    />
  </svg>
);

export const SwordsIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden {...p}>
    <path strokeWidth="2.6" d="M5 5l9.2 9.2M19 5l-9.2 9.2" />
    <path strokeWidth="2.2" d="M11.6 17.4l5.8-5.8M12.4 17.4l-5.8-5.8" />
    <path strokeWidth="2.6" d="M16.6 16.6l2.6 2.6M7.4 16.6l-2.6 2.6" />
  </svg>
);

export const UpgradeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path fillRule="evenodd" d="M12 2.8a9.2 9.2 0 1 1 0 18.4 9.2 9.2 0 0 1 0-18.4Zm0 4.4-4.6 4.7h3.1v4.9h3v-4.9h3.1Z" />
  </svg>
);

export const BombIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <circle cx="10.5" cy="14" r="6.9" />
    <path d="m13.9 8.2 2.1-2.1 2.1 2.1-2.1 2.1ZM19.4 2.6l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z" />
  </svg>
);

// Keno: a board with some numbers picked.
export const KenoIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    {[6, 12, 18].flatMap((y) =>
      [6, 12, 18].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" opacity={(x + y) % 12 === 0 ? 0.45 : 1} />),
    )}
  </svg>
);

export const RocketIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path
      fillRule="evenodd"
      d="M12 2.4c3.3 2.2 5 5.6 5 9.7 0 1.4-.2 2.8-.6 4H7.6A12.6 12.6 0 0 1 7 12.1c0-4.1 1.7-7.5 5-9.7Zm0 5.4a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Z"
    />
    <path d="M6.9 12.6 4.4 15l.8 3.4 2.7-1.7ZM17.1 12.6l2.5 2.4-.8 3.4-2.7-1.7ZM10.2 17.2h3.6l-.6 3a1.2 1.2 0 0 1-2.4 0Z" />
  </svg>
);

export const TargetIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path
      fillRule="evenodd"
      d="M12 2.8a9.2 9.2 0 1 1 0 18.4 9.2 9.2 0 0 1 0-18.4Zm0 3a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 3.2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
    />
  </svg>
);

export const CoinflipIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path fillRule="evenodd" d="M12 2.8a9.2 9.2 0 1 1 0 18.4 9.2 9.2 0 0 1 0-18.4Zm0 2.6a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Z" />
    <path d="M12 7.6l1.3 2.7 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4Z" />
  </svg>
);

export const CardsIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <rect x="9.6" y="2.6" width="10.4" height="14.6" rx="2" opacity="0.45" transform="rotate(14 14.8 9.9)" />
    <path
      fillRule="evenodd"
      d="M5.6 6.4h8.4c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H5.6c-1.1 0-2-.9-2-2v-11c0-1.1.9-2 2-2Zm4.2 4.2c-1.4 1.4-2.8 2.4-2.8 3.8 0 .9.7 1.6 1.6 1.6.4 0 .8-.2 1-.5l-.5 1.6h1.4l-.5-1.6c.2.3.6.5 1 .5.9 0 1.6-.7 1.6-1.6 0-1.4-1.4-2.4-2.8-3.8Z"
    />
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

export const HeadsetIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M4.6 13v-1.4a7.4 7.4 0 0 1 14.8 0V13" />
    <rect x="3" y="12.4" width="4.6" height="7" rx="1.6" />
    <rect x="16.4" y="12.4" width="4.6" height="7" rx="1.6" />
    <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M18.7 19.4c0 1.3-1.6 2-4.2 2" />
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
  limbo: TargetIcon,
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
