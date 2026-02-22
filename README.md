# Diff Coverage

Diff Coverage is a VS Code extension that visualizes test coverage for modified code by combining **git diff** with **ExCoveralls** coverage reports.

The extension highlights which changed lines are covered by tests and which are not.

---

## Features

- Compare current changes against any recent Git commit
- Read coverage data from `./cover/excoveralls.json`
- Display changed lines with coverage highlighting
- Built-in commit picker (last 100 commits)
- Native VS Code styling and theme integration

---

## How It Works

1. The extension reads Git changes.
2. It loads coverage information from ExCoveralls.
3. It matches changed lines with coverage data.
4. It shows the result in a formatted preview.

---

## Requirements

You must have:

- Git installed and available in PATH
- Coverage file generated at: `./cover/excoveralls.json`

---

## Usage

### Step 1 — Generate coverage

Run your test suite and generate ExCoveralls output: `MIX_ENV=test mix coveralls.json -u`

---

### Step 2 — Run the command

Open Command Palette: `[excvdiff] Show Diff Coverage`

---

### Step 3 — Select base commit

Choose a commit from the dropdown. The extension will compare: `Selected Commit → Current Working Tree`

---

## Coverage Display

- 🟢 Green background → Covered lines
- 🔴 Red background → Uncovered lines
- Line numbers aligned and styled like VS Code editor

## Development

```
yarn
yarn run webpack --watch
```

### Build extension

```
yarn
vsce package
```
