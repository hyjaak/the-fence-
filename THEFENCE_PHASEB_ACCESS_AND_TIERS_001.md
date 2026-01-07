# PHASE B: ACCESS TIERS & CAPABILITY GOVERNANCE
## Phase: Commercial
## Status: Defined (Non-Negotiable)

---

## MONETIZATION PRINCIPLES
- Pricing tiers sell increased visibility, simulation depth, retention windows, and faster acknowledgement channels — not safety or enforcement powers.
- Access tiers grant visibility privileges only; safety controls and doctrine remain universal and unsellable.
- Tiered pricing includes SLA levels for notification latency and audit export throughput.

---

## NON-SELLABLE CAPABILITIES
- Disabling or muting the Audit Ledger.
- Bypassing Decision Hops, Authority & Override rules, or Recovery Doctrine.
- Reducing visibility below doctrine-mandated minimums for any risk state.
- Granting single-actor power to lift BLACK or alter immutable governance artifacts.

---

## TIER DEFINITIONS

### INTERNAL
- WHO IT IS FOR: System administrators, platform engineers, and internal ops teams.
- WHAT IT CAN SEE: Full telemetry metadata, internal system metrics, health diagnostics, and unredacted audit bundles for debugging (legal controls apply).
- WHAT IT CAN DO: Simulate scenarios in non-production sandboxes, request forensic exports, and access extended retention for internal investigations.
- WHAT IT CAN NEVER DO: Override doctrine, disable audit, or lift BLACK without Recovery Doctrine multi-party gates.
- REQUIRED HUMAN ROLES: Platform Admin, Security Lead, Auditor (for audit exports).
- AUDIT DEPTH: Full, extended retention (configurable internally) with unredacted access logged and governance-reviewed.
- RECOVERY RESTRICTIONS: Same recovery doctrine applies; elevated visibility does not shorten probation or reduce required proofs.

### STARTER
- WHO IT IS FOR: Small operators or early pilots with minimal visibility needs.
- WHAT IT CAN SEE: Incident summaries, RED/AMBER/BLACK alerts, limited sensor-level telemetry (sampled), and standard audit links with redaction.
- WHAT IT CAN DO: Acknowledge AMBER, stage actions (non-production), receive escalations, and use basic simulation tools (time-limited/sampled).
- WHAT IT CAN NEVER DO: Access unredacted forensic bundles, bypass hops, or extend audit retention beyond baseline policy.
- REQUIRED HUMAN ROLES: Assigned Operator, Escalation Contact.
- AUDIT DEPTH: Standard retention (baseline), redacted exports only; full ledger references always present.
- RECOVERY RESTRICTIONS: Cannot lead recovery validation; must escalate to Supervisor/Enterprise for RECOVERY_ELIGIBLE flows.

### PROFESSIONAL
- WHO IT IS FOR: Mid-size utilities and operations teams requiring deeper visibility and faster workflows.
- WHAT IT CAN SEE: Full incident artifacts for non-regulated fields, higher-fidelity telemetry (longer windows), and richer simulation capabilities in controlled sandboxes.
- WHAT IT CAN DO: Faster acknowledgment paths, request supervisor endorsements, run scenario simulations against historical incidents (sandboxed), and request longer audit exports (governance-reviewed).
- WHAT IT CAN NEVER DO: Bypass Decision Hops or Recovery Doctrine; cannot reduce visibility for others.
- REQUIRED HUMAN ROLES: Operator, Senior Operator, Designated Supervisor.
- AUDIT DEPTH: Extended retention and higher export bandwidth subject to governance approval for sensitive fields.
- RECOVERY RESTRICTIONS: May participate as validators under Supervisor co-validation but cannot unilaterally approve YELLOW_PROBATION → GREEN_RESTORED.

### ENTERPRISE
- WHO IT IS FOR: Large operators, multi-region utilities, and enterprises needing full operational situational awareness.
- WHAT IT CAN SEE: Unredacted incident bundles (where lawful), device-level telemetry, longer retention, and advanced simulation tooling with scoped live-data linkage for approved sandboxes.
- WHAT IT CAN DO: Prioritized notification and acknowledgment channels (shorter ack windows), advanced simulation environments, and governance-audited export requests.
- WHAT IT CAN NEVER DO: Modify doctrine, shorten probation windows, or suppress audit evidence. Cannot single-handedly lift BLACK.
- REQUIRED HUMAN ROLES: Operator, Supervisor, Enterprise Admin, Compliance Officer.
- AUDIT DEPTH: Long-term retention, priority forensic export pathways; all unredacted accesses recorded and require justification.
- RECOVERY RESTRICTIONS: Can serve as primary validators in recovery bundles but require dual-approval for final GREEN_RESTORED endorsement.

### REGULATED / CRITICAL (optional)
- WHO IT IS FOR: Regulated entities, grid operators, or critical infrastructure with legal/regulatory obligations.
- WHAT IT CAN SEE: Full unredacted telemetry and audit bundles with legal access controls and compliance logging.
- WHAT IT CAN DO: Highest-fidelity simulations, prioritized operational channels, and regulated export pathways under compliance review.
- WHAT IT CAN NEVER DO: Override recovery doctrine, bypass audits, or reduce visibility for other tiers.
- REQUIRED HUMAN ROLES: Operator, Supervisor, Regulatory Compliance Officer, Executive Representative.
- AUDIT DEPTH: Maximum retention, legally-sealed exports, and enhanced chain-of-custody metadata.
- RECOVERY RESTRICTIONS: Recovery must follow statutory procedures; external regulator involvement recorded and required where applicable.

---

## CAPABILITY GATING RULES
- Visibility gating is role- and tier-based and enforced by `Policy & Governance Service` and `Audit Ledger` proofs.
- Access to unredacted artifacts requires both tier entitlement and explicit justification recorded in the Audit Ledger.
- Simulation access that touches live or historical unredacted data must run in sandboxed environments with audit hooks and time-limited bindings.
- Faster acknowledgment paths are implementation of routing priority only; they do not shorten doctrinal acknowledgment windows or bypass presence requirements.

---

## UPGRADE / DOWNGRADE BEHAVIOR
- Upgrades: Immediate visibility expansion is allowed upon entitlement change; privileged accesses (unredacted exports) require recorded justification and governance approval for some tiers.
- Downgrades: Removing a tier reduces visibility immediately; existing queued export requests for higher tiers are canceled and logged; previously exported unredacted data remains subject to retention/termination policy.
- Audit continuity: All changes in tier status are appended to the Audit Ledger with actor id, timestamp, and justification.
- Transition windows: Some capabilities (e.g., Recovery validator roles) require a hold period (configurable) after downgrade before prior privileges are fully revoked to avoid in-flight action interruption.

---

## TERMINATION & DATA HANDLING
- On termination, account access is revoked immediately; audit ledger references remain immutable and exports tied to legal/contractual obligations are retained per tiered retention policies.
- Unredacted historical exports: governed by contracts and legal requests; deletion of ledger entries is never permitted — only access revocation and redaction metadata are recorded (redaction must be governed and logged separately; underlying ledger entries persist with redaction markers).
- Data portability: Customers may request exports of their allowed-view artifacts; exports are delivered with chain-of-custody metadata and ledger references.

---

## ACCEPTANCE CRITERIA
- Tier count: 4–6 tiers defined; each controls visibility only and respects doctrine non-negotiables.
- Enforcement tests: attempts to use any tier to disable audit, bypass Decision Hops, or shorten recovery doctrine gates fail and are logged.
- Visibility tests: upgrade/downgrade simulations change visible artifacts per tier immediately and record transitions in the ledger.
- Access & export tests: unredacted access requires both tier entitlement and explicit audit-logged justification; sandboxed simulations cannot access live unredacted streams without governance-approved bindings.
- Retention & termination tests: termination revokes access; ledger remains immutable; export and legal retention behaviors operate per contract.

---

*End of Phase B access tiers & capability governance.*
