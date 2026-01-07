# PHASE 4.2: API & CONTRACT SURFACES
## Phase: Runtime
## Status: Defined (Build-Ready)

---

## CONTRACT PRINCIPLES
- Governance rules are authoritative, published as signed artifacts; execution services do not call Governance for runtime authorization.
- All cross-service calls must carry signed provenance and request hashes for non-repudiation.
- Every contract emits audit events; no contract may suppress required audit emissions.
- Presence, hop, and permit tokens are required inputs for any RED/BLACK-level operation.
- Forbidden uses are explicit per contract and enforced by callee-side validation.

---

## CROSS-ZONE CONTRACT MAP
- TelemetryGateway (COMMUNICATION) -> BaselineRiskEngine (EXECUTION)
- BaselineRiskEngine (EXECUTION) -> DecisionHopManager (GOVERNANCE)
- DecisionHopManager (GOVERNANCE) -> OperatorConsole (UI)
- OperatorConsole (UI) -> DecisionHopManager (GOVERNANCE)
- DecisionHopManager (GOVERNANCE) -> ActionEnforcement (EXECUTION)
- ActionEnforcement (EXECUTION) -> AuditLedger (AUDIT)
- ActionEnforcement (EXECUTION) -> TelemetryGateway (COMMUNICATION)
- PolicyGovernance (GOVERNANCE) -> DecisionHopManager (GOVERNANCE)
- OperatorConsole (UI) -> PolicyGovernance (GOVERNANCE)
- RecoveryOrchestrator (EXECUTION) -> ActionEnforcement (EXECUTION)
- EscalationService (COMMUNICATION) -> OperatorConsole (UI)
- IdentityKMS (IDENTITY) -> AuditLedger (AUDIT)

---

## CONTRACT DEFINITIONS

### TelemetryGateway -> BaselineRiskEngine
- CALLER -> CALLEE: TelemetryGateway -> Baseline & Risk Engine
- PURPOSE: Deliver validated, canonical telemetry with provenance for baseline and anomaly computation.
- REQUIRED INPUT FIELDS: sensor_id, timestamp, metric_name, metric_value, provenance_sig, device_cert_hash
- REQUIRED OUTPUT FIELDS: ingest_ack_id, canonical_stream_id, provenance_hash
- REQUIRED AUTHORITY: System (TelemetryGateway service identity)
- REQUIRED ACK / HOPS: None
- AUDIT EVENTS EMITTED: telemetry_ingest_received, provenance_validation_result
- FAILURE BEHAVIOR: buffer telemetry to durable queue and emit ingest_failure audit; drop malformed with audit entry.
- FORBIDDEN USES: Accepting telemetry without device-bound provenance or forwarding raw telemetry that bypasses normalization.

### BaselineRiskEngine -> DecisionHopManager
- CALLER -> CALLEE: Baseline & Risk Engine -> Decision Hop Manager
- PURPOSE: Submit anomaly/risk signals that may create or update decision hops.
- REQUIRED INPUT FIELDS: canonical_stream_id, anomaly_score, window_summary_hash, baseline_version
- REQUIRED OUTPUT FIELDS: hop_request_id, suggested_risk_state
- REQUIRED AUTHORITY: System (BaselineRiskEngine service identity)
- REQUIRED ACK / HOPS: None (hop creation triggers downstream operator acknowledgments)
- AUDIT EVENTS EMITTED: risk_signal_emitted, baseline_change_recorded
- FAILURE BEHAVIOR: rate-limit signals and emit degraded_health audit; fallback to conservative suggestions.
- FORBIDDEN USES: Directly authorizing actions or issuing permits to Action Enforcement.

### DecisionHopManager -> OperatorConsole
- CALLER -> CALLEE: Decision Hop Manager -> Operator & Supervisor Console
- PURPOSE: Request human acknowledgment, intent, and presence for a hop checkpoint.
- REQUIRED INPUT FIELDS: hop_request_id, suggested_risk_state, required_presence_level, evidence_link
- REQUIRED OUTPUT FIELDS: ui_notification_id, ack_window_seconds
- REQUIRED AUTHORITY: Governance-signed hop policy (published) or DecisionHopManager service identity
- REQUIRED ACK / HOPS: Requires operator acknowledgment via OperatorConsole -> DecisionHopManager contract
- AUDIT EVENTS EMITTED: hop_notification_sent
- FAILURE BEHAVIOR: escalate to EscalationService if notification fails to deliver; record delivery_failure audit.
- FORBIDDEN USES: Sending actionable permits without hop validation or presigned governance artifacts.

### OperatorConsole -> DecisionHopManager
- CALLER -> CALLEE: Operator & Supervisor Console -> Decision Hop Manager
- PURPOSE: Submit signed human acknowledgments, presence tokens, intent text, and override requests.
- REQUIRED INPUT FIELDS: hop_request_id, actor_id, presence_token, intent_text, signature_hash
- REQUIRED OUTPUT FIELDS: ack_id, hop_completion_status
- REQUIRED AUTHORITY: Actor role (Operator/Supervisor) and device-bound signature
- REQUIRED ACK / HOPS: This call fulfills required acknowledgment hop; may include Supervisor signature for overrides
- AUDIT EVENTS EMITTED: human_ack_submitted, presence_attestation_recorded, override_request_submitted
- FAILURE BEHAVIOR: reject unsigned or malformed acknowledgments; emit ack_rejection audit.
- FORBIDDEN USES: Pretending presence without valid presence_token; submitting forged signatures.

### DecisionHopManager -> ActionEnforcement
- CALLER -> CALLEE: Decision Hop Manager -> Action Enforcement Service
- PURPOSE: Issue validated execution permit for staged actions after required hops complete.
- REQUIRED INPUT FIELDS: hop_chain_id, execution_permit_token, action_plan_hash, permit_signature_hash
- REQUIRED OUTPUT FIELDS: execution_request_id, permit_acceptance_status
- REQUIRED AUTHORITY: Governance-signed permit or DecisionHopManager service identity referencing signed policy
- REQUIRED ACK / HOPS: Must reference completed hop records in Audit Ledger
- AUDIT EVENTS EMITTED: execution_permit_issued
- FAILURE BEHAVIOR: deny execution if permit invalid or hop records missing; emit permit_denied audit.
- FORBIDDEN USES: Accepting permits that do not reference hop_chain_id or allowing permit reuse across distinct action_plans.

### ActionEnforcement -> AuditLedger
- CALLER -> CALLEE: Action Enforcement Service -> Audit Ledger Service
- PURPOSE: Persist pre-execution, execution, verification, and rollback artifacts as immutable records.
- REQUIRED INPUT FIELDS: action_id, hop_chain_id, pre_state_hash, actor_id, device_ids, signatures
- REQUIRED OUTPUT FIELDS: ledger_entry_id, entry_hash
- REQUIRED AUTHORITY: Service identity with signing via IdentityKMS
- REQUIRED ACK / HOPS: Writes must occur before marking execution complete; sequence enforced by hop_chain ordering
- AUDIT EVENTS EMITTED: action_artifact_written
- FAILURE BEHAVIOR: use fallback durable writer and emit ledger_write_deferred audit; do not mark action complete until write confirmed
- FORBIDDEN USES: Deleting or modifying existing ledger entries; accepting unsigned artifacts.

### ActionEnforcement -> TelemetryGateway (verification)
- CALLER -> CALLEE: Action Enforcement Service -> Telemetry Gateway Service
- PURPOSE: Request verification telemetry for action outcome and per-node confirmation.
- REQUIRED INPUT FIELDS: verification_request_id, device_ids, expected_metric_names, time_window
- REQUIRED OUTPUT FIELDS: verification_stream_refs, verification_hashes
- REQUIRED AUTHORITY: Execution service identity and reference to execution_permit_token
- REQUIRED ACK / HOPS: Verification must reference audit ledger entries and signatures
- AUDIT EVENTS EMITTED: verification_requested, verification_result_recorded
- FAILURE BEHAVIOR: if telemetry unavailable, mark node as unverified and escalate partial execution to Recovery Orchestrator
- FORBIDDEN USES: Requesting telemetry with missing provenance or requesting historical telemetry outside retention without governance approval.

### PolicyGovernance -> DecisionHopManager (policy publish)
- CALLER -> CALLEE: Policy & Governance Service -> Decision Hop Manager
- PURPOSE: Publish signed policy snapshots, override approvals, and permitted hop templates.
- REQUIRED INPUT FIELDS: policy_snapshot_id, policy_hash, signature, effective_timestamp
- REQUIRED OUTPUT FIELDS: publish_ack_id, policy_reference_token
- REQUIRED AUTHORITY: Governance role (signed by Governance service keys)
- REQUIRED ACK / HOPS: None (readers must verify signature before enforcement)
- AUDIT EVENTS EMITTED: policy_published
- FAILURE BEHAVIOR: refuse unsigned policies; maintain last-signed policy for enforcement
- FORBIDDEN USES: Embedding private governance keys in transit or using this channel for direct actuation.

### OperatorConsole -> PolicyGovernance (override request)
- CALLER -> CALLEE: Operator & Supervisor Console -> Policy & Governance Service
- PURPOSE: Submit override requests with evidence for Supervisor/Governance review.
- REQUIRED INPUT FIELDS: override_request_id, hop_chain_id, actor_id, evidence_link, justification_text, signature_hash
- REQUIRED OUTPUT FIELDS: override_request_ack_id, review_queue_position
- REQUIRED AUTHORITY: Actor role (Supervisor/Operator) and signature; final approval requires Governance action
- REQUIRED ACK / HOPS: Override requires dual-approval per doctrine; DecisionHopManager tracks approvals
- AUDIT EVENTS EMITTED: override_request_submitted
- FAILURE BEHAVIOR: reject unsigned requests; queue requests persistently; emit override_submission_failed audit
- FORBIDDEN USES: Bypassing hop requirements by marking actions as approved locally.

### RecoveryOrchestrator -> ActionEnforcement (recovery action)
- CALLER -> CALLEE: Recovery Orchestrator -> Action Enforcement Service
- PURPOSE: Execute probation-scoped recovery actions under dual-validated permits.
- REQUIRED INPUT FIELDS: recovery_bundle_id, validator_ids, recovery_action_plan_hash, dual_approval_signatures
- REQUIRED OUTPUT FIELDS: recovery_execution_id, probation_status
- REQUIRED AUTHORITY: Dual human validators (Supervisor + Validator) and Governance policy reference
- REQUIRED ACK / HOPS: Must reference Audit Ledger evidence bundle and DecisionHopManager recovery gates
- AUDIT EVENTS EMITTED: recovery_action_issued, probation_action_recorded
- FAILURE BEHAVIOR: halt recovery progression if proofs missing; revert to BLACK if critical inconsistencies discovered
- FORBIDDEN USES: Single-actor recovery approvals or time-only-driven recovery promotion.

### EscalationService -> OperatorConsole
- CALLER -> CALLEE: Escalation & Notification Service -> Operator & Supervisor Console
- PURPOSE: Deliver risk-state alerts, presence requests, and management escalations with Audit references.
- REQUIRED INPUT FIELDS: alert_id, hop_chain_ref, severity, ledger_bundle_ref
- REQUIRED OUTPUT FIELDS: delivery_receipt_id, escalation_route_id
- REQUIRED AUTHORITY: Escalation service identity and signed alert metadata
- REQUIRED ACK / HOPS: None for delivery; presence/hop acknowledgments follow OperatorConsole -> DecisionHopManager contract
- AUDIT EVENTS EMITTED: alert_delivered, delivery_failure
- FAILURE BEHAVIOR: use alternative channels; record delivery failures to Audit Ledger
- FORBIDDEN USES: Suppressing ledger references or sending alerts without audit context.

### IdentityKMS -> AuditLedger (signature proof)
- CALLER -> CALLEE: Identity & Key Management Service -> Audit Ledger Service
- PURPOSE: Store signature proofs and key-reference metadata required for ledger verification.
- REQUIRED INPUT FIELDS: key_id, public_key_hash, signature_proof, issuance_event_id
- REQUIRED OUTPUT FIELDS: key_record_id, ledger_reference_hash
- REQUIRED AUTHORITY: Identity zone master signing authority
- REQUIRED ACK / HOPS: None
- AUDIT EVENTS EMITTED: key_issued, key_revoked
- FAILURE BEHAVIOR: on suspected compromise, publish revocation and emit emergency_freeze audit
- FORBIDDEN USES: Exporting private keys or embedding private keys in ledger entries.

---

## SIGNING & NON-REPUDIATION RULES
- All cross-service requests must include a signed provenance header and a request hash; callers sign with service-bound keys issued by `IdentityKMS`.
- Human actions require device-bound signatures and presence tokens; dual-approval flows require independent signatures from two distinct actors.
- Ledger entries must include signature metadata and chain hashes enabling full non-repudiation during governance replay.
- Replayability requirement: any decision must be reconstructable by validating signatures against `IdentityKMS` records and ledger chains.

---

## RATE LIMITING & ABUSE RULES
- Each caller identity has a configurable RPS limit; TelemetryGateway and BaselineRiskEngine support burst allowances with enforced backpressure.
- Operator Console actions are rate-limited per actor to prevent scripted bulk acknowledgments; repeated rapid ACKs are flagged for bypass detection.
- Override request submission rate is low and subject to governance queueing; excessive overrides trigger governance review.
- Abuse behavior (forged signatures, provenance skips, replay attacks) results in immediate revocation of keys and quarantine of the caller identity; all such events are auditable.

---

## ACCEPTANCE CRITERIA
- Contract coverage: All cross-zone calls listed and contracts defined with required fields.
- No duplicate contracts or overlapping endpoints exist; each contract unique and purpose-specific.
- Governance isolation: execution services do not successfully call Governance for authorization in injection tests; only signed permits are accepted.
- Audit linkage: every contract emits at least one audit event and ledger references are verifiable in replay tests.
- Presence & hops enforcement: RED/BLACK-level flows require presence tokens and hop-chain references; unauthorized requests are rejected.
- Failure handling: simulated failures (message loss, malformed inputs, missing signatures) produce defined audit events and safe failure behaviors.

---

*End of contracts.*
