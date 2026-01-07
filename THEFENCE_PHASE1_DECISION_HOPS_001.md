# MODULE: DECISION_HOPS_AND_SILENCE_SIGNAL
## Phase: Infrastructure
## Status: Implemented (Specification-Level)

---

## PURPOSE
- Enforce deterministic decision-hop checkpoints and treat silence as an actionable signal across risk states.

---

## INPUTS
- Incoming validated events and deviation outputs
- Risk state transitions (GREEN/AMBER/RED/BLACK)
- Operator acknowledgments and override requests
- Escalation routing configurations

---

## OUTPUTS
- Hop entry/exit records (audit-ready)
- Silence timeout events
- Escalation triggers to routing module
- Action gating signals (allow/hold/reject)

---

## INTERNAL LOGIC (NO CODE)
- Decision-Hop Chains
  - Define a deterministic chain of hops for each action class (example):
    - Measurement acceptance hop (Input validated)
    - Normalization hop (Canonical event created)
    - Deviation hop (Baseline comparison and breach flag)
    - Risk decision hop (Assign GREEN/AMBER/RED/BLACK)
    - Enforcement hop (Pause/Lock/Escalate)
  - Each hop must execute in order and record a hop record before the next hop may proceed.

- Role-Based Acknowledgments per Hop
  - Measurement acceptance: system or device identity confirmation (automated)
  - Risk decision hop: reliability engineer acknowledgment required for RED/BLACK (role: `reliability_engineer`)
  - Enforcement hop: asset manager or operations lead acknowledgment required to confirm action intent (role: `asset_manager`) unless an automatic enforcement path is configured and previously authorized.
  - Overrides must be performed by an elevated role (`senior_operator`) with explicit justification and expiration.

- Silence Timers (NO SILENT SUCCESS)
  - Per-risk-state silence timers define the maximum allowed time without confirmation before escalation:
    - GREEN: 24 hours (informational confirmations expected within this window)
    - AMBER: 4 hours (monitoring confirmations required)
    - RED: 60 minutes (acknowledgment required; silence triggers immediate escalation)
    - BLACK: 15 minutes (forced notification and automatic escalation chain)
  - Silence is defined as: no acknowledgment, no override, no manual review action, and no status update recorded for the hop within the silence timer.

- Silence Handling & Escalation Paths
  - When a silence timer expires for a hop:
    - Emit a Silence Event into the Audit Ledger with the hop id, actor set, and timestamps.
    - Advance the affected object to the next escalation level (e.g., AMBER -> RED) if configured to do so.
    - Trigger the Escalation Routing module to notify the next recipient tier (per `Escalation Routing` configuration).
    - If in RED/BLACK, force the Enforcement hop into a guarded state (action held) and require explicit senior override to proceed.

- Hop Variation by Risk State
  - As risk increases, required hops expand and acknowledgment roles escalate:
    - GREEN: Minimal hops; auto-acknowledgment acceptable for low-impact actions.
    - AMBER: Add human monitoring hop; operator acknowledgment recommended.
    - RED: Human checkpoint hops mandatory; at least one `reliability_engineer` acknowledgment required.
    - BLACK: Multi-hop enforcement with `asset_manager` and `senior_operator` acknowledgments; overrides require dual approval and time-bound scope.

- Prohibitions Enforced by Logic
  - No hop may proceed without a recorded hop-entry audit record.
  - No critical enforcement action may be completed without the required recorded acknowledgments per hop and per risk state.
  - Bypassing hops via backdoor APIs or undocumented flows is forbidden and detected by hop-sequence verification.

---

## FAILURE HANDLING
- Validation Failures:
  - If precondition validation fails at any hop, record failure, push the object to AMBER, and notify responsible parties.

- Silence Timeout Failures:
  - On silence timer expiry, create an audit Silence Event, escalate via `Escalation Routing`, and hold execution of downstream enforcement until required acknowledgments or elevated overrides arrive.

- Hop Sequence Integrity Failure:
  - If an expected hop is missing from the chain, mark the transaction as invalid, block enforcement, and escalate to RED governance with audit evidence.

- Override Failures:
  - If an override attempt lacks proper role or justification, reject the override, log the attempt, and escalate to governance reviewers.

---

## SECURITY & ACCESS
- Hop acknowledgments and override capabilities are controlled via role-based access (RBAC).
- Device-bound identities are required for automated hop entries originating from devices.
- All hop control interfaces require authentication and are rate-limited to prevent automated bypass attempts.
- Sensitive hop metadata is accessible only to authorized roles; minimal metadata stored where possible.

---

## AUDIT REQUIREMENTS
- Every hop must write an append-only record to the Audit Ledger including: hop id, hop name, input hash, actor id (system/device/operator), timestamp, outcome, and any justification text.
- Silence events must be recorded with the timer start, expiry time, affected object id, and escalation path invoked.
- Override records must include actor id, justification, scope, expiration time, and linked affected hops/actions.
- Chain-of-custody: The system must be able to reconstruct signal -> hop chain -> decision -> action -> confirmation with no missing records.

---

## DEPENDENCIES
- Escalation Routing module for forced notifications and operator paging.
- Audit Ledger for append-only hop records and silence events.
- Operator Acknowledgment interfaces (UI/API) for receiving and validating acknowledgments and overrides.
- Risk State Engine to supply current risk context for hop sequencing and timer selection.

---

## ACCEPTANCE CRITERIA
- Hop records are created for every defined hop and persisted in the Audit Ledger.
- Silence timers exist per-risk-state and trigger the configured escalation path on expiry.
- Critical actions (RED/BLACK) cannot complete without the recorded, role-appropriate acknowledgments.
- Attempts to bypass hops silently are detected and cause the transaction to be blocked and escalated.
- Chain-of-custody reconstruction for a sample incident (signal → hops → decisions → actions → confirmations) is successful with no gaps.

---

*End of module.*
