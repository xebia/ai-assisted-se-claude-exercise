import type { Database } from "bun:sqlite";
import type { Author } from "../model/author";
import type { Book } from "../model/book";

export class AuthorStore {
  constructor(private db: Database) {}

  list(): Author[] {
    return this.db.query(`SELECT id, name, bio FROM authors`).all() as Author[];
  }

  get(id: number): Author | null {
    const row = this.db
      .query(`SELECT id, name, bio FROM authors WHERE id = ?`)
      .get(id) as Author | null;
    return row ?? null;
  }

  booksByAuthor(authorID: number): Book[] {
    return this.db
      .query(
        `SELECT id, title, author_id, isbn, year, created_at FROM books WHERE author_id = ?`,
      )
      .all(authorID) as Book[];
  }

  create(name: string, bio: string): Author {
    const res = this.db
      .query(`INSERT INTO authors (name, bio) VALUES (?, ?)`)
      .run(name, bio);
    return this.get(Number(res.lastInsertRowid))!;
  }
}
