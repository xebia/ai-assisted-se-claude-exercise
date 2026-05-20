# BookStore API (Python 3)

A deliberately simple Python 3 REST API using only the standard library
(`http.server`, `sqlite3`, `unittest`). The project manages books, authors, and
reviews. It contains several intentional issues for participants to discover
with AI assistance.

Requires Python 3.10+.

Run:

```bash
python3 main.py            # starts on :8080, seeds on first run
python3 main.py --seed     # wipes and reseeds
python3 -m unittest        # runs the test suite
```

Please read [preparation.md](preparation.md)
