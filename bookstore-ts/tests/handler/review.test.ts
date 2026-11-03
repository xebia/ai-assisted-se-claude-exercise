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

describe("ListReviews", () => {
  test("returns 200 and reviews", async () => {
    const { base, books, authors, reviews } = setup();
    const a = authors.create("Author", "");
    const b = books.create("Book", a.id, "", 2000);
    reviews.create(b.id, 5, "Great read.");
    reviews.create(b.id, 3, "It was okay.");
    const res = await fetch(`${base}/api/books/${b.id}/reviews`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body.length).toBe(2);
  });
});

test("CreateReview returns 201", async () => {
  const { base, books, authors } = setup();
  const a = authors.create("Author", "");
  const b = books.create("Book", a.id, "", 2000);
  const res = await fetch(`${base}/api/books/${b.id}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: 4, review_text: "Solid book." }),
  });
  expect(res.status).toBe(201);
});

// posting a review for a non-existent book should return 404.
test("CreateReview for non-existent book returns 404", async () => {
  const { base } = setup();
  const res = await fetch(`${base}/api/books/99999/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating: 5, review_text: "Orphaned review." }),
  });
  expect(res.status).toBe(404);
});

// invalid rating and review_text values should return 400.
describe("CreateReview validation", () => {
  const cases: { name: string; rating: number; text: string }[] = [
    { name: "zero rating", rating: 0, text: "Some text here." },
    { name: "negative rating", rating: -1, text: "Some text here." },
    { name: "huge rating", rating: 999, text: "Some text here." },
    { name: "empty text", rating: 3, text: "" },
  ];

  for (const tc of cases) {
    test(tc.name, async () => {
      const { base, books, authors } = setup();
      const a = authors.create("Author", "");
      const b = books.create("Book", a.id, "", 2000);
      const res = await fetch(`${base}/api/books/${b.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: tc.rating, review_text: tc.text }),
      });
      expect(res.status).toBe(400);
    });
  }
});
