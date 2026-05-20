# BookStore API (Go)

A deliberately simple Go REST API using only the standard library (`net/http`).
The project manages books, authors, and reviews. It contains several intentional
issues for participants to discover with AI assistance.

Run:

```bash
go mod download
go run .              # starts on :8080, seeds on first run
go run . --seed       # wipes and reseeds
go test ./...         # runs the test suite
```

Please read [preparation.md](preparation.md)
