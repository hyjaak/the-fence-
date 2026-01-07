import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import type { DoctrineFile } from './types.js';
import { parseFilename, validateEndOfFile } from './parser.js';
import { logger } from './logger.js';

export async function loadDoctrineFiles(docsDir: string): Promise<DoctrineFile[]> {
  const pattern = path.join(docsDir, '**/*.md').replace(/\\/g, '/');
  const files = await fg(pattern, { absolute: true });
  
  logger.info(`Found ${files.length} markdown files in ${docsDir}`);
  
  const doctrineFiles: DoctrineFile[] = [];
  
  for (const filePath of files) {
    const filename = path.basename(filePath);
    const parsed = parseFilename(filename);
    
    if (!parsed) {
      logger.warn(`Skipping file with invalid name format: ${filename}`);
      continue;
    }
    
    const content = await fs.readFile(filePath, 'utf-8');
    
    doctrineFiles.push({
      ...parsed,
      filePath,
      content,
    });
  }
  
  return doctrineFiles;
}

export async function loadAllowlist(docsDir: string): Promise<Set<string>> {
  const allowlistPath = path.join(docsDir, 'THEFENCE_SHARED_CONCEPTS_ALLOWLIST_001.md');
  const allowlist = new Set<string>();
  
  try {
    const content = await fs.readFile(allowlistPath, 'utf-8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed !== 'END OF FILE') {
        if (trimmed.startsWith('-')) {
          allowlist.add(trimmed.replace(/^-\s*/, '').trim());
        } else {
          allowlist.add(trimmed);
        }
      }
    }
    
    logger.info(`Loaded ${allowlist.size} allowed shared concepts`);
  } catch (error) {
    logger.warn('No allowlist found, all duplicate concepts will be flagged');
  }
  
  return allowlist;
}
