import argparse
import sys

from bookstore.seed.seed import is_empty, run as run_seed
from bookstore.server import start_server
from bookstore.store.db import open_db


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", action="store_true", help="clear and reseed the database before starting")
    args = parser.parse_args()

    db = open_db("store.db")

    if args.seed:
        print("reseeding database...")
        db.executescript("DELETE FROM reviews; DELETE FROM books; DELETE FROM authors;")
        run_seed(db)
        print("reseed complete")
    elif is_empty(db):
        print("empty database — seeding initial data...")
        run_seed(db)
        print("seed complete")

    server = start_server(db, 8080)
    print(f"listening on :{server.server_port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
    return 0


if __name__ == "__main__":
    sys.exit(main())
