#!/usr/bin/env python3
"""Cache-busting: add/refresh ?v=<hash> on every local script and stylesheet in the played pages,
so testers on githack / GitHub Pages always load the latest build. The hash is taken from the
contents of the referenced files, so it only changes when they change. Run before committing:
    python3 tools/stamp-assets.py
"""
import hashlib, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ["index.html", "play.html", "phone.html", "rules.html"]
REF = re.compile(r'((?:src|href)=")((?!https?:|//|#|mailto:)[^"?#]+\.(?:js|css))(?:\?v=[0-9a-f]+)?(")')
def stamp():
    files = set()
    for p in PAGES:
        files.update(m.group(2) for m in REF.finditer(open(os.path.join(ROOT, p), encoding="utf-8").read()))
    h = hashlib.sha1()
    for f in sorted(files):
        h.update(f.encode()); h.update(open(os.path.join(ROOT, f), "rb").read())
    v = h.hexdigest()[:10]
    for p in PAGES:
        path = os.path.join(ROOT, p); s = open(path, encoding="utf-8").read()
        open(path, "w", encoding="utf-8").write(REF.sub(lambda m: m.group(1) + m.group(2) + "?v=" + v + m.group(3), s))
    print("stamped", len(files), "assets in", len(PAGES), "pages with v=" + v)
if __name__ == "__main__":
    stamp()
