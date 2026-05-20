import { expect, test, describe } from "bun:test";
import { AuthorStore } from "../../src/store/author";
import { BookStore } from "../../src/store/book";
import { newTestDB } from "../helpers";

describe("AuthorStore", () => {
  test("create", () => {
    const s = new AuthorStore(newTestDB());
    const a = s.create("Ursula K. Le Guin", "American author of speculative fiction.");
    expect(a.id).toBeGreaterThan(0);
    expect(a.name).toBe("Ursula K. Le Guin");
  });

  describe("get", () => {
    test("exists", () => {
      const s = new AuthorStore(newTestDB());
      const created = s.create("George Orwell", "English novelist.");
      const got = s.get(created.id);
      expect(got).not.toBeNull();
      expect(got!.name).toBe(created.name);
    });

    test("not found", () => {
      const s = new AuthorStore(newTestDB());
      const got = s.get(99999);
      expect(got).toBeNull();
    });
  });

  test("list", () => {
    const s = new AuthorStore(newTestDB());
    s.create("Author A", "");
    s.create("Author B", "");
    s.create("Author C", "");
    expect(s.list().length).toBe(3);
  });

  test("booksByAuthor", () => {
    const db = newTestDB();
    const as = new AuthorStore(db);
    const bs = new BookStore(db);
    const author = as.create("Toni Morrison", "");
    bs.create("Beloved", author.id, "978-0", 1987);
    bs.create("Sula", author.id, "978-1", 1973);
    expect(as.booksByAuthor(author.id).length).toBe(2);
  });
});
