# PHASE 3A: POST-BLACK RECOVERY DOCTRINE
## Phase: Recovery
## Status: Implemented (Specification-Level)

---

## PURPOSE
- Define deterministic, auditable procedures and constraints to safely transition infrastructure from BLACK to restore operations while protecting safety, accountability, and system integrity.

---

## DEFINITIONS
- BLACK: The highest risk state indicating immediate executive escalation, war-room activation, and pre-authorized emergency automations; normal operations suspended.
- RECOVERY WINDOW: The bounded procedural interval during which recovery evidence is collected, validated, and replayed for governance; duration is evidence-driven, not time-only.
- RE-ENTRY: The formal state transition permitting limited, monitored operational actions under probation after successful eligibility gating.
- PROBATION: A restricted operation period (Yellow_Probation) with tightened controls, monitoring, and limited action scope required before full restoration to Green.

---

## NON-NEGOTIABLES
- BLACK cannot be lifted by a single actor or single device.
- No reduction of visibility or masking of audit artifacts during recovery.
- Overrides that would reduce required proofs or presence are prohibited.
- All recovery steps must produce verifiable evidence stored append-only in the Audit Ledger prior to state changes.

---

## RECOVERY STATE MACHINE
- BLACK -> RECOVERY_ELIGIBLE
  - Preconditions: evidence bundle assembled and validators appointed; initial eligibility gates pass.
- RECOVERY_ELIGIBLE -> YELLOW_PROBATION
  - Preconditions: multi-party validation of evidence, supervised limited actions allowed, strict presence enforced.\n- YELLOW_PROBATION -> GREEN_RESTORED
  - Preconditions: probation period actions succeed with verification, fatigue/bypass metrics acceptable, audit reconstruction validated.
- Any state -> BLACK
  - Trigger: discovery of missing/inconsistent evidence, failed verification, or policy-violating override attempts.

---

## ELIGIBILITY GATES
- Proofs required (all must be present and integrity-verified):
  - Complete Audit Ledger incident bundle (signal→hops→actions→verifications→silence flags).
  - Signed verification artifacts for all attempted remediation actions (per-node success/failure proofs).
  - Human presence attestations (session recordings, device-bound keys) for critical decision hops.
  - Root-cause remediation plan and a Supervisor-signed safety checklist.
- Blockers (any blocks eligibility):
  - Missing or tampered audit entries.
  - Outstanding unverified execution on critical nodes.
  - Active silence/fatigue flags above policy thresholds without remediation.
  - Unresolved authority-limit violations or pending governance holds.

---

## REQUIRED HUMAN PRESENCE (by recovery stage)
- RECOVERY_ELIGIBLE: At least two distinct authorized validators (Operator + Supervisor) must be present to validate evidence bundle.
- YELLOW_PROBATION: Dual human presence required for any containment or restore action (two distinct roles/devices). Live recording mandatory.
- GREEN_RESTORED: Normal presence rules resume after verification and probation completion; periodic spot-checks remain for a defined cooldown.

---

## AUTHORITY RULES DURING RECOVERY
- Requestors vs Approvers:
  - Operators may request recovery actions and submit evidence but cannot approve final transitions beyond RECOVERY_ELIGIBLE.
  - Supervisors validate evidence and may approve YELLOW_PROBATION entry subject to dual-approval constraints.
  - Management endorses final GREEN_RESTORED after probation and governance review.
- Separation of duties: No single role may both prepare and approve the same recovery gate for the same artifact.
- Approvals require device-bound signatures and must reference exact audit-entry hashes.

---

## OVERRIDE RULES DURING RECOVERY
- Overrides are tightened: any override request during recovery must include enhanced justification, dual-approval, and time-bound scope.
- Overrides expire automatically at the end of the recovery window unless explicitly re-approved by dual-authority.
- Any override attempted that conflicts with proof requirements or attempts to suppress visibility immediately re-triggers BLACK and generates a governance hold.
- All override requests and outcomes are append-only and prominently surfaced to Management and Governance reviewers.

---

## ROLLBACK & SAFE-MODE REQUIREMENTS
- All recovery actions must define and stage explicit rollback plans prior to execution; rollback artifacts must be recorded before action commit.
- Safe-mode defaults (restricted I/O, conservative control setpoints) must be applied automatically on any ambiguous verification or partial execution.
- Partial rollbacks mark transactions as partially reverted, raise risk state, and require supervised reconciliation under probation rules.

---

## AUDIT LEDGER REQUIREMENTS
- Mandatory recorded artifacts for each recovery step:
  - Action id, hop-chain reference, actor ids, device ids, session recording references, input and pre/post state hashes, timestamps, and signed justification texts.
  - Integrity proofs (hashes/signatures) linking evidence bundle entries to incident root hash.
  - Explicit fields recording presence tokens, fatigue/bypass scores, and silence flags.
  - Storage must be append-only, tamper-evident, and exportable for full reconstruction of the incident and recovery decisions.
- All recovery transitions must be reconstructable solely from Audit Ledger entries without reliance on transient memory.

---

## FAILURE MODES
- Blocks to recovery (immediate):
  - Incomplete or tampered audit bundle.
  - Unresolved unverified critical node(s).
  - Discovery of policy-violating override attempts during recovery.
- Re-trigger BLACK (immediate):
  - New verification failure during probation that materially increases outage risk.
  - Evidence inconsistency uncovered during governance replay.
  - Any override that attempts to reduce required visibility or bypass dual-approval constraints.

---

## ACCEPTANCE CRITERIA
- Deterministic tests demonstrating: 
  - A multi-artifact eligibility bundle transitions BLACK->RECOVERY_ELIGIBLE only when all eligibility gates pass (test vectors with missing proofs fail deterministically).
  - Dual-approval gating enforces separation of duties; single-actor approvals are rejected in automated checks.
  - Probation actions are limited to the approved scope; any out-of-scope action re-triggers BLACK in replay tests.
  - Silence and fatigue thresholds are stricter: crafted sequences with elevated fatigue/silence flags block transitions.
  - Full audit-ledger replay reconstructs the entire recovery path and verifies signatures/hashes for every step.

---

*End of doctrine.*
