# PHASE 6: AUDIT LEDGER & TRUTH MODEL
## Phase: Truth Recording
## Status: Defined

---

## 1. LEDGER PURPOSE AND SCOPE

The Audit Ledger is the single authoritative record of all decisions, acknowledgements, actions, violations, and system state changes within the Fence runtime. The ledger serves as non-repudiable evidence for incident reconstruction, compliance verification, recovery validation, and forensic investigation.

The ledger records what happened, when it happened, who authorized it, what evidence supported it, and whether it succeeded or failed. The ledger does not interpret events, make decisions, or execute actions. It is a write-only append log that captures truth as it occurs.

Ledger entries are immutable, cryptographically signed, and hash-chained to prevent tampering. Every critical operation produces a ledger entry before completion is acknowledged. Silent success is forbidden; all outcomes are recorded.

The ledger operates independently of policy content, operator intent, or system health. Even during safe-mode or component failures, the ledger continues recording via fallback writers. Ledger integrity is the highest priority; all other operations degrade before ledger recording degrades.

---

## 2. WHAT IS ALWAYS RECORDED

### Decision Events
- Risk signal emission (source, threshold exceeded, timestamp, baseline reference).
- Hop creation (hop ID, risk context, required approvals, initiating service).
- Presence token issuance (authority level, device ID, timestamp, hop reference).
- Permit issuance (permit ID, hop-chain reference, expiration, signatures).
- Permit validation (success/failure, reason, timestamp).
- Permit expiration (permit ID, expiration timestamp).

### Acknowledgement Events
- Operator acknowledgement (authority level, device ID, hop ID, timestamp, signature).
- Supervisor acknowledgement (authority level, device ID, hop ID, timestamp, signature).
- Governance ratification (decision ID, timestamp, signature).
- Timeout events (hop ID, timeout reason, escalation target).
- Veto events (authority level, hop ID, veto reason, timestamp).

### Action Events
- Action attempt (permit reference, target, requested state change).
- Pre-action artifacts (state snapshot, verification prerequisites).
- Action execution (success/failure, timestamp, verification telemetry reference).
- Post-action artifacts (state snapshot, verification results).
- Rollback attempts (reason, success/failure, timestamp).

### Policy Events
- Policy snapshot loaded (hash, signature, timestamp).
- Policy change proposed (proposer authority, change summary hash).
- Policy change approved (approver authority, timestamp, signature).
- Policy change committed (commit hash, signature, timestamp).
- Policy signature verification (success/failure, reason).

### Identity Events
- Device enrollment (device ID, authority level, enrolling authority, timestamp).
- Key rotation initiated (key ID, initiating authority, timestamp).
- Key rotation completed (new key ID, timestamp, signature).
- Key revocation (key ID, reason, revoking authority, timestamp).
- Revocation list update (timestamp, entries added, signature).

### System Events
- Component startup (service name, version, configuration hash).
- Component shutdown (service name, reason, timestamp).
- Degraded mode entry (trigger condition, timestamp, affected components).
- Safe-mode entry (trigger condition, timestamp, freeze scope).
- Safe-mode exit (approving authorities, timestamp, signatures).
- Component failure (service name, failure type, timestamp, escalation).

### Violation Events
- Signature verification failure (artifact type, expected signer, timestamp).
- Hash chain break (ledger position, expected hash, actual hash).
- Bypass attempt (authority, attempt type, timestamp, artifact).
- Fatigue flag (authority, consecutive count, timestamp).
- Behavior anomaly (authority, anomaly type, timestamp, context).
- Integrity violation (component, violation type, timestamp, detection method).

### Telemetry Events
- Ingestion receipt (source, provenance signature, timestamp, queue position).
- Baseline evaluation (result, threshold comparison, timestamp).
- Telemetry validation failure (source, failure reason, timestamp).

### Escalation Events
- Escalation trigger (reason, source component, timestamp).
- Escalation delivery (channel, recipient, delivery status, timestamp).
- Escalation acknowledgement (recipient authority, timestamp, signature).
- Escalation timeout (original trigger, timeout duration, timestamp).

### Silence Events
- Operator non-response (expected response window, timeout timestamp).
- Supervisor non-response (expected response window, timeout timestamp).
- System query with no response (query context, timeout timestamp).

---

## 3. WHAT IS NEVER RECORDED

### Private Cryptographic Material
- Private signing keys.
- Symmetric encryption keys.
- Key derivation seeds or paths.
- Device key material.

### Personally Identifiable Information (Beyond Role Attribution)
- Operator names or contact information (only device ID and authority level recorded).
- Physical locations (unless part of signed provenance for device enrollment).
- Biometric data.

### Interim Computational State
- In-flight queue positions (only ingestion receipt and completion recorded).
- Transient cache contents.
- Temporary working memory snapshots.

### Deleted or Modified Entries
- The ledger never records deletions or modifications of prior entries.
- The ledger never records "correction" entries that alter prior truth.
- Errors are recorded as errors; corrections are new entries, not replacements.

### Unverified or Speculative Events
- Events without cryptographic provenance.
- Predicted or forecasted outcomes.
- Unauthenticated telemetry.

---

## 4. DECISION TRACE REQUIREMENTS

### Hop-Chain Completeness
- Every decision requiring approval produces a hop creation entry.
- Every presence token submission produces an acknowledgement entry.
- Every permit issuance references the complete hop-chain with all acknowledgements.
- Incomplete hop-chains are recorded as timed-out or vetoed, not deleted.

### Causality Preservation
- Risk signal entries precede hop creation entries.
- Hop creation entries precede acknowledgement entries.
- Acknowledgement entries precede permit issuance entries.
- Permit issuance entries precede action execution entries.
- Causal ordering is enforced by timestamp and ledger sequence position.

### Evidence Linkage
- Permits reference hop IDs.
- Hops reference risk signal IDs.
- Risk signals reference telemetry ingestion receipt IDs.
- Actions reference permit IDs.
- All references are immutable and cryptographically signed.

### Outcome Recording
- Every decision produces an outcome entry (permit issued, hop vetoed, hop timed-out).
- Every action produces an outcome entry (success, failure, rollback).
- Outcomes are recorded even during degraded or safe-mode operation via fallback writers.

### Reconstruction Guarantee
- Any incident can be reconstructed from ledger entries alone.
- Reconstruction does not require external logs, memory dumps, or operator testimony.
- All necessary context (hop IDs, signatures, timestamps, provenance) is embedded in ledger entries.

---

## 5. ACKNOWLEDGEMENT AND SILENCE CAPTURE

### Positive Acknowledgement Recording
- Operator acknowledgement recorded with device-bound signature, timestamp, and hop reference.
- Supervisor acknowledgement recorded with device-bound signature, timestamp, and hop reference.
- Acknowledgement entries are immutable and cannot be withdrawn after recording.

### Explicit Veto Recording
- Veto recorded with authority level, hop ID, veto reason (free-text or code), timestamp, and signature.
- Veto immediately halts hop progression and triggers escalation entry.
- Vetoed hops remain in ledger as vetoed, not deleted.

### Timeout Recording (Implicit Non-Acknowledgement)
- Timeout entry recorded when expected acknowledgement window expires without response.
- Timeout entry includes hop ID, expected authority level, timeout duration, and escalation target.
- Timeout is distinct from veto; silence is recorded as silence, not as rejection.

### Silence vs Absence
- Silence: Authority is authenticated and session active, but no acknowledgement issued within expected window.
- Absence: Authority is not authenticated; no session active.
- Both silence and absence produce timeout entries, but silence additionally produces a silence flag for behavior analysis.

### Fatigue and Coercion Indicators
- Rapid acknowledgements (<10 seconds review time) produce fatigue flag entries.
- Repeated silence during expected response windows produces coercion indicator entries.
- Duress signals embedded in presence tokens produce coercion indicator entries.
- All indicators are recorded to ledger and escalated; none are suppressed.

### Non-Response Escalation Chain
- First timeout produces escalation entry to supervisor.
- Supervisor timeout produces escalation entry to governance.
- Governance timeout produces permanent halt entry requiring manual intervention.
- All escalation steps recorded to ledger with timestamps and escalation paths.

---

## 6. IMMUTABLE ENTRY RULES

### Append-Only Constraint
- Ledger entries are appended only; no deletions permitted.
- Ledger entries are never modified after append; no in-place updates.
- Ledger position (sequence number) is monotonically increasing and permanent.

### Hash-Chain Enforcement
- Each entry includes hash of prior entry to form unbroken chain.
- Entry hash includes entry content, timestamp, signature, and prior entry hash.
- Hash chain break triggers immediate freeze and emergency escalation.

### Signature Requirement
- Every entry is signed by the issuing component or authority before append.
- Unsigned entries are rejected at write time; no unsigned entries in ledger.
- Signature verification occurs before append and again on every read.

### Timestamp Immutability
- Entry timestamps are set at write time and never altered.
- Timestamps are monotonically increasing within a single ledger instance.
- Clock skew or NTP corrections do not alter existing timestamps.

### Fallback Writer Guarantee
- If primary ledger write fails, fallback writer accepts entry to durable queue.
- Fallback entries are reconciled to primary ledger when primary recovers.
- Reconciliation preserves original timestamps and signatures; no re-signing.
- Reconciled entries marked with reconciliation metadata but original content unchanged.

### No Expiration
- Ledger entries never expire.
- Old entries remain readable and verifiable indefinitely.
- Ledger storage is provisioned for indefinite retention; no automatic purging.

---

## 7. REDACTION AND VISIBILITY CONSTRAINTS

### No Redaction Permitted
- Ledger entries cannot be redacted after append.
- Sensitive data must not be included at write time; redaction after-the-fact is forbidden.
- Privacy compliance is enforced at data collection, not ledger recording.

### Visibility Tiers
- **Public Visibility:** Risk signals, hop creation, permit issuance, action outcomes, system events, escalations.
- **Authority-Restricted Visibility:** Presence token signatures, acknowledgement details, fatigue flags.
- **Governance-Only Visibility:** Coercion indicators, integrity violations under investigation, duress signals.

### Visibility Does Not Mean Modifiability
- Higher-visibility entries are readable by more authority levels but remain immutable to all.
- Lower-visibility entries are readable only by authorized roles but remain immutable even to governance.
- Visibility controls apply to reads only; all writes are permanent.

### Export and Sharing Constraints
- Ledger exports preserve all entries with signatures and hash chains.
- Exported ledgers can be verified offline using public keys.
- Visibility-restricted entries can be filtered during export but not redacted from source ledger.
- Exported ledgers remain immutable; no post-export modifications permitted.

### Forensic Access
- Governance has unrestricted read access to all ledger entries for investigations.
- Forensic exports include full hash chain and all signatures for offline verification.
- Forensic access is logged to ledger (who accessed, when, what query) but does not alter entries.

---

## 8. REPLAY AND RECONSTRUCTION GUARANTEES

### Complete Incident Reconstruction
- Any incident (from telemetry ingestion through action execution) can be replayed from ledger alone.
- Replay produces the same decision sequence, hop-chain, and outcome.
- Replay verifies signatures, timestamps, and hash chains to detect tampering.

### Deterministic Decision Trace
- Given the same telemetry ingestion receipt, baseline, and policy snapshot, the same risk signal is produced.
- Given the same risk signal and hop-chain, the same permit is produced (if approvals identical).
- Given the same permit, the same action execution sequence is recorded.
- Non-determinism (e.g., network delays, operator response time) is captured as timestamps and timeouts, not omitted.

### Missing Entry Detection
- Hash chain verification detects missing or skipped entries.
- Sequence number gaps trigger integrity violation alerts.
- Replay halts if required entries (hop creation without corresponding risk signal) are missing.

### Replay Validation Rules
- Replay verifies every signature against recorded public keys.
- Replay recalculates every hash and compares to recorded hash.
- Replay checks timestamp ordering for causality violations.
- Replay confirms all required approvals present before permit issuance.

### Evidence Bundle Export
- Incident bundles include all ledger entries from risk signal through action outcome.
- Bundles include referenced policy snapshots, telemetry receipts, and signature verification keys.
- Bundles are self-contained and verifiable offline without access to live system.

### Auditability Over Time
- Ledger entries remain verifiable even after key rotation (using archived public keys).
- Policy snapshots remain verifiable even after policy updates (using commit signatures).
- Historical decisions remain auditable even after component upgrades or replacements.

---

## 9. TAMPER DETECTION RULES

### Hash Chain Verification
- Every ledger read verifies hash chain from requested entry back to genesis.
- Hash chain break detected → immediate freeze, emergency escalation, forensic mode entry.
- Hash chain verification cannot be disabled or bypassed.

### Signature Verification
- Every entry signature verified on read using public key from IdentityKMS.
- Invalid signature → entry rejected, integrity violation logged, component freeze.
- Signature verification failure escalates immediately to governance.

### Sequence Number Integrity
- Sequence numbers must be monotonically increasing with no gaps.
- Duplicate sequence numbers → integrity violation, immediate freeze.
- Missing sequence numbers → integrity violation, immediate freeze.

### Timestamp Ordering
- Timestamps must increase or remain constant; backward timestamps trigger violation.
- Timestamp violations logged and escalated but do not freeze ledger (clock skew tolerance).

### Fallback Reconciliation Verification
- Reconciled fallback entries verified for signature and timestamp match.
- Reconciliation metadata appended but original entry content unchanged.
- Reconciliation mismatches (different signatures, altered content) trigger integrity violation.

### Tamper Response
- Detect: Hash chain break, signature failure, sequence gap, or duplicate.
- Freeze: Stop all ledger writes except fallback writer recording the violation.
- Escalate: Immediate governance alert with violation details.
- Isolate: Mark affected ledger region as under investigation; require forensic review.
- Require: Dual-approval from governance to resume operations after forensic validation.

---

## 10. WHAT THE LEDGER CANNOT DO (BY DESIGN)

### Forbidden: Deletion or Modification
- The ledger cannot delete entries after append.
- The ledger cannot modify entries after append.
- The ledger cannot reorder entries after append.
- The ledger cannot suppress entries based on content, authority, or policy.

### Forbidden: Selective Recording
- The ledger cannot skip recording critical events for performance.
- The ledger cannot defer recording pending later confirmation.
- The ledger cannot batch-record events with altered timestamps.
- The ledger cannot omit recording based on operator request.

### Forbidden: Interpretation or Decision
- The ledger cannot interpret events or assign blame.
- The ledger cannot make decisions based on recorded events.
- The ledger cannot execute actions based on ledger contents.
- The ledger cannot filter or prioritize events during recording.

### Forbidden: Redaction
- The ledger cannot redact entries after append for privacy or compliance.
- The ledger cannot replace sensitive data with placeholders post-recording.
- The ledger cannot blur or anonymize recorded authority IDs retroactively.

### Forbidden: Silent Failure
- The ledger cannot silently drop writes on failure.
- The ledger cannot acknowledge writes before durable commit.
- The ledger cannot suppress write failure alerts.
- The ledger cannot continue normal operations during ledger unavailability (must enter safe-mode).

### Forbidden: Backdating or Forward-Dating
- The ledger cannot accept entries with past timestamps (except reconciled fallback entries with preserved original timestamps).
- The ledger cannot accept entries with future timestamps.
- The ledger cannot alter timestamps after append.

### Forbidden: Unsigned Entries
- The ledger cannot accept unsigned entries.
- The ledger cannot defer signature verification to read time.
- The ledger cannot trust unsigned entries from "privileged" components.

### Forbidden: External Dependencies for Core Recording
- The ledger cannot require network access to record entries.
- The ledger cannot require external services (cloud KMS, time servers) for append operations.
- The ledger cannot block writes pending external confirmation.
- The ledger must operate in isolated mode with fallback writers if external dependencies fail.

### Forbidden: Expiration or Auto-Purge
- The ledger cannot expire entries after time threshold.
- The ledger cannot auto-purge old entries for storage management.
- The ledger cannot archive entries to non-verifiable storage.
- The ledger cannot compress entries in ways that prevent signature verification.

### Forbidden: Role-Based Write Authorization
- The ledger cannot reject writes based on authority level of the writer.
- The ledger cannot filter writes based on content sensitivity.
- The ledger cannot require governance approval before recording violations.
- The ledger must record all properly-signed entries regardless of content or source.

### Forbidden: Conditional Recording
- The ledger cannot skip recording based on policy rules.
- The ledger cannot suppress recording during safe-mode or degraded operation (except via fallback writer).
- The ledger cannot defer recording pending operator review.
- The ledger cannot omit recording based on outcome (failures must be recorded, not hidden).

### Forbidden: Replay as Execution
- The ledger replay cannot execute actions; replay is read-only verification.
- The ledger replay cannot modify system state.
- The ledger replay cannot issue new permits or acknowledgements.
- The ledger replay cannot alter ledger contents during verification.

---

END OF FILE
