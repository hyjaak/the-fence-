# THE FENCE — Phase 51: Data & Event Schema (Contract)

## 1. Purpose
Define the canonical data/event contract used by all phases (ingestion, ledger, hops, governance, runtime, UI, notifications).

## 2. Scope
- Applies to: all system-generated events, human acknowledgements, presence tokens, escalation records, decision records, audit ledger entries.
- Excludes: free-form narrative; subjective interpretation; intent inference.

## 3. Canonical Entities

### Event
Description: Immutable record of state change or signal emission within THE FENCE system.

Required Fields:
- event_id (opaque unique identifier)
- event_type (category from controlled vocabulary)
- event_time (ISO 8601 timestamp at source)
- ingest_time (ISO 8601 timestamp at ingestion)
- ledger_time (ISO 8601 timestamp at ledger write)
- correlation_id (links related events across phases)
- causation_id (direct causal parent event)
- trace_id (top-level operation identifier)
- hop_id (execution hop identifier from Phase 14)
- actor_id (entity responsible for event emission)
- actor_type (from Actor types in Section 7)
- severity (from severity ladder in Section 6)
- operational_mode (GREEN/YELLOW/ORANGE/RED/BLACK from Phase 12)
- payload (event-specific structured data)

Optional Fields:
- session_id (Phase 35 session identifier if session-scoped)
- asset_id (affected asset identifier if applicable)
- decision_id (Phase 40 decision identifier if decision-related)
- incident_id (Phase 22 incident identifier if incident-related)
- metadata (additional context not required for processing)

Immutability rule: All fields immutable after ledger write. Corrections via compensating event only.

### Actor
Description: Entity authorized to emit events or perform actions within THE FENCE system.

Required Fields:
- actor_id (opaque unique identifier)
- actor_type (system/operator/supervisor/management/auditor/service_account)
- credential_id (Phase 21 credential identifier for human actors)
- enrollment_time (ISO 8601 timestamp of Phase 8 enrollment)
- authority_class (Phase 32 user class)

Optional Fields:
- display_name (human-readable identifier)
- component_id (system component identifier for non-human actors)
- delegation_source (actor_id of delegating authority if delegated)

Immutability rule: actor_id, actor_type, credential_id immutable after creation. Authority_class mutable via governance command only.

### Asset
Description: Enumerated resource under THE FENCE governance.

Required Fields:
- asset_id (opaque unique identifier)
- asset_type (from Phase 9 asset taxonomy)
- classification (Phase 9 classification level)
- enrollment_time (ISO 8601 timestamp)
- owner_actor_id (responsible actor)

Optional Fields:
- parent_asset_id (hierarchical parent if applicable)
- metadata (asset-specific attributes)

Immutability rule: asset_id, asset_type immutable after creation. Classification mutable via governance command with audit trail.

### Session
Description: Bounded time window for human-system interaction per Phase 35.

Required Fields:
- session_id (opaque unique identifier)
- actor_id (session-bound actor)
- session_start_time (ISO 8601 timestamp)
- presence_token_id (Phase 5 presence token identifier)
- operational_mode (mode at session start)

Optional Fields:
- session_end_time (ISO 8601 timestamp, null if active)
- termination_reason (if terminated)
- parent_session_id (for session escalation)

Immutability rule: session_id, actor_id, session_start_time, presence_token_id immutable. Session_end_time write-once.

### PresenceToken
Description: Cryptographic proof of human presence per Phase 5.

Required Fields:
- presence_token_id (opaque unique identifier)
- actor_id (present actor)
- issuance_time (ISO 8601 timestamp)
- expiry_time (ISO 8601 timestamp)
- verification_method (biometric/hardware_key/dual_approval)
- signature (cryptographic signature of token content)

Optional Fields:
- revocation_time (ISO 8601 timestamp if revoked)
- revocation_reason (if revoked)

Immutability rule: All fields except revocation_time and revocation_reason immutable. Revocation fields write-once.

### Decision
Description: Authorized choice requiring finalization per Phase 40.

Required Fields:
- decision_id (opaque unique identifier)
- decision_type (from Phase 39 decision taxonomy)
- decision_authority_actor_id (deciding actor)
- proposal_time (ISO 8601 timestamp)
- decision_class (Phase 32 decision class)
- approval_requirements (Phase 5 approval structure)
- correlation_id (links to precipitating event)

Optional Fields:
- finalization_time (ISO 8601 timestamp, null if pending)
- rejection_time (ISO 8601 timestamp if rejected)
- execution_handoff_time (ISO 8601 timestamp per Phase 44)
- outcome_state (Phase 47 terminal state if executed)
- closure_time (ISO 8601 timestamp per Phase 50)

Immutability rule: decision_id, decision_type, decision_authority_actor_id, proposal_time immutable. Finalization_time, rejection_time, execution_handoff_time, outcome_state, closure_time write-once.

### Acknowledgement
Description: Explicit human confirmation of information receipt per Phase 39.

Required Fields:
- acknowledgement_id (opaque unique identifier)
- actor_id (acknowledging actor)
- acknowledged_event_id (event being acknowledged)
- acknowledgement_time (ISO 8601 timestamp)
- acknowledgement_type (information_receipt/decision_approval/presence_confirmation)
- signature (cryptographic signature)

Optional Fields:
- response_payload (structured acknowledgement data)

Immutability rule: All fields immutable after creation.

### Escalation
Description: Authority elevation or routing change per Phase 34.

Required Fields:
- escalation_id (opaque unique identifier)
- source_event_id (event triggering escalation)
- escalation_trigger (Phase 34 trigger type)
- escalation_time (ISO 8601 timestamp)
- source_authority_level (Phase 32 user class before escalation)
- target_authority_level (Phase 32 user class after escalation)
- escalation_path (Phase 34 path identifier)

Optional Fields:
- resolution_time (ISO 8601 timestamp if resolved)
- resolution_actor_id (resolving actor)
- resolution_outcome (escalation outcome classification)

Immutability rule: All fields except resolution_time, resolution_actor_id, resolution_outcome immutable. Resolution fields write-once.

### AuditLedgerEntry
Description: Append-only immutable record in Phase 16 audit ledger.

Required Fields:
- entry_id (sequential monotonic identifier)
- entry_time (ISO 8601 timestamp at ledger write)
- event_id (canonical event identifier)
- prev_entry_hash (SHA-256 hash of previous entry)
- entry_hash (SHA-256 hash of current entry content)
- entry_signature (cryptographic signature of entry)
- signer_id (ledger component identifier)
- verification_status (verified/unverified/verification_failed)

Optional Fields:
- verification_time (ISO 8601 timestamp of verification)
- verifier_id (verifying component identifier)

Immutability rule: All fields immutable after write. No deletion. No modification. Corrections via compensating entry.

### Notification
Description: Outbound message to human or external system per Phase 38.

Required Fields:
- notification_id (opaque unique identifier)
- notification_type (Phase 38 notification category)
- source_event_id (event triggering notification)
- routing_key (Phase 42 routing destination)
- channel (UI_panel/email/SMS/API_webhook/alert_system)
- emission_time (ISO 8601 timestamp)
- dedupe_key (idempotency token per Phase 43)

Optional Fields:
- delivery_time (ISO 8601 timestamp if delivered)
- acknowledgement_id (if acknowledgement required and received)
- delivery_failure_reason (if delivery failed)

Immutability rule: All fields except delivery_time, acknowledgement_id, delivery_failure_reason immutable. Optional fields write-once.

## 4. Global Identifiers

### ID Formats
- Opaque identifiers: UUIDv7 (time-ordered) for all entity IDs
- Uniqueness: Globally unique across all phases and deployments
- Generation: Monotonic time component ensures ordering within millisecond precision
- Collision resistance: 128-bit entropy prevents collision

### Correlation ID
- Purpose: Links related events across phases without implying direct causation
- Scope: Spans entire incident, decision lifecycle, or session
- Propagation: All events within same logical operation share correlation_id
- Assignment: Set by initiating event, inherited by all derived events

### Causation ID
- Purpose: Identifies direct causal parent event
- Scope: Single hop in event chain
- Propagation: Event B caused by Event A sets causation_id = event_id of A
- Distinction: causation_id identifies immediate parent, correlation_id identifies entire tree

### Trace ID
- Purpose: Top-level operation identifier for distributed tracing
- Scope: End-to-end operation spanning multiple components and phases
- Propagation: All events in operation share trace_id
- Assignment: Set by entry point event, never modified

### Hop ID
- Purpose: Phase 14 execution hop identifier
- Scope: Single execution step within bounded operation
- Propagation: Set per hop, increments within same trace
- Usage: Enables hop-level audit and resource accounting

### Cross-Phase Linkage
- Unambiguous linkage: event_id references in related entities (decision_id references event, escalation_id references source_event_id)
- No implicit coupling: All cross-references explicit via typed identifier fields
- Lineage reconstruction: correlation_id + causation_id + trace_id enable full event graph reconstruction
- Query optimization: Indexed identifier fields enable efficient cross-phase queries

## 5. Time Model

### Event Time vs Ingest Time vs Ledger Time
- event_time: Timestamp at event source (actor clock or system component clock)
- ingest_time: Timestamp when event enters THE FENCE ingestion boundary
- ledger_time: Timestamp when Phase 16 audit ledger writes entry
- Ordering: event_time ≤ ingest_time ≤ ledger_time (clock skew permitted for event_time)

### Monotonic Ordering Rules
- Ledger ordering: entry_id strictly monotonic, defines canonical event order
- Event ordering: ledger_time monotonic, defines authoritative timestamp
- Causation ordering: causation_id references must have earlier ledger_time than dependent event
- Violation handling: Events violating causation ordering rejected at ingestion

### Clock Skew Handling
- Tolerance: event_time may precede ingest_time by up to 60 seconds (actor clock drift)
- Future events: event_time more than 5 seconds after ingest_time rejected
- Skew logging: Clock skew exceeding 10 seconds logged as operational warning
- Authoritative time: ledger_time used for all ordering and expiry calculations, event_time informational only

### Late Event Handling
- Late event definition: event arrives after causally dependent event already ingested
- Late event action: Rejected at ingestion with late_arrival error code
- Late event audit: Rejection logged to Phase 16 audit ledger with rejected_event category
- No retroactive insertion: Ledger ordering immutable, late events cannot alter history

### Replay Semantics for Deterministic Reconstruction
- Replay order: Events replayed in entry_id order from Phase 16 audit ledger
- Determinism requirement: Replaying events in ledger order produces identical system state
- Replay validation: entry_hash chain verified during replay
- Non-deterministic fields: Excluded from replay (e.g., ingest_time regenerated, ledger_time regenerated)

## 6. Severity / Risk Levels

### Visibility Ladder
Visibility increases strictly with risk level (lower levels invisible at higher restrictions):
- Level 0 (Informational): Routine operational events, no risk signal
- Level 1 (Low): Minor deviations, automatic recovery possible
- Level 2 (Medium): Operator attention required, no immediate risk
- Level 3 (High): Supervisor escalation required, degraded operation
- Level 4 (Critical): Management intervention required, severe degradation
- Level 5 (Terminal): Governance action required, system safety compromised

Visibility enforcement: Higher authority levels see all lower severity events. Lower authority cannot see higher severity without escalation.

### State Ladder
Operational mode strictly increases with risk (Phase 12 alignment):
- GREEN: Normal operation, severity 0-1 permitted
- YELLOW: Elevated monitoring, severity 0-2 permitted, Level 3+ triggers mode transition
- ORANGE: Degraded operation, severity 0-3 permitted, Level 4+ triggers mode transition
- RED: Critical operation, severity 0-4 permitted, Level 5 triggers governance review
- BLACK: Terminal state, severity 5 only, all operations suspended except governance override

Mode transition rules: Automatic escalation from lower to higher mode. Manual de-escalation requires governance approval.

### Required Fields at RED/BLACK
Additional mandatory fields for severity 4-5 events:
- incident_id (Phase 22 incident identifier, mandatory)
- governance_notification_id (mandatory governance notification per Phase 38)
- dual_approval_coordination_id (mandatory if RED/BLACK decision per Phase 5)
- presence_token_id (mandatory human presence proof for RED/BLACK actions)
- escalation_path_id (mandatory escalation routing per Phase 34)

Missing required fields: Event rejected at ingestion, logged as schema_violation.

## 7. Actor & Authority Model (Data-Level)

### Actor Types

#### system
- Description: Automated system components without human operator
- Permitted event categories: telemetry, guardrail_activation, automatic_state_transition, system_failure
- Authority constraints: Cannot emit decision_proposal, cannot emit approval, cannot emit presence_confirmation
- Signature requirements: Component cryptographic signature mandatory

#### operator
- Description: Phase 32 operator class, operational execution authority
- Permitted event categories: action_execution, decision_proposal (GREEN/YELLOW only), information_acknowledgement
- Authority constraints: Cannot approve RED/BLACK decisions, cannot modify governance policy, cannot override guardrails
- Signature requirements: Credential signature mandatory for decisions and approvals

#### supervisor
- Description: Phase 32 supervisor class, elevated operational authority
- Permitted event categories: operator events + decision_approval (YELLOW/ORANGE), escalation_resolution (Medium/High)
- Authority constraints: Cannot approve BLACK decisions, cannot modify governance policy without governance approval
- Signature requirements: Credential signature mandatory, presence token required for ORANGE decisions

#### management
- Description: Phase 32 management class, strategic decision authority
- Permitted event categories: supervisor events + decision_approval (RED), escalation_resolution (Critical), policy_proposal
- Authority constraints: Cannot approve BLACK decisions without dual-approval, cannot modify ethical constraints per Phase 30
- Signature requirements: Credential signature mandatory, presence token required for RED decisions, dual-approval required for BLACK proposals

#### auditor
- Description: Phase 32 auditor class, read-only oversight authority
- Permitted event categories: audit_query, audit_report_generation, compliance_review
- Authority constraints: Cannot emit decision_proposal, cannot emit approval, cannot modify system state, cannot execute actions
- Signature requirements: Credential signature mandatory for audit reports

#### service_account
- Description: External system integration actor
- Permitted event categories: data_ingestion, status_query, notification_acknowledgement
- Authority constraints: Cannot emit decisions, cannot emit approvals, cannot access audit ledger, limited to authorized API endpoints
- Signature requirements: API key signature mandatory, rate limiting enforced

### Non-Delegable Constraints
Expressed as schema-level enforcement:
- RED/BLACK decision approval authority non-delegable: decision_authority_actor_id must match credential_id of authorized management/governance actor, no delegation_source permitted
- Audit authority non-delegable: auditor actor_type cannot have delegation_source field populated
- Presence token non-delegable: presence_token_id must match actor_id, no proxy issuance permitted
- Governance vote non-delegable: Phase 8 governance vote events require direct credential signature, delegation_source rejected

## 8. Consent & Presence Fields

### Presence Requirements
Fields proving human presence per Phase 5:
- presence_token_id (mandatory for RED/BLACK decisions and high-risk actions)
- verification_method (mandatory, specifies biometric/hardware_key/dual_approval)
- issuance_time (mandatory, must be within 15 minutes of action for RED, 5 minutes for BLACK)
- signature (mandatory cryptographic signature of presence token)

Presence validation: System verifies presence_token_id validity, expiry, and signature before accepting event. Invalid presence rejected at ingestion.

### Consent Requirements
Fields proving valid consent per Phase 20:
- consent_id (opaque unique identifier for consent record)
- consent_holder_actor_id (actor granting consent)
- consent_scope (data/action/access scope definition)
- consent_grant_time (ISO 8601 timestamp)
- consent_expiry_time (ISO 8601 timestamp, null if indefinite)
- consent_signature (cryptographic signature)

Consent validation: Actions requiring consent must reference valid consent_id. System verifies consent scope covers action, expiry not reached, revocation not present.

### Revocation Representation
Consent revocation represented as first-class event:
- event_type: consent_revocation
- Referenced consent_id in payload
- revocation_time (ISO 8601 timestamp)
- revocation_actor_id (must match original consent_holder_actor_id)
- revocation_signature (cryptographic signature)

Revocation effect: Consent_id immediately invalid after revocation_time. Actions referencing revoked consent rejected.

### Expiry Representation
Consent expiry represented via consent_expiry_time field:
- Explicit expiry: consent_expiry_time populated with future timestamp
- Indefinite consent: consent_expiry_time null (requires governance policy approval per Phase 20)
- Expiry evaluation: System rejects actions if current time > consent_expiry_time

Expiry does not generate event; consent simply becomes invalid at expiry_time.

### Silence Representation as First-Class Event
Silence (absence of expected response) represented explicitly:
- event_type: silence_detected
- expected_response_event_type (what response was expected)
- silence_threshold_time (ISO 8601 timestamp when silence exceeded threshold)
- monitored_actor_id (actor from whom response expected)
- triggering_event_id (event that required response)

Silence detection: Phase 19 guardrails monitor for expected responses. Silence event emitted if threshold exceeded per Phase 39 silence-as-signal rules.

## 9. Audit Ledger Entry Contract

### Required Fields for Append-Only Ledger Entry
- entry_id (sequential monotonic integer, strictly increasing)
- entry_time (ISO 8601 timestamp at ledger write, monotonic)
- event_id (canonical event identifier being logged)
- prev_entry_hash (SHA-256 hash of previous entry's serialized content)
- entry_hash (SHA-256 hash of current entry's serialized content excluding entry_hash field itself)
- entry_signature (Ed25519 signature of entry_hash by ledger component)
- signer_id (ledger component identifier, fixed per deployment)
- verification_status (verified/unverified/verification_failed)
- event_payload (complete serialized event per Section 3 Event entity)

### Hash Chaining Fields
- prev_entry_hash: SHA-256(entry[n-1].serialized_content), where serialized_content = entry_id || entry_time || event_id || entry_hash || entry_signature || signer_id || verification_status || event_payload
- entry_hash: SHA-256(entry[n].serialized_content_without_entry_hash)
- Chain initialization: entry_id=0 has prev_entry_hash = SHA-256("THE_FENCE_GENESIS_ENTRY")
- Chain verification: Replaying ledger from entry_id=0 recomputes all hashes; mismatch indicates tampering

### Signature Fields
- entry_signature: Ed25519 signature over entry_hash using ledger component private key
- signer_id: Public key identifier of ledger component
- Signature verification: Verifier uses signer_id public key to verify entry_signature matches entry_hash
- Signature failure: verification_status set to verification_failed, entry retained (append-only) but flagged

### Verification Status Field
- verified: entry_signature successfully verified against signer_id public key
- unverified: verification not yet performed (transient state)
- verification_failed: signature verification failed, potential tampering detected

Verification status usage: Queries may filter by verified status. Verification_failed triggers Phase 15 adversarial pattern investigation.

### Append-Only Enforcement
- No deletion: entry_id never deleted, all entries permanent
- No modification: All fields immutable after write
- No reordering: entry_id sequential ordering immutable
- Physical enforcement: Database-level write-once constraints, immutable storage backend

### Correction via Compensating Entry
- Correction mechanism: New entry with event_type=correction_event references original event_id
- Original entry: Remains in ledger unmodified
- Correction semantics: Correction event payload specifies corrected fields and reason
- Query handling: Clients apply corrections when reconstructing state, original entry provides audit trail

## 10. Notification Contract

### Notification Types
- alert (high-severity immediate notification per Phase 38)
- status_update (routine operational status)
- decision_request (decision approval required)
- escalation_notice (escalation to higher authority)
- consent_request (consent required for action)
- audit_report (periodic audit summary)
- system_health (operational mode change or degradation)

### Routing Keys / Channels
- routing_key format: {phase}.{category}.{severity}.{actor_type}
- Examples:
  - phase22.incident.critical.management
  - phase40.decision.high.supervisor
  - phase12.mode_transition.terminal.governance
- Routing rules: Phase 42 routing model uses routing_key for delivery surface selection
- Wildcard subscriptions: Actors subscribe via patterns (e.g., *.*.critical.* for all critical notifications)

### Dedupe Keys
- dedupe_key format: SHA-256(notification_type || source_event_id || routing_key)
- Purpose: Phase 43 delivery interface uses dedupe_key to prevent duplicate delivery
- Deduplication window: 24 hours (duplicate notifications within window suppressed)
- Dedupe bypass: Governance notifications never deduplicated

### Acknowledgement Requirements
- acknowledgement_required boolean field
- Acknowledgement timeout: 15 minutes for critical, 1 hour for high, 4 hours for medium, 24 hours for low
- Timeout action: Silence event emitted per Section 8 if acknowledgement not received
- Acknowledgement_id: Populated when acknowledgement received, links to Acknowledgement entity

## 11. Validation Rules (Hard Requirements)

### Required Fields Per Event Category
- decision_proposal events: MUST include decision_id, decision_type, decision_authority_actor_id, decision_class, approval_requirements
- approval events: MUST include acknowledgement_id, decision_id, actor_id, signature, presence_token_id (if RED/BLACK)
- presence_confirmation events: MUST include presence_token_id, actor_id, verification_method, signature
- escalation events: MUST include escalation_id, source_event_id, escalation_trigger, escalation_path
- failure events: MUST include incident_id, failure_classification, operational_mode
- audit_query events: MUST include actor_id (auditor type), query_scope, query_time

### Forbidden Combinations
- actor_type=auditor MUST NOT emit event_type=decision_proposal or approval
- actor_type=system MUST NOT emit event_type=presence_confirmation or consent_grant
- severity=5 (Terminal) MUST NOT occur in operational_mode=GREEN
- decision_class=BLACK MUST include presence_token_id and dual_approval_coordination_id
- event_time > ingest_time + 5 seconds MUST be rejected

### Determinism Constraints for Replay
- Event processing MUST be deterministic given entry_id order
- Random number generation MUST use event_id as seed
- Timestamp-dependent logic MUST use ledger_time not wall clock
- External API calls MUST be idempotent or logged as events
- State transitions MUST be pure functions of event sequence

### Failure Behavior on Invalid Event
- Schema validation failure: Event rejected at ingestion, rejection logged to audit ledger with rejected_event type
- Authorization failure: Event rejected, logged as authorization_violation
- Causation violation: Event rejected, logged as causation_ordering_violation
- Late arrival: Event rejected, logged as late_arrival_violation

Quarantine option: Events with schema_validation_failure may be quarantined to dead-letter queue for governance review.

Downgrade option: Non-critical field violations may result in event downgrade (e.g., missing optional field logged as warning, event processed).

### Minimum Logging Guarantees
- All ingested events MUST write to Phase 16 audit ledger before processing
- All rejected events MUST write to audit ledger with rejection reason
- All state transitions MUST emit corresponding event
- All human actions MUST emit event with credential_id and signature
- All escalations MUST emit event before authority elevation

## 12. Security Assumptions (Explicit)

### Key Management Assumptions
- Ledger component private key stored in hardware security module (HSM) or equivalent
- Actor credential private keys stored securely per Phase 21 credential management
- Key rotation performed annually minimum, compromise triggers immediate rotation
- Public keys distributed via authenticated channels only

### Signing Assumptions
- All human-initiated events signed with actor credential private key
- All ledger entries signed with ledger component private key
- Signature verification performed at ingestion before event acceptance
- Signature algorithm: Ed25519 for performance and security

### Storage Assumptions
- Audit ledger stored on append-only immutable storage backend
- Database-level write-once constraints enforced for ledger entries
- Backup storage encrypted at rest with separate key management
- Physical access to storage restricted to governance-authorized personnel

### Access Control Assumptions
- Ingestion boundary enforces actor_type authorization per Section 7
- Audit ledger read access restricted per Phase 33 role view boundaries
- Write access to ledger limited to ledger component only
- Governance override requires dual-approval per Phase 5 for security-critical operations

### Network Assumptions
- Communication between components encrypted in transit (TLS 1.3 minimum)
- Mutual authentication required for inter-component communication
- Network segmentation isolates audit ledger component per Phase 10 isolation boundaries
- External API access rate-limited and authenticated

### Time Synchronization Assumptions
- System components synchronized via NTP or equivalent to within 1 second
- Clock skew monitored continuously, excessive skew triggers operational alert
- Ledger component clock authoritative for ledger_time
- Time source tampering detected via clock drift monitoring

## 13. Non-Claims

### Cannot: Guarantee Correctness of Human Judgment
Schema records human decisions and acknowledgements but does not validate correctness, appropriateness, or quality of human judgment.

### Cannot: Infer Intent
Schema records explicit actions and events but does not infer, interpret, or speculate about actor intent beyond explicitly recorded fields.

### Cannot: Guarantee Optimization Outcomes
Schema enables deterministic replay and audit but does not guarantee optimal decisions, efficient resource usage, or ideal operational outcomes.

### Cannot: Prevent All Adversarial Actions
Schema provides tamper-evidence via hash chaining and signatures but cannot prevent all adversarial actions, only detect them post-facto.

### Cannot: Guarantee Real-Time Consistency
Schema guarantees eventual consistency via audit ledger ordering but does not guarantee real-time consistency across distributed components.

### Cannot: Validate External Data Correctness
Schema validates structure and authorization of events but does not validate correctness of external data referenced in event payloads.

### Cannot: Guarantee Availability
Schema defines data contract but does not guarantee system availability, component uptime, or fault tolerance.

### Cannot: Prevent Authorized Misuse
Schema enforces authorization boundaries but cannot prevent authorized actors from misusing their legitimate authority.

### Cannot: Guarantee Privacy
Schema enforces consent and visibility boundaries but does not guarantee privacy against all attack vectors (e.g., side-channel attacks, social engineering).

### Cannot: Predict Future Events
Schema records historical events deterministically but does not predict, forecast, or extrapolate future events.

### Cannot: Guarantee Completeness
Schema requires specific fields but cannot guarantee semantic completeness of information (e.g., all relevant context captured).

### Cannot: Resolve Ambiguity
Schema enforces unambiguous identifier linkage but does not resolve semantic ambiguity in human-provided data or free-text fields.

END OF FILE
