import { expect, test, describe, afterEach } from "bun:test";
import { newTestServer } from "../helpers";

let env: ReturnType<typeof newTestServer> | null = null;

afterEach(() => {
  env?.stop();
  env = null;
});

function setup() {
  env = newTestServer();
  return env;
}

describe("ListBooks", () => {
  test("returns 200 and lists books", async () => {
    const { base, books, authors } = setup();
    const a = authors.create("Author", "");
    books.create("Book A", a.id, "", 2000);
    books.create("Book B", a.id, "", 2001);

    const res = await fetch(`${base}/api/books`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body.length).toBe(2);
  });
});

describe("GetBook", () => {
  test("found", async () => {
    const { base, books, authors } = setup();
    const a = authors.create("Author", "");
    const b = books.create("1984", a.id, "", 1949);

    const res = await fetch(`${base}/api/books/${b.id}`);
    expect(res.status).toBe(200);
  });

  test("not found", async () => {
    const { base } = setup();
    const res = await fetch(`${base}/api/books/99999`);
    expect(res.status).toBe(404);
  });
});

// TestCreateBookReturns201: POST /api/books should return 201 Created.
test("CreateBook returns 201", async () => {
  const { base, authors } = setup();
  const a = authors.create("Author", "");
  const res = await fetch(`${base}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "New Book", author_id: a.id, isbn: "978-x", year: 2024 }),
  });
  expect(res.status).toBe(201);
});

// TestDeleteBookReturns204: DELETE /api/books/{id} should return 204 No Content with no body.
test("DeleteBook returns 204", async () => {
  const { base, books, authors } = setup();
  const a = authors.create("Author", "");
  const b = books.create("To Delete", a.id, "", 2000);

  const res = await fetch(`${base}/api/books/${b.id}`, { method: "DELETE" });
  expect(res.status).toBe(204);
  const text = await res.text();
  expect(text).toBe("");
});

test("CreateBook invalid body returns 400", async () => {
  const { base } = setup();
  const res = await fetch(`${base}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not json",
  });
  expect(res.status).toBe(400);
});
