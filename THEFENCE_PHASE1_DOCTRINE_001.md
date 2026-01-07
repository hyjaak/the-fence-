# THE FENCE — DOCTRINE
## Phase: Infrastructure
## Status: Canonical Rules

---

## DOCTRINE LAW 1 — NO SILENT SUCCESS
- Definition: Silence is a signal — lack of positive confirmation is treated as a state change requiring investigation.

- Enforcement Rules:
  - Any action that does not emit a verifiable audit event is considered failed and is rolled back.
  - Systems and operators must produce explicit success confirmations for every enforced action (pause/lock/escalate) within configured windows.
  - Lack of confirmation moves related objects one decision-hop toward AMBER and triggers notification to the owning operator/team.
  - Automated retries are limited and always recorded; human escalation occurs after retry limit is reached.

- What is prohibited:
  - Implicit or unlogged acceptance of critical state changes.
  - Blind automated operations without confirmation windows.
  - Claims of "untraceable commerce" or any feature that obscures transactional auditability.

- Audit Requirements:
  - Every enforced action must emit: actor id, device id, action id, timestamp, and outcome code.
  - Missing confirmations must generate an audit record indicating timeout and escalation path.
  - Audit records for confirmations must be append-only and verifiable for the full retention period.

---

## DOCTRINE LAW 2 — DECISION HOPS
- Definition: All high-impact actions traverse enforced checkpoints (decision-hops) that validate context, authorization, and auditability before progression.

- Enforcement Rules:
  - Define minimal decision-hop chain per action type (e.g., INPUT -> NORMALIZATION -> DEVIATION -> RISK_DECISION -> ACTION_ENFORCEMENT).
  - Each hop must validate required preconditions and log the validation result before allowing the next hop.
  - Hops are deterministic; failures at any hop move the object to AMBER or RED depending on severity.
  - Configurable human checkpoint hops must require explicit acknowledgement before proceeding for RED/BLACK escalations.

- What is prohibited:
  - Bypassing any required decision-hop through backdoor APIs or automated shortcuts.
  - Unauthorized routing or botnet-style propagation of decisions across assets.
  - Any routing behavior that conceals actor identity or skips audit capture.

- Audit Requirements:
  - Log the entry and exit of each decision-hop with hop id, inputs hash, actor id, decision timestamp, and outcome.
  - Maintain a chain-of-custody trace linking the original signal to final action via hop records.
  - Decision-hop breaches must be logged as exceptions and routed to governance reviewers.

---

## DOCTRINE LAW 3 — SELF-DISTRUST
- Definition: The system treats itself, its operators, and any overrides as potential risk vectors and applies compensating controls by default.

- Enforcement Rules:
  - All overrides require justification, time-bounding, and an explicit risk note; they degrade system trust score and trigger enhanced monitoring.
  - The system reduces automation privileges proportionally to observed override frequency and anomalous operator behavior.
  - Operators and systems must fail-safe (pause or restrict) rather than assume correctness when trust signals degrade.
  - Override approvals for RED/BLACK states require elevated roles and are time-limited with automatic reversion.

- What is prohibited:
  - Permanent or unlimited overrides without auditably enforced expiry.
  - Treating operator overrides as default truth without additional verification.
  - Surveillance fantasies: do not add capabilities to profile or monitor personal behavior; focus on operational signals only.

- Audit Requirements:
  - Record override requests with actor identity, justification text, scope, expiration, and resulting system adjustments.
  - Track operator trust metrics and surface to governance if thresholds are crossed.
  - All override actions and resulting state changes must be fully reconstructable from the audit ledger.

---

## GLOBAL ENFORCEMENT INVARIANTS
- Risk State Mapping: Doctrine applies across GREEN/AMBER/RED/BLACK; failure to meet doctrinal confirmations pushes items toward higher risk states (e.g., AMBER or RED).
- Action Enforcement: For any RED/BLACK decision, the system must enforce mandatory actions (pause / lock / escalate) unless a recorded, time-bound, elevated override exists.
- Overrides: Overrides are permitted only when justified, confined in scope and time, and logged; they never nullify the requirement for audit or decision-hops.
- No Silent Paths: Any path that would lead to state change without recorded decision-hop and confirmation is forbidden and triggers system lockdown when detected.
- Minimal Metadata: Only operational metadata required for accountability is retained; personal surveillance or extraneous profiling is not recorded.

---

## AUDIT & ACCOUNTABILITY REQUIREMENTS
- Append-only Ledger: All signals, decision-hops, confirmations, actions, overrides, and communications must be recorded in an append-only ledger with verifiable integrity.
- Reconstruction Guarantee: For any incident, auditors must be able to reconstruct signal → hops → decisions → action → confirmation chain without gaps.
- Retention & Export: Audit data retention policy must be defined and exports supportable for compliance reviews; exports include integrity proofs (hashes/signatures).
- Tamper Evidence: Any modification attempts to audit data must generate tamper-evidence records and escalate to BLACK governance.
- Access Control: Audit viewing and export require role-based permissions; audit consumers are distinct from operational actors where practical.

---

## NON-GOALS
- The doctrine explicitly forbids “untraceable commerce” claims or features.
- The doctrine forbids any unauthorized routing, botnet-like behavior, or concealed decision propagation.
- The doctrine forbids surveillance fantasies and personal profiling; data collection is restricted to operational signals only.
- The doctrine does not enable predictive or autonomous decision-making beyond deterministic, auditable rules.

---

*End of canonical doctrine.*
