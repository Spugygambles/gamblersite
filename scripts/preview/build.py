"""Snapshot the built pages into static pages for a Claude artifact.

Run the site first (npm run dev, on http://localhost:3000), then this. For
each page it takes the server-rendered HTML and its CSS, swaps the
self-hosted fonts for Google Fonts, points links between the built pages at
each other's files, copies the images beside them, and runs preview.js in
place of React. The games are the exception: each is bundled with React by
esbuild (npm install here first) and mounted over its snapshot, so the
preview plays the real thing. The result lands in out/: index.html is the
homepage.
"""
import pathlib
import re
import shutil
import subprocess
import urllib.request

HERE = pathlib.Path(__file__).parent
OUT = HERE / "out"
SITE = HERE.parents[1]
BASE = "http://localhost:3000"

def get(path):
    with urllib.request.urlopen(BASE + path) as r:
        return r.read().decode("utf-8")

# The pages built so far: path, file, title.
PAGES = [
    ("/", "index.html", "CsgoNeo Homepage"),
    ("/mines", "mines.html", "Mines — CsgoNeo"),
    ("/upgrader", "upgrader.html", "Upgrader — CsgoNeo"),
    ("/cases", "cases.html", "Cases — CsgoNeo"),
    ("/case-battles", "case-battles.html", "Case Battles — CsgoNeo"),
    ("/crash", "crash.html", "Crash — CsgoNeo"),
    ("/limbo", "limbo.html", "Limbo — CsgoNeo"),
    ("/keno", "keno.html", "Keno — CsgoNeo"),
    ("/coinflip", "coinflip.html", "Coinflip — CsgoNeo"),
    ("/blackjack", "blackjack.html", "Blackjack — CsgoNeo"),
    ("/account", "account.html", "Account — CsgoNeo"),
    ("/deposit", "deposit.html", "Wallet — CsgoNeo"),
    ("/terms", "terms.html", "Terms of service — CsgoNeo"),
]
# The games, each bundled from its entry and put into its page. A game
# without an entry yet isn't built.
BUNDLES = {name: HERE / f"{name[:-5]}-entry.tsx" for _, name, _ in PAGES if name not in ("index.html", "terms.html")}
PAGES = [p for p in PAGES if p[1] not in BUNDLES or BUNDLES[p[1]].exists()]
BUNDLES = {k: v for k, v in BUNDLES.items() if v.exists()}
# Links between them point at their files; links elsewhere stay, and
# preview.js says those pages aren't built yet.
LINKS = {"/": "index.html", "/#games": "index.html#games", **{path: name for path, name, _ in PAGES if path != "/"}}

fonts = (
    "https://fonts.googleapis.com/css2?"
    "family=Montserrat:wght@800;900&family=Russo+One&family=Rubik:ital,wght@0,400..900;1,400..900&display=swap"
)
js = (HERE / "preview.js").read_text()


def snapshot(path, title):
    html = get(path)
    body_open = re.search(r"<body([^>]*)>", html)
    body_cls = re.search(r'class="([^"]*)"', body_open.group(1)).group(1)
    body = html[body_open.end(): html.rindex("</body>")]

    # React's scripts and streaming data go; the page runs on preview.js.
    body = re.sub(r"<script\b[^>]*>.*?</script>", "", body, flags=re.S)
    body = re.sub(r"<link\b[^>]*>", "", body)
    body = re.sub(r"<!--\$\??-->|<!--/\$-->", "", body)
    assert "<script" not in body
    # Public images sit beside the page.
    body = re.sub(r'src="/(cases|battles|coinflip|gems|skins|items)/', r'src="\1/', body)
    # a link to a built page points at its file, its #hash kept
    def link(m):
        path, _, hash_ = m.group(1).partition("#")
        to = LINKS.get(path, path)
        return f'href="{to}#{hash_}"' if hash_ else f'href="{to}"'
    body = re.sub(r'href="(/[^"]*)"', link, body)

    css = []
    for href in re.findall(r'<link rel="stylesheet" href="([^"]+\.css)"', html):
        text = get(href)
        # The site's own font files aren't published; Google Fonts serves the
        # same families under the same names.
        text = re.sub(r"@font-face\s*\{[^}]*url\([^)]*\.woff2?[\"']?\)[^}]*\}", "", text)
        text = re.sub(r"/\*# sourceMappingURL=[^*]*\*/", "", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        assert "url(\"../media" not in text and "url(../media" not in text, "font url left behind"
        css.append(text)
    css.append((HERE / "preview.css").read_text())

    head = f"""<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<style>
{chr(10).join(css)}
</style>"""
    main = f"""<div class="{body_cls}">
{body}
</div>
<script>
{js}
</script>"""
    return head, main, body


def bundle(entry):
    """esbuild's JS and CSS for a game's entry, inlined into the page."""
    out = OUT / "_bundle.js"
    subprocess.run(
        [
            str(HERE / "node_modules" / ".bin" / "esbuild"),
            str(entry),
            "--bundle",
            "--minify",
            "--format=iife",
            "--jsx=automatic",
            "--define:process.env.NODE_ENV=\"production\"",
            "--log-level=warning",
            f"--outfile={out}",
        ],
        check=True,
        cwd=SITE,
    )
    js = out.read_text()
    css = out.with_suffix(".css").read_text()
    out.unlink()
    out.with_suffix(".css").unlink()
    # a closing script tag inside the code would end the inline script early
    js = js.replace("</script", "<\\/script")
    return f"<style>\n{css}\n</style>\n<script>\n{js}\n</script>"


def document(head, main):
    # The artifact's own page (index.html) is published as a fragment and
    # given its document round it; any other page is served as it is, so
    # it carries its own.
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{head}
</head>
<body>
{main}
</body>
</html>
"""


if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
used = set()
for path, name, title in PAGES:
    head, main, body = snapshot(path, title)
    # a game's bundle, or for a page without one just the header's wallet window
    main += "\n" + bundle(BUNDLES.get(name, HERE / "header-entry.tsx"))
    page = f"{head}\n{main}\n" if name == "index.html" else document(head, main)
    (OUT / name).write_text(page)
    used |= set(re.findall(r'src="((?:cases|battles|coinflip|gems|skins|items)/[^"]+)"', body))
    print(name, len(page), "bytes")
used = sorted(used)
for rel in used:
    dst = OUT / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(SITE / "public" / rel, dst)
print(len(used), "images:", ", ".join(used))
# the case items: a case shows its own only once it's picked, so all of them go
items = SITE / "public" / "items"
if items.exists():
    shutil.copytree(items, OUT / "items", dirs_exist_ok=True)
    print(len(list(items.glob("*"))), "item pictures")
# the sounds the games fetch themselves
sfx = SITE / "public" / "sfx"
if sfx.exists():
    shutil.copytree(sfx, OUT / "sfx")
    print("sounds:", ", ".join(str(p.relative_to(sfx)) for p in sorted(sfx.rglob("*")) if p.is_file()))
