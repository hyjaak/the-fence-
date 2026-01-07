import { readFile } from 'fs/promises';
import fg from 'fast-glob';
import path from 'path';
import chalk from 'chalk';
import { logger } from './logger.js';

const FORBIDDEN_TERMS = [
  'guarantee',
  'immunity',
  'prevent all',
  'ensure',
  'always',
  'never',
];

export interface LintViolation {
  filePath: string;
  term: string;
  lineNumber: number;
  line: string;
}

export async function lintNonClaims(rootDir: string): Promise<LintViolation[]> {
  const violations: LintViolation[] = [];

  // Find all markdown files in docs and docs/phases
  const docFiles = await fg(['docs/**/*.md', 'docs/*.md'], {
    cwd: rootDir,
    absolute: true,
    onlyFiles: true,
  });

  for (const filePath of docFiles) {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      for (const term of FORBIDDEN_TERMS) {
        if (lowerLine.includes(term.toLowerCase())) {
          violations.push({
            filePath,
            term,
            lineNumber: i + 1,
            line: line.trim(),
          });
        }
      }
    }
  }

  return violations;
}

export function reportLintViolations(violations: LintViolation[]): void {
  if (violations.length === 0) {
    logger.info('Non-claims lint: PASS');
    return;
  }

  logger.error(`Non-claims lint: FAIL - Found ${violations.length} violation(s)`);
  console.log(chalk.red('\n=== NON-CLAIMS LINT VIOLATIONS ===\n'));

  const violationsByFile = new Map<string, LintViolation[]>();
  for (const v of violations) {
    const existing = violationsByFile.get(v.filePath) || [];
    existing.push(v);
    violationsByFile.set(v.filePath, existing);
  }

  for (const [filePath, fileViolations] of violationsByFile) {
    console.log(chalk.yellow(`File: ${path.basename(filePath)}`));
    for (const v of fileViolations) {
      console.log(
        `  ${chalk.red('✗')} Line ${v.lineNumber}: Found forbidden term "${v.term}"`
      );
      console.log(`    ${chalk.gray(v.line.substring(0, 100))}`);
    }
    console.log('');
  }

  console.log(chalk.red('Non-claims lint failed. Remove absolute claims from doctrine files.'));
  console.log('');
}
