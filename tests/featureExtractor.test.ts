import { describe, it, expect } from 'vitest';
import { extractFeatures } from '../src/anomaly/featureExtractor.js';
import { Event } from '../src/anomaly/eventTypes.js';

describe('featureExtractor', () => {
  it('should extract numeric features correctly', () => {
    const event: Event = {
      eventId: '1',
      ts: '2026-01-06T14:30:00Z',
      source: 'api',
      type: 'latency',
      severity: 5,
      tags: ['prod', 'us-east-1'],
      message: 'High latency detected',
      metrics: { p95: 120, p99: 180 },
      context: { region: 'us-east-1' },
    };

    const features = extractFeatures(event);

    expect(features.eventId).toBe('1');
    expect(features.numeric.severity).toBe(5);
    expect(features.numeric.metric_count).toBe(2);
    expect(features.numeric.tag_count).toBe(2);
    expect(features.numeric.message_length).toBe(21);
    expect(features.numeric.hour_of_day).toBe(14);
    expect(features.numeric.metric_sum).toBe(300);
    expect(features.numeric.metric_max).toBe(180);
    expect(features.numeric.metric_avg).toBe(150);
    expect(features.categorical.source).toBe('api');
    expect(features.categorical.type).toBe('latency');
  });

  it('should handle empty metrics', () => {
    const event: Event = {
      eventId: '2',
      ts: '2026-01-06T00:00:00Z',
      source: 'db',
      type: 'error',
      severity: 8,
      tags: [],
      message: 'Error',
      metrics: {},
      context: {},
    };

    const features = extractFeatures(event);

    expect(features.numeric.metric_count).toBe(0);
    expect(features.numeric.metric_sum).toBe(0);
    expect(features.numeric.metric_max).toBe(0);
    expect(features.numeric.metric_avg).toBe(0);
    expect(features.numeric.hour_of_day).toBe(0);
  });
});
