import { describe, it, expect, beforeEach } from 'vitest';
import { RollingStatsCalculator } from '../src/anomaly/rollingStats.js';

describe('rollingStats', () => {
  let calc: RollingStatsCalculator;

  beforeEach(() => {
    calc = new RollingStatsCalculator(5);
  });

  it('should return zero stats for empty dataset', () => {
    const stats = calc.getStats();
    expect(stats.mean).toBe(0);
    expect(stats.std).toBe(0);
    expect(stats.count).toBe(0);
  });

  it('should calculate mean correctly', () => {
    calc.add(10);
    calc.add(20);
    calc.add(30);

    const stats = calc.getStats();
    expect(stats.mean).toBe(20);
    expect(stats.count).toBe(3);
  });

  it('should calculate standard deviation correctly', () => {
    calc.add(10);
    calc.add(12);
    calc.add(14);
    calc.add(16);
    calc.add(18);

    const stats = calc.getStats();
    expect(stats.mean).toBe(14);
    expect(stats.std).toBeCloseTo(2.83, 1);
    expect(stats.count).toBe(5);
  });

  it('should maintain rolling window', () => {
    calc.add(1);
    calc.add(2);
    calc.add(3);
    calc.add(4);
    calc.add(5);
    calc.add(100); // Should drop the first value (1)

    const stats = calc.getStats();
    expect(stats.count).toBe(5);
    expect(stats.mean).toBeGreaterThan(20); // Should not include 1
  });

  it('should reset correctly', () => {
    calc.add(10);
    calc.add(20);
    calc.reset();

    const stats = calc.getStats();
    expect(stats.count).toBe(0);
    expect(stats.mean).toBe(0);
  });
});
