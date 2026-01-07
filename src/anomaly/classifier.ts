import { AnomalyClass, Action } from './eventTypes.js';

export interface ClassifierConfig {
  suspiciousThreshold?: number;
  anomalousThreshold?: number;
  criticalThreshold?: number;
}

export class Classifier {
  private config: Required<ClassifierConfig>;

  constructor(config: ClassifierConfig = {}) {
    const envSuspicious = process.env.ANOMALY_SUSPICIOUS_THRESHOLD;
    const envAnomalous = process.env.ANOMALY_ANOMALOUS_THRESHOLD;
    const envCritical = process.env.ANOMALY_CRITICAL_THRESHOLD;

    this.config = {
      suspiciousThreshold: config.suspiciousThreshold ?? (envSuspicious ? parseFloat(envSuspicious) : 2.0),
      anomalousThreshold: config.anomalousThreshold ?? (envAnomalous ? parseFloat(envAnomalous) : 3.0),
      criticalThreshold: config.criticalThreshold ?? (envCritical ? parseFloat(envCritical) : 4.0),
    };
  }

  classify(score: number): AnomalyClass {
    if (score >= this.config.criticalThreshold) {
      return 'CRITICAL';
    }
    if (score >= this.config.anomalousThreshold) {
      return 'ANOMALOUS';
    }
    if (score >= this.config.suspiciousThreshold) {
      return 'SUSPICIOUS';
    }
    return 'NORMAL';
  }

  getAction(classification: AnomalyClass): Action {
    switch (classification) {
      case 'CRITICAL':
        return 'PAGE';
      case 'ANOMALOUS':
        return 'ALERT';
      case 'SUSPICIOUS':
        return 'LOG';
      case 'NORMAL':
      default:
        return 'IGNORE';
    }
  }
}
