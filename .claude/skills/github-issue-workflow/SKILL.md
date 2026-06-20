---
name: github-issue-workflow
description: Orchestrates the full GitHub issue lifecycle by invoking github-fetch-issue, github-implement-issue, and github-create-pr in sequence. Use when user asks to resolve, implement, work on, fix, or close a GitHub issue end-to-end, or references an issue URL or number for implementation.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Task, AskUserQuestion, TodoWrite
---

# GitHub Issue Workflow — Orchestrator

End-to-end workflow that chains three sub-skills in sequence:

| Phase | Skill | Input | Output |
|-------|-------|-------|--------|
| 1 | `github-fetch-issue` | Issue number | Issue number + requirements summary |
| 2 | `github-implement-issue` | Issue number | Branch name |
| 3 | `github-create-pr` | Branch name + Issue number | PR number + URL |

`github-implement-issue` internally chains four sub-skills in sequence:

| Sub-phase | Skill | Role |
|-----------|-------|------|
| 2a | `github-implement` | Explore codebase and write code changes |
| 2b | `github-test` | Run tests/lint and fix failures |
| 2c | `github-review` | Code review; fix critical and major findings |
| 2d | `github-commit-push` | Create branch, commit, and push |

**This skill does not write code, run `git` commands, or call `gh` directly.** All actions are delegated to sub-skills via the Skill tool.

## When to Use

- User says "resolve issue", "implement issue #N", "work on issue", "fix issue #N", "close issue with PR", or similar end-to-end requests
- User pastes a GitHub issue URL
- User wants to go from requirement to PR in a single command

**Trigger phrases:** "resolve issue", "implement issue #N", "work on issue", "fix issue #N", "close issue with PR", "github issue workflow", "GitHub issue #N"

## Instructions

### Phase 1: Fetch Issue

Use the Skill tool to invoke `github-fetch-issue`, passing the Issue number as the argument.

Wait for it to return the confirmed Issue number and requirements summary. Record the Issue number — it is required for Phase 2 and Phase 3.

### Phase 2: Implement Issue

Use the Skill tool to invoke `github-implement-issue`, passing the Issue number from Phase 1 as the argument.

Wait for it to return the branch name. Record the branch name — it is required for Phase 3.

### Phase 3: Create Pull Request

Use the Skill tool to invoke `github-create-pr`, passing the branch name from Phase 2 and the Issue number from Phase 1 as arguments.

Wait for it to return the PR number and URL.

## Output

At completion, display:

```
Workflow complete.

Issue:  #<N> — <issue-url>
Branch: <branch-name>
PR:     #<M> — <pr-url>
```

## Constraints

- Do NOT write or edit files directly
- Do NOT run `git`, `gh`, or shell commands directly
- Do NOT ask the user for confirmation — user confirmation is handled inside each sub-skill
- If a sub-skill fails or the user cancels, surface the error to the user and stop; do not skip to the next phase
