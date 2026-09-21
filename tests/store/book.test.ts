import { expect, test, describe } from "bun:test";
import { AuthorStore } from "../../src/store/author";
import { BookStore } from "../../src/store/book";
import { newTestDB } from "../helpers";

describe("BookStore", () => {
  test("create", () => {
    const db = newTestDB();
    const as = new AuthorStore(db);
    const bs = new BookStore(db);
    const author = as.create("Cormac McCarthy", "");
    const book = bs.create("Blood Meridian", author.id, "978-0679728757", 1985);
    expect(book.id).toBeGreaterThan(0);
    expect(book.title).toBe("Blood Meridian");
    expect(book.author_id).toBe(author.id);
  });

  describe("get", () => {
    test("exists", () => {
      const db = newTestDB();
      const as = new AuthorStore(db);
      const bs = new BookStore(db);
      const author = as.create("Haruki Murakami", "");
      const created = bs.create("Norwegian Wood", author.id, "978-0", 1987);
      const got = bs.get(created.id);
      expect(got).not.toBeNull();
      expect(got!.title).toBe("Norwegian Wood");
    });

    test("not found", () => {
      const db = newTestDB();
      const bs = new BookStore(db);
      expect(bs.get(99999)).toBeNull();
    });
  });

  describe("list", () => {
    function setup() {
      const db = newTestDB();
      const as = new AuthorStore(db);
      const bs = new BookStore(db);
      const author = as.create("Author", "");
      bs.create("Book 1", author.id, "", 2000);
      bs.create("Book 2", author.id, "", 2001);
      bs.create("Book 3", author.id, "", 2002);
      return bs;
    }

    test("all", () => {
      expect(setup().list(10, 0).length).toBe(3);
    });
    test("limit", () => {
      expect(setup().list(2, 0).length).toBe(2);
    });
    test("offset", () => {
      expect(setup().list(10, 2).length).toBe(1);
    });
  });

  test("delete", () => {
    const db = newTestDB();
    const as = new AuthorStore(db);
    const bs = new BookStore(db);
    const author = as.create("Author", "");
    const book = bs.create("To Delete", author.id, "", 2000);
    bs.delete(book.id);
    expect(bs.get(book.id)).toBeNull();
  });

  // BookSearch documents the N+1 query behaviour in search().
  // The test verifies correctness; the N+1 issue is a performance bug, not a logic bug.
  describe("search", () => {
    function setup() {
      const db = newTestDB();
      const as = new AuthorStore(db);
      const bs = new BookStore(db);
      const author = as.create("George Orwell", "");
      bs.create("1984", author.id, "", 1949);
      bs.create("Animal Farm", author.id, "", 1945);
      bs.create("Homage to Catalonia", author.id, "", 1938);
      return bs;
    }

    test("matches title", () => {
      expect(setup().search("1984").length).toBe(1);
    });
    test("partial match", () => {
      expect(setup().search("a").length).toBeGreaterThanOrEqual(2);
    });
    test("no match", () => {
      expect(setup().search("zzznomatch").length).toBe(0);
    });
  });
});
