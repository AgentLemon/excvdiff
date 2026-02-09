export interface FileDiff {
  filename: string;
  lines: FileDiffLine[];
}

export interface FileDiffLine {
  number: number;
  isAdded: boolean;
  content: string;
  called: number | null;
}

export interface GitCommit {
  hash: string;        // full hash
  shortHash: string;   // abbrev
  decorations: string; // "(HEAD -> main, origin/main)" or ""
  subject: string;     // commit message subject
  author: string;      // author name
  dateISO: string;     // YYYY-MM-DD
}
