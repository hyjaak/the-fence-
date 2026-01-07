# THE FENCE — Phase 53: Execution Graph Model

## 1. Purpose
Define how system actions are structured as an execution graph rather than linear commands.

## 2. Execution Nodes

### Action Node
Represents executable operation with defined inputs, outputs, and side effects.

Properties:
- node_id (unique identifier, UUIDv7)
- node_type: action
- action_type (from Phase 36 action taxonomy)
- actor_id (executing actor per Phase 51)
- required_authority (Phase 32 authority class)
- required_consent (Phase 20 consent_id if consent-dependent)
- required_presence (Phase 5 presence_token_id if presence-required)
- execution_state (pending/in_progress/completed/failed/aborted)
- execution_start_time (ISO 8601 timestamp, null if pending)
- execution_end_time (ISO 8601 timestamp, null if not completed)
- parent_decision_id (Phase 40 decision that authorized this action)

Execution semantics:
- Action node executes only after all incoming edges satisfied
- Execution atomic: node either completes or fails, no partial execution
- State transitions: pending → in_progress → (completed | failed | aborted)
- Failed/aborted states terminal, no retry within same node

### Validation Node
Represents pre-execution validation gate per Phase 52.

Properties:
- node_id (unique identifier, UUIDv7)
- node_type: validation
- validation_stage (structural/schema/authority/consent/temporal/duplication/risk per Phase 52 Section 3)
- validation_target (action node or decision node being validated)
- validation_state (pending/validating/passed/failed)
- validation_outcome (validation result per Phase 52 Section 4: accept/hard_reject/quarantine/downgrade/defer/escalate)
- validation_time (ISO 8601 timestamp)

Execution semantics:
- Validation node executes before target node per Section 4 gate dependencies
- Validation failure blocks target node execution
- Validation outcome immutable once recorded per Phase 52 Section 10
- All validation stages per Phase 52 Section 3 required in order

### Decision Node
Represents decision point requiring authority approval per Phase 40.

Properties:
- node_id (unique identifier, UUIDv7)
- node_type: decision
- decision_id (Phase 40 decision identifier)
- decision_class (Phase 32 decision class)
- decision_state (proposed/pending_approval/finalized/rejected)
- required_approvals (Phase 5 approval structure)
- approval_count (current approval count)
- finalization_time (ISO 8601 timestamp, null if not finalized)

Execution semantics:
- Decision node blocks downstream action nodes until finalized per Phase 40
- Rejection transitions to halt node per Section 3.4
- Finalization enables outgoing edges to action nodes
- Pending state persists until approval requirements satisfied per Phase 40 Section 2.4

### Halt Node
Represents execution termination point.

Properties:
- node_id (unique identifier, UUIDv7)
- node_type: halt
- halt_reason (validation_failure/decision_rejection/execution_failure/abort_signal/governance_override)
- halt_time (ISO 8601 timestamp)
- halted_execution_path (list of node_ids halted)

Execution semantics:
- Halt node terminates all downstream execution
- Halt irreversible, no resume after halt
- Halt propagates to all reachable downstream nodes per Section 5
- Halt logged to Phase 16 audit ledger with halt reason

### Rollback Node
Represents compensating action to undo prior execution.

Properties:
- node_id (unique identifier, UUIDv7)
- node_type: rollback
- rollback_target (action node being rolled back)
- rollback_action_type (compensating action type)
- rollback_state (pending/in_progress/completed/failed)
- rollback_time (ISO 8601 timestamp)

Execution semantics:
- Rollback node executes compensating action for completed action node
- Rollback does not modify original action node state (immutable per Phase 47)
- Rollback failure transitions to halt node, escalation to governance
- Rollback limited to actions with defined compensating operations, not all actions rollback-capable

## 3. Edge Rules

### Allowed Transitions

#### Validation → Action
Edge from validation node to action node permitted when:
- Validation node validation_outcome = accept or downgrade
- Action node is validation_target of validation node
- All validation stages passed per Phase 52 Section 3

Transition semantics: Action node execution enabled after validation passes.

#### Decision → Action
Edge from decision node to action node permitted when:
- Decision node decision_state = finalized
- Action node authorized by decision per Phase 40
- Decision authority sufficient for action per Phase 32

Transition semantics: Action node execution enabled after decision finalized.

#### Action → Action
Edge from action node to action node permitted when:
- Source action node execution_state = completed
- Dependency ordering satisfied per Phase 36
- No circular dependencies present

Transition semantics: Downstream action executes after upstream action completes.

#### Action → Validation
Edge from action node to validation node permitted when:
- Action produces output requiring validation
- Validation node validation_target references downstream action dependent on source action output

Transition semantics: Action completion triggers validation of dependent action.

#### Validation → Halt
Edge from validation node to halt node required when:
- Validation node validation_outcome = hard_reject or quarantine
- Phase 52 Section 9 blocking rules require halt

Transition semantics: Validation failure immediately halts execution path.

#### Decision → Halt
Edge from decision node to halt node required when:
- Decision node decision_state = rejected
- Phase 40 rejection rules apply

Transition semantics: Decision rejection halts all downstream actions.

#### Action → Rollback
Edge from action node to rollback node permitted when:
- Action node execution_state = failed or aborted
- Rollback capability defined for action_type
- Rollback authorization satisfied per Phase 32

Transition semantics: Action failure triggers rollback path if rollback defined.

### Forbidden Transitions

#### Halt → Any Node
No outgoing edges permitted from halt node. Halt terminal.

#### Rollback → Original Action
No edge from rollback node to original action node (no automatic retry after rollback). Retry requires new execution graph.

#### Action (failed) → Action (new)
No edge from failed action node to new action node without intervening decision node or halt node. Failure requires explicit authority decision.

#### Validation (failed) → Action
No edge from failed validation node to action node. Validation failure must route to halt node per Phase 52 Section 9.

#### Circular Edges
No edges creating cycles in execution graph. Graph must be directed acyclic graph (DAG).

### Irreversible Edges

#### Validation (passed) → Action
Edge irreversible once traversed. Validation outcome immutable per Phase 52 Section 10, cannot re-validate to block action already started.

#### Decision (finalized) → Action
Edge irreversible once traversed. Decision finalization immutable per Phase 40 Section 4.1, cannot unfinalize to block action already started.

#### Action (completed) → Downstream
Edge irreversible once traversed. Completed action state immutable per Phase 47, cannot undo completion to prevent downstream execution.

Irreversibility enforcement: Traversed edges recorded in Phase 16 audit ledger, state transitions immutable, no edge reversal permitted.

### Conditional Edges

#### Conditional on Validation Outcome
Edge enabled conditionally based on Phase 52 validation outcome:
- If validation_outcome = accept: enable edge to action node
- If validation_outcome = hard_reject: enable edge to halt node
- If validation_outcome = downgrade: enable edge to action node with reduced scope
- If validation_outcome = escalate: enable edge to decision node for elevated approval

Condition evaluation: Phase 52 validation pipeline determines outcome, edge selection deterministic based on outcome.

#### Conditional on Decision State
Edge enabled conditionally based on Phase 40 decision state:
- If decision_state = finalized: enable edge to action node
- If decision_state = rejected: enable edge to halt node
- If decision_state = pending: no edge enabled, wait for state transition

Condition evaluation: Decision finalization or rejection determines edge selection.

#### Conditional on Execution Outcome
Edge enabled conditionally based on action execution outcome:
- If execution_state = completed: enable edge to downstream action node
- If execution_state = failed: enable edge to rollback node or halt node
- If execution_state = aborted: enable edge to halt node

Condition evaluation: Action execution completion or failure determines edge selection.

## 4. Gate Dependencies

### Phase 52 Validation Outcome Dependencies
Action node execution gated on Phase 52 validation outcome:
- All validation stages per Phase 52 Section 3 must complete
- Validation outcome must be accept or downgrade per Section 3.1
- hard_reject, quarantine outcomes block action execution
- defer outcome delays action execution pending retry
- escalate outcome gates action on elevated decision approval

Gate enforcement: Validation node must reach terminal state (passed/failed) before action node execution permitted. Pending validation state blocks action.

### Authority Check Dependencies
Action node execution gated on Phase 32 authority verification:
- Actor authority class must satisfy action required_authority
- Credential signature valid per Phase 21
- Non-delegable constraints satisfied per Phase 51 Section 7
- Authority not expired per Phase 35 session management

Gate enforcement: Authority validation performed during Phase 52 validation stage 3. Authority violation blocks action execution.

### Consent Presence Dependencies
Action node execution gated on Phase 20 consent and Phase 5 presence:
- If action requires consent: consent_id valid, not expired, not revoked, scope covers action
- If action requires presence: presence_token_id valid, not expired, issuance within threshold
- Consent holder and presence actor identity verified

Gate enforcement: Consent and presence validation performed during Phase 52 validation stage 4. Violation blocks action execution.

### System State Dependencies
Action node execution gated on Phase 12 operational mode and Phase 10 component state:
- Operational mode permits action severity per Phase 51 Section 6
- Required components operational per Phase 10 isolation boundaries
- Resource availability per Phase 14 hop limits
- No conflicting actions in progress per Phase 19 guardrails

Gate enforcement: System state validated during Phase 52 validation stage 7 (risk & escalation threshold validation). Violation blocks or escalates action.

## 5. Failure Propagation

### Stop Downstream Execution
Failure propagates to stop downstream execution:
- Action node failure sets execution_state = failed, blocks all outgoing edges to downstream action nodes
- Validation node failure (validation_outcome = hard_reject) blocks target action node, halts all downstream nodes reachable from target
- Decision node rejection (decision_state = rejected) blocks all downstream action nodes authorized by decision
- Halt node reached: all downstream nodes reachable from halt node transition to halted state

Propagation algorithm: Breadth-first traversal from failed/halted node, mark all reachable downstream nodes as halted, prevent execution of halted nodes.

### Trigger Rollback
Failure triggers rollback when:
- Action node execution_state = failed and rollback capability exists for action_type
- Rollback authorization satisfied (authority class permits rollback per Phase 32)
- Upstream actions completed and rollback-capable

Rollback initiation: Failed action node enables edge to rollback node, rollback node executes compensating action per Section 2.5. Rollback failure escalates to halt.

### Trigger Containment
Failure triggers containment when:
- Failure severity below escalation threshold but above informational
- Phase 10 component isolation permits containment within boundary
- Failure does not propagate beyond isolation boundary

Containment enforcement: Failed action node within isolated component does not propagate failure to actions in other components. Isolation boundary per Phase 10 prevents cross-boundary failure propagation. Contained failure logged, downstream execution within same component halted, other components continue.

### Trigger Escalation
Failure triggers escalation when:
- Failure severity exceeds Phase 51 Section 6 threshold for current operational mode
- Multiple failures accumulate to escalation threshold per Phase 34
- Critical component failure per Phase 10
- RED/BLACK action failure requires governance intervention

Escalation initiation: Failed action node generates escalation event per Phase 34, escalation routed to higher authority per Phase 34 escalation paths. Escalation may enable rollback, halt, or governance override per elevated authority decision.

## 6. Determinism Guarantees

### Ordering Guarantees
Execution graph guarantees deterministic ordering:
- Nodes with no incoming edges (root nodes) execute first
- Node executes only after all incoming edge source nodes reach terminal state
- Topological sort order deterministic for DAG
- Concurrent independent nodes execute in ledger_time order per Phase 51 Section 5

Ordering enforcement: Execution scheduler maintains dependency graph, executes nodes in topological order, resolves ties via ledger_time.

### Replay Behavior
Execution graph guarantees deterministic replay:
- Replaying events in Phase 16 audit ledger entry_id order reconstructs identical execution graph
- Node execution outcomes deterministic given input state and event sequence
- Conditional edge selection deterministic based on recorded validation outcomes and decision states
- Failure propagation deterministic based on graph topology and failure modes

Replay enforcement: Graph construction from audit ledger events, edge traversal from recorded state transitions, no non-deterministic operations permitted in node execution.

### Race Condition Prevention
Execution graph prevents race conditions:
- No concurrent modification of shared state by independent nodes
- Phase 10 component isolation enforces serialization within component
- Cross-component dependencies explicit via edges, no implicit coupling
- Ledger write order establishes canonical event ordering per Phase 51 Section 5

Race prevention enforcement: Concurrent nodes operate on disjoint state partitions, shared state modifications serialized via ledger write order, optimistic concurrency control detects conflicts, conflicts escalate to halt.

## 7. Non-Execution Guarantees

### Actions Prohibited Under All Conditions
System cannot execute:
- Actions without Phase 52 validation passed outcome
- Actions without Phase 40 decision authorization
- Actions without required Phase 5 presence token for RED/BLACK severity
- Actions without required Phase 20 consent
- Actions violating Phase 30 ethical constraints
- Actions from actors without Phase 32 authority
- Actions creating cycles in execution graph (DAG violation)
- Actions after halt node reached in execution path
- Actions modifying Phase 16 audit ledger entries (append-only)
- Actions modifying Phase 47 terminal state (immutable)
- Actions modifying Phase 49 accountability attribution (immutable)
- Actions modifying Phase 50 sealed states (immutable)

Prohibition enforcement: Phase 52 validation pipeline blocks prohibited actions at validation stage. Prohibited action attempts logged as Phase 15 adversarial patterns, trigger governance alert.

### Actions Prohibited Without Governance Override
System cannot execute without explicit governance command per Phase 8:
- BLACK mode operational transitions
- Phase 30 ethical constraint modifications
- Phase 19 guardrail disablement
- Phase 16 audit ledger component modification
- Phase 8 governance policy core modifications
- Cross-boundary actions violating Phase 10 isolation during RED/BLACK mode

Governance override requirement: Governance command event per Phase 8 required, governance command itself passes through Phase 52 validation pipeline, dual-approval per Phase 5 required for BLACK actions.

### Actions Prohibited After Closure
System cannot execute after Phase 50 closure:
- Actions on closed decisions (decision_id referenced in closed state)
- Actions on closed incidents (incident_id referenced in closed state)
- Actions on closed sessions (session_id referenced in closed state)
- Modifications to Phase 50 sealed state records

Closure enforcement: Phase 50 closure check performed during Phase 52 validation stage 2 (schema compliance). Closed state referenced in action results in hard_reject.

## 8. Auditability

### Node Execution Logging
Every node execution logged to Phase 16 audit ledger:
- Node creation: node_id, node_type, dependencies, required gates logged
- Node state transitions: pending → in_progress, in_progress → completed/failed/aborted logged with timestamps
- Node completion: execution outcome, outputs, side effects logged
- Node failure: failure reason, failure class per Phase 45, failure propagation logged

Logging enforcement: Node state transitions generate Phase 51 Event entities, written to audit ledger before state change applied, immutable per Phase 16.

### Edge Traversal Logging
Every edge traversal logged to Phase 16 audit ledger:
- Edge creation: source node_id, target node_id, edge condition logged
- Edge enablement: condition satisfied, edge enabled logged with timestamp
- Edge traversal: edge traversed, target node execution initiated logged
- Edge blocking: condition failed, edge blocked, reason logged

Logging enforcement: Edge state changes generate Phase 51 Event entities, written to audit ledger, edge traversal correlation_id links source and target node events.

### Halts and Reversals Logging
Every halt and rollback logged to Phase 16 audit ledger:
- Halt node reached: halt_reason, halted execution path (list of halted node_ids) logged
- Downstream propagation: each halted node logged separately with causation_id referencing halt node
- Rollback initiation: rollback_target, rollback_action_type, authorization logged
- Rollback completion: rollback outcome, compensating action effects logged
- Rollback failure: rollback failure reason, escalation to governance logged

Logging enforcement: Halt and rollback events written to audit ledger, immutable, full lineage from original action to halt/rollback preserved via causation_id chain.

### Graph Topology Logging
Execution graph topology logged to Phase 16 audit ledger:
- Graph construction: nodes and edges logged as graph_construction events
- Graph validation: DAG validation outcome, cycle detection results logged
- Graph optimization: topological sort order logged (deterministic execution order)
- Graph completion: final graph state with all node outcomes logged

Logging enforcement: Graph topology enables replay and verification, graph structure immutable once logged, modifications require new graph construction with new trace_id.

## 9. Non-Claims

### Cannot: Guarantee Action Success
Execution graph structure does not guarantee action execution success, only that actions execute in valid order with required authorization and validation.

### Cannot: Guarantee Optimal Execution
Execution graph enforces dependencies and constraints but does not guarantee optimal execution order, resource utilization, or performance.

### Cannot: Prevent All Authorization Misuse
Execution graph enforces Phase 32 authority boundaries but cannot prevent authorized actors from executing valid but inappropriate actions within their authority.

### Cannot: Guarantee Rollback Success
Execution graph enables rollback for rollback-capable actions but does not guarantee rollback success or complete state restoration.

### Cannot: Prevent External Failures
Execution graph manages internal system execution but cannot prevent external system failures, network failures, or environmental failures.

### Cannot: Guarantee Real-Time Execution
Execution graph guarantees ordering but does not guarantee bounded execution time, real-time deadlines, or latency constraints.

### Cannot: Detect All Cycles
Execution graph validates DAG structure at construction but cannot detect all semantic cycles created via external state dependencies.

### Cannot: Guarantee Complete Failure Isolation
Execution graph propagates failures per Phase 10 isolation boundaries but cannot guarantee complete failure isolation for all failure modes.

### Cannot: Guarantee Determinism with External Dependencies
Execution graph guarantees determinism for internal operations but cannot guarantee determinism when actions depend on external non-deterministic systems.

### Cannot: Prevent Governance Errors
Execution graph enforces governance commands that pass validation but cannot prevent governance from authorizing incorrect or harmful execution graphs.

END OF FILE
