// Test helpers for handler tests: apiTest(), builders (anAuthor, aBook,
// aReview), request helpers (get, post, delete) and response checks
// (expectStatus, expectJson).

import { expect, test } from "bun:test";
import { newTestServer } from "./helpers";

type Env = ReturnType<typeof newTestServer>;

/** Registers a test that runs against a fresh in-memory API. */
export function apiTest(name: string, fn: (api: Api) => Promise<void>) {
  test(name, async () => {
    const env = newTestServer();
    try {
      await fn(new Api(env));
    } finally {
      env.stop();
    }
  });
}

export class Api {
  constructor(readonly env: Env) {}

  anAuthor(name = "An author") {
    return this.env.authors.create(name, "");
  }

  /** Creates a book with the given title, and an author for it. */
  aBook(title = "A book", year = 2000) {
    const author = this.anAuthor(`Author of ${title}`);
    return this.env.books.create(title, author.id, "", year);
  }

  aReview(book: { id: number }, rating = 4) {
    return this.env.reviews.create(book.id, rating, "A review written by the test kit.");
  }

  get(path: string) {
    return this.send("GET", path);
  }

  delete(path: string) {
    return this.send("DELETE", path);
  }

  post(path: string, body: unknown) {
    return this.send("POST", path, body);
  }

  private async send(method: string, path: string, body?: unknown) {
    const res = await fetch(`${this.env.base}${path}`, {
      method,
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return new Resp(res.status, await res.text());
  }
}

/** One response, with chainable checks. */
export class Resp {
  constructor(readonly status: number, readonly body: string) {}

  expectStatus(expected: number) {
    expect(this.status, `status; body: ${this.body}`).toBe(expected);
    return this;
  }

  expectJson(field: string, expected: unknown) {
    const obj = JSON.parse(this.body) as Record<string, unknown>;
    expect(String(obj[field]), `${field}; body: ${this.body}`).toBe(String(expected));
    return this;
  }
}
