import { runGitDiff } from "../infra/git";
import { FileDiff, FileDiffLine } from "./models";

export async function getFileDiffs(cwd: string, commitId: string): Promise<FileDiff[]> {
  let stdout: string;
  try {
    stdout = await runGitDiff(cwd, commitId)
  } catch (e: any) {
    const out = e?.stdout ?? "";
    const err = e?.stderr ?? "";
    if (out) stdout = out;
    else throw new Error(`git diff failed: ${err || String(e)}`);
  }

  return parseGitDiff(stdout);
}

function parseGitDiff(diffText: string): FileDiff[] {
  const files: FileDiff[] = [];

  let currentFile: FileDiff | null = null;
  let inHunk = false;
  let newLine = 0;

  const lines = diffText.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.startsWith("diff --git ")) {
      inHunk = false;
      newLine = 0;

      const match = /^diff --git a\/(.+?) b\/(.+)$/.exec(line);
      const filename = match?.[2] ?? ""; // b/...
      currentFile = filename
        ? { filename: normalizeGitPath(filename), lines: [] }
        : { filename: "", lines: [] };

      files.push(currentFile);
      continue;
    }

    if (!currentFile) continue;

    if (line.startsWith("Binary files ")) {
      inHunk = false;
      continue;
    }

    if (line.startsWith("+++ ")) {
      const m = /^\+\+\+ b\/(.+)$/.exec(line);
      if (m?.[1]) currentFile.filename = normalizeGitPath(m[1]);
      continue;
    }

    if (line.startsWith("@@")) {
      const h = /@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@/.exec(line);
      if (!h) {
        inHunk = false;
        continue;
      }

      inHunk = true;
      newLine = parseInt(h[3], 10); // берем номер из "+..."
      continue;
    }

    if (!inHunk) continue;

    if (line.startsWith("\\ No newline at end of file")) continue;

    const first = line[0];

    if (first === " ") {
      pushLine(currentFile.lines, newLine, line.slice(1), false);
      newLine += 1;
      continue;
    }

    if (first === "+" && !line.startsWith("+++")) {
      pushLine(currentFile.lines, newLine, line.slice(1), true);
      newLine += 1;
      continue;
    }

    if (first === "-" && !line.startsWith("---")) {
      continue;
    }
  }

  return files.filter((f) => f.filename.trim().length > 0);
}

function pushLine(target: FileDiffLine[], number: number, content: string, isAdded: boolean) {
  if (!Number.isFinite(number) || number <= 0) return;
  target.push({ number, content, isAdded, called: null });
}

function normalizeGitPath(p: string): string {
  return p.replace(/^[ab]\//, "");
}
