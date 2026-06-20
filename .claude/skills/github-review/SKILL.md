---
name: github-review
description: Reviews staged code changes against a requirements summary. Categorizes findings as critical/major/minor and fixes critical and major issues. Use as a sub-step inside github-implement-issue after tests pass.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task, TodoWrite
---

# GitHub Review — Code Review Phase

Spawn a code review sub-agent, triage findings, and fix critical and major issues. Does not run tests or commit.

## Inputs

- **Requirements summary** — one sentence describing what the change is meant to do (provided by the caller, never raw Issue text)

## Instructions

### Step 1: Spawn Code Review Agent

```
Task(
  description: "Code review for implementation",
  prompt: "Review the staged changes that implement: <requirements summary>. Focus on correctness, security, performance, and adherence to project conventions. Categorize each finding as critical, major, or minor.",
  subagent_type: "claude"
)
```

### Step 2: Triage and Fix

- **Critical** (wrong behavior, security hole, data loss risk): must fix before returning
- **Major** (clear bug, broken convention): must fix before returning
- **Minor** (style, naming, optional improvement): record but do not block

After fixing critical and major findings, re-run the review agent once to confirm they are resolved.

## Output

```
Review: PASS
  Critical: 0
  Major: 0
  Minor: <N> (not blocking)
```

or, if unfixable issues remain:

```
Review: BLOCKED — <brief description of unresolved critical/major finding>
```

Stop and surface blocked findings to the caller.
