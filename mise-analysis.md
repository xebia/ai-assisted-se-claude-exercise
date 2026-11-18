# Participant setup with mise: example and analysis

Trainer-only note (not shipped: `scripts/package.sh` copies only the listed folders).

## Verdict

**Better than the current setup for the tools and the web/ preparation, but adopt
it as the recommended path next to the manual one, not as a replacement, until
it has been run once on Windows and once on a locked-down company laptop.**

It was tested on macOS arm64 only. Windows and Linux are assessed from the mise
documentation, not from a run.

## What the example is

One `mise.toml` in each language project (`bookstore-go`, `-kt`, `-py`, `-ts`).
It ships as the root of the participant package, so the participant flow becomes:

```bash
# 1. install mise (once)             https://mise.jdx.dev/installing-mise.html
curl -fsSL https://mise.run | sh         # macOS / Linux
# irm https://mise.run/powershell | iex  # Windows (or: winget install jdx.mise)

# 2. clone as today
git clone -b go https://github.com/xebia/ai-assisted-se-claude-exercise bookstore
cd bookstore

# 3. everything else
mise run setup      # installs the tools, npm install, specify init, restores the constitution
mise run doctor     # prints every version and fails if a committed file was changed
```

Other tasks: `mise run start` (API on :8080), `mise run test`, `mise run web`
(frontend on :5173). The task names are the same in all four languages.

Each file has only `min_version`, `[tools]` and `[tasks]`. That is deliberate:
mise reads such a file without asking the participant to `mise trust` it.

## What was tested

mise 2026.11.9 on macOS arm64, with isolated mise directories and a PATH that
held only `/usr/bin`, `/bin`, mise and `claude`. So every tool came from mise.
Each package was built with `HTML=skip scripts/package.sh <lang>`.

| Package | `mise run setup` | `mise run doctor` | `mise run start` answers on :8080 |
|---|---|---|---|
| go | pass (Go 1.22.12) | pass | yes |
| kt | pass (Temurin 17.0.21, Gradle wrapper) | pass | yes |
| py | pass (Python 3.12.16) | pass | yes |
| ts | pass (Bun 1.4.4) | pass | yes |

In all four: Node 22.23.5, uv 0.13.9 and Spec Kit v1.4.1 were installed,
`web/.specify/` was generated, the committed constitution was restored and
`git status` was clean afterwards. A cold `mise run setup` for Go took about
two minutes, of which 78 s was Spec Kit.

Not tested: Windows, Linux, mise shims, `mise run test`, `mise run web`, and a
network behind a company proxy.

## What gets simpler

| Today (`preparation.md`) | With mise |
|---|---|
| Install the language toolchain from its own site (Go; or JDK + `kotlinc`; or Python; or Bun) | in `[tools]` |
| Install Node.js 20+ | in `[tools]` |
| Install uv with a per-OS command | in `[tools]` |
| `uv tool install specify-cli --from git+…` | in `[tools]` |
| Five commands in `web/` in a fixed order, with an IMPORTANT box about the order | `mise run setup` |
| Twelve checklist lines the participant verifies by hand | `mise run doctor` |
| "20+", "3.10+", "21+": a different version on every laptop | one version for the whole room |
| Start command differs per language | `mise run start` |

Further gains:

- **The order problem goes away.** `git checkout` after `specify init` is the
  one step the sheet warns about. It is now a line in a task.
- **Nothing is installed globally.** The tools are active only inside
  `bookstore/`. A participant who already has Node 18 or Java 11 for work keeps
  them.
- **Kotlin needs no `kotlinc`.** The Gradle wrapper brings the compiler; only a
  JDK is needed. The file pins Temurin 17, which matches `jvmToolchain(17)` in
  `build.gradle.kts`. (`preparation.md` asks for JDK 21+; it is worth checking
  that a machine with only JDK 21 can satisfy that toolchain.)
- **One place to change a version** for the trainer, instead of four sheets.

## What does not get simpler

- Claude Code itself, the subscription, Git and the editor stay manual. mise's
  registry does have `claude`, but a second, project-pinned copy next to the
  participant's own self-updating install is more confusing than helpful.
  `doctor` only prints its version.
- mise is one more tool to install, and it needs a shell step: either
  `mise activate` in the shell startup file, or its shims folder on PATH.
  Without that, `mise run …` still works, but a bare `go run .`, `npm run dev`
  or `specify` (which the sheets and Claude Code use) is not found.
- Claude Code runs commands in a non-interactive shell. It inherits the tools
  when `claude` is started from an activated shell inside `bookstore/`. Shims
  are the more robust choice for this course; that path is not tested yet.
- The first `mise run setup` still downloads every toolchain (size not measured). It must still
  happen before the training day.

## Operating systems

| OS | Assessment |
|---|---|
| macOS (arm64) | Tested, works. Intel is expected to work: every tool has an x64 build. |
| Linux (glibc) | Expected to work. Same code paths as macOS; all tools have prebuilt binaries. Alpine/musl is weaker (Python is compiled there). |
| Windows | Supported natively by mise, and every tool used here has a Windows build (Go, Temurin, Python prebuilt, Node, Bun, uv). No asdf plugin is used, which is the main thing that does not work on Windows. Not tested. |

Windows points to check in a real run:

- Tasks run under `cmd /c` on Windows. The tasks use plain commands only, and
  the Kotlin file has `run_windows = "gradlew.bat run"`. No bash is required.
- PowerShell needs the activation line in `$PROFILE`; `cmd.exe` cannot be
  activated and needs the shims folder on PATH.
- Company laptops: PowerShell execution policy, a blocked `winget`, or endpoint
  protection that distrusts freshly downloaded executables in the user profile.
- Spec Kit installs from a git URL, so Git must be on PATH before
  `mise run setup` (it already is a prerequisite).

For all three: mise asks the GitHub API for versions of uv and Spec Kit.
Unauthenticated calls are rate-limited per IP address, so thirty laptops behind
one conference address can hit the limit. That is the same reason the sheet
already says "before the training day". A committed `mise.lock` would remove
most of those calls.

## Why it is better, and where the risk is

The current setup fails in ways that cost session time: a wrong tool version, a
skipped step in `web/`, a constitution that was overwritten. mise removes all
three and replaces a checklist with one command that exits non-zero. The
`mise.toml` is 50 lines per language and adds no build step.

The risk is that a failure moves from "Node is missing" (which everyone can fix)
to "mise cannot download X behind this proxy" (which few can). That is why the
manual instructions should stay as the fallback.

## If you adopt it

1. Run `mise run setup` and `mise run doctor` once on Windows 11 (PowerShell)
   and once on Linux.
2. Decide on activation: recommend shims, and test that Claude Code finds `go`,
   `node` and `specify`.
3. Rewrite section 2 and 6 of the four `preparation.md` files around the three
   steps above; keep the manual steps as a fallback section.
4. Pin Spec Kit to a tag (`…spec-kit.git@v1.4.1`) and commit a `mise.lock`, so
   the whole room gets the version the sheets were tested with.
5. Optional: use the same file in `.github/workflows/package.yml`
   (`jdx/mise-action`) with `pandoc` and `just` for the trainer build.
