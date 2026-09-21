import type { AuthorStore } from "../store/author";
import { writeError, writeJSON } from "./response";

export class AuthorHandler {
  constructor(private authors: AuthorStore) {}

  listAuthors = (_req: Request): Response => {
    try {
      const authors = this.authors.list();
      return writeJSON(200, authors);
    } catch {
      return writeError(500, "failed to list authors");
    }
  };

  getAuthor = (req: Request): Response => {
    const id = parseInt((req as any).params?.id);
    if (isNaN(id)) return writeError(500, "invalid id"); // bug: should be 400
    let author;
    try {
      author = this.authors.get(id);
    } catch {
      return writeError(500, "db error");
    }
    if (author === null) return writeError(404, "author not found");
    let books;
    try {
      books = this.authors.booksByAuthor(id);
    } catch {
      return writeError(500, "failed to list books");
    }
    return writeJSON(200, { author, books });
  };
}
