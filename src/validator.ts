import type { DoctrineFile, ValidationResult } from './types.js';
import { validateEndOfFile, extractConcepts, normalizeConcept, hashConcept } from './parser.js';
import { logger } from './logger.js';

export async function validateDoctrine(
  files: DoctrineFile[],
  allowlist: Set<string>
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicateFiles: string[] = [];
  const duplicatePhases: number[] = [];
  const duplicateConcepts: Array<{ concept: string; hash: string; phases: number[] }> = [];
  
  const fileNames = new Map<string, string>();
  const phaseNumbers = new Map<number, string[]>();
  const conceptRegistry = new Map<string, { concept: string; phases: number[] }>();
  
  for (const file of files) {
    if (!validateEndOfFile(file.content)) {
      errors.push(`File ${file.fullName}.md does not end with "END OF FILE"`);
    }
    
    if (fileNames.has(file.fullName)) {
      duplicateFiles.push(file.fullName);
      errors.push(`Duplicate file name: ${file.fullName}.md (already seen at ${fileNames.get(file.fullName)})`);
    } else {
      fileNames.set(file.fullName, file.filePath);
    }
    
    if (file.phaseNumber > 0) {
      if (!phaseNumbers.has(file.phaseNumber)) {
        phaseNumbers.set(file.phaseNumber, []);
      }
      phaseNumbers.get(file.phaseNumber)!.push(file.slugName);
    }
    
    const concepts = extractConcepts(file.content);
    
    for (const concept of concepts) {
      const normalized = normalizeConcept(concept);
      if (!normalized) continue;
      
      const hash = await hashConcept(normalized);
      
      if (!conceptRegistry.has(hash)) {
        conceptRegistry.set(hash, { concept: normalized, phases: [] });
      }
      
      const entry = conceptRegistry.get(hash)!;
      if (!entry.phases.includes(file.phaseNumber)) {
        entry.phases.push(file.phaseNumber);
      }
    }
  }
  
  for (const [phaseNum, slugs] of phaseNumbers) {
    const uniqueSlugs = new Set(slugs);
    if (slugs.length > uniqueSlugs.size) {
      duplicatePhases.push(phaseNum);
      errors.push(`Duplicate phase number ${phaseNum} with same slug name`);
    }
  }
  
  for (const [hash, entry] of conceptRegistry) {
    if (entry.phases.length > 1) {
      if (!allowlist.has(entry.concept)) {
        duplicateConcepts.push({
          concept: entry.concept,
          hash,
          phases: entry.phases,
        });
        errors.push(
          `Duplicate concept across phases ${entry.phases.join(', ')}: "${entry.concept.substring(0, 60)}..."`
        );
      } else {
        warnings.push(
          `Shared concept (allowlisted) in phases ${entry.phases.join(', ')}: "${entry.concept.substring(0, 60)}..."`
        );
      }
    }
  }
  
  const valid = errors.length === 0;
  const totalPhases = new Set(files.filter(f => f.phaseNumber > 0).map(f => f.phaseNumber)).size;
  
  logger.info(`Validation complete: ${valid ? 'PASS' : 'FAIL'}`);
  logger.info(`Total files: ${files.length}, Total phases: ${totalPhases}`);
  logger.info(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
  
  return {
    valid,
    errors,
    warnings,
    duplicateFiles,
    duplicatePhases,
    duplicateConcepts,
    totalFiles: files.length,
    totalPhases,
  };
}
