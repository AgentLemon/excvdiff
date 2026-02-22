import { runGitBranches, runGitRevParse } from "../infra/git";

export async function getBranches(cwd: string): Promise<string[]> {
  const branchesStdout = await runGitBranches(cwd)
  const mainBranchStdout = await runGitRevParse(cwd);
  
  const branches = parseStdout(branchesStdout);
  const mainBranch = parseStdout(mainBranchStdout);
  
  return [...mainBranch, ...branches];
}

function parseStdout(stdout: string): string[] {
  return stdout.split(/\r?\n/).filter(Boolean)
}
