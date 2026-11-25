"""Serve the extracted RMS demonstration on the local computer."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class DemoServer(ThreadingHTTPServer):
    # Opening a case can request many local JavaScript modules at once.
    request_queue_size = 128


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mở gói demo RMS trên máy này.")
    parser.add_argument("--port", type=int, default=4173, help="Cổng HTTP cục bộ")
    args = parser.parse_args()
    handler = partial(SimpleHTTPRequestHandler, directory=Path(__file__).resolve().parent)
    try:
        with DemoServer(("127.0.0.1", args.port), handler) as server:
            print(f"Mở http://127.0.0.1:{server.server_port}/demo.html", flush=True)
            server.serve_forever()
    except KeyboardInterrupt:
        pass
