# Exercise 2: Bug Fixing & Code Understanding

**Block**: 2 — Understanding Codebases & Bug Fixing **Duration**: 30 minutes
**Project**: Same BookStore API. The test suite has deliberate failures baked
in.

**Goal**: Use AI to systematically find and fix bugs by working through failing
tests — and practice deciding what to ask, not just what to paste.

**Note**: This project now has a `CLAUDE.md` in training mode. Your AI will
push back with a question before handing you an answer, and will investigate
the code by searching rather than reading whole files — closer to how it'd
have to behave in a codebase too large to load in one shot. If you're
genuinely stuck or short on time, say "just tell me" and it'll drop that and
answer directly.

## Tasks

For every fix below: **state your own hypothesis first** — in the chat, in
your own words — before your AI gives you its take. You don't need to be
right. The point is arriving with a guess, not an empty prompt.

1. **Run the test suite** (1 min) — run `go test ./...` and note every failing
   test. Write down the list. Compare with your neighbor — you should both see
   the same failures.

2. **Understand the project, your way** (2 min) — before fixing anything, get
   a working mental model of how a request flows from `main.go` to the
   database and back. How you get there is up to you: one message, several
   follow-ups, asking it to trace one specific endpoint — your call.
   - Be ready to explain the handler → store layering out loud, without
     looking at your screen. Compare with your neighbor: did you arrive at
     the same model through different conversations?

3. **Fix: `TestPaginateZeroPage` and `TestPaginateNegativePage`** (4 min)
   - Don't paste the test output verbatim as your entire message. Look at
     `internal/util/pagination.go` yourself first, form a guess about what
     breaks and why, then bring your AI in to confirm or correct you.
   - Run `go test ./internal/util/...` — both tests must pass before moving
     on.
   - Compare fixes: what guard did your AI add? Where exactly? Did you and
     your neighbor land on the same fix from different starting guesses?

4. **Fix: `TestCreateBookReturns201` and `TestDeleteBookReturns204`** (3 min)
   - Before asking your AI anything, decide for yourself what status codes
     these two endpoints *should* return, and why. Then check your reasoning
     against your AI's.
   - Apply the fixes. Run `go test ./internal/handler/...`.
   - Compare: did you already know why REST wants 201 and 204, or did the AI
     teach you something there?

5. **Fix: `TestCreateReviewNonexistentBook`** (4 min) — use plan mode for this
   one.
   - Without any AI help yet, sketch on paper (or in a scratch comment) what
     you think needs to change. Then open plan mode and see how your sketch
     compares to the plan it proposes.
   - Review the plan, adjust it if you disagree with a step, then have it
     implement.
   - Run `go test ./internal/handler/...`.
   - Compare: did your AI add the existence check in the handler or the
     store? Did your plan put it in the same place?

6. **Fix: `TestCreateReviewValidation`** (3 min)
   - Before asking, decide as a pair: should this validation live in the
     handler, a middleware, or the store? Argue it out first, *then* ask your
     AI where it would put it and why.
   - Implement, run `go test ./internal/handler/...` — all 4 subtests must
     pass.
   - Compare: did the AI's placement match what you two agreed on?

7. **Hunt the hidden bug** (2 min) — one bug has no failing test attached to
   it. You decide how to look for it — ask for a general code review, ask it
   to inspect a package you haven't touched yet, or go looking yourself first
   and use your AI to confirm a suspicion.
   - Compare: did you and your neighbor find the same bug via the same route,
     or different routes?

8. **Final check** (1 min) — run `go test ./...`. All tests should now pass. If
   not, diagnose the remaining failure yourself before asking your AI to
   confirm your diagnosis.

## Pair Discussion (5 min)

Compare with your partner: which bug was hardest to fix? Where did your
hypothesis turn out wrong, and what did that teach you? Did plan mode change
how you approached bug 5? Did the training-mode CLAUDE.md change how you
prompted — did you use the escape hatch, and when? Choose **one take-away**
to present to the group.

## Group Share (5 min)

Each participant presents **one take-away** from this exercise to the group.
