import { describe, it, expect, beforeEach } from 'vitest';
import { AnomalyEngine } from '../src/anomaly/engine.js';
import { Event } from '../src/anomaly/eventTypes.js';

describe('MultiMetric Detection', () => {
  let engine: AnomalyEngine;

  beforeEach(() => {
    engine = new AnomalyEngine({ enableConsoleOutput: false });
  });

  describe('error_rate spike detection', () => {
    it('should detect error_rate spike as ANOMALOUS', () => {
      const sink = engine.enableInMemorySink();

      // Build baseline with low error rate
      for (let i = 0; i < 30; i++) {
        engine.process({
          eventId: `baseline_${i}`,
          ts: `2026-01-06T00:${i.toString().padStart(2, '0')}:00Z`,
          source: 'api',
          type: 'errors',
          severity: 2,
          tags: [],
          message: 'ok',
          metrics: { error_rate: 0.01 },
          context: {},
        });
      }

      // Spike event
      const decision = engine.process({
        eventId: 'spike',
        ts: '2026-01-06T01:00:00Z',
        source: 'api',
        type: 'errors',
        severity: 8,
        tags: ['alert'],
        message: 'error spike',
        metrics: { error_rate: 0.25 },
        context: {},
      });

      expect(decision.classification).toMatch(/ANOMALOUS|CRITICAL/);
      expect(decision.action).toMatch(/ALERT|PAGE/);
      expect(decision.reason).toContain('error_rate');
      expect(decision.signals).toBeDefined();
      expect(decision.signals!.length).toBeGreaterThan(0);
      expect(decision.signals![0].metric).toBe('error_rate');
      expect(decision.signals![0].deviation_type).toBe('spike');
    });

    it('should detect error_count spike as ANOMALOUS', () => {
      const sink = engine.enableInMemorySink();

      // Build baseline
      for (let i = 0; i < 30; i++) {
        engine.process({
          eventId: `baseline_${i}`,
          ts: `2026-01-06T00:${i.toString().padStart(2, '0')}:00Z`,
          source: 'api',
          type: 'errors',
          severity: 2,
          tags: [],
          message: 'ok',
          metrics: { error_count: 5 },
          context: {},
        });
      }

      // Spike event
      const decision = engine.process({
        eventId: 'spike',
        ts: '2026-01-06T01:00:00Z',
        source: 'api',
        type: 'errors',
        severity: 7,
        tags: [],
        message: 'error spike',
        metrics: { error_count: 500 },
        context: {},
      });

      expect(decision.classification).toMatch(/ANOMALOUS|CRITICAL/);
      expect(decision.reason).toContain('error_count');
    });
  });

  describe('auth_failures spike detection', () => {
    it('should detect auth_failures spike as ANOMALOUS', () => {
      const sink = engine.enableInMemorySink();

      // Build baseline
      for (let i = 0; i < 30; i++) {
        engine.process({
          eventId: `baseline_${i}`,
          ts: `2026-01-06T00:${i.toString().padStart(2, '0')}:00Z`,
          source: 'auth',
          type: 'login',
          severity: 2,
          tags: [],
          message: 'ok',
          metrics: { auth_failures: 2 },
          context: {},
        });
      }

      // Spike event
      const decision = engine.process({
        eventId: 'spike',
        ts: '2026-01-06T01:00:00Z',
        source: 'auth',
        type: 'login',
        severity: 9,
        tags: ['security'],
        message: 'auth attack',
        metrics: { auth_failures: 1000 },
        context: {},
      });

      expect(decision.classification).toMatch(/ANOMALOUS|CRITICAL/);
      expect(decision.action).toMatch(/ALERT|PAGE/);
      expect(decision.reason).toContain('auth_failures');
      expect(decision.signals).toBeDefined();
    });

    it('should detect auth_failure_rate spike', () => {
      const sink = engine.enableInMemorySink();

      for (let i = 0; i < 30; i++) {
        engine.process({
          eventId: `baseline_${i}`,
          ts: `2026-01-06T00:${i.toString().padStart(2, '0')}:00Z`,
          source: 'auth',
          type: 'login',
          severity: 2,
          tags: [],
          message: 'ok',
          metrics: { auth_failure_rate: 0.02 },
          context: {},
        });
      }

      const decision = engine.process({
        eventId: 'spike',
        ts: '2026-01-06T01:00:00Z',
        source: 'auth',
        type: 'login',
        severity: 8,
        tags: [],
        message: 'attack',
        metrics: { auth_failure_rate: 0.8 },
        context: {},
      });

      expect(decision.classification).toMatch(/ANOMALOUS|CRITICAL/);
      expect(decision.reason).toContain('auth_failure_rate');
    });
  });

  describe('traffic drop detection', () => {
    it('should detect traffic drop as ANOMALOUS', () => {
      const sink = engine.enableInMemorySink();

      // Build baseline with stable traffic
      for (let i = 0; i < 30; i++) {
        engine.process({
          eventId: `baseline_${i}`,
          ts: `2026-01-06T00:${i.toString().padStart(2, '0')}:00Z`,
          source: 'api',
          type: 'traffic',
          severity: 2,
          tags: [],
          message: 'ok',
          metrics: { requests_per_min: 1000 },
          context: {},
        });
      }

      // Drop event
      const decision = engine.process({
        eventId: 'drop',
        ts: '2026-01-06T01:00:00Z',
        source: 'api',
        type: 'traffic',
        severity: 7,
        tags: ['capacity'],
        message: 'traffic drop',
        metrics: { requests_per_min: 100 },
        context: {},
      });

      expect(decision.classification).toMatch(/SUSPICIOUS|ANOMALOUS|CRITICAL/);
      expect(decision.reason).toContain('traffic');
      expect(decision.signals).toBeDefined();
      const trafficSignal = decision.signals!.find(s => s.metric === 'traffic');
      expect(trafficSignal).toBeDefined();
      expect(trafficSignal!.deviation_type).toBe('drop');
    });
  });

  describe('missing metrics handling', () => {
    it('should not crash with missing metrics', () => {
      const decision = engine.process({
        eventId: '1',
        ts: '2026-01-06T00:00:00Z',
        source: 'api',
        type: 'unknown',
        severity: 5,
        tags: [],
        message: 'test',
        metrics: {},
        context: {},
      });

      expect(decision.classification).toBe('NORMAL');
      expect(decision).toBeDefined();
    });

    it('should classify NORMAL when no anomalous metrics', () => {
      // Fresh engine for this test
      const testEngine = new AnomalyEngine({ enableConsoleOutput: false });
      
      for (let i = 0; i < 30; i++) {
        testEngine.process({
          eventId: `baseline_${i}`,
          ts: `2026-01-06T00:${i.toString().padStart(2, '0')}:00Z`,
          source: 'api',
          type: 'test',
          severity: 2,
          tags: [],
          message: 'ok',
          metrics: { latency_ms: 100 + (i % 3) },
          context: {},
        });
      }

      const decision = testEngine.process({
        eventId: 'normal',
        ts: '2026-01-06T01:00:00Z',
        source: 'api',
        type: 'test',
        severity: 2,
        tags: [],
        message: 'ok',
        metrics: { latency_ms: 101 },
        context: {},
      });

      expect(decision.classification).toBe('NORMAL');
      expect(decision.action).toBe('IGNORE');
      expect(decision.score).toBeLessThan(2.0);
    });
  });

  describe('reason field validation', () => {
    it('should include metric name, baseline, and current value in reason', () => {
      for (let i = 0; i < 30; i++) {
        engine.process({
          eventId: `baseline_${i}`,
          ts: `2026-01-06T00:${i.toString().padStart(2, '0')}:00Z`,
          source: 'api',
          type: 'errors',
          severity: 2,
          tags: [],
          message: 'ok',
          metrics: { error_rate: 0.01 },
          context: {},
        });
      }

      const decision = engine.process({
        eventId: 'spike',
        ts: '2026-01-06T01:00:00Z',
        source: 'api',
        type: 'errors',
        severity: 8,
        tags: [],
        message: 'spike',
        metrics: { error_rate: 0.5 },
        context: {},
      });

      expect(decision.reason).toBeDefined();
      expect(decision.reason).toContain('error_rate');
      expect(decision.reason).toContain('value=');
      expect(decision.reason).toContain('baseline=');
      expect(decision.reason).toContain('z=');
    });
  });
});
