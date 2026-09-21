import type { Database } from "bun:sqlite";
import type { Review } from "../model/review";

export class ReviewStore {
  constructor(private db: Database) {}

  listByBook(bookID: number): Review[] {
    return this.db
      .query(
        `SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE book_id = ?`,
      )
      .all(bookID) as Review[];
  }

  create(bookID: number, rating: number, reviewText: string): Review {
    const res = this.db
      .query(`INSERT INTO reviews (book_id, rating, review_text) VALUES (?, ?, ?)`)
      .run(bookID, rating, reviewText);
    return this.db
      .query(
        `SELECT id, book_id, rating, review_text, created_at FROM reviews WHERE id = ?`,
      )
      .get(Number(res.lastInsertRowid)) as Review;
  }
}
