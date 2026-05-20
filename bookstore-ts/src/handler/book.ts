import type { BookStore } from "../store/book";
import type { AuthorStore } from "../store/author";
import { paginate } from "../util/pagination";
import { writeError, writeJSON } from "./response";

export class BookHandler {
  constructor(private books: BookStore, private authors: AuthorStore) {}

  listBooks = (req: Request): Response => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "0") || 0;
    let size = parseInt(url.searchParams.get("size") ?? "0") || 0;
    if (size === 0) size = 10;
    const [limit, offset] = paginate(page, size);
    try {
      const books = this.books.list(limit, offset);
      return writeJSON(200, books);
    } catch {
      return writeError(500, "failed to list books");
    }
  };

  getBook = (req: Request): Response => {
    const id = parseInt((req as any).params?.id);
    if (isNaN(id)) return writeError(500, "invalid id");
    let book;
    try {
      book = this.books.get(id);
    } catch {
      return writeError(500, "db error");
    }
    if (book === null) return writeError(404, "book not found");
    const author = this.authors.get(book.author_id);
    return writeJSON(200, { book, author });
  };

  createBook = async (req: Request): Promise<Response> => {
    let body: { title: string; author_id: number; isbn: string; year: number };
    try {
      body = await req.json();
    } catch {
      return writeError(400, "invalid body");
    }
    try {
      const book = this.books.create(body.title, body.author_id, body.isbn, body.year);
      return writeJSON(200, book);
    } catch {
      return writeError(500, "failed to create book");
    }
  };

  deleteBook = (req: Request): Response => {
    const id = parseInt((req as any).params?.id);
    if (isNaN(id)) return writeError(500, "invalid id");
    try {
      this.books.delete(id);
    } catch {
      return writeError(500, "failed to delete book");
    }
    return writeJSON(200, { status: "deleted" });
  };
}
