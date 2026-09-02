# Bonus task (3) — Scope one rule to its layer

**What they're refining:** a rule file under `.claude/rules/` with
`description:` and `paths:` frontmatter, holding the handler-validation rule
moved out of `CLAUDE.local.md`. The exercise deliberately stops at the
*mechanism*: file moved, glob checked against the real tree, at most one
curiosity run watching the rule load. The full positive-and-negative proof
is for the CLAUDE.md they will write for their own project, not for this
clock. Do not demand it here.

**Slide anchors:** *Rules — Splitting CLAUDE.md by Topic* · *Rule Discovery:
With or Without Paths* · *Progressive Disclosure* · the **Size** dimension.

## Concept applicability

**Load-bearing (3):**

- **Right rule chosen** — the content only matters when that layer's code is
  being edited. A project-wide rule in a scoped file loads correctly and
  shows nothing. That is the finding, not the glob.
- **Glob correctness, checked against the tree** — the `paths:` pattern
  matches the intended layer's real files in *this* repo, and nothing else.
  They verified that by listing the files, not by reading the glob and
  agreeing with it. A glob that almost matches fails silently.
- **Moved, not copied** — the line is gone from `CLAUDE.local.md`. The same
  rule in both places is a Size failure that looks like scoping.

**Optional polish:**

- A `description:` that says when the rule applies, not what it says. That
  is what a human reads in six months.
- If they have time for the curiosity run: knowing *what they expect to
  observe* (the rule arriving mid-session, after a matching file is
  touched) is better than "I'll see if it works". If they volunteer a full
  testable plan with a negative arm, say it is good and point it at their
  own project's CLAUDE.md. Do not spend exercise rounds on it.

**Not applicable:**

- **The freeloader test** — the line already survived task 2. Do not
  re-grade its content. Grade its *placement*.
- **Trajectory / pollution** — nothing conversational is under test here.

## Nudge bank

- "There is a typo in your glob. What exactly would you see, and when?"
- "If this rule is also useful while editing store code, what does that say
  about where it belongs?"
- "Is the rule's old line still in `CLAUDE.local.md`? What does having it in
  both places cost?"

## Predicted effects for common findings

- Glob does not match the repo's layout → the rule never loads anywhere.
  Nothing downstream notices. They leave believing scoping worked.
- Rule left in both files → Claude behaves the same as before. The move
  showed nothing.
- Project-wide rule scoped → the mechanism was shown, the lesson was missed
- Glob checked by reading it, not by listing files → a typo survives review

## Greenlight bar

All three load-bearing items. The glob check is the round worth spending.
That failure stays invisible.

## Held back

What the successful observation looks like: the rule's guidance appears
**only after** Claude touches a matching file — mid-session, not at session
start. That *is* progressive disclosure, happening in front of them. Let
them see it before you name it. If asked directly why the unscoped variant
exists at all: an unscoped rules file behaves exactly like CLAUDE.md content.
Splitting is organization; `paths:` is what changes loading.
