import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { createPhaseRegistry } from '../src/phase/phaseRegistry.js';

describe('phaseRegistry', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(tmpdir(), 'thefence-test-'));
  });

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should load phases from docs/phases directory', async () => {
    const phasesDir = path.join(tempDir, 'docs', 'phases');
    await mkdir(phasesDir, { recursive: true });

    await writeFile(
      path.join(phasesDir, 'THEFENCE_PHASE01_TEST_001.md'),
      '# Test Phase 01\n\nSome content\n\nEND OF FILE\n'
    );

    await writeFile(
      path.join(phasesDir, 'THEFENCE_PHASE02_TEST_001.md'),
      '# Test Phase 02\n\nSome content\n\nEND OF FILE\n'
    );

    const registry = await createPhaseRegistry({ rootDir: tempDir });
    const phases = registry.listPhasesSorted();

    expect(phases).toHaveLength(2);
    expect(phases[0].phaseId).toBe(1);
    expect(phases[1].phaseId).toBe(2);
    expect(phases[0].title).toBe('Test Phase 01');
    expect(phases[1].title).toBe('Test Phase 02');
  });

  it('should throw if END OF FILE is missing', async () => {
    const phasesDir = path.join(tempDir, 'docs', 'phases');
    await mkdir(phasesDir, { recursive: true });

    await writeFile(
      path.join(phasesDir, 'THEFENCE_PHASE01_TEST_001.md'),
      '# Test Phase 01\n\nSome content without ending\n'
    );

    await expect(
      createPhaseRegistry({ rootDir: tempDir })
    ).rejects.toThrow('Missing END OF FILE');
  });

  it('should throw on duplicate phaseId across files', async () => {
    const phasesDir = path.join(tempDir, 'docs', 'phases');
    await mkdir(phasesDir, { recursive: true });

    await writeFile(
      path.join(phasesDir, 'THEFENCE_PHASE01_FIRST_001.md'),
      '# First\n\nEND OF FILE\n'
    );

    await writeFile(
      path.join(phasesDir, 'THEFENCE_PHASE01_SECOND_001.md'),
      '# Second\n\nEND OF FILE\n'
    );

    await expect(
      createPhaseRegistry({ rootDir: tempDir })
    ).rejects.toThrow(/Duplicate phaseId 1/);
  });

  it('should include root-level phase files for backward compatibility', async () => {
    const phasesDir = path.join(tempDir, 'docs', 'phases');
    await mkdir(phasesDir, { recursive: true });

    // Phase in docs/phases
    await writeFile(
      path.join(phasesDir, 'THEFENCE_PHASE01_DOCS_001.md'),
      '# Phase from docs/phases\n\nEND OF FILE\n'
    );

    // Phase in root
    await writeFile(
      path.join(tempDir, 'THEFENCE_PHASE02_ROOT_001.md'),
      '# Phase from root\n\nEND OF FILE\n'
    );

    const registry = await createPhaseRegistry({ rootDir: tempDir });
    const phases = registry.listPhasesSorted();

    expect(phases).toHaveLength(2);
    expect(phases[0].phaseId).toBe(1);
    expect(phases[1].phaseId).toBe(2);
    expect(phases[0].title).toBe('Phase from docs/phases');
    expect(phases[1].title).toBe('Phase from root');
  });

  it('should provide getPhaseById and hasPhase methods', async () => {
    const phasesDir = path.join(tempDir, 'docs', 'phases');
    await mkdir(phasesDir, { recursive: true });

    await writeFile(
      path.join(phasesDir, 'THEFENCE_PHASE05_TEST_001.md'),
      '# Test Phase 05\n\nEND OF FILE\n'
    );

    const registry = await createPhaseRegistry({ rootDir: tempDir });

    expect(registry.hasPhase(5)).toBe(true);
    expect(registry.hasPhase(99)).toBe(false);

    const phase5 = registry.getPhaseById(5);
    expect(phase5).toBeDefined();
    expect(phase5?.phaseId).toBe(5);
    expect(phase5?.title).toBe('Test Phase 05');

    const phase99 = registry.getPhaseById(99);
    expect(phase99).toBeUndefined();
  });
});
