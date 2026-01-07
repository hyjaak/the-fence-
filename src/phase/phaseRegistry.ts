import { readFile } from 'fs/promises';
import path from 'path';
import { discoverPhaseFiles } from './phaseDiscovery.js';
import { parsePhaseMarkdown } from './phaseParser.js';
import type { PhaseRecord, PhaseRegistry } from './phaseTypes.js';

export async function createPhaseRegistry(opts: {
  rootDir: string;
}): Promise<PhaseRegistry> {
  const { rootDir } = opts;

  // Discover all phase files
  const filePaths = await discoverPhaseFiles(rootDir);

  const records: PhaseRecord[] = [];
  const phaseIdMap = new Map<number, string>();
  const filenameMap = new Map<string, string>();

  for (const fullPath of filePaths) {
    const content = await readFile(fullPath, 'utf-8');
    const { phaseId, title } = parsePhaseMarkdown(fullPath, content);
    const filename = path.basename(fullPath);

    // Check for duplicate phaseId
    const existingPhaseIdPath = phaseIdMap.get(phaseId);
    if (existingPhaseIdPath) {
      throw new Error(
        `Duplicate phaseId ${phaseId}: ${existingPhaseIdPath} and ${fullPath}`
      );
    }
    phaseIdMap.set(phaseId, fullPath);

    // Check for duplicate filename
    const existingFilenamePath = filenameMap.get(filename);
    if (existingFilenamePath) {
      throw new Error(
        `Duplicate filename ${filename}: ${existingFilenamePath} and ${fullPath}`
      );
    }
    filenameMap.set(filename, fullPath);

    records.push({
      phaseId,
      title,
      filename,
      fullPath,
      content,
    });
  }

  // Sort by phaseId
  records.sort((a, b) => a.phaseId - b.phaseId);

  const recordsByPhaseId = new Map<number, PhaseRecord>();
  records.forEach((r) => recordsByPhaseId.set(r.phaseId, r));

  return {
    getPhaseById(id: number): PhaseRecord | undefined {
      return recordsByPhaseId.get(id);
    },
    hasPhase(id: number): boolean {
      return recordsByPhaseId.has(id);
    },
    listPhasesSorted(): PhaseRecord[] {
      return [...records];
    },
  };
}
