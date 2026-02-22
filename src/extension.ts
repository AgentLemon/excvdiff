// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { showDiffCoverageCommit, showDiffCoverageBranch } from "./commands/showDiffCoverage";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const diffCovCommit = vscode.commands.registerCommand(
    "excvdiff.showDiffCoverageCommit",
    showDiffCoverageCommit,
  );

  const diffCovBranch = vscode.commands.registerCommand(
    "excvdiff.showDiffCoverageBranch",
    showDiffCoverageBranch,
  );

  context.subscriptions.push(diffCovCommit);
  context.subscriptions.push(diffCovBranch);
}

// This method is called when your extension is deactivated
export function deactivate() {}
