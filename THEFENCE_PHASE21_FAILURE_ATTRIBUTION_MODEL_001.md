# PHASE 21: FAILURE ATTRIBUTION & RESPONSIBILITY MODEL
## Phase: Failure Attribution Constraints
## Status: Defined

---

## 1. FAILURE TAXONOMY BOUNDARIES

### Human Decision Failure
Authority makes explicit decision resulting in constraint violation, incident escalation, or operational harm. Decision failure attributed to deciding authority regardless of information quality or external pressure.

### Human Inaction Failure
Authority fails to act when action required by role obligations per Phase 5 or Phase 8. Inaction failure attributed to responsible authority with defined obligation.

### System Implementation Failure
Component produces incorrect output, violates specification, or fails to execute defined function. Implementation failure attributed to system component, not human operators.

### Constraint Verification Failure
Verification mechanism fails to detect violation or produces false positive. Verification failure attributed to verification component and governance defining verification requirements.

### Communication Failure
Message delivery, escalation notification, or information transmission fails. Communication failure attributed to communication infrastructure unless sender failed to invoke communication correctly.

### Policy Inadequacy Failure
Governance policy insufficient, ambiguous, or conflicting causing operational failure. Policy failure attributed to governance defining inadequate policy.

### Integration Failure
External dependency or boundary interaction fails. Integration failure attributed to integration point unless internal component misused external interface.

### Environmental Failure
Infrastructure, power, network, or time synchronization failure. Environmental failure attributed to environment unless system failed to handle expected environmental variance.

### Cascading Failure
Initial failure triggers dependent failures. Attribution separates initial failure source from cascade propagation responsibility per Phase 14 cascade suppression obligations.

---

## 2. HUMAN VS SYSTEM RESPONSIBILITY SEPARATION

### Human Responsibility Scope
Decisions requiring approval per Phase 19. Authority enrollment and revocation per Phase 5. Policy creation and interpretation per Phase 12. Incident classification RED/BLACK per Phase 7. Emergency change authorization per Phase 17. Consent provision per Phase 20.

### System Responsibility Scope
Cryptographic verification execution. Constraint checking implementation. Ledger recording execution. Presence token validation. Signature verification. Health monitoring. Denial enforcement. Escalation notification delivery.

### Boundary Determination Principle
Responsibility attributed to entity possessing decision authority. Humans responsible for judgment decisions. System responsible for deterministic verification and execution.

### Human Responsibility Non-Transferable
Humans cannot transfer responsibility to system by claiming automation influence. Human-authorized actions attributed to authorizing human regardless of system recommendations or patterns.

### System Responsibility Non-Anthropomorphized
System failures not attributed moral culpability or intent. System responsibility mechanical: implementation correctness and specification adherence.

### Unclear Boundary Resolution
Ambiguous responsibility boundaries escalate to governance for classification. Classification establishes precedent. Precedent recorded to ledger.

### Separation Preservation
Responsibility separation preserved during attribution. Mixed attribution prohibited. Failure classified as human or system, not both.

---

## 3. SHARED-FAILURE DISQUALIFICATION RULES

### Shared Attribution Prohibited
Failures attributed to specific entity: individual authority, component, or governance body. Shared responsibility across multiple entities prohibited.

### Dual-Approval Failure Attribution
Dual-approval failures attributed to both approving authorities individually. Each authority bears full responsibility for approval decision, not partial responsibility.

### Collective Governance Failure Attribution
Governance body failures attributed to governance collectively, not distributed across individual governance members. Collective attribution for collective decision contexts only.

### Sequential Failure Attribution
Sequential failures attributed separately to each failure point. Attribution traces failure sequence without merging distinct failures.

### Enabling vs Causing Distinction
Enabling failures that create conditions for subsequent failures attributed separately from causing failures. Enabler responsibility distinct from executor responsibility.

### Supervisory Failure Attribution
Supervisor failures to detect or prevent subordinate violations attributed to supervisor. Subordinate violation attributed to subordinate. Separate attributions; not shared.

### Attribution Specificity Requirement
Attribution identifies specific authority device ID, specific component instance, or specific governance decision. Generic attributions to roles or classes prohibited.

### Ambiguity Rejection
Attribution ambiguity unresolvable through investigation remains unattributed. Unattributed failures recorded with attribution investigation outcome. No forced attribution.

---

## 4. ATTRIBUTION UNDER PARTIAL OBSERVABILITY

### Attribution Requires Observable Evidence
Attribution based on ledger evidence, verification logs, and recorded events per Phase 16. Attribution without observable evidence prohibited.

### Missing Evidence Attribution Limits
Incomplete evidence limits attribution confidence. Limited confidence acknowledged in attribution record. Attribution not inferred beyond available evidence.

### Correlation Not Causation
Temporal or behavioral correlation between events insufficient for attribution. Causation requires causal evidence from ledger chains or explicit references.

### Alternative Explanation Acknowledgment
Attribution considers alternative explanations when evidence supports multiple interpretations. Single explanation not forced when alternatives viable.

### Attribution Investigation Scope
Investigation retrieves available ledger evidence, component logs, and human recollection. Investigation does not reconstruct missing evidence through inference.

### Unattributable Failure Classification
Failures unattributable due to evidence gaps classified as unattributable. Classification prevents forced attribution based on assumption.

### Attribution Confidence Levels
High confidence: direct causal evidence from ledger. Medium confidence: strong correlation with supporting context. Low confidence: circumstantial evidence only. Confidence level recorded with attribution.

### Partial Observability Recording
Attribution under partial observability records evidence gaps and alternative explanations. Recording enables future re-evaluation if additional evidence emerges.

---

## 5. SILENT FAILURE CLASSIFICATION

### Silent Failure Definition
Failure occurring without observable signals, escalations, or ledger entries at time of occurrence. Silent failures detected retrospectively through investigation or external discovery.

### Silent Failure Detection Attribution
Silent failure detection attributed to detecting entity: investigator, external auditor, or incident review. Detection responsibility separate from failure responsibility.

### Silent Failure Cause Attribution
Silent failure cause attribution proceeds using available retrospective evidence. Cause attribution may remain unattributable if evidence insufficient.

### Suppression vs Silence Distinction
Failures with suppressed signals attributed to suppressing entity. Failures without signal generation attributed to implementation failure in signal generation component.

### Silent Failure Prevention Responsibility
Authority or component with obligation to generate signals for failure class bears responsibility for signal absence. Silence attributed to responsible signal generator.

### Audit Gap Attribution
Silent failures creating audit gaps attributed based on gap location. Ledger writer failures attributed to ledger component. Recording invocation failures attributed to invoking component.

### Silent Failure Retrospective Recording
Silent failures discovered post-occurrence recorded to ledger with discovery timestamp, detection method, and attribution when determinable. Retrospective recording preserves history.

### Silent Failure Pattern Analysis
Repeated silent failures from same attribution source trigger governance review of signal adequacy and component reliability. Pattern analysis informs improvement, not blame redistribution.

---

## 6. AUTOMATION-INDUCED FAILURE HANDLING

### Automation Execution Failure
Automated process produces incorrect result or violates constraint. Automation failure attributed to automation implementation component.

### Automation Design Failure
Automated process correctly implements flawed design causing operational failure. Design failure attributed to governance approving automation design.

### Automation Approval Failure
Human approves automation recommendation resulting in failure. Approval failure attributed to approving human. Automation recommendation not exculpatory.

### Automation Enablement Context
Automation providing context or recommendations for human decisions does not share responsibility for decision outcomes. Human decision responsibility remains with human.

### Automation Override Failure
Human overrides automation denial resulting in failure. Override failure attributed to overriding human per Phase 19 override supremacy.

### Automation False Negative Failure
Automation fails to detect violation or anomaly. False negative attributed to automation verification component and governance defining verification requirements.

### Automation False Positive Handling
Automation false positive triggering unnecessary escalation or denial attributed to automation detection component. False positive investigation responsibility lies with governance per Phase 18.

### Automation Boundary Failures
Automation operating outside authorized scope per Phase 19 attributed to automation containment failure and governance defining inadequate boundaries.

---

## 7. GOVERNANCE FAILURE ESCALATION PATHS

### Internal Governance Failure
Governance conflict, deadlock, or inability to reach required decision per Phase 8 governance failure conditions. Internal failure escalates to external organizational leadership.

### Governance Unavailability Failure
Governance authorities unavailable exceeding defined thresholds per Phase 14. Unavailability failure escalates to organizational leadership for governance reconstitution.

### Governance Constraint Violation Failure
Governance authorizes action violating Phase 9 ethical constraints or Phase 1-20 doctrine. Violation attributed to governance collectively. Escalates to organizational leadership and external oversight.

### Governance Policy Inadequacy Failure
Governance policy proves insufficient causing operational failure. Policy inadequacy attributed to governance. Escalates for policy revision following Phase 12.

### Governance Corruption Suspicion
Evidence suggests governance compromise or coercion per Phase 15. Suspicion escalates to organizational leadership immediately. Attribution deferred pending investigation.

### Organizational Leadership Escalation Authority
External organizational leadership receiving governance failure escalation possesses authority to override governance, reconstitute governance, or mandate system shutdown.

### Escalation Path Recording
All governance failure escalations recorded to ledger with failure classification, escalation trigger, and organizational leadership response when available.

### Escalation Does Not Transfer Responsibility
Escalation to organizational leadership does not transfer governance responsibility. Governance remains responsible for failures within governance scope even when escalated.

---

## 8. RESPONSIBILITY LOCK-IN CONDITIONS

### Attribution Lock-In Trigger
Attribution recorded to ledger with governance approval or investigation conclusion. Locked attribution immutable without governance-approved revision.

### Lock-In Timing
Attribution locks upon ledger recording, not upon failure occurrence. Pre-lock-in attribution provisional and subject to investigation refinement.

### Lock-In Revision Requirements
Locked attribution revision requires new evidence discovery, attribution error identification, or governance determination of misattribution. Revision follows Phase 12 change control.

### Lock-In Appeals Process
Attributed authority may appeal attribution to governance. Appeal does not suspend attribution. Governance evaluates appeal evidence and approves or denies revision.

### Lock-In Prevents Retroactive Reassignment
Locked attribution not retroactively reassigned for convenience or organizational politics. Reassignment requires evidence-based justification.

### Lock-In Scope Limitation
Attribution lock-in applies to specific failure instance. Lock-in does not prevent attribution of subsequent failures differently even when superficially similar.

### Unattributable Lock-In
Failures classified as unattributable lock into unattributable status. Unattributable classification not retroactively forced to attribution without new evidence.

### Lock-In Recording
Attribution lock-in event recorded to ledger with lock-in authority, timestamp, and evidence basis. Lock-in creates audit trail for attribution lifecycle.

---

## 9. POST-FAILURE AUTHORITY REASSIGNMENT

### Reassignment Trigger Conditions
Repeated failures attributed to specific authority exceeding governance-defined threshold. Single catastrophic failure attributed to authority. Coercion confirmation post-investigation. Authority request for role reduction.

### Reassignment Scope
Authority role reduction, scope limitation, or credential revocation per Phase 5. Reassignment does not transfer past failure responsibility to replacement authority.

### Reassignment Approval Authority
Governance approves authority reassignment. Supervisor cannot unilaterally reassign authorities. Reassignment follows dual-approval requirements.

### Reassignment Recording
Authority reassignments recorded to ledger with reassignment trigger, prior role, new role or revocation, and governance approval. Recording preserves authority lifecycle.

### Reassignment Non-Punitive Intent
Reassignment serves operational risk reduction, not punishment. Attribution establishes responsibility; reassignment manages future risk.

### Reassignment Does Not Erase Attribution
Reassigned or revoked authority retains attribution for failures occurring during prior authority tenure. Attribution permanent per lock-in rules.

### Temporary Reassignment
Authority temporarily reassigned pending investigation conclusion. Temporary reassignment recorded separately from permanent reassignment. Reversal possible based on investigation outcome.

### Reassignment Appeals
Reassigned authority may appeal reassignment decision to governance. Appeal process independent from attribution appeal. Governance evaluates operational risk assessment.

---

## 10. WHAT THE SYSTEM CANNOT ATTRIBUTE (BY DESIGN)

### Forbidden: Intent Attribution
System cannot attribute intent, motivation, or malice. Attribution establishes actions and decisions occurred, not underlying intent.

### Forbidden: Moral Culpability Attribution
System cannot attribute moral blame or ethical culpability. Attribution mechanical: responsibility for actions and outcomes within role scope.

### Forbidden: Probabilistic Attribution
System cannot attribute responsibility probabilistically across multiple potential sources. Attribution deterministic or remains unattributed.

### Forbidden: Shared Responsibility Attribution
System cannot attribute single failure to multiple entities as shared responsibility. Attribution specific per Section 3 disqualification rules.

### Forbidden: Inferred Causality Attribution
System cannot attribute based on inferred causality without observable causal evidence. Correlation insufficient for attribution.

### Forbidden: Attribution Beyond Observable Evidence
System cannot attribute failures lacking ledger evidence or observable signals. Missing evidence creates attribution limits, not inference justification.

### Forbidden: Retroactive Attribution Reassignment
System cannot retroactively reassign locked attribution without evidence-based revision. Attribution lock-in prevents reassignment for convenience.

### Forbidden: Attribution Based on Outcome Severity
System cannot attribute based on failure severity alone. Attribution based on responsibility and causation, not consequence magnitude.

### Forbidden: External Entity Attribution
System cannot attribute responsibility to external entities outside system boundaries. External failures attributed to integration point or environmental failure classification.

### Forbidden: Future Failure Attribution
System cannot attribute responsibility for failures not yet occurred. Attribution applies to historical events only.

### Forbidden: Collective Punishment Attribution
System cannot attribute failures to authority groups, roles, or classes beyond specific collective governance contexts. Attribution individual except where collective decision explicit.

### Forbidden: Attribution Inference from Silence
System cannot attribute responsibility based on authority silence, non-response, or unavailability unless specific obligation to respond existed.

### Forbidden: Automated Attribution Without Human Review
System cannot finalize attribution without governance review for significant failures. Automated attribution provisional until governance confirmation.

### Forbidden: Attribution Confidence Inflation
System cannot increase attribution confidence beyond evidence quality. Low-confidence attribution remains low-confidence; not upgraded through assertion.

### Forbidden: Alternative Explanation Dismissal
System cannot dismiss alternative explanations without evidence ruling them out. Alternative explanations preserved in attribution record.

### Forbidden: Attribution Based on Reputation
System cannot attribute based on authority historical failure patterns or reputation. Each failure attributed based on specific evidence for that failure instance.

### Forbidden: Preemptive Attribution
System cannot attribute responsibility before failure investigation completion. Premature attribution risks misattribution.

### Forbidden: Attribution to Unavailable Authorities Without Evidence
System cannot attribute failures to unavailable authorities by default. Unavailability does not imply responsibility without causal evidence.

### Forbidden: Organization-Level Attribution
System cannot attribute failures to organizational entities beyond governance body. Organizational attribution external to system responsibility.

### Forbidden: Time-Decay Attribution Modification
System cannot modify attribution based on passage of time. Attribution remains valid regardless of age unless evidence-based revision approved.

---

END OF FILE
