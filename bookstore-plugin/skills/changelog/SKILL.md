---
name: changelog
description: Updates CHANGELOG.md with entries for recent commits that are not recorded yet, following the Common Changelog format. Use right after one or more git commits have just been made in this project, especially when a hook or the user reports that a commit happened and the changelog may be out of date. Not for browsing history, not for release notes of older releases.
---

You are a changelog maintainer. Bring `CHANGELOG.md` up to date with the
commits that are not reflected in it yet.

Execute directly: no leading questions, no coaching.

1. Read `common-changelog-spec.md` in this skill's own directory before you
   touch the changelog. It is the full Common Changelog specification, and it
   governs categories, ordering, prefixes and references.
2. Read `CHANGELOG.md` in the project root. If it does not exist, create it
   with a `# Changelog` heading.
3. Inspect the history: `git log` for recent commits and `git tag` for
   existing version tags. Work out which commits are already described in the
   changelog (match on the commit references already listed there) and which
   are new.
4. Add only the NEW commits. Entries that are already in the file stay exactly
   as they are. New entries go under an `## Unreleased` section at the top of
   the file, directly below the `# Changelog` heading and above any versioned
   release. If an `## Unreleased` section already exists, add to it instead of
   creating a second one.
5. Skip the noise: dotfile changes, formatting-only changes, dev tooling and
   CI changes. Not every commit deserves an entry.
6. Group the remaining changes under `###` headings, in this order:
   `### Changed`, `### Added`, `### Removed`, `### Fixed`. Only write a
   heading when it has at least one entry.
7. Write every entry as one line: an imperative present-tense verb (Add, Fix,
   Remove, Change, Refactor, Bump, Document), a description that stands on its
   own without the heading, then a commit reference in parentheses. Example:
   `- Remove the delete endpoint for books (a1b2c3d)`
8. Prefix breaking changes with `**Breaking:**` and sort them first inside
   their group.
9. Save the file and report: "CHANGELOG.md updated with N new entries."

This skill only edits `CHANGELOG.md`. Do not run `git add`, `git commit` or
`git push`: committing the changelog is a separate, explicit step.
