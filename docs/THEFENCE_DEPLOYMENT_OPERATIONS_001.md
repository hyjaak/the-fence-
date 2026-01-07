# THEFENCE — Deployment & Operations

Version: 001  
Date: 2026-01-06

## Deployment Philosophy

THE FENCE operates under these principles:

- **Immutable builds**: Artifacts are built once and deployed unchanged across all environments
- **Validation before execution**: All gates must pass before deployment or execution
- **Zero-trust input handling**: All external data is untrusted until validated
- **Fail-closed behavior**: System defaults to safest action when uncertain or on error

## Environments

### Local
- Developer workstations running Node.js 20+
- Executes against local files and test fixtures
- No external dependencies required
- Validation runs against local docs/ directory

### Staging
- Pre-production validation environment
- Mirrors production configuration
- Uses synthetic event streams for testing
- Validates end-to-end integration before promotion

### Production
- Live anomaly detection system
- Processes real infrastructure event streams
- All gates verified in staging before deployment
- Immutable artifact deployed from staging build

### Explicit Differences and Invariants
- Invariant: Same artifact runs in staging and production without modification
- Invariant: Validation rules identical across all environments
- Difference: Production uses real event sources, staging uses synthetic
- Difference: Production PAGE actions route to on-call, staging routes to logs
- Difference: Production retention periods longer than staging

## Build & Release Rules

### Required Validation Steps
- Run npm run build and verify zero errors
- Run npm test and verify 60/60 tests pass
- Run npx thefence validate and verify PASS with 0 errors
- Verify all doctrine files end with END OF FILE
- Verify no duplicate concepts outside allowlist

### Test Pass Thresholds
- 100% of tests must pass, no exceptions
- No failing tests can be skipped or ignored
- Test suite must complete within 2 seconds
- No warnings allowed in validation output

### Versioning Expectations
- Doctrine files use _001 suffix for version 1
- Package version follows semantic versioning
- Breaking changes require major version increment
- Artifact includes git commit SHA in metadata

### Artifact Integrity
- Build output in dist/ directory must be complete
- All TypeScript files must compile without errors
- Artifact checksum recorded in release metadata
- No manual edits to dist/ after build

## Runtime Execution Model

### CLI Usage Expectations
- Single input stream per invocation
- NDJSON format required
- One decision output per input event
- Exit code 0 on success, 1 on error

### Batch vs Streaming
- Batch mode: Process file from start to finish, output all results
- Streaming mode: Process stdin line-by-line, output decisions incrementally
- Both modes maintain identical baseline state
- Event order preserved from input to output

### Deterministic Behavior Guarantees
- Same input stream produces same baseline statistics
- Same baseline produces same z-scores
- Same z-scores produce same classifications
- Non-determinism allowed only in timestamp generation

### Time Handling and Ordering Rules
- Event timestamps from input take precedence
- System clock used only when event timestamp missing
- Out-of-order events processed in arrival order
- Baseline calculations use arrival order not timestamp order

## Configuration Management

### Environment Variables
- NODE_ENV: Environment identifier (development, staging, production)
- THEFENCE_WINDOW_SIZE: Rolling baseline window size (default 100)
- THEFENCE_MIN_SAMPLES: Minimum samples for warm-up (default 20)
- THEFENCE_LOG_LEVEL: Logging verbosity (default info)

### Defaults vs Overrides
- Defaults embedded in code for safety
- Environment variables override defaults
- Command-line flags override environment variables
- No runtime configuration mutation allowed

### Prohibited Runtime Mutation
- Baseline window size cannot change during execution
- Classification thresholds cannot change during execution
- Warm-up gate parameters cannot change during execution
- Action routing rules cannot change during execution

### Secrets Handling Boundaries
- No secrets required for anomaly detection
- PAGE action destinations configured via environment
- Credentials for external systems stored in secure vaults
- Never log or output secrets in decisions or audit logs

## Operational Safety Gates

### Preconditions to Run
- npm run gate has passed in current artifact
- Artifact matches expected checksum
- Input stream format validated before processing
- Output destination writable and has sufficient space

### Preconditions to PAGE
- Classification must be CRITICAL
- Event must have passed warm-up period (minimum 20 samples for source)
- Rate limit not exceeded (1 PAGE per source per 5 minutes)
- On-call operator identity verified

### Preconditions to LOG Only
- Classification must be NORMAL or SUSPICIOUS
- Event processed without errors
- Audit log destination writable
- Log entry contains all required fields

### Emergency Disable Conditions
- Disable PAGE actions if false positive rate exceeds 50%
- Disable anomaly detection if baseline corruption detected
- Disable processing if input validation failure rate exceeds 20%
- Disable audit logging if disk space below 10% available

## Observability Requirements

### Required Metrics
- Events processed per second
- Classification distribution (NORMAL, SUSPICIOUS, ANOMALOUS, CRITICAL)
- Action distribution (IGNORE, LOG, ALERT, PAGE)
- Input validation failure count
- Baseline statistics (mean, std) per source per metric
- Processing latency p50, p95, p99

### Required Logs
- Every decision output to audit log
- Every input validation error to error log
- Every rate-limit activation to warning log
- Every baseline initialization to info log

### Required Audit Outputs
- eventId, ts, score, classification, action, source, type, severity
- reason field for ANOMALOUS and CRITICAL classifications
- signals array for multi-metric anomalies
- operator identity for manual actions

### Retention Expectations
- Production audit logs: 90 days minimum
- Staging audit logs: 30 days minimum
- Error logs: 30 days minimum
- Baseline statistics: In-memory only, not persisted

## Incident Response Flow

### NORMAL
- Action: IGNORE
- Operator: No action required
- Audit: Log decision for baseline history
- Escalation: None

### SUSPICIOUS
- Action: LOG
- Operator: Monitor for patterns, no immediate action
- Audit: Log decision with reason if available
- Escalation: If pattern emerges (3+ consecutive from same source), escalate to ALERT

### ANOMALOUS
- Action: ALERT
- Operator: Investigate within normal working hours
- Audit: Log decision with reason and signals
- Escalation: If persists for 10+ minutes, escalate to CRITICAL

### CRITICAL
- Action: PAGE
- Operator: Respond immediately, investigate root cause
- Audit: Log decision with full reason and signals
- Escalation: If operator cannot resolve within 15 minutes, escalate to incident commander

### Human Handoff Requirements
- Operator receives PAGE with eventId, source, type, reason
- Operator acknowledges receipt within 5 minutes
- Operator investigates using anomaly reason and signals
- Operator documents findings in incident log
- Operator reports false positives to system maintainers

## Rollback & Recovery

### When Rollback is Allowed
- Deployment artifacts fail validation in staging
- Test failures discovered after deployment but before production traffic
- Configuration errors detected before first event processed
- Baseline corruption detected during initialization

### When Rollback is Forbidden
- After production events processed and decisions output
- After PAGE actions sent to operators
- After audit logs written and acknowledged
- After baseline statistics established for production sources

### Data Integrity Guarantees
- Audit logs append-only, never deleted or modified
- Baseline statistics reset only on full system restart
- Event input never modified, only validated or rejected
- Decision output deterministic from input and baseline state

### Post-Incident Verification
- Re-run validation on all doctrine files
- Verify test suite passes 100%
- Audit baseline statistics for affected sources
- Review false positive and false negative counts
- Document root cause and preventive measures

## Operator Discipline Rules

### What Operators MUST NOT Do
- Manually edit audit logs or decision outputs
- Override classification or action mappings at runtime
- Bypass validation gates to expedite deployment
- Modify doctrine files without running validation
- Disable safety gates to reduce false positives
- Share PAGE action credentials or tokens
- Process events without verifying artifact integrity

### Manual Overrides (Allowed)
- Acknowledge and suppress duplicate PAGE actions
- Adjust environment variables between executions (not during)
- Filter event input before feeding to system
- Route ALERT and PAGE actions to different destinations per environment

### Manual Overrides (Forbidden)
- Change classification thresholds during execution
- Modify baseline statistics manually
- Skip validation steps to save time
- Edit decision outputs before audit
- Disable warm-up gate during production
- Override PAGE rate limits

### Documentation Update Obligations
- Document all production incidents in incident log
- Update failure modes document when new failure discovered
- Update operator playbook when new false positive pattern identified
- Update deployment operations when process changes
- Ensure all changes reviewed before committing to doctrine

## Definition of Production-Ready

### Non-Negotiable Gates
- All tests pass (60/60)
- Build completes with zero errors
- Validation passes with 0 errors and 0 warnings
- All doctrine files end with END OF FILE
- No duplicate concepts outside allowlist
- Artifact checksum matches expected value
- Staging deployment successful with synthetic events
- False positive rate below 10% in staging
- False negative rate below 5% in staging
- Processing latency p99 below 100ms in staging
- Operator training completed and verified
- Incident response runbook reviewed and accessible
- PAGE action routing configured and tested
- Audit log destination verified writable
- Rollback plan documented and rehearsed

END OF FILE
