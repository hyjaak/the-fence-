# MODULE: AUTHORITY_AND_OVERRIDE_CONTROL
## Phase: Infrastructure
## Status: Implemented (Specification-Level)

---

## PURPOSE
- Provide strict controls for human and system authority, manage overrides with time bounds, and ensure overrides are risk-visible and fully auditable.

---

## AUTHORITY ROLES (human + system)
- `system`: Automated actors with limited authority (can perform non-critical hops and emit audit records).
- `device`: Device identities bound to sensors/gateways for automated measurements (cannot override human checks).
- `operator`: Standard human operator with ability to acknowledge AMBER-level hops and perform limited overrides.
- `reliability_engineer`: Elevated operator able to approve RED-level checkpoints and initiate time-bound overrides.
- `asset_manager`: Business owner role required for enforcement-level approvals (required for many RED/BLACK actions).
- `senior_operator`: Highest emergency role; can perform emergency overrides with mandatory post-action review.
- Role constraints: All roles are provisioned by `Identity Keys and Device Trust` module and must be authenticated and authorized before acting.

---

## OVERRIDE CONDITIONS
- Overrides are permitted only when a documented condition matches one of the following:
  - Operational exception: documented maintenance or planned work affecting the asset.
  - Safety exception: immediate human safety considerations requiring temporary deviation.
  - Emergency exception: imminent catastrophic failure risk (must be declared and justified).
- Required metadata for any override request:
  - `actor_id`, `role`, `justification_text`, `affected_scope`, `requested_duration`, `link_to_hops/actions`.
- Approval gates:
  - AMBER overrides: `operator` approval sufficient.
  - RED overrides: `reliability_engineer` approval required.
  - BLACK overrides: dual approval required (`asset_manager` + `senior_operator`).

---

## TIME-BOUND OVERRIDES
- All overrides must include an explicit expiration timestamp; default maximum durations by risk level:
  - AMBER: max 4 hours
  - RED: max 1 hour
  - BLACK: max 15 minutes (only for immediate emergency response; auto-expire enforced)
- Re-affirmation: Extensions beyond initial expiry require re-submission with fresh justification and the same approval chain as the original override.
- No override may be set to "permanent" or "indefinite"; the system must reject such requests.

---

## AUTOMATIC REVERSION RULES
- On override expiry, the system automatically re-applies the pre-override enforcement state (unmodified by the override) and logs the reversion event.
- If the original pre-override state cannot be restored cleanly, the system moves to AMBER and requires a supervised reconciliation hop.
- For emergency overrides (BLACK) the system requires a mandatory post-action reconciliation within 24 hours; failure to reconcile escalates actor trust metrics and triggers governance review.

---

## FORBIDDEN ACTIONS
- No permanent overrides allowed under any circumstance.
- No silent overrides (an override without an audit artifact and expiration) — such attempts are rejected and logged as policy violations.
- No automatic elevation of operator privileges without explicit, auditable approvals.
- No override that bypasses required decision-hops for RED/BLACK actions.
- No untraceable routing or botnet-like propagation of override commands across assets.

---

## AUDIT & TRACEABILITY
- Every override lifecycle event must be recorded in the Audit Ledger as append-only records including:
  - Override request creation (actor_id, role, justification, scope, requested_duration, timestamp)
  - Approval events (approver_id, role, approval_time, comments)
  - Activation event (activation_time, effective_hops, linked_actions)
  - Expiry/reversion event (expiry_time, reversion_outcome)
  - Emergency post-action review (reviewer_id, findings, remediation actions)
- Audit records must include cryptographic integrity proofs (signatures or hashes) and be exportable for compliance reviews.
- Silent override attempts (requests lacking required metadata or approvals) must generate tamper-evident violation records and trigger immediate escalation to governance.

---

## DEPENDENCIES
- `Identity Keys and Device Trust` for authenticated roles and device binding.
- `Decision Hops` for required checkpoints and hop sequencing.
- `Escalation Routing` for paging approvers and forced notifications on silence or violations.
- `Audit Ledger` for append-only storage of override artifacts and post-action reviews.
- `Risk State Engine` to increase risk state on override activation (overrides increase risk state by default).

---

## ACCEPTANCE CRITERIA
- Overrides cannot be created without required metadata and expiration; creation attempts lacking required fields are rejected and logged.
- Overrides expire automatically at declared timestamps and trigger automatic reversion events in the audit ledger.
- Any override on RED/BLACK actions requires the mandated roles (dual approvals for BLACK); the system enforces role checks strictly.
- Overrides raise the effective risk state by one level at activation (minimum), recorded in the Audit Ledger.
- All override actions and post-action reviews are reconstructable end-to-end from the audit data; silent overrides are impossible and detected.
- Emergency overrides include mandatory post-action review entries within 24 hours; missing reviews escalate actor trust metrics.

---

*End of module.*
