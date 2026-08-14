package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/xebia/ai-assisted-se-claude-exercise/internal/handler"
	"github.com/xebia/ai-assisted-se-claude-exercise/internal/seed"
	"github.com/xebia/ai-assisted-se-claude-exercise/internal/store"
)

func main() {
	reseed := flag.Bool("seed", false, "clear and reseed the database before starting")
	flag.Parse()

	db, err := store.Open("store.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if *reseed {
		log.Println("reseeding database...")
		if _, err := db.Exec(`DELETE FROM reviews; DELETE FROM books; DELETE FROM authors`); err != nil {
			log.Fatal(err)
		}
		if err := seed.Run(db); err != nil {
			log.Fatal(err)
		}
		log.Println("reseed complete")
	} else if empty, err := seed.IsEmpty(db); err != nil {
		log.Fatal(err)
	} else if empty {
		log.Println("empty database — seeding initial data...")
		if err := seed.Run(db); err != nil {
			log.Fatal(err)
		}
		log.Println("seed complete")
	}

	books := store.NewBookStore(db)
	authors := store.NewAuthorStore(db)
	reviews := store.NewReviewStore(db)

	bh := handler.NewBookHandler(books, authors)
	ah := handler.NewAuthorHandler(authors)
	rh := handler.NewReviewHandler(reviews)

	http.HandleFunc("GET /api/books", bh.ListBooks)
	http.HandleFunc("GET /api/books/{id}", bh.GetBook)
	http.HandleFunc("POST /api/books", bh.CreateBook)
	http.HandleFunc("DELETE /api/books/{id}", bh.DeleteBook)
	http.HandleFunc("GET /api/books/{id}/reviews", rh.ListReviews)
	http.HandleFunc("POST /api/books/{id}/reviews", rh.CreateReview)
	http.HandleFunc("GET /api/authors", ah.ListAuthors)
	http.HandleFunc("GET /api/authors/{id}", ah.GetAuthor)

	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
