# PHASE 24: MVP WEBSITE & DASHBOARD SURFACES

## 1. Surface Purpose & Scope

The website and dashboard surfaces provide human-readable access to system state, execution posture, governance status, and observability metrics without enabling control actions or state mutation.

The public website surface exists to communicate system purpose, architectural principles, and operational transparency to external observers.

The authenticated dashboard surface exists to provide authorized operators with real-time visibility into metric flows, decision hops, guardrail evaluations, and execution continuity.

All surfaces must enforce strict read-only guarantees consistent with Phase 23 demo constraints and Phase 1 doctrine.

## 2. Public Website Pages (minimum set)

The public website must include a landing page describing system purpose and operational doctrine.

The public website must include a status page displaying current execution posture and top-level health indicators.

The public website must include a documentation index linking to governance models, technical requirements, and phase definitions.

The public website must include a contact page with operator-of-record information and escalation paths.

No public pages may expose internal execution details, metric payloads, or decision logic.

## 3. Authenticated Dashboard Pages (minimum set)

The authenticated dashboard must include an overview page displaying current execution state and aggregate metric summary.

The authenticated dashboard must include a metrics page rendering time-series visualizations of ingested events and processed decision hops.

The authenticated dashboard must include a guardrails page listing active guardrail checks, evaluation results, and violation history.

The authenticated dashboard must include a governance page displaying active authorities, override audit trail, and continuity attestations.

The authenticated dashboard must include an audit log page with filterable access to execution events, state transitions, and operator actions.

The authenticated dashboard must include a system health page showing heartbeat status, liveness indicators, and resource utilization.

## 4. Role-Based Visibility Boundaries

Unauthenticated visitors may access only public website pages with no dashboard visibility.

Authenticated operators may access all dashboard pages subject to role-based field-level filtering.

Read-only observer roles must see all metric and audit data but no control interfaces.

Operator roles must see all data plus disabled control interfaces that indicate capability boundaries.

Emergency authority roles must see all data plus active emergency containment status and override audit trail.

No role may access raw configuration files, credential stores, or internal system code through UI surfaces.

## 5. Read-Only Guarantees (what is view-only)

All metric time-series charts, graphs, and aggregations are strictly view-only with no drill-down mutation capability.

All audit log displays are strictly view-only with no deletion, redaction, or modification capability.

All execution state summaries are strictly view-only with no inline editing or state override capability.

All governance status displays are strictly view-only with no authority grant or revocation capability.

All guardrail evaluation results are strictly view-only with no threshold adjustment or rule modification capability.

All system health indicators are strictly view-only with no restart, pause, or configuration change capability.

## 6. Disabled/Locked Controls (what must not be clickable)

All action buttons, command inputs, and execution triggers must be visibly disabled with tooltip explanations.

All configuration editors, threshold sliders, and parameter inputs must be locked in read-only state.

All authority override controls must be disabled outside of emergency authority mode as defined in execution phases.

All external integration controls must be disabled consistent with Phase 23 demo constraints.

All batch action selectors, bulk operations, and multi-entity commands must be non-functional.

All navigation elements leading to non-existent or out-of-scope features must be hidden or display not-implemented notices.

## 7. Risk State Display Rules (GREEN/YELLOW/RED/BLACK)

GREEN state indicates all guardrails passing, no violations, and nominal execution posture.

YELLOW state indicates minor threshold crossings or early warning signals requiring operator attention but not blocking execution.

RED state indicates critical violations, safety envelope breaches, or governance failures requiring immediate intervention.

BLACK state indicates catastrophic failure, emergency shutdown, or total loss of continuity requiring external recovery authority.

Risk state must be computed from guardrail evaluation results and execution state invariants as defined in prior phases.

Risk state must be displayed prominently on all dashboard pages with timestamp of last evaluation.

Color-coding must be accessible with text labels and iconography for color-blind users.

## 8. Audit/History View Rules

Audit log displays must present events in reverse chronological order by default with optional filtering by event type, severity, and time range.

Each audit entry must include timestamp, event type, operator identity, affected entity, and outcome status.

Audit log pagination must enforce maximum page size to prevent resource exhaustion and maintain UI responsiveness.

Historical state views must clearly label snapshot timestamps and indicate staleness relative to current execution time.

No audit log entry may be deleted, modified, or hidden through UI interaction.

Audit export functionality must be disabled in demo mode consistent with Phase 23 constraints.

## 9. Demo Navigation Rules

Demo mode must display a persistent banner on all pages indicating simulated data and disabled production capability.

Demo navigation must allow free traversal between all defined dashboard pages without state-dependent lockouts.

Demo mode must disable all authentication flows and simulate a fixed operator identity for UI testing purposes.

Demo navigation must not persist user preferences, session state, or interaction history beyond process lifetime.

Demo mode exit must be accessible from all pages and must trigger immediate shutdown as defined in Phase 23.

## 10. WHAT THE UI WILL NOT ALLOW (BY DESIGN)

The UI will not allow triggering of production execution, decision enforcement, or action dispatch.

The UI will not allow modification of guardrail thresholds, governance policies, or safety envelope parameters.

The UI will not allow creation, deletion, or modification of audit log entries.

The UI will not allow granting or revoking operator roles, authorities, or permissions.

The UI will not allow direct interaction with external services, databases, or third-party integrations.

The UI will not allow upload of arbitrary files, scripts, or configuration payloads.

The UI will not allow export of sensitive data, credentials, or internal system state outside demo constraints.

The UI will not allow simulation of emergency scenarios, failure injection, or adversarial testing.

The UI will not allow bypassing of authentication, authorization, or role-based access control in non-demo modes.

The UI will not allow real-time editing of metric thresholds, alert rules, or notification targets.

The UI will not allow manual state transitions, checkpoint manipulation, or continuity override.

The UI will not allow access to raw system logs, debug interfaces, or internal diagnostic tools.

END OF FILE
