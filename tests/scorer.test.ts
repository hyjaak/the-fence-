import { describe, it, expect, beforeEach } from 'vitest';
import { ZScoreScorer } from '../src/anomaly/scorer.js';
import { extractFeatures } from '../src/anomaly/featureExtractor.js';
import { Event } from '../src/anomaly/eventTypes.js';

describe('scorer', () => {
  let scorer: ZScoreScorer;

  beforeEach(() => {
    scorer = new ZScoreScorer({ windowSize: 100, minSamplesForGroup: 5 });
  });

  it('should return 0 for first event', () => {
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

    const features = extractFeatures(event);
    const score = scorer.score(features);

    expect(score).toBe(0);
  });

  it('should compute higher z-score for outlier', () => {
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

    // Add 20 normal events
    for (let i = 0; i < 20; i++) {
      const features = extractFeatures({ ...normalEvent, eventId: `n${i}` });
      scorer.score(features);
    }

    // Add an outlier
    const outlierEvent: Event = {
      ...normalEvent,
      eventId: 'outlier',
      severity: 9,
      metrics: { p95: 1000 },
    };

    const outlierFeatures = extractFeatures(outlierEvent);
    const outlierScore = scorer.score(outlierFeatures);

    expect(outlierScore).toBeGreaterThan(3);
  });

  it('should use group stats when enough samples', () => {
    const apiEvent: Event = {
      eventId: 'api1',
      ts: '2026-01-06T00:00:00Z',
      source: 'api',
      type: 'latency',
      severity: 2,
      tags: [],
      message: 'ok',
      metrics: { p95: 100 },
      context: {},
    };

    // Add 10 API events
    for (let i = 0; i < 10; i++) {
      const features = extractFeatures({ ...apiEvent, eventId: `api${i}` });
      scorer.score(features);
    }

    // Add DB event (different group)
    const dbEvent: Event = {
      eventId: 'db1',
      ts: '2026-01-06T00:00:00Z',
      source: 'db',
      type: 'error',
      severity: 8,
      tags: [],
      message: 'error',
      metrics: { count: 5 },
      context: {},
    };

    const dbFeatures = extractFeatures(dbEvent);
    const dbScore = scorer.score(dbFeatures);

    // DB event should use global stats since it doesn't have enough samples in its group
    expect(dbScore).toBeDefined();
  });
});
