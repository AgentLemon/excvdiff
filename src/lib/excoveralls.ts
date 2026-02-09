import * as path from "node:path";
import { readFile } from "node:fs/promises";

type ExcoverallsJson = {
  source_files?: Array<{
    name?: string;
    coverage?: Array<number | null>;
  }>;
};

export async function getExcoverallsCoverageMap(
  workspaceRoot: string
): Promise<Map<string, Array<number | null>>> {
  const filePath = path.join(workspaceRoot, "cover", "excoveralls.json");

  const raw = await readFile(filePath, "utf8");

  let parsed: ExcoverallsJson;
  try {
    parsed = JSON.parse(raw) as ExcoverallsJson;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${filePath}`);
  }

  const sourceFiles = parsed.source_files;
  if (!Array.isArray(sourceFiles)) {
    throw new Error(`Invalid excoveralls format: missing "source_files" array in ${filePath}`);
  }

  const map = new Map<string, Array<number | null>>();

  for (const sf of sourceFiles) {
    const name = sf?.name;
    const coverage = sf?.coverage;

    if (typeof name !== "string" || name.trim().length === 0) continue;
    if (!Array.isArray(coverage)) continue;

    map.set(name, coverage);
  }

  return map;
}