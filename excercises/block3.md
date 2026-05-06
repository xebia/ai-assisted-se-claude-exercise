# Exercise 3: Context Engineering in Practice

**Block**: 3 — Context Engineering **Duration**: 30 minutes **Project**: Same
BookStore API.

**Goal**: Experience how context quality directly affects AI output quality —
using the same codebase you already know.

## Tasks

1. **Create a CLAUDE.md for BookStore** (5 min) — start a fresh chat, then ask:
   _"Analyze this project and help me write a CLAUDE.md"_
   - It should include: Go + net/http (no frameworks), handler → store layering,
     test conventions, how to run tests
   - Add these rules: _"All handlers must validate input before calling the
     store. All new endpoints need tests. Use table-driven tests. Never add
     external dependencies."_
   - Save it, start a new chat, and verify the AI references your rules when you
     go further in this exercise

2. **Poor prompt → good prompt** (5 min) — compare these two prompts:
   - **Vague:** _"Add caching to the BookStore API"_ — observe: where does it
     add caching? Does it add Redis? A new dependency? Does it match the
     project's no-dependencies rule?
   - **Specific:** _"Add in-memory caching to GetBook in internal/store/book.go
     using a sync.Map. Cache entries should expire after 5 minutes. Invalidate
     the cache entry when a book is updated or deleted. No external
     dependencies. Write table-driven tests in internal/store/book_test.go
     covering: cache miss, cache hit, and cache invalidation after update."_
   - Compare the two outputs side by side with your neighbor

3. **Context pollution experiment** (5 min):
   - In a single chat, do all of these without clearing: ask to explain
     pagination, then reviews, then book search, then the handler layering
   - Check `/context` — how full is the window?
   - Now ask it to _"add a DELETE /reviews/{id} endpoint"_
   - Now `/clear` and ask the same DELETE endpoint question in a fresh chat
   - Compare: which response better follows the existing patterns in
     `internal/handler/review.go`?

4. **Verification criteria** (5 min) — write and test these prompts:
   - _"Add a GetBooksByAuthor function to internal/store/book.go that filters by
     exact author match. Write a test that creates 3 books by 'Author A' and 2
     by 'Author B', then asserts GetBooksByAuthor('Author A') returns exactly 3
     results. Run `go test ./internal/store/...` and confirm it passes."_
   - _"The Paginate function in internal/util/pagination.go should return an
     empty slice (not nil) when the input slice is empty. Write a test that
     asserts `len(result) == 0 && result != nil`. Run the test."_
   - Compare: how did adding explicit pass/fail criteria change the AI's
     behavior?

## Pair Discussion (5 min)

Show your CLAUDE.md to your partner. Which rules made the biggest difference?
When did the vague prompt produce something surprisingly wrong? Choose **one
take-away** to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
