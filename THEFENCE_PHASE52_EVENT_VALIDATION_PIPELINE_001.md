# THE FENCE — Phase 52: Event Validation Pipeline

## 1. Purpose
Define the mandatory validation pipeline applied to all events before acceptance, persistence, propagation, or execution.

## 2. Pipeline Position

### Validation Occurs Before All Processing
Event validation executes as first-stage gating function before any downstream processing:
- Before ingestion boundary acceptance
- Before schema enforcement
- Before ledger write
- Before notification routing
- Before execution gating
- Before any state modification

### Pipeline Entry Point
All events enter validation pipeline at ingestion boundary regardless of source (human, system, external API).

### Pipeline Exit Points
Events exit validation pipeline via one of three paths:
- Accept: Event proceeds to ledger write per Phase 16, then notification routing per Phase 42, then execution gating per Phase 44
- Reject: Event discarded, rejection logged to audit ledger, no further processing
- Quarantine: Event held in isolated queue for governance review per Section 4

### No Bypass Path
No event bypasses validation pipeline. Governance override requires explicit governance command that itself passes through validation pipeline.

## 3. Validation Stages

### Stage 1: Structural Validation (REQUIRED, ORDERED FIRST)
Validates event contains parsable structure conforming to Phase 51 Event entity definition.

Checks performed:
- Event payload is valid JSON or equivalent structured format
- All required fields per Phase 51 Section 3 Event entity present
- Field types match Phase 51 schema (timestamps as ISO 8601, identifiers as UUIDv7, enums from controlled vocabulary)
- No unknown fields present (strict schema enforcement)

Failure handling: hard_reject per Section 4, event discarded, structural_validation_failure logged.

### Stage 2: Schema Compliance Validation (REQUIRED, ORDERED SECOND)
Validates event content complies with Phase 51 schema constraints for specific event_type.

Checks performed:
- event_type exists in controlled vocabulary
- Required fields for event_type present per Phase 51 Section 11
- Forbidden combinations per Phase 51 Section 11 not present
- Severity level valid for operational_mode per Phase 51 Section 6
- Field value constraints satisfied (e.g., expiry_time > issuance_time for presence tokens)

Failure handling: hard_reject for critical fields, downgrade for optional field violations, schema_compliance_failure logged.

### Stage 3: Authority Validation (REQUIRED, ORDERED THIRD)
Validates actor_id has authority to emit event_type per Phase 51 Section 7.

Checks performed:
- actor_id exists in Phase 21 actor registry
- actor_type matches event_type permitted actor types per Phase 51 Section 7
- Credential signature valid per Phase 21 cryptographic verification
- Authority class (Phase 32 user class) sufficient for event_type and severity
- Non-delegable constraints enforced per Phase 51 Section 7

Failure handling: hard_reject, authority_violation logged, potential Phase 15 adversarial pattern investigation triggered.

### Stage 4: Consent & Presence Validation (REQUIRED, ORDERED FOURTH)
Validates consent and presence requirements satisfied for event_type.

Checks performed:
- If event requires consent per Phase 20: consent_id present, valid, not expired, not revoked, scope covers action
- If event requires presence per Phase 5: presence_token_id present, valid, not expired, not revoked, issuance_time within threshold for severity
- Presence token actor_id matches event actor_id (no delegation)
- Dual-approval coordination satisfied if required per Phase 5

Failure handling: hard_reject for missing consent/presence, consent_violation or presence_violation logged, event discarded.

### Stage 5: Temporal Validation (REQUIRED, ORDERED FIFTH)
Validates event timing per Phase 51 Section 5 time model.

Checks performed:
- event_time within clock skew tolerance (≤ 60 seconds before ingest_time, ≤ 5 seconds after ingest_time)
- causation_id references event with earlier ledger_time (causation ordering)
- No late arrival (event arrives after causally dependent event)
- Expiry constraints satisfied (e.g., session not expired, consent not expired)

Failure handling: hard_reject for causation violations or future events, defer for minor clock skew, temporal_violation logged.

### Stage 6: Duplication & Replay Validation (REQUIRED, ORDERED SIXTH)
Validates event is not duplicate or invalid replay.

Checks performed:
- event_id not already present in Phase 16 audit ledger (duplicate event)
- If replay: entry_id sequence matches expected replay order
- If live operation: deterministic replay semantics satisfied per Phase 51 Section 5
- Idempotency token (dedupe_key for notifications) checked per Phase 51 Section 10

Failure handling: hard_reject for duplicate event_id, replay_violation logged. For idempotent operations, suppress duplicate but log suppression.

### Stage 7: Risk & Escalation Threshold Validation (REQUIRED, ORDERED SEVENTH)
Validates event severity and escalation thresholds per Phase 51 Section 6.

Checks performed:
- Severity level appropriate for operational_mode per Phase 51 Section 6 state ladder
- Required fields for RED/BLACK events present per Phase 51 Section 6
- Escalation eligibility satisfied per Phase 34 if escalation event
- incident_id present for severity 4-5 events
- governance_notification_id present for severity 5 events

Failure handling: escalate for threshold violations (automatic escalation per Phase 34), threshold_violation logged. hard_reject if required fields missing.

### Stage 8: Final Acceptance or Rejection (REQUIRED, ORDERED EIGHTH)
Final validation stage issues accept, reject, or quarantine decision.

Checks performed:
- All prior stages passed
- No conflicting validation results
- Ledger write prerequisites satisfied (ledger component available, entry_id sequence valid)

Acceptance action: Event proceeds to Phase 16 ledger write with validation_passed status.

Rejection action: Event discarded, rejection logged to audit ledger with failure class and reason.

Quarantine action: Event held in isolated dead-letter queue, governance notification emitted per Section 4.

## 4. Failure Classes

### hard_reject
Event permanently rejected, discarded, never processed.

Criteria:
- Structural validation failure
- Schema compliance failure for required fields
- Authority violation
- Consent violation
- Presence violation
- Causation ordering violation
- Duplicate event_id

Handling: Event discarded immediately, rejection logged to audit ledger with failure reason, no further processing, no retry.

### quarantine
Event isolated for governance review, not processed until explicit governance approval.

Criteria:
- Schema compliance failure for non-critical fields where governance decision required
- Ambiguous authority boundary (unclear if actor has authority)
- Unusual event pattern not matching known adversarial signatures but suspicious
- First occurrence of new event_type not in controlled vocabulary

Handling: Event written to isolated quarantine queue, governance notification emitted immediately, event held until governance issues explicit accept/reject command, quarantine logged to audit ledger.

### downgrade
Event accepted with reduced severity or limited processing scope.

Criteria:
- Optional field missing or malformed but event otherwise valid
- Minor clock skew within tolerance threshold
- Non-critical schema validation warning

Handling: Event accepted, downgrade logged to audit ledger with downgrade reason, notification may be suppressed or delivered to reduced recipient set, execution may proceed with reduced authority.

### defer
Event processing delayed pending prerequisite satisfaction.

Criteria:
- Minor temporal validation issue (clock skew within extended tolerance)
- Transient dependency unavailable (e.g., consent verification service temporarily unavailable)
- Rate limiting threshold reached, event queued

Handling: Event held in defer queue for limited time (maximum 5 minutes), retried after delay, if prerequisites not satisfied within timeout, escalate to quarantine or hard_reject.

### escalate
Event triggers automatic escalation to higher authority per Phase 34.

Criteria:
- Severity threshold exceeded for current operational mode
- Risk level requires higher authority approval per Phase 32
- Multiple validation warnings accumulate to escalation threshold

Handling: Event accepted, escalation event automatically generated per Phase 34, original event proceeds with elevated authority requirement, escalation logged to audit ledger.

## 5. Determinism Rules

### Replay Determinism Guarantees
Event validation pipeline guarantees deterministic replay:
- Validation outcome deterministic given event content and ledger state at validation time
- Replaying events in entry_id order produces identical validation results
- Non-deterministic sources (e.g., current wall clock time) replaced with ledger_time during replay
- External dependencies (e.g., consent verification) recorded as events during initial validation, replayed from ledger

### Idempotency Requirements
Event validation idempotent:
- Validating same event multiple times produces identical outcome
- No side effects during validation (read-only checks, no state modification)
- Validation failure does not prevent retry for transient errors (defer class)
- Duplicate event_id rejection ensures idempotency at event level

### Ordering Guarantees
Event validation preserves ordering:
- Validation pipeline processes events in arrival order at ingestion boundary
- Ledger write order matches validation acceptance order
- Causation ordering enforced: parent event validated and accepted before dependent event
- entry_id monotonic ordering reflects validation acceptance order

### Hash Consistency Rules
Event validation ensures hash consistency:
- Event content hashed before validation, hash immutable
- Phase 16 audit ledger entry_hash includes validation outcome
- Hash chain continuity verified during replay per Phase 51 Section 9
- Hash mismatch during replay triggers verification_failed status and governance alert

## 6. Authority Enforcement

### Actor Authority Validation
Authority validation enforces Phase 51 Section 7 actor authority model:
- actor_type extracted from event, validated against Phase 21 actor registry
- event_type permitted actor types per Phase 51 Section 7 enforced
- Authority class (Phase 32 user class) verified sufficient for event severity and decision class
- Signature verification performed using actor credential_id public key per Phase 21

Authority violation results in hard_reject with authority_violation logged to audit ledger.

### Non-Delegable Enforcement
Non-delegable constraints per Phase 51 Section 7 enforced:
- RED/BLACK decision approval: decision_authority_actor_id must match authorized management/governance actor, delegation_source field rejected
- Audit authority: auditor actor_type cannot have delegation_source populated, delegation rejected
- Presence token: presence_token_id must match actor_id, proxy presence rejected
- Governance vote: Phase 8 governance vote events require direct credential signature, delegation rejected

Delegation violation results in hard_reject with non_delegable_violation logged.

### Forbidden Authority Transitions
Forbidden authority transitions rejected:
- Operator cannot emit management-level decisions
- System cannot emit human-only events (presence_confirmation, consent_grant)
- Auditor cannot emit state-modifying events (decision_approval, action_execution)
- Service_account cannot access audit ledger or emit governance commands

Forbidden transition results in hard_reject with authority_boundary_violation logged.

### Escalation-Only Actions
Certain actions require prior escalation per Phase 34:
- ORANGE/RED decision approval requires escalation event preceding approval
- Severity 4-5 event emission requires incident_id from escalated incident per Phase 22
- Governance override requires governance command event preceding override

Escalation-only violation results in hard_reject with escalation_required logged, automatic escalation triggered if appropriate.

## 7. Consent Enforcement

### Consent Verification
Consent verification per Phase 20 consent model:
- If event_type requires consent per Phase 20: consent_id field mandatory
- consent_id validated against Phase 20 consent registry
- Consent record fields verified: consent_holder_actor_id, consent_scope, consent_grant_time, consent_expiry_time, consent_signature
- Consent scope verified to cover action specified in event payload

Consent verification failure results in hard_reject with consent_violation logged.

### Expired Consent Handling
Expired consent rejected:
- Current time (ledger_time during validation) compared to consent_expiry_time
- If ledger_time > consent_expiry_time: consent invalid
- Event rejected with expired_consent violation
- Notification emitted to consent holder and action authority per Phase 38

Expired consent results in hard_reject with expired_consent logged.

### Revoked Consent Handling
Revoked consent rejected:
- consent_id checked against Phase 20 consent revocation registry
- If consent_revocation event exists with matching consent_id and revocation_time ≤ ledger_time: consent invalid
- Event rejected with revoked_consent violation
- Notification emitted to consent holder and action authority per Phase 38

Revoked consent results in hard_reject with revoked_consent logged.

### Absence-of-Consent Handling
Absence of required consent rejected:
- If event_type requires consent per Phase 20 and consent_id absent: violation
- If consent_id present but not found in consent registry: violation
- Event rejected with missing_consent violation
- Automatic consent request event generated per Phase 20 if appropriate

Absence of consent results in hard_reject with missing_consent logged, consent request escalation triggered.

## 8. Logging & Evidence

### Minimum Evidence Captured Per Failure
All validation failures logged to Phase 16 audit ledger with mandatory fields:
- event_id (failed event identifier)
- failure_class (per Section 4: hard_reject/quarantine/downgrade/defer/escalate)
- failure_reason (structured reason code from controlled vocabulary)
- failure_stage (validation stage per Section 3)
- validation_time (ledger_time when validation failed)
- validator_component_id (validation pipeline component identifier)
- event_payload_hash (SHA-256 hash of original event payload for evidence)
- rejection_signature (cryptographic signature of rejection decision)

### Mandatory Audit Fields
All validation outcomes (accept or reject) logged to Phase 16 audit ledger per Phase 51 Section 9:
- Acceptance: event written to ledger with validation_passed status, normal audit fields per Phase 51
- Rejection: rejection event written to ledger with failure class and reason
- Quarantine: quarantine event written to ledger with governance_notification_id
- Downgrade: event written to ledger with validation_downgraded status and downgrade reason
- Defer: defer event written to ledger, retry logged separately
- Escalate: event written to ledger with validation_passed status, escalation event written separately

### Cross-Reference Requirements to Phase 51
Validation logging uses Phase 51 canonical entities:
- Validation failure events use Event entity structure per Phase 51 Section 3
- event_type for validation failures: validation_failure with subcategories per failure_reason
- correlation_id links failed event to original event attempt
- causation_id references original event_id for rejection/quarantine events
- All Phase 51 Section 4 identifier fields (trace_id, hop_id) propagated from original event

## 9. Blocking Rules

### Conditions That MUST Block Downstream Execution
Execution blocked for:
- Any hard_reject failure per Section 4
- Authority violation per Section 6
- Consent violation per Section 7 (expired, revoked, missing)
- Presence violation (missing or invalid presence_token_id for RED/BLACK actions)
- Causation ordering violation (dependent event before parent)
- Duplicate event_id
- Missing required fields per Phase 51 Section 11

Blocking enforcement: Event never reaches Phase 44 execution handoff, rejected at validation pipeline exit.

### Conditions That MUST Block Notification
Notification blocked for:
- Structural validation failure (event cannot be serialized for notification)
- Authority violation (notification would violate Phase 33 visibility boundaries)
- Quarantined events (notification suppressed until governance review)
- Duplicate notification dedupe_key within deduplication window per Phase 51 Section 10

Blocking enforcement: Event never reaches Phase 42 routing, rejected or held at validation pipeline exit.

### Conditions That Allow Containment Without Execution
Containment permitted for:
- Downgrade failures (event logged, notification limited, execution skipped or reduced scope)
- Defer failures (event logged, execution delayed pending retry)
- Escalate outcomes (event logged, execution gated on escalation approval)

Containment enforcement: Event written to ledger for audit, notification may be limited to governance/auditor, execution gated or skipped.

## 10. Non-Bypass Guarantees

### Manual Override Prohibition
Manual override of validation pipeline prohibited:
- No API endpoint permits validation bypass
- No configuration toggle permits validation disablement
- No operational mode permits validation skip (including BLACK mode)
- Governance override requires governance command event that itself passes through validation pipeline

Bypass attempt logged as Phase 15 adversarial pattern, system halt triggered per Phase 19 guardrails.

### Silent Acceptance Prohibition
Silent acceptance without validation prohibited:
- All events logged to Phase 16 audit ledger with validation outcome
- No event accepted without explicit validation_passed or validation_downgraded status
- Absence of validation outcome treated as validation failure
- Validation pipeline component failure triggers governance alert and system degradation per Phase 12

Silent acceptance attempt logged as implementation error, automatic quarantine of affected events.

### Partial Validation Prohibition
Partial validation prohibited:
- All validation stages per Section 3 required, no stage skipping permitted
- Stage ordering enforced, later stages cannot execute if earlier stage failed
- Multi-stage failure logged with all stage results, earliest failure stage determines outcome
- Validation pipeline atomic: event either fully validated (all stages passed) or rejected

Partial validation attempt logged as pipeline_integrity_violation, affected events quarantined.

### Validation State Immutability
Validation outcome immutable once recorded:
- validation_passed status cannot be retroactively changed to validation_failed
- Rejected events cannot be retroactively accepted
- Validation outcome recorded in Phase 16 audit ledger, immutable per Phase 16 append-only guarantee
- Validation re-evaluation requires new event submission with new event_id

Validation state modification attempt logged as Phase 15 adversarial pattern, audit integrity investigation triggered.

## 11. Non-Claims

### Cannot: Guarantee Event Correctness
Validation pipeline validates event structure, authorization, and compliance with schema constraints but does not guarantee event content correctness, accuracy, or appropriateness.

### Cannot: Guarantee Semantic Validity
Validation pipeline enforces syntactic schema compliance but does not validate semantic meaning, intent, or contextual appropriateness of events.

### Cannot: Prevent All Authorized Misuse
Validation pipeline enforces authority boundaries but cannot prevent authorized actors from emitting valid but inappropriate events within their authority.

### Cannot: Guarantee Timeliness
Validation pipeline processes events in order but does not guarantee real-time processing latency or bounded validation time.

### Cannot: Validate External System State
Validation pipeline validates consent, presence, and authority against THE FENCE internal registries but does not validate external system state referenced in event payloads.

### Cannot: Guarantee Replay Correctness
Validation pipeline guarantees deterministic replay given identical ledger state but does not guarantee replay produces semantically correct system state if original events were flawed.

### Cannot: Detect All Adversarial Patterns
Validation pipeline enforces known constraints but cannot detect all adversarial patterns, novel attack vectors, or sophisticated multi-event manipulation.

### Cannot: Guarantee Availability
Validation pipeline provides blocking guarantees but does not guarantee pipeline availability, component uptime, or fault tolerance.

### Cannot: Prevent Governance Errors
Validation pipeline enforces governance commands that pass validation but cannot prevent governance from issuing incorrect or harmful commands.

### Cannot: Guarantee Completeness
Validation pipeline validates required fields present but does not guarantee semantic completeness of information or sufficiency for decision-making.

END OF FILE
