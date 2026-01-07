# MODULE: ACTION_EXECUTION_AND_CONTAINMENT
## Phase: Infrastructure
## Status: Implemented (Specification-Level)

---

## PURPOSE
- Execute, contain, and verify preventive actions (automated, assisted, forced) with strict decision-hop gating, reversibility, and auditability.

---

## ACTION TYPES (automated, assisted, forced)
- Automated: System-triggered actions that require no manual operator input when below configured risk thresholds (e.g., GREEN automated logs, non-critical throttles).
- Assisted: Actions initiated by the system but requiring operator acknowledgment before execution (e.g., AMBER -> require operator confirm to restrict loads).
- Forced: Immediate enforcement actions triggered by RED/BLACK states that are applied by the system but require immediate acknowledgments and post-action review (e.g., emergency load shedding). Forced actions may be pre-authorized but still logged and time-bound.

---

## EXECUTION STAGES (prepare → stage → execute → verify)
- Prepare
  - Validate decision-hop completion and required approvals.
  - Verify preconditions (actor identity, device trust, baseline state).
  - Reserve resources and record a planned-action entry in the Audit Ledger.

- Stage
  - Stage changes in a quarantined context (simulation or dry-run where supported).
  - Produce staging evidence (diff/hash) and await required acknowledgments per hop.

- Execute
  - Apply the action atomically where possible.
  - Emit execution event with pre- and post-state snapshots to the Audit Ledger.
  - For forced actions, mark the action as emergency and start mandatory timers for review and reversion windows.

- Verify
  - Confirm execution success via verification checks (system sensors, operator confirmation, or automated verification logic).
  - Record verification outcome; if verification fails, trigger rollback procedures and escalate risk state.

---

## PAUSE & HALT CONDITIONS
- Preconditions not met: If any required decision-hop record or approval is missing, block execution and move the object to AMBER; notify responsible parties.
- Verification failure: If post-execution verification fails, halt further dependent actions and initiate rollback.
- Silent execution detection: If execution occurs without required hop records or acknowledgments, treat as policy violation, immediately halt related operations, and escalate to BLACK governance.
- System health issues: On critical system or network failures, pause all non-forced actions and degrade to safe defaults.

---

## ROLLBACK REQUIREMENTS
- All reversible actions must have explicit rollback procedures defined and staged during the Prepare step.
- Rollbacks must be executed atomically where possible and logged with the same fidelity as executions (input hash, actor id, timestamps).
- Irreversible actions must be explicitly marked as such at Prepare; they require dual approval and additional governance steps before execution.
- Partial rollback: If only a subset of an action group can be rolled back, mark the transaction as partially reverted, record the residual state, increase risk state, and require supervised reconciliation.

---

## FAILURE ESCALATION
- Failed execution increments risk state by one level (min), e.g., GREEN->AMBER, AMBER->RED, RED->BLACK for repeated or severe failures.
- Failure events emit detailed audit artifacts and trigger `Escalation Routing` to notify appropriate response tiers.
- Repeated failures by operator or system actor degrade trust scores and are routed to governance for review.
- Partial execution triggers an immediate supervised review hop; unresolved partials escalate to RED.

---

## SECURITY & ACCESS
- No action may be initiated without authenticated actor identity (device or human) and authorization per RBAC.
- Action execution interfaces require strong authentication and device-bound keys for automated entries.
- Forced actions (RED/BLACK) require elevated roles per `Authority & Override` rules; the system enforces dual approvals where required.
- Rate limits and anti-automation protections prevent bot-driven or bulk silent executions.

---

## AUDIT & TRACEABILITY
- Every action lifecycle event (prepare, stage, execute, verify, rollback) must be recorded append-only in the Audit Ledger with: action id, hop chain reference, actor id, device id, input hash, pre/post state hashes, timestamps, outcome codes, and justification texts for overrides.
- Silent execution attempts (missing hop/ack) must be recorded as tamper-evident violation records and trigger immediate escalation.
- Audit records include integrity proofs (hash/signature) and are exportable for reconstruction: signal → hops → action → verification → rollback.

---

## DEPENDENCIES
- `Decision Hops` for required checkpoint completion and hop-chain validation.
- `Authority & Override` for override approvals and time-bound controls.
- `Escalation Routing` for forced notifications on failures or silence events.
- `Audit Ledger` for append-only recording of all action artifacts.
- `Risk State Engine` to update risk on failures or partials.

---

## ACCEPTANCE CRITERIA
- No action executes without confirmed completion of preceding decision-hops (verified by hop records in the Audit Ledger).
- All actions include a Prepare-stage plan; if no rollback exists and action is marked irreversible, dual elevated approvals are present.
- Failed executions increase the effective risk state and trigger `Escalation Routing` with audit evidence.
- Partial executions are detected, logged, and require supervised reconciliation; unresolved partials escalate to RED.
- Silent execution is impossible: any attempt without required hop or acknowledgment is blocked, logged as violation, and escalated.
- End-to-end reconstruction of a sample forced action (from signal through verification or rollback) is successful using Audit Ledger entries.

---

*End of module.*
