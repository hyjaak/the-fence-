# PHASE 5: OPERATOR & HUMAN CONTROL MODEL
## Phase: Human Control Boundaries
## Status: Defined

---

## 1. OPERATOR ROLES (BY AUTHORITY LEVEL, NOT JOB TITLE)

### Authority Level 1: Observer
- **Authority:** Read-only access to audit ledger, telemetry streams, and system health status.
- **Responsibilities:** Monitor system state; identify anomalies; escalate issues to higher authority levels.
- **Capabilities:** Query ledger; view hop-chains; export incident bundles; observe escalation events.
- **Constraints:** Cannot issue permits; cannot acknowledge hops; cannot modify policies; cannot rotate keys.

### Authority Level 2: Operator
- **Authority:** Issue presence tokens; acknowledge hops requiring single-approval; initiate recovery validation.
- **Responsibilities:** Respond to routine baseline anomalies; provide first-tier presence attestation; validate telemetry integrity.
- **Capabilities:** Generate signed presence tokens; acknowledge YELLOW-tier hops; propose policy adjustments; initiate evidence bundle review.
- **Constraints:** Cannot issue permits alone for RED/BLACK actions; cannot rotate master keys; cannot override policy without supervisor; cannot exit safe-mode.

### Authority Level 3: Supervisor
- **Authority:** Complete dual-approval requirements; approve key rotations; validate recovery evidence; exit safe-mode.
- **Responsibilities:** Second-tier presence attestation for RED/BLACK actions; validate operator requests; approve critical policy changes; investigate integrity violations.
- **Capabilities:** Generate supervisor-level signed presence tokens; complete dual-approval hops; approve key rotation; exit safe-mode; validate recovery eligibility.
- **Constraints:** Cannot issue permits alone (requires operator co-approval); cannot bypass audit; cannot disable guardrails; cannot suppress escalations.

### Authority Level 4: Governance
- **Authority:** Approve policy changes; ratify recovery plans; investigate audit violations; approve component swaps.
- **Responsibilities:** Policy governance; audit integrity oversight; recovery doctrine enforcement; compliance review.
- **Capabilities:** Sign policy commits; ratify dual-approval requests for doctrine-level changes; investigate guardrail violations; approve component kill-switches.
- **Constraints:** Cannot issue permits directly; cannot bypass dual-approval requirements; cannot suppress audit events; cannot modify ledger entries.

---

## 2. REQUIRED HUMAN PRESENCE STATES

### Active Presence (Live Interaction Required)
- **Definition:** Human is actively interacting with the system via device-bound authentication within the last 60 seconds.
- **Verification:** WebAuthn challenge-response or GPG signature over fresh nonce with timestamp.
- **Timeout:** 5 minutes idle → presence invalidated; fresh authentication required.
- **Required For:** Issuing presence tokens; acknowledging hops; signing permits; key rotation approval.

### Passive Presence (Monitoring, No Interaction)
- **Definition:** Human is authenticated and monitoring system state but not issuing commands.
- **Verification:** Session token valid; no interaction timeout.
- **Timeout:** 15 minutes idle → session expires; re-authentication required.
- **Required For:** Viewing audit ledger; monitoring telemetry; receiving escalation alerts.

### Absent (No Presence)
- **Definition:** Human is not authenticated or session expired.
- **Verification:** None.
- **Capabilities:** None; all actions blocked until authentication.
- **Required For:** N/A.

### Presence States Cannot Be:
- Cached across hops.
- Reused for different actions.
- Extended without fresh authentication.
- Assumed without cryptographic proof.

---

## 3. APPROVAL THRESHOLDS BY ACTION CLASS

### YELLOW-Tier Actions (Single-Approval: Operator)
- Acknowledge baseline anomalies below RED/BLACK thresholds.
- Propose policy adjustments for supervisor review.
- Initiate evidence bundle export.
- Request baseline threshold recalibration.
- Acknowledge routine telemetry ingestion warnings.

### ORANGE-Tier Actions (Single-Approval: Supervisor)
- Approve YELLOW-tier policy proposals.
- Exit degraded mode after resource recovery.
- Approve non-critical component restarts.
- Validate evidence bundles for recovery eligibility (validation only; not execution).
- Acknowledge escalation timeouts for manual review.

### RED-Tier Actions (Dual-Approval: Operator + Supervisor)
- Issue permits for RED/BLACK risk actions (load shedding, circuit control).
- Rotate master signing keys.
- Approve policy changes affecting permit issuance rules.
- Exit safe-mode.
- Approve component kill-switch activation.

### BLACK-Tier Actions (Dual-Approval + Governance Ratification)
- Enable physical actuation (exit dry-run mode).
- Execute recovery plans.
- Revoke operator or supervisor authority.
- Approve emergency ledger recovery procedures.
- Modify core doctrine constraints.

### Approval Downgrade Forbidden
- RED-tier actions cannot be downgraded to single-approval under any condition.
- BLACK-tier actions cannot be downgraded to dual-approval without governance ratification.
- Approval requirements cannot be weakened during safe-mode or degraded operation.

---

## 4. DUAL-CONTROL AND MULTI-SIGNATURE RULES

### Dual-Control Enforcement
- RED-tier actions require two distinct device-bound presence tokens: one from operator, one from supervisor.
- Both tokens must reference the same hop context (hop ID, risk signal, timestamp window).
- Both tokens must be generated within 15 minutes of each other.
- Both tokens must pass cryptographic verification by IdentityKMS.
- Either party can veto by withholding presence token; veto is recorded to ledger.

### Multi-Signature Requirements
- Permits are issued only after both presence tokens validate.
- Policy commits require operator GPG signature + supervisor approval signature.
- Key rotations require operator initiation + supervisor confirmation.
- Recovery execution requires operator + supervisor + governance signatures.

### Signature Ordering Rules
- Operator presence token must be generated first for RED-tier actions.
- Supervisor presence token completes the dual-approval.
- Governance ratification must occur after dual-approval for BLACK-tier actions.
- Out-of-order signatures are rejected; hop must restart.

### Signature Expiration Rules
- First signature (operator) valid for 15 minutes awaiting second signature (supervisor).
- If supervisor signature not received within 15 minutes, hop escalates and first signature expires.
- Both signatures must be fresh (not expired or revoked) at permit issuance time.
- Expired hops cannot be reactivated; new hop required.

### Collusion Prevention
- Same device cannot generate both operator and supervisor tokens.
- Device enrollment records prevent single-device dual-role assignments.
- Authority revocation immediately invalidates all pending hops from that authority.

---

## 5. OPERATOR VISIBILITY LIMITS

### What Operators Can See
- Audit ledger entries (read-only).
- Hop-chain states and pending approvals.
- Telemetry streams and baseline evaluation results.
- Risk signals and escalation alerts.
- System health status and degraded mode warnings.
- Incident bundles and evidence artifacts.

### What Operators Cannot See
- Private signing keys (never exposed).
- Encrypted presence tokens from other operators.
- Governance ratification deliberation details (only final approval visible).
- Recovery plan contents before governance approval.
- KMS master key material or key derivation paths.

### Visibility Degradation Rules
- During safe-mode: operators see read-only ledger and health status only; no hop creation visibility.
- During integrity violations: operators see violation alerts but not forensic details until governance review complete.
- During key rotation: operators see rotation status but not key material.

### Audit Visibility Guarantees
- All operator actions are visible in ledger to all authority levels.
- Supervisor actions are visible to governance and other supervisors.
- Governance actions are visible to all authority levels.
- No hidden or suppressed audit entries permitted.

---

## 6. FATIGUE, BYPASS, AND BEHAVIOR DETECTION

### Fatigue Detection
- Repeated acknowledgements without sufficient review time (<10 seconds per hop) trigger fatigue flag.
- Fatigue flag recorded to ledger after 3 rapid acknowledgements in 5 minutes.
- Fatigue-flagged hops escalate to supervisor for review.
- Persistent fatigue flags (>5 in 1 hour) trigger authority review and potential rotation.

### Bypass Attempt Detection
- Unsigned or malformed presence tokens trigger bypass attempt flag.
- Attempts to reuse expired tokens trigger bypass attempt flag.
- Attempts to acknowledge hops without valid session trigger bypass attempt flag.
- Bypass attempt flags recorded to ledger and escalated immediately.
- Repeated bypass attempts (>2 in 10 minutes) trigger authority suspension.

### Behavior Anomaly Detection
- Presence token issuance outside normal operating hours flagged.
- Simultaneous presence tokens from geographically distant locations flagged (if geo data available).
- Unusually high hop acknowledgement rate flagged.
- All anomalies recorded to ledger and escalated to supervisor.

### Coercion Indicators
- Silence flags: operator logged in but not responding to escalations within expected timeframe.
- Duress signals: operator can include duress marker in presence token to signal coercion (requires governance review).
- Pattern breaks: significant deviation from operator's normal acknowledgement patterns.

### Response to Detection Events
- Fatigue flags → escalate hop to supervisor; do not block operation.
- Bypass attempts → immediate authority suspension; escalate to governance; block all pending hops.
- Behavior anomalies → escalate to supervisor; flag for governance review; continue operation with increased logging.
- Coercion indicators → immediate escalation to governance; freeze affected operator's authority; alternate staffing required.

---

## 7. SUPERVISOR ESCALATION RULES

### Automatic Escalation Triggers
- Operator fatigue flags (>3 in 5 minutes).
- Hop timeout without operator acknowledgement (>15 minutes).
- Bypass attempt detected.
- Behavior anomaly detected.
- Safe-mode entry.
- Integrity violation detected.
- Key rotation required (approaching expiration).

### Supervisor Response Requirements
- Acknowledge escalation within 10 minutes or escalate to governance.
- Review ledger context for escalated hop.
- Provide second-tier approval or explicit veto with rationale.
- Validate operator presence token authenticity.
- Record escalation review and decision to ledger.

### Escalation Escalation (Supervisor to Governance)
- Supervisor unavailable or unresponsive within 10 minutes.
- Supervisor detects operator compromise or coercion.
- Supervisor suspects integrity violation beyond scope of dual-approval.
- BLACK-tier action requires governance ratification.
- Recovery execution required.

### Escalation Pathways
- YELLOW → Supervisor (if timeout or anomaly).
- ORANGE → Governance (if supervisor timeout or integrity concern).
- RED → Governance (if dual-approval timeout or suspected compromise).
- BLACK → Governance (mandatory for all BLACK-tier actions).

---

## 8. AUTHORITY REVOCATION CONDITIONS

### Immediate Revocation (Automatic)
- Device key compromised or suspected compromised.
- Repeated bypass attempts (>2 in 10 minutes).
- Duress signal issued by operator.
- Authority expiration date reached.
- Device enrollment revoked by governance.

### Deferred Revocation (Governance Review)
- Persistent fatigue flags indicating incompetence or coercion.
- Behavior anomalies suggesting malicious intent.
- Policy violation discovered via audit review.
- Conflict of interest discovered.
- Authority reassignment requested by operator.

### Revocation Procedure
1. Governance issues signed revocation directive.
2. Revocation recorded to audit ledger with timestamp.
3. IdentityKMS publishes revocation list update.
4. All pending hops from revoked authority invalidated immediately.
5. All future presence tokens from revoked device rejected.
6. Affected operator notified (if safe to do so).
7. Alternate staffing assigned.

### Revocation Effects
- All pending permits from revoked authority are invalidated.
- All pending hops requiring revoked authority escalate to alternate staffing.
- Revoked authority cannot re-authenticate until governance reinstates.
- Reinstatement requires new device enrollment and governance approval.

### Revocation Cannot Be:
- Bypassed by operator or supervisor.
- Delayed for convenience.
- Suppressed or hidden from audit.
- Reversed without governance approval and ledger recording.

---

## 9. HUMAN ERROR CONTAINMENT RULES

### Input Validation
- All presence tokens validated for signature, timestamp, nonce freshness, and hop context match.
- Malformed tokens rejected with error logged to ledger.
- Invalid hop references rejected.
- Expired tokens rejected with no grace period.

### Confirmation Requirements
- RED/BLACK actions require explicit confirmation step after presence token issuance.
- Confirmation must include summary of action consequences.
- Confirmation must be signed with same device-bound key.
- Confirmation timeout (60 seconds) → hop cancelled; restart required.

### Undo and Rollback Constraints
- Issued permits cannot be revoked after actuation begins.
- Completed hops cannot be deleted from ledger.
- Presence tokens cannot be withdrawn after submission.
- Policy commits cannot be unsigned or deleted; reversion requires new signed commit.

### Error Escalation
- Operator input errors (malformed tokens, invalid references) escalate after 3 consecutive failures.
- Repeated errors from same operator trigger fatigue review.
- Critical errors (bypass attempts, invalid signatures) escalate immediately regardless of count.

### Error Isolation
- Operator errors do not cascade to other operators or supervisors.
- Errors are logged per-operator; aggregate error metrics reviewed by governance.
- Error-induced hop failures do not block alternate hops for the same risk signal (new hop can be created).

### Accidental Approval Prevention
- Confirmation step prevents accidental token issuance.
- Timeout prevents stale confirmations.
- Hop context display prevents approving wrong action.
- Duplicate submission detection prevents double-approval.

---

## 10. WHAT OPERATORS CANNOT DO (BY DESIGN)

### Forbidden: Bypass Dual-Approval
- Operators cannot issue RED/BLACK permits alone.
- Supervisors cannot issue RED/BLACK permits alone.
- Governance cannot issue permits without operator and supervisor dual-approval.
- Dual-approval requirements cannot be weakened or circumvented.

### Forbidden: Suppress Audit
- Operators cannot delete ledger entries.
- Operators cannot modify ledger entries.
- Operators cannot suppress escalation alerts.
- Operators cannot hide their own actions from audit visibility.

### Forbidden: Disable Guardrails
- Operators cannot disable safe-mode entry conditions.
- Operators cannot bypass signature verification.
- Operators cannot extend presence token validity.
- Operators cannot disable automatic freeze conditions.

### Forbidden: Access Private Keys
- Operators cannot export private signing keys.
- Operators cannot view KMS master key material.
- Operators cannot generate signatures outside device-bound keys.
- Operators cannot share or transfer device keys to other operators.

### Forbidden: Modify Policies Unilaterally
- Operators cannot commit unsigned policy changes.
- Operators cannot approve their own policy proposals.
- Operators cannot serve unsigned policies.
- Operators cannot bypass policy signature verification.

### Forbidden: Override Timeouts
- Operators cannot extend hop timeouts.
- Operators cannot extend presence token validity.
- Operators cannot extend permit expiration.
- Operators cannot extend session timeouts.

### Forbidden: Reuse Cryptographic Artifacts
- Operators cannot reuse presence tokens across hops.
- Operators cannot reuse permits for different actions.
- Operators cannot replay expired signatures.
- Operators cannot cache signatures for future use.

### Forbidden: Enable Physical Actuation Alone
- Operators cannot exit dry-run mode without dual-approval + governance ratification.
- Operators cannot force physical actuation during simulation mode.
- Operators cannot bypass dry-run safeguards for testing.
- Operators cannot approve their own dry-run exit requests.

### Forbidden: Suppress Error Detection
- Operators cannot disable fatigue detection.
- Operators cannot disable bypass attempt detection.
- Operators cannot disable behavior anomaly detection.
- Operators cannot suppress coercion indicators.

### Forbidden: Self-Recovery from Authority Suspension
- Operators cannot reinstate their own suspended authority.
- Operators cannot revoke their own revocation.
- Operators cannot bypass device key revocation.
- Operators cannot re-enroll devices without governance approval.

### Forbidden: Concurrent Conflicting Actions
- Operators cannot issue presence tokens for multiple concurrent hops.
- Operators cannot acknowledge hops out of order.
- Operators cannot modify policies while hops are pending approval.
- Operators cannot rotate keys while permits are being issued.

### Forbidden: Visibility Beyond Authority
- Operators cannot view private governance deliberations.
- Operators cannot access recovery plans before governance approval.
- Operators cannot view other operators' private key material.
- Operators cannot query ledger for suppressed entries (none exist, but query design prevents fishing).

---

END OF FILE
