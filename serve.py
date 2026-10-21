# A local server for trying the pages out: python3 serve.py [port]
# (8765 if not given). As python3 -m http.server, but it tells the browser
# not to keep any file, so a reload always shows the files as they are now.
# (It sent Clear-Site-Data: "cache" with each page too, for files kept from
# before no-store; measured 21 Oct 2026, Chrome held each page back about
# 17.5 s while it cleared an everyday profile's cache, so it's gone.)
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoStore(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
print(f'Serving on http://localhost:{port}/')
ThreadingHTTPServer(('', port), NoStore).serve_forever()
