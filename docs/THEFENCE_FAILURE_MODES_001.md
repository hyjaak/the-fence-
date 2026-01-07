# THEFENCE — Failure Modes

Version: 001  
Date: 2026-01-06

## Purpose

Failure modes define how THE FENCE system behaves when conditions deviate from normal operation. Safe-by-default means the system prioritizes operator safety and data integrity over performance or convenience. When uncertain, the system must default to the safest classification, action, and logging behavior to prevent silent failures and undetected incidents.

## Failure Mode Index

| ID | Category | Trigger | Expected System Behavior | Operator Action |
|---|---|---|---|---|
| F01 | Input | Missing required field | Reject event, log error, continue processing | Review input schema |
| F02 | Input | Wrong type | Reject event, log error, continue processing | Fix event producer |
| F03 | Input | Empty event stream | No output, log warning, exit cleanly | Verify event source |
| F04 | Input | Corrupted JSON | Skip malformed line, log error, continue | Fix upstream serialization |
| F05 | Input | Out-of-order timestamps | Process anyway, log warning | Investigate source clock |
| F06 | Input | Duplicate eventId | Process both, log warning | Deduplicate upstream |
| F07 | Input | Unknown metric name | Include in metrics, log info | Verify metric name |
| F08 | Input | Unbounded string size | Truncate to 1KB, log warning | Enforce size limits upstream |
| F09 | Statistical | Missing baseline stats | Classify as SUSPICIOUS, action LOG | Wait for warm-up period |
| F10 | Statistical | Baseline std = 0 | Z-score undefined, classify NORMAL | Increase baseline variance |
| F11 | Statistical | Extreme z-score (>100) | Cap at 100, classify CRITICAL | Investigate data corruption |
| F12 | Statistical | Baseline drift | Gradual adaptation via rolling window | Monitor for step changes |
| F13 | Statistical | Cold start | Warm-up gate active, reduced sensitivity | Collect minimum samples |
| F14 | Statistical | Insufficient history | Classify as SUSPICIOUS, action LOG | Continue observation |
| F15 | Statistical | NaN or Infinity | Reject metric, log error, use remaining metrics | Fix metric calculation |
| F16 | Classification | Oscillation | Rate-limit alerts, log pattern | Tune thresholds |
| F17 | Classification | False positive flood | Apply dedupe window, log count | Adjust sensitivity |
| F18 | Classification | False negative | Operator reports missed incident | Lower thresholds for metric |
| F19 | Classification | Inconsistent action | Enforce action mapping table | Audit configuration |
| F20 | Classification | Escalation failure | Default to PAGE for CRITICAL | Verify action router |
| F21 | Classification | PAGE storm | Rate-limit to 1 per source per 5 minutes | Investigate root cause |
| F22 | Doctrine | Missing END OF FILE | Validation fails, reject file | Add marker |
| F23 | Doctrine | Duplicate concept | Validation fails, report conflict | Use allowlist or reword |
| F24 | Doctrine | Allowlist misuse | Manual review required | Justify allowlist entry |
| F25 | Doctrine | Invalid file name | Validation skips file, log warning | Rename to standard format |
| F26 | Doctrine | Missing phases folder | Validation finds 0 files | Create docs/phases/ |
| F27 | Runtime | CLI invocation error | Print usage, exit code 1 | Check command syntax |
| F28 | Runtime | File not found | Print error, exit code 1 | Verify file path |
| F29 | Runtime | Permission denied | Print error, exit code 1 | Check file permissions |
| F30 | Runtime | Missing env var | Use default or fail explicitly | Set required variables |
| F31 | Runtime | Memory constraint | Process events incrementally | Increase heap size |
| F32 | Logging | Missing audit entry | Log error, continue processing | Investigate logger |
| F33 | Logging | Partial write | Retry once, log failure | Check disk space |
| F34 | Logging | Clock skew | Use event timestamp, log warning | Sync system clocks |
| F35 | Logging | Log integrity compromised | Halt processing, alert operator | Restore from backup |
| F36 | Logging | Operator identity missing | Use system user, log warning | Configure identity |

## Input & Data Failures

### Missing Required Fields
- System must reject event immediately
- Log error with eventId if available, otherwise use line number
- Continue processing remaining events
- Operator must review input schema and fix event producer

### Wrong Type
- System must reject event if field type does not match schema
- Log error with field name, expected type, received type
- Continue processing remaining events
- Operator must fix event producer to send correct types

### Empty Events
- System must detect zero-length input stream or empty file
- Log warning indicating no events processed
- Exit cleanly with code 0
- Operator must verify event source is operational

### Corrupted JSON / Parse Failures
- System must skip malformed line
- Log error with line number and parse error message
- Continue processing next line
- Operator must investigate upstream serialization issues

### Out-of-Order Timestamps
- System must process event regardless of timestamp order
- Log warning if timestamp regression detected
- Baseline calculations use event arrival order
- Operator must investigate source clock synchronization

### Duplicate eventId
- System must process both events
- Log warning with duplicate eventId
- Operator must implement deduplication upstream or accept duplicates

### Unknown Metric Names
- System must include metric in event processing
- Log info-level message for new metric names
- Begin baseline collection for new metric
- Operator must verify metric name is intentional

### Unbounded String Sizes
- System must truncate strings exceeding 1KB
- Log warning with field name and original length
- Continue processing with truncated value
- Operator must enforce size limits at event producer

## Statistical / Baseline Failures

### Baseline Mean or Std Missing
- System must classify event as SUSPICIOUS
- Action must be LOG
- Log warning indicating insufficient baseline data
- Operator must wait for warm-up period to complete

### Baseline Std = 0 or Near-Zero
- System must treat z-score as undefined
- Classify event as NORMAL
- Log warning indicating zero variance baseline
- Operator must increase baseline variance or accept normal classification

### Extreme Z-Scores
- System must cap z-score at 100
- Classify as CRITICAL if capped value exceeds threshold
- Log warning with actual z-score value
- Operator must investigate potential data corruption or misconfiguration

### Baseline Drift
- System must use rolling window to adapt gradually
- Do not reset baseline abruptly
- Log info-level messages when baseline shifts significantly
- Operator must monitor for step changes indicating incidents

### Cold Start Behavior
- System must activate warm-up gate for new sources
- Reduce sensitivity until minimum samples collected
- Classify events as SUSPICIOUS during warm-up
- Operator must allow minimum 20 samples before trusting classifications

### Insufficient History
- System must classify event as SUSPICIOUS
- Action must be LOG
- Continue baseline collection
- Operator must continue observation until sufficient samples collected

### NaN / Infinity
- System must reject metric containing NaN or Infinity
- Log error with metric name
- Use remaining metrics for anomaly detection
- Operator must fix metric calculation at source

## Classification & Action Failures

### Oscillation
- System must detect rapid classification changes
- Rate-limit alerts to prevent noise
- Log oscillation pattern for analysis
- Operator must tune thresholds or adjust baseline window

### False Positives Flood
- System must apply deduplication window
- Log count of suppressed duplicates
- Maintain single active alert per source per time window
- Operator must adjust sensitivity parameters

### False Negatives Risk
- Operator reports incident not detected by system
- Review metric baselines for affected source
- Lower thresholds for specific metric type
- Add metric-specific detection if missing

### Inconsistent Action Mapping
- System must enforce classification-to-action mapping table
- NORMAL → IGNORE, SUSPICIOUS → LOG, ANOMALOUS → ALERT, CRITICAL → PAGE
- Log error if mapping violated
- Operator must audit action router configuration

### Action Escalation Rules Failing
- System must default to PAGE for CRITICAL classification
- Log error if escalation fails
- Retry escalation once
- Operator must verify action router operational

### PAGE Storm Protection
- System must rate-limit PAGE actions to 1 per source per 5 minutes
- Log count of suppressed PAGE actions
- Maintain alert fatigue protection
- Operator must investigate root cause of storm

## Doctrine / Documentation Failures

### Missing END OF FILE
- Validation must fail immediately
- Report file path and error
- Operator must add marker to end of file
- Re-run validation after fix

### Duplicate Concepts Across Phases
- Validation must fail immediately
- Report both file paths and concept hash
- Operator must add to allowlist if justified, otherwise reword one concept
- Re-run validation after fix

### Allowlist Misuse
- Manual review required for all allowlist entries
- Allowlist must contain only intentionally shared concepts
- Operator must justify each allowlist entry
- Remove allowlist entries if concepts can be reworded

### Invalid File Naming Convention
- Validation must skip file and log warning
- File must match pattern: THEFENCE_PHASE\d+_NAME_\d+\.md
- Operator must rename file to standard format
- Re-run validation after rename

### Docs Directory Missing Phases Folder
- Validation must find 0 files
- Log error indicating missing directory
- Operator must create docs/phases/ directory
- Move phase files into phases/ subdirectory

## Runtime / Execution Failures

### CLI Invocation Errors
- System must print usage instructions
- Exit with code 1
- Log error with invalid arguments
- Operator must check command syntax and flags

### File Not Found
- System must print error with file path
- Exit with code 1
- Do not create default files silently
- Operator must verify file path is correct

### Permission Denied
- System must print error with file path and permission issue
- Exit with code 1
- Do not attempt workarounds
- Operator must check file permissions and ownership

### Environment Variable Missing
- System must use default value if available
- If required variable missing, fail explicitly with error message
- Exit with code 1
- Operator must set required environment variables

### Memory / CPU Constraints
- System must process events incrementally without buffering entire stream
- Use streaming NDJSON parser
- Release memory after each event processed
- Operator must increase heap size if out-of-memory errors occur

## Logging / Audit Failures

### Missing Audit Entry
- System must log error indicating audit failure
- Continue processing events
- Operator must investigate logger configuration
- Verify audit log destination is writable

### Partial Write
- System must retry write once
- If retry fails, log error with entry details
- Continue processing
- Operator must check disk space and file system integrity

### Clock Skew
- System must use event timestamp from input
- Log warning if system clock differs significantly
- Continue processing with event timestamp
- Operator must synchronize system clocks via NTP

### Log Integrity Expectations
- Audit logs must be append-only
- Tampering must be detectable
- Critical events must be logged before action taken
- Operator must verify log integrity before incident review

### Operator Identity Missing
- System must use system user as fallback
- Log warning indicating missing identity
- Continue processing
- Operator must configure identity via environment or config file

## Safety Defaults (Non-Negotiables)

### Default Classification Policy
- When uncertain, classify as SUSPICIOUS (not NORMAL)
- During warm-up, classify as SUSPICIOUS
- With missing baselines, classify as SUSPICIOUS
- Never classify as NORMAL when data is insufficient

### Default Action Policy
- NORMAL events must use IGNORE action
- SUSPICIOUS events must use LOG action
- ANOMALOUS events must use ALERT action
- CRITICAL events must use PAGE action
- When classification fails, default to ALERT action

### Required Audit Fields
- Every decision must log: eventId, ts, score, classification, action, source, type, severity
- Missing eventId must use generated UUID
- Missing ts must use current timestamp
- All other fields required in decision output

### Required Warnings
- System must warn when baselines unstable
- System must warn when rate-limiting active
- System must warn when metrics rejected
- System must warn when input malformed
- Warnings must not be suppressible

## Operator Checklist (Before/After)

### Before Running Validation
- Verify all phase files are in docs/phases/ directory
- Check that all phase files end with END OF FILE marker
- Review any recent changes to doctrine files
- Ensure no absolute guarantee language added

### Before Deploying
- Run npm run gate and verify all gates pass
- Review any new allowlist entries for justification
- Verify anomaly detection thresholds appropriate for environment
- Test CLI with sample event file
- Check that logging destination is writable

### After Detecting CRITICAL
- Review anomaly reason and signals
- Correlate with infrastructure monitoring
- Check if other sources showing similar pattern
- Determine if incident response required
- Document root cause after resolution

### After PAGE Action
- Acknowledge alert within SLA timeframe
- Investigate event context and metrics
- Verify baseline statistics are stable
- Check for false positive patterns
- Escalate if cause unclear or impact severe

### After Changing Doctrine Files
- Run npx thefence validate before commit
- Verify no duplicate concepts introduced
- Check END OF FILE marker present
- Review Non-Claims linting results
- Test that validation passes with 0 errors

END OF FILE
