Dear participant,

We are looking forward to welcoming you to the **Claude Code Mastery Training**
training. To make the most of our time together, we ask you to complete a few
preparation steps before the session.

## What to prepare

### 1. Visual Studio Code

Make sure you have [Visual Studio Code](https://code.visualstudio.com/)
installed and working on your computer. We will use it throughout the training
as our primary editor.

### 2. Go plugin for VSCode

Install the official **Go extension** for Visual Studio Code:

- Open VSCode and go to the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
- Search for **"Go"** by the Go Team at Google
- Click **Install**

Alternatively, install it directly from:
https://marketplace.visualstudio.com/items?itemName=golang.Go

Also make sure the **Go toolchain** itself is installed on your machine:
https://go.dev/dl/

### 3. Claude Code subscription and plugins

We will be using **Claude Code** as our AI coding assistant during the training.
Please set up your account and tools before the session:

- Sign up or log in at [claude.ai](https://claude.ai)
- Make sure you have an active **Claude Pro** subscription (required for Claude
  Code access)
- Install the **Claude Code CLI** by following the instructions at
  [claude.ai/code](https://claude.ai/code)
- Verify it works by running `claude` in your terminal
- Install the **Claude for Visual Studio Code** extension in VSCode:
  - Open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
  - Search for **"Claude Code"** by Anthropic
  - Click **Install**

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
cp constitution.md .specify/memory/constitution.md   # must run AFTER init
specify check
```

> [!IMPORTANT]
> The `cp` must come **after** `specify init`. Init writes into a non-empty
> directory and would otherwise overwrite the constitution with its own
> template.

Please do this **before the training day**. `specify init` downloads a template
bundle from GitHub, and thirty laptops doing that at once on conference wifi is
not a good start to a session.

Verify: `specify check` reports no problems, and `npm run dev` starts a server
on http://localhost:5173.

## Quick checklist

- VSCode is installed and opens without issues
- The Go extension is installed in VSCode
- The Go toolchain is installed (`go version` works in your terminal)
- You have an active Claude Pro subscription ($20/month)
- Claude Code CLI is installed and working (`claude --version` works in your
  terminal)
- The Claude Code extension is installed in VSCode
- Git is installed (`git --version` works in your terminal)
- You have cloned the bookstore project from GitHub

- Node.js 20+ is installed (`node --version` works in your terminal)
- `uv` is installed (`uv --version` works in your terminal)
- Spec Kit is installed (`specify check` runs without problems)
- `bookstore-web` is set up (`npm install` finished, `.specify/` exists,
  `.specify/memory/constitution.md` starts with "# BookStore Web Constitution")

## Questions?

If you run into any issues during setup, feel free to reach out to us before the
training day. We want everyone to hit the ground running from the very first
exercise.

See you soon!

The Training Team
