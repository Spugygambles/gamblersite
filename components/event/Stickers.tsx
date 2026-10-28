import type { ReactNode, SVGProps } from "react";
import { MAPLE_LEAF } from "@/components/home/icons";

// The hunt's stickers, drawn like a CS sticker capsule's: flat colour, one
// shade, a dark brown ink line round every shape, and the whole thing cut
// out with a border of white sticker paper and a soft shadow under it.

const INK = "#2a1810";
const PAPER = "#fff8ee";

type StickerProps = SVGProps<SVGSVGElement>;

/**
 * A sticker: its art, with the die-cut border and shadow added by a filter
 * that grows the art's outline. `id` names the filter, so give each
 * sticker on a page its own.
 */
function Sticker({ id, viewBox, border, children, ...props }: StickerProps & { id: string; viewBox: string; border: number; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} aria-hidden {...props}>
      <defs>
        <filter id={id} x="-15%" y="-15%" width="130%" height="135%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius={border} result="grown" />
          {/* round off the grown outline's corners */}
          <feGaussianBlur in="grown" stdDeviation={border / 4} result="soft" />
          <feComponentTransfer in="soft" result="edge">
            <feFuncA type="linear" slope="6" intercept="-2.5" />
          </feComponentTransfer>
          <feFlood floodColor={PAPER} />
          <feComposite in2="edge" operator="in" result="paper" />
          <feGaussianBlur in="edge" stdDeviation={border / 2} />
          <feOffset dy={border / 2} result="drop" />
          <feFlood floodColor="#05061a" floodOpacity="0.55" />
          <feComposite in2="drop" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="paper" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id})`} strokeLinejoin="round" strokeLinecap="round">
        {children}
      </g>
    </svg>
  );
}

// ---- The turkey ---------------------------------------------------------------

// A tail feather, pointing up from its quill at the origin, and the pale cap
// at its tip.
const FEATHER = "M-22 -30C-34 -100-52-170-48-215C-44-262 44-262 48-215C52-170 34-100 22-30Z";
const FEATHER_TIP = "M-47.5-208C-43-262 43-262 47.5-208C26-226-26-226-47.5-208Z";

// The turkey's colours, and the gold foil version's: the same bird struck
// in gold, as the rarest stickers in a capsule are.
const NATURAL = {
  // tail feathers from the outermost pair in to the middle one
  fan: ["#7d4219", "#c9452a", "#e0662b", "#f0b54a", "#d2492b"],
  tip: "#f6d9a4",
  body: "#8f4f26",
  shade: "#743f1d",
  breast: "#bf7d45",
  scallop: "#9a5b2c",
  wing: "#6c391a",
  head: "#9b5b2c",
  beak: "#f2b33d",
  beakShade: "#d98f22",
  snood: "#d8423a",
  wattle: "#c8352f",
  kit: "#2f3040",
  trim: "#e07a3e",
  legs: "#f2a33a",
};
const GOLD = {
  fan: ["#a87420", "#c99230", "#e0b04a", "#f6d47a", "#d6a23c"],
  tip: "#fff2c8",
  body: "#d6a23c",
  shade: "#b8862a",
  breast: "#f3cd6c",
  scallop: "#cf9c38",
  wing: "#b07a22",
  head: "#e2b04c",
  beak: "#fff0bf",
  beakShade: "#e6c06a",
  snood: "#f0c45c",
  wattle: "#dcaa44",
  kit: "#6a4a16",
  trim: "#fff0bf",
  legs: "#f6d47a",
};

// The wing on the turkey's right (the viewer's left); the other is its mirror.
const WING = "M198 326C160 356 148 428 170 488C180 474 188 478 196 490C204 474 212 476 220 488C230 440 230 378 198 326Z";

/** The hunt's mascot: a turkey in a gaming headset, tail up, scowling.
    `gold` strikes him in gold foil. */
export function TurkeySticker({ gold = false, ...props }: StickerProps & { gold?: boolean }) {
  const c = gold ? GOLD : NATURAL;
  // outermost feathers first, so each lies over the one outside it
  const fan = [-80, 80, -60, 60, -40, 40, -20, 20, 0].map((angle) => [angle, c.fan[4 - Math.abs(angle) / 20]] as const);
  return (
    <Sticker id={gold ? "sticker-turkey-gold" : "sticker-turkey"} viewBox="0 0 600 620" border={13} {...props}>
      {/* legs and feet, under the body */}
      {[270, 330].map((x) => (
        <g key={x} fill="none">
          <path d={`M${x} 518V548M${x} 548L${x - 22} 568M${x} 548V572M${x} 548L${x + 22} 568`} stroke={INK} strokeWidth="15" />
          <path d={`M${x} 518V548M${x} 548L${x - 22} 568M${x} 548V572M${x} 548L${x + 22} 568`} stroke={c.legs} strokeWidth="8" />
        </g>
      ))}

      {/* the tail */}
      <g transform="translate(300 336)">
        {fan.map(([angle, color]) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d={FEATHER} fill={color} stroke={INK} strokeWidth="6" />
            <path d={FEATHER_TIP} fill={c.tip} stroke={INK} strokeWidth="4" />
            <path d="M0-48V-200" stroke={INK} strokeOpacity="0.35" strokeWidth="4" fill="none" />
          </g>
        ))}
      </g>

      {/* body, its shaded side and lighter breast with rows of feathers */}
      <path d="M300 252C378 252 430 322 430 398C430 474 376 530 300 530C224 530 170 474 170 398C170 322 222 252 300 252Z" fill={c.body} stroke={INK} strokeWidth="6" />
      <path d="M368 276C408 308 428 352 428 398C428 472 376 527 300 527C354 506 392 462 395 402C398 352 390 308 368 276Z" fill={c.shade} />
      <path d="M300 330C350 330 382 380 380 432C378 486 344 514 300 514C256 514 222 486 220 432C218 380 250 330 300 330Z" fill={c.breast} />
      <path d="M214 330C226 302 248 284 274 276" fill="none" stroke="#fff" strokeOpacity={gold ? 0.45 : 0.2} strokeWidth="9" />
      <g fill="none" stroke={c.scallop} strokeWidth="5">
        <path d="M252 392q12 14 24 0q12 14 24 0q12 14 24 0q12 14 24 0" />
        <path d="M240 432q12 14 24 0q12 14 24 0q12 14 24 0q12 14 24 0q12 14 24 0" />
        <path d="M252 472q12 14 24 0q12 14 24 0q12 14 24 0q12 14 24 0" />
      </g>
      <path d={WING} fill={c.wing} stroke={INK} strokeWidth="6" />
      <path d={WING} transform="matrix(-1 0 0 1 600 0)" fill={c.wing} stroke={INK} strokeWidth="6" />

      {/* head */}
      <circle cx="300" cy="205" r="68" fill={c.head} stroke={INK} strokeWidth="6" />
      <ellipse cx="276" cy="168" rx="24" ry="11" transform="rotate(-24 276 168)" fill="#fff" opacity={gold ? 0.45 : 0.22} />

      {/* the headset: band over the top, a cup each side, the mic round to
          the beak */}
      <path d="M228 206C224 102 376 102 372 206" fill="none" stroke={INK} strokeWidth="22" />
      <path d="M228 206C224 102 376 102 372 206" fill="none" stroke={c.kit} strokeWidth="11" />
      <rect x="204" y="174" width="42" height="66" rx="16" fill={c.kit} stroke={INK} strokeWidth="6" />
      <rect x="354" y="174" width="42" height="66" rx="16" fill={c.kit} stroke={INK} strokeWidth="6" />
      <rect x="213" y="188" width="10" height="38" rx="5" fill={c.trim} />
      <rect x="377" y="188" width="10" height="38" rx="5" fill={c.trim} />
      <path d="M226 238C230 264 248 272 268 266" fill="none" stroke={INK} strokeWidth="11" />
      <path d="M226 238C230 264 248 272 268 266" fill="none" stroke={c.kit} strokeWidth="5" />
      <rect x="262" y="256" width="18" height="16" rx="6" fill={c.trim} stroke={INK} strokeWidth="4" />

      {/* eyes, looking off to the left, under a scowl */}
      <ellipse cx="277" cy="199" rx="19" ry="23" fill="#fff" stroke={INK} strokeWidth="5" />
      <ellipse cx="325" cy="199" rx="19" ry="23" fill="#fff" stroke={INK} strokeWidth="5" />
      <circle cx="270" cy="204" r="9" fill={INK} />
      <circle cx="318" cy="204" r="9" fill={INK} />
      <circle cx="267" cy="200" r="3" fill="#fff" />
      <circle cx="315" cy="200" r="3" fill="#fff" />
      <path d="M254 170L293 183M307 183L346 170" stroke={INK} strokeWidth="10" fill="none" />

      {/* beak, snood and wattle */}
      <path d="M312 208C326 214 334 236 330 254C327 268 314 270 312 258C310 246 318 232 308 216Z" fill={c.snood} stroke={INK} strokeWidth="5" />
      <path d="M281 213H317L299 250Z" fill={c.beak} stroke={INK} strokeWidth="5" />
      <path d="M290 232H308L299 250Z" fill={c.beakShade} />
      <path d="M290 258C302 256 310 268 306 282C302 294 286 292 284 280C282 270 282 260 290 258Z" fill={c.wattle} stroke={INK} strokeWidth="5" />

      {/* gold foil catches the light in a couple of glints */}
      {gold && (
        <g fill="#fff">
          <path d="M150 210l7 20 20 7-20 7-7 20-7-20-20-7 20-7z" />
          <path d="M452 452l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" />
        </g>
      )}
    </Sticker>
  );
}

// ---- Small stickers -------------------------------------------------------------

/** A red maple leaf with a green CS crosshair on it. */
export function LeafSticker(props: StickerProps) {
  return (
    <Sticker id="sticker-leaf" viewBox="-6 -6 112 112" border={3.2} {...props}>
      <path d={MAPLE_LEAF} fill="#d4502b" stroke={INK} strokeWidth="2.4" />
      <path d="M50 64C36 54 24 50 10 48M50 64C64 54 76 50 90 48M50 64C50 44 50 28 50 12M50 64C42 70 34 72 22 70M50 64C58 70 66 72 78 70" fill="none" stroke="#a83a1c" strokeWidth="1.6" />
      <path d="M50 64V90" fill="none" stroke={INK} strokeWidth="3" />
      {/* the crosshair: four strokes round a gap, and a dot */}
      <g stroke={INK} strokeWidth="5.4">
        <path d="M50 30V40M50 54V64M30 47H40M60 47H70" />
      </g>
      <g stroke="#55e07a" strokeWidth="2.6">
        <path d="M50 30V40M50 54V64M30 47H40M60 47H70" />
      </g>
      <circle cx="50" cy="47" r="2.4" fill="#55e07a" stroke={INK} strokeWidth="1.2" />
    </Sticker>
  );
}

/** A slice of pumpkin pie with a curl of cream on top. */
export function PieSticker(props: StickerProps) {
  return (
    <Sticker id="sticker-pie" viewBox="0 0 240 190" border={7} {...props}>
      {/* the cut side: crust under filling */}
      <path d="M22 118L176 150V168L22 136Z" fill="#c96a26" stroke={INK} strokeWidth="5" />
      <path d="M22 136L176 168V180C120 176 60 160 22 146Z" fill="#e2a457" stroke={INK} strokeWidth="5" />
      {/* the back crust, and the top */}
      <path d="M176 150C206 128 216 92 200 58L190 70C200 96 194 126 176 150Z" fill="#c98a42" stroke={INK} strokeWidth="5" />
      <path d="M22 118L190 70C206 98 200 128 176 150Z" fill="#e07a33" stroke={INK} strokeWidth="5" />
      <path d="M176 150V168C204 146 216 112 210 82C206 100 194 132 176 150Z" fill="#b7652a" stroke={INK} strokeWidth="5" />
      <path d="M190 70C198 60 208 56 214 62C222 72 220 98 210 82" fill="#e9b46a" stroke={INK} strokeWidth="5" />
      <path d="M60 112L150 88" fill="none" stroke="#f0a258" strokeWidth="6" />
      {/* the cream */}
      <path d="M96 86C88 70 102 56 118 60C120 46 142 44 148 58C162 56 170 72 160 82C154 92 106 96 96 86Z" fill="#fff6e8" stroke={INK} strokeWidth="5" />
      <path d="M116 74C124 66 136 68 140 76" fill="none" stroke="#e8d6bd" strokeWidth="4" />
    </Sticker>
  );
}

/** A speech bubble saying GG. */
export function GGSticker(props: StickerProps) {
  return (
    <Sticker id="sticker-gg" viewBox="0 0 200 166" border={6} {...props}>
      <path d="M40 10H160C177 10 190 23 190 40V90C190 107 177 120 160 120H88L50 152L58 120H40C23 120 10 107 10 90V40C10 23 23 10 40 10Z" fill="#e07a3e" stroke={INK} strokeWidth="6" />
      <path d="M32 34C34 26 40 22 48 22" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="7" />
      <text x="100" y="92" textAnchor="middle" fill={PAPER} stroke={INK} strokeWidth="9" paintOrder="stroke" style={{ font: "900 72px var(--font-ui), sans-serif" }}>
        GG
      </text>
    </Sticker>
  );
}

/** A tear-off calendar page on Thanksgiving, the day ringed in marker. */
export function CalendarSticker(props: StickerProps) {
  return (
    <Sticker id="sticker-calendar" viewBox="0 0 220 236" border={7} {...props}>
      <rect x="20" y="30" width="180" height="190" rx="18" fill="#fff8ee" stroke={INK} strokeWidth="6" />
      <path d="M20 86V48C20 38 28 30 38 30H182C192 30 200 38 200 48V86Z" fill="#c9452a" stroke={INK} strokeWidth="6" />
      <text x="110" y="72" textAnchor="middle" fill="#fff8ee" style={{ font: "800 30px var(--font-ui), sans-serif", letterSpacing: "0.08em" }}>
        NOV
      </text>
      <rect x="56" y="12" width="18" height="38" rx="9" fill="#2f3040" stroke={INK} strokeWidth="5" />
      <rect x="146" y="12" width="18" height="38" rx="9" fill="#2f3040" stroke={INK} strokeWidth="5" />
      <text x="110" y="180" textAnchor="middle" fill={INK} style={{ font: "900 66px var(--font-ui), sans-serif" }}>
        26
      </text>
      {/* ringed in red marker, the loop not quite meeting */}
      <path d="M78 112C112 96 172 104 176 144C180 186 126 202 86 190C52 180 40 144 60 124C66 118 74 114 84 112" fill="none" stroke="#d8423a" strokeWidth="6" />
    </Sticker>
  );
}

/** A weapon case with a maple leaf on its front. */
export function CaseSticker(props: StickerProps) {
  return (
    <Sticker id="sticker-case" viewBox="0 0 250 190" border={7} {...props}>
      <path d="M100 48C100 22 150 22 150 48" fill="none" stroke={INK} strokeWidth="13" />
      <path d="M100 48C100 22 150 22 150 48" fill="none" stroke="#2f3040" strokeWidth="6" />
      <rect x="26" y="74" width="198" height="96" rx="14" fill="#d9772f" stroke={INK} strokeWidth="6" />
      <path d="M32 140H218V156C218 162 212 167 206 167H44C38 167 32 162 32 156Z" fill="#b85f22" />
      <rect x="20" y="44" width="210" height="42" rx="12" fill="#e8893f" stroke={INK} strokeWidth="6" />
      <rect x="54" y="76" width="22" height="26" rx="4" fill="#d9d2c4" stroke={INK} strokeWidth="4" />
      <rect x="174" y="76" width="22" height="26" rx="4" fill="#d9d2c4" stroke={INK} strokeWidth="4" />
      <circle cx="125" cy="122" r="28" fill="#7e2f12" stroke={INK} strokeWidth="5" />
      <path d={MAPLE_LEAF} transform="translate(106 103) scale(0.38)" fill="#f6c46a" />
      <path d="M40 56H120" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" fill="none" />
    </Sticker>
  );
}

/** A gold cup with a big 1 on it. */
export function TrophySticker(props: StickerProps) {
  return (
    <Sticker id="sticker-trophy" viewBox="0 0 220 240" border={7} {...props}>
      <path d="M60 58C24 54 18 108 62 116" fill="none" stroke={INK} strokeWidth="14" />
      <path d="M60 58C24 54 18 108 62 116" fill="none" stroke="#f2c14e" strokeWidth="6" />
      <path d="M160 58C196 54 202 108 158 116" fill="none" stroke={INK} strokeWidth="14" />
      <path d="M160 58C196 54 202 108 158 116" fill="none" stroke="#f2c14e" strokeWidth="6" />
      <rect x="62" y="186" width="96" height="34" rx="9" fill="#5a3a22" stroke={INK} strokeWidth="6" />
      <rect x="84" y="196" width="52" height="13" rx="3" fill="#f2c14e" />
      <path d="M98 150H122V188H98Z" fill="#dca33a" stroke={INK} strokeWidth="5" />
      <path d="M52 34H168V80C168 136 136 158 110 158C84 158 52 136 52 80Z" fill="#f2c14e" stroke={INK} strokeWidth="6" />
      <path d="M140 40V80C140 124 124 146 110 152C136 150 162 128 162 80V40Z" fill="#d9a032" />
      <path d="M66 46V82C66 104 74 120 84 130" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="7" />
      <text x="110" y="122" textAnchor="middle" fill={INK} style={{ font: "900 64px var(--font-ui), sans-serif" }}>
        1
      </text>
    </Sticker>
  );
}
