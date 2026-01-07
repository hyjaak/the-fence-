# PHASE 4.1: SERVICE RESPONSIBILITY BREAKDOWN
## Phase: Runtime
## Status: Defined (Build-Ready)

---

## ZONE DEFINITIONS
- GOVERNANCE ZONE: Policy, authority, decision-hop orchestration, and override workflows. Isolated from actuation.
- EXECUTION ZONE: Actuation, verification, risk evaluation, and recovery orchestration that touch devices or control planes.
- AUDIT ZONE: Append-only, tamper-evident ledger and forensic replay services; highest integrity and durability requirements.
- COMMUNICATION ZONE: Telemetry ingestion, gatewaying, and multi-channel notification services that interface with external networks.
- IDENTITY ZONE: Key management, device identity lifecycle, and cryptographic signing services.
- UI ZONE: Operator/Supervisor/Management consoles and presence/session surfaces; strictly UI-only authority.

---

## SERVICE LIST
- Policy & Governance Service — GOVERNANCE ZONE — single-source policy, RBAC, and override workflow manager.
- Decision Hop Manager — GOVERNANCE ZONE — orchestrates hop-chains, checkpoint ordering, and approval gating.
- Baseline & Risk Engine — EXECUTION ZONE — computes baselines, anomaly scores, and risk-state recommendations.
- Action Enforcement Service — EXECUTION ZONE — stage/execute/verify/rollback actions against scoped device groups.
- Recovery Orchestrator — EXECUTION ZONE — manages RECOVERY_ELIGIBLE flows and probation orchestration.
- Telemetry Gateway Service — COMMUNICATION ZONE — collects, validates, and forwards sensor telemetry with provenance.
- Escalation & Notification Service — COMMUNICATION ZONE — routes alerts across multi-channel visibility tiers.
- Audit Ledger Service — AUDIT ZONE — append-only ledger storing hop chains, actions, presence tokens, and integrity proofs.
- Identity & Key Management Service — IDENTITY ZONE — issues and rotates device-bound keys and signs governance artifacts.
- Operator & Supervisor Console Service — UI ZONE — presence initiation, acknowledgments, intent submission, and evidence review.

---

## SERVICE SPECS

### Policy & Governance Service (GOVERNANCE ZONE)
- PURPOSE: Author authoritative policy, manage RBAC, and coordinate override request/approval flows.
- INPUTS: Policy updates, override requests, governance queries, audit references.
- OUTPUTS: Signed policy snapshots, override approval records, policy query responses.
- HARD DEPENDENCIES: `Audit Ledger Service`, `Identity & Key Management Service`, `Decision Hop Manager`.
- FAILURE CONTAINMENT BEHAVIOR: Degrade to read-only policy snapshot; refuse new override approvals; continue to respond with last-signed policy.
- AUDIT REQUIREMENTS: All approvals/denials, policy changes, and override attempts appended to `Audit Ledger` with signatures and hashes.
- WHAT IT MUST NEVER DO: Directly call or command `Action Enforcement Service` to actuate devices.

### Decision Hop Manager (GOVERNANCE ZONE)
- PURPOSE: Create and enforce ordered decision checkpoints (hop-chains) required for actions and state transitions.
- INPUTS: Risk signals, policy queries, operator acknowledgments, presence tokens.
- OUTPUTS: Hop records, checkpoint validation results, execution permits.
- HARD DEPENDENCIES: `Policy & Governance Service`, `Audit Ledger Service`, `Operator & Supervisor Console Service`.
- FAILURE CONTAINMENT BEHAVIOR: Stop issuing new hop permits; maintain and publish pending hop state; require manual governance review to resume.
- AUDIT REQUIREMENTS: Emit immutable hop-chain records to `Audit Ledger` for every checkpoint creation and completion.
- WHAT IT MUST NEVER DO: Bypass governance-signed policy checks or self-approve hop outcomes.

### Baseline & Risk Engine (EXECUTION ZONE)
- PURPOSE: Maintain baselines and compute anomaly/risk scores influencing decision hops.
- INPUTS: Normalized telemetry, historical baselines, environment context.
- OUTPUTS: Anomaly signals, risk-state suggestions, baseline updates.
- HARD DEPENDENCIES: `Telemetry Gateway Service`, `Audit Ledger Service` (for baseline provenance), `Decision Hop Manager` (for signaling).
- FAILURE CONTAINMENT BEHAVIOR: Fallback to conservative baseline read-only model; rate-limit signal generation; emit degraded-health alerts to Observability.
- AUDIT REQUIREMENTS: Record risk-score calculation inputs and outputs, plus baseline-change reasons, to `Audit Ledger` with hashes.
- WHAT IT MUST NEVER DO: Directly execute containment actions or alter governance policies.

### Action Enforcement Service (EXECUTION ZONE)
- PURPOSE: Stage, execute, verify, and rollback actions against devices within scoped containment zones.
- INPUTS: Execution permits (hop-chain validated), staged action plans, device identities, presence confirmations.
- OUTPUTS: Execution events, per-node verification artifacts, rollback records.
- HARD DEPENDENCIES: `Decision Hop Manager`, `Identity & Key Management Service`, `Audit Ledger Service`, `Telemetry Gateway Service` (for verification signals).
- FAILURE CONTAINMENT BEHAVIOR: Isolate failed nodes, atomically rollback where supported, escalate partials to `Recovery Orchestrator`, and enter local safe-mode defaults for affected device groups.
- AUDIT REQUIREMENTS: Emit pre/post state snapshots, action ids, device ids, actor ids, and signed verification proofs to `Audit Ledger` before marking completion.
- WHAT IT MUST NEVER DO: Accept unsigned permits or execute actions without hop validation and presence gating per doctrine.

### Recovery Orchestrator (EXECUTION ZONE)
- PURPOSE: Coordinate evidence validation, probation staging, and supervised recovery transitions from BLACK.
- INPUTS: Incident bundles from `Audit Ledger`, validator presence tokens, supervisor approvals.
- OUTPUTS: Recovery eligibility decisions, probation action plans, rollback coordination commands.
- HARD DEPENDENCIES: `Audit Ledger Service`, `Policy & Governance Service`, `Action Enforcement Service`, `Operator & Supervisor Console Service`.
- FAILURE CONTAINMENT BEHAVIOR: Halt recovery progression on missing proofs; revert to BLACK if contradictory evidence discovered; quarantine recovery actions to probation zones.
- AUDIT REQUIREMENTS: Record every recovery gate decision, validator signature, and probation action to `Audit Ledger` with evidence hashes.
- WHAT IT MUST NEVER DO: Promote recovery based on time-only criteria or single-actor approvals.

### Telemetry Gateway Service (COMMUNICATION ZONE)
- PURPOSE: Ingest, validate, and forward sensor telemetry with provenance metadata to downstream services.
- INPUTS: Raw sensor telemetry, device identity assertions.
- OUTPUTS: Canonical telemetry streams, ingestion acks, provenance metadata.
- HARD DEPENDENCIES: `Identity & Key Management Service`, `Baseline & Risk Engine`, `Audit Ledger Service` (ingest provenance records).
- FAILURE CONTAINMENT BEHAVIOR: Buffer and persist incoming telemetry to durable queue on downstream outage; apply schema validation and drop malformed data with audit entries.
- AUDIT REQUIREMENTS: Log ingestion receipts and provenance hashes to `Audit Ledger` for traceability.
- WHAT IT MUST NEVER DO: Accept telemetry with missing device-bound signatures or forward telemetry that bypasses normalization checks.

### Escalation & Notification Service (COMMUNICATION ZONE)
- PURPOSE: Route alerts and visibility updates across channels according to risk-state visibility rules.
- INPUTS: Escalation triggers, hop-chain references, audit links, presence requirements.
- OUTPUTS: Multi-channel notifications (secure chat, SMS, voice), supervisory broadcasts, management alerts.
- HARD DEPENDENCIES: `Decision Hop Manager`, `Audit Ledger Service`, `Operator & Supervisor Console Service`.
- FAILURE CONTAINMENT BEHAVIOR: Use alternate channels and escalation paths on channel failures; always include `Audit Ledger` references in alerts.
- AUDIT REQUIREMENTS: Record notification attempts, delivery receipts, and escalation paths to `Audit Ledger`.
- WHAT IT MUST NEVER DO: Suppress visibility or send alerts without ledger references.

### Audit Ledger Service (AUDIT ZONE)
- PURPOSE: Provide append-only, tamper-evident storage for hop-chains, actions, presence tokens, and integrity proofs.
- INPUTS: Hop records, action artifacts, presence session references, override records, recovery decisions.
- OUTPUTS: Immutable bundles for governance replay, forensic exports, integrity proofs.
- HARD DEPENDENCIES: `Identity & Key Management Service` (for signing), durable storage, `Policy & Governance Service` (for retention policies).
- FAILURE CONTAINMENT BEHAVIOR: Accept writes via fallback durable writers under partial failure; never allow deletes or in-place edits; surface degraded-read warnings but preserve append capability.
- AUDIT REQUIREMENTS: Every ledger entry must include actor id, device id, timestamp, hash chain link, and signature metadata.
- WHAT IT MUST NEVER DO: Expose private signing keys or accept requests that bypass integrity checks.

### Identity & Key Management Service (IDENTITY ZONE)
- PURPOSE: Issue, rotate, and revoke device-bound and service-bound cryptographic keys and sign governance artifacts.
- INPUTS: Key requests, rotation policies, revocation commands, audit references.
- OUTPUTS: Signed keys/certificates, revocation lists, signature proofs.
- HARD DEPENDENCIES: `Audit Ledger Service`, `Policy & Governance Service`, `Telemetry Gateway Service` (for device enrollment).
- FAILURE CONTAINMENT BEHAVIOR: On compromise suspicion, revoke keys and publish revocation lists; enter emergency freeze for new enrollments until governance review.
- AUDIT REQUIREMENTS: Record issuance, rotation, and revocation events with signatures to `Audit Ledger`.
- WHAT IT MUST NEVER DO: Distribute private master keys to runtime services or allow unilateral key issuance without governance validation.

### Operator & Supervisor Console Service (UI ZONE)
- PURPOSE: Provide authenticated human interfaces for acknowledgments, presence initiation, intent submission, and evidence review.
- INPUTS: Notifications, hop requests, audit links, operator input (acknowledgments, intent text), presence session data.
- OUTPUTS: Signed acknowledgments, presence tokens, intent records, override requests (forwarded to Governance).
- HARD DEPENDENCIES: `Decision Hop Manager`, `Audit Ledger Service`, `Identity & Key Management Service`, `Escalation & Notification Service`.
- FAILURE CONTAINMENT BEHAVIOR: If UI disconnects, queue operator actions locally with signed tokens; display degraded mode with read-only audit access; prevent unsigned acknowledgments.
- AUDIT REQUIREMENTS: Every human action must be signed, timestamped, and appended to `Audit Ledger` with session references.
- WHAT IT MUST NEVER DO: Allow UI actions that bypass hop validation or permit presence tokens without device-bound authentication.

---

## CROSS-ZONE RULES (what cannot cross boundaries)
- GOVERNANCE→EXECUTION: Governance may only publish signed permits; it must never directly call actuation APIs or embed private keys in messages.
- EXECUTION→AUDIT: Execution services must write artifacts to `Audit Ledger` but must not read or modify governance policy data directly.
- IDENTITY secrets: Private signing keys must never leave the `Identity Zone` or be stored by UI/Execution services.
- UI→EXECUTION: UI actions translate to hop records and permits; UIs may not directly invoke device actuation endpoints.
- COMMUNICATION→EXECUTION: External network inputs must pass through `Telemetry Gateway` and `Identity` verification before influencing execution decisions.

---

## ACCEPTANCE CRITERIA
- Service count: 10 services defined, each with a single primary responsibility and unique duties.
- Zone assignment: Every service is assigned to one of the six zones and complies with cross-zone rules.
- No single service forces global action: automated tests show unilateral global actuation attempts fail without quorum and hop-chain validation.
- Governance-isolated: simulated governance failure cannot trigger `Action Enforcement` without signed permits.
- Audit durability: `Audit Ledger Service` remains appendable under degraded conditions and reconstructs incident bundles for replay.
- Presence enforcement: attempts to execute RED/BLACK-level actions without signed presence tokens rejected and auditable.
- Failure containment: each service enters defined containment behavior under fault-injection tests; critical safety paths (safe-mode, kill-switch) remain operable.

---

*End of service breakdown.*
