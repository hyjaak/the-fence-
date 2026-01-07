import { describe, it, expect, beforeEach } from 'vitest';
import { AnomalyEngine } from '../src/anomaly/engine.js';
import { Event } from '../src/anomaly/eventTypes.js';

describe('AnomalyEngine', () => {
  let engine: AnomalyEngine;

  beforeEach(() => {
    engine = new AnomalyEngine({ enableConsoleOutput: false });
  });

  it('should process a single event', () => {
    const event: Event = {
      eventId: '1',
      ts: '2026-01-06T00:00:00Z',
      source: 'api',
      type: 'latency',
      severity: 2,
      tags: ['prod'],
      message: 'ok',
      metrics: { p95: 120 },
      context: { region: 'us-east-1' },
    };

    const decision = engine.process(event);

    expect(decision.eventId).toBe('1');
    expect(decision.ts).toBe('2026-01-06T00:00:00Z');
    expect(decision.source).toBe('api');
    expect(decision.type).toBe('latency');
    expect(decision.severity).toBe(2);
    expect(decision.score).toBeDefined();
    expect(decision.classification).toBeDefined();
    expect(decision.action).toBeDefined();
  });

  it('should detect anomaly after normal baseline', () => {
    const sink = engine.enableInMemorySink();

    const normalEvent: Event = {
      eventId: 'n',
      ts: '2026-01-06T00:00:00Z',
      source: 'api',
      type: 'latency',
      severity: 2,
      tags: [],
      message: 'ok',
      metrics: { p95: 100 },
      context: {},
    };

    // Process 50 normal events
    for (let i = 0; i < 50; i++) {
      engine.process({ ...normalEvent, eventId: `n${i}` });
    }

    // Process 1 spike event
    const spikeEvent: Event = {
      ...normalEvent,
      eventId: 'spike',
      severity: 10,
      metrics: { p95: 5000 },
    };

    const decision = engine.process(spikeEvent);

    expect(decision.classification).toMatch(/ANOMALOUS|CRITICAL/);
    expect(decision.action).toMatch(/ALERT|PAGE/);
    expect(sink.decisions.length).toBe(51);
  });

  it('should process many events', () => {
    const events: Event[] = Array.from({ length: 10 }, (_, i) => ({
      eventId: `${i}`,
      ts: '2026-01-06T00:00:00Z',
      source: 'api',
      type: 'latency',
      severity: 2,
      tags: [],
      message: 'ok',
      metrics: { p95: 100 },
      context: {},
    }));

    const decisions = engine.processMany(events);

    expect(decisions.length).toBe(10);
    decisions.forEach((d, i) => {
      expect(d.eventId).toBe(`${i}`);
    });
  });

  it('should reset state', () => {
    const sink = engine.enableInMemorySink();

    const event: Event = {
      eventId: '1',
      ts: '2026-01-06T00:00:00Z',
      source: 'api',
      type: 'latency',
      severity: 2,
      tags: [],
      message: 'ok',
      metrics: { p95: 100 },
      context: {},
    };

    engine.process(event);
    expect(sink.decisions.length).toBe(1);

    engine.reset();
    expect(sink.decisions.length).toBe(0);
  });
});
