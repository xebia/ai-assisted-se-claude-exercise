# Changelog

**Write changelogs for humans.**

Common Changelog is a style guide for changelogs, adapted from and a stricter subset of [Keep a Changelog](https://keepachangelog.com/). It embraces the guiding principle that "changelogs must be written by humans and for humans," while recognizing that a clean changelog starts with a clean git history.

## Table of Contents

1. Introduction
   - 1.1. What is a changelog?
   - 1.2. Guiding principles
   - 1.3. Prerequisites
2. Format
   - 2.1. File format
   - 2.2. Release
   - 2.3. Notice
   - 2.4. Change group
   - 2.5. Markdown formatting
3. Writing
   - 3.1. Generate a draft
   - 3.2. Remove noise
   - 3.3. Rephrase changes
   - 3.4. Merge related changes
   - 3.5. Skip no-op changes
   - 3.6. Separate commit message and description
   - 3.7. Promoting a prerelease
4. Antipatterns
   - 4.1. Verbatim copying of content
   - 4.2. Conventional Commits
   - 4.3. Confusing dates
5. Integration
   - 5.1. GitHub Actions
6. FAQ
7. License

## 1. Introduction

### 1.1. What is a changelog?

A changelog is a file containing a curated, ordered list of notable changes for each versioned release of a project. Its purpose is to help consumers understand what has changed between two releases.

Software consumers are humans who care about understanding impact. While semantic versioning provides signaling, it's insufficient alone. When software changes, people need to know why and how.

### 1.2. Guiding principles

- Changelogs are for humans.
- Communicate the impact of changes.
- Sort content by importance.
- Skip content that isn't important.
- Link each change to further information.

### 1.3. Prerequisites

- Project is under version control (git assumed).
- Each released version has a corresponding git tag.
- Project adheres to [Semantic Versioning](https://semver.org/).

## 2. Format

### 2.1. File format

The filename must be `CHANGELOG.md`. Content must be Markdown and start with a first-level heading:

```
# Changelog
```

Subsequent content consists of zero or more releases, sorted latest-first according to Semantic Versioning rules. The semantically latest release appears at the top. There must be an entry for every new stable release.

### 2.2. Release

A release must start with a second-level Markdown heading:

```
## VERSION - DATE
```

Where `VERSION` is a semver-valid version (without "v" prefix) matching a git tag (with optional "v" prefix), and `DATE` follows ISO 8601 format (`YYYY-MM-DD`). Example:

```
## 1.0.1 - 2019-08-24
```

The version should link to further information. For GitHub projects, link to a GitHub release containing the same content as the changelog entry.

Example:

```
## [1.0.1] - 2019-08-24

### Fixed

- Prevent segmentation fault upon `close()`

## [1.0.0] - 2019-08-23

_Initial release._

[1.0.1]: https://github.com/owner/name/releases/tag/v1.0.1
[1.0.0]: https://github.com/owner/name/releases/tag/v1.0.0
```

After the heading, a release must contain either:

1. One or more change groups
2. A notice followed by zero or more change groups

No other content is permitted, as a changelog is not a blog or detailed upgrade guide.

### 2.3. Notice

A release may include a notice—a single-sentence paragraph with arbitrary Markdown content. Notices clarify status, reference essential reading, or explain why changes are absent.

Example:

```
## [2.0.0] - 2020-07-23

_If you are upgrading: please see [`UPGRADING.md`](UPGRADING.md)._

### Removed

- **Breaking:** remove `write()` method from public API
```

For initial releases:

```
## [1.0.0] - 2019-08-23

_First release._
```

Use notices sparingly, as they appear before regular content. Only one notice is permitted per release.

### 2.4. Change group

A change group starts with a third-level Markdown heading containing a category:

```
### <category>
```

Categories (in order):

- `Changed` for changes in existing functionality
- `Added` for new functionality
- `Removed` for removed functionality
- `Fixed` for bug fixes

The word "functionality" includes documentation and supported runtime environments. Categories help readers recognize impact and scan efficiently.

The heading must be followed by an unnumbered Markdown list. Each item should be a single line starting with a change, followed by references and optionally authors. Example:

```
- Prevent buffer overflow (#28) (Alice, Henry)
```

Sort the list: breaking changes first, then by importance, then latest-first.

#### 2.4.1. Change

Write changes using the imperative mood, starting with a present-tense verb: `Add`, `Refactor`, `Bump`, `Document`, `Fix`, `Deprecate`.

Imperative mood communicates intent—what applying a commit or upgrading will accomplish. It increases consistency.

Each change must be self-describing without relying on the category heading. Instead of:

```
### Added

- Support of CentOS
- `write()` method
```

Write:

```
### Added

- Support CentOS
- Add `write()` method
```

#### 2.4.2. References

Changelogs serve as alternative entrypoints to code and may appear out-of-context. Changes require context; references provide it.

References must be written after changes on the same line, sorted by importance left-to-right. References must wrap in parentheses. Multiple references of the same type separate by commas within parentheses: `(#1, #2)` not `(#1) (#2)`. Each reference must be a Markdown link.

When multiple references exist, include only the best starting point. For example, prefer pull requests over tickets.

**Commit formats:**

```
([`53bd922`](https://github.com/owner/name/commit/53bd922))
([`owner/name@53bd922`](https://github.com/owner/name/commit/53bd922))
```

The latter applies to git submodules.

**Pull Request or issue formats:**

```
([#194](https://github.com/owner/name/issues/194))
([owner/name#194](https://github.com/owner/name/issues/194))
```

The latter references external repository issues.

**External ticket format:**

```
([JIRA-837](https://example.atlassian.net/browse/JIRA-837))
```

#### 2.4.3. Authors

Author names follow references, wrapped in parentheses and separated by commas:

```
- Fix infinite loop (#194) (Alice Meerkat)
```

Multiple authors:

```
- Fix infinite loop (#194) (Alice Meerkat, Milly Moose)
```

Optionally, separate references and authors with a semicolon:

```
- Fix infinite loop (#194, #195; Alice Meerkat, Milly Moose)
```

For single-contributor projects, author names may be omitted. For bot-authored changes, list the person who merged the relevant pull request.

Use authors' preferred names; git is the most reliable source.

#### 2.4.4. Prefixes

Breaking changes must be bold-prefixed with `**Breaking:**` and listed before other changes per category:

```
### Changed

- **Breaking:** emit `close` event after `end`
- Refactor `sort()` internals to improve performance

### Removed

- **Breaking:** drop support of Node.js 8
```

For projects with subsystems, prefix with the subsystem name in bold. Breaking changes in subsystems: `**<subsystem> (breaking):**`

```
- **Installer (breaking):** enable silent mode by default
- **UI**: tune button colors for accessibility
```

Subsystem use should generally be avoided, as it weakens semver signaling.

### 2.5. Markdown formatting

Common Changelog has no opinions on Markdown formatting.

## 3. Writing

### 3.1. Generate a draft

Tools like [`hallmark cc add`](https://github.com/vweevers/hallmark#usage) generate initial changelog entry content, though they carry formatting opinions outside Common Changelog's scope.

### 3.2. Remove noise

Exclude maintenance changes uninteresting to software consumers:

- Dotfile changes (`.gitignore`, `.github`)
- Development-only dependency changes
- Minor code style changes
- Documentation formatting changes

However, include:

- Refactorings (which may have unintentional side effects)
- Changes to supported runtime environments
- Code style changes using new language features
- New documentation (if features were previously undocumented)

### 3.3. Rephrase changes

In multi-contributor projects, people express the same thing differently. Rephrase for consistency. Add missing details; strip irrelevant ones. For example:

Instead of:

```
- Upgrade json-parser from 2.2.0 to 3.0.1
- Bump `xml-parser`
```

Write:

```
- Bump `json-parser` from 2.x to 3.x
- Bump `xml-parser` from 6.x to 8.x
```

Don't stray far from original commit messages; contributors should recognize their changes. Make future efforts align terminology.

### 3.4. Merge related changes

If changes span multiple commits, list them once. Examples:

**Bumping the same dependency twice:**

```
- Bump `standard` from 15.x to 16.x (b)
- Bump `standard` from 14.x to 15.x (a)
```

Becomes:

```
- Bump `standard` from 14.x to 16.x (a, b)
```

**Fixups:**

```
- Fix code style of new filter (b)
- Support filtering entries by name (a)
```

Becomes:

```
- Support filtering entries by name (a, b)
```

### 3.5. Skip no-op changes

A changelog describes differences between releases. If commits negate each other (e.g., one reverts another), omit them.

### 3.6. Separate commit message and description

Changes should be brief and scannable—one line maximum. Long descriptions belong in commits or references.

Given a commit:

```
Breaking: bump yaml-parser from 4.x to 5.x

Removes the `unsafe` option.
```

The changelog entry should be:

```
- **Breaking:** bump `yaml-parser` from 4.x to 5.x (`15d5a9e`)
```

Exception: if the commit lacks a description, add one:

```
- **Breaking:** bump `yaml-parser` from 4.x to 5.x (`15d5a9e`). Removes the `unsafe` option.
```

Alternatively, maintain a separate upgrade guide for semver-major releases.

### 3.7. Promoting a prerelease

Choose one of three approaches for promoting a prerelease to a release:

**A. Copy content to release**

Copy prerelease content to the release, following practices for generating changelog entries from commits—merge related changes and rephrasing. Write as if prereleases don't exist.

**B. Skip changelog entry for prerelease**

Prereleases for internal testing (e.g., CI/CD testing) don't need entries.

**C. Refer to prerelease**

After multiple prereleases with changelog entries, the release entry may state "Stable release based on <prerelease version>" using a notice.

Suitable for private projects with lengthy release flows where all stakeholders understand release contents. By design, the stable release contains no new content to communicate.

Example:

```
## [3.1.0] - 2021-07-05

_Stable release based on [3.1.0-rc.2]._

## [3.1.0-rc.2] - 2021-07-04

### Fixed

- Use localized date formats on Schedule page (`a11eb73`)

## [3.1.0-rc.1] - 2021-07-03

### Added

- Add Schedule page listing upcoming events (`59a03a9`)
```

## 4. Antipatterns

### 4.1. Verbatim copying of content

Using `git log` as a changelog introduces noise. Commits document source code evolution; changelogs communicate for consumers.

Similarly, listing pull requests verbatim is problematic. For example:

```
- json-parser 8.0.2 is fixed (#295)
- doc: fix dead link to xml-entities (#296)
- Bump actions/checkout from v2.3.3 to v2.3.4 (#293)
- docs: fix entryWritten example (#294)
- Update test framework (#288)
- docs: use brackets for hyphenated fields (#291)
- fix: membrane options - misleading error message (#292)
```

Problems stem from verbatim copying meaningful only to contributors. The json-parser change lacks explanation or reference. Insignificant documentation tweaks and maintenance changes don't affect distributed software. This changelog increases reading time rather than reducing it.

Improved version:

```
### Changed

- Unpin `json-parser` having fixed alice/json-parser#38 (#295)

### Fixed

- Clarify that hyphenated fields in `filter` option must use brackets (#291)
- Use more specific errors for invalid `membrane` options (#292)
```

Readers unfamiliar with specific options can skip those changes. This demonstrates semver and clean changelog value.

### 4.2. Conventional Commits

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) adds workflow overhead. Changes extend beyond commits.

Conventional Commits aids initial categorization but requires converting commit messages to readable form. Using readable form initially aligns content across contexts: stories, tickets, commits, pull requests, changelogs. This reduces cognitive overhead.

Common Changelog prioritizes descriptive changes explaining why changes occur. Conventional Commits can leave authors falsely impressed with message descriptiveness. Common Changelog uses natural language (imperative mood) fitting all contexts.

Examples of improvement:

**Unclear breaking change:**

Instead of:

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

Write:

```
Breaking: support extending config files through `extends` key

This config key is now reserved and no longer exposed to userland code.
```

**Breaking change hidden as refactoring:**

Instead of:

```
refactor!: drop support for Node 6

BREAKING CHANGE: refactor to use JavaScript features not available in Node 6.
```

Write:

```
Breaking: refactor using new JavaScript features

Drops support of Node 6.
```

**Documentation tweak in unknown file:**

Instead of:

```
docs: correct spelling of CHANGELOG
```

Write:

```
Fix spelling of CHANGELOG in README
```

**Redundant type and scope information:**

Instead of:

```
feat(lang): add polish language
```

Write:

```
Add polish translation
```

**Unnecessarily long description:**

Instead of:

```
fix: correct minor typos in code

see the issue for details on typos fixed.

Reviewed-by: Z
Refs #133
```

Write:

```
Fix minor typos in code (#133)

Reviewed-by: Z
```

### 4.3. Confusing dates

Regional date formats vary worldwide. The format `2017-07-17` follows the order of largest to smallest units: year, month, day. This format avoids ambiguous overlap with regional formats switching month and day positions. It's also an [ISO standard](http://www.iso.org/iso/home/standards/iso8601.htm), making it the recommended format.

## 5. Integration

### 5.1. GitHub Actions

This workflow triggers on tag push, extracting the changelog entry from `CHANGELOG.md` and creating a GitHub release with matching content:

```yaml
name: Release
on:
  push:
    tags: ['*']
permissions:
  contents: write
jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Create GitHub release
        uses: docker://antonyurchenko/git-release:latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The [`anton-yurchenko/git-release`](https://github.com/anton-yurchenko/git-release) action also supports uploading assets.

## 6. FAQ

### 6.1. Why spend time on a changelog?

Reciprocity: modest changelog effort saves readers twice as much time.

All projects experience mistakes, noise, and miscommunication in git history. A project can move fast in git and slow down for the changelog. The release can wait 15 minutes.

Multiple contributors describe features differently initially. Maintainers merge imperfect pull requests avoiding lengthy discussion. Developers forget that commit message quality deteriorates as context fades.

Writing the changelog provides feedback to think things through: how do recent pull requests interact? Was anything missed? Does the version number accurately reflect changes? Perhaps changes are unexpectedly breaking, or conversely, semver-major signaling is wasted.

Avoid full automation, which produces poor changelogs defeating their purpose.

### 6.2. How is this different from Keep a Changelog?

[Keep a Changelog](https://keepachangelog.com/) was among the first complete changelog guides, offering solid principles and high-level layout. Common Changelog fills various gaps and leaves less room for interpretation, being more opinionated while remaining suitable for any project.

**Additions:**

Common Changelog adds references, authors, and ways to highlight breaking changes.

**Fewer categories:**

Common Changelog lacks `Deprecated` and `Security` categories. Deprecations list under `Changed`.

**No Unreleased section:**

Common Changelog omits the `Unreleased` section for listing unreleased changes as they land in the main branch. In practice, this is unproductive:

1. Although commits or pull requests could describe themselves in `Unreleased`, they cannot add necessary self-references. These only come after the fact.
2. First-time contributors can't update the changelog. Maintainers must commit separately, creating noisy git history.
3. Writing a changelog requires bird's-eye views, while individual changes are best reviewed in isolation.

**No `[YANKED]` tag:**

Instead of special yanked-release notation, Common Changelog uses notices as a generic (but unparsable) format.

### 6.3. Is there a badge?

Yes! Promote Common Changelog adoption with:

```
[![Common Changelog](https://common-changelog.org/badge.svg)](https://common-changelog.org)
```

### 6.4. What about yanked releases?

Yanked releases should have changelog entries (if public for more than a few hours). Add a notice explaining status and linking to information. Example:

```
## [8.5.1] - 2021-05-10

_This release was never published to npm due to security issues (#123)._
```

The notice should not replace the change list.

### 6.5. Should you ever rewrite a changelog?

Yes. Good reasons always exist to improve a changelog historically. It's a reference answering questions like "When did X change?"

### 6.6. Is Common Changelog a commit convention?

No. A commit convention encodes information for machine consumption. Common Changelog guidelines can guide commit message writing but don't require it. The key difference is Common Changelog targets human readers, avoiding encoded communication like `feat` meaning feature or `!` denoting breaking changes.

## 7. License

[MIT](https://github.com/vweevers/common-changelog/blob/main/LICENSE)
