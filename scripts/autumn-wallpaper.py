"""Draw the page's autumn wallpaper: an 800px tile of maple leaves,
pumpkins, acorns and wheat, a shade lighter than the page, with their
details cut back to the page colour. It prints the CSS for --wallpaper in
app/globals.css:

    python3 scripts/autumn-wallpaper.py [shape colour] [page colour]
"""
import random
import sys

LEAF = "M50 4L58 22 67.5 14.7 64.8 35.1 79.2 31.2 79.2 41 98.3 45.5 80.7 58.3 84.8 66.7 65.8 66.3 65.7 77.2 53.3 65.5 52.2 64 53 92 47 92 47.8 64 46.7 65.5 34.3 77.2 34.2 66.3 15.2 66.7 19.3 58.3 1.7 45.5 20.8 41 20.8 31.2 35.2 35.1 32.5 14.7 42 22Z"
INK = sys.argv[1] if len(sys.argv) > 1 else "#191a36"  # the shapes
CUT = sys.argv[2] if len(sys.argv) > 2 else "#14152b"  # details cut back to the page colour

def leaf(x, y, s, r):
    return (f'<g transform="translate({x} {y}) rotate({r}) scale({s}) translate(-50 -54)">'
            f'<path d="{LEAF}"/>'
            f'<path d="M50 88V30M50 60 70 44M50 60 30 44M50 70 66 66M50 70 34 66" fill="none" stroke="{CUT}" stroke-width="3" stroke-linecap="round"/></g>')

def pumpkin(x, y, s, r):
    return (f'<g transform="translate({x} {y}) rotate({r}) scale({s})">'
            '<ellipse cx="-17" cy="0" rx="17" ry="21"/><ellipse cx="17" cy="0" rx="17" ry="21"/><ellipse cx="0" cy="-1" rx="19" ry="23"/>'
            '<path d="M-2 -22c0-6 2-10 7-12l2 3c-3 2-4 5-4 9Z"/>'
            f'<path d="M-9 -19c-4 6-5 12-5 19s1 13 5 19M9 -19c4 6 5 12 5 19s-1 13-5 19" fill="none" stroke="{CUT}" stroke-width="2.4" stroke-linecap="round"/></g>')

def acorn(x, y, s, r):
    return (f'<g transform="translate({x} {y}) rotate({r}) scale({s})">'
            '<path d="M-13 -2c0 12 6 22 13 26 7-4 13-14 13-26Z"/>'
            '<path d="M-16 -2c0-9 7-15 16-15s16 6 16 15Z"/><path d="M-1 -17c0-4 1-7 4-9l2 2c-2 2-3 4-3 7Z"/>'
            f'<path d="M-15 -4h30" stroke="{CUT}" stroke-width="2.2"/></g>')

def wheat(x, y, s, r):
    grains = "".join(
        f'<ellipse cx="{dx}" cy="{-12 - i * 9}" rx="4" ry="8" transform="rotate({ang} {dx} {-12 - i * 9})"/>'
        for i in range(5) for dx, ang in ((-5, -28), (5, 28)))
    return (f'<g transform="translate({x} {y}) rotate({r}) scale({s})">'
            f'<path d="M0 34V-60" fill="none" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/>{grains}'
            '<ellipse cx="0" cy="-60" rx="3.6" ry="8"/></g>')

# A jittered 4 x 4 grid, so the shapes spread evenly but not in rows, each
# kept inside its cell so nothing is cut at the tile's edges.
random.seed(11)
T = 800
CELL = T // 4
kinds = [leaf, pumpkin, acorn, wheat]
order = [0, 1, 2, 0, 3, 0, 1, 2, 2, 0, 3, 1, 0, 1, 0, 2]
items = []
for i, k in enumerate(order):
    cx = (i % 4) * CELL + CELL / 2 + random.uniform(-30, 30)
    cy = (i // 4) * CELL + CELL / 2 + random.uniform(-30, 30)
    turn = random.uniform(-40, 40)
    if k == 0:
        items.append(leaf(round(cx), round(cy), round(random.uniform(0.7, 1.15), 2), round(turn)))
    elif k == 1:
        items.append(pumpkin(round(cx), round(cy), round(random.uniform(1.4, 1.8), 2), round(turn / 3)))
    elif k == 2:
        items.append(acorn(round(cx), round(cy), round(random.uniform(1.3, 1.7), 2), round(turn)))
    else:
        items.append(wheat(round(cx), round(cy), round(random.uniform(1.0, 1.25), 2), round(turn)))
svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{T}" height="{T}" viewBox="0 0 {T} {T}"><g fill="{INK}">{"".join(items)}</g></svg>'
# As a CSS url: single quotes inside, and the characters CSS and URLs care
# about escaped.
data = svg.replace('"', "'").replace("#", "%23").replace("<", "%3C").replace(">", "%3E")
print(f'  --wallpaper: url("data:image/svg+xml,{data}");')
