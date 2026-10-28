# Exercise 5 — Claude Without You Watching

**Under review: observable state, not a prompt.** The participant built a
review gate and a morning-brief prompt and ran both. Everything is on
disk. Grade the files and the saved answers, not the chat.

**When this runs.** Task 4 (the closing task), in a fresh session. Do not ask for the files:
read them from disk. Ask exactly one question first, and wait for the
answer:

> Did your brief on the second night notice that the log stops at 01:40?
> Yes, no, or only after you changed the prompt. One line, then I check.

Take any answer and start. Never ask a second question. The report must
stand on its own: no question at the end.

**Words.** The sheet says: the gate, the verdict (*pass* or *block*), the
findings, the team rules (rule 1 bad input, rule 2 small changes), the
answer shape (the schema), the full night, the second night (its log stops early), the brief, the time range. Never say harness, arm, baseline,
structured output (say "the verdict Claude returned"), grader.

## What the participant produced

All paths are relative to the bookstore folder.

1. `headless/gate.py`, with two parts filled in:
   - `SCHEMA`: a JSON Schema object with a required `verdict` limited to
     `"pass"` and `"block"` (an `enum`), and a required `findings` array of
     strings.
   - `RULES`: `"--append-system-prompt-file", "headless/team-rules.md"`.
     `--system-prompt-file` also works but replaces Claude Code's own
     instructions; say so as a note, not a fault. A path that does not
     exist means Claude reviewed without rules: a fault.
2. `headless/out/gate-*.json`: one file per gate run. Each holds the
   commit, its subject and Claude's full JSON answer
   (`answer.structured_output.verdict`, `answer.structured_output.findings`,
   `answer.total_cost_usd`, `answer.session_id`).
   Expected at least: one run on the README commit ("Gate test") with
   `pass`, and one or two runs on the "Add GET /api/reviews/{id}" commit
   with `block`, or with `pass` if the new endpoint answers 400.
3. `headless/brief-prompt.txt`: the participant's own prompt.
4. `headless/out/brief-night-full.md` and `headless/out/brief-night-cut.md`
   (the latest run of each), with the input beside them in
   `headless/out/input-night-*.txt`.

## Establish ground truth

- Read `headless/gate.py`. Check the two filled parts. Do not run it.
- List `headless/out/`. Read every `gate-*.json`. For the block run, read
  the commit itself (`git show --stat <commit>` and the handler diff) and
  say whether the new endpoint really answers a non-numeric id with 500.
- Read `brief-prompt.txt`, both briefs and both inputs. The full night has
  312 lines of `POST /api/books/{id}/reviews` answering 500 with
  "database is locked", all between 02:00 and 03:00, plus a few 404s and
  one slow-query warning. The cut night ends at 01:39 and has no 500s.
- Run nothing that edits the project, and do not run `claude`.

## Report shape

Headings the participant can find by scrolling.

1. **Your answer** — one sentence: what they said, and what the second
   brief shows.
2. **The gate** — the answer shape (complete, or what is missing: the
   `enum`, `required`), the rules flag, and a table of the saved runs:
   commit, verdict, the first finding in a short quote. If two runs on the
   same commit differ, say so plainly: the verdict is a judgment, which is
   why the script, not Claude, decides what "block" does.
3. **The planted break** — did the commit break rule 1 (quote the line)?
   Did the gate block it? If Claude answered 400 and the gate passed,
   that is a correct result: say so.
4. **The briefs** — for the full night: does it name the endpoint, give a
   count that matches the input (312), and quote a line? For the cut
   night: does it say the time range, or that the log stops at 01:39? Name
   the sentence in `brief-prompt.txt` that caused it, or the sentence that
   is missing. Show a tighter version of that one sentence.
5. **Your prompt** — four lines: length limit, worst first, evidence per
   number, the quiet-night line. Present or missing, one word each.

No score, no question at the end.

## Known traps

- **Schema without `enum`** — `verdict` is a free string. Claude may
  answer "approve" or "fail", and the gate treats anything but "pass" as
  block. Name the effect: a clean change is blocked.
- **Rules flag points at a missing file** — Claude reviews without the
  rules and blocks or passes on its own idea of quality.
- **README commit included gate.py** — the participant skipped step 3 of
  task 2 (commit your gate), so the clean commit also carries their gate edits. Rule 2 may
  block it. Explain, do not fault.
- **No gate runs saved** — the gate stopped with a message (empty
  `SCHEMA` or `RULES`, or `claude` not found) before Claude ran.
- **Brief counts wrong** — the brief says another number than the
  input. That is the quiet-failure lesson in a smaller form: name it.
- **Second brief says "quiet night" and nothing else** — the expected
  first result. It is fixed by a prompt sentence that asks for the time
  range or for the first and last line of the log.

## Held back

Why a brief fails quietly while a gate fails loudly is the closing
round's question. Do not lecture it; answer only if asked directly.
