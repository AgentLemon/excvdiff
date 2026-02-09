import { GitCommit } from "./models";
import { runGitLog } from "../infra/git";

export async function getRecentCommits(cwd: string, limit: number): Promise<GitCommit[]> {
  const stdout = await runGitLog(cwd, limit)
  const lines = stdout.split(/\r?\n/).filter(Boolean);

  const commits: GitCommit[] = [];
  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length < 6) continue;

    const [hash, shortHash, decorationsRaw, subject, author, dateISO] = parts;

    commits.push({
      hash,
      shortHash,
      decorations: (decorationsRaw || "").trim(),
      subject: subject || "",
      author: author || "",
      dateISO: dateISO || "",
    });
  }

  return commits;
}
