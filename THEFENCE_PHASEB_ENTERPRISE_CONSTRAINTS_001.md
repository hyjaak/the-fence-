# PHASE B.3: ENTERPRISE & GOVERNMENT SALES CONSTRAINTS
## Phase: Commercial
## Status: Defined (Non-Negotiable)

---

## SALES NON-NEGOTIABLES
- Sales may NEVER promise the ability to disable or mute the Audit Ledger, bypass Decision Hops, or circumvent the Recovery Doctrine.
- Sales may NEVER promise single-actor authority to lift BLACK or alter doctrine-enforced presence/dual-approval gates.
- Sales may NEVER guarantee reduced visibility for other tenants or system-wide alterations to safety defaults as a commercial concession.
- Sales may NEVER represent that commercial entitlements alter legal/regulatory obligations or allow suppression of forensic evidence.
- Sales must NOT commit to technical changes that would embed private signing keys into non-Identity systems or otherwise weaken key protection.

---

## CONTRACTUAL REQUIREMENTS
- All Enterprise/Government contracts MUST include:
  - A Doctrine Assurance Clause: explicit statement that Decision Hops, Audit Ledger immutability, Recovery Doctrine, and Safe-Mode behaviors are immutable and enforceable.
  - Separation of Duties Clause: sales/finance actions do not modify governance; policy changes require Governance-signed snapshots recorded in the Audit Ledger.
  - Access & Entitlement Audit Clause: all elevated accesses, unredacted exports, and entitlement changes are logged with actor id, justification, and ledger reference.
  - Regulatory Compliance Clause: how legally-required data access requests are handled, including chain-of-custody and locking procedures.
  - Termination & Data Handling Clause: retention rules, export paths, and obligations on contract termination.
  - Security & Key Management Clause: roles, revocation processes, and emergency freeze authority for Identity zone compromises.

---

## REGULATORY INTERACTION RULES
- Regulators/Custodians CANNOT demand:
  - Deletion of Audit Ledger entries or suppression of audit integrity proofs.
  - Direct modification of doctrine or runtime policies by external parties.
  - Access that bypasses documented entitlement and dual-approval processes (except when statutory powers override; such events are logged and governance-reviewed).
- Handling regulatory requests:
  - Route via Legal & Compliance; require proper warrant/authority and produce signed, auditable export bundles with chain-of-custody metadata.
  - If regulator demands conflict with doctrine, escalate to Governance & Legal; do not unilaterally change enforcement behavior.

---

## PILOT & PROOF-OF-VALUE (POV) CONSTRAINTS
- Pilots/POVs are time-boxed, scoped sandboxes with explicit isolation from production and separate data handling policies.
- Pilot promises must be limited to visibility and simulation features; pilots cannot include temporary governance bypasses or relaxed audit requirements.
- Proofs-of-Value that require access to unredacted production data must be negotiated as a separate, auditable entitlement with Supervisor/Governance sign-off and recorded in the Audit Ledger prior to access.
- Pilot acceptance criteria and exit conditions must be documented in writing and appended to the Audit Ledger; any extension must be re-approved and recorded.

---

## TEMPORARY ACCESS RULES
- Temporary elevated access is granted only with: explicit justification, time-bound scopes, dual-approval (Supervisor + Governance), and ledger-recorded justification.
- All temporary tokens/keys issued for access auto-expire and are recorded; emergency extensions require fresh recorded approvals.
- Temporary access cannot be used to perform recovery-promoting actions (e.g., to lift BLACK) unless Recovery Doctrine gates are satisfied and multi-party validators exist.
- Any temporary access that attempts to alter doctrine or audit behavior triggers an immediate governance hold and possible deal termination.

---

## ESCALATION & VETO AUTHORITY
- Escalation path when sales conflicts with doctrine:
  1. Sales raise conflict → Platform Security & Legal notified (automated ledger note).
  2. Platform Security issues immediate freeze on agreed technical changes pending review.
  3. Governance Board (designated members) reviews request; dual veto available by Governance Lead + Security Lead.
  4. If unresolved, escalate to Executive/Board level; interim default is to uphold doctrine and block the requested concession.
- Veto powers: Governance Lead and Security Lead hold unilateral temporary veto to stop deals or technical changes that violate non-negotiables; such veto and rationale are ledger-recorded.

---

## DEAL TERMINATION CONDITIONS
- Deals may be immediately terminated (kill condition) if:
  - Sales or contracting teams commit in writing to a concession that violates a Sales Non-Negotiable (audit suppression, hop bypass, etc.).
  - Customer demands or contract language attempts to transfer private master keys or require insecure key handling.
  - Any evidence surfaces that a negotiated concession materially weakens doctrine or safety controls without Governance-approved compensating controls.
- Termination procedure: immediate access revocation, ledger note of termination cause, preservation of audit bundles, and legal follow-up per contractual terms.

---

## ACCEPTANCE CRITERIA
- Contract templates include all mandatory clauses and are validated by Legal & Governance before sales use.
- Sales training: sales personnel pass governance compliance checks and understand non-negotiables; audits show no recorded offer violating constraints.
- Pilot/POV validations: pilot agreements recorded in Audit Ledger with scope/exit conditions; any pilot requiring unredacted production data has Governance pre-approval.
- Escalation tests: simulated sales conflict triggers the escalation path and Governance veto within defined SLA; veto actions are ledger-recorded and enforceable.
- Kill-condition tests: crafted contract clauses that violate non-negotiables result in blocked sign-offs and automated alerts preventing deal closure.

---

*End of enterprise & government sales constraints.*
