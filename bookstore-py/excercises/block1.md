# Exercise 1: First Conversations

**Block**: 1 — First Steps & Core Concepts **Duration**: 30 minutes **Project**:
"BookStore API" — a Python 3 REST API using only the stdlib (`http.server`,
`sqlite3`). Everyone clones the same repo.

**Goal**: Get comfortable having productive conversations with AI in the IDE.

## Tasks

Do them in order, compare your AI's answers with your neighbor after each.

1. **Explain** — Open `bookstore/store/book.py`, select the `search()` method,
   ask: _"Explain what this function does step by step"_
   - Compare: did your AI catch the N+1 query problem?

2. **Find a bug** — Open `bookstore/handler/review.py`, select `create_review`,
   ask: _"Is there a bug in this function?"_
   - Expected find: no check whether the book exists before inserting a review

3. **Add validation** — Ask: _"Add input validation to create_review: rating
   must be 1-5, review_text must be between 10 and 500 characters"_
   - Compare: where did your AI put the validation? In the handler? A separate
     function? A dataclass / Pydantic-style schema?

4. **Reject and redirect** — Reject the suggestion and ask: _"No, extract the
   validation into a separate validate_review() function instead"_
   - Practice explicitly saying "no" and steering the AI

5. **Write a test** — Ask: _"Write a unit test for
   bookstore/util/pagination.py — the paginate() function — covering: empty
   result, first page, last page, page out of range, page size zero. Put it
   in tests/util/test_pagination.py and use unittest"_
   - Run `python3 -m unittest tests.util.test_pagination` — do they pass?
     Compare test cases across the group

6. **Refactor** — Ask: _"Refactor bookstore/server.py to group route
   definitions by resource using helper functions instead of one long list"_
   - Compare the before/after

7. **Context reset** — Use `/clear`, then ask: _"What HTTP status codes does
   this API return and which ones violate REST conventions?"_
   - Compare: how many status code issues did each AI find?

## Pair Discussion (5 min)

Share screens and compare with your partner. Where did answers differ? Which
were better? Why? Choose **one take-away** to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
