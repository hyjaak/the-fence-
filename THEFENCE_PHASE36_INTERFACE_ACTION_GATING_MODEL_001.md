# PHASE 36: INTERFACE ACTION GATING MODEL
## Phase: User Interface Action Authorization Control
## Status: Defined

---

## PURPOSE

Define interface action eligibility, gating rules, authorization binding, and execution constraints ensuring Phase 31 passive projection enforcement, Phase 19 backend authorization verification, Phase 35 session state compliance, and Phase 5 credential validity without UI-driven state creation or authorization bypass.

---

## SCOPE

Interface action gating encompasses all user-initiated actions through Phase 33 Control-Gated and Acknowledgement views including permit requests, approvals, policy modifications, incident classifications, escalations, and configuration changes. Gating enforces authority verification, consent validity, session state compliance, operational mode constraints, and audit trail generation per Phase 16 without UI-level authorization decisions.

---

## 1. DEFINITION OF UI ACTION

### 1.1 UI Action Concept
UI action represents user-initiated request through Phase 33 Control-Gated or Acknowledgement view elements triggering backend authorization verification per Phase 19 and potential system state modification. Action submission does not imply authorization grant.

### 1.2 Action vs View Separation
UI action distinct from Phase 33 view availability. View element visibility does not grant action authorization. Backend authorization verification mandatory regardless of UI element availability per Phase 31.

### 1.3 Action Binding to Credential
UI action binds to Phase 5 credential identity from Phase 35 session state. Action attribution recorded per Phase 21 with credential identity, Phase 32 user class, session identifier, and timestamp per Phase 16.

### 1.4 Action Backend Dependency
UI action execution requires backend authorization verification per Phase 19. UI cannot authorize actions independently per Phase 31 passive projection principle. Backend denial supersedes UI submission.

---

## 2. ACTION ELIGIBILITY PRECONDITIONS

### 2.1 Session State Preconditions
UI action eligibility requires Phase 35 session state:
- ACTIVE state required for all Control-Gated actions
- INITIATED state insufficient for actions (must transition to ACTIVE)
- RESTRICTED state reduces action eligibility per restriction scope
- SUSPENDED state prevents all actions pending reauthentication
- TERMINATED state prevents all actions

### 2.2 Credential Validity Preconditions
UI action eligibility requires Phase 5 credential validity:
- Credential signature valid
- Credential not revoked
- Credential not expired
- Credential enrollment includes action-appropriate authority per Phase 32

### 2.3 User Class Authority Preconditions
UI action eligibility requires Phase 32 user class authority:
- Action within user class authority boundaries per Phase 32 Section 6
- Action not in user class forbidden privileges per Phase 32 Section 7
- User class enrollment maintained and not revoked

### 2.4 Consent Validity Preconditions
UI action requiring Phase 20 consent eligibility requires:
- Explicit consent from required authorities
- Consent not expired per Phase 20 time-bound validity
- Consent not revoked per Phase 20 revocation triggers
- Consent scope includes specific action reference
- Presence token available if Phase 5 RED/BLACK action

### 2.5 Operational Mode Preconditions
UI action eligibility requires Phase 14 operational mode compliance:
- FULL OPERATIONAL mode: All authority-appropriate actions eligible
- DEGRADED MODE: Actions dependent on degraded components ineligible
- SAFE MODE: Non-governance actions ineligible
- FREEZE: All actions except governance override ineligible
- IRRECOVERABLE: All actions ineligible except governance audit export

### 2.6 Audit Recording Preconditions
UI action eligibility requires Phase 16 audit recording capability:
- Audit ledger recording functional
- Action audit entry generation capability verified
- Audit recording failure prevents action submission

---

## 3. AUTHORITY & CONSENT BINDING TO ACTIONS

### 3.1 Single-Approval Action Binding
Single-approval actions bind to Phase 5 single authority credential:
- YELLOW incident acknowledgment by operator per Phase 22
- Operational permit requests within operator scope per Phase 5
- Audit query submissions within auditor scope per Phase 16
- Non-critical configuration changes within supervisor scope

Single-approval backend verification:
- Credential signature verification per Phase 5
- Phase 32 user class authority boundary verification
- Phase 19 decision eligibility threshold verification
- Action approval or denial returned to UI

### 3.2 Dual-Approval Action Binding
Dual-approval actions bind to two distinct Phase 5 credentials per Phase 5 dual-approval requirements:
- RED/BLACK action authorization requires dual-approval
- Critical policy modifications require dual-approval per Phase 8
- Authority enrollment requires dual-approval per Phase 5
- Emergency changes require dual-approval per Phase 17

Dual-approval coordination:
- First approval recorded with credential identity, timestamp, session identifier
- Second approval requires distinct credential per Phase 5 separation rules
- Both approvals required within time-bound coordination window
- Approval order irrelevant
- Coordination logged per Phase 16

### 3.3 Governance Action Binding
Governance actions bind to Phase 32 executive class governance-enrolled credentials per Phase 8:
- Policy definition and modification
- Ethical interpretation requests
- Constraint modification through Phase 17 change control
- Risk acceptance per Phase 29
- Irrecoverable failure declaration per Phase 14

Governance verification:
- Executive class with governance enrollment verified per Phase 32
- Governance quorum requirements verified per Phase 8
- Action approval or denial returned to UI

### 3.4 Consent-Dependent Action Binding
Consent-dependent actions bind to Phase 20 consent validity:
- Privacy-sensitive data access requires consent per Phase 26
- External data disclosure requires governance consent per Phase 25
- RED/BLACK actions require dual-approval consent per Phase 5

Consent verification:
- Consent signature verification per Phase 20
- Consent scope includes action reference verified
- Consent time-bound validity verified
- Consent revocation check performed
- Presence token verification for RED/BLACK per Phase 5

---

## 4. ACTION GATING RULES BY SYSTEM STATE

### 4.1 Action Gating Under FULL OPERATIONAL
FULL OPERATIONAL mode action gating:
- All actions within Phase 32 user class authority boundaries eligible
- Authorization verification per Phase 19 decision eligibility
- No operational mode suppression applied
- Standard audit recording per Phase 16

### 4.2 Action Gating Under DEGRADED MODE
DEGRADED MODE action gating per Phase 14:
- Actions dependent on degraded components suppressed at UI level
- Actions requiring degraded component approval authority suppressed
- Operational actions within non-degraded domain remain eligible
- Degradation disclosure displayed before action submission
- Enhanced audit recording for actions during degradation

### 4.3 Action Gating Under SAFE MODE
SAFE MODE action gating per Phase 14:
- All operator actions suppressed
- All supervisor actions suppressed
- All integration actions suppressed
- Executive governance override actions eligible if governance enrolled
- Auditor read-only audit access actions eligible
- SAFE MODE reason displayed before governance override submission

### 4.4 Action Gating Under LOCKED MODE
LOCKED MODE action gating per Phase 15 adversarial lockdown or Phase 27 security boundary violation:
- All external communication actions suppressed
- All operator actions suppressed
- All supervisor actions suppressed
- All integration actions suppressed
- Executive governance emergency response actions eligible if governance enrolled
- Lockdown reason displayed before governance action submission

### 4.5 Action Gating Under FREEZE
FREEZE action gating per Phase 14:
- All operator actions suppressed
- All supervisor actions suppressed
- All integration actions suppressed
- All auditor actions suppressed except read-only governance investigation support
- Executive governance override actions eligible if governance enrolled
- Freeze reason displayed before governance override submission

### 4.6 Action Gating Under IRRECOVERABLE FAILURE
IRRECOVERABLE state action gating per Phase 14:
- All operational actions suppressed
- All approval actions suppressed
- All policy actions suppressed
- Executive governance audit ledger export actions eligible if governance enrolled
- Auditor audit preservation actions eligible
- Irrecoverable failure reason displayed

---

## 5. MULTI-ACTOR ACTION CONFLICT HANDLING

### 5.1 Concurrent Identical Action Requests
Concurrent identical action requests from multiple actors:
- First submission acquires action processing lock
- Subsequent identical submissions queued or denied with lock holder display
- Lock released upon backend authorization completion or timeout
- Lock holder session termination releases lock immediately
- Conflict logged per Phase 16

### 5.2 Concurrent Conflicting Action Requests
Concurrent conflicting action requests from multiple actors:
- Component isolation request conflicts with component activation request
- Policy modification conflicts with concurrent policy modification
- Incident classification conflicts with concurrent classification

Conflict resolution:
- Phase 19 governance authority supersedes operational authority
- Phase 5 dual-approval supersedes single-approval
- Phase 32 executive class supersedes supervisor class
- Unresolvable conflicts escalate to governance per Phase 22
- Conflict resolution logged per Phase 16

### 5.3 Dual-Approval Coordination Conflicts
Dual-approval coordination conflicts:
- Second approval from same credential as first denied per Phase 5 separation
- Second approval outside coordination time window requires fresh dual-approval
- Conflicting dual-approval attempts (approve vs deny) escalate to governance
- Coordination conflicts logged per Phase 16

### 5.4 Emergency Override During Normal Action
Emergency governance override during normal action processing:
- Governance override supersedes in-progress operational actions per Phase 19
- Operational actions frozen or denied upon override initiation
- Override supremacy logged per Phase 16

---

## 6. DEFERRED VS IMMEDIATE ACTION RULES

### 6.1 Immediate Action Execution
Immediate actions execute upon backend authorization approval without delay:
- Emergency governance overrides per Phase 19
- Incident escalation submissions per Phase 22
- Component isolation commands per Phase 14
- Credential revocation per Phase 5
- Session termination per Phase 34

Immediate execution characteristics:
- No queuing or scheduling
- Backend authorization and execution attempted immediately
- Success or failure returned to UI immediately
- Immediate execution logged per Phase 16

### 6.2 Deferred Action Execution
Deferred actions await additional preconditions before backend execution:
- Dual-approval actions await second approval per Phase 5
- Scheduled maintenance actions await scheduled time
- Policy changes await Phase 17 change control approval workflow
- Risk acceptance awaits Phase 29 governance deliberation

Deferred execution characteristics:
- Action submission recorded but execution delayed
- Precondition wait state displayed to submitter
- Precondition satisfaction triggers execution
- Precondition timeout cancels deferred action
- Deferred state transitions logged per Phase 16

### 6.3 Deferred Action Cancellation
Deferred actions cancellable under conditions:
- Submitter voluntary cancellation before execution
- Governance directive cancellation per Phase 8
- Credential revocation cancels all deferred actions by revoked credential
- Operational mode transition cancels incompatible deferred actions
- Session termination cancels session-associated deferred actions
- Cancellation logged per Phase 16

### 6.4 Deferred Action Timeout
Deferred actions timeout enforced:
- Dual-approval coordination timeout per Phase 5
- Scheduled action window expiry
- Policy change approval timeout per Phase 17
- Timeout cancels deferred action automatically
- Timeout notification to submitter
- Timeout logged per Phase 16

---

## 7. ACTION SUPPRESSION CONDITIONS

### 7.1 Session State Suppression
Action suppression based on Phase 35 session state:
- INITIATED state: All actions suppressed
- ACTIVE state: No session-based suppression (other conditions apply)
- RESTRICTED state: Actions outside restriction scope suppressed
- SUSPENDED state: All actions suppressed pending reauthentication
- TERMINATED state: All actions suppressed

### 7.2 Credential Validity Suppression
Action suppression based on Phase 5 credential validity:
- Revoked credential: All actions suppressed immediately
- Expired credential: All actions suppressed immediately
- Compromised credential suspicion: Actions suppressed pending investigation per Phase 27
- Credential rotation in progress: Actions suppressed during rotation window

### 7.3 User Class Authority Suppression
Action suppression based on Phase 32 user class authority:
- Actions outside user class authority boundaries suppressed
- Actions in user class forbidden privileges suppressed per Phase 32 Section 7
- User class downgrade suppresses previously eligible actions immediately
- User class revocation suppresses all actions immediately

### 7.4 Consent Validity Suppression
Action suppression based on Phase 20 consent validity:
- Consent-required actions without valid consent suppressed
- Consent expiry suppresses consent-dependent actions
- Consent revocation suppresses consent-dependent actions immediately
- Consent scope mismatch suppresses out-of-scope actions

### 7.5 Operational Mode Suppression
Action suppression based on Phase 14 operational mode per Section 4.

### 7.6 Component Dependency Suppression
Action suppression based on Phase 23 component dependency:
- Actions dependent on failed components suppressed
- Actions dependent on degraded components suppressed if degradation severity sufficient
- Actions dependent on isolated components suppressed
- Dependency restoration removes suppression

### 7.7 Policy-Based Suppression
Action suppression based on Phase 8 governance policy:
- Policy changes prohibiting actions suppress those actions immediately
- Policy-defined action eligibility criteria failure suppresses actions
- Emergency policy restrictions suppress actions per Phase 17

---

## 8. FORBIDDEN UI ACTIONS

### 8.1 Universally Forbidden Actions
UI actions universally prohibited regardless of user class or operational mode:
- Phase 6 and Phase 16 audit ledger deletion or modification actions
- Phase 9 ethical constraint violation authorization actions
- Phase 5 dual-approval bypass actions for RED/BLACK
- Phase 5 presence verification bypass actions for RED/BLACK
- Constraint self-weakening actions outside Phase 17 change control
- Audit evasion or suppression actions
- Privacy boundary elimination actions per Phase 26
- Single-actor RED/BLACK authorization actions per Phase 5

### 8.2 Operator Forbidden Actions
Operator class specifically prohibited actions per Phase 32:
- RED/BLACK action authorization actions
- Policy definition or modification actions
- Governance participation actions
- Dual-approval authority actions
- Authority enrollment or revocation actions
- Incident classification beyond YELLOW actions
- Ethical interpretation actions
- Risk acceptance actions
- Component recovery authorization actions without supervisor approval

### 8.3 Supervisor Forbidden Actions
Supervisor class specifically prohibited actions per Phase 32:
- RED/BLACK single-authority approval actions without dual-approval enrollment
- Policy definition actions without governance enrollment
- Ethical boundary interpretation actions
- Ledger modification actions
- Irrecoverable failure declaration actions without executive authority
- Constraint modification actions outside governance
- External compliance certification actions
- Privacy boundary relaxation actions

### 8.4 Auditor Forbidden Actions
Auditor class specifically prohibited actions per Phase 32:
- Operational action execution actions
- Audit ledger modification actions
- Policy interpretation or definition actions
- Incident classification actions
- Authority enrollment or revocation actions
- Governance participation actions without governance enrollment
- Evidence suppression actions
- Compliance self-certification actions

### 8.5 Integration Forbidden Actions
Integration class specifically prohibited actions per Phase 32:
- Any approval or authorization decision actions
- Human consent provision actions
- Policy interpretation actions
- Incident classification actions
- Dual-approval participation actions
- Governance participation actions
- Presence verification actions
- Risk acceptance actions

---

## 9. IRREVERSIBLE ACTION DISCLOSURE RULES

### 9.1 Irreversible Action Definition
Irreversible actions defined as actions preventing reversal through standard operational processes:
- Authority credential revocation per Phase 5
- Component permanent isolation per Phase 14
- Incident escalation to external oversight per Phase 22 Tier 6
- System shutdown directive per Phase 8
- Irrecoverable failure declaration per Phase 14
- Permanent risk rejection per Phase 29
- External data disclosure per Phase 25

### 9.2 Irreversibility Disclosure Requirement
Irreversible action UI disclosure mandatory before action submission:
- Irreversibility warning displayed prominently
- Specific consequences of irreversibility described
- Alternative reversible actions displayed if available
- Reversal process description if special process exists
- Irreversibility acknowledgement required before submission

### 9.3 Irreversibility Confirmation Requirement
Irreversible action confirmation requirements:
- Explicit confirmation action separate from initial submission
- Confirmation displays action summary including irreversibility
- Confirmation includes credential re-verification for critical irreversible actions
- Confirmation timeout requiring re-submission if delayed
- Confirmation logged per Phase 16

### 9.4 Irreversible Action Audit Enhancement
Irreversible actions generate enhanced Phase 16 audit entries:
- Irreversibility disclosure display timestamp
- Irreversibility acknowledgement timestamp
- Confirmation action timestamp
- Credential identity performing irreversible action
- Irreversible action justification if provided
- Irreversible action approval chain if dual-approval

---

## 10. ACTION CONFIRMATION & ACKNOWLEDGEMENT REQUIREMENTS

### 10.1 Critical Action Confirmation
Critical actions require explicit confirmation beyond initial submission:
- RED/BLACK action authorization per Phase 5
- Authority enrollment or revocation per Phase 5
- Policy modification per Phase 8
- Emergency override per Phase 19
- Irrecoverable failure declaration per Phase 14
- System shutdown directive per Phase 8
- External data disclosure per Phase 25

Confirmation process:
- Action summary displayed for review
- Confirmation action required (separate button/control)
- Confirmation timeout enforced (typically 60 seconds)
- Confirmation includes credential re-verification for RED/BLACK
- Confirmation logged per Phase 16

### 10.2 Non-Critical Action Acknowledgement
Non-critical actions require acknowledgement of action initiation:
- YELLOW incident acknowledgement per Phase 22
- Operational permit request submissions
- Audit query submissions
- Routine configuration changes

Acknowledgement process:
- Action initiation acknowledged to user
- Backend processing status displayed
- Action result notification upon completion
- Acknowledgement logged per Phase 16

### 10.3 Dual-Approval Confirmation
Dual-approval actions require confirmation from both approving authorities:
- First approval confirmation with action summary
- Second approval confirmation with action summary and first approver identity
- Both confirmations logged separately per Phase 16
- Coordination timeout enforced between approvals

### 10.4 Bulk Action Prohibition
Bulk actions without individual confirmation prohibited:
- No bulk authority revocation without individual confirmation per revocation
- No bulk policy changes without individual confirmation per policy
- No bulk incident classifications without individual confirmation per incident
- Bulk prohibition prevents inadvertent mass action execution

---

## 11. AUDIT & EVIDENCE REQUIREMENTS

### 11.1 Action Submission Audit
Phase 16 audit entries for action submissions:
- Credential identity and Phase 32 user class
- Session identifier from Phase 35
- Action type and parameters
- Submission timestamp
- Phase 33 view element identifier triggering submission
- Submission source location if observable

### 11.2 Action Authorization Audit
Phase 16 audit entries for backend authorization verification:
- Action submission correlation identifier
- Authorization verification result (approved/denied)
- Denial reason with Phase constraint reference if denied
- Authorization verification timestamp
- Phase 19 decision eligibility verification details

### 11.3 Action Execution Audit
Phase 16 audit entries for action execution:
- Action submission correlation identifier
- Execution result (success/failure)
- Execution timestamp
- State modifications resulting from action
- Execution failure reason if failed

### 11.4 Action Confirmation Audit
Phase 16 audit entries for action confirmations:
- Action submission correlation identifier
- Confirmation timestamp
- Confirmation credential identity
- Irreversibility acknowledgement if applicable
- Confirmation timeout if applicable

### 11.5 Action Suppression Audit
Phase 16 audit entries for action suppression:
- Suppressed action type
- Suppression reason with Phase constraint reference
- Credential identity attempting suppressed action
- Suppression timestamp
- Phase 35 session state at suppression

### 11.6 Dual-Approval Coordination Audit
Phase 16 audit entries for dual-approval coordination:
- Coordination identifier
- First approval credential identity and timestamp
- Second approval credential identity and timestamp
- Coordination result (success/timeout/conflict)
- Coordination duration

---

## 12. CROSS-PHASE ALIGNMENT

### 12.1 Alignment with Phase 5 Authority
UI action authorization binds to Phase 5 credential validity and authority enrollment. Credential revocation suppresses all actions immediately.

### 12.2 Alignment with Phase 16 Audit
UI action lifecycle generates Phase 16 audit trail from submission through execution or denial. Audit recording failure prevents action submission.

### 12.3 Alignment with Phase 19 Control Authority
UI action authorization verification enforces Phase 19 decision eligibility thresholds and authority ceilings. UI cannot authorize actions independently.

### 12.4 Alignment with Phase 20 Consent
UI consent-dependent actions verify Phase 20 consent validity before submission. Consent revocation suppresses consent-dependent actions.

### 12.5 Alignment with Phase 31 Interface Binding
UI action availability implements Phase 31 passive projection principle. Actions reflect backend state without creating independent UI state.

### 12.6 Alignment with Phase 32 User Class
UI action eligibility enforces Phase 32 user class authority boundaries and forbidden privileges. Class revocation suppresses all actions.

### 12.7 Alignment with Phase 33 Role-View Binding
UI action availability determined by Phase 33 Control-Gated view provisioning per user class and operational state.

### 12.8 Alignment with Phase 34 Access Flow Control
UI action submission requires Phase 34 access flow with valid authentication and Phase 35 ACTIVE session state.

### 12.9 Alignment with Phase 35 Session State
UI action eligibility requires Phase 35 ACTIVE session state. SUSPENDED, RESTRICTED, TERMINATED states suppress actions per Section 7.1.

---

## WHAT INTERFACE ACTIONS CANNOT DO (BY DESIGN)

### Cannot: Authorize Actions Independently
Interface actions cannot authorize execution independently of Phase 19 backend authorization verification. UI submission does not imply authorization grant.

### Cannot: Bypass Credential Verification
Interface actions cannot bypass Phase 5 credential validity verification. Invalid, revoked, or expired credentials prevent all actions.

### Cannot: Execute Without Session State
Interface actions cannot execute without Phase 35 ACTIVE session state. SUSPENDED, TERMINATED states prevent all actions.

### Cannot: Bypass Dual-Approval Requirements
Interface actions cannot bypass Phase 5 dual-approval requirements for RED/BLACK actions. Single-authority RED/BLACK submission prohibited.

### Cannot: Bypass Presence Verification
Interface actions cannot bypass Phase 5 presence verification for RED/BLACK actions. Remote RED/BLACK authorization prohibited.

### Cannot: Modify Audit Ledger
Interface actions cannot submit audit ledger deletion or modification actions. Phase 6 and Phase 16 ledger immutability absolute.

### Cannot: Violate Ethical Constraints
Interface actions cannot submit Phase 9 ethical constraint violation authorization actions regardless of authority level.

### Cannot: Operate Without Audit Recording
Interface actions cannot submit without Phase 16 audit recording capability. Audit failure prevents action submission.

### Cannot: Bypass User Class Authority Boundaries
Interface actions cannot submit actions outside Phase 32 user class authority boundaries. Authority ceiling enforcement absolute.

### Cannot: Infer Consent from Silence
Interface actions cannot infer Phase 20 consent from silence or timeout. Explicit consent verification required for consent-dependent actions.

### Cannot: Execute During SAFE MODE for Non-Governance
Interface actions cannot submit non-governance actions during Phase 14 SAFE MODE. Operational action suppression mandatory.

### Cannot: Bypass Operational Mode Constraints
Interface actions cannot bypass Section 4 operational mode gating rules. State-based suppression absolute.

### Cannot: Create Independent UI State
Interface actions cannot create system state through UI independently of backend. Phase 31 passive projection enforcement absolute.

### Cannot: Share Actions Across Sessions
Interface actions cannot execute using credentials from different Phase 35 session. Action binds to submitting session exclusively.

### Cannot: Accumulate Authority Through Action History
Interface actions cannot accumulate authorization through prior successful actions. Each action requires fresh authorization verification.

### Cannot: Bypass Irreversibility Disclosure
Interface actions cannot submit irreversible actions without Section 9.2 irreversibility disclosure and acknowledgement.

### Cannot: Execute Bulk Actions Without Individual Confirmation
Interface actions cannot execute bulk operations without individual confirmation per Section 10.4. Bulk prohibition prevents mass inadvertent execution.

### Cannot: Override Governance-Directed Suppression
Interface actions cannot bypass governance-directed action suppression per Phase 8 policy. Governance suppression absolute.

### Cannot: Bypass Confirmation Requirements
Interface actions cannot bypass Section 10 confirmation requirements for critical actions. Confirmation mandatory for designated action classes.

### Cannot: Guarantee Action Execution
Interface actions cannot guarantee successful execution. Backend authorization denial, operational constraints, or component failures may prevent execution after submission.

---

END OF FILE
