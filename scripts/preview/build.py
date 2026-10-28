"""Snapshot the built pages into static pages for a Claude artifact.

Run the site first (npm run dev, on http://localhost:3000), then this. For
each page it takes the server-rendered HTML and its CSS, swaps the
self-hosted fonts for Google Fonts, points links between the built pages at
each other's files, copies the images beside them, and runs preview.js in
place of React. The result lands in out/: index.html is the homepage.
"""
import pathlib
import re
import shutil
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
    ("/turkey-hunt", "turkey-hunt.html", "Turkey Hunt — CsgoNeo"),
]
# Links between them point at their files; links elsewhere stay, and
# preview.js says those pages aren't built yet.
LINKS = {"/": "index.html", "/#games": "index.html#games", "/turkey-hunt": "turkey-hunt.html"}

fonts = (
    "https://fonts.googleapis.com/css2?"
    "family=Montserrat:wght@800;900&family=Rubik:ital,wght@0,400..900;1,400..900&display=swap"
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
    body = re.sub(r'src="/(cases|battles|coinflip|event)/', r'src="\1/', body)
    body = re.sub(r'href="(/[^"]*)"', lambda m: f'href="{LINKS.get(m.group(1), m.group(1))}"', body)

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
    page = f"{head}\n{main}\n" if name == "index.html" else document(head, main)
    (OUT / name).write_text(page)
    used |= set(re.findall(r'src="((?:cases|battles|coinflip|event)/[^"]+)"', body))
    print(name, len(page), "bytes")
used = sorted(used)
for rel in used:
    dst = OUT / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(SITE / "public" / rel, dst)
print(len(used), "images:", ", ".join(used))
