import { describe, it, expect } from 'vitest';
import { validateDoctrine } from '../src/validator';
import type { DoctrineFile } from '../src/types';

describe('validateDoctrine', () => {
  it('should pass validation for valid files', async () => {
    const files: DoctrineFile[] = [
      {
        phaseNumber: 1,
        slugName: 'TEST',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE1_TEST_001',
        filePath: '/test/file1.md',
        content: '# Test\n\nEND OF FILE',
      },
    ];
    const allowlist = new Set<string>();
    
    const result = await validateDoctrine(files, allowlist);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing END OF FILE', async () => {
    const files: DoctrineFile[] = [
      {
        phaseNumber: 1,
        slugName: 'TEST',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE1_TEST_001',
        filePath: '/test/file1.md',
        content: '# Test\n\nNo proper ending',
      },
    ];
    const allowlist = new Set<string>();
    
    const result = await validateDoctrine(files, allowlist);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('END OF FILE');
  });

  it('should detect duplicate file names', async () => {
    const files: DoctrineFile[] = [
      {
        phaseNumber: 1,
        slugName: 'TEST',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE1_TEST_001',
        filePath: '/test/file1.md',
        content: '# Test\n\nEND OF FILE',
      },
      {
        phaseNumber: 2,
        slugName: 'OTHER',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE1_TEST_001',
        filePath: '/test/file2.md',
        content: '# Test\n\nEND OF FILE',
      },
    ];
    const allowlist = new Set<string>();
    
    const result = await validateDoctrine(files, allowlist);
    
    expect(result.valid).toBe(false);
    expect(result.duplicateFiles).toContain('THEFENCE_PHASE1_TEST_001');
  });

  it('should detect duplicate concepts across phases', async () => {
    const files: DoctrineFile[] = [
      {
        phaseNumber: 1,
        slugName: 'TEST1',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE1_TEST1_001',
        filePath: '/test/file1.md',
        content: '# Test\n\n## Rules\n\n- No unauthorized access\n\nEND OF FILE',
      },
      {
        phaseNumber: 2,
        slugName: 'TEST2',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE2_TEST2_001',
        filePath: '/test/file2.md',
        content: '# Test\n\n## Constraints\n\n- No unauthorized access\n\nEND OF FILE',
      },
    ];
    const allowlist = new Set<string>();
    
    const result = await validateDoctrine(files, allowlist);
    
    expect(result.valid).toBe(false);
    expect(result.duplicateConcepts.length).toBeGreaterThan(0);
  });

  it('should allow duplicate concepts in allowlist', async () => {
    const files: DoctrineFile[] = [
      {
        phaseNumber: 1,
        slugName: 'TEST1',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE1_TEST1_001',
        filePath: '/test/file1.md',
        content: '# Test\n\n## Rules\n\n- No unauthorized access\n\nEND OF FILE',
      },
      {
        phaseNumber: 2,
        slugName: 'TEST2',
        versionNumber: 1,
        fullName: 'THEFENCE_PHASE2_TEST2_001',
        filePath: '/test/file2.md',
        content: '# Test\n\n## Constraints\n\n- No unauthorized access\n\nEND OF FILE',
      },
    ];
    const allowlist = new Set<string>(['no unauthorized access']);
    
    const result = await validateDoctrine(files, allowlist);
    
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
