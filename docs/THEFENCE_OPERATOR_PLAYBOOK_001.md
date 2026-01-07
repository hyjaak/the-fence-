# THEFENCE — Operator Playbook

Version: 001  
Date: 2026-01-06

## Purpose of THE FENCE

THE FENCE is an infrastructure anomaly detection system that monitors event streams for abnormal patterns in system behavior. It provides real-time classification of events and recommends operator actions based on severity and statistical deviation from baseline behavior.

## What Problems It Detects

THE FENCE detects:

- Latency spikes in API requests, database queries, or service responses
- Error rate increases beyond statistical norms
- Authentication failure patterns indicating potential attacks
- Traffic volume drops suggesting service degradation or outages
- Unusual categorical patterns in event types or sources
- Multi-metric anomalies combining several indicators

## Event Inputs

Each event contains:

- **eventId**: Unique identifier for correlation and tracking
- **ts**: Timestamp in ISO 8601 format
- **source**: Origin of the event (api, database, auth-service, load-balancer, etc.)
- **type**: Event category (latency, error, auth, traffic, etc.)
- **severity**: Operator-assigned importance from 0 (routine) to 10 (critical)
- **tags**: Optional labels for filtering and grouping
- **message**: Human-readable event description
- **metrics**: Numeric measurements (p95 latency, error counts, request rates, etc.)
- **context**: Additional metadata about the event environment

## Classifications Explained

### NORMAL
- Z-score less than 2.0
- Event falls within expected statistical bounds
- Represents typical system behavior under normal conditions
- May still be logged for historical baselines

### SUSPICIOUS
- Z-score between 2.0 and 3.0
- Event deviates from baseline but not critically
- Could indicate early warning of developing issue
- Should be monitored but does not require immediate intervention
- Often seen during legitimate traffic pattern changes

### ANOMALOUS
- Z-score between 3.0 and 4.0
- Event shows significant deviation from expected behavior
- Requires investigation to determine cause
- May represent real issues or unusual but legitimate conditions

### CRITICAL
- Z-score 4.0 or higher
- Event shows extreme deviation from baseline
- Requires immediate operator attention
- High probability of service impact or security incident

## Actions Explained

### IGNORE
- Triggered by NORMAL classification
- Event is within acceptable parameters
- No operator action required
- System continues normal operation

### LOG
- Triggered by SUSPICIOUS classification
- Event is recorded for trend analysis
- Operator should monitor for patterns
- No immediate action required unless pattern emerges

### ALERT
- Triggered by ANOMALOUS classification
- Operator should investigate within normal working hours
- Review event context and related metrics
- Determine if issue requires remediation

### PAGE
- Triggered by CRITICAL classification
- Operator must respond immediately
- Indicates potential service outage or security breach
- Escalate if cause is not immediately clear

## How to Interpret Anomaly Reasons

Anomaly reasons follow this format:
```
metric: value=X.XX, baseline=Y.YY±Z.ZZ, z=W.WW (type)
```

Components:
- **metric**: Name of the measured value (error_rate, latency_ms, traffic, etc.)
- **value**: Current observation
- **baseline**: Historical mean ± standard deviation
- **z**: Z-score indicating number of standard deviations from mean
- **type**: Deviation direction (spike, drop, normal)

Example:
```
error_rate: value=0.15, baseline=0.02±0.01, z=13.00 (spike)
```
This indicates error rate is 0.15 (15%), while baseline is 2% ± 1%, representing a 13 standard deviation spike.

## When Operators Should Intervene

Intervene when:

- **Classification is CRITICAL**: Always investigate immediately
- **Multiple ANOMALOUS events from same source**: Pattern indicates systemic issue
- **Authentication failure spikes**: Potential security attack in progress
- **Traffic drops to zero or near-zero**: Service likely down
- **Error rate exceeds 10%**: User experience severely degraded
- **Latency exceeds SLA thresholds**: Even if z-score is moderate, business impact may be severe
- **Anomalies persist after warm-up period**: Not a transient blip

## When Operators Should NOT Intervene

Do not intervene when:

- **Classification is NORMAL**: System operating within bounds
- **Classification is SUSPICIOUS during deployment**: Expected temporary deviation
- **Single isolated ANOMALOUS event with no follow-up**: Likely statistical outlier
- **Traffic drop during scheduled maintenance**: Documented expected behavior
- **Warm-up period events (first 20 samples per source)**: Baselines still stabilizing
- **Known high-severity events with low z-scores**: Severity alone does not indicate anomaly
- **Legitimate traffic pattern changes**: Marketing campaigns, product launches, timezone shifts

## Common False Positives

Be aware of these scenarios that may trigger alerts without real issues:

### Deployment-Related
- New service instances generate anomalies during baseline establishment
- Configuration changes alter metric distributions temporarily
- Gradual rollouts create mixed baseline populations

### Time-Based Patterns
- Daily traffic cycles may trigger anomalies if baseline window too small
- Weekend vs weekday patterns differ significantly
- Holiday or special event traffic differs from normal

### External Events
- Scheduled maintenance windows reduce traffic legitimately
- Marketing campaigns increase traffic predictably
- Partner integrations create bursty traffic patterns

### System Behavior
- Cache warming creates temporary latency spikes
- Batch job execution creates periodic resource spikes
- Auto-scaling events create temporary capacity anomalies

### Statistical Artifacts
- Low baseline variance makes minor changes appear significant
- First events after restart have unstable baselines
- Rare event types have insufficient baseline data

## Definition of Success Checklist

The system is performing correctly when:

- [ ] NORMAL events during stable operations vastly outnumber anomalies
- [ ] CRITICAL alerts correspond to actual service issues 90%+ of the time
- [ ] Operators can respond to PAGE actions within SLA timeframes
- [ ] Anomaly reasons provide actionable diagnostic information
- [ ] False positive rate for CRITICAL classification is below 10%
- [ ] True incidents are detected within 2 minutes of occurrence
- [ ] Baseline statistics stabilize within 20-30 samples per source
- [ ] Multi-metric anomalies identify root cause correctly
- [ ] Seasonal and cyclical patterns do not trigger persistent false alerts
- [ ] Operators trust the system enough to rely on it for incident detection

END OF FILE
