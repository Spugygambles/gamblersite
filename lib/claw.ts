// A claw mark: a sliver from (x1, y1) to (x2, y2), pointed at both ends and
// `w` thick in the middle.
export function lens(x1: number, y1: number, x2: number, y2: number, w: number) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = (-(y2 - y1) / len) * w;
  const ny = ((x2 - x1) / len) * w;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const f = (n: number) => n.toFixed(2);
  return (
    `M${f(x1)} ${f(y1)}Q${f(mx + nx)} ${f(my + ny)} ${f(x2)} ${f(y2)}` +
    `Q${f(mx - nx)} ${f(my - ny)} ${f(x1)} ${f(y1)}Z`
  );
}

// The three marks of the Rustwild claw, traced from the logo, in a 100x100
// box.
export const CLAW_MARKS = [
  lens(0, 59, 71, 0, 7.5),
  lens(4, 90, 97, 9, 8),
  lens(33, 100, 100, 40, 7.5),
];
