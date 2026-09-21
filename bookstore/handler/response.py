import json
from dataclasses import asdict, is_dataclass
from http.server import BaseHTTPRequestHandler
from typing import Any


def _encode(v: Any) -> Any:
    if is_dataclass(v):
        return asdict(v)
    if isinstance(v, list):
        return [_encode(x) for x in v]
    if isinstance(v, dict):
        return {k: _encode(x) for k, x in v.items()}
    return v


def write_json(handler: BaseHTTPRequestHandler, status: int, body: Any) -> None:
    payload = json.dumps(_encode(body)).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


def write_error(handler: BaseHTTPRequestHandler, status: int, msg: str) -> None:
    write_json(handler, status, {"error": msg})
