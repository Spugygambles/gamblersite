// Turns a rendered canvas into the WebP the site uses: trimmed to what's
// drawn on it (for pictures on a see-through background), padded, sized,
// and encoded.
//   crop:    trim the transparent edges
//   pad:     then keep this much round the picture, in the render's pixels
//   fit:     [w, h] to centre it in, scaled to fit inside `margin`
//   height:  or scale to this height, the width following
export function pack(source, { crop = false, pad = 0, fit, margin = 0, height, quality = 0.88 } = {}) {
  let x = 0, y = 0, w = source.width, h = source.height;
  if (crop) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    ctx.drawImage(source, 0, 0);
    const a = ctx.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (a[(j * w + i) * 4 + 3] === 0) continue;
        if (i < x0) x0 = i;
        if (i > x1) x1 = i;
        if (j < y0) y0 = j;
        if (j > y1) y1 = j;
      }
    }
    x = Math.max(0, x0 - pad);
    y = Math.max(0, y0 - pad);
    w = Math.min(source.width, x1 + 1 + pad) - x;
    h = Math.min(source.height, y1 + 1 + pad) - y;
  }
  let W = w, H = h, dw = w, dh = h;
  if (fit) {
    [W, H] = fit;
    const s = Math.min((W - 2 * margin) / w, (H - 2 * margin) / h);
    dw = Math.round(w * s);
    dh = Math.round(h * s);
  } else if (height) {
    W = dw = Math.round((w * height) / h);
    H = dh = height;
  }
  const out = document.createElement("canvas");
  out.width = W; out.height = H;
  const octx = out.getContext("2d");
  octx.imageSmoothingQuality = "high";
  octx.drawImage(source, x, y, w, h, Math.round((W - dw) / 2), Math.round((H - dh) / 2), dw, dh);
  return out.toDataURL("image/webp", quality);
}
