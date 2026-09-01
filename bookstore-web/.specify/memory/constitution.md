<!--
Sync Impact Report
Version change: 1.2.0 → 1.3.0
Modified principles: none (I–VI unchanged in wording and intent)
Renamed sections: "Principles" → "Core Principles" (template conformance)
Added sections: "Governance" (amendment procedure, versioning policy, compliance review)
Removed sections: none — the Workflow bullet on overriding principles moved into Governance
Follow-up TODOs: none
-->

# BookStore Web Constitution

Non-negotiable rules for the BookStore frontend. Plans and tasks that
conflict with them are defects, not trade-offs.

## Core Principles

### I. Vanilla Only

Plain HTML, CSS and JavaScript. Zero runtime dependencies — no framework, no
component or state library. No build-step features: no JSX, no TypeScript, no
imports from `node_modules`. ES modules between your own files are fine.

Vite is a dev server and proxy, nothing more. The app must still work if Vite
disappears.

*Why:* dependency-free code stays reviewable when agents generate it.

### II. Contract, Not Implementation

The frontend must run unchanged against any BookStore backend (`go`, `kt`,
`py`, `ts`). Depend only on the HTTP contract: paths, methods, status codes,
JSON shapes. Never on internals, file layout, schema or SQL.

The contract is what a **running** backend does — not what a README claims.
Reading backend source to discover it is fine; encoding anything beyond it is
not. Record observed behaviour as observed, and degrade safely if it differs.

### III. Independently Demoable Stories

Every user story must be completable and demoable in a browser on its own,
with no other story finished. If it can't be, it is a fragment: merge it into
another story or move it to the foundational phase.

*Why:* this is what lets separate agents build stories in parallel.

### IV. Shared Code Is Foundational

Anything more than one story needs — API client, layout shell, stylesheet,
error rendering — belongs to the foundational phase and is finished before
story work starts.

No two user stories may touch the same file. A `[P]` task that violates this
is wrong, whatever the generated plan says.

*Why:* file ownership replaces coordination when agents share one repo.

### V. Every Error Path Is Specified (NON-NEGOTIABLE)

Every API call specifies behaviour for: success, empty result, not found,
client error, server error, network failure.

Raw upstream error text is never shown to a user — sanitise at the boundary,
regardless of what a backend currently emits.

"The API returns 404 there" is not an assumption you may make. Check what your
running backend actually returns.

### VI. Verifiable Acceptance Criteria

Every story states how you'd confirm it works: concrete, observable steps
against a running backend — not "it looks right".

No automated tests during the specification phase, and no task may require one
before `tasks.md` is complete. Tests come from these criteria later, so make
them precise enough to be mechanically checkable.

## Constraints

- Runtime dependencies: **none**. Dev dependencies: **Vite only**.
- The API is at the same-origin path `/api` (proxied to `localhost:8080`).
  Never hardcode a host, port or scheme.
- Target current evergreen browsers. No transpilation, no polyfills.

## Workflow

- No production code before `spec.md`, `plan.md` and `tasks.md` exist and a
  human has read them.
- Ambiguity is resolved in the spec, not in code. If an implementer has to
  guess, the spec has a defect — fix the spec.

## Governance

This file supersedes conventions from any other BookStore project. A principle
can only be overridden by amending this file, never by an exception buried in a
plan or task.

An amendment changes the text, the version and the amendment date in one
commit. Versioning is semantic: **MAJOR** removes or redefines a principle,
**MINOR** adds one or widens its scope, **PATCH** clarifies wording.

Every spec, plan and task review checks compliance before work proceeds.

**Version**: 1.3.0 | **Ratified**: 2026-08-28 | **Last Amended**: 2026-09-01
