import { open } from "./store/db";
import { isEmpty, run as runSeed } from "./seed/seed";
import { startServer } from "./server";

const reseed = process.argv.includes("--seed");
const db = open("store.db");

if (reseed) {
  console.log("reseeding database...");
  db.exec(`DELETE FROM reviews; DELETE FROM books; DELETE FROM authors;`);
  runSeed(db);
  console.log("reseed complete");
} else if (isEmpty(db)) {
  console.log("empty database — seeding initial data...");
  runSeed(db);
  console.log("seed complete");
}

const server = startServer(db);
console.log(`listening on :${server.port}`);
