---
name: github-create-pr
description: Inspects changes on an existing branch, drafts a Pull Request title and body (including `Closes #N` when an Issue number is provided), gets user approval, then creates the PR with `gh pr create`. Use when the user wants to open or create a pull request from a branch.
allowed-tools: Bash, AskUserQuestion
---

# GitHub Pull Request Creation Skill

Creates a well-structured Pull Request from an existing branch with a mandatory user-approval gate.

## When to Use

- User says "create a PR", "open a pull request", "submit a PR", or "make a PR for branch X"
- An orchestrator skill passes a branch name (and optional Issue number) to create a PR

## Instructions

### Step 1: Determine Base Branch

```bash
TARGET_BRANCH=$(git remote show origin 2>/dev/null | grep 'HEAD branch' | cut -d' ' -f5)
TARGET_BRANCH=${TARGET_BRANCH:-main}
echo "Base branch: $TARGET_BRANCH"
```

### Step 2: Inspect Branch Changes

```bash
git log "$TARGET_BRANCH".."$BRANCH_NAME" --oneline
git diff "$TARGET_BRANCH"..."$BRANCH_NAME" --stat
```

### Step 3: Draft PR

**Title**: Most descriptive commit subject on the branch (conventional commit format preferred, ≤ 72 chars).

**Body**:
```markdown
## Description
<Summary of what changed and why>

## Changes
- Change 1
- Change 2

## Related Issue
Closes #<N>

## Verification
- [ ] All acceptance criteria met
- [ ] Tests pass
- [ ] Code review completed
- [ ] No breaking changes
```

Omit the "Related Issue" section if no Issue number was provided.

### Step 4: User Approval Gate (mandatory)

Present the full draft to the user via AskUserQuestion:

```
Here is the draft Pull Request:

**Title**: <title>
**Base branch**: <target>

**Body**:
<body>

Approve to create this PR, or describe changes you'd like.
```

Revise as needed. Do NOT call `gh pr create` without explicit approval.

### Step 5: Create PR

```bash
gh pr create \
  --base "$TARGET_BRANCH" \
  --head "$BRANCH_NAME" \
  --title "<title>" \
  --body "<body>"
```

Output the PR number and URL:

```
PR created: #<N>
URL: <url>
```
