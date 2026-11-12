"""Lokale Vorschau: Development-Modul und installierte Systemressourcen."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
ROOT = Path(__file__).resolve().parent.parent
DATA = Path('D:/FoundryVTT/user-data-paths/v14/Data')
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        url = unquote(urlsplit(path).path)
        prefix = '/modules/dsa5-helpers/'
        if url.startswith(prefix):
            base, rel = ROOT, url[len(prefix):]
        elif url.startswith('/systems/dsa5/'):
            base, rel = DATA / 'systems/dsa5', url[len('/systems/dsa5/'):]
        else:
            return str(ROOT / '__not_served__')
        target = (base / rel).resolve()
        if not target.is_relative_to(base.resolve()) or any(p.startswith('.') for p in Path(rel).parts):
            return str(ROOT / '__not_served__')
        return str(target)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 8877), Handler).serve_forever()
