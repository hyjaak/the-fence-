# MODULE: HUMAN_VISIBILITY_AND_PRESSURE
## Phase: Infrastructure
## Status: Implemented (Specification-Level)

---

## PURPOSE
- Ensure appropriate human visibility, presence, and social pressure across risk states to improve timely, accountable responses while preserving auditability and governance constraints.

---

## VISIBILITY LEVELS (per risk state)
- GREEN: Informational visibility — notifications to on-call list and append-only logs; no required presence.
- AMBER: Elevated visibility — targeted notifications to assigned operators, visible status boards, and mandatory acknowledgment within configured window.
- RED: High visibility — live presence required (physically or secure live session), broadcast to supervisory tier, and mandatory real-time chat/session recording.
- BLACK: Maximum visibility — immediate escalation to executive/management on-call, recorded incident war-room, multi-channel broadcast (SMS/voice/secure chat), and public-facing status summary for stakeholders as allowed by policy.
- Visibility strictly increases with risk; no pathway reduces visibility as state rises.

---

## HUMAN PRESENCE REQUIREMENTS
- GREEN: No human presence required; automated monitoring and passive alerts permitted.
- AMBER: Human acknowledgment required from at least one assigned operator; presence recommended for repeated or degrading signals.
- RED: Explicit human presence required — an operator must join an authenticated live session or be physically co-located with the control interface before execution of containment actions.
- BLACK: Dual human presence required — two distinct authorized humans (different role/device) must be present for any further forced actions, except for pre-authorized, time-bound emergency automations documented in the Audit Ledger.
- Presence is more than an acknowledgment; it requires interactive confirmation and available capability to act.

---

## ACKNOWLEDGMENT PRESSURE RULES
- Acknowledgment is time-bound: acceptable window varies by risk state (shorter at higher risk).
- Repeated acknowledgments without consequential action escalate scrutiny: each acknowledgment without follow-on action within policy windows increases the operator's review score and generates an audit flag.
- Acknowledgment must include a concise intent statement (planned next step) and expected ETA for action when risk ≥ AMBER.
- Bulk or scripted acknowledgments are rate-limited and flagged; automated acknowledgments require device-bound keys and contextual evidence.

---

## SILENCE AS PERSONAL RISK
- Failure to acknowledge or respond within the required window is recorded as `Silence` and creates personal accountability exposure for the assigned actor(s).
- Silence events are appended to personal and device trust records and are visible to supervisory tiers according to policy retention rules.
- Persistent silence patterns trigger mandatory human contact (phone/voice) and may elevate the incident one risk level for safety.
- Silence cannot be masked or reduced by authority overrides; overrides only add visibility and governance notes.

---

## FATIGUE & BYPASS DETECTION
- Track acknowledgment frequency, response latency, and action-follow-through per operator to compute a fatigue score.
- High fatigue score triggers protective measures: reduce human-only burdens, mandate rotations, require supervised confirmations, or route to alternate staffing.
- Detect bypass patterns (e.g., repeated acknowledgments immediately followed by rollbacks, same-device repeated confirmations, or scripted sequences) and flag for governance review.
- Bypass detection algorithms operate on audit artifacts and must be transparent, reversible, and subject to human review before punitive action.

---

## ESCALATION TO MANAGEMENT
- Escalation thresholds: predefined rules move incidents to management based on risk state, time-to-acknowledge, failed verifications, or repeated silence/bypass events.
- Management escalation includes context bundle: incident timeline, hop chain, acknowledgment history, action attempts, and verification artifacts.
- Management may require a notarized post-incident review and corrective action plan; such requests are recorded in the Audit Ledger and tied to actors' records.

---

## AUDIT & TRACEABILITY
- Every visibility event, acknowledgment, presence session, pressure escalation, silence event, fatigue/bypass flag, and management escalation is recorded append-only with actor id, device id, timestamps, session recording references, and justification texts.
- Visibility cannot be reduced by any override; overrides append additional audit entries and must include explicit rationale and dual-approval when required by doctrine.
- Audit entries include integrity proofs (hash/signature) enabling end-to-end reconstruction: signal → hops → visibility → presence → action → verification.

---

## DEPENDENCIES
- `THEFENCE_PHASE1_DECISION_HOPS_001.md` — to determine required checkpoints and hop completion before visibility actions.
- `THEFENCE_PHASE1_AUTHORITY_OVERRIDE_001.md` — to reference override procedures and ensure visibility is never reduced by override.
- `THEFENCE_PHASE1_ACTION_ENFORCEMENT_001.md` — for presence gating prior to executing containment actions.
- `THEFENCE_PHASE1_RISK_STATE_INTEGRATION_001.md` — for mapping risk states to visibility and presence requirements.
- `THEFENCE_PHASE1_COMM_AUDIT_001.md` — for audit ledger schemas and recording conventions.
- `THEFENCE_PHASE1_DOCTRINE_001.md` — to ensure all visibility rules comply with the canonical laws.

---

## ACCEPTANCE CRITERIA
- Visibility strictly increases with risk; verification passes a set of test cases showing higher-state events include all lower-state visibility artifacts plus additional ones.
- Presence gating prevents execution of RED/BLACK actions without the required authenticated human sessions (tested via simulated hop records and presence tokens).
- Repeated acknowledgments without follow-up produce audit flags and increase the operator review score in sample datasets.
- Silence events are recorded, escalate per thresholds, and cannot be suppressed by overrides in audit replay tests.
- Fatigue and bypass detection produce deterministic flags on crafted audit sequences and trigger protective routing to alternate operators.
- End-to-end reconstruction of a sample RED→forced-action incident includes visibility timeline, presence evidence, acknowledgment texts, and management escalation bundle using Audit Ledger entries.

---

*End of module.*
