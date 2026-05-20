# BookStore API (TypeScript / Bun)

A deliberately simple TypeScript REST API using only Bun's standard runtime
(`Bun.serve`, `bun:sqlite`, `bun test`). The project manages books, authors, and
reviews. It contains several intentional issues for participants to discover
with AI assistance.

Run:

```bash
bun install
bun run start          # starts on :8080, seeds on first run
bun run start --seed   # wipes and reseeds
bun test               # runs the test suite
```

Please read [preparation.md](preparation.md)
