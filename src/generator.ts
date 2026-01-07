import fs from 'fs/promises';
import path from 'path';
import type { DoctrineFile, ValidationResult } from './types.js';
import { logger } from './logger.js';

export async function generateIndex(
  files: DoctrineFile[],
  validation: ValidationResult,
  outputPath: string
): Promise<void> {
  const sortedFiles = files
    .filter(f => f.phaseNumber > 0)
    .sort((a, b) => a.phaseNumber - b.phaseNumber);
  
  const lines: string[] = [];
  lines.push('# THEFENCE INDEX');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total doctrine files: ${validation.totalFiles}`);
  lines.push(`- Total phases: ${validation.totalPhases}`);
  lines.push(`- Validation status: ${validation.valid ? 'PASS' : 'FAIL'}`);
  lines.push(`- Conflicts found: ${validation.errors.length}`);
  lines.push('');
  lines.push('## Doctrine Files by Phase');
  lines.push('');
  
  for (const file of sortedFiles) {
    lines.push(`- Phase ${file.phaseNumber}: ${file.fullName}`);
  }
  
  lines.push('');
  lines.push('END OF FILE');
  
  await fs.writeFile(outputPath, lines.join('\n'), 'utf-8');
  logger.info(`Generated index at ${outputPath}`);
}

export async function generateBuildPlan(
  files: DoctrineFile[],
  outputPath: string
): Promise<void> {
  const sortedFiles = files
    .filter(f => f.phaseNumber > 0)
    .sort((a, b) => a.phaseNumber - b.phaseNumber);
  
  const lines: string[] = [];
  lines.push('# THEFENCE BUILD PLAN');
  lines.push('');
  lines.push('## Build Order (by Phase Number)');
  lines.push('');
  
  for (const file of sortedFiles) {
    lines.push(`### Phase ${file.phaseNumber}: ${file.slugName}`);
    lines.push('');
    
    const purposeMatch = file.content.match(/^#+\s*purpose\s*$/im);
    if (purposeMatch) {
      const startIdx = file.content.indexOf(purposeMatch[0]) + purposeMatch[0].length;
      const nextHeaderMatch = file.content.substring(startIdx).match(/^#+\s+/m);
      const endIdx = nextHeaderMatch ? startIdx + file.content.substring(startIdx).indexOf(nextHeaderMatch[0]) : startIdx + 200;
      const purposeText = file.content.substring(startIdx, endIdx).trim().split('\n')[0];
      
      if (purposeText) {
        lines.push(`**Purpose:** ${purposeText.substring(0, 150)}`);
        lines.push('');
      }
    }
  }
  
  lines.push('END OF FILE');
  
  await fs.writeFile(outputPath, lines.join('\n'), 'utf-8');
  logger.info(`Generated build plan at ${outputPath}`);
}
