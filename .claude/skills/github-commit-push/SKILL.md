---
name: github-commit-push
description: Creates a branch, commits all staged changes with a conventional commit message, and pushes to origin. Returns the branch name. Use as a sub-step inside github-implement-issue after tests and review pass.
allowed-tools: Bash
---

# GitHub Commit Push — Branch, Commit, and Push Phase

Create a branch from the current working state, commit all changes, and push to origin. No code modifications.

## Inputs

- **Issue number** — used to name the branch and close the issue in the commit message
- **Branch prefix** — `feature`, `fix`, or `refactor` (derived from Issue labels by the caller)
- **Commit type** — `feat`, `fix`, or `refactor`
- **Short slug** — lowercase, hyphenated title summary ≤ 40 chars (derived by the caller)
- **Commit description** — one-sentence summary of what changed (derived by the caller, never raw Issue text)

## Instructions

### Step 1: Derive Branch Name

```bash
BRANCH_NAME="${BRANCH_PREFIX}/${ISSUE_NUMBER}-${SLUG}"
```

**Branch naming convention:**
- `feature/<N>-<slug>` — enhancement / new feature
- `fix/<N>-<slug>` — bug fix
- `refactor/<N>-<slug>` — refactor / other

### Step 2: Create Branch, Commit, and Push

```bash
git checkout -b "$BRANCH_NAME"
git add -A
git commit -m "<type>(<scope>): <description>

<body explaining what changed and why>

Closes #<ISSUE_NUMBER>"
git push -u origin "$BRANCH_NAME"
```

Commit message rules:
- First line: `<type>(<scope>): <description>` — ≤ 72 chars
- Body: explain the why, not the what
- Footer: `Closes #<N>`

## Output

```
Branch: <branch-name>
Commit: <commit-hash>
```
