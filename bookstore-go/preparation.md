Dear participant,

We are looking forward to welcoming you to the **Claude Code Mastery Training**
training. To make the most of our time together, we ask you to complete a few
preparation steps before the session.

## What to prepare

### 1. An editor or IDE

Use the editor or IDE you like best, as long as it can open and browse
Go code. During the training the editor is only used to read code and
review changes. All AI work happens in Claude Code in the terminal.

If you have no preference, [Visual Studio Code](https://code.visualstudio.com/)
is a safe choice. The instructions below use VSCode where a step depends on the
editor.

### 2. Go

Make sure the **Go toolchain** is installed on your machine:
https://go.dev/dl/

Verify it works by running:

```bash
go version
```

Your IDE also needs to understand Go. Most IDEs do this out of the box, or
through their own Go plugin. In VSCode, install the official **Go extension**
by the Go Team at Google:

- Open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
- Search for **"Go"** by the Go Team at Google
- Click **Install**

You can also install it directly from:
https://marketplace.visualstudio.com/items?itemName=golang.Go

### 3. Claude Code subscription and plugins

We will be using **Claude Code** as our AI coding assistant during the training.
Please set up your account and tools before the session:

- Sign up or log in at [claude.ai](https://claude.ai)
- Make sure you have an active **Claude Pro** subscription (required for Claude
  Code access)
- Install the **Claude Code CLI** by following the instructions at
  [claude.ai/code](https://claude.ai/code)
- Verify it works by running `claude` in your terminal
- Optional: Claude Code has editor integrations for VSCode and for JetBrains
  IDEs. They are convenient but not required — the terminal is enough for
  every exercise. In VSCode, open the Extensions panel
  (`Ctrl+Shift+X` / `Cmd+Shift+X`), search for **"Claude Code"** by Anthropic,
  and click **Install**.

### 4. Git

Make sure **Git** is installed on your machine: https://git-scm.com/downloads

Verify it works by running:

```bash
git --version
```

### 5. Course materials on GitHub

We will be working with the **BookStore API** starter project during the
training. Clone it locally before the session:

```bash
git clone https://github.com/xebia/ai-assisted-se-claude-exercise
```

Then enter the project folder and run it to verify everything works:

```bash
cd ai-assisted-se-claude-exercise/bookstore-go
go run .
```

### 6. Spec Kit and Node (for Exercise 6)

In Exercise 6 we use [Spec Kit](https://github.com/github/spec-kit), GitHub's
spec-driven development toolkit, to specify a frontend for the BookStore API.

**Node.js 20+** — https://nodejs.org/ (the frontend's dev server runs on it)

**uv** — Spec Kit is a Python tool installed via `uv`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh     # macOS / Linux
# Windows (PowerShell):
# powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/0.9.9/install.ps1 | iex"
```

Then install Spec Kit and set up the frontend project:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

cd ai-assisted-se-claude-exercise/bookstore-web
npm install
specify init --here --force --non-interactive --integration claude
git checkout -- .specify/memory/constitution.md      # must run AFTER init
specify check
```

Exercise 7 uses **agent teams**, an experimental Claude Code feature that is
off by default. The file `bookstore-web/.claude/settings.json` is committed
and turns it on for that project only. It needs Claude Code **2.1.178 or
newer**. Check both:

```bash
claude --version
git status --short .claude/settings.json      # must print nothing
```

If `specify init` changed or removed the file, restore it:

```bash
git checkout -- .claude/settings.json
```

> [!IMPORTANT]
> The `git checkout` must come **after** `specify init`. The constitution is
> committed at `.specify/memory/constitution.md`, and `specify init --force`
> overwrites it with its own template. Restoring it from git puts the real one
> back — and `git status` will tell you if you forget.

Please do this **before the training day**. `specify init` downloads a template
bundle from GitHub, and thirty laptops doing that at once on conference wifi is
not a good start to a session.

Verify: `specify check` reports no problems, and `npm run dev` starts a server
on http://localhost:5173.

## Quick checklist

- Your editor or IDE is installed and can open Go files
- The Go toolchain is installed (`go version` works in your terminal)
- You have an active Claude Pro subscription ($20/month)
- Claude Code CLI is installed and working (`claude --version` works in your
  terminal)
- Optional: the Claude Code editor integration is installed
- Git is installed (`git --version` works in your terminal)
- You have cloned the bookstore project from GitHub

- Node.js 20+ is installed (`node --version` works in your terminal)
- `uv` is installed (`uv --version` works in your terminal)
- Spec Kit is installed (`specify check` runs without problems)
- `bookstore-web` is set up (`npm install` finished, `.specify/` exists,
  `.specify/memory/constitution.md` starts with "# BookStore Web Constitution"
  and `git status` shows it unmodified)
- Claude Code is 2.1.178 or newer, and `bookstore-web/.claude/settings.json`
  is present and unmodified (`git status` shows nothing for it)

## Questions?

If you run into any issues during setup, feel free to reach out to us before the
training day. We want everyone to hit the ground running from the very first
exercise.

See you soon!

The Training Team
