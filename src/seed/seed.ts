import type { Database } from "bun:sqlite";
import { AuthorStore } from "../store/author";
import { BookStore } from "../store/book";
import { ReviewStore } from "../store/review";

export function run(db: Database): void {
  const authors = new AuthorStore(db);
  const books = new BookStore(db);
  const reviews = new ReviewStore(db);

  const authorSeeds: { name: string; bio: string }[] = [
    { name: "George Orwell", bio: "English novelist and essayist." },
    { name: "Ursula K. Le Guin", bio: "American author of speculative fiction." },
    { name: "Cormac McCarthy", bio: "American novelist and playwright." },
    { name: "Toni Morrison", bio: "American novelist and Nobel laureate." },
    { name: "Haruki Murakami", bio: "Japanese author of surrealist fiction." },
  ];

  const authorIDs = authorSeeds.map((a) => authors.create(a.name, a.bio).id);

  const bookSeeds: { title: string; isbn: string; year: number; authorIdx: number }[] = [
    { title: "1984", isbn: "978-0451524935", year: 1949, authorIdx: 0 },
    { title: "Animal Farm", isbn: "978-0451526342", year: 1945, authorIdx: 0 },
    { title: "Homage to Catalonia", isbn: "978-0156421171", year: 1938, authorIdx: 0 },
    { title: "The Left Hand of Darkness", isbn: "978-0441478125", year: 1969, authorIdx: 1 },
    { title: "The Dispossessed", isbn: "978-0061054884", year: 1974, authorIdx: 1 },
    { title: "A Wizard of Earthsea", isbn: "978-0547773742", year: 1968, authorIdx: 1 },
    { title: "Blood Meridian", isbn: "978-0679728757", year: 1985, authorIdx: 2 },
    { title: "No Country for Old Men", isbn: "978-0307387899", year: 2005, authorIdx: 2 },
    { title: "The Road", isbn: "978-0307387899", year: 2006, authorIdx: 2 },
    { title: "Beloved", isbn: "978-1400033416", year: 1987, authorIdx: 3 },
    { title: "Song of Solomon", isbn: "978-1400033423", year: 1977, authorIdx: 3 },
    { title: "Sula", isbn: "978-1400033430", year: 1973, authorIdx: 3 },
    { title: "Norwegian Wood", isbn: "978-0375704024", year: 1987, authorIdx: 4 },
    { title: "Kafka on the Shore", isbn: "978-1400079278", year: 2002, authorIdx: 4 },
    { title: "The Wind-Up Bird Chronicle", isbn: "978-0679775430", year: 1994, authorIdx: 4 },
  ];

  const bookIDs = bookSeeds.map(
    (b) => books.create(b.title, authorIDs[b.authorIdx]!, b.isbn, b.year).id,
  );

  const reviewSeeds: { bookIdx: number; rating: number; reviewText: string }[] = [
    { bookIdx: 0, rating: 5, reviewText: "A chilling vision of totalitarianism." },
    { bookIdx: 1, rating: 4, reviewText: "A sharp political allegory." },
    { bookIdx: 3, rating: 5, reviewText: "A masterpiece of speculative fiction." },
    { bookIdx: 6, rating: 4, reviewText: "Brutal and poetic." },
    { bookIdx: 8, rating: 5, reviewText: "Haunting and unforgettable." },
    { bookIdx: 9, rating: 5, reviewText: "Morrison at her very best." },
    { bookIdx: 12, rating: 4, reviewText: "Melancholic and beautifully written." },
    { bookIdx: 13, rating: 3, reviewText: "Imaginative but occasionally meandering." },
    { bookIdx: 14, rating: 5, reviewText: "Surreal and utterly gripping." },
    { bookIdx: 4, rating: 4, reviewText: "A profound meditation on freedom." },
  ];

  for (const rv of reviewSeeds) {
    reviews.create(bookIDs[rv.bookIdx]!, rv.rating, rv.reviewText);
  }
}

export function isEmpty(db: Database): boolean {
  const row = db.query(`SELECT COUNT(*) AS n FROM authors`).get() as { n: number };
  return row.n === 0;
}
