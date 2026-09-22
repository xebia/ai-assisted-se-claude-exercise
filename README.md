# Claude Code Mastery — Exercises

This repository contains the starter projects used in the **Claude Code Mastery
Training**. Each project is a small **BookStore API** that manages books,
authors, and reviews.

## Deliberate bugs

> [!IMPORTANT]
> **These projects contain intentional bugs, smells, and questionable design
> choices.** That is the point. The exercises are designed to give you realistic
> code to investigate, refactor, and fix with the help of Claude Code.

Do not assume any piece of code is correct just because it compiles or because
its tests pass. Part of the training is learning how to use AI assistance to
spot the issues that humans (and test suites) miss.

## Pick your language

The same BookStore API is implemented in four languages. Pick the one you are
most comfortable with — the exercises (`exercises/session1.md` … `session8.md`) are
equivalent across all four.

- [bookstore-go](bookstore-go/) — Go, standard library `net/http`
- [bookstore-kt](bookstore-kt/) — Kotlin / JVM, `com.sun.net.httpserver` + JDBC
- [bookstore-py](bookstore-py/) — Python
- [bookstore-ts](bookstore-ts/) — TypeScript, runs on Bun

Each project's `README.md` explains how to build and run it. Each project's
`preparation.md` lists what to install before the session.

## Extras

- [mcp-sqlite](mcp-sqlite/) — a small MCP server (one Python file, standard library only, started with `uv run --script`) that participants register in
  exercise 5. Read-only: two tools, `get_table_definitions` and `execute_query`.
- [bookstore-plugin](bookstore-plugin/) — everything from exercises 4 and 5 as one
  Claude Code plugin: the `/commit` and `/changelog` skills, the changelog hook,
  the security-auditor subagent and the SQLite server. Shown live in session 5;
  try it yourself with `claude --plugin-dir ../bookstore-plugin` from your
  language folder.

## Before the training

Read the `preparation.md` inside the language project you have chosen and make
sure everything on the checklist works on your machine.
