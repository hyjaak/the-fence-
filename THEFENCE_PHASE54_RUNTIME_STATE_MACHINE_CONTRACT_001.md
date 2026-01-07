# THE FENCE — Phase 54: Runtime State Machine Contract

## 1. Purpose
Define the finite and enforceable runtime states of the system.

## 2. State Definitions

### initialization
System bootstrap state from cold start or restart.

Characteristics:
- No user operations permitted
- Component initialization in progress per Phase 10
- Phase 16 audit ledger integrity verification executing
- Phase 21 credential registry loading
- Phase 8 governance policy loading
- Phase 30 ethical constraints verification
- Phase 19 guardrails activation pending
- System accepts no external events except governance bootstrap commands

Duration: Bounded to maximum 60 seconds, timeout triggers failure escalation to governance.

Exit: Transitions to idle upon successful initialization completion or halted upon initialization failure.

### idle
System operational but no active user sessions or executing actions.

Characteristics:
- All components operational per Phase 10
- Phase 16 audit ledger accepting events
- Phase 19 guardrails active
- Phase 12 operational mode GREEN
- No Phase 35 sessions active
- No Phase 53 execution graph nodes in in_progress state
- System accepts external events, routes per Phase 42
- Background monitoring and telemetry active

Duration: Unbounded, persists until user session initiated or system shutdown.

Exit: Transitions to active upon first Phase 35 session creation or degraded upon component degradation detection.

### active
System processing user sessions and executing actions.

Characteristics:
- One or more Phase 35 sessions active
- Phase 53 execution graph nodes in in_progress state
- Phase 12 operational mode GREEN, YELLOW, or ORANGE
- All critical components operational per Phase 10
- Phase 44 execution handoff processing actions
- User events processed per Phase 52 validation pipeline
- Phase 42 routing and Phase 43 delivery operational

Duration: Unbounded, persists while sessions active or execution in progress.

Exit: Transitions to idle when all sessions terminated and execution complete, degraded upon operational mode escalation to RED, halted upon BLACK mode or critical failure.

### degraded
System operational with reduced capability or elevated risk mode.

Characteristics:
- Phase 12 operational mode YELLOW, ORANGE, or RED
- One or more components degraded or isolated per Phase 10
- Phase 19 guardrails enforcing degraded mode constraints
- User operations restricted per operational mode rules
- Phase 34 escalation paths active
- Critical functions preserved, non-critical functions suspended
- Phase 38 notifications emitted to governance and elevated authority

Duration: Unbounded, persists until degradation cause resolved or escalates to halted.

Exit: Transitions to active upon operational mode restoration to GREEN/YELLOW, halted upon BLACK mode transition or critical component failure.

### halted
System suspended operations, no user actions permitted.

Characteristics:
- Phase 12 operational mode BLACK or critical failure detected
- All Phase 35 sessions forcibly terminated
- All Phase 53 execution graph in_progress nodes aborted per Phase 46
- No user operations accepted except governance override commands
- Phase 16 audit ledger write-only, read access governance/auditor only
- Phase 10 component isolation maximum enforcement
- Phase 38 critical alerts emitted to governance
- Phase 19 guardrails prevent all non-governance operations

Duration: Unbounded, persists until governance explicit restoration command or system terminated.

Exit: Transitions to degraded upon governance restoration command with validation, terminated upon governance shutdown command or unrecoverable failure.

### terminated
System shutdown, no operations possible.

Characteristics:
- All components shutdown per Phase 10
- All Phase 35 sessions terminated
- All Phase 53 execution graphs halted
- Phase 16 audit ledger finalized, no further writes
- System accepts no events
- Phase 50 closure executed for all open processes
- Final state persisted to immutable storage

Duration: Terminal state, no further transitions.

Exit: No exit, state irreversible. Restart requires new initialization state with new system instance.

## 3. Entry Conditions

### initialization Entry Conditions
Required:
- System cold start or restart command issued
- Previous state terminated or system first start
- Hardware and OS prerequisites satisfied
- Phase 16 audit ledger storage accessible
- Phase 8 governance policy file accessible

Forbidden:
- Entry from active state without intervening halted or terminated state
- Entry with corrupted Phase 16 audit ledger (blocks entry, triggers recovery procedure)
- Entry without governance policy file (blocks entry, requires manual intervention)

### idle Entry Conditions
Required:
- Successful initialization completion (all components initialized per Phase 10)
- Phase 16 audit ledger integrity verified
- Phase 19 guardrails activated
- Phase 12 operational mode GREEN
- Zero active Phase 35 sessions
- Zero Phase 53 execution graph in_progress nodes

Forbidden:
- Entry with component initialization failures (transitions to halted instead)
- Entry with audit ledger integrity failure (transitions to halted instead)
- Entry with active sessions (remains in active state)

### active Entry Conditions
Required:
- Current state idle or degraded
- Phase 35 session creation request with valid Phase 21 credentials
- Phase 52 validation passed for session creation event
- Phase 12 operational mode GREEN, YELLOW, or ORANGE
- Phase 10 critical components operational

Forbidden:
- Entry from halted state without governance restoration (halted state blocks session creation)
- Entry with BLACK operational mode (BLACK blocks user sessions)
- Entry without valid credentials (Phase 52 validation rejects)

### degraded Entry Conditions
Required:
- Phase 12 operational mode transition to YELLOW, ORANGE, or RED
- Phase 34 escalation event emitted
- Phase 38 governance notification delivered
- Degradation cause documented in Phase 22 incident if severity warrants

Automatic triggers:
- Component failure or degradation per Phase 10
- Phase 51 severity threshold exceeded per Phase 51 Section 6
- Phase 19 guardrail violation detected
- Resource exhaustion per Phase 14 hop limits

Forbidden:
- Entry without Phase 34 escalation event (escalation mandatory for degraded entry)
- Entry without Phase 38 governance notification (notification mandatory)

### halted Entry Conditions
Required:
- Phase 12 operational mode BLACK transition or critical failure
- All Phase 35 sessions termination initiated
- All Phase 53 execution graph in_progress nodes abort initiated per Phase 46
- Phase 38 critical alert delivered to governance
- Phase 22 incident created with severity 5 (Terminal)

Automatic triggers:
- BLACK mode transition per Phase 12
- Phase 15 adversarial pattern severity 5 detected
- Phase 16 audit ledger integrity violation detected
- Phase 30 ethical constraint violation detected
- Phase 19 guardrail critical violation
- Multiple component failures exceeding Phase 10 fault tolerance

Forbidden:
- Entry without governance notification (notification mandatory)
- Entry without incident creation (severity 5 incident mandatory)
- Entry with active execution graphs without abort (abort mandatory)

### terminated Entry Conditions
Required:
- Governance shutdown command with Phase 5 dual-approval
- Current state halted or degraded
- All Phase 35 sessions terminated
- All Phase 53 execution graphs halted or completed
- Phase 50 closure executed for all open processes
- Phase 16 audit ledger finalized and sealed

Governance authorization:
- Phase 8 governance-enrolled executive with dual-approval per Phase 5
- Shutdown justification documented
- Phase 49 accountability attribution recorded

Forbidden:
- Entry from active state without intervening halted (active state blocks direct termination)
- Entry without Phase 50 closure completion (open processes block termination)
- Entry without audit ledger finalization (incomplete audit blocks termination)

## 4. Exit Conditions

### Allowed Exits

#### initialization → idle
Allowed when:
- All component initialization successful per Phase 10
- Phase 16 audit ledger integrity verified
- Phase 19 guardrails activated
- Phase 8 governance policy loaded and validated
- Phase 30 ethical constraints verified

Transition trigger: Automatic upon initialization completion.

#### initialization → halted
Allowed when:
- Component initialization failure
- Audit ledger integrity failure
- Governance policy load failure
- Initialization timeout exceeded (60 seconds)

Transition trigger: Automatic upon initialization failure.

#### idle → active
Allowed when:
- Phase 35 session creation request received and validated
- Phase 52 validation passed

Transition trigger: Session creation event.

#### idle → degraded
Allowed when:
- Component degradation detected during idle
- Operational mode transition to YELLOW/ORANGE/RED

Transition trigger: Automatic upon degradation detection.

#### active → idle
Allowed when:
- All Phase 35 sessions terminated
- All Phase 53 execution graphs completed or halted
- Phase 12 operational mode GREEN

Transition trigger: Automatic upon last session termination and execution completion.

#### active → degraded
Allowed when:
- Operational mode transition to YELLOW/ORANGE/RED during active operations
- Component degradation during active operations

Transition trigger: Automatic upon degradation detection or mode transition.

#### active → halted
Allowed when:
- BLACK mode transition
- Critical failure during active operations
- Severity 5 incident created

Transition trigger: Automatic upon BLACK mode or critical failure.

#### degraded → active
Allowed when:
- Operational mode restored to GREEN or YELLOW
- Degraded components recovered per Phase 10
- Governance approval for restoration if RED mode degradation

Transition trigger: Automatic for GREEN/YELLOW restoration, governance command for RED restoration.

#### degraded → halted
Allowed when:
- Degradation escalates to BLACK mode
- Critical failure during degraded operations
- Multiple component failures exceed fault tolerance

Transition trigger: Automatic upon BLACK mode or critical failure.

#### halted → degraded
Allowed when:
- Governance restoration command issued with Phase 5 dual-approval
- Root cause resolution documented in Phase 22 incident
- Phase 48 review completed for halted incident
- Operational mode downgrade to RED approved by governance

Transition trigger: Governance restoration command after review.

#### halted → terminated
Allowed when:
- Governance shutdown command issued with Phase 5 dual-approval
- Unrecoverable failure confirmed
- Phase 50 closure prerequisites satisfied

Transition trigger: Governance shutdown command or automatic upon unrecoverable failure.

### Forbidden Exits

#### initialization → active
Forbidden. Initialization must transition to idle before accepting sessions.

#### initialization → terminated
Forbidden. Initialization failures transition to halted, not terminated directly.

#### idle → halted
Forbidden direct transition. Idle transitions to degraded before halted (except during idle if critical failure detected, then permitted).

#### active → terminated
Forbidden. Active state must transition to halted before termination.

#### degraded → idle
Forbidden. Degraded state must transition to active (if sessions active) or remain degraded until GREEN restoration permits idle.

#### degraded → terminated
Forbidden. Degraded state must transition to halted before termination.

#### terminated → any state
Forbidden. Terminated state irreversible, no exits permitted.

### Irreversible Exits

#### Any State → terminated
Irreversible once entered. System cannot exit terminated state. Restart requires new system instance starting from initialization.

#### halted → degraded (conditional irreversibility)
Reversible only via governance restoration command. Without governance intervention, halted state persists indefinitely (effectively irreversible).

## 5. State Transitions

### Valid Transitions

initialization → idle (normal initialization completion)
initialization → halted (initialization failure)
idle → active (session creation)
idle → degraded (component degradation during idle)
active → idle (session termination, execution completion)
active → degraded (operational mode escalation)
active → halted (BLACK mode or critical failure)
degraded → active (operational mode restoration)
degraded → halted (escalation to BLACK or critical failure)
halted → degraded (governance restoration)
halted → terminated (governance shutdown or unrecoverable failure)

### Invalid Transitions

initialization → active (must pass through idle)
initialization → degraded (must pass through idle or halted)
initialization → terminated (must pass through halted)
idle → halted (must pass through degraded except critical failure)
idle → terminated (must pass through halted)
active → terminated (must pass through halted)
degraded → idle (restoration proceeds through active or remains degraded)
degraded → terminated (must pass through halted)
degraded → initialization (no restart without termination)
halted → idle (must pass through degraded)
halted → active (must pass through degraded)
halted → initialization (no restart without termination)
terminated → any state (terminal state, no transitions)

### Emergency Transitions

#### Any State → halted (emergency halt)
Permitted from any state (except terminated) under critical conditions:
- Phase 15 adversarial pattern severity 5 detected
- Phase 16 audit ledger tampering detected
- Phase 30 ethical constraint violation
- Multiple simultaneous component failures
- Governance emergency halt command

Trigger: Automatic upon critical condition detection or governance emergency command with Phase 5 presence token.

#### halted → terminated (emergency shutdown)
Permitted when:
- Unrecoverable hardware failure
- Unrecoverable audit ledger corruption
- Governance emergency shutdown with dual-approval
- Safety-critical failure requiring immediate shutdown

Trigger: Automatic upon unrecoverable failure detection or governance emergency shutdown command.

Emergency transition logging: All emergency transitions logged to Phase 16 audit ledger with emergency_transition event type, causation documented, Phase 49 accountability attributed.

## 6. Authority Binding

### initialization State Transitions
Authority: System automatic (initialization completion) or governance manual intervention (initialization failure recovery).

initialization → idle: Automatic, no human authority required.

initialization → halted: Automatic upon failure, governance notified per Phase 38.

### idle State Transitions
Authority: System automatic or user session creation.

idle → active: User authority per Phase 32, Phase 35 session creation requires valid Phase 21 credentials.

idle → degraded: Automatic upon component degradation, no human authority required.

### active State Transitions
Authority: System automatic based on operational conditions.

active → idle: Automatic upon session termination and execution completion.

active → degraded: Automatic upon operational mode escalation, no human authority required (escalation per Phase 34 may involve supervisor/management).

active → halted: Automatic upon BLACK mode or critical failure, governance notified per Phase 38.

### degraded State Transitions
Authority: Governance or automatic escalation.

degraded → active: Automatic for GREEN/YELLOW restoration. Governance approval required for RED restoration (Phase 8 governance command, Phase 32 management/governance authority).

degraded → halted: Automatic upon BLACK mode or critical failure.

### halted State Transitions
Authority: Governance exclusive.

halted → degraded: Governance restoration command required, Phase 8 governance-enrolled executive with Phase 5 dual-approval for BLACK mode recovery.

halted → terminated: Governance shutdown command required, Phase 8 governance-enrolled executive with Phase 5 dual-approval. Automatic upon unrecoverable failure (governance notified).

### terminated State Transitions
Authority: None, terminal state.

No transitions permitted from terminated state.

### Emergency Transition Authority
Emergency transitions (any state → halted, halted → terminated) authorized by:
- Governance emergency command: Phase 8 governance-enrolled executive with Phase 5 presence token (dual-approval for BLACK/terminated).
- Automatic triggers: Phase 19 guardrails detect critical conditions, automatic emergency transition, governance notified immediately per Phase 38.

Emergency authority logging: All emergency transitions attributed per Phase 49, emergency authority source documented (governance credential or automatic trigger).

## 7. Failure States

### Recoverable States

#### degraded (YELLOW/ORANGE)
Recoverable via:
- Component recovery per Phase 10
- Operational mode restoration to GREEN per Phase 12
- Resource availability restoration per Phase 14

Recovery authority: Automatic upon condition resolution or supervisor/management approval per Phase 32.

Recovery prerequisites: Degradation cause resolved, Phase 48 review completed if required, governance approval if RED mode.

#### degraded (RED)
Recoverable via:
- Governance restoration command per Phase 8
- Root cause resolution documented in Phase 22 incident
- Phase 48 review completed
- Operational mode downgrade approved

Recovery authority: Governance-enrolled executive per Phase 32, dual-approval per Phase 5.

Recovery prerequisites: Incident resolution, review completion, governance approval.

#### halted (with recoverable root cause)
Recoverable via:
- Governance restoration command
- Root cause remediation completed
- Phase 48 review completed
- Operational mode downgrade to RED approved

Recovery authority: Governance-enrolled executive, dual-approval required.

Recovery prerequisites: Root cause remediation, review completion, governance restoration command with justification.

### Non-Recoverable States

#### terminated
Non-recoverable. System shutdown complete, no recovery path. Restart requires new system instance.

#### halted (with unrecoverable root cause)
Non-recoverable when:
- Audit ledger corruption unrecoverable
- Hardware failure unrecoverable
- Ethical constraint violation unrecoverable per Phase 30
- Multiple critical component failures exceed recovery capacity

Transition: Automatic or governance-commanded transition to terminated state.

### Containment-Only States

#### halted (pending governance decision)
Containment-only until governance decides recovery or termination:
- No user operations permitted
- Audit ledger write-only (append-only for incident documentation)
- Component isolation maximum per Phase 10
- No state modification except governance commands

Containment purpose: Preserve system state for Phase 48 review, prevent further damage, await governance restoration or shutdown decision.

Containment duration: Unbounded, persists until governance decision.

## 8. State Persistence

### State Storage Requirements

#### Current State Persistence
Current runtime state stored in:
- Persistent state store (database or equivalent)
- Phase 16 audit ledger (state transition events)
- Phase 12 operational mode record

Storage properties:
- State writes atomic (state transition completes or fails atomically)
- State writes synchronous to Phase 16 audit ledger (state transition logged before applied)
- State reads consistent (all components read consistent state view)

State fields persisted:
- current_state (initialization/idle/active/degraded/halted/terminated)
- state_entry_time (ISO 8601 timestamp)
- previous_state (for transition lineage)
- state_transition_event_id (Phase 51 event_id of transition event)
- operational_mode (Phase 12 mode at state entry)

#### State Transition History Persistence
All state transitions persisted in Phase 16 audit ledger:
- State transition events written to ledger per Phase 51 Event entity
- event_type: runtime_state_transition
- Payload includes: previous_state, new_state, transition_trigger, authority_id
- Immutable per Phase 16 append-only ledger

State transition history enables:
- Replay of state machine execution
- Audit of state transition decisions
- Root cause analysis for failures

### Crash Recovery Expectations

#### Recovery from initialization State Crash
Crash during initialization:
- System restarts from initialization state
- Previous initialization attempt logged as failed in Phase 16 audit ledger
- Initialization retry with new attempt_id

Recovery guarantee: Initialization idempotent, retry safe.

#### Recovery from idle State Crash
Crash during idle:
- System restarts from initialization state
- Previous idle state recovered after initialization completion
- No session state to recover (zero active sessions in idle)
- Audit ledger integrity verified during initialization

Recovery guarantee: Idle state fully recoverable, no data loss.

#### Recovery from active State Crash
Crash during active:
- System restarts from initialization state
- Active sessions terminated (crash terminates sessions per Phase 35)
- Phase 53 execution graphs in_progress nodes transition to aborted per Phase 46
- Session termination and execution abort events written to audit ledger post-recovery
- Users notified of crash and session termination per Phase 38

Recovery guarantee: Crash transitions active to initialization → idle (or degraded if crash cause persists). In-progress executions aborted, not resumed.

#### Recovery from degraded State Crash
Crash during degraded:
- System restarts from initialization state
- Degraded state cause evaluated during initialization
- If degraded cause persists: transitions to degraded after initialization
- If degraded cause resolved: transitions to idle after initialization
- Phase 22 incident for original degradation remains open, crash documented as incident update

Recovery guarantee: Degraded state cause persistence determines post-crash state. Incident continuity maintained.

#### Recovery from halted State Crash
Crash during halted:
- System restarts from initialization state
- Halted state cause evaluated during initialization
- Transitions to halted after initialization if halt cause persists
- Governance notified of crash during halted state per Phase 38
- Phase 48 review required before restoration

Recovery guarantee: Halted state persists across crash, governance intervention still required.

#### Recovery from terminated State Crash
Crash during terminated (incomplete shutdown):
- System does not restart automatically
- Manual intervention required to determine restart vs permanent shutdown
- Audit ledger finalized if possible, sealed per Phase 50
- Governance notified of incomplete termination

Recovery expectation: No automatic recovery, manual governance decision required.

### Replay Behavior

#### State Machine Replay from Audit Ledger
Replaying Phase 16 audit ledger events reconstructs state machine execution:
- State transition events replayed in entry_id order per Phase 51 Section 5
- State machine transitions deterministically based on transition events
- Current state reconstructed by applying all transition events sequentially

Replay determinism guarantee: Replaying audit ledger produces identical state transition sequence and final state.

#### State Validation During Replay
Replay validates state machine integrity:
- Each state transition validated against allowed transitions per Section 5
- Invalid transitions logged as state_machine_violation
- Entry/exit conditions validated per Sections 3 and 4
- Authority binding validated per Section 6

Replay validation failure: Indicates audit ledger corruption, tampering, or state machine implementation bug. Triggers governance alert per Phase 38.

#### Replay for Crash Recovery
Crash recovery uses replay to determine post-crash state:
- Audit ledger replayed from last finalized state
- In-progress transactions aborted (incomplete state transitions rolled back)
- Final consistent state determined from last completed state transition event
- Recovery transitions applied (session termination, execution abort)

Replay-based recovery guarantee: Post-crash state consistent with last completed state transition, in-progress state changes discarded.

## 9. Non-Claims

### Cannot: Guarantee Instantaneous State Transitions
State machine defines logical states but does not guarantee instantaneous physical state transitions. Transition latency depends on component performance, network latency, and audit ledger write latency.

### Cannot: Guarantee Zero Downtime
State machine permits degraded and halted states that reduce or eliminate availability. Does not guarantee continuous availability or zero-downtime operation.

### Cannot: Prevent All State Transition Races
State machine enforces transition rules but cannot prevent all race conditions between concurrent events triggering transitions. Phase 16 ledger write order establishes canonical transition sequence, but physical execution may experience transient inconsistency.

### Cannot: Guarantee Recovery from All Failures
State machine defines recovery paths for recoverable failures but cannot guarantee recovery from all failure modes. Non-recoverable states (terminated, halted with unrecoverable cause) have no recovery path.

### Cannot: Guarantee Optimal State Selection
State machine enforces valid states and transitions but does not guarantee optimal state selection for operational objectives (performance, availability, cost).

### Cannot: Prevent Governance Errors
State machine enforces governance authority for certain transitions but cannot prevent governance from issuing incorrect or harmful state transition commands.

### Cannot: Guarantee Real-Time Constraints
State machine defines state transitions but does not guarantee bounded transition time or real-time deadlines.

### Cannot: Prevent All Operational Errors
State machine enforces state transition rules but cannot prevent operational errors within permitted states (e.g., authorized but inappropriate actions during active state).

### Cannot: Guarantee State Observability
State machine persists state transitions to audit ledger but does not guarantee real-time observability of current state to all actors (observability subject to Phase 33 visibility boundaries).

### Cannot: Prevent External Failures
State machine manages internal system state but cannot prevent external failures (network, hardware, power) that may force state transitions.

END OF FILE
