import { z } from 'zod';

export const DoctrineFileSchema = z.object({
  phaseNumber: z.number().int().positive(),
  slugName: z.string(),
  versionNumber: z.number().int().positive(),
  fullName: z.string(),
  filePath: z.string(),
  content: z.string(),
});

export type DoctrineFile = z.infer<typeof DoctrineFileSchema>;

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  duplicateFiles: z.array(z.string()),
  duplicatePhases: z.array(z.number()),
  duplicateConcepts: z.array(z.object({
    concept: z.string(),
    hash: z.string(),
    phases: z.array(z.number()),
  })),
  totalFiles: z.number(),
  totalPhases: z.number(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;
