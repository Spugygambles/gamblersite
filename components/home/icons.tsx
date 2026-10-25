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

export function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6Z" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
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

// A gold cup with a star, for the leaderboard race.
export function TrophyIcon(props: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <defs>
        <linearGradient id={`${id}-cup`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8a5a1c" />
          <stop offset="0.35" stopColor="#d9a24a" />
          <stop offset="0.6" stopColor="#f6d58a" />
          <stop offset="1" stopColor="#9c6a24" />
        </linearGradient>
        <linearGradient id={`${id}-star`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff2b0" />
          <stop offset="1" stopColor="#f3a51c" />
        </linearGradient>
      </defs>
      <path d="M11 11c-6.5 0-8.6 3.6-7.6 7.6 1.1 4.4 5.4 7.4 10.6 8l.4-3c-3.7-.6-6.5-2.7-7.2-5.5-.5-2 .6-3.6 3.8-3.6Z" fill="#a8752c" />
      <path d="M37 11c6.5 0 8.6 3.6 7.6 7.6-1.1 4.4-5.4 7.4-10.6 8l-.4-3c3.7-.6 6.5-2.7 7.2-5.5.5-2-.6-3.6-3.8-3.6Z" fill="#a8752c" />
      <path d="M10.5 6.5h27c.9 0 1.6.8 1.5 1.7-1 11.2-5.6 19.6-15 19.6S10 19.4 9 8.2c-.1-.9.6-1.7 1.5-1.7Z" fill={`url(#${id}-cup)`} />
      <path d="M21 27.4h6l1 6.6h-8Z" fill="#b27a2a" />
      <path d="M14 34.5h20c1.1 0 2 .9 2 2V41H12v-4.5c0-1.1.9-2 2-2Z" fill="#5b3a14" />
      <path d="M14 34.5h20c1.1 0 2 .9 2 2v1H12v-1c0-1.1.9-2 2-2Z" fill="#8a5a1c" />
      <path d="m24 11.4 2.2 4.5 5 .7-3.6 3.5.9 4.9-4.5-2.3-4.5 2.3.9-4.9-3.6-3.5 5-.7Z" fill={`url(#${id}-star)`} />
      <path d="M13 8.5c.6 6 2.5 10.8 6 13.6" stroke="#fff6d8" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.55" />
    </svg>
  );
}

// A carved pumpkin with a candle glowing inside, for the Halloween event.
export function PumpkinIcon(props: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <defs>
        <radialGradient id={`${id}-skin`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffb054" />
          <stop offset="0.6" stopColor="#e8701c" />
          <stop offset="1" stopColor="#a8420c" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#fff3a8" />
          <stop offset="1" stopColor="#ffb21e" />
        </radialGradient>
      </defs>
      <path d="M25.5 9.5c.4-2.6 1.7-4.7 4.2-5.8l1 2c-1.8.8-2.6 2.2-2.8 4Z" fill="#5f7a2a" />
      <ellipse cx="13.5" cy="27" rx="10" ry="14" fill="#c4560f" />
      <ellipse cx="34.5" cy="27" rx="10" ry="14" fill="#c4560f" />
      <ellipse cx="24" cy="27" rx="13" ry="16" fill={`url(#${id}-skin)`} />
      <path d="M17.5 13.5c-2.6 3.6-3.9 8.2-3.9 13.5s1.3 9.9 3.9 13.5M30.5 13.5c2.6 3.6 3.9 8.2 3.9 13.5s-1.3 9.9-3.9 13.5" stroke="#a8420c" strokeWidth="1.2" fill="none" opacity="0.6" />
      <g fill={`url(#${id}-glow)`}>
        <path d="M12.5 22.5l6.5-2.6-1.2 5.8Z" />
        <path d="M35.5 22.5l-6.5-2.6 1.2 5.8Z" />
        <path d="M22.4 26.4h3.2L24 29.6Z" />
        <path d="M12.5 31c3.4 4 7.2 5.8 11.5 5.8S32.1 35 35.5 31l-3.2.6-1.4 2.2-1.8-1.8-2.5 2.1-2.6-2.1-2.6 2.1-2.5-2.1-1.8 1.8-1.4-2.2Z" />
      </g>
    </svg>
  );
}
