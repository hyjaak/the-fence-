import { Event, Decision } from './eventTypes.js';
import { extractFeatures } from './featureExtractor.js';
import { ZScoreScorer, ScorerConfig } from './scorer.js';
import { Classifier, ClassifierConfig } from './classifier.js';
import { Router, ConsoleSink, InMemorySink } from './router.js';

export interface EngineConfig {
  scorer?: ScorerConfig;
  classifier?: ClassifierConfig;
  enableConsoleOutput?: boolean;
}

export class AnomalyEngine {
  private scorer: ZScoreScorer;
  private classifier: Classifier;
  private router: Router;
  private inMemorySink?: InMemorySink;

  constructor(config: EngineConfig = {}) {
    this.scorer = new ZScoreScorer(config.scorer);
    this.classifier = new Classifier(config.classifier);
    this.router = new Router();

    if (config.enableConsoleOutput) {
      this.router.addSink(new ConsoleSink());
    }
  }

  enableInMemorySink(): InMemorySink {
    this.inMemorySink = new InMemorySink();
    this.router.addSink(this.inMemorySink);
    return this.inMemorySink;
  }

  process(event: Event): Decision {
    // 1. Feature Extraction
    const features = extractFeatures(event);

    // 2. Scoring with signals
    const scoringResult = this.scorer.scoreWithSignals(features);
    const score = scoringResult.score;
    const signals = scoringResult.signals;

    // 3. Classification
    const classification = this.classifier.classify(score);
    const action = this.classifier.getAction(classification);

    // 4. Generate reason
    let reason = '';
    if (signals.length > 0) {
      const primarySignal = signals.reduce((max, sig) => 
        Math.abs(sig.z_score) > Math.abs(max.z_score) ? sig : max
      );
      reason = `${primarySignal.metric}: value=${primarySignal.value.toFixed(2)}, baseline=${primarySignal.baseline_mean.toFixed(2)}±${primarySignal.baseline_std.toFixed(2)}, z=${primarySignal.z_score.toFixed(2)} (${primarySignal.deviation_type})`;
    } else if (score > 0) {
      reason = `composite_score: z=${score.toFixed(2)}`;
    } else {
      reason = 'no anomaly detected';
    }

    // 5. Create Decision
    const decision: Decision = {
      eventId: event.eventId,
      ts: event.ts,
      score,
      classification,
      action,
      source: event.source,
      type: event.type,
      severity: event.severity,
      reason,
      signals: signals.length > 0 ? signals : undefined,
    };

    // 6. Route
    this.router.route(decision);

    return decision;
  }

  processMany(events: Event[]): Decision[] {
    return events.map((event) => this.process(event));
  }

  reset(): void {
    this.scorer.reset();
    if (this.inMemorySink) {
      this.inMemorySink.clear();
    }
  }
}
