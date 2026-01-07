import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { lintNonClaims } from '../src/nonClaimsLint.js';

describe('nonClaimsLint', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'fence-lint-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should detect forbidden term "guarantee"', async () => {
    const docsDir = join(tempDir, 'docs');
    await mkdir(docsDir, { recursive: true });
    
    const content = `# Test Phase

This will guarantee success.

END OF FILE`;

    await writeFile(join(docsDir, 'test.md'), content);

    const violations = await lintNonClaims(tempDir);
    
    expect(violations.length).toBe(1);
    expect(violations[0].term).toBe('guarantee');
    expect(violations[0].lineNumber).toBe(3);
  });

  it('should detect forbidden term "prevent all"', async () => {
    const docsDir = join(tempDir, 'docs');
    await mkdir(docsDir, { recursive: true });
    
    const content = `# Test Phase

This will prevent all errors.

END OF FILE`;

    await writeFile(join(docsDir, 'test.md'), content);

    const violations = await lintNonClaims(tempDir);
    
    expect(violations.length).toBe(1);
    expect(violations[0].term).toBe('prevent all');
  });

  it('should detect multiple violations in one file', async () => {
    const docsDir = join(tempDir, 'docs');
    await mkdir(docsDir, { recursive: true });
    
    const content = `# Test Phase

This will ensure success and guarantee results.
We must always prevent all errors.

END OF FILE`;

    await writeFile(join(docsDir, 'test.md'), content);

    const violations = await lintNonClaims(tempDir);
    
    expect(violations.length).toBe(4);
    const terms = violations.map(v => v.term);
    expect(terms).toContain('ensure');
    expect(terms).toContain('guarantee');
    expect(terms).toContain('always');
    expect(terms).toContain('prevent all');
  });

  it('should return empty array for clean file', async () => {
    const docsDir = join(tempDir, 'docs');
    await mkdir(docsDir, { recursive: true });
    
    const content = `# Test Phase

This should detect errors and may prevent some issues.

END OF FILE`;

    await writeFile(join(docsDir, 'test.md'), content);

    const violations = await lintNonClaims(tempDir);
    
    expect(violations.length).toBe(0);
  });

  it('should be case-insensitive', async () => {
    const docsDir = join(tempDir, 'docs');
    await mkdir(docsDir, { recursive: true });
    
    const content = `# Test Phase

This will GUARANTEE success.

END OF FILE`;

    await writeFile(join(docsDir, 'test.md'), content);

    const violations = await lintNonClaims(tempDir);
    
    expect(violations.length).toBe(1);
    expect(violations[0].term).toBe('guarantee');
  });

  it('should scan multiple files', async () => {
    const docsDir = join(tempDir, 'docs');
    await mkdir(docsDir, { recursive: true });
    
    const content1 = `# Phase 1
This will guarantee results.
END OF FILE`;

    const content2 = `# Phase 2
This will ensure compliance.
END OF FILE`;

    await writeFile(join(docsDir, 'phase1.md'), content1);
    await writeFile(join(docsDir, 'phase2.md'), content2);

    const violations = await lintNonClaims(tempDir);
    
    expect(violations.length).toBe(2);
    expect(violations.some(v => v.term === 'guarantee')).toBe(true);
    expect(violations.some(v => v.term === 'ensure')).toBe(true);
  });
});
