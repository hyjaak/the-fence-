import { describe, it, expect } from 'vitest';
import { parseFilename, validateEndOfFile, normalizeConcept, extractConcepts } from '../src/parser';

describe('parseFilename', () => {
  it('should parse valid THEFENCE filename', () => {
    const result = parseFilename('THEFENCE_PHASE10_COMPONENT_ISOLATION_001.md');
    expect(result).toEqual({
      phaseNumber: 10,
      slugName: 'COMPONENT_ISOLATION',
      versionNumber: 1,
      fullName: 'THEFENCE_PHASE10_COMPONENT_ISOLATION_001',
    });
  });

  it('should parse filename with alphanumeric phase', () => {
    const result = parseFilename('THEFENCE_PHASE1A_TEST_001.md');
    expect(result).toEqual({
      phaseNumber: -1,
      slugName: 'TEST',
      versionNumber: 1,
      fullName: 'THEFENCE_PHASE1A_TEST_001',
    });
  });

  it('should return null for invalid filename', () => {
    const result = parseFilename('invalid_file.md');
    expect(result).toBeNull();
  });

  it('should parse filename with underscores in slug', () => {
    const result = parseFilename('THEFENCE_PHASE5_OPERATOR_CONTROL_MODEL_001.md');
    expect(result).toEqual({
      phaseNumber: 5,
      slugName: 'OPERATOR_CONTROL_MODEL',
      versionNumber: 1,
      fullName: 'THEFENCE_PHASE5_OPERATOR_CONTROL_MODEL_001',
    });
  });
});

describe('validateEndOfFile', () => {
  it('should return true for content ending with END OF FILE', () => {
    const content = 'Some content\n\nEND OF FILE';
    expect(validateEndOfFile(content)).toBe(true);
  });

  it('should return true with trailing whitespace', () => {
    const content = 'Some content\n\nEND OF FILE\n\n';
    expect(validateEndOfFile(content)).toBe(true);
  });

  it('should return false for content without END OF FILE', () => {
    const content = 'Some content\n\nThe end.';
    expect(validateEndOfFile(content)).toBe(false);
  });

  it('should return false for empty content', () => {
    expect(validateEndOfFile('')).toBe(false);
  });
});

describe('normalizeConcept', () => {
  it('should normalize concept to lowercase', () => {
    expect(normalizeConcept('Test Concept')).toBe('test concept');
  });

  it('should remove punctuation except hyphens and underscores', () => {
    expect(normalizeConcept('Test: concept, with-punctuation_here!')).toBe(
      'test concept with-punctuation_here'
    );
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeConcept('test    concept   here')).toBe('test concept here');
  });

  it('should trim whitespace', () => {
    expect(normalizeConcept('  test concept  ')).toBe('test concept');
  });
});

describe('extractConcepts', () => {
  it('should extract concepts from Rules section', () => {
    const content = `
# Title

## Rules

- First rule
- Second rule

## Other Section

- Not extracted
`;
    const concepts = extractConcepts(content);
    expect(concepts).toEqual(['First rule', 'Second rule']);
  });

  it('should extract from multiple relevant sections', () => {
    const content = `
## Rules

- Rule one

## Constraints

- Constraint one

## Non-Claims

- Non-claim one
`;
    const concepts = extractConcepts(content);
    expect(concepts).toEqual(['Rule one', 'Constraint one', 'Non-claim one']);
  });

  it('should handle empty content', () => {
    expect(extractConcepts('')).toEqual([]);
  });

  it('should ignore bullets outside relevant sections', () => {
    const content = `
## Purpose

- Not a concept

## Rules

- This is a concept
`;
    const concepts = extractConcepts(content);
    expect(concepts).toEqual(['This is a concept']);
  });
});
