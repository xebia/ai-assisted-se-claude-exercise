# Exercise 2: Bug Fixing & Code Understanding

**Block**: 2 — Understanding Codebases & Bug Fixing **Duration**: 30 minutes
**Project**: Same BookStore API. The test suite has deliberate failures baked
in.

**Goal**: Use AI to systematically find and fix bugs by working through failing
tests.

## Tasks

1. **Run the test suite** (1 min) — run `python3 -m unittest` and note every
   failing test. Write down the list. Compare with your neighbor — you should
   both see the same failures.

2. **Understand the project first** (2 min) — before fixing anything, ask:
   _"Give me an overview of the BookStore API: package structure, how a
   request flows from main.py through to the database, and what each module
   is responsible for"_
   - Compare summaries. Did your AI explain the handler → store layering
     correctly?

3. **Fix pagination for zero/negative pages** (4 min)
   - Open `bookstore/util/pagination.py`, select `paginate()`, ask: _"What
     happens when page is 0 or negative? Add tests for those cases in
     tests/util/test_pagination.py, watch them fail, then fix the function"_
   - Run `python3 -m unittest tests.util.test_pagination` — both new tests
     must pass before moving on.
   - Compare fixes: what guard did your AI add? Where exactly?

4. **Fix: `test_create_book_returns_201` and `test_delete_book_returns_204`**
   (3 min)
   - Open `bookstore/handler/book.py`, paste both test failures, ask: _"These
     two tests are failing. What are the correct HTTP status codes and why?"_
   - Apply the fixes. Run `python3 -m unittest tests.handler.test_book`.
   - Compare: did your AI explain _why_ REST conventions require 201 and 204?

5. **Fix: `test_create_review_nonexistent_book`** (4 min) — use plan mode for
   this one.
   - Paste the failing test output and ask: _"Think through what needs to
     change to make this test pass — don't write any code yet, just explain
     the steps"_
   - Review the plan, then ask: _"Now implement it"_
   - Run `python3 -m unittest tests.handler.test_review`.
   - Compare: did your AI add the existence check in the handler or the store?

6. **Fix: `test_create_review_validation`** (3 min)
   - Paste the 4 failing subtests, ask: _"All four subtests are failing. Where
     should this validation live and how should it be implemented?"_
   - Discuss the answer with your neighbor before accepting it — handler,
     middleware, or store?
   - Implement, run `python3 -m unittest tests.handler.test_review` — all 4
     subtests must pass.

7. **Hunt the hidden bug** (2 min) — one bug has no failing test. Ask: _"Are
   there any other bugs or code quality issues in this codebase that the
   tests don't catch?"_
   - Compare: did your AI find it? What was it?

8. **Final check** (1 min) — run `python3 -m unittest`. All tests should now
   pass. If not, share the remaining failure with your AI and fix it.

## Pair Discussion (5 min)

Compare with your partner: which bug was hardest to fix? Did plan mode make a
difference on bug 5? What did the AI miss? Choose **one take-away** to present
to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
