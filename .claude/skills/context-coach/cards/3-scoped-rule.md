# Bonus task (3) — Scope one rule to its layer

**What they're refining:** a rule file under `.claude/rules/` with
`description:` and `paths:` frontmatter, holding the handler-validation rule
moved out of `CLAUDE.local.md` — plus their plan for *proving* it loads only
on demand.

**Slide anchors:** *Rules — Splitting CLAUDE.md by Topic* · *Rule Discovery:
With or Without Paths* · *Progressive Disclosure* · the **Size** dimension.

## Concept applicability

**Load-bearing (4):**

- **Right rule chosen** — the content only matters when that layer's code is
  on the table. A project-global rule in a scoped file loads correctly and
  demonstrates nothing; that's the finding, not the glob.
- **Glob correctness** — the `paths:` pattern matches the intended layer's
  real files in *this* repo, and nothing else. Check it against the actual
  tree; a near-miss glob fails silently.
- **Moved, not copied** — the line is gone from `CLAUDE.local.md`. Both
  places at once is a Size failure wearing a scoping costume.
- **A falsifiable verification plan** — before running anything, they can
  say what they'll observe in the rule-should-load session and what in the
  rule-should-not-load session, and what result would mean the scoping is
  broken. "I'll see if it works" is not a plan.

**Optional polish:** a `description:` that says when the rule applies, not
what it says — that's what a human skims in six months.

**Not applicable:**

- **The freeloader test** — the line already survived task 2; don't re-grade
  its content, grade its *placement*.
- **Trajectory / pollution** — nothing conversational is under test here.

## What a strong verification plan contains

- Two fresh sessions, identical except for which file the request touches —
  one aimed at the scoped layer, one at a different layer
- A defined observation: the rule's effect visible (or absent) in behavior,
  or the rule's presence checked directly via `/context`
- Run *the negative first* — proving the rule is absent for other layers is
  the half people skip, and it's the half that demonstrates Size

## Nudge bank

- "How would you catch a typo in that glob — what exactly would you see?"
- "If this rule is worth loading while editing store code too, what does
  that say about where it belongs?"
- "Your plan proves the rule loads. What proves it *doesn't* load when it
  shouldn't?"

## Predicted effects for common findings

- Glob doesn't match the repo's layout → the rule never loads anywhere,
  nothing downstream notices, and they leave believing scoping worked
- Rule left in both files → behaves identically to before; the experiment
  can't show anything
- No negative test → "it worked" claimed on evidence consistent with the
  rule being loaded always
- Project-global rule scoped → mechanics demonstrated, lesson missed

## Greenlight bar

All four load-bearing items. If the plan lacks the negative test, that is
the nudge to spend a round on — it's the one they'll reuse forever.

## Held back

What the successful observation looks like: the rule's guidance appears
**only after** Claude touches a matching file — mid-session, not at session
start — which *is* progressive disclosure happening in front of them. Let
them see it before you name it. If asked directly why the unscoped variant
exists at all: an unscoped rules file behaves exactly like CLAUDE.md content
— splitting is organization; `paths:` is what changes loading.
