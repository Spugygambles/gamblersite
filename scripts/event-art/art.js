// Canvas drawings for the cases' prints: patterns and emblems, all in two
// tones so they read like printed graphics.

const MAPLE = "M50 4L58 22 67.5 14.7 64.8 35.1 79.2 31.2 79.2 41 98.3 45.5 80.7 58.3 84.8 66.7 65.8 66.3 65.7 77.2 53.3 65.5 52.2 64 53 92 47 92 47.8 64 46.7 65.5 34.3 77.2 34.2 66.3 15.2 66.7 19.3 58.3 1.7 45.5 20.8 41 20.8 31.2 35.2 35.1 32.5 14.7 42 22Z";

function leafAt(ctx, x, y, size, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(size / 100, size / 100);
  ctx.translate(-50, -50);
  ctx.fill(new Path2D(MAPLE));
  ctx.restore();
}

export function pattern(ctx, d, W, H, rand) {
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = d.dark;
  ctx.strokeStyle = d.dark;
  switch (d.pattern) {
    case "leaves":
      for (let i = 0; i < 46; i++) leafAt(ctx, rand() * W, rand() * H, 60 + rand() * 50, rand() * 6.28);
      break;
    case "dots":
      for (let y = 20; y < H; y += 48) for (let x = (y / 48) % 2 ? 44 : 20; x < W; x += 48) { ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.28); ctx.fill(); }
      break;
    case "stripes":
      ctx.lineWidth = 34;
      for (let x = -H; x < W; x += 88) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + H, 0); ctx.stroke(); }
      break;
    case "maze":
      ctx.lineWidth = 10;
      for (let y = 0; y < H; y += 56) for (let x = 0; x < W; x += 56) {
        ctx.beginPath();
        if (rand() > 0.5) { ctx.moveTo(x, y); ctx.lineTo(x + 56, y); } else { ctx.moveTo(x, y); ctx.lineTo(x, y + 56); }
        ctx.stroke();
      }
      break;
    case "pinstripes":
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = d.accent;
      ctx.lineWidth = 3;
      for (let x = 12; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      break;
    case "waves":
      ctx.lineWidth = 9;
      for (let y = 20; y < H; y += 44) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin(x / 26) * 9);
        ctx.stroke();
      }
      break;
    case "stars":
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = d.accent;
      for (let i = 0; i < 90; i++) { ctx.beginPath(); ctx.arc(rand() * W, rand() * H, 1.5 + rand() * 3, 0, 6.28); ctx.fill(); }
      break;
    case "chevrons":
      ctx.lineWidth = 16;
      for (let y = -40; y < H + 40; y += 60) {
        ctx.beginPath();
        for (let x = 0, up = true; x <= W + 60; x += 60, up = !up) ctx.lineTo(x, y + (up ? 0 : 30));
        ctx.stroke();
      }
      break;
    case "plaid":
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(15,12,14,0.55)";
      for (let x = 0; x < W; x += 160) ctx.fillRect(x, 0, 80, H);
      for (let y = 0; y < H; y += 160) ctx.fillRect(0, y, W, 80);
      ctx.fillStyle = "rgba(255,240,220,0.12)";
      for (let x = 38; x < W; x += 160) ctx.fillRect(x, 0, 4, H);
      for (let y = 38; y < H; y += 160) ctx.fillRect(0, y, W, 4);
      break;
    case "argyle":
      for (let y = 0; y < H + 90; y += 90) for (let x = (y / 90) % 2 ? 60 : 0; x < W + 120; x += 120) {
        ctx.beginPath(); ctx.moveTo(x, y - 45); ctx.lineTo(x + 30, y); ctx.lineTo(x, y + 45); ctx.lineTo(x - 30, y); ctx.closePath(); ctx.fill();
      }
      break;
    case "rays":
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = "#fff6d8";
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * 6.283;
        ctx.beginPath(); ctx.moveTo(W / 2, H / 2);
        ctx.lineTo(W / 2 + Math.cos(a) * W, H / 2 + Math.sin(a) * W);
        ctx.lineTo(W / 2 + Math.cos(a + 0.12) * W, H / 2 + Math.sin(a + 0.12) * W);
        ctx.fill();
      }
      break;
  }
  ctx.restore();
}

// The emblem, drawn in a box `s` wide centred on (cx, cy), in `ink`, with
// `hole` for any cut-out detail.
export function emblem(ctx, d, cx, cy, s, ink, hole) {
  ctx.save();
  ctx.translate(cx - s / 2, cy - s / 2);
  ctx.scale(s / 100, s / 100);
  ctx.fillStyle = ink;
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const P = (p) => ctx.fill(new Path2D(p));
  switch (d.emblem) {
    case "leaf":
      P(MAPLE);
      ctx.strokeStyle = hole; ctx.lineWidth = 3.4;
      ctx.stroke(new Path2D("M50 88V24M50 63 18 44M50 63l32-19M50 75 28 68M50 75l22-7"));
      break;
    case "berries":
      [[34, 58, 15], [58, 50, 16], [48, 74, 14], [70, 72, 13], [30, 80, 11]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); });
      ctx.fillStyle = hole;
      [[30, 53, 3.5], [54, 45, 3.8], [44, 70, 3.2]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); });
      ctx.fillStyle = ink;
      P("M52 34C46 18 30 12 16 16c6 12 20 18 36 18ZM56 34c4-14 16-22 30-22-2 12-14 22-30 22Z");
      break;
    case "pumpkin":
      P("M50 30c-10-6-30-6-38 10s-6 40 10 48c10 6 20 4 28 0 8 4 18 6 28 0 16-8 18-32 10-48S60 24 50 30Z");
      ctx.strokeStyle = hole; ctx.lineWidth = 3.4;
      ctx.stroke(new Path2D("M50 31c-8 14-8 42 0 57M50 31c8 14 8 42 0 57M30 34c-8 16-6 38 6 52M70 34c8 16 6 38-6 52"));
      ctx.fillStyle = ink;
      P("M46 32c0-10 2-18 8-22l5 3c-5 4-6 11-6 19Z");
      break;
    case "corn":
      P("M50 8c12 0 18 14 18 34s-6 44-18 44-18-24-18-44 6-34 18-34Z");
      ctx.fillStyle = hole;
      for (let y = 18; y < 82; y += 9) for (let x = 38; x < 64; x += 8) { ctx.beginPath(); ctx.ellipse(x + ((y / 9) % 2 ? 4 : 0), y, 2.4, 3.2, 0, 0, 6.28); ctx.fill(); }
      ctx.fillStyle = ink;
      P("M50 92C40 80 26 62 20 40c10 10 20 22 30 40ZM50 92c10-12 24-30 30-52-10 10-20 22-30 40Z");
      break;
    case "hat":
      P("M30 22h40l6 52H24Z");
      P("M8 74h84c4 0 6 4 4 8H4c-2-4 0-8 4-8Z");
      ctx.fillStyle = hole; P("M27 58h46v8H27Z");
      ctx.fillStyle = "#e9b84a"; P("M42 54h16v16H42Z"); ctx.fillStyle = hole; P("M46 58h8v8h-8Z");
      break;
    case "boat":
      P("M12 52h66c10 0 16-8 18-14l4 2c-2 10-8 22-22 24l-4 12c-2 4-6 6-10 6H34c-4 0-8-2-10-6Z");
      P("M14 52c-6-6-10-14-8-22 4 6 10 10 16 12Z");
      ctx.fillStyle = hole; P("M24 58h44c-2 4-4 6-8 6H30c-4 0-6-2-6-6Z");
      ctx.fillStyle = ink; P("M40 32c0-8 6-14 6-20 6 6 6 12 2 20Z");
      break;
    case "moon":
      ctx.beginPath(); ctx.arc(50, 42, 30, 0, 6.28); ctx.fill();
      ctx.fillStyle = hole;
      P("M18 92V70l14-12 14 12v22ZM46 92V76h36v16Z");
      ctx.fillStyle = ink; P("M28 78h8v14h-8Z");
      break;
    case "wishbone":
      ctx.lineWidth = 11;
      ctx.stroke(new Path2D("M50 92V58C50 42 30 30 22 10M50 58C50 42 70 30 78 10"));
      ctx.beginPath(); ctx.arc(50, 58, 9, 0, 6.28); ctx.fill();
      ctx.beginPath(); ctx.arc(22, 10, 7, 0, 6.28); ctx.fill();
      ctx.beginPath(); ctx.arc(78, 10, 7, 0, 6.28); ctx.fill();
      break;
    case "axe":
      ctx.lineWidth = 9; ctx.stroke(new Path2D("M26 90 70 22"));
      P("M58 8c14 2 28 12 30 28-10-2-18 2-24 8L48 28c6-6 10-12 10-20Z");
      break;
    case "horn":
      P("M92 30C70 26 42 30 26 46 14 58 10 74 18 84c4-8 12-12 18-12 18-2 40-10 56-28Z");
      ctx.fillStyle = hole;
      ctx.lineWidth = 3; ctx.strokeStyle = hole;
      ctx.stroke(new Path2D("M60 32c4 8 4 18 0 26M44 38c4 8 4 18-2 26M30 50c2 8 0 16-6 22"));
      ctx.fillStyle = ink;
      [[78, 50, 9], [86, 64, 8], [72, 66, 8]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); });
      break;
    case "turkey":
      for (let i = -4; i <= 4; i++) {
        ctx.save(); ctx.translate(50, 62); ctx.rotate(i * 0.32);
        ctx.beginPath(); ctx.ellipse(0, -30, 9, 26, 0, 0, 6.28); ctx.fill(); ctx.restore();
      }
      ctx.beginPath(); ctx.ellipse(50, 70, 22, 20, 0, 0, 6.28); ctx.fill();
      ctx.beginPath(); ctx.arc(50, 44, 11, 0, 6.28); ctx.fill();
      ctx.fillStyle = hole;
      ctx.beginPath(); ctx.arc(46, 42, 2.4, 0, 6.28); ctx.fill();
      ctx.beginPath(); ctx.arc(54, 42, 2.4, 0, 6.28); ctx.fill();
      P("M46 48h8l-4 6Z");
      break;
  }
  ctx.restore();
}
