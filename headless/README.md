# headless/ — exercise 5

Files for the exercise "Claude Without You Watching". The sheet
(`exercises/session5.pdf`) tells you when to use each one.

| File | What it is |
| --- | --- |
| `gate.py` | The review gate. You fill in two parts in task 2. |
| `team-rules.md` | The team rules the gate checks against. |
| `brief.py` | The morning brief. It collects the night and runs your prompt. |
| `night-full.txt` | One night of server log. |
| `night-cut.txt` | The same night, but the log was rotated at 01:40. |
| `nightly-tests.txt` | The result of the nightly test run. |
| `claude-review.yml` | Take-home: the gate as a GitHub Actions workflow. |

Your own files go in `headless/out/` and `headless/brief-prompt.txt`. Git
ignores them.
