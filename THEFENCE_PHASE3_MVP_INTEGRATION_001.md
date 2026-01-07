# PHASE 3: MVP INTEGRATION & EXECUTION BOUNDARIES
## Phase: Integration
## Status: Defined

---

## OBJECTIVE
Define which components are active, simulated, or observation-only for the MVP. Establish human-required execution boundaries, auto-block conditions, and hard/soft stop mechanisms. Explicitly document what the MVP cannot do by design.

---

## COMPONENT EXECUTION STATES

### ACTIVE (Real, Executing with Side Effects)

#### 1. Audit Ledger Service
- **State:** ACTIVE (REAL)
- **Execution Mode:** All writes are durable, signed, and append-only to SQLite ledger file.
- **Side Effects:** Persistent ledger entries on local filesystem; hash chain updates; signature generation via IdentityKMS.
- **Human Boundary:** Ledger reads are unrestricted; ledger writes require valid signed permits from upstream services.
- **Auto-Block Conditions:** Block writes if signature verification fails; block if disk full (activate fallback writer); block if hash chain breaks.
- **Hard Stop:** Ledger file corruption detected (hash chain invalid) → emergency freeze, activate fallback writer, escalate to supervisor.
- **Soft Stop:** Disk space <10% → warn and activate fallback queue; continue accepting writes to fallback.

#### 2. Identity & Key Management Service (KMS)
- **State:** ACTIVE (REAL)
- **Execution Mode:** TPM-backed or encrypted local keystore; issues signatures, validates signatures, manages device enrollments.
- **Side Effects:** Key rotations recorded to ledger; revocation lists published; service credentials issued.
- **Human Boundary:** Key rotation and revocation require dual-approval (operator + supervisor signed permits).
- **Auto-Block Conditions:** Block new enrollments if compromise suspected (revocation list updated); block signature requests with expired or revoked keys.
- **Hard Stop:** TPM/keystore unavailable or tampered → emergency freeze, refuse all new signatures, escalate immediately.
- **Soft Stop:** Key approaching expiration (<7 days) → warn operator, queue rotation request.

#### 3. Decision Hop Manager
- **State:** ACTIVE (REAL)
- **Execution Mode:** Creates hop-chains, validates hop completion, issues signed permits; persists to SQLite hop store.
- **Side Effects:** Hop records written to local DB and ledger; permits issued and signed by KMS.
- **Human Boundary:** Permits for RED/BLACK actions require operator presence token + supervisor acknowledgement (dual-approval).
- **Auto-Block Conditions:** Block permit issuance if hop-chain incomplete; block if required presence tokens missing or expired; block if governance policy disallows.
- **Hard Stop:** Governance policy snapshot missing or unsigned → refuse all new permits, escalate.
- **Soft Stop:** Hop-chain timeout (pending acknowledgement >15 min) → warn supervisor, queue for manual review.

#### 4. Policy & Governance Service
- **State:** ACTIVE (REAL, Read-Only Mode for MVP)
- **Execution Mode:** Serves last-signed policy snapshot from Git repo via HTTP; no dynamic policy updates during MVP.
- **Side Effects:** Policy reads logged to ledger; policy snapshot hash validated on startup.
- **Human Boundary:** Policy updates require signed Git commit (operator) and supervisor approval; policy server restart required.
- **Auto-Block Conditions:** Block service startup if policy snapshot signature invalid; block if policy file missing.
- **Hard Stop:** Policy signature verification failure → refuse to start, escalate immediately.
- **Soft Stop:** Policy snapshot older than 30 days → warn operator, continue serving last-known-good.

#### 5. Telemetry Gateway (Ingestion)
- **State:** ACTIVE (REAL)
- **Execution Mode:** Go HTTPS collector accepting signed telemetry; writes to local SQLite durable queue.
- **Side Effects:** Telemetry buffered to disk; ingestion receipts written to ledger.
- **Human Boundary:** No human approval required for ingestion; human review required for baseline anomaly thresholds.
- **Auto-Block Conditions:** Block ingestion if rate-limit exceeded (>1000 req/sec); block if provenance signature invalid; block if disk queue full.
- **Hard Stop:** Disk queue full and fallback exhausted → drop new telemetry, log to ledger, escalate immediately.
- **Soft Stop:** Queue >80% full → apply backpressure, warn operator, prioritize critical telemetry streams.

#### 6. Baseline & Risk Engine
- **State:** ACTIVE (REAL, Deterministic Rules Only)
- **Execution Mode:** Evaluates canonical telemetry against deterministic baseline rules; emits RED/BLACK signals to Decision Hop Manager.
- **Side Effects:** Risk signals written to ledger; hop creation triggered for threshold violations.
- **Human Boundary:** Baseline thresholds are policy-defined (static for MVP); threshold changes require policy update (dual-approval).
- **Auto-Block Conditions:** Block risk evaluation if baseline data missing; block if telemetry provenance invalid.
- **Hard Stop:** Baseline rules missing or unsigned → refuse to evaluate, escalate.
- **Soft Stop:** Baseline staleness detected (>24 hours old) → warn operator, continue with last-known-good.

#### 7. Operator & Supervisor Console (CLI TUI)
- **State:** ACTIVE (REAL)
- **Execution Mode:** CLI emits signed presence tokens and acknowledgements using device-bound WebAuthn/GPG keys.
- **Side Effects:** Signed tokens written to filesystem queue; tokens validated by Decision Hop Manager and recorded to ledger.
- **Human Boundary:** All presence tokens require live operator/supervisor interaction (no automation).
- **Auto-Block Conditions:** Block token issuance if device key expired or revoked; block if session timeout (>5 min idle).
- **Hard Stop:** Device key compromised (revoked) → disable token issuance, require re-enrollment, escalate.
- **Soft Stop:** Session approaching timeout (4 min idle) → warn operator, request re-affirmation.

#### 8. Escalation & Notification Service
- **State:** ACTIVE (REAL, Local Channels Only)
- **Execution Mode:** Local multiplexer (SMTP/webhook/syslog) with ledgered delivery receipts; outbound-only connections.
- **Side Effects:** Alerts sent to configured local channels; delivery receipts written to ledger.
- **Human Boundary:** Alert configuration changes require policy update (dual-approval); no runtime alert suppression allowed.
- **Auto-Block Conditions:** Block alert delivery if ledger write fails (queue locally); block if channel credentials invalid.
- **Hard Stop:** All channels unavailable → log alerts to ledger only, display on local console, escalate immediately.
- **Soft Stop:** Single channel unavailable → fail over to alternate channel, warn operator.

---

### SIMULATED (No Physical Side Effects, Logging Only)

#### 9. Action Enforcement Service
- **State:** SIMULATED (DRY-RUN MODE)
- **Execution Mode:** Receives permits, validates hop-chains, writes pre/post artifacts to ledger, **refuses physical actuation** for MVP.
- **Side Effects:** Pre/post state artifacts written to ledger; simulated verification telemetry generated and logged.
- **Human Boundary:** All actuation requests require valid permit from Decision Hop Manager; no direct operator override allowed.
- **Auto-Block Conditions:** Block any actuation attempt if permit signature invalid; block if permit expired; block if hop-chain incomplete.
- **Hard Stop:** Attempt to bypass dry-run mode → emergency freeze, log to ledger, escalate immediately.
- **Soft Stop:** Permit approaching expiration (<1 min) → warn operator, queue renewal request.
- **MVP Constraint:** **PHYSICAL ACTUATION DISABLED** — all actions are simulation-only; actuation results are mocked and logged.

#### 10. Device Fleet & Drivers
- **State:** SIMULATED (MOCK)
- **Execution Mode:** Simulated telemetry generator; accepts actuation commands but produces mocked verification telemetry only.
- **Side Effects:** None (no real devices); simulated telemetry written to ingestion queue.
- **Human Boundary:** Simulated device behavior configured via static YAML; no runtime changes.
- **Auto-Block Conditions:** N/A (simulation cannot fail in unsafe ways).
- **Hard Stop:** N/A.
- **Soft Stop:** N/A.
- **MVP Constraint:** **NO REAL DEVICES** — all device interactions are simulated for safety.

---

### OBSERVATION-ONLY (Read-Only, No Writes)

#### 11. Recovery Orchestrator
- **State:** OBSERVATION-ONLY
- **Execution Mode:** Monitors ledger for recovery-eligible incidents; validates evidence bundles; **does not execute recovery actions** for MVP.
- **Side Effects:** Recovery eligibility assessments logged to ledger; no state changes to other services.
- **Human Boundary:** Recovery execution requires operator + supervisor dual-approval (not implemented in MVP).
- **Auto-Block Conditions:** N/A (observation-only).
- **Hard Stop:** N/A.
- **Soft Stop:** N/A.
- **MVP Constraint:** **RECOVERY GATING ONLY** — validates evidence but does not orchestrate recovery workflows; manual recovery required.

#### 12. Audit Ledger Reader / Forensic Tools
- **State:** OBSERVATION-ONLY
- **Execution Mode:** Read-only ledger queries; signature verification; incident bundle export.
- **Side Effects:** None (read-only).
- **Human Boundary:** Unrestricted read access for authorized operators and supervisors.
- **Auto-Block Conditions:** N/A (read-only).
- **Hard Stop:** N/A.
- **Soft Stop:** N/A.

---

## HUMAN-REQUIRED EXECUTION BOUNDARIES

### Dual-Approval Required (Operator + Supervisor):
1. **RED/BLACK Permit Issuance:** Decision Hop Manager requires signed presence tokens from both operator and supervisor before issuing permit.
2. **Key Rotation/Revocation:** IdentityKMS requires dual-approval for master key rotation or device key revocation.
3. **Policy Updates:** Governance policy changes require signed Git commit (operator) + supervisor approval before deployment.
4. **Component Swap/Kill-Switch Activation:** Reversibility matrix swaps require dual-approval and ledger recording.
5. **Recovery Execution:** (Deferred for MVP; future state requires dual-approval for recovery orchestration.)

### Single-Approval Required (Operator or Supervisor):
1. **Baseline Threshold Adjustments:** (Via policy update; operator proposes, supervisor approves.)
2. **Telemetry Ingestion Rate-Limit Changes:** (Via policy update.)
3. **Escalation Channel Configuration:** (Via policy update.)

### No Human Approval Required (Automated):
1. **Telemetry Ingestion:** Automatic acceptance if provenance valid and rate-limits not exceeded.
2. **Audit Ledger Writes:** Automatic for all valid signed writes.
3. **Risk Signal Emission:** Automatic when deterministic baseline rules triggered.
4. **Escalation Alerts:** Automatic when risk thresholds exceeded or system failures detected.

### Human Oversight Required (Cannot Be Automated):
1. **Presence Token Issuance:** Operator/supervisor must physically interact with CLI to generate signed tokens (device-bound keys).
2. **Policy Signing:** Git commits must be signed by authorized operator with GPG/TPM keys.
3. **Emergency Freeze Activation:** Operator must explicitly trigger kill-switch via signed command.
4. **Recovery Evidence Review:** Supervisor must validate evidence bundles before marking recovery-eligible.

---

## AUTO-BLOCK CONDITIONS (SYSTEM-ENFORCED)

### Identity & Cryptographic Failures:
- **Invalid Signature:** Block any request with invalid or missing signature; log to ledger; escalate.
- **Expired/Revoked Keys:** Block requests using expired or revoked keys; log to ledger; notify operator.
- **Missing Provenance:** Block telemetry or permits lacking signed provenance headers; log and drop.

### Policy & Governance Violations:
- **Policy Signature Invalid:** Block service startup; refuse to serve unsigned policy; escalate immediately.
- **Policy Disallows Action:** Block permit issuance if governance policy `no-issue-permits` flag set; log to ledger.
- **Hop-Chain Incomplete:** Block permit issuance if required hop steps missing or unsigned; escalate.

### Resource Exhaustion:
- **Disk Full:** Block ledger writes, activate fallback writer; block telemetry ingestion, apply backpressure.
- **Rate-Limit Exceeded:** Block telemetry ingestion; drop excess requests; log to ledger; escalate.
- **Queue Overflow:** Block new writes; activate fallback queue; escalate if fallback also full.

### Component Failures:
- **KMS Unavailable:** Block new signature requests; freeze new enrollments; accept read-only ledger queries.
- **Ledger Unavailable:** Block all write paths; activate fallback writer; refuse action execution.
- **Governance Unavailable:** Serve last-signed policy snapshot; refuse new policy updates; block override approvals.

### Security Events:
- **Hash Chain Break:** Emergency freeze; stop ledger writes; escalate immediately; activate forensic mode.
- **Tamper Detection:** Block affected component; log to ledger (if available); escalate immediately.
- **Compromise Suspected:** Rotate affected keys; revoke device enrollments; freeze new permits; escalate.

---

## HARD STOPS vs SOFT STOPS

### Hard Stops (Immediate Freeze, Escalation Required):
1. **Audit Ledger Corruption:** Hash chain invalid or signature verification failed → emergency freeze all operations; activate fallback writer; escalate to supervisor; require manual ledger recovery.
2. **IdentityKMS Tamper/Unavailable:** TPM/keystore tampered or unavailable → freeze all signature operations; refuse new enrollments; escalate immediately; require dual-approval to resume.
3. **Policy Signature Failure:** Governance policy signature invalid → refuse to start Policy service; block all permit issuance; escalate immediately; require signed policy restore.
4. **Hop-Chain Tampering Detected:** Hop record signature invalid or ordering violated → refuse permit issuance; freeze Decision Hop Manager; escalate; require forensic review.
5. **Dry-Run Bypass Attempt:** Action Enforcement detects attempt to enable physical actuation → emergency freeze; log to ledger; escalate; require supervisor override to disable enforcement safeguard.
6. **Unauthorized Access Attempt:** Invalid credentials or unauthorized component access → block request; log to ledger; escalate; revoke credentials if repeated.

**Hard Stop Response:**
- Immediately freeze affected component (stop process or set read-only mode).
- Write freeze event to Audit Ledger (if available; fallback writer if ledger unavailable).
- Escalate to supervisor via all available channels (console, SMTP, syslog).
- Require dual-approval (operator + supervisor signed permits) to resume operations.

### Soft Stops (Warning, Degraded Mode, Operator Notified):
1. **Disk Space Low (<10%):** Activate fallback queue; apply telemetry backpressure; warn operator; continue operations in degraded mode.
2. **Key Approaching Expiration (<7 days):** Warn operator; queue key rotation request; continue operations with current keys.
3. **Baseline Staleness (>24 hours):** Warn operator; continue with last-known-good baseline; log staleness to ledger.
4. **Policy Snapshot Old (>30 days):** Warn operator; continue serving last-signed snapshot; recommend policy review.
5. **Hop-Chain Timeout (>15 min pending):** Warn supervisor; queue for manual review; do not auto-cancel hop.
6. **Single Escalation Channel Unavailable:** Fail over to alternate channel; warn operator; continue alert delivery.
7. **Session Approaching Timeout (4 min idle):** Warn operator; request re-affirmation; do not auto-terminate session.

**Soft Stop Response:**
- Continue operations in degraded or fallback mode.
- Log warning event to Audit Ledger.
- Notify operator/supervisor via Escalation service.
- Recommend corrective action; do not require approval to continue.

---

## NETWORKING & EXTERNAL CALLS

### REAL (Actual Network Calls Allowed):
- **Telemetry Gateway Ingress:** HTTPS listener on localhost or isolated VLAN interface; mTLS required for external sources.
- **Escalation Outbound (SMTP/Webhook/Syslog):** Outbound-only connections to configured local/internal endpoints; TLS required; no inbound connections.
- **Operator Console (CLI → Services):** Localhost HTTP/gRPC to Decision Hop Manager, Policy Service, Ledger Reader; TLS with client certs.

### SIMULATED (No Real Network Calls):
- **Device Actuation:** No network calls; all device interactions mocked locally.
- **External Notification Services (Twilio, AWS SNS):** Not used in MVP; SMTP/webhook to local endpoints only.

### BLOCKED (Explicitly Disallowed for MVP):
- **Inbound Connections to Actuation/Governance:** No external network access to Action Enforcement, Decision Hop Manager, or Policy Service.
- **Direct Internet Access:** No services have direct internet egress except Escalation (outbound-only, local channels).
- **Federation/Clustering:** No inter-node communication; single-node deployment only.
- **Third-Party APIs:** No cloud provider APIs (AWS, Azure, GCP) except if using deferred Cloud KMS (not in MVP default stack).

---

## WHAT THIS MVP CANNOT DO (BY DESIGN)

### 1. Physical Device Actuation
**Why:** Safety-first constraint. Action Enforcement runs in dry-run/simulation mode only. Physical actuation disabled to prevent real-world impact during MVP validation.

**Implication:** All actuation commands produce mocked verification telemetry and ledger artifacts but do not control real devices.

**Future State:** Physical actuation requires explicit enablement, additional safety interlocks, and dual-approval to exit dry-run mode.

---

### 2. Autonomous ML-Driven RED/BLACK Decisions
**Why:** Explainability and auditability requirements. MVP uses deterministic baseline rules only to ensure all decisions are traceable and reproducible.

**Implication:** No machine learning models, no anomaly detection beyond simple threshold rules, no adaptive baselines.

**Future State:** ML models may be introduced post-MVP with mandatory explainability artifacts and human-in-the-loop approval for model updates.

---

### 3. Automated Recovery Execution
**Why:** Evidence-first recovery doctrine requires human validation of evidence bundles and dual-approval before recovery orchestration.

**Implication:** Recovery Orchestrator validates evidence eligibility but does not execute recovery workflows. Manual recovery required.

**Future State:** Automated recovery gated workflows may be introduced with strict evidence validation, dual-approval, and ledger-backed checkpoints.

---

### 4. Silent Success Paths or Audit Bypass
**Why:** Core doctrine: no silent overrides, no audit suppression. All critical actions must produce ledger evidence.

**Implication:** Every permit, hop, actuation attempt, policy change, and key rotation must generate signed ledger entries. No "fast path" or "emergency bypass" that skips audit.

**Future State:** No exceptions planned; audit integrity is non-negotiable.

---

### 5. Single-Actor Unilateral Recovery or Override
**Why:** Presence-gating doctrine requires dual-approval (operator + supervisor) for RED/BLACK actions and recovery execution.

**Implication:** No single operator or supervisor can issue permits, rotate keys, or execute recovery without the other's signed presence token.

**Future State:** Dual-approval remains a core constraint; no single-actor paths planned.

---

### 6. Direct External Network Exposure for Governance or Actuation
**Why:** Zone isolation and attack surface minimization. Governance and Actuation planes must not accept inbound connections from external networks.

**Implication:** Policy Service, Decision Hop Manager, and Action Enforcement are localhost/internal-only. Only Telemetry Gateway accepts inbound (with strict provenance validation).

**Future State:** External exposure may be considered for read-only audit queries with strict authentication, but actuation/governance remain isolated.

---

### 7. Vendor-Locked or Closed-Source Critical Components
**Why:** Reversibility and auditability constraints. All critical-path components (Audit Ledger, Identity/KMS, Governance, Hops) must be open-source or easily replaceable within 1 day.

**Implication:** No AWS QLDB, Azure Confidential Ledger, proprietary HSMs, or managed cloud services for MVP critical paths.

**Future State:** Deferred vendor integrations (e.g., Cloud KMS) allowed only if reversible within 1 day and with clear export/migration paths.

---

### 8. Real-Time High-Frequency Actuation
**Why:** MVP focuses on low-frequency, high-consequence decisions (transmission line load shedding). Not optimized for millisecond-latency control loops.

**Implication:** Decision Hop Manager and Action Enforcement have seconds-to-minutes latency due to human presence requirements and ledger writes.

**Future State:** High-frequency actuation may be supported via pre-approved "playbook" permits with tighter validation loops, but human oversight remains.

---

### 9. Multi-Node Clustering or Geographic Distribution
**Why:** Single-node deployment constraint for MVP to minimize operational complexity and maximize reversibility.

**Implication:** No distributed consensus (etcd, raft), no multi-region failover, no load balancing. All services run on a single host or small VM cluster.

**Future State:** Multi-node deployment may be introduced post-MVP with replicated Audit Ledger, distributed KMS, and consensus-based governance.

---

### 10. Anonymity or Unlinkability Guarantees
**Why:** Non-repudiation and auditability are prioritized over anonymity. All actions must be cryptographically attributed to device-bound identities.

**Implication:** No anonymous permits, no unlinkable hops, no privacy-preserving signatures. Every action traces to an enrolled device/operator.

**Future State:** Privacy-preserving techniques (e.g., group signatures, zero-knowledge proofs) may be explored for specific use cases, but auditability remains primary.

---

### 11. Bypassing Dry-Run Mode for "Testing" or "Emergency"
**Why:** Safety constraint. Physical actuation must remain disabled until explicit dual-approval and production-readiness validation.

**Implication:** No "test actuation" mode that bypasses dry-run. All actuation is simulation-only for MVP duration.

**Future State:** Enabling physical actuation requires code changes, policy updates, dual-approval, and explicit acceptance of production risks.

---

### 12. Policy Changes Without Signed Commits or Ledger Evidence
**Why:** Governance integrity. All policy changes must be cryptographically signed, versioned, and recorded to the Audit Ledger.

**Implication:** No runtime policy hot-swaps, no unsigned YAML edits, no direct database policy updates. Git-signed commits only.

**Future State:** No exceptions planned; policy provenance is non-negotiable.

---

## MVP INTEGRATION SUMMARY

### What the MVP DOES:
- Accepts validated telemetry and writes ingestion receipts to ledger.
- Evaluates deterministic baseline rules and emits RED/BLACK risk signals.
- Creates hop-chains requiring dual-approval (operator + supervisor presence tokens).
- Issues signed permits referencing completed hop-chains.
- Simulates action enforcement with pre/post artifacts written to ledger (no physical actuation).
- Maintains append-only, cryptographically-chained Audit Ledger with fallback writes.
- Serves signed policy snapshots (read-only governance).
- Escalates alerts to local channels with ledgered delivery receipts.
- Validates evidence bundles for recovery eligibility (no automated recovery execution).

### What the MVP DOES NOT DO (by design):
- Physical device actuation (dry-run mode only).
- Autonomous ML decisions (deterministic rules only).
- Automated recovery orchestration (validation only).
- Silent success or audit bypass.
- Single-actor unilateral actions (dual-approval required).
- External network exposure for governance/actuation.
- Vendor-locked critical components.
- Real-time high-frequency actuation.
- Multi-node clustering.
- Anonymity guarantees.
- Dry-run bypass for "testing."
- Unsigned policy changes.

---

END OF FILE.
