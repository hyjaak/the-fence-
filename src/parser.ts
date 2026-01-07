import path from 'path';
import type { DoctrineFile } from './types.js';

const FILENAME_PATTERN = /^THEFENCE_PHASE([0-9A-Z]+)_(.+)_(\d+)\.md$/i;

export function parseFilename(filename: string): Omit<DoctrineFile, 'content' | 'filePath'> | null {
  const match = filename.match(FILENAME_PATTERN);
  if (!match) return null;

  const [, phaseStr, slugName, versionStr] = match;
  
  let phaseNumber: number;
  if (/^\d+$/.test(phaseStr)) {
    phaseNumber = parseInt(phaseStr, 10);
  } else {
    phaseNumber = -1;
  }

  const versionNumber = parseInt(versionStr, 10);

  return {
    phaseNumber,
    slugName: slugName.toUpperCase(),
    versionNumber,
    fullName: filename.replace('.md', ''),
  };
}

export function validateEndOfFile(content: string): boolean {
  const lines = content.split('\n');
  const lastNonEmptyLine = lines
    .reverse()
    .find(line => line.trim() !== '');
  
  return lastNonEmptyLine?.trim() === 'END OF FILE';
}

export function extractConcepts(content: string): string[] {
  const concepts: string[] = [];
  const lines = content.split('\n');
  
  let inRelevantSection = false;
  const relevantHeaders = /^#+\s*(rules|constraints|non-claims|explicit non-claims|hard boundaries)/i;
  
  for (const line of lines) {
    if (line.match(/^#+\s+/)) {
      inRelevantSection = relevantHeaders.test(line);
      continue;
    }
    
    if (inRelevantSection && line.trim().startsWith('-')) {
      const concept = line.replace(/^-\s*/, '').trim();
      if (concept) {
        concepts.push(concept);
      }
    }
  }
  
  return concepts;
}

export function normalizeConcept(concept: string): string {
  return concept
    .toLowerCase()
    .replace(/[^\w\s\-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function hashConcept(concept: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(concept).digest('hex');
}
