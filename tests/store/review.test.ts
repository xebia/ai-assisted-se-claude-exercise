import { expect, test, describe } from "bun:test";
import { AuthorStore } from "../../src/store/author";
import { BookStore } from "../../src/store/book";
import { ReviewStore } from "../../src/store/review";
import { newTestDB } from "../helpers";

describe("ReviewStore", () => {
  test("create", () => {
    const db = newTestDB();
    const as = new AuthorStore(db);
    const bs = new BookStore(db);
    const rs = new ReviewStore(db);
    const author = as.create("Author", "");
    const book = bs.create("Book", author.id, "", 2000);
    const r = rs.create(book.id, 5, "Excellent read.");
    expect(r.id).toBeGreaterThan(0);
    expect(r.rating).toBe(5);
    expect(r.book_id).toBe(book.id);
  });

  describe("listByBook", () => {
    function setup() {
      const db = newTestDB();
      const as = new AuthorStore(db);
      const bs = new BookStore(db);
      const rs = new ReviewStore(db);
      const author = as.create("Author", "");
      const book1 = bs.create("Book 1", author.id, "", 2000);
      const book2 = bs.create("Book 2", author.id, "", 2001);
      rs.create(book1.id, 5, "Great.");
      rs.create(book1.id, 3, "Average.");
      rs.create(book2.id, 4, "Good.");
      return { rs, book1, book2 };
    }

    test("book1 has two reviews", () => {
      const { rs, book1 } = setup();
      expect(rs.listByBook(book1.id).length).toBe(2);
    });
    test("book2 has one review", () => {
      const { rs, book2 } = setup();
      expect(rs.listByBook(book2.id).length).toBe(1);
    });
    test("unknown book returns empty slice", () => {
      const { rs } = setup();
      expect(rs.listByBook(99999).length).toBe(0);
    });
  });
});
