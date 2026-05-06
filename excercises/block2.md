# Exercise 2: Bug Fixing & Code Understanding

**Block**: 2 — Understanding Codebases & Bug Fixing **Duration**: 30 minutes
**Project**: Same BookStore API. The test suite has deliberate failures baked
in.

**Goal**: Use AI to systematically find and fix bugs by working through failing
tests.

## Tasks

1. **Run the test suite** (1 min) — run `go test ./...` and note every failing
   test. Write down the list. Compare with your neighbor — you should both see
   the same failures.

2. **Understand the project first** (2 min) — before fixing anything, ask:
   _"Give me an overview of the BookStore API: folder structure, how a request
   flows from main.go through to the database, and what each package is
   responsible for"_
   - Compare summaries. Did your AI explain the handler → store layering
     correctly?

3. **Fix: `TestPaginateZeroPage` and `TestPaginateNegativePage`** (4 min)
   - Open `internal/util/pagination.go`, select `Paginate()`, paste the test
     output, ask: _"This test is failing. Explain why and fix the function"_
   - Run `go test ./internal/util/...` — both tests must pass before moving on.
   - Compare fixes: what guard did your AI add? Where exactly?

4. **Fix: `TestCreateBookReturns201` and `TestDeleteBookReturns204`** (3 min)
   - Open `internal/handler/book.go`, paste both test failures, ask: _"These two
     tests are failing. What are the correct HTTP status codes and why?"_
   - Apply the fixes. Run `go test ./internal/handler/...`.
   - Compare: did your AI explain _why_ REST conventions require 201 and 204?

5. **Fix: `TestCreateReviewNonexistentBook`** (4 min) — use plan mode for this
   one.
   - Paste the failing test output and ask: _"Think through what needs to change
     to make this test pass — don't write any code yet, just explain the steps"_
   - Review the plan, then ask: _"Now implement it"_
   - Run `go test ./internal/handler/...`.
   - Compare: did your AI add the existence check in the handler or the store?

6. **Fix: `TestCreateReviewValidation`** (3 min)
   - Paste the 4 failing subtests, ask: _"All four subtests are failing. Where
     should this validation live and how should it be implemented?"_
   - Discuss the answer with your neighbor before accepting it — handler,
     middleware, or store?
   - Implement, run `go test ./internal/handler/...` — all 4 subtests must pass.

7. **Hunt the hidden bug** (2 min) — one bug has no failing test. Ask: _"Are
   there any other bugs or code quality issues in this codebase that the tests
   don't catch?"_
   - Compare: did your AI find it? What was it?

8. **Final check** (1 min) — run `go test ./...`. All tests should now pass. If
   not, share the remaining failure with your AI and fix it.

## Pair Discussion (5 min)

Compare with your partner: which bug was hardest to fix? Did plan mode make a
difference on bug 5? What did the AI miss? Choose **one take-away** to present
to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
