# Exercise 4: Build a Feature End-to-End

**Block**: 4 — Real Development Workflows **Duration**: 30 minutes **Project**:
Same BookStore API.

**Goal**: Apply the full Research → Plan → Implement workflow using spec
documents in a `spec/` folder — no special tooling, just markdown.

## Tasks

1. **Create the spec** (4 min) — ask AI: _"Create a specification document in
   `spec/search-endpoint.md` that describes a GET /books/search endpoint. It
   should accept query params: author (exact match), title (substring match),
   minRating (number, filters reviews average). Results must be paginated
   using the existing paginate() function. Include: goal, API contract
   (request/response), acceptance criteria, and out-of-scope items."_
   - Review the spec — does it match how existing endpoints work in
     `src/handler/book.ts`? Push back on anything that doesn't fit.

2. **Research phase** (4 min) — ask AI: _"Read the spec in
   spec/search-endpoint.md. Then analyze the existing codebase to understand:
   how are handlers structured in src/handler/book.ts, how does the store
   layer work in src/store/book.ts, and how is paginate() used. Write a
   research summary in `spec/search-research.md` listing: existing patterns to
   follow, files to modify, and any gaps between the spec and the current
   codebase."_
   - Compare research docs with your neighbor — did the AI catch the same
     patterns?

3. **Planning phase** (4 min) — ask AI: _"Based on spec/search-endpoint.md and
   spec/search-research.md, create an implementation plan in
   `spec/search-plan.md`. List exact steps with file names, function names,
   and what each step does. Include test steps. The plan should follow the
   handler → store layering used by existing endpoints."_
   - Review the plan — reject steps that add external dependencies or break
     the existing patterns. Iterate until the plan matches your CLAUDE.md
     rules.

4. **Implementation phase** (6 min) — ask AI: _"Implement the plan in
   spec/search-plan.md step by step. After each step, run the relevant tests.
   Write tests in tests/handler/book.test.ts covering: search by author,
   search by title substring, filter by minRating, combined filters, empty
   results, and pagination. Run `bun test` after each change."_
   - Use the "fix until green" pattern — share failures with AI until all
     tests pass

5. **Review** (2 min) — ask AI: _"Compare the implementation against
   spec/search-endpoint.md. Are all acceptance criteria met? Are there any
   gaps? Generate a PR description summarizing what was built and how it was
   verified."_

## Pair Discussion (5 min)

Compare your `spec/` folders side by side with your partner. How did the spec
documents change the quality of the AI's output? Did anyone's AI deviate from
the plan? How useful was the research doc? Choose **one take-away** to present
to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
