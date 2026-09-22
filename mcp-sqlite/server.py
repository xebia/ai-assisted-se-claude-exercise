# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""SQLite MCP server for the BookStore exercise (Session 5).

One file, standard library only. Claude Code starts it as a subprocess and
talks JSON-RPC over stdin/stdout, one JSON object per line.

Tools:
    get_table_definitions   CREATE TABLE statements and column info
    execute_query           a read-only SELECT query, returns JSON rows

Start it by hand to see it work:
    uv run --script server.py path/to/store.db
    (or: python3 server.py path/to/store.db)
"""

import json
import os
import sqlite3
import sys
from pathlib import Path

SERVER_NAME = "sqlite-bookstore"
SERVER_VERSION = "2.0.0"

TOOLS = [
    {
        "name": "get_table_definitions",
        "description": (
            "Return the CREATE TABLE statement and column list for every "
            "table in the database. Call this before writing any SQL query "
            "so you know the exact column names, types, and foreign keys."
        ),
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "execute_query",
        "description": (
            "Execute a read-only SELECT query against the bookstore database. "
            "Returns a JSON array of objects, one object per row. "
            "Only SELECT statements are permitted."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "sql": {
                    "type": "string",
                    "description": "A valid SQLite SELECT statement.",
                }
            },
            "required": ["sql"],
        },
    },
]


def db_path() -> Path:
    """The database file: first argument, or store.db in the current folder.

    A relative path is tried from the current folder first, then from
    CLAUDE_PROJECT_DIR (Claude Code sets it to the folder it was started in).
    """
    raw = sys.argv[1] if len(sys.argv) > 1 else "store.db"
    path = Path(raw)
    if not path.is_absolute() and not path.exists():
        project_dir = os.environ.get("CLAUDE_PROJECT_DIR")
        if project_dir and (Path(project_dir) / raw).exists():
            path = Path(project_dir) / raw
    return path.resolve()


def open_db() -> sqlite3.Connection:
    path = db_path()
    if not path.exists():
        raise FileNotFoundError(
            f"database not found at {path}. Start the BookStore app once so "
            "it creates store.db, then restart Claude."
        )
    # mode=ro: the file is opened read-only, whatever the query says.
    conn = sqlite3.connect(f"{path.as_uri()}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def get_table_definitions() -> str:
    conn = open_db()
    try:
        tables = conn.execute(
            "SELECT name, sql FROM sqlite_master WHERE type='table' "
            "AND name NOT LIKE 'sqlite_%' ORDER BY name"
        ).fetchall()
        if not tables:
            return "Database is empty: no tables found."
        lines = []
        for table in tables:
            lines.append(f"-- Table: {table['name']}")
            lines.append(table["sql"] or "-- (no CREATE statement)")
            for col in conn.execute(f"PRAGMA table_info('{table['name']}')"):
                suffix = ""
                if col["pk"]:
                    suffix += " PRIMARY KEY"
                if col["notnull"]:
                    suffix += " NOT NULL"
                if col["dflt_value"] is not None:
                    suffix += f" DEFAULT {col['dflt_value']}"
                lines.append(f"--   {col['name']:<20} {col['type']}{suffix}")
            lines.append("")
        return "\n".join(lines)
    finally:
        conn.close()


def execute_query(sql: str) -> str:
    if not sql.strip().upper().startswith("SELECT"):
        return json.dumps({"error": "only SELECT queries are allowed"})
    conn = open_db()
    try:
        rows = conn.execute(sql).fetchall()
        return json.dumps([dict(row) for row in rows], indent=2, default=str)
    except sqlite3.Error as err:
        return json.dumps({"error": str(err)})
    finally:
        conn.close()


def call_tool(name: str, arguments: dict) -> dict:
    try:
        if name == "get_table_definitions":
            text = get_table_definitions()
        elif name == "execute_query":
            if "sql" not in arguments:
                return error_result("missing required parameter: sql")
            text = execute_query(arguments["sql"])
        else:
            return error_result(f"unknown tool: {name}")
    except Exception as err:  # the model gets the message, not a crash
        return error_result(str(err))
    return {"content": [{"type": "text", "text": text}]}


def error_result(message: str) -> dict:
    return {"content": [{"type": "text", "text": f"Error: {message}"}], "isError": True}


def handle(request: dict) -> dict | None:
    """Return the JSON-RPC response, or None for a notification."""
    method = request.get("method", "")
    params = request.get("params") or {}
    msg_id = request.get("id")

    if msg_id is None:  # notifications (initialized, cancelled, ...) get no reply
        return None

    if method == "initialize":
        result = {
            "protocolVersion": params.get("protocolVersion", "2025-06-18"),
            "capabilities": {"tools": {}},
            "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
        }
    elif method == "ping":
        result = {}
    elif method == "tools/list":
        result = {"tools": TOOLS}
    elif method == "tools/call":
        result = call_tool(params.get("name", ""), params.get("arguments") or {})
    else:
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {"code": -32601, "message": f"method not found: {method}"},
        }
    return {"jsonrpc": "2.0", "id": msg_id, "result": result}


def main() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
        except json.JSONDecodeError:
            print(json.dumps({"jsonrpc": "2.0", "id": None,
                              "error": {"code": -32700, "message": "parse error"}}), flush=True)
            continue
        response = handle(request)
        if response is not None:
            print(json.dumps(response), flush=True)


if __name__ == "__main__":
    main()
