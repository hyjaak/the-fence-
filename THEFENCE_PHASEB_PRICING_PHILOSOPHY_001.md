# PHASE B.2: PRICING PHILOSOPHY & ANCHORS
## Phase: Commercial
## Status: Defined (Principles)

---

## PRICING PRINCIPLES
- Monetize visibility, retention, simulation depth, and coordinated response features; do not monetize safety, doctrine, or enforcement capabilities.
- Pricing is value-based and scales with scope of visibility and operational support, not with safety-critical functionality or regulatory compliance features.
- All paid capabilities are additive to baseline safety guarantees; customers may pay for convenience, scale, and forensic depth but never for reduced governance.
- Transparency: billing metrics are auditable and map to measurable usage dimensions (visibility objects, retention days, simulation hours, coordination channels).
- Entitlements do not grant authority: visibility privileges do not confer additional enforcement powers or recovery shortcuts.

---

## VALUE METRICS (WHAT IS CHARGED FOR)
- Visibility Depth: number and granularity of telemetry streams, unredacted artifact access, and incident detail fields available per tier.
- Audit Retention Length: duration of extended retention windows for exported or unredacted audit bundles beyond baseline retention.
- Simulation Scope: sandbox size, access to historical unredacted incident data in sandboxes, and enabled simulation features (real-time linkage, scenario breadth).
- Response Coordination: prioritized notification channels, reduced queuing for acknowledgments, and dedicated escalation routing (priority placement).
- Export Bandwidth & Forensic Exports: throughput and frequency limits for delivering large unredacted bundles or legal exports.
- Professional Services (non-recurring): sandbox setup, compliance integrations, and governance workshops (priced separately from runtime entitlements).

---

## NON-MONETIZABLE GUARANTEES
- Audit immutability and append-only ledger access cannot be sold, reduced, or gated by tier.
- Decision Hops, Recovery Doctrine enforcement, and safety enforcement are guaranteed for all customers regardless of tier.
- Core safe-mode and kill-switch behaviors remain free and active for all deployments; monetization does not affect safety defaults.
- Proof-based recovery gating and multi-party requirements are non-negotiable and not subject to commercial upgrades.

---

## TIER-BASED ANCHORS (conceptual)
- STARTER (anchor description)
  - Anchor: Basic visibility and retention for pilots and small operators.
  - Visibility: Incident summaries, sampled telemetry, redacted audit links.
  - Retention: Baseline audit retention and standard export cadence.
  - Simulation: Limited sandbox with sampled historical data and capped simulation hours.
  - Coordination: Standard notification channels and normal escalation queue.

- PROFESSIONAL (anchor description)
  - Anchor: Deeper operational visibility and extended forensic windows for mid-size operators.
  - Visibility: Higher-fidelity telemetry windows, richer incident artifacts (redaction-limited), prioritized access to simulation sandboxes.
  - Retention: Extended retention for selected incident classes and prioritized export processing.
  - Simulation: Larger sandbox windows and more scenario concurrency.
  - Coordination: Faster acknowledgment routing and elevated notification priority.

- ENTERPRISE (anchor description)
  - Anchor: Full operational situational awareness for large operators and multi-region deployments.
  - Visibility: Unredacted incident bundles (where lawful), device-level telemetry, long retention options with governance controls.
  - Retention: Long-term retention options and priority forensic export pathways.
  - Simulation: Advanced simulation features with controlled live-data linkage in approved sandboxes.
  - Coordination: Dedicated escalation channels, faster SLAs, and integration support.

- REGULATED / CRITICAL (anchor description, optional)
  - Anchor: Compliance-grade visibility and chain-of-custody features for regulated entities.
  - Visibility: Maximum unredacted access subject to regulatory controls and enhanced chain-of-custody metadata.
  - Retention: Legally-prescribed retention and sealed export pathways.
  - Simulation: Regulated simulation environments with auditor oversight.
  - Coordination: Statutory escalation flows and regulator-facing notification channels.

---

## DISCOUNT & NEGOTIATION RULES
- Volume & Multi-Site Discounts: Apply to paid visibility objects, retention seats, and simulation capacity; discounts are contractual and do not change enforcement or governance behavior.
- Term & Prepay Discounts: Offered for multi-year commitments or prepaid simulation credits; do not reduce audit retention for other customers nor alter doctrine.
- Pilot & SMB Discounts: Time-limited and require migration pathways to full commercial tiers; such discounts do not relax safety or recovery rules.
- Negotiation Safeguards: Any negotiated concession cannot: (a) reduce audit retention obligations for other customers, (b) permit doctrine bypass, or (c) grant unilateral recovery authority.
- Audit-Linked Discounts: Discounts tied to additional audit commitments (e.g., longer retention paid by customer) must be reflected as auditable entitlement records in the Audit Ledger.

---

## ANTI-CORRUPTION SAFEGUARDS
- Commercial entitlements are orthogonal to governance controls: billing systems cannot alter policy flags, governance policies, or audit writes.
- All entitlement changes (upgrades/downgrades, discounts, negotiated terms) are appended to the Audit Ledger with actor id, timestamp, and justification.
- Any request to weaken governance or shorten recovery-related gates is rejected and logged; automated alerts raised to Compliance and Platform Admins.
- Separation of duties: sales/finance systems cannot directly alter production governance policies; changes require Governance-signed policy snapshots recorded in the ledger.

---

## ACCEPTANCE CRITERIA
- Non-monetizable features: tests confirm audit, decision hops, and recovery doctrine enforcement remain active across sample tenant tiers.
- Visibility scaling: simulated tier upgrades increase viewable artifacts and simulation capacity without changing enforcement behavior; audit entries record entitlement changes.
- Discount rules: negotiated discounts create auditable entitlement records and do not permit governance circumvention in injection tests.
- Pricing metrics mapping: each billed metric maps to measurable telemetry or usage counters and is verifiable in customer-facing usage dashboards.
- Compliance proof: regulated-tier behaviors (retention, chain-of-custody) produce export bundles with required metadata and legal seals when exercised.

---

*End of pricing philosophy.*
