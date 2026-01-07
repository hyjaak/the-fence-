import path from 'path';
import fg from 'fast-glob';

export async function discoverPhaseFiles(rootDir: string): Promise<string[]> {
  const pathSet = new Set<string>();

  // 1) Look in docs/phases for *.md
  const phasesDir = path.join(rootDir, 'docs', 'phases');
  const phasesDirFiles = await fg('*.md', {
    cwd: phasesDir,
    absolute: true,
    onlyFiles: true,
  }).catch(() => [] as string[]);

  phasesDirFiles.forEach((p) => pathSet.add(p));

  // 2) Look in rootDir for THEFENCE_PHASE\d+_*.md
  const rootFiles = await fg('THEFENCE_PHASE[0-9]*_*.md', {
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
  });

  rootFiles.forEach((p) => pathSet.add(p));

  return Array.from(pathSet);
}
