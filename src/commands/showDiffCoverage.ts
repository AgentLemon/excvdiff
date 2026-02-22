import * as vscode from "vscode";
import { getFileDiffs } from "../lib/gitDiff";
import { getExcoverallsCoverageMap } from "../lib/excoveralls";
import { renderDiffsHtml } from "../views/coverage";
import { getRecentCommits } from "../lib/gitLog";
import { getBranches } from "../lib/gitBranches";

export async function showDiffCoverageCommit(): Promise<void> {
  const path = getWorkspacePath();

  if (path) {
    const picked = await pickBaseCommit(path)

    if (picked) {
      showDiffCoverage(path, picked.commit.hash);
    }
  }
}

export async function showDiffCoverageBranch(): Promise<void> {
  const path = getWorkspacePath();

  if (path) {
    const picked = await pickBaseBranch(path)

    if (picked) {
      showDiffCoverage(path, picked.branch);
    }
  }
}

async function showDiffCoverage(path: string, picked: string): Promise<void> {
  const coverageMap = await getExcoverallsCoverageMap(path);
  let diffs = await getFileDiffs(path, picked);
  diffs = diffs.filter((diff) => coverageMap.get(diff.filename));

  diffs.forEach((diff) => {
    const diffCov = coverageMap.get(diff.filename);

    if (diffCov) {
      diff.lines.forEach((line) => {
        line.called = diffCov.at(line.number - 1) ?? null;
      });
    }
  });

  const panel = vscode.window.createWebviewPanel(
    "diffCoverageView",
    "Diff Coverage: Git Diff Lines",
    vscode.ViewColumn.Active,
    { enableScripts: false },
  );

  panel.webview.html = renderDiffsHtml(diffs);
}

async function pickBaseCommit(path: string) {
  const commits = await getRecentCommits(path, 100);

  const picked = await vscode.window.showQuickPick(
    commits.map((c) => ({
      label: `${c.decorations} ${c.subject}`.replace(/\s+/g, " ").trim(),
      description: `${c.dateISO}  ${c.author}`,
      detail: c.hash,
      commit: c,
    })),
    {
      title: "Select base commit for diff",
      placeHolder: "Type to filter commits (hash / message / author)",
      matchOnDescription: true,
      matchOnDetail: true,
    }
  );

  return picked;
}

async function pickBaseBranch(path: string) {
  const branches = await getBranches(path);

  const picked = await vscode.window.showQuickPick(
    branches.map((b) => ({
      label: b,
      branch: b,
    })),
    {
      title: "Select base branch for diff",
      placeHolder: "Type to filter branches",
      matchOnDescription: true,
      matchOnDetail: true,
    }
  );

  return picked;
}

function getWorkspacePath(): string | undefined {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    vscode.window.showErrorMessage("No workspace folder is open.");
    return;
  }

  return ws.uri.fsPath
}