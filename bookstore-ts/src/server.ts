import type { Database } from "bun:sqlite";
import { AuthorStore } from "./store/author";
import { BookStore } from "./store/book";
import { ReviewStore } from "./store/review";
import { BookHandler } from "./handler/book";
import { AuthorHandler } from "./handler/author";
import { ReviewHandler } from "./handler/review";

export function buildRoutes(db: Database) {
  const books = new BookStore(db);
  const authors = new AuthorStore(db);
  const reviews = new ReviewStore(db);

  const bh = new BookHandler(books, authors);
  const ah = new AuthorHandler(authors);
  const rh = new ReviewHandler(reviews);

  return {
    "/api/books": {
      GET: bh.listBooks,
      POST: bh.createBook,
    },
    "/api/books/:id": {
      GET: bh.getBook,
      DELETE: bh.deleteBook,
    },
    "/api/books/:id/reviews": {
      GET: rh.listReviews,
      POST: rh.createReview,
    },
    "/api/authors": {
      GET: ah.listAuthors,
    },
    "/api/authors/:id": {
      GET: ah.getAuthor,
    },
  };
}

export function startServer(db: Database, port = 8080) {
  return Bun.serve({
    port,
    routes: buildRoutes(db) as any,
  });
}
