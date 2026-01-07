# PHASE 4.3: UI SURFACE RULES
## Phase: Runtime
## Status: Defined (Build-Ready)

---

## UI PRINCIPLES
- Non-negotiables: UI actions are only surface-level; every UI action must create signed hop records and ledger entries before any effect on execution.
- No silent overrides, no hop bypass, no visibility reduction, no audit deletion, no unlocking BLACK without recovery gates.
- Presence tokens and device-bound signatures required for RED/BLACK actions.
- UI exposes intent and evidence only; enforcement is performed by backend services.
- UI must prominently display audit references for each action and require explicit confirmation windows for high-risk actions.

---

## ROLE DEFINITIONS
- Operator: frontline responder; can acknowledge AMBER, stage assisted actions, request overrides (requires Supervisor approval), and join presence sessions.
- Supervisor: higher-tier approver; can validate evidence, approve RED/BLACK overrides (dual-approval), and initiate recovery validations.
- Exec (Management): receives BLACK escalations, authorizes strategic decisions, and views governance bundles (read-only for ledger entries); may authorize post-incident actions per Recovery Doctrine.
- Auditor: read-only access to Audit Review screens and replay tools; may annotate but cannot modify ledger entries.

---

## SCREEN INDEX
- 1. Dashboard — System-wide risk and visibility overview (status board).
- 2. Incident Detail — Deep view of a specific incident, hop chain, artifacts.
- 3. Hop Management — View/create hop checkpoints and required acknowledgments.
- 4. Action Staging — Prepare and stage actions (Prepare→Stage) with rollback definitions.
- 5. Presence Session — Live authenticated presence interface (recording links).
- 6. Override Request — Submit and review override requests (Supervisor/Governance workflow).
- 7. Recovery Console — Recovery eligibility, evidence validation, probation controls.
- 8. Audit Review — Forensic replay and export of ledger bundles (read-only actions only).
- 9. Notifications & Escalations — Multi-channel delivery view and delivery receipts.

---

## SCREEN SPECS

### 1. Dashboard
- PURPOSE: Provide an at-a-glance risk map, active incidents, and visibility tiers.
- WHO CAN ACCESS: Operator, Supervisor, Exec, Auditor (role-filtered view)
- WHAT IS VISIBLE (by risk state): GREEN=summary; AMBER=affected spans; RED=presence required indicators; BLACK=executive banner + war-room link.
- WHAT ACTIONS ARE AVAILABLE: drill into incidents, acknowledge low-risk alerts (GREEN/AMBER), open presence session request.
- REQUIRED HOPS / ACKS FOR EACH ACTION: AMBER ack → creates hop record; RED/BLACK actions disabled here (must use Incident Detail / Presence Session).
- WHAT IS LOCKED IN RED/BLACK: action buttons that trigger enforcement; override submission triggers only allowed via Override Request.
- WHAT IS LOCKED DURING RECOVERY PROBATION: global modification controls and reconfiguration links locked; view-only for probationed incidents.
- AUDIT EVENTS EMITTED: dashboard_viewed, quick_ack_initiated (if applicable)
- FORBIDDEN INTERACTIONS: initiating enforcement directly from dashboard, suppressing alerts, deleting incidents.

### 2. Incident Detail
- PURPOSE: Present full incident timeline, hop chain, staged actions, verification artifacts, and ledger refs.
- WHO CAN ACCESS: Operator, Supervisor, Exec, Auditor
- WHAT IS VISIBLE (by risk state): full artifact set with progressive disclosure: GREEN limited artifacts; AMBER shows staging artifacts; RED shows verification failures and presence gating; BLACK shows recovery bundle links.
- WHAT ACTIONS ARE AVAILABLE: view artifacts, request presence, stage action (if permitted), request override, export evidence bundle (Auditor/Exec/Supervisor restrictions apply)
- REQUIRED HOPS / ACKS FOR EACH ACTION: staging requires Prepare hop; execute requires full hop-chain completion and presence tokens.
- WHAT IS LOCKED IN RED/BLACK: direct execute buttons locked until presence validated; bulk export of unredacted data restricted to Exec/Auditor with governance approval.
- WHAT IS LOCKED DURING RECOVERY PROBATION: ability to approve final restore is locked to Recovery Console; incident-level reconfiguration locked.
- AUDIT EVENTS EMITTED: incident_viewed, evidence_export_requested, stage_request_submitted
- FORBIDDEN INTERACTIONS: marking verification as complete without ledger proof, deleting artifacts.

### 3. Hop Management
- PURPOSE: Show hop-chain status and required checkpoints for actions.
- WHO CAN ACCESS: Operator (view/create), Supervisor (approve/validate), Auditor (view)
- WHAT IS VISIBLE (by risk state): required hops list; high-risk hops pinned and timeboxed.
- WHAT ACTIONS ARE AVAILABLE: create hop entries (Operator), validate/approve hops (Supervisor), attach evidence.
- REQUIRED HOPS / ACKS FOR EACH ACTION: creating a hop emits hop_notification; approvals require signatures and presence tokens depending on hop level.
- WHAT IS LOCKED IN RED/BLACK: creation of ad-hoc hops that bypass templates; only governance-published hop templates allowed.
- WHAT IS LOCKED DURING RECOVERY PROBATION: altering hop templates for the incident.
- AUDIT EVENTS EMITTED: hop_created, hop_approved, hop_rejected
- FORBIDDEN INTERACTIONS: self-approval of a hop by the same actor who created it.

### 4. Action Staging
- PURPOSE: Prepare action plans including explicit rollback procedures and staging evidence.
- WHO CAN ACCESS: Operator (prepare), Supervisor (review), Auditor (view)
- WHAT IS VISIBLE (by risk state): staged action diff, rollback plan, affected device list; RED shows required presence and verification steps.
- WHAT ACTIONS ARE AVAILABLE: upload action plan, define rollback, request staging verification, mark staging complete.
- REQUIRED HOPS / ACKS FOR EACH ACTION: staging emits planned-action entry; execution permit requires DecisionHopManager-issued permit.
- WHAT IS LOCKED IN RED/BLACK: direct execute; only permit-validated execution accepted.
- WHAT IS LOCKED DURING RECOVERY PROBATION: expanding action scope; only approved probation actions permitted.
- AUDIT EVENTS EMITTED: action_staged, rollback_defined, staging_completed
- FORBIDDEN INTERACTIONS: executing staged actions without permit; editing rollback after staging without new hop.

### 5. Presence Session
- PURPOSE: Host authenticated live sessions (audio/video/secure shell) and record presence tokens.
- WHO CAN ACCESS: Operator, Supervisor, Exec (as required), Auditor (read-only recordings)
- WHAT IS VISIBLE (by risk state): live session status, participant list, recording status; RED shows mandatory presence badge, BLACK shows war-room linkage.
- WHAT ACTIONS ARE AVAILABLE: join session, attest presence (signed), review recording.
- REQUIRED HOPS / ACKS FOR EACH ACTION: presence attestation produces presence_token and ledger entry; joining requires device-bound signature.
- WHAT IS LOCKED IN RED/BLACK: ability to fake presence; presence tokens validated cryptographically.
- WHAT IS LOCKED DURING RECOVERY PROBATION: session recordings are retained and surfaced to Recovery Console; deletion disabled.
- AUDIT EVENTS EMITTED: presence_joined, presence_attestation_submitted, recording_completed
- FORBIDDEN INTERACTIONS: joining with forged presence_token, deleting recordings.

### 6. Override Request
- PURPOSE: Submit and track override requests with evidence for Supervisor/Governance review.
- WHO CAN ACCESS: Operator (submit), Supervisor (review/endorse), Exec/Governance (approve/reject)
- WHAT IS VISIBLE (by risk state): request status, evidence links, required dual-approvals for RED/BLACK.
- WHAT ACTIONS ARE AVAILABLE: submit override, attach evidence, endorse, approve/reject (Supervisor/Governance)
- REQUIRED HOPS / ACKS FOR EACH ACTION: override submission creates an override hop; approvals require dual signatures and Governance acceptance for RED/BLACK.
- WHAT IS LOCKED IN RED/BLACK: single-actor approve; only dual-approval allowed.
- WHAT IS LOCKED DURING RECOVERY PROBATION: time-limited overrides may be permitted but require explicit re-approval and are logged prominently.
- AUDIT EVENTS EMITTED: override_submitted, override_endorsed, override_approved, override_rejected
- FORBIDDEN INTERACTIONS: silent grant of override, masking override rationale.

### 7. Recovery Console
- PURPOSE: Drive Recovery Doctrine workflows: evidence validation, RECOVERY_ELIGIBLE gating, probation staging, and probation monitoring.
- WHO CAN ACCESS: Supervisor, Exec, Recovery Validators, Auditor (view)
- WHAT IS VISIBLE (by risk state): complete incident bundle for BLACK incidents, eligibility gate checklist, validator signatures
- WHAT ACTIONS ARE AVAILABLE: validate evidence, vote to promote to YELLOW_PROBATION, define probation actions, monitor probation progress
- REQUIRED HOPS / ACKS FOR EACH ACTION: multi-party validation (Operator+Supervisor) required; approvals recorded with signatures referencing ledger hashes
- WHAT IS LOCKED IN RED/BLACK: unilateral recovery promotion; only Recovery Console via dual validators may promote.
- WHAT IS LOCKED DURING RECOVERY PROBATION: broad restore actions; only probation-scoped actions allowed.
- AUDIT EVENTS EMITTED: recovery_validated, probation_started, probation_action_recorded
- FORBIDDEN INTERACTIONS: promoting recovery based on time-only criteria; single-actor recovery promotion.

### 8. Audit Review
- PURPOSE: Forensic replay, export of ledger bundles, and annotated reviews (read-only ledger interactions).
- WHO CAN ACCESS: Auditor, Supervisor, Exec (read-only with role filters)
- WHAT IS VISIBLE (by risk state): full ledger bundle for incidents; sensitive fields redacted per policy unless Exec/Auditor authorized
- WHAT ACTIONS ARE AVAILABLE: replay incident, export evidence bundle, annotate findings (annotations are separate ledger notes)
- REQUIRED HOPS / ACKS FOR EACH ACTION: export requires justification and Supervisor/Exec acknowledgment for sensitive unredacted exports
- WHAT IS LOCKED IN RED/BLACK: deletion or modification of ledger entries; unlogged access to raw unredacted data without approval.
- WHAT IS LOCKED DURING RECOVERY PROBATION: ability to alter annotations that affect recovery decisions (annotations are append-only)
- AUDIT EVENTS EMITTED: bundle_replay_started, bundle_exported, annotation_added
- FORBIDDEN INTERACTIONS: editing or deleting ledger entries; exporting without proper approvals.

### 9. Notifications & Escalations
- PURPOSE: View and manage multi-channel alert delivery and escalation paths.
- WHO CAN ACCESS: Operator, Supervisor, Exec
- WHAT IS VISIBLE (by risk state): active alerts, delivery receipts, escalation tree; BLACK shows management war-room contact list
- WHAT ACTIONS ARE AVAILABLE: acknowledge receipt, escalate to next tier, mark delivery issues
- REQUIRED HOPS / ACKS FOR EACH ACTION: acknowledge emits signed receipt; escalations create audit hops
- WHAT IS LOCKED IN RED/BLACK: suppressing alerts or altering escalation tree without Governance approval
- WHAT IS LOCKED DURING RECOVERY PROBATION: altering primary notification targets for the incident
- AUDIT EVENTS EMITTED: alert_acknowledged, escalation_triggered, delivery_failure
- FORBIDDEN INTERACTIONS: removing ledger references from alerts or acknowledging on behalf of another actor.

---

## UI FAILURE MODE
- If UI is down: operator consoles switch to local signed-token queueing mode; actions are locally signed, queued, and forwarded when UI connectivity restores. Queued actions must include full signed metadata and are accepted by backend only after hop validation.
- Read-only fallback: critical audit and incident views remain accessible via alternate read-only interfaces or emergency CLI tools with device-bound auth.
- No unsigned acknowledgments accepted during UI outage; presence tokens cannot be faked by offline queues (they require live session validation to convert to presence_token when possible).
- Escalation: if UI outage prevents timely acknowledgments, Escalation Service escalates via alternate channels (SMS/voice) and records attempts to the ledger.

---

## ACCEPTANCE CRITERIA
- UI surfaces defined (≤9) with role-based access controls enforced by Identity zone tests.
- Attempts to perform forbidden interactions (silent override, hop bypass, visibility reduction, audit deletion, unlock BLACK) are rejected and generate audit events in automated tests.
- RED/BLACK actions require valid presence tokens and signatures; replay tests verify token-to-ledger linkage.
- Recovery probation locks and restrictions enforceable via UI and backend gating in integration tests.
- UI failure mode: queued signed actions replay correctly and are accepted only when backend validates hop-chain and presence; unsigned queued actions are rejected.

---

*End of UI surface rules.*
