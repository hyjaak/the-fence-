#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import chalk from 'chalk';
import { loadDoctrineFiles, loadAllowlist } from './loader.js';
import { validateDoctrine } from './validator.js';
import { generateIndex, generateBuildPlan } from './generator.js';
import { logger } from './logger.js';
import { lintNonClaims, reportLintViolations } from './nonClaimsLint.js';

const program = new Command();

program
  .name('thefence')
  .description('THEFENCE doctrine validation and build system')
  .version('1.0.0');

program
  .command('validate')
  .description('Validate doctrine files')
  .option('-d, --docs <path>', 'Path to docs directory', './docs')
  .action(async (options) => {
    try {
      const docsDir = path.resolve(process.cwd(), options.docs);
      
      console.log(chalk.blue('Running Non-Claims linter...'));
      const lintViolations = await lintNonClaims(docsDir);
      
      if (lintViolations.length > 0) {
        console.log('');
        reportLintViolations(lintViolations);
        console.log('');
        console.log(chalk.red.bold('✗ NON-CLAIMS LINTING FAILED'));
        console.log(chalk.red(`Found ${lintViolations.length} forbidden term(s) in doctrine files`));
        process.exit(1);
      }
      console.log(chalk.green('✓ Non-Claims linting passed'));
      
      console.log(chalk.blue('Loading doctrine files...'));
      const files = await loadDoctrineFiles(docsDir);
      const allowlist = await loadAllowlist(docsDir);
      
      console.log(chalk.blue('Validating...'));
      const result = await validateDoctrine(files, allowlist);
      
      console.log('');
      console.log(chalk.bold('=== VALIDATION REPORT ==='));
      console.log('');
      console.log(`Total files: ${result.totalFiles}`);
      console.log(`Total phases: ${result.totalPhases}`);
      console.log(`Errors: ${result.errors.length}`);
      console.log(`Warnings: ${result.warnings.length}`);
      console.log('');
      
      if (result.errors.length > 0) {
        console.log(chalk.red.bold('ERRORS:'));
        result.errors.forEach(err => console.log(chalk.red(`  ✗ ${err}`)));
        console.log('');
      }
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow.bold('WARNINGS:'));
        result.warnings.forEach(warn => console.log(chalk.yellow(`  ⚠ ${warn}`)));
        console.log('');
      }
      
      if (result.valid) {
        console.log(chalk.green.bold('✓ VALIDATION PASSED'));
        process.exit(0);
      } else {
        console.log(chalk.red.bold('✗ VALIDATION FAILED'));
        process.exit(1);
      }
    } catch (error) {
      logger.error('Validation failed', error);
      console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build index and plan documents')
  .option('-d, --docs <path>', 'Path to docs directory', './docs')
  .action(async (options) => {
    try {
      const docsDir = path.resolve(process.cwd(), options.docs);
      
      console.log(chalk.blue('Loading doctrine files...'));
      const files = await loadDoctrineFiles(docsDir);
      const allowlist = await loadAllowlist(docsDir);
      
      console.log(chalk.blue('Validating...'));
      const result = await validateDoctrine(files, allowlist);
      
      if (!result.valid) {
        console.log(chalk.red('Validation failed, aborting build'));
        console.log(chalk.red(`Errors: ${result.errors.length}`));
        result.errors.slice(0, 5).forEach(err => console.log(chalk.red(`  ✗ ${err}`)));
        process.exit(1);
      }
      
      console.log(chalk.blue('Generating index...'));
      const indexPath = path.join(docsDir, 'THEFENCE_INDEX_001.md');
      await generateIndex(files, result, indexPath);
      
      console.log(chalk.blue('Generating build plan...'));
      const planPath = path.join(docsDir, 'THEFENCE_BUILD_PLAN_001.md');
      await generateBuildPlan(files, planPath);
      
      console.log('');
      console.log(chalk.green.bold('✓ BUILD COMPLETE'));
      console.log(`  Index: ${indexPath}`);
      console.log(`  Plan: ${planPath}`);
      process.exit(0);
    } catch (error) {
      logger.error('Build failed', error);
      console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('anomaly')
  .description('Run infrastructure anomaly detection')
  .option('-f, --file <path>', 'Path to NDJSON events file (reads from stdin if omitted)')
  .action(async (options) => {
    // Delegate to dedicated anomaly CLI
    const { execSync } = await import('child_process');
    try {
      const args = options.file ? `--file "${options.file}"` : '';
      execSync(`node dist/clis/anomaly.js ${args}`, { stdio: 'inherit' });
    } catch (error) {
      process.exit(1);
    }
  });

program.parse();
