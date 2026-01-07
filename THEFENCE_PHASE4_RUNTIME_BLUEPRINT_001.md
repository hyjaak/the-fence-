# PHASE 4: OPERATIONAL RUNTIME BLUEPRINT
## Phase: Runtime
## Status: Defined (Build-Ready)

---

## PURPOSE
- Provide a build-ready, safety-first runtime blueprint that codifies service boundaries, data flows, human/automation surfaces, containment and recovery entry points, and deterministic acceptance criteria for operational deployment.

---

## CORE RUNTIME PRINCIPLES
- No single service or actor can force global action; all state transitions require validated hop-chains and appropriate approvals per doctrine.
- Governance logic (policy, authority, overrides) is isolated from execution logic (actuation, device drivers) and communicates only via well-defined APIs and audit hooks.
- Audit and doctrine enforcement remain immutable and available even under runtime failures; audit writes are append-only and prioritized for durability.
- Human interfaces cannot bypass decision hops or presence gating; UI actions translate to hop records and signed presence tokens.
- Safe-mode defaults operate autonomously when dependent services degrade; safety degrades gracefully, not catastrophically.

---

## SYSTEM BOUNDARIES (what must never touch)
- Governance plane (authority rules, overrides, policy repository) must never run in the same trust domain as low-level actuation drivers.
- Private keys for device-bound identities and governance signing keys must never be exposed to general runtime services or operator consoles.
- Audit Ledger storage must be logically and physically separated from transient caches and non‑appendable stores; it must not accept requests that bypass integrity checks.
- External third-party networks (public internet) must not have direct write access to actuation or governance APIs; integration only via vetted gateway services and ACLs.

---

## RUNTIME SERVICES (logical, not technical)
- Telemetry Ingestion Service: validated, rate-limited collector for sensor telemetry with provenance metadata.
- Normalization & Enrichment Service: converts raw telemetry to canonical signals and attaches baseline context.
- Baseline & Risk Engine: computes anomaly scores, maintains baselines, and evaluates risk policies (read-only for doctrine storage).
- Decision Hop Manager: orchestrates required checkpoint creation, records approvals, and enforces hop-chain ordering.
- Action Enforcement Service: stages, executes, verifies, and rolls back actions in quarantined contexts with atomic commits per-node where possible.
- Governance & Authority Service: manages RBAC, override request/approval flows, and policy distribution (isolated domain).
- Audit Ledger Service: append-only, tamper-evident ledger storing complete lifecycle artifacts and integrity proofs.
- Human Presence & Session Service: authenticates presence, records session tokens, and stores session recordings references linked to ledger entries.
- Escalation & Notification Service: multi-channel routing for visibility tiers, including emergency broadcasts.
- Recovery Orchestrator: handles RECOVERY_ELIGIBLE flows, probation orchestration, and rollback coordination.
- Health & Observability Service: aggregated telemetry, SLO checks, and alerting for runtime health.

---

## DATA FLOW BETWEEN SERVICES
- Sensors → Telemetry Ingestion (provenance metadata) → Normalization → Baseline & Risk Engine.
- Risk Engine emits signals → Decision Hop Manager (creates hop chain) → Human Presence Service (presence gating) → Action Enforcement (Prepare→Stage→Execute→Verify).
- Action Enforcement events → Audit Ledger (append) → Escalation Service (if required) → Recovery Orchestrator (on BLACK).
- Governance & Authority Service provides policy queries to Decision Hop Manager and verifies override legitimacy; all governance decisions are recorded to Audit Ledger.
- Observability Service subscribes to non-sensitive metrics and health events; it may reference but cannot alter Audit Ledger entries.
- All cross-service calls are asynchronous where possible and carry signed request metadata to preserve provenance; synchronous flows limited to presence gating and verification handshakes with strict timeouts.

---

## HUMAN INTERACTION SURFACES
- Operator Console: acknowledgement, intent submission, staging operations, and presence initiation; all actions produce signed hop entries and presence tokens.
- Supervisor Console: review/approve overrides, validate evidence bundles, and authorize probation transitions; dual-approval controls enforced here.
- Management Dashboard: receives BLACK escalations, access to audit bundles, and coordinates war-room actions (read-only for critical ledger entries except governance approvals where authorized).
- Presence Session Interface: secure live sessions (audio/video/secure shell) with recording references and device-bound authentication.
- Audit Review Interface: read-only reconstruction tools for governance replay that consume Audit Ledger bundles.

---

## AUTOMATION SURFACES
- Low-risk automated actions (GREEN/AMBER) available to Execution Services with signed service identities and rate limits.
- Assisted automations require staged actions and operator intent before execution; presence gating required for RED/BLACK-level automation.
- Emergency automation allowed only if pre-authorized, time-bound, and recorded; such automations must still produce per-node verification artifacts and cannot silence governance.
- Automation endpoints accept only signed, authenticated requests and are subject to circuit breakers and per-service fail-safes.

---

## FAILURE CONTAINMENT ZONES
- Per-service sandboxing: each runtime service runs in its containment zone with constrained privileges and minimal trusted libraries.
- Network segmentation: enforcement plane, governance plane, and audit storage each reside in distinct network zones with strict ACLs.
- Blast-radius controls: action enforcement limited to scoped device groups; global actions require quorum procedures and multi-service confirmation.
- Read-only quarantine: when a service degrades, it may be put into read-only or degraded mode; critical audit writes are still accepted via fallback writers to durable store.

---

## SAFE MODE & KILL SWITCHES
- Local safe-mode: action defaults to conservative control setpoints (throttles/limits) at device or gateway level when verification uncertain.
- Service kill-switches: each service exposes a local kill-switch to suspend non-essential actions while leaving audit and governance alive.
- Global kill-switch: a quorum-based mechanism (multi-authority) able to halt wide-scale automation; global kill-switch state itself is recorded to the Audit Ledger.
- Kill-switch behavior: must not disable audit writes or governance reads; it only prevents further actuation until cleared by dual-approval.

---

## RECOVERY ENTRY POINTS
- BLACK → Recovery Orchestrator: triggers when Audit Ledger holds the incident bundle and eligibility gates are satisfied.
- Recovery entrance requires assembled evidence bundle and two validators (Operator + Supervisor) to initiate `RECOVERY_ELIGIBLE` per Phase 3A doctrine.
- All recovery actions are staged under probation zones with stricter presence, monitoring, and rollback requirements enforced by the Recovery Orchestrator.

---

## OBSERVABILITY & AUDIT SURFACES
- Observability: metrics, traces, and health events for each service exposed to Health & Observability Service; non-sensitive telemetry only.
- Audit surfaces: Audit Ledger API (append/read with integrity checks) and Audit Review Interface for governance replay; every recorded artifact includes integrity proofs and links to session recordings.
- Alerting: Escalation Service translates policy events into multi-channel alerts; alerts include ledger references and hop-chain context.
- Forensics: exportable incident bundles allow end-to-end replay: signal→hops→actions→verifications→presence→overrides.

---

## OUT OF SCOPE (INTENTIONAL)
- Autonomous ML-driven decision-making for RED/BLACK actions in V1.
- Direct public internet exposure for actuation or governance APIs.
- Silent background overrides or mechanisms that permit audit suppression.
- Operator impersonation or single-actor unilateral recovery transitions.

---

## ACCEPTANCE CRITERIA
- Governance isolation verified: simulated governance failure cannot cause unauthorized actuation in execution plane (test vectors).
- No single service forces global action: validated by injection tests that attempt unilateral global commands and are rejected by quorum/circuit-breaker rules.
- Audit durability: Audit Ledger remains writable and reconstructs incident bundles under degraded-service tests (chaos tests with partial failures).
- Presence gating enforcement: attempts to execute RED/BLACK actions without authenticated presence are rejected and recorded (automated tests).
- Safe-mode resilience: when multiple runtime services are degraded, safe-mode still enforces conservative device setpoints and prevents unsafe automated actuation.
- Recovery entry reproducibility: Recovery Orchestrator transitions BLACK→RECOVERY_ELIGIBLE only when eligibility gates pass; reproducible via deterministic test bundles.

---

*End of blueprint.*
