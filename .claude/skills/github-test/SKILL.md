---
name: github-test
description: Runs the project's test suite and linter, then fixes any failures. Returns pass/fail result. Use as a sub-step inside github-implement-issue after code changes have been written.
allowed-tools: Read, Write, Edit, Bash, Grep
---

# GitHub Test — Verify Phase

Run tests and lint, fix failures, and report the outcome with actual command output. No codebase exploration or commits.

## Instructions

### Step 1: Detect and Run Tests

```bash
if [ -f "package.json" ]; then
  npm test 2>&1
  npm run lint 2>&1
elif [ -f "pom.xml" ]; then
  ./mvnw clean verify 2>&1
elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
  python -m pytest 2>&1
  python -m ruff check . 2>&1
elif [ -f "go.mod" ]; then
  go test ./... 2>&1
  go vet ./... 2>&1
fi
```

### Step 2: Fix Failures

- Read failing test output carefully
- Fix the root cause in source files (not by deleting tests)
- Re-run until all tests pass and lint is clean

## Output

```
Tests: PASS — all tests and lint clean
---
<last 20 lines of test runner output>
```

or

```
Tests: FAIL — <brief description of remaining failures>
---
<relevant portion of test runner output showing the failure>
```

Stop and surface failures (including the output snippet) to the caller if they cannot be resolved.
