import { Event, FeatureVector } from './eventTypes.js';

function normalizeMetrics(metrics: Record<string, number>): FeatureVector['specificMetrics'] {
  const specific: FeatureVector['specificMetrics'] = {};

  // Latency
  if ('latency_ms' in metrics) {
    specific.latency_ms = metrics.latency_ms;
  } else if ('p95' in metrics) {
    specific.latency_ms = metrics.p95;
  } else if ('p99' in metrics) {
    specific.latency_ms = metrics.p99;
  }

  // Error rate - prefer rate, fallback to count
  if ('error_rate' in metrics) {
    specific.error_rate = metrics.error_rate;
  } else if ('error_count' in metrics) {
    specific.error_count = metrics.error_count;
    // Convert to rate if we have a denominator
    if ('total_requests' in metrics && metrics.total_requests > 0) {
      specific.error_rate = metrics.error_count / metrics.total_requests;
    }
  }

  // Auth failures - prefer rate, fallback to count
  if ('auth_failure_rate' in metrics) {
    specific.auth_failure_rate = metrics.auth_failure_rate;
  } else if ('auth_failures' in metrics) {
    specific.auth_failures = metrics.auth_failures;
    // Convert to rate if we have a denominator
    if ('auth_attempts' in metrics && metrics.auth_attempts > 0) {
      specific.auth_failure_rate = metrics.auth_failures / metrics.auth_attempts;
    }
  }

  // Traffic - prefer rate, fallback to count
  if ('requests_per_min' in metrics) {
    specific.requests_per_min = metrics.requests_per_min;
    specific.traffic = metrics.requests_per_min;
  } else if ('request_count' in metrics) {
    specific.request_count = metrics.request_count;
    specific.traffic = metrics.request_count;
  } else if ('traffic' in metrics) {
    specific.traffic = metrics.traffic;
  }

  return specific;
}

export function extractFeatures(event: Event): FeatureVector {
  const metricValues = Object.values(event.metrics);
  const metricCount = metricValues.length;
  const metricSum = metricValues.reduce((acc, v) => acc + v, 0);
  const metricMax = metricValues.length > 0 ? Math.max(...metricValues) : 0;
  const metricAvg = metricCount > 0 ? metricSum / metricCount : 0;

  const ts = new Date(event.ts);
  const hourOfDay = ts.getUTCHours();

  return {
    eventId: event.eventId,
    numeric: {
      severity: event.severity,
      metric_count: metricCount,
      tag_count: event.tags.length,
      message_length: event.message.length,
      hour_of_day: hourOfDay,
      metric_sum: metricSum,
      metric_max: metricMax,
      metric_avg: metricAvg,
    },
    categorical: {
      source: event.source,
      type: event.type,
    },
    specificMetrics: normalizeMetrics(event.metrics),
  };
}
