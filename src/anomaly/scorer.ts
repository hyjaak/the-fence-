import { FeatureVector, AnomalySignal } from './eventTypes.js';
import { RollingStatsCalculator, RollingStats } from './rollingStats.js';

export interface ScorerConfig {
  windowSize?: number;
  minSamplesForGroup?: number;
  minSamplesForWarmup?: number;
}

export interface ScoringResult {
  score: number;
  signals: AnomalySignal[];
}

export class ZScoreScorer {
  private groupStats: Map<string, RollingStatsCalculator> = new Map();
  private globalStats: RollingStatsCalculator;
  private config: Required<ScorerConfig>;

  // Metric-specific baselines
  private metricBaselines: Map<string, Map<string, RollingStatsCalculator>> = new Map();

  constructor(config: ScorerConfig = {}) {
    this.config = {
      windowSize: config.windowSize ?? 100,
      minSamplesForGroup: config.minSamplesForGroup ?? 10,
      minSamplesForWarmup: config.minSamplesForWarmup ?? 20,
    };
    this.globalStats = new RollingStatsCalculator(this.config.windowSize);
  }

  private getGroupKey(features: FeatureVector): string {
    return `${features.categorical.source}:${features.categorical.type}`;
  }

  private getMetricBaselineKey(groupKey: string, metricName: string): string {
    return `${groupKey}:${metricName}`;
  }

  private getOrCreateMetricBaseline(groupKey: string, metricName: string): RollingStatsCalculator {
    if (!this.metricBaselines.has(groupKey)) {
      this.metricBaselines.set(groupKey, new Map());
    }
    const groupMetrics = this.metricBaselines.get(groupKey)!;
    if (!groupMetrics.has(metricName)) {
      groupMetrics.set(metricName, new RollingStatsCalculator(this.config.windowSize));
    }
    return groupMetrics.get(metricName)!;
  }

  private getCompositeScore(features: FeatureVector): number {
    // Composite score based on severity and metrics
    return features.numeric.severity + features.numeric.metric_max * 0.1;
  }

  private getSeverityFactor(severity: number): number {
    // severityFactor = clamp(1.0 + (severity/10)*0.75, 1.0, 1.75)
    const factor = 1.0 + (severity / 10) * 0.75;
    return Math.max(1.0, Math.min(1.75, factor));
  }

  private computeMetricZScore(
    value: number,
    baseline: RollingStatsCalculator,
    metricName: string,
    isDropDetection = false
  ): AnomalySignal | null {
    const stats = baseline.getStats();
    if (stats.count === 0 || stats.std === 0) {
      return null;
    }

    let zScore = (value - stats.mean) / stats.std;

    // For traffic drop detection, use asymmetric scoring
    if (isDropDetection && zScore < 0) {
      zScore *= 1.5; // Amplify negative deviations
    }

    const deviationType: AnomalySignal['deviation_type'] =
      zScore > 2 ? 'spike' : zScore < -2 ? 'drop' : 'normal';

    return {
      metric: metricName,
      value,
      baseline_mean: stats.mean,
      baseline_std: stats.std,
      z_score: zScore,
      deviation_type: deviationType,
    };
  }

  scoreWithSignals(features: FeatureVector): ScoringResult {
    const groupKey = this.getGroupKey(features);
    const compositeValue = this.getCompositeScore(features);
    const signals: AnomalySignal[] = [];

    // Update composite stats (legacy behavior)
    this.globalStats.add(compositeValue);
    
    if (!this.groupStats.has(groupKey)) {
      this.groupStats.set(groupKey, new RollingStatsCalculator(this.config.windowSize));
    }
    const groupCalc = this.groupStats.get(groupKey)!;
    groupCalc.add(compositeValue);

    // Compute composite z-score
    const groupStatsData = groupCalc.getStats();
    const globalStatsData = this.globalStats.getStats();

    let stats: RollingStats;
    if (groupStatsData.count >= this.config.minSamplesForGroup) {
      stats = groupStatsData;
    } else {
      stats = globalStatsData;
    }

    let maxZScore = 0;

    if (stats.count > 0 && stats.std > 0) {
      let zScore = (compositeValue - stats.mean) / stats.std;

      // Apply severity weighting
      const severityFactor = this.getSeverityFactor(features.numeric.severity);
      zScore *= severityFactor;

      // Warm-up boost
      if (stats.count < this.config.minSamplesForWarmup && features.numeric.severity >= 7) {
        const warmupBoost = 1.0 + (this.config.minSamplesForWarmup - stats.count) / this.config.minSamplesForWarmup;
        zScore *= warmupBoost;
      }

      maxZScore = Math.abs(zScore);
    }

    // Process specific metrics
    const { specificMetrics } = features;

    // Error rate spike detection
    if (specificMetrics.error_rate !== undefined) {
      const baseline = this.getOrCreateMetricBaseline(groupKey, 'error_rate');
      baseline.add(specificMetrics.error_rate);
      const signal = this.computeMetricZScore(specificMetrics.error_rate, baseline, 'error_rate');
      if (signal) {
        signals.push(signal);
        maxZScore = Math.max(maxZScore, Math.abs(signal.z_score));
      }
    } else if (specificMetrics.error_count !== undefined) {
      const baseline = this.getOrCreateMetricBaseline(groupKey, 'error_count');
      baseline.add(specificMetrics.error_count);
      const signal = this.computeMetricZScore(specificMetrics.error_count, baseline, 'error_count');
      if (signal) {
        signals.push(signal);
        maxZScore = Math.max(maxZScore, Math.abs(signal.z_score));
      }
    }

    // Auth failures spike detection
    if (specificMetrics.auth_failure_rate !== undefined) {
      const baseline = this.getOrCreateMetricBaseline(groupKey, 'auth_failure_rate');
      baseline.add(specificMetrics.auth_failure_rate);
      const signal = this.computeMetricZScore(specificMetrics.auth_failure_rate, baseline, 'auth_failure_rate');
      if (signal) {
        signals.push(signal);
        maxZScore = Math.max(maxZScore, Math.abs(signal.z_score));
      }
    } else if (specificMetrics.auth_failures !== undefined) {
      const baseline = this.getOrCreateMetricBaseline(groupKey, 'auth_failures');
      baseline.add(specificMetrics.auth_failures);
      const signal = this.computeMetricZScore(specificMetrics.auth_failures, baseline, 'auth_failures');
      if (signal) {
        signals.push(signal);
        maxZScore = Math.max(maxZScore, Math.abs(signal.z_score));
      }
    }

    // Traffic drop detection (asymmetric)
    if (specificMetrics.traffic !== undefined) {
      const baseline = this.getOrCreateMetricBaseline(groupKey, 'traffic');
      baseline.add(specificMetrics.traffic);
      const signal = this.computeMetricZScore(specificMetrics.traffic, baseline, 'traffic', true);
      if (signal) {
        signals.push(signal);
        maxZScore = Math.max(maxZScore, Math.abs(signal.z_score * 1.5)); // Boost drop severity
      }
    }

    // Latency detection
    if (specificMetrics.latency_ms !== undefined) {
      const baseline = this.getOrCreateMetricBaseline(groupKey, 'latency_ms');
      baseline.add(specificMetrics.latency_ms);
      const signal = this.computeMetricZScore(specificMetrics.latency_ms, baseline, 'latency_ms');
      if (signal) {
        signals.push(signal);
        maxZScore = Math.max(maxZScore, Math.abs(signal.z_score));
      }
    }

    return {
      score: maxZScore,
      signals,
    };
  }

  score(features: FeatureVector): number {
    return this.scoreWithSignals(features).score;
  }

  reset(): void {
    this.groupStats.clear();
    this.globalStats.reset();
    this.metricBaselines.clear();
  }
}
