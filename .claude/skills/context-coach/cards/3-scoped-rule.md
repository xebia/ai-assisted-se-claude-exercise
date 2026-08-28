# Bonus task (3) — Scope one rule to its layer

**What they're refining:** a rule file under `.claude/rules/` with
`description:` and `paths:` frontmatter, holding the handler-validation rule
moved out of `CLAUDE.local.md`. The exercise deliberately stops at the
*mechanism* — file moved, glob checked against the real tree, at most one
curiosity run watching the rule load. The full positive-and-negative proof
is that evening's CLAUDE.md homework, not this clock; don't demand it here.

**Slide anchors:** *Rules — Splitting CLAUDE.md by Topic* · *Rule Discovery:
With or Without Paths* · *Progressive Disclosure* · the **Size** dimension.

## Concept applicability

**Load-bearing (3):**

- **Right rule chosen** — the content only matters when that layer's code is
  on the table. A project-global rule in a scoped file loads correctly and
  demonstrates nothing; that's the finding, not the glob.
- **Glob correctness, checked against the tree** — the `paths:` pattern
  matches the intended layer's real files in *this* repo, and nothing else,
  and they verified that by listing the files, not by reading the glob and
  nodding. A near-miss glob fails silently.
- **Moved, not copied** — the line is gone from `CLAUDE.local.md`. Both
  places at once is a Size failure wearing a scoping costume.

**Optional polish:**

- A `description:` that says when the rule applies, not what it says —
  that's what a human skims in six months.
- If they have time for the curiosity run: knowing *what they expect to
  observe* (the rule arriving mid-session, after a matching file is
  touched) beats "I'll see if it works". If they volunteer a full
  falsifiable plan with a negative arm, applaud it and point it at the
  homework — don't spend exercise rounds on it.

**Not applicable:**

- **The freeloader test** — the line already survived task 2; don't re-grade
  its content, grade its *placement*.
- **Trajectory / pollution** — nothing conversational is under test here.

## Nudge bank

- "How would you catch a typo in that glob — what exactly would you see?"
- "If this rule is worth loading while editing store code too, what does
  that say about where it belongs?"
- "Is the rule's old line still in `CLAUDE.local.md`? What does having it
  in both places cost?"

## Predicted effects for common findings

- Glob doesn't match the repo's layout → the rule never loads anywhere,
  nothing downstream notices, and they leave believing scoping worked
- Rule left in both files → behaves identically to before; the move
  demonstrated nothing
- Project-global rule scoped → mechanics demonstrated, lesson missed
- Glob checked by eyeballing, not listing → a typo survives review

## Greenlight bar

All three load-bearing items. The glob check is the round worth spending —
it's the failure that stays invisible.

## Held back

What the successful observation looks like: the rule's guidance appears
**only after** Claude touches a matching file — mid-session, not at session
start — which *is* progressive disclosure happening in front of them. Let
them see it before you name it. If asked directly why the unscoped variant
exists at all: an unscoped rules file behaves exactly like CLAUDE.md content
— splitting is organization; `paths:` is what changes loading.
