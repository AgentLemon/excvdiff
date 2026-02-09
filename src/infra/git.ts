import * as vscode from "vscode";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runGitDiff(
  cwd: string,
  commitId: string,
): Promise<string> {
  const gitPath = await getGitExecutable();

  const { stdout } = await execFileAsync(
    gitPath,
    ["diff", commitId, "--no-color", "--unified=3"],
    { cwd },
  );

  return stdout;
}

export async function runGitLog(cwd: string, limit: number) {
  const gitPath = await getGitExecutable();

  const { stdout } = await execFileAsync(
    gitPath,
    [
      "log",
      `-n`,
      String(limit),
      "--decorate",
      `--date=short`,
      `--pretty=format:%H%x09%h%x09%d%x09%s%x09%an%x09%ad`,
    ],
    { cwd },
  );

  return stdout;
}

async function getGitExecutable(): Promise<string> {
  const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;

  if (!gitExtension) {
    throw new Error("VS Code Git extension not available.");
  }

  const git = gitExtension.getAPI(1);

  return git?.git?.path;
}
