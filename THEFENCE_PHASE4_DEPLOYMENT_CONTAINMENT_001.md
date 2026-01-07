# PHASE 4.4: DEPLOYMENT & FAILURE CONTAINMENT PLAN
## Phase: Runtime
## Status: Defined (Build-Ready)

---

## GOALS
- Ensure safety-first deployment patterns so failures are contained by zone, audit and doctrine remain enforceable during outages, and recovery paths are deterministic and evidence-driven.
- Minimize blast radius, preserve immutable audit trails, and guarantee BLACK enforcement even under partial system failure.

---

## ZONE CONTAINMENT STRATEGY

GOVERNANCE ZONE
- WHAT FAILURES IT MUST SURVIVE: service restarts, policy DB corruption (read-only fallback), governance node loss, partial network partitions.
- WHAT IT CAN DEGRADE INTO: read-only policy snapshot with queued override requests; publish-only mode with signed last-known policies.
- WHAT IT MUST NEVER LOSE: signed policy snapshots, override records, and ability to verify signatures of permits.
- SAFE MODE BEHAVIOR: enter read-only governance view; refuse new override approvals; publish last-signed policy snapshots and enqueue approval requests for later replay.

EXECUTION ZONE
- WHAT FAILURES IT MUST SURVIVE: partial device group failures, action enforcement node crash, telemetry verification lag, transient device comms glitches.
- WHAT IT CAN DEGRADE INTO: per-device group safe-mode (conservative setpoints), isolated local control (gateway-level safe-mode), and queued actions awaiting centralized permit validation.
- WHAT IT MUST NEVER LOSE: atomic rollback plans for any executed action and the ability to emit verification artifacts to the Audit Zone.
- SAFE MODE BEHAVIOR: apply conservative control limits automatically, isolate failed nodes, and prevent further automated escalation without quorum.

AUDIT ZONE
- WHAT FAILURES IT MUST SURVIVE: storage node loss, partial read replication loss, transient write latency, read-only index corruption.
- WHAT IT CAN DEGRADE INTO: append-only durable queue with fallback writers; read-degraded mode for replay but always accept appends via fallback path.
- WHAT IT MUST NEVER LOSE: append capability and integrity chaining (hash links/signatures) for new entries.
- SAFE MODE BEHAVIOR: accept writes to local durable store, replicate asynchronously when cluster recovers; reject deletes and surface degraded-read alerts.

COMMUNICATION ZONE
- WHAT FAILURES IT MUST SURVIVE: network partitions, channel outages (SMS/email), gateway overload, malformed telemetry floods.
- WHAT IT CAN DEGRADE INTO: local buffering, alternate channels for escalation (voice/SMS), and stripped-down telemetry forwarding with minimized payloads.
- WHAT IT MUST NEVER LOSE: provenance validation of telemetry and ability to surface ledger references in alerts.
- SAFE MODE BEHAVIOR: apply backpressure, drop malformed messages with audit entries, route alerts via secondary channels and keep delivery receipts in ledger.

IDENTITY ZONE
- WHAT FAILURES IT MUST SURVIVE: KMS node outage, certificate expiration windows, suspicious key compromise alerts.
- WHAT IT CAN DEGRADE INTO: read-only key registry with revocation lists published; emergency freeze for new enrollments.
- WHAT IT MUST NEVER LOSE: protection of private master keys and ability to publish revocations and signature proofs to the Audit Zone.
- SAFE MODE BEHAVIOR: publish revocations, halt new key issuance, require multi-party unfreeze for further operations.

UI ZONE
- WHAT FAILURES IT MUST SURVIVE: UI server crash, partial frontend degradation, session-store failure.
- WHAT IT CAN DEGRADE INTO: read-only dashboards, local signed-token queueing mode for operators, CLI emergency access for governance reviewers.
- WHAT IT MUST NEVER LOSE: ability to capture and forward signed operator actions (even queued) and to display audit references.
- SAFE MODE BEHAVIOR: limit UI to read-only incident and ledger views; queue signed inputs for later validation; warn users of degraded mode.

---

## CRASH PREVENTION RULES

Circuit Breakers
- Per-service circuit breakers on outbound actuation and upstream dependencies; breakers transition: CLOSED -> OPEN -> HALF-OPEN with cooldown windows.
- Global quorum-based breaker for any global-scope action; requires multi-service confirmation and dual-approval for reopening.

Backpressure
- Backpressure at ingress (Telemetry Gateway) with graded drop policies and prioritized message lanes (safety-critical > telemetry > metrics).
- Execution services reject or queue low-priority requests when verification services lag; prioritized retry for safety-critical requests.

Queueing Behavior
- Durable queues for telemetry, overrides, and audit write fallbacks; high-priority queues for audit and escalation messages.
- FIFO within priority lanes; idempotency tokens required for replays to avoid duplicate execution.

Timeouts & Retries (conceptual)
- Strict, layered timeouts: short for presence gating (seconds), medium for verification (tens of seconds), longer for audit writes and governance approvals (minutes) with human-aware backoff.
- Retry policies differ by type: idempotent reads/replays use exponential backoff; non-idempotent actions require hop validation and must not be retried without fresh permits.

Idempotency Requirements
- All action requests include idempotency keys and action-plan hashes; Action Enforcement must detect duplicates and reject replays that would cause repeated physical actuation.
- Audit writes include entry hashes to detect and ignore duplicate submissions from fallback writers.

---

## SAFE MODE & MINIMUM FOOTPRINT

Minimum Operating Footprint (to enforce BLACK and log events)
- Audit Ledger Service (AUDIT ZONE): append-only logging and bundle export.
- Identity & Key Management Service (IDENTITY ZONE): signature verification and revocation publishing.
- Baseline & Risk Engine or Risk Evaluator (EXECUTION ZONE): determines BLACK triggers from telemetry.
- Escalation & Notification Service (COMMUNICATION ZONE): deliver BLACK alerts to Management and operators.
- Telemetry Gateway (COMMUNICATION ZONE) or a lightweight ingestion adapter to feed risk signals.

Safe Mode Behavior for Minimum Footprint
- If only minimum footprint is available, system must:
  - Continue to accept and append risk and action artifacts to the ledger.
  - Enforce BLACK state deterministically when risk thresholds and silence rules meet criteria.
  - Deliver BLACK notifications via Escalation Service with ledger references.
  - Prevent any further device actuation without full permits; queue execution requests.

---

## DEGRADED OPERATION MODES
- Read-Only Governance: Governance publishes last-signed policies; DecisionHopManager uses last-known templates and records pending approvals for later reconciliation.
- Execution Degraded: localized safe-mode at gateways; Action Enforcement operates in simulation/dry-run mode for staging and queues actual execution.
- Audit-Degraded: ledger accepts entries via fallback durable writers; replayable bundles include fallback markers and integrity proofs.
- Communication-Limited: use alternative notification channels; escalate via SMS/voice with ledger refs when push channels fail.
- Identity-Limited: no new enrollments; emergency revocations only; governance must authorize new keys post-freeze.

---

## RECOVERY DURING PARTIAL OUTAGE
- Recovery Orchestrator relies exclusively on Audit Ledger bundles and presence attestations; recovery gating is evidence-first, not time-based.
- When parts of the system are offline, validators must use Ledger-stored evidence and secure remote presence tokens to perform validation; any offline-signed artifacts require later proof-chaining to IdentityKMS records.
- Probation actions are staged and simulated where execution plane is degraded; actual actuation deferred until permits and verifications are available or until governance-approved manual override under doctrine.
- During network partitions, local safe-mode persists; Recovery remains locked until reconciled artifact chains validate across partitions.

---

## UNRECOVERABLE CONDITIONS
- When to force BLACK
  - Loss of audit integrity (detected hash-chain divergence or tamper evidence).
  - Widespread key compromise in Identity Zone without immediate revocation capability.
  - System-wide telemetry and verification blackout with active safety threshold breaches and no credible manual containment.
- When to lock recovery
  - Missing or tampered evidence in the Audit Ledger for the incident bundle.
  - Discovery of policy-violating override attempts during attempted recovery.
  - Active unresolved partial executions on critical nodes that cannot be verified or rolled back.

---

## ACCEPTANCE CRITERIA
- Zone containment tests: injected failures per zone cause only allowed degradations and preserve non-negotiables (audit appends, governance read-only policies, key protection).
- Circuit breaker tests: service-level and global breakers open and prevent dangerous actuation under stress scenarios.
- Queue & fallback tests: Audit Ledger accepts writes via fallback and reconstructs incident bundles after simulated storage node loss.
- Minimum footprint test: with only the minimum footprint services running, system triggers BLACK deterministically and delivers escalation messages with ledger references.
- Recovery lock tests: missing/tampered evidence blocks recovery promotion; attempts to promote without required proofs are rejected and logged.
- Idempotency and replay tests: duplicate or replayed action requests are detected and safely ignored by Action Enforcement and Audit Ledger.

---

*End of deployment & failure containment plan.*
