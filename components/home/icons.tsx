import { useId, type SVGProps } from "react";
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

// The site currency: a gold coin with the claw stamped in it.
export function CoinIcon(props: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <defs>
        <radialGradient id={`${id}-face`} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.55" stopColor="#f6b23a" />
          <stop offset="1" stopColor="#d9831c" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill="#b8650f" />
      <circle cx="12" cy="11.4" r="10" fill={`url(#${id}-face)`} />
      <circle cx="12" cy="11.4" r="7.1" fill="none" stroke="#c9741a" strokeWidth="1.1" opacity="0.7" />
      <g fill="#b8650f" transform="translate(7.4 6.8) scale(0.092)">
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

// Line icons for the menu and chat: 24px, drawn in the current colour.
function Line({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1Z" />
  </Line>
);

export const BoxIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M3.5 8.5 12 4.5l8.5 4v7L12 19.5l-8.5-4Z" />
    <path d="M3.5 8.5 12 12.5l8.5-4M12 12.5v7" />
  </Line>
);

export const SwordsIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="m4 4 9.5 9.5M4 4h3.5L15 11.5M4 4v3.5L11.5 15M20 4l-9.5 9.5M20 4h-3.5L13 7.5M20 4v3.5L16.5 11M6.5 17.5l-2 2M17.5 17.5l2 2M8 14l2 2M16 14l-2 2" />
  </Line>
);

export const UpgradeIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m8.5 12.5 3.5-3.5 3.5 3.5M12 9v7" />
  </Line>
);

export const BombIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="10.5" cy="13.5" r="6.5" />
    <path d="m15 9 2.5-2.5M17 4.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L15 6.5l1.5-.5Z" />
  </Line>
);

export const GridIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Line>
);

export const RocketIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3.5c3 2 4.5 5 4.5 8.5L14.5 16h-5l-2-4c0-3.5 1.5-6.5 4.5-8.5Z" />
    <circle cx="12" cy="10" r="1.6" />
    <path d="M9.5 16 8 19.5 10.5 18M14.5 16l1.5 3.5-2.5-1.5M7.5 12 5 14l1 3M16.5 12l2.5 2-1 3" />
  </Line>
);

export const TargetIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </Line>
);

export const FlipIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="9" cy="12" r="5.5" />
    <path d="M13.5 7.2A5.5 5.5 0 1 1 13.5 16.8" />
  </Line>
);

export const CardsIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="3.5" y="6" width="10" height="14" rx="1.8" transform="rotate(-8 8.5 13)" />
    <path d="m13.8 5.5 5.2 1.6a1.8 1.8 0 0 1 1.2 2.2l-3 9.6" />
  </Line>
);

export const CupIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M7.5 4.5h9v4a4.5 4.5 0 0 1-9 0Z" />
    <path d="M7.5 6.5H4.5c0 2.5 1.2 4 3.3 4.3M16.5 6.5h3c0 2.5-1.2 4-3.3 4.3M12 13v3.5M8.5 19.5h7M9.5 19.5l.5-3h4l.5 3" />
  </Line>
);

export const ClockIcon = (p: IconProps) => (
  <Line {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Line>
);

export const ShieldIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Line>
);

export const HeadsetIcon = (p: IconProps) => (
  <Line {...p}>
    <path d="M4.5 13.5V12a7.5 7.5 0 0 1 15 0v1.5" />
    <rect x="3.5" y="13" width="4" height="6" rx="1.5" />
    <rect x="16.5" y="13" width="4" height="6" rx="1.5" />
    <path d="M18.5 19c0 1.2-1.3 1.8-4 1.8" />
  </Line>
);

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

export const GiftLineIcon = (p: IconProps) => (
  <Line {...p}>
    <rect x="4" y="8.5" width="16" height="4" rx="1" />
    <path d="M5.5 12.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-6.5M12 8.5V20M12 8.5c-1-2.5-2.5-4-4-4-1.3 0-2 .8-2 1.8 0 1.4 2 2.2 6 2.2Zm0 0c1-2.5 2.5-4 4-4 1.3 0 2 .8 2 1.8 0 1.4-2 2.2-6 2.2Z" />
  </Line>
);
