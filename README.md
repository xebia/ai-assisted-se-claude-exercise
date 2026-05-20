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
most comfortable with — the exercises (`excercises/block1.md` … `block8.md`) are
equivalent across all four.

- [bookstore-go](bookstore-go/) — Go, standard library `net/http`
- [bookstore-kt](bookstore-kt/) — Kotlin / JVM, `com.sun.net.httpserver` + JDBC
- [bookstore-py](bookstore-py/) — Python
- [bookstore-ts](bookstore-ts/) — TypeScript, runs on Bun

Each project's `README.md` explains how to build and run it. Each project's
`preparation.md` lists what to install before the session.

## Extras

- [mcp-sqlite](mcp-sqlite/) — a small MCP server used in one of the later
  exercise blocks.

## Before the training

Read the `preparation.md` inside the language project you have chosen and make
sure everything on the checklist works on your machine.
