"""Snapshot the homepage into a static page for a Claude artifact.

Run the site first (npm run dev, on http://localhost:3000), then this. It
takes the server-rendered HTML and its CSS, swaps the self-hosted fonts for
Google Fonts, copies the images beside the page, and runs preview.js in
place of React. The result lands in out/.
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

html = get("/")
body_open = re.search(r"<body([^>]*)>", html)
body_cls = re.search(r'class="([^"]*)"', body_open.group(1)).group(1)
body = html[body_open.end(): html.rindex("</body>")]

# React's scripts and streaming data go; the page runs on preview.js.
body = re.sub(r"<script\b[^>]*>.*?</script>", "", body, flags=re.S)
body = re.sub(r"<link\b[^>]*>", "", body)
body = re.sub(r"<!--\$\??-->|<!--/\$-->", "", body)
assert "<script" not in body
# Public images sit beside the page.
body = re.sub(r'src="/(cases|battles|coinflip)/', r'src="\1/', body)

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
js = (HERE / "preview.js").read_text()

fonts = (
    "https://fonts.googleapis.com/css2?"
    "family=Montserrat:wght@800;900&family=Rubik:wght@400..800&display=swap"
)
page = f"""<title>CsgoNeo Homepage</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<style>
{chr(10).join(css)}
</style>
<div class="{body_cls}">
{body}
</div>
<script>
{js}
</script>
"""

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()
(OUT / "index.html").write_text(page)
used = sorted(set(re.findall(r'src="((?:cases|battles|coinflip)/[^"]+)"', body)))
for rel in used:
    dst = OUT / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(SITE / "public" / rel, dst)
print("index.html", len(page), "bytes;", len(used), "images:", ", ".join(used))
