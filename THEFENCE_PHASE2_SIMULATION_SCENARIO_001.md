# SIMULATION SCENARIO: CANONICAL INCIDENT 001
## Phase: Simulation
## Status: Defined

---

## SYSTEM CONTEXT
- Single infrastructure system: Transmission-line thermal stress monitoring and automated containment control for a regional 110 kV feeder.
- Components: distributed line-temperature sensors, edge telemetry gateway, baseline/risk engines, action enforcement module, audit ledger, operator consoles, and notification channels.

---

## INITIAL CONDITIONS
- System state: GREEN
- Time: 02:10 local
- Environmental: high daytime ambient temperature but within normal operating bounds.
- Staffing: one on-call `Operator` logged in; `Supervisor` on standby (not present in the console); `Management` reachable via escalation channel.

---

## ACTORS & ROLES
- Operator: assigned to the feeder; authorized to acknowledge AMBER events and initiate assisted containment under supervision.
- Supervisor: higher-tier role, authorizes overrides and validates RED/BLACK escalations; not actively present initially.
- Management: receives BLACK escalations and coordinates war-room and external communications.
- Automated subsystem: baseline engine and automated throttling logic capable of automated actions at low risk thresholds.

---

## SIGNALS & ANOMALIES
- T+0: Gradual rise in line-conductor temperature across multiple sensors along a span (small correlated drift), producing anomaly score growth over minutes.
- T+5: Baseline deviation crosses AMBER threshold; system issues targeted notifications and requires operator acknowledgment within 3 minutes.
- T+10: Temperature rise accelerates; anomaly correlates with reduced cooling (wind drop) and increased load; system upgrades state toward RED if mitigations fail.
- T+12: Operator acknowledges AMBER and reports intent to initiate assisted throttling; stages action and records a planned-action entry in the Audit Ledger.
- T+13: Automated throttling attempt fails for one remote tap (communication glitch) — execution partial; verification fails for that tap.

---

## EXPECTED BEHAVIOR (per doctrine)
- Law-adjacent behavior: No silent or unverified actions; human-in-the-loop enforced for RED and above.
- On AMBER: system must require operator acknowledgment and staging evidence; audit entries appended.
- On execution failures: Risk State Engine increments state (AMBER→RED) and triggers presence gating; Decision Hops must be validated before any further containment.
- Overrides must not reduce visibility; any override appends audit rationale and requires Supervisor approval for RED/BLACK transitions.

---

## UNKNOWN FACTORS
- Intermittent telemetry latency severity and root cause (network vs device fault).
- Operator fatigue or distraction impacting response times.
- Whether the Supervisor can be reached within the required RED presence window.

---

## FAILURE POINT (where things go wrong)
- After the partial throttling failure at T+13, the operator acknowledges again but does not follow through with alternative containment due to concurrent tasks (human delay). Notifications escalate; Supervisor is not present in the live session.
- Silence window: operator fails to provide required real-time presence or actionable follow-up within the RED presence window; the system records `Silence` against the operator.
- Silence plus failed remediation causes automatic escalation to BLACK per visibility and silence rules. Management receives a BLACK alert; automated emergency automations (pre-authorized emergency load-shedding) trigger but one node remains unverified due to the comms glitch, producing an inconsistent execution state and higher outage risk.

---

## END STATE (BLACK)
- BLACK declared: full executive escalation, multi-channel broadcast, incident war-room established, recorded session and audit bundle delivered to Management.
- Outcomes recorded: partial execution artifacts, failed verification logs, operator silence flags, supervisor absence, and management-led remediation/forensic review.
- Post-incident: mandatory notarized review, corrective action plan tied to actors' audit records, and adjustments to fatigue/bypass detection thresholds.

---

*End of scenario.*
