# Exercise 3: Context Engineering in Practice

**Block**: 3 — Context Engineering **Duration**: 30 minutes **Project**: Same
BookStore API.

**Goal**: Experience how context quality directly affects AI output quality —
using the same codebase you already know.

## Tasks

1. **Create a CLAUDE.md for BookStore** (5 min) — start a fresh chat, then ask:
   _"Analyze this project and help me write a CLAUDE.md"_
   - It should include: Kotlin/JVM using only the JDK HTTP server and JDBC
     (no frameworks; sqlite-jdbc is the only library), handler → store
     layering, test conventions (custom @Test annotation + custom runner),
     how to run tests via `./test.sh`
   - Add these rules: _"All handlers must validate input before calling the
     store. All new endpoints need tests. Never add external dependencies
     beyond sqlite-jdbc."_
   - Save it, start a new chat, and verify the AI references your rules when
     you go further in this exercise

2. **Poor prompt → good prompt** (5 min) — compare these two prompts:
   - **Vague:** _"Add caching to the BookStore API"_ — observe: where does it
     add caching? Does it pull in Caffeine or a Redis client? A new
     dependency? Does it match the project's minimal-dependencies rule?
   - **Specific:** _"Add in-memory caching to the get() method in
     src/main/kotlin/bookstore/store/BookStore.kt using a plain HashMap.
     Cache entries should expire after 5 minutes. Invalidate the cache entry
     when a book is updated or deleted. No external dependencies. Write tests
     in src/test/kotlin/bookstore/store/BookStoreTest.kt covering: cache
     miss, cache hit, and cache invalidation after update."_
   - Compare the two outputs side by side with your neighbor

3. **Context pollution experiment** (5 min):
   - In a single chat, do all of these without clearing: ask to explain
     pagination, then reviews, then book search, then the handler layering
   - Check `/context` — how full is the window?
   - Now ask it to _"add a DELETE /reviews/{id} endpoint"_
   - Now `/clear` and ask the same DELETE endpoint question in a fresh chat
   - Compare: which response better follows the existing patterns in
     `src/main/kotlin/bookstore/handler/ReviewHandler.kt`?

4. **Verification criteria** (5 min) — write and test these prompts:
   - _"Add a booksByAuthorName function to
     src/main/kotlin/bookstore/store/BookStore.kt that filters by exact
     author match. Write a test that creates 3 books by 'Author A' and 2 by
     'Author B', then asserts booksByAuthorName('Author A') returns exactly
     3 results. Run `./test.sh` and confirm it passes."_
   - _"The paginate function in src/main/kotlin/bookstore/util/Pagination.kt
     should return (size, 0) (not negative offsets) when page is 0 or
     negative. Write a test that asserts the offset is non-negative for
     page=0 and page=-1. Run the test."_
   - Compare: how did adding explicit pass/fail criteria change the AI's
     behavior?

## Pair Discussion (5 min)

Show your CLAUDE.md to your partner. Which rules made the biggest difference?
When did the vague prompt produce something surprisingly wrong? Choose **one
take-away** to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
