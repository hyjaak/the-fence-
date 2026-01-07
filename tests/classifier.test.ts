import { describe, it, expect } from 'vitest';
import { Classifier } from '../src/anomaly/classifier.js';

describe('classifier', () => {
  it('should classify NORMAL for low scores', () => {
    const classifier = new Classifier();
    
    expect(classifier.classify(0)).toBe('NORMAL');
    expect(classifier.classify(1.5)).toBe('NORMAL');
    expect(classifier.classify(1.99)).toBe('NORMAL');
  });

  it('should classify SUSPICIOUS for scores >= 2.0', () => {
    const classifier = new Classifier();
    
    expect(classifier.classify(2.0)).toBe('SUSPICIOUS');
    expect(classifier.classify(2.5)).toBe('SUSPICIOUS');
    expect(classifier.classify(2.99)).toBe('SUSPICIOUS');
  });

  it('should classify ANOMALOUS for scores >= 3.0', () => {
    const classifier = new Classifier();
    
    expect(classifier.classify(3.0)).toBe('ANOMALOUS');
    expect(classifier.classify(3.5)).toBe('ANOMALOUS');
    expect(classifier.classify(3.99)).toBe('ANOMALOUS');
  });

  it('should classify CRITICAL for scores >= 4.0', () => {
    const classifier = new Classifier();
    
    expect(classifier.classify(4.0)).toBe('CRITICAL');
    expect(classifier.classify(5.0)).toBe('CRITICAL');
    expect(classifier.classify(100.0)).toBe('CRITICAL');
  });

  it('should map classifications to actions', () => {
    const classifier = new Classifier();
    
    expect(classifier.getAction('NORMAL')).toBe('IGNORE');
    expect(classifier.getAction('SUSPICIOUS')).toBe('LOG');
    expect(classifier.getAction('ANOMALOUS')).toBe('ALERT');
    expect(classifier.getAction('CRITICAL')).toBe('PAGE');
  });

  it('should respect custom thresholds', () => {
    const classifier = new Classifier({
      suspiciousThreshold: 1.5,
      anomalousThreshold: 2.5,
      criticalThreshold: 3.5,
    });
    
    expect(classifier.classify(1.6)).toBe('SUSPICIOUS');
    expect(classifier.classify(2.6)).toBe('ANOMALOUS');
    expect(classifier.classify(3.6)).toBe('CRITICAL');
  });
});
