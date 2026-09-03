Dear participant,

We are looking forward to welcoming you to the **Claude Code Mastery Training**
training. To make the most of our time together, we ask you to complete a few
preparation steps before the session.

## What to prepare

### 1. Visual Studio Code

Make sure you have [Visual Studio Code](https://code.visualstudio.com/)
installed and working on your computer. We will use it throughout the training
as our primary editor.

### 2. Kotlin plugin for VSCode

Install a **Kotlin extension** for Visual Studio Code:

- Open VSCode and go to the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
- Search for **"Kotlin"** (the *Kotlin Language* extension by mathiasfrohlich
  is a good lightweight option)
- Click **Install**

Also make sure the **Kotlin compiler** (`kotlinc` 1.9+) and a **JDK** (Java
21+) are installed on your machine:

- Kotlin: https://kotlinlang.org/docs/command-line.html
- JDK 21+: https://adoptium.net/ (Temurin builds work well)

Verify both work by running:

```bash
kotlinc -version
java -version
```

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

Then enter the project folder and build it to verify everything works
(the first build downloads the `sqlite-jdbc` JAR):

```bash
cd ai-assisted-se-claude-exercise/bookstore-kt
./gradlew run
# or: ./mvnw package -DskipTests && java -jar target/bookstore-1.0-SNAPSHOT.jar
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

- VSCode is installed and opens without issues
- A Kotlin extension is installed in VSCode
- Kotlin compiler is installed (`kotlinc -version` works in your terminal)
- JDK 21+ is installed (`java -version` shows 21 or higher)
- You have an active Claude Pro subscription ($20/month)
- Claude Code CLI is installed and working (`claude --version` works in your
  terminal)
- The Claude Code extension is installed in VSCode
- Git is installed (`git --version` works in your terminal)
- You have cloned the bookstore project from GitHub and `./gradlew run` (or `./mvnw package -DskipTests`) finishes
  without errors

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
