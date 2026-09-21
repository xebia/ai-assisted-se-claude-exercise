import threading
import urllib.request
import urllib.error
import json
from contextlib import contextmanager

from bookstore.server import start_server
from bookstore.store.author import AuthorStore
from bookstore.store.book import BookStore
from bookstore.store.db import open_db
from bookstore.store.review import ReviewStore


def new_test_db():
    return open_db(":memory:")


class TestEnv:
    def __init__(self):
        self.db = new_test_db()
        self.books = BookStore(self.db)
        self.authors = AuthorStore(self.db)
        self.reviews = ReviewStore(self.db)
        self.server = start_server(self.db, 0)
        self.base = f"http://127.0.0.1:{self.server.server_port}"
        self._thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self._thread.start()

    def request(self, method: str, path: str, body=None) -> tuple[int, bytes]:
        data = None
        headers = {}
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        req = urllib.request.Request(f"{self.base}{path}", data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    def request_raw(self, method: str, path: str, body: bytes, content_type: str = "application/json") -> tuple[int, bytes]:
        req = urllib.request.Request(
            f"{self.base}{path}",
            data=body,
            headers={"Content-Type": content_type},
            method=method,
        )
        try:
            with urllib.request.urlopen(req) as r:
                return r.status, r.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    def stop(self):
        self.server.shutdown()
        self.server.server_close()


@contextmanager
def test_env():
    env = TestEnv()
    try:
        yield env
    finally:
        env.stop()
