import type { Database } from "bun:sqlite";
import type { Book } from "../model/book";
import type { Author } from "../model/author";

export class BookStore {
  constructor(private db: Database) {}

  // Search returns books matching query, with author details for each result.
  search(query: string): { book: Book; author: Author | null }[] {
    const books = this.db
      .query(
        `SELECT id, title, author_id, isbn, year, created_at FROM books WHERE title LIKE ?`,
      )
      .all(`%${query}%`) as Book[];

    const results: { book: Book; author: Author | null }[] = [];
    for (const b of books) {
      const a = this.db
        .query(`SELECT id, name, bio FROM authors WHERE id = ?`)
        .get(b.author_id) as Author | null;
      results.push({ book: b, author: a ?? null });
    }
    return results;
  }

  list(limit: number, offset: number): Book[] {
    return this.db
      .query(
        `SELECT id, title, author_id, isbn, year, created_at FROM books LIMIT ? OFFSET ?`,
      )
      .all(limit, offset) as Book[];
  }

  get(id: number): Book | null {
    const row = this.db
      .query(
        `SELECT id, title, author_id, isbn, year, created_at FROM books WHERE id = ?`,
      )
      .get(id) as Book | null;
    return row ?? null;
  }

  create(title: string, authorID: number, isbn: string, year: number): Book {
    const res = this.db
      .query(`INSERT INTO books (title, author_id, isbn, year) VALUES (?, ?, ?, ?)`)
      .run(title, authorID, isbn, year);
    return this.get(Number(res.lastInsertRowid))!;
  }

  delete(id: number): void {
    this.db.query(`DELETE FROM books WHERE id = ?`).run(id);
  }
}
