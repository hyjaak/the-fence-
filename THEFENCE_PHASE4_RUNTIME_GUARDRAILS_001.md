# PHASE 4: RUNTIME GUARDRAILS
## Phase: Runtime Constraints
## Status: Defined

---

## 1. GUARDRAIL PHILOSOPHY

Runtime guardrails are hard constraints enforced at the execution level that prevent unsafe states regardless of service logic, policy content, or operator intent. These constraints cannot be bypassed, disabled, or overridden during normal operation. Guardrails exist to ensure audit integrity, presence requirements, and fail-closed behavior are maintained even under component failure, compromise, or operator error.

Guardrails operate independently of service implementations and policy definitions. They are enforcement mechanisms embedded in the runtime execution environment itself.

---

## 2. RUNTIME INVARIANTS (CONDITIONS THAT MUST NEVER BE VIOLATED)

### Audit Integrity Invariants
- Every critical action must produce a signed ledger entry before completion is acknowledged.
- Ledger entries must be cryptographically signed and hash-chained before appending.
- Ledger reads must verify signature chains; corrupted entries trigger immediate freeze.
- No ledger entry may be deleted, modified, or reordered after append.
- Fallback writers must activate when primary ledger write path fails; no silent write failures allowed.

### Presence Invariants
- RED/BLACK permits require dual-approval with signed presence tokens from both operator and supervisor.
- Presence tokens must be device-bound and cryptographically verified before acceptance.
- Expired or revoked presence tokens must be rejected with no exceptions.
- No permit may be issued without completing the full hop-chain with all required presence attestations.

### Signature Invariants
- All permits, policies, and hop records must be cryptographically signed before use.
- Unsigned or invalid signatures trigger immediate rejection and logging.
- Signature verification must occur before any state-changing operation.
- Revoked or expired signing keys invalidate all dependent signatures immediately.

### Enforcement Invariants
- Physical actuation must remain disabled until explicit dual-approval exits dry-run mode.
- Action Enforcement must reject any permit lacking valid hop-chain reference and signature.
- Pre-action and post-action artifacts must be written to ledger before acknowledging actuation completion.
- Verification telemetry must be validated before marking actions successful.

### Policy Invariants
- Governance policies must be signed and versioned before serving.
- Unsigned policy snapshots trigger immediate service refusal to start.
- Policy reads must verify signature chains; corrupted policies halt operations.
- No policy change may take effect without ledger recording and dual-approval.

---

## 3. EXECUTION CONSTRAINTS

### Temporal Constraints
- Presence tokens expire after 5 minutes idle; no renewal without re-attestation.
- Permits expire after 10 minutes from issuance; expired permits are rejected.
- Hop-chains timeout after 15 minutes pending approval; timed-out hops escalate but do not auto-cancel.
- Session timeouts cannot be extended without fresh presence token.

### Concurrency Constraints
- No concurrent modifications to ledger entries; all writes are serialized.
- Hop-chain creation is serialized per decision context; no parallel hops for the same risk signal.
- Key rotation operations are serialized; no concurrent key generation or revocation.
- Policy updates are serialized; no concurrent policy commits.

### Ordering Constraints
- Hop records must be created before permit issuance.
- Permits must be validated before actuation attempts.
- Pre-action artifacts must be written before post-action artifacts.
- Ledger writes must complete before acknowledging upstream success.

### Resource Constraints
- Disk space below 10% triggers degraded mode with backpressure.
- Disk space below 5% triggers safe-mode with write freeze except fallback writers.
- Rate-limits on telemetry ingestion cannot be exceeded; excess requests are dropped with logging.
- Queue depths have hard limits; overflow triggers backpressure or escalation.

---

## 4. HUMAN-PRESENCE HARD REQUIREMENTS

### Dual-Approval Required (No Exceptions)
- RED/BLACK permit issuance.
- Master key rotation or revocation.
- Policy updates affecting permit issuance rules.
- Component kill-switch activation.
- Exiting dry-run mode for physical actuation.
- Recovery execution (deferred for MVP; future state requires dual-approval).

### Presence Token Requirements
- Tokens must be generated using device-bound keys (WebAuthn, TPM, or GPG).
- Token signatures must be verified by IdentityKMS before acceptance.
- Tokens must include timestamp and nonce to prevent replay.
- Tokens must reference specific hop context; generic tokens are rejected.

### Presence Verification Rules
- Presence verification must occur synchronously before permit issuance.
- Failed presence verification triggers immediate hop cancellation and escalation.
- Presence tokens from revoked or expired device keys are rejected.
- No presence token caching or reuse across hops.

### Presence Timeout Rules
- Operator/supervisor must respond within 15 minutes or hop escalates.
- Session idle >5 minutes requires fresh presence token.
- No automatic presence renewal; all renewals require explicit operator interaction.

---

## 5. AUTOMATIC FREEZE CONDITIONS

### Cryptographic Failures
- Ledger hash chain break → freeze all writes; activate fallback writer; escalate immediately.
- IdentityKMS tamper detection → freeze all signature operations; escalate immediately.
- Policy signature verification failure → refuse to start; escalate immediately.
- Hop-chain signature invalid → freeze permit issuance; escalate immediately.

### Integrity Violations
- Ledger entry modification attempt detected → emergency freeze; escalate immediately.
- Unauthorized policy change attempt → freeze governance service; escalate immediately.
- Permit forgery attempt → freeze Decision Hop Manager; escalate immediately.
- Device key compromise detected → revoke keys; freeze enrollments; escalate immediately.

### Resource Exhaustion
- Disk full → freeze all writes except fallback; escalate immediately.
- Ledger unavailable → freeze all actuation; escalate immediately.
- IdentityKMS unavailable → freeze new signature requests; escalate immediately.

### Component Failures
- Audit Ledger service crash → activate fallback writer; freeze non-critical writes; escalate.
- Decision Hop Manager crash → freeze permit issuance; queue new hops; escalate.
- Governance service crash → serve last-signed snapshot; refuse new overrides; escalate.

### Security Events
- Repeated authentication failures (>3 in 5 min) → freeze affected component; escalate.
- Unauthorized access attempt → freeze service; revoke credentials; escalate.
- Dry-run bypass attempt detected → emergency freeze; escalate immediately.

---

## 6. DEGRADATION RULES (WHAT DEGRADES VS WHAT HALTS)

### Components That Degrade (Continue with Reduced Functionality)
- **Telemetry Ingestion:** Disk >10% full → apply backpressure; prioritize critical telemetry; buffer to durable queue.
- **Escalation Service:** Single channel unavailable → fail over to alternate; log to ledger; continue.
- **Baseline Engine:** Baseline staleness >24 hours → warn operator; continue with last-known-good.
- **Policy Service:** Policy snapshot >30 days old → warn operator; continue serving last-signed snapshot.

### Components That Halt (Stop Operating Until Resolved)
- **Audit Ledger:** Hash chain invalid → halt all writes; activate fallback writer only; require manual recovery.
- **IdentityKMS:** Tamper detected or unavailable → halt all signature operations; refuse new enrollments.
- **Decision Hop Manager:** Policy signature invalid → halt permit issuance; refuse new hops.
- **Action Enforcement:** Dry-run bypass attempt → halt all actuation; emergency freeze.

### Degradation Thresholds
- Disk space 10–5%: Degraded mode with backpressure.
- Disk space <5%: Safe-mode with write freeze.
- Key expiration <7 days: Degraded mode with warnings.
- Key expired: Halt mode; refuse signatures.
- Hop timeout >15 min: Degraded mode; escalate for review.
- Hop timeout >60 min: Halt mode; require manual intervention.

---

## 7. SAFE-MODE ENTRY CRITERIA

### Automatic Safe-Mode Entry
- Disk space <5%.
- Ledger hash chain corruption detected.
- IdentityKMS unavailable or tampered.
- Policy signature verification failure on startup.
- Critical component crash (Ledger, KMS, Governance).
- Repeated integrity violations (>2 in 10 minutes).

### Safe-Mode Behavior
- All write operations freeze except fallback writer to Audit Ledger.
- No new permits issued; existing permits remain valid until expiration.
- No new hop-chains created; pending hops escalate for manual review.
- Telemetry ingestion continues to fallback queue only.
- Escalation service logs alerts to ledger and local console; outbound delivery suspended.
- All services enter read-only mode where applicable.
- Operator console displays safe-mode banner; requires supervisor acknowledgement.

### Safe-Mode Exit Criteria
- Root cause identified and ledger-recorded with dual-approval.
- Integrity checks pass (hash chain verified, signatures valid).
- Resource constraints resolved (disk space >15%, KMS restored).
- Supervisor-signed exit permit issued and recorded to ledger.
- Full system health check passes post-exit.

---

## 8. NON-OVERRIDEABLE GUARDRAILS

### Audit Guardrails (Cannot Be Disabled)
- Ledger writes are append-only; no deletions or modifications.
- All critical actions produce ledger entries; no silent success.
- Ledger signature verification is mandatory; unsigned entries are rejected.
- Fallback writer activates automatically; cannot be disabled.

### Presence Guardrails (Cannot Be Bypassed)
- Dual-approval required for RED/BLACK permits; no single-actor override.
- Device-bound presence tokens mandatory; generic tokens rejected.
- Expired or revoked tokens rejected; no grace period.
- Presence verification occurs synchronously; no deferred validation.

### Signature Guardrails (Cannot Be Weakened)
- All permits, policies, and hops must be signed; unsigned artifacts rejected.
- Signature verification precedes all state changes; no trust-on-first-use.
- Revoked keys invalidate dependent signatures immediately; no delayed revocation.
- Key rotation recorded to ledger before taking effect; no silent key changes.

### Enforcement Guardrails (Cannot Be Circumvented)
- Physical actuation disabled in dry-run mode; no testing bypass.
- Permits require valid hop-chain reference; no direct permit creation.
- Pre/post artifacts written to ledger; no artifact suppression.
- Verification telemetry validated; no assumed success.

### Policy Guardrails (Cannot Be Ignored)
- Policies must be signed; unsigned policies refuse to load.
- Policy changes recorded to ledger; no silent policy updates.
- Last-signed snapshot served during outage; no runtime policy synthesis.
- Policy disallows action → immediate rejection; no operator override without dual-approval.

---

## 9. GUARDRAIL VIOLATION HANDLING

### Detection
- Runtime monitors enforce invariants at execution boundaries.
- Signature verification occurs at all critical checkpoints.
- Hash chain validation runs on every ledger read.
- Presence token validation occurs before permit issuance.
- Resource thresholds checked continuously.

### Response
- Immediate freeze of affected component or operation.
- Violation event written to Audit Ledger (if available; fallback writer if ledger frozen).
- Escalation to operator and supervisor via all available channels.
- Component enters safe-mode or halt state per degradation rules.
- No automatic recovery; requires manual investigation and dual-approval to resume.

### Escalation Path
1. Detect violation.
2. Freeze component/operation.
3. Write violation to ledger.
4. Alert operator console (local display).
5. Alert supervisor via escalation service.
6. Require supervisor review and signed acknowledgement.
7. Require dual-approval to exit safe-mode or resume operations.

### Non-Recovery Violations (Permanent Halt)
- Ledger entry modification attempt → permanent freeze; require full forensic recovery.
- Persistent hash chain corruption → permanent freeze; require manual ledger rebuild with verification.
- IdentityKMS master key compromise → permanent freeze; require full key rotation and re-enrollment.
- Repeated dry-run bypass attempts → permanent freeze; require code inspection and dual-approval.

---

## 10. WHAT THE RUNTIME IS FORBIDDEN FROM DOING

### Forbidden: Audit Suppression
- Runtime cannot skip ledger writes for performance.
- Runtime cannot cache ledger writes without durable commit.
- Runtime cannot accept unsigned ledger entries.
- Runtime cannot delete or modify existing ledger entries.

### Forbidden: Presence Bypass
- Runtime cannot issue permits without dual-approval.
- Runtime cannot accept expired or revoked presence tokens.
- Runtime cannot cache presence tokens across hops.
- Runtime cannot assume presence without cryptographic proof.

### Forbidden: Signature Weakening
- Runtime cannot skip signature verification for trusted components.
- Runtime cannot accept unsigned permits, policies, or hops.
- Runtime cannot delay revocation enforcement.
- Runtime cannot generate signatures without IdentityKMS involvement.

### Forbidden: Enforcement Shortcuts
- Runtime cannot enable physical actuation without dual-approval.
- Runtime cannot bypass dry-run mode for testing.
- Runtime cannot skip pre/post artifact generation.
- Runtime cannot assume actuation success without verification telemetry.

### Forbidden: Policy Circumvention
- Runtime cannot serve unsigned policies.
- Runtime cannot synthesize policies at runtime.
- Runtime cannot ignore policy disallow rules.
- Runtime cannot accept policy changes without ledger recording.

### Forbidden: Safe-Mode Bypass
- Runtime cannot auto-exit safe-mode without dual-approval.
- Runtime cannot disable safe-mode entry conditions.
- Runtime cannot suppress safe-mode warnings.
- Runtime cannot resume writes during safe-mode freeze (except fallback writer).

### Forbidden: Single-Actor Unilateral Actions
- Runtime cannot accept single-signature permits for RED/BLACK actions.
- Runtime cannot allow single-actor key rotation.
- Runtime cannot allow single-actor policy updates.
- Runtime cannot allow single-actor recovery execution.

### Forbidden: Silent Failures
- Runtime cannot suppress error escalation.
- Runtime cannot hide integrity violations.
- Runtime cannot drop audit events without logging.
- Runtime cannot fail open; all failures are fail-closed.

### Forbidden: External Dependencies for Critical Paths
- Runtime cannot require internet access for permit issuance.
- Runtime cannot require external services for ledger writes.
- Runtime cannot require cloud services for signature verification.
- Runtime cannot require network access for safe-mode entry.

### Forbidden: Reverting to Unsafe Defaults
- Runtime cannot default to unsigned operations on error.
- Runtime cannot default to single-approval on timeout.
- Runtime cannot default to physical actuation on ambiguity.
- Runtime cannot default to allowing actions when policy unavailable.

---

END OF FILE
