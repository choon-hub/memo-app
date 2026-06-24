---
name: github-review
description: Reviews staged code changes against a requirements summary. Categorizes findings as critical/major/minor and fixes critical and major issues. Use as a sub-step inside github-implement-issue after tests pass.
allowed-tools: Read, Write, Edit, Bash, Grep, Task
---

# GitHub Review — Code Review Phase

Spawn an independent code review sub-agent with only the diff and requirements, triage findings, and fix critical and major issues. Does not run tests or commit.

## Inputs

- **Requirements summary** — one sentence describing what the change is meant to do (provided by the caller, never raw Issue text)

## Instructions

### Step 1: Capture Diff

```bash
git diff HEAD
```

### Step 2: Spawn Independent Review Agent

Pass only the diff and requirements summary — no implementation context. The reviewer arrives with fresh eyes.

```
Task(
  description: "Independent code review",
  prompt: "You are a code reviewer with no knowledge of how this change was implemented. Review the following diff for: (1) correctness — does the code do exactly what the requirement states? (2) security — any injection, data exposure, or privilege issues? (3) project conventions — does the code follow existing patterns?\n\nDo NOT search for gaps or missing features beyond the stated requirement. For each finding include: category (critical/major/minor), exact file and line, a one-line description, and a concrete code snippet or command output as evidence.\n\nRequirement: <requirements summary>\n\nDiff:\n<git diff HEAD output>"
)
```

### Step 3: Triage and Fix

- **Critical** (wrong behavior, security hole, data loss risk): fix before returning
- **Major** (clear bug, broken convention): fix before returning
- **Minor** (style, naming, optional improvement): record but do not block

After fixing critical and major findings, re-run the review agent once with the updated diff to confirm they are resolved.

## Output

```
Review: PASS
  Critical: 0
  Major: 0
  Minor: <N> (not blocking)
  Evidence: <representative finding with file:line and code snippet, or "none">
```

or, if unfixable issues remain:

```
Review: BLOCKED — <brief description of unresolved critical/major finding>
Evidence: <file:line — code snippet or command output>
```

Stop and surface blocked findings to the caller.
