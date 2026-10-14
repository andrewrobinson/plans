# A local server for trying the pages out: python3 serve.py [port]
# (8765 if not given). As python3 -m http.server, but it tells the browser
# not to keep any file, so a reload always shows the files as they are now.
# With each page it also clears what the browser kept from before (served
# without this, a plain reload can show files hours old).
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit


class NoStore(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        path = urlsplit(self.path).path
        if path.endswith(('.html', '/')):
            self.send_header('Clear-Site-Data', '"cache"')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
print(f'Serving on http://localhost:{port}/')
ThreadingHTTPServer(('', port), NoStore).serve_forever()
