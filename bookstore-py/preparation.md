Dear participant,

We are looking forward to welcoming you to the **Claude Code Mastery Training**
training. To make the most of our time together, we ask you to complete a few
preparation steps before the session.

## What to prepare

### 1. An editor or IDE

Use the editor or IDE you like best, as long as it can open and browse
Python code. During the training the editor is only used to read code and
review changes. All AI work happens in Claude Code in the terminal.

If you have no preference, [Visual Studio Code](https://code.visualstudio.com/)
is a safe choice. The instructions below use VSCode where a step depends on the
editor.

Your IDE also needs to understand Python. Most IDEs do this out of the box.
In VSCode, install the official **Python extension** by Microsoft:

- Open the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
- Search for **"Python"** by Microsoft
- Click **Install**

You can also install it directly from:
https://marketplace.visualstudio.com/items?itemName=ms-python.python

### 2. Claude Code subscription and plugins

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

### 3. Git

Make sure **Git** is installed on your machine: https://git-scm.com/downloads

Verify it works by running:

```bash
git --version
```

### 4. mise

[mise](https://mise.jdx.dev/) is a tool that installs other tools. In this
course it installs Python, Node.js, uv and Spec Kit for you, in the
versions the exercises were tested with.

mise installs these tools for the `bookstore` folder only. Tools that are
already on your machine do not change.

1. Install mise.

   macOS and Linux:

   ```bash
   curl -fsSL https://mise.run | sh
   ```

   Windows (PowerShell):

   ```powershell
   irm https://mise.run/powershell | iex
   ```

2. Add mise to your shell. Run the one command for the shell you use.

   zsh (the default on macOS):

   ```bash
   echo 'eval "$(~/.local/bin/mise activate zsh)"' >> ~/.zshrc
   ```

   bash:

   ```bash
   echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
   ```

   Windows (PowerShell):

   ```powershell
   if (-not (Test-Path $PROFILE)) { New-Item $PROFILE -Force }; Add-Content $PROFILE '(&mise activate pwsh) | Out-String | Invoke-Expression'
   ```

3. Close the terminal and open a new one. Then verify that mise works:

   ```bash
   mise --version
   ```

Is mise blocked on your company laptop? Then skip this section and follow
section 6 instead.

### 5. Course materials on GitHub

We will be working with the **BookStore API** starter project during the
training. The repository has one branch per language.

1. Clone the Python branch into a folder named `bookstore`:

   ```bash
   git clone -b py https://github.com/xebia/ai-assisted-se-claude-exercise bookstore
   ```

2. Enter the folder and let mise set everything up:

   ```bash
   cd bookstore
   mise run setup
   ```

   This command installs Python, Node.js, uv and Spec Kit. It also
   prepares the frontend project in `bookstore/web` for Exercises 6 and 7.
   The first run downloads a lot and takes a few minutes.

3. Check the result:

   ```bash
   mise run doctor
   ```

   The command prints the version of every tool. Your machine is ready when
   it ends without an error. Look at the line under `claude --version`: it
   must show **2.1.178 or newer**. Exercise 7 needs that version.

4. Start the project to verify that it runs:

   ```bash
   mise run start
   ```

   Open http://localhost:8080/api/books in your browser. You see a list of
   books as JSON. Stop the project with `Ctrl+C`.

Two notes. The tools from mise work only inside the `bookstore` folder, so
always start `claude` from that folder. And please do all of this **before the
training day**: thirty laptops that download the same tools at once on
conference wifi is not a good start to a session.

### 6. Without mise: install the tools by hand

Follow this section only if you cannot use mise. It installs the same tools
one by one. If `mise run doctor` ended without an error, skip it.

#### Python

Make sure **Python 3.10+** is installed on your machine:
https://www.python.org/downloads/

Verify it works by running:

```bash
python3 --version
```

#### The project

Enter the `bookstore` folder and run the project to verify everything works:

```bash
cd bookstore
python3 main.py
```

#### uv, Spec Kit and Node (for Exercises 4 to 7)

In Exercise 6 we use [Spec Kit](https://github.com/github/spec-kit), GitHub's
spec-driven development toolkit, to specify a frontend for the BookStore API.

**Node.js 20+** — https://nodejs.org/ (the frontend's dev server runs on it)

**uv** — Exercise 4 starts a small Python MCP server with `uv`, Exercise 5
runs its gate and brief scripts with `uv`, and Spec Kit is a Python tool
installed via `uv`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh     # macOS / Linux
# Windows (PowerShell):
# powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/0.9.9/install.ps1 | iex"
```

Then install Spec Kit and set up the frontend project:

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

cd bookstore/web
npm install
specify init --here --force --non-interactive --integration claude
git checkout -- .specify/memory/constitution.md      # must run AFTER init
specify check
```

Exercise 7 uses **agent teams**, an experimental Claude Code feature that is
off by default. You turn it on in Exercise 7, in the committed file
`web/.claude/settings.json`. It needs Claude Code **2.1.178 or
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

- Your editor or IDE is installed and can open Python files
- You have an active Claude Pro subscription ($20/month)
- Claude Code CLI is installed and working (`claude --version` shows 2.1.178
  or newer)
- Optional: the Claude Code editor integration is installed
- Git is installed (`git --version` works in your terminal)
- mise is installed (`mise --version` works in a new terminal)
- You have cloned the `py` branch of the exercise repository into a folder
  named `bookstore`
- `mise run setup` finished without an error
- `mise run doctor` ends without an error
- `mise run start` starts the project on http://localhost:8080

Did you install the tools by hand (section 6)? Then check these instead of the
three `mise run` lines: `python3 --version`, `node --version` and
`uv --version` work, `specify check` reports no problems, and in
`bookstore/web` the command `git status --short` prints nothing.

## Questions?

If you run into any issues during setup, feel free to reach out to us before the
training day. We want everyone to hit the ground running from the very first
exercise.

See you soon!

The Training Team
