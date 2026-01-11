# PHASE 27: FIRST BUILD SPRINT: TASK LIST & ORDER

## 1. Sprint Goal

The sprint goal is to produce a localhost-bound process that serves a visible public website and authenticated dashboard using pre-generated seed data with strictly read-only behavior.

The sprint must deliver all pages defined in Phase 24 rendered in a browser with navigation, risk state displays, and metric visualizations functioning under demo mode constraints.

The sprint must enforce read-only guarantees at data contract, API boundary, and UI component levels with all write-capable controls visibly disabled.

Success is measured by ability to navigate all defined pages without errors and observe simulated system state through dashboard surfaces.

## 2. Definition of Done (visible demo)

The demo is done when the public landing page loads successfully at localhost address in a browser.

The demo is done when all six dashboard pages render with pre-loaded seed data displaying charts, tables, and risk indicators.

The demo is done when navigation between all pages completes without console errors or broken asset references.

The demo is done when disabled controls display with visual indicators and tooltips explaining demo constraints.

The demo is done when demo mode banner appears persistently on all pages indicating simulated data and disabled production capability.

The demo is done when the process can be stopped and restarted cleanly without manual cleanup or state corruption.

## 3. Task Order (Task 1 → Task N)

Task 1: Create repository folder structure matching Phase 25 specification with all required directories.

Task 2: Generate seed data files conforming to Phase 4 schema for metrics, audit logs, and guardrail evaluations.

Task 3: Implement read-only data contracts and validation logic for all seed data structures.

Task 4: Implement minimal server process with localhost binding and static file serving capability.

Task 5: Implement public website pages with static content for landing, status, documentation index, and contact pages.

Task 6: Implement dashboard overview page with metric summary cards and risk state indicator.

Task 7: Implement dashboard metrics page with time-series chart rendering from seeded event data.

Task 8: Implement dashboard guardrails page with table of evaluation results and violation history.

Task 9: Implement dashboard governance page with authority status and override audit trail.

Task 10: Implement dashboard audit log page with paginated, filterable entry display.

Task 11: Implement dashboard system health page with heartbeat status and resource indicators.

Task 12: Implement auth simulation with fixed operator identity and role assignment.

Task 13: Implement navigation routing between all public and dashboard pages.

Task 14: Implement demo mode banner and disabled control rendering with tooltips.

Task 15: Implement startup validation and console output for demo mode activation confirmation.

## 4. Task Inputs (which phase files govern each task)

Task 1 inputs: Phase 25 repository structure section.

Task 2 inputs: Phase 4 event schema definitions and Phase 23 data seeding constraints.

Task 3 inputs: Phase 25 read-only data contracts and Phase 4 schema requirements.

Task 4 inputs: Phase 26 minimum runtime preconditions and Phase 23 demo activation rules.

Task 5 inputs: Phase 24 public website pages minimum set.

Task 6 through 11 inputs: Phase 24 authenticated dashboard pages minimum set and Phase 24 risk state display rules.

Task 12 inputs: Phase 26 auth simulation rules and Phase 24 role-based visibility boundaries.

Task 13 inputs: Phase 24 demo navigation rules and Phase 26 expected pages list.

Task 14 inputs: Phase 24 disabled controls requirements and Phase 23 demo mode guarantees.

Task 15 inputs: Phase 26 demo-only startup order and Phase 23 demo state transitions.

## 5. Task Output Artifacts (what must exist after each task)

Task 1 output: Repository root with configuration, public, dashboard, data, server, docs, and scripts folders created.

Task 2 output: Seed data files in data folder containing valid metric events, audit entries, and guardrail evaluation results.

Task 3 output: Data contract definitions with schema validation functions and immutability guarantees.

Task 4 output: Server process capable of binding to localhost and responding to GET requests for static files.

Task 5 output: Static files for landing, status, documentation index, and contact pages loadable via localhost URLs.

Task 6 through 11 output: Dashboard page files rendering respective content sections with seed data integration.

Task 12 output: Auth simulation logic bypassing credential validation and establishing fixed operator context.

Task 13 output: Navigation elements on all pages enabling traversal between public and dashboard surfaces.

Task 14 output: Demo banner component and disabled control styling with tooltip implementation.

Task 15 output: Startup script with validation checks and console output displaying demo mode confirmation and localhost URL.

## 6. Anti-Duplication Rules (how to avoid duplicate folders/files)

Before creating any folder, verify it does not already exist in the repository root to prevent structure duplication.

Before creating any seed data file, check the data folder for existing files with matching schema types to avoid redundant generation.

Before creating any page file, verify no existing file serves the same UI surface to prevent navigation conflicts.

All data contract definitions must reside in a single shared location to prevent schema version drift across components.

All navigation routing logic must be centralized to prevent duplicate path definitions or conflicting route handlers.

All auth simulation logic must be isolated to a single module to prevent inconsistent operator identity handling.

## 7. Crash Prevention Rules (what must be defensive)

All seed data loading must validate file existence and schema compliance before proceeding with server initialization.

All page rendering must handle missing or empty seed data arrays with graceful fallback to empty state displays.

All chart rendering must validate time-series data structure before attempting visualization to prevent undefined access errors.

All navigation routing must return explicit error responses for unmatched paths rather than allowing server crashes.

All file system access must use absolute paths derived from known repository root to prevent path resolution failures.

All localhost binding must detect port conflicts and fail startup cleanly with diagnostic output rather than hanging indefinitely.

All request handling must enforce GET-only restriction with explicit rejection of other HTTP methods.

## 8. Demo Validation Checklist

Validation must confirm localhost server starts successfully and emits console output with URL and demo mode confirmation.

Validation must confirm public landing page loads in browser without errors and displays system purpose content.

Validation must confirm all six dashboard pages load and display seed data in charts, tables, and indicators.

Validation must confirm navigation links work across all pages without broken references or missing assets.

Validation must confirm demo mode banner appears on all pages with correct messaging.

Validation must confirm all disabled controls display with visual indicators and tooltips.

Validation must confirm risk state displays show GREEN, YELLOW, RED, or BLACK based on seeded guardrail evaluation data.

Validation must confirm audit log page renders entries in reverse chronological order with correct timestamp formatting.

Validation must confirm process termination responds immediately to stop signal and releases localhost port.

Validation must confirm process restart succeeds with fresh seed data load and clean initialization.

## 9. Hard Stop Conditions

Development must stop immediately if any task introduces database drivers, ORM frameworks, or persistence layer abstractions.

Development must stop immediately if any task introduces external API clients or third-party service integrations.

Development must stop immediately if any task introduces write-capable endpoints, mutation APIs, or state modification handlers.

Development must stop immediately if any task introduces authentication providers, OAuth flows, or credential validation logic.

Development must stop immediately if any task violates read-only guarantees defined in Phase 24 or Phase 25.

Development must stop immediately if any task introduces network exposure beyond localhost binding.

Development must stop immediately if any task introduces production execution logic contradicting Phase 23 demo constraints.

## 10. WHAT THIS SPRINT WILL NOT BUILD (BY DESIGN)

This sprint will not build production authentication, authorization, or access control mechanisms.

This sprint will not build database connectivity, query builders, or data persistence layers.

This sprint will not build external API integration, service mesh communication, or distributed system coordination.

This sprint will not build write-capable forms, state mutation endpoints, or action dispatch handlers.

This sprint will not build real-time data streaming, WebSocket connections, or server-sent event mechanisms.

This sprint will not build background job processors, scheduled task runners, or asynchronous work queues.

This sprint will not build metrics export, telemetry shipping, or observability backend integration.

This sprint will not build automated testing infrastructure, CI/CD pipelines, or deployment automation.

This sprint will not build multi-tenancy, workspace isolation, or data partitioning logic.

This sprint will not build user preference storage, session persistence, or stateful interaction tracking.

This sprint will not build production-grade error handling, retry logic, or resilience patterns.

This sprint will not build feature flags, configuration management, or environment-specific behavior switching.

END OF FILE
