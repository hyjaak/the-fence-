# PHASE 26: LOCAL RUN + FIRST VISIBLE DASHBOARD PLAN

## 1. Visibility Goal (what "visible" means)

Visibility means a browser window successfully loads and renders the public website landing page at localhost address.

Visibility means the dashboard overview page displays metric charts, risk state indicators, and system health status using pre-loaded seed data.

Visibility means navigation between all defined public and dashboard pages completes without console errors, blank screens, or loading failures.

Visibility means all disabled controls display with appropriate visual indicators and tooltip explanations of demo constraints.

Visibility does not require pixel-perfect styling, production-grade performance, or feature completeness beyond minimal functional rendering.

## 2. Minimum Runtime Preconditions

Seed data files must exist in the designated data folder with valid schema conforming to Phase 4 definitions.

All static assets required for page rendering must be present and accessible from the public and dashboard folders.

The localhost network interface must be available with designated port unoccupied by other processes.

Process execution environment must support file system read access to repository root and all subdirectories.

No external network connectivity, database connections, or third-party service availability is required.

## 3. Demo-Only Startup Order

Startup must first validate presence and readability of all required seed data files before initializing any server components.

Startup must load seed data into read-only memory structures with validation of schema compliance and provenance markers.

Startup must initialize request router with static path mappings for all defined public and dashboard pages.

Startup must bind to localhost interface on designated port and begin accepting HTTP GET requests only.

Startup must emit console output confirming demo mode activation, seed data load completion, and localhost URL for browser access.

Startup must complete all initialization steps before accepting first request to ensure deterministic behavior.

## 4. Mock Data Availability Rules

All mock data must be loaded exactly once at startup with no reload, refresh, or dynamic update capability during runtime.

Mock metric events must be pre-sorted by timestamp to enable time-series rendering without runtime sorting overhead.

Mock audit entries must be indexed by event type and timestamp to support filtered view rendering without database query logic.

Mock guardrail evaluations must include pre-computed risk state derivations to avoid runtime evaluation logic.

Missing or corrupted seed data files must trigger immediate startup failure with clear diagnostic output before server binding.

Mock data must remain immutable in memory throughout process lifetime with no mutation methods or state update operations.

## 5. Auth Simulation (view-only)

Auth simulation must bypass all credential checks and immediately establish a fixed operator identity upon any dashboard page request.

The simulated operator identity must carry a hardcoded role assignment matching observer or operator role as defined in Phase 24.

No login page, authentication form, or credential prompt may be rendered in demo mode.

Session state must exist only as in-memory flag with no cookie generation, token storage, or cross-request persistence.

All dashboard pages must render immediately upon request with simulated auth context injected at initialization.

Auth simulation must display persistent banner on all pages indicating disabled security and demo-only operation.

## 6. Expected Pages That Must Render

The public landing page must render with system purpose description and operational doctrine summary.

The public status page must render with current execution posture derived from seed data state snapshot.

The dashboard overview page must render with metric summary cards and aggregated risk state indicator.

The dashboard metrics page must render with time-series charts plotting seeded metric events over simulated time range.

The dashboard guardrails page must render with table of guardrail checks, evaluation results, and violation history from seed data.

The dashboard audit log page must render with paginated list of seeded audit entries in reverse chronological order.

All pages must render without JavaScript errors, missing assets, or failed resource loads visible in browser console.

## 7. Troubleshooting Boundaries (what to check first)

If no pages render, verify localhost binding succeeded and designated port is accessible via browser URL bar.

If landing page renders but dashboard pages fail, verify seed data loaded successfully and auth simulation initialized.

If pages render but display no data, verify seed data files contain valid entries and schema validation passed.

If charts fail to render, verify time-series seed data contains sufficient events with valid timestamp ordering.

If navigation fails, verify request router initialized with all defined page path mappings.

If browser console shows errors, verify all static assets exist in expected folder locations and are readable.

Troubleshooting must not involve modifying seed data, changing configuration, or attempting runtime recovery mechanisms.

## 8. Failure Modes That Must NOT Crash the App

Missing optional static assets such as icons or supplementary images must degrade gracefully with placeholder rendering.

Empty seed data arrays for non-critical display sections must render empty state placeholders rather than causing page failures.

Malformed individual seed data entries must be skipped with warning output while allowing remaining valid entries to render.

Browser window resize, navigation timing, or client-side rendering quirks must not crash server process.

Concurrent requests from multiple browser tabs must not cause race conditions or shared state corruption.

Network timeout, connection close, or client disconnect during page load must not leave server in undefined state.

Rapid sequential navigation between pages must not trigger memory leaks or resource exhaustion.

## 9. Stop/Reset Procedure

Stop procedure must send termination signal to server process triggering immediate shutdown without graceful cleanup.

Process termination must release localhost port binding and discard all in-memory state including loaded seed data.

Reset procedure must involve full process restart with fresh seed data load and initialization sequence.

No persistent state, checkpoint files, or runtime artifacts may survive stop procedure requiring manual cleanup.

Browser state including cached pages, local storage, or session cookies may be cleared independently but is not required for reset.

Stop procedure must complete in deterministic time regardless of current request processing state or data load status.

## 10. WHAT THIS LOCAL RUN WILL NOT DO (BY DESIGN)

The local run will not connect to external databases, APIs, or third-party services at any point.

The local run will not persist any state, logs, or metrics beyond process memory lifetime.

The local run will not accept write requests, mutation operations, or state modification commands.

The local run will not expose network interfaces beyond localhost binding or allow remote access.

The local run will not execute production decision logic, action enforcement, or governance evaluation.

The local run will not reload configuration, hot-swap code, or support runtime modification without full restart.

The local run will not generate telemetry, export metrics, or ship observability data to external collectors.

The local run will not validate user input, sanitize payloads, or enforce production security controls beyond demo constraints.

The local run will not support multiple operator identities, role switching, or auth state transitions.

The local run will not simulate failure scenarios, inject errors, or test resilience behaviors.

The local run will not attempt automatic recovery, retry logic, or degraded mode operation upon encountering errors.

The local run will not claim production readiness, security compliance, or operational certification.

END OF FILE
