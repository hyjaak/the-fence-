export interface Event {
  eventId: string;
  ts: string; // ISO string
  source: string;
  type: string;
  severity: number; // 0-10
  tags: string[];
  message: string;
  metrics: Record<string, number>;
  context: Record<string, string>;
}

export interface FeatureVector {
  eventId: string;
  numeric: {
    severity: number;
    metric_count: number;
    tag_count: number;
    message_length: number;
    hour_of_day: number;
    metric_sum: number;
    metric_max: number;
    metric_avg: number;
  };
  categorical: {
    source: string;
    type: string;
  };
  specificMetrics: {
    latency_ms?: number;
    error_rate?: number;
    error_count?: number;
    auth_failures?: number;
    auth_failure_rate?: number;
    traffic?: number;
    requests_per_min?: number;
    request_count?: number;
  };
}

export type AnomalyClass = 'NORMAL' | 'SUSPICIOUS' | 'ANOMALOUS' | 'CRITICAL';
export type Action = 'IGNORE' | 'LOG' | 'ALERT' | 'PAGE';

export interface AnomalySignal {
  metric: string;
  value: number;
  baseline_mean: number;
  baseline_std: number;
  z_score: number;
  deviation_type: 'spike' | 'drop' | 'normal';
}

export interface Decision {
  eventId: string;
  ts: string;
  score: number;
  classification: AnomalyClass;
  action: Action;
  source: string;
  type: string;
  severity: number;
  reason?: string;
  signals?: AnomalySignal[];
}

export function isEvent(obj: unknown): obj is Event {
  if (typeof obj !== 'object' || obj === null) return false;
  const e = obj as Record<string, unknown>;
  
  return (
    typeof e.eventId === 'string' &&
    typeof e.ts === 'string' &&
    typeof e.source === 'string' &&
    typeof e.type === 'string' &&
    typeof e.severity === 'number' &&
    Array.isArray(e.tags) &&
    e.tags.every((t) => typeof t === 'string') &&
    typeof e.message === 'string' &&
    typeof e.metrics === 'object' &&
    e.metrics !== null &&
    typeof e.context === 'object' &&
    e.context !== null
  );
}
