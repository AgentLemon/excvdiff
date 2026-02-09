import * as vscode from "vscode";
import { getFileDiffs } from "../lib/gitDiff";
import { getExcoverallsCoverageMap } from "../lib/excoveralls";
import { renderDiffsHtml } from "../views/coverage";
import { getRecentCommits } from "../lib/gitLog";

export async function showDiffCoverage(): Promise<void> {
  const ws = vscode.workspace.workspaceFolders?.[0];
  if (!ws) {
    vscode.window.showErrorMessage("No workspace folder is open.");
    return;
  }

  const path = ws.uri.fsPath

  const picked = await pickBaseCommit(path)
  if (!picked) return;

  const coverageMap = await getExcoverallsCoverageMap(path);
  let diffs = await getFileDiffs(path, picked.commit.hash);
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
