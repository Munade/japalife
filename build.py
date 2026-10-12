"""Rebuild site/index.html from the files in src/.
Run:  python3 build.py
Order matters: later files use things defined in earlier ones."""
import pathlib
ROOT = pathlib.Path(__file__).parent
ORDER = ["data.js", "engine.js", "biz.js", "social.js", "draw.js", "citymap.js", "home.js", "story.js", "ui.js"]
shell = (ROOT / "src/shell.html").read_text()
js = "\n".join((ROOT / "src" / f).read_text() for f in ORDER)
page = shell + "<script>\n" + js + "\n</script>\n"
old = (ROOT / "site/index.html").read_text()
head = old[: old.index("<title>")]
sw = old[old.rindex("<script>\nif('serviceWorker'") : old.rindex("</body>")]
te = page.index("</style>") + len("</style>")
(ROOT / "site/index.html").write_text(head + page[:te] + "\n</head>\n<body>\n" + page[te:] + "\n" + sw + "</body>\n</html>\n")
print("Built site/index.html. Remember to bump VERSION in site/sw.js so phones update.")
