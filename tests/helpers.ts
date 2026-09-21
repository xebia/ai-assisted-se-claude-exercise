import { open } from "../src/store/db";
import { startServer } from "../src/server";
import { AuthorStore } from "../src/store/author";
import { BookStore } from "../src/store/book";
import { ReviewStore } from "../src/store/review";

export function newTestDB() {
  return open(":memory:");
}

export function newTestServer() {
  const db = newTestDB();
  const server = startServer(db, 0);
  const base = `http://localhost:${server.port}`;
  const books = new BookStore(db);
  const authors = new AuthorStore(db);
  const reviews = new ReviewStore(db);
  return {
    base,
    db,
    books,
    authors,
    reviews,
    stop: () => server.stop(true),
  };
}
