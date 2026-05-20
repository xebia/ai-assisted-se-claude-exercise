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
./build.sh
./run.sh
```

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
- You have cloned the bookstore project from GitHub and `./build.sh` finishes
  without errors

## Questions?

If you run into any issues during setup, feel free to reach out to us before the
training day. We want everyone to hit the ground running from the very first
exercise.

See you soon!

The Training Team
