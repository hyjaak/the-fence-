# PHASE 20: HUMAN CONSENT & INTERVENTION MODEL
## Phase: Human Consent Constraints
## Status: Defined

---

## 1. CONSENT DEFINITION BOUNDARIES

### Consent Defined
Explicit, cryptographically-verified approval from authorized human authority for specific action or decision. Consent requires active confirmation, not passive acquiescence.

### Consent Scope Specificity
Consent granted for defined action, timeframe, and context. Consent does not extend beyond specified scope. Broad or unbounded consent requests rejected as invalid.

### Consent Authority Binding
Consent valid only from authorities with defined authorization for consented action class. Consent from unauthorized authorities invalid regardless of explicitness.

### Consent Presence Requirement
Consent requires valid device-bound presence token per Phase 5. Presence verification mandatory for consent validity. Remote or delayed consent without presence verification invalid for RED/BLACK actions.

### Consent Cryptographic Binding
Consent cryptographically signed by consenting authority. Unsigned consent invalid. Signature verification failure invalidates consent regardless of apparent intent.

### Consent Action Linkage
Consent linked to specific action request through hop-chain reference per Phase 2. Consent without clear action linkage ambiguous and rejected.

### Consent Is Not Permission
Consent represents human approval. Permission granted only when consent combined with constraint verification, policy compliance, and dual-approval requirements where applicable.

---

## 2. EXPLICIT VS INVALID CONSENT STATES

### Explicit Consent
Cryptographically signed approval with valid presence token, specific action reference, timestamp within validity window, and authority authorized for action class.

### Ambiguous Consent
Approval lacking clear action reference, scope specification, or context. Ambiguous consent treated as invalid. System escalates for clarification rather than inferring intent.

### Expired Consent
Consent with timestamp exceeding defined validity window. Expired consent invalid even if originally valid. No grace periods or automatic extension.

### Revoked Consent
Consent explicitly withdrawn by original consenting authority or superseding governance authority. Revoked consent invalid regardless of prior validity.

### Unauthorized Consent
Approval from authority lacking authorization for requested action class. Unauthorized consent invalid even if cryptographically valid and explicit.

### Coerced Consent Suspicion
Consent accompanied by coercion indicators per Phase 15. Suspected coerced consent triggers investigation but may remain operationally valid pending investigation outcome.

### Replayed Consent
Consent signature or presence token reused across multiple requests. Replayed consent invalid. Each action requires fresh consent.

### Partial Consent
Single authority approval when dual-approval required per Phase 5. Partial consent insufficient for action authorization. Second approval required.

---

## 3. CONSENT VERIFICATION REQUIREMENTS

### Signature Verification Mandatory
All consent signatures verified against authority public keys. Signature verification failure invalidates consent immediately.

### Presence Token Validation Mandatory
Consent requiring presence validated against device-bound presence tokens. Token validation failure invalidates consent for RED/BLACK actions.

### Timestamp Verification
Consent timestamp verified within acceptable clock skew bounds. Excessive timestamp deviation triggers escalation and consent rejection.

### Authority Authorization Check
Consenting authority verified as possessing authorization for action class. Authorization check failure invalidates consent.

### Action Reference Validation
Consent action reference validated against pending action requests. Reference mismatch or missing reference invalidates consent.

### Revocation Status Check
Consenting authority checked against revocation list. Revoked authority consent invalid regardless of signature validity.

### Verification Independence
Consent verification performed by components independent from consent collection. Verification independence prevents self-authorization.

### Verification Failure Recording
All consent verification failures recorded to ledger with failure reason and attempted action reference. Failure patterns analyzed for abuse detection.

---

## 4. TIME-BOUND CONSENT EXPIRY RULES

### Consent Validity Windows
RED/BLACK action consent valid for defined window: typically minutes to hours. Window duration specified in governance policy. Expiry automatic without extension mechanism.

### Window Start Timestamp
Consent validity window starts at consent signature timestamp. Clock skew tolerance applied but limited to prevent expiry circumvention.

### Expiry Enforcement
Expired consent rejected regardless of action completion status. Actions spanning expiry window require renewed consent.

### No Automatic Renewal
Consent does not auto-renew upon expiry. Renewal requires fresh explicit consent with new signature and presence token.

### Expiry Notification
Approaching consent expiry may trigger notification to relevant authorities. Notification does not extend validity.

### Grace Period Prohibition
No grace periods beyond defined validity window. Expiry enforcement immediate and non-negotiable.

### Expiry Recording
Consent expiry events recorded to ledger when expired consent presented. Expiry patterns monitored for operational friction indicating policy adjustment need.

### Variable Window by Action Class
Different action classes may have different validity windows per governance policy. High-risk actions have shorter windows. Window duration not modifiable per-request.

---

## 5. CONSENT REVOCATION TRIGGERS

### Explicit Authority Revocation
Consenting authority explicitly withdraws consent before action execution. Revocation honored immediately. In-progress actions halted when feasible.

### Authority Credential Revocation
Consenting authority credentials revoked per Phase 5. Credential revocation invalidates all pending consents from that authority.

### Governance Override Revocation
Governance revokes consent as override action. Governance revocation supersedes original consent regardless of original authority level.

### Coercion Investigation Revocation
Investigation confirms consent obtained under coercion per Phase 15. Confirmed coercion invalidates consent retroactively. Actions completed under coerced consent flagged for review.

### Policy Change Revocation
Governance policy changes rendering previously-consented actions ineligible. Policy change invalidates pending consents conflicting with new policy.

### Emergency Freeze Revocation
System enters emergency freeze per Phase 14. Freeze invalidates all pending consents requiring re-consent post-freeze exit.

### Revocation Propagation
Consent revocation propagates to all system components immediately. No delayed or eventual consistency for revocation.

### Revocation Recording
All consent revocations recorded to ledger with revocation trigger, revoking authority when applicable, and affected action references.

---

## 6. MULTI-HUMAN CONFLICT RESOLUTION

### Dual-Approval Consent Agreement
Dual-approval requires both authorities consent to identical action specification. Conflicting consents to different action variants invalid. Agreement explicit, not inferred.

### Consent Timing Precedence
Conflicting sequential consents from same authority resolved by timestamp. Most recent consent supersedes prior consent for same action class.

### Governance Precedence Over Subordinates
Governance consent or revocation supersedes supervisor and operator consents when conflict exists. Precedence hierarchy from Phase 19 applies.

### Conflicting Dual-Approval Deadlock
Dual-approval authorities consent to conflicting action variants. Deadlock escalates to governance. System does not resolve through tie-breaking or inference.

### Explicit Revocation Over Implicit Continuation
Explicit consent revocation supersedes prior consent even if action partially executed. Revocation halts continuation when operationally feasible.

### Conflict Escalation Requirement
Unresolvable consent conflicts escalate to governance for explicit resolution. Automated conflict resolution limited to precedence rules.

### Conflict Recording
Consent conflicts recorded to ledger with conflicting consent references and resolution outcome or escalation.

---

## 7. CONSENT UNDER DEGRADED CONDITIONS

### Degraded Mode Consent Requirements Unchanged
Degraded operation per Phase 14 does not relax consent requirements. Dual-approval, presence verification, and signature validation remain mandatory.

### Authority Unavailability Denial
Required authority unavailable during degraded conditions results in action denial, not consent requirement relaxation. Unavailability extends decision delay.

### Safe-Mode Consent Restrictions
Safe-mode per Phase 14 prohibits most action classes regardless of consent. Consent collected but insufficient without governance approval for safe-mode exit.

### Communication Failure Consent Handling
Communication failures preventing consent delivery result in action denial. System does not assume consent or proceed without verified delivery.

### Degraded Consent Recording
Consent under degraded conditions recorded with degradation context. Post-degradation review evaluates consent validity under degraded circumstances.

### Degradation Does Not Imply Emergency Bypass
Degraded conditions do not automatically trigger emergency consent bypass. Emergency determination requires explicit governance judgment per Phase 17.

### Minimum Viable Consent State
During continuity mode per Phase 11, minimum viable consent state requires governance approval for reconstitution actions. Operator/supervisor consent insufficient for reconstitution.

---

## 8. EMERGENCY OVERRIDE CONSENT CONSTRAINTS

### Emergency Override Consent Scope
Emergency overrides per Phase 17 require consent from available governance authorities. Emergency does not eliminate consent requirement, only modifies approval threshold.

### Emergency Consent Ratification
Emergency consent requires post-emergency full governance ratification. Ratification failure invalidates emergency action retroactively.

### Emergency Does Not Bypass Ethical Limits
Emergency consent cannot authorize actions violating Phase 9 ethical constraints. Ethical boundaries non-negotiable regardless of emergency severity.

### Emergency Consent Recording Enhanced
Emergency consents recorded with emergency justification, unavailable authorities, and ratification status. Enhanced recording enables post-emergency accountability.

### Emergency Consent Expiry Shortened
Emergency consent validity windows shorter than standard consents. Emergency urgency does not extend validity; reduces it to prevent abuse.

### Emergency Consent Frequency Monitoring
Repeated emergency consent invocations monitored for abuse patterns. Excessive frequency triggers external organizational review.

### No Blanket Emergency Consent
Emergency situations do not grant blanket consent for multiple actions. Each emergency action requires specific consent within emergency approval process.

### Emergency Consent Revocation Immediate
Emergency consents revocable immediately upon emergency resolution or governance determination. Emergency status does not prevent revocation.

---

## 9. CONSENT LOGGING & AUDIT GUARANTEES

### All Consent Recorded
Every consent submission recorded to ledger regardless of validity outcome. Recording includes consent content, signature, presence token reference, timestamp, and validity determination.

### Consent Denial Recording
Consent rejections recorded with rejection reason: expired, unauthorized, ambiguous, signature failure, presence failure, or revoked. Denial patterns inform governance policy review.

### Consent Without Action Recording
Consent collected but action not executed recorded. Recording captures consent existence even when action denied for non-consent reasons.

### Action Without Consent Recording
Actions attempted without required consent recorded as violations. Violation recording mandatory per Phase 16.

### Consent Chain Recording
Dual-approval consent chains recorded showing both approvals, timing, and relationship. Chain completeness enables post-incident reconstruction.

### Revocation Recording
Consent revocations recorded with original consent reference, revocation timestamp, and revocation trigger. Revocation history preserved.

### Consent Audit Visibility
Consent records visible to governance without restriction. Consent visibility to subordinate authorities limited to their own consents and supervised operations.

### Consent Integrity Protection
Consent ledger entries protected by cryptographic hash chain and signature verification per Phase 6. Consent tampering detected through integrity verification.

---

## 10. WHAT DOES NOT QUALIFY AS CONSENT (BY DESIGN)

### Forbidden: Silence as Consent
Lack of response, timeout expiry, or authority unavailability does not constitute consent. Silence treated as absence of consent, not implicit approval.

### Forbidden: Default Consent
Pre-configured default approvals for action classes do not constitute consent. Every action requires explicit fresh consent.

### Forbidden: Implied Consent from Prior Actions
Prior consent for similar actions does not imply consent for current action. Each action requires explicit consent regardless of precedent.

### Forbidden: Verbal or Unverified Consent
Verbal approvals, email confirmations, or other non-cryptographically verified communications do not constitute consent. Cryptographic verification mandatory.

### Forbidden: Consent Without Presence for RED/BLACK
Remote approval without device-bound presence token does not constitute valid consent for RED/BLACK actions. Presence verification mandatory per Phase 5.

### Forbidden: Partial Signature Consent
Incomplete cryptographic signatures or signatures with verification warnings do not constitute consent. Signature verification must pass completely.

### Forbidden: Consent from Revoked Authorities
Approvals from authorities with revoked credentials do not constitute consent regardless of timing or signature validity.

### Forbidden: Ambiguous Scope Consent
Approvals without clear action reference or scope specification do not constitute consent. Ambiguity requires clarification, not inference.

### Forbidden: Third-Party Consent
Approvals provided by external entities or non-enrolled individuals do not constitute consent. Consent valid only from enrolled authorities.

### Forbidden: Automated Consent Generation
Programmatic or automated generation of consent signatures does not constitute consent. Human-initiated action required.

### Forbidden: Replayed Consent
Reuse of prior consent signatures or presence tokens for subsequent actions does not constitute fresh consent. Each action requires new consent.

### Forbidden: Expired Consent Extension
Consent expiry does not automatically extend through continued action execution. Expiry invalidates consent regardless of action status.

### Forbidden: Consent from Subordinate for Superior Authority Action
Operator consent for governance-level actions does not constitute valid consent. Authority level must match action authorization requirements.

### Forbidden: Group or Role-Based Consent
Consent attributed to role or group rather than specific enrolled authority does not constitute valid consent. Individual authority identification mandatory.

### Forbidden: Consent Under Duress Without Investigation
Suspected coerced consent treated as operationally valid pending investigation does not constitute unqualified consent. Coercion suspicion recorded and investigated.

### Forbidden: Conditional Consent
Consent contingent on future conditions or outcomes does not constitute valid consent. Consent must be unconditional for specified action at time of provision.

### Forbidden: Delegated Consent
Authority delegating consent responsibility to another authority does not constitute consent from original authority. Delegation prohibited; consent personal and non-transferable.

### Forbidden: Consent Carried Forward Across Version Changes
Consent granted under prior system version does not automatically carry forward to new version per Phase 17. Version transition requires renewed consent for pending actions.

### Forbidden: Aggregate or Statistical Consent
Collective approval patterns or majority consent from authority groups do not constitute consent. Individual explicit consent required per authority for dual-approval.

### Forbidden: Retroactive Consent
Consent provided after action execution does not constitute valid consent for that action. Consent temporal priority mandatory; post-action consent cannot legitimize unauthorized action.

---

END OF FILE
