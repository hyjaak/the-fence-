# PHASE E.2: REVERSIBILITY MATRIX
## Phase: Execution
## Status: Defined

---

## OBJECTIVE
Map each tech stack component to its replacement cost, migration risk, security regression risk, and kill-switch strategy. Classify components as SAFE-TO-SWAP or HARD-LOCK based on reversal constraints.

---

## REVERSIBILITY CRITERIA

### Classification Rules:
- **SAFE-TO-SWAP:** Replacement cost ≤0.5 days, low data migration risk, kill-switch available, minimal security regression risk.
- **HARD-LOCK:** Replacement cost >0.5 days OR medium/high data migration risk OR high security regression risk OR critical to audit integrity.

### Risk Levels:
- **Low:** Minimal impact; standard procedures sufficient; no data loss or security compromise expected.
- **Medium:** Moderate impact; requires careful planning; potential for minor data loss or temporary security degradation.
- **High:** Significant impact; requires extensive validation; risk of data loss, security compromise, or audit gap.

---

## REVERSIBILITY MATRIX

### 1. TELEMETRY INGESTION

| Component | Default Choice | Type | Replacement Cost | Data Migration Risk | Security Regression Risk | Classification | Kill-Switch Strategy |
|-----------|---------------|------|------------------|---------------------|-------------------------|----------------|---------------------|
| **Go HTTPS Collector + SQLite Queue** | Primary | REAL | 0.5 days | Low | Low | SAFE-TO-SWAP | Stop process; rename collector DB to `.disabled`; enforce network-level ACL to block collector port; place gateway into read-only mode accepting writes to local staging folder only. |
| **Vector Agent** | Alternative | DEFERRED | 0.5 days | Low | Low | SAFE-TO-SWAP | Stop Vector process; export buffered data to durable queue; switch ingestion endpoint to replacement collector. |
| **File-Drop Staging** | Dev/Test | MOCK | <0.1 days | Low | Low (dev only) | SAFE-TO-SWAP | Disable file-watch process; move staging directory to read-only; clear pending file queue. |

**Security Assumptions:**
- mTLS or signed provenance headers enforced at ingress.
- Collector signing keys stored in TPM/encrypted local keystore.
- Filesystem ACLs protect all queue storage.
- Input validation and rate-limiting prevent resource exhaustion.

**Migration Notes:**
- SQLite queue can be exported as JSON and replayed into replacement system.
- Queue durability ensures no telemetry loss during swap.

---

### 2. AUDIT LEDGER

| Component | Default Choice | Type | Replacement Cost | Data Migration Risk | Security Regression Risk | Classification | Kill-Switch Strategy |
|-----------|---------------|------|------------------|---------------------|-------------------------|----------------|---------------------|
| **SQLite Append-Only Ledger (SHA-256 Chain)** | Primary | REAL | 1.0 days | Low | Medium | HARD-LOCK | Stop write path by setting ledger flag to read-only (file rename or chmod 444); leave ledger reader alive for audit queries; spin up fallback writer that appends to signed ledger fragments for later merge. |
| **Git Signed Commits Ledger** | Alternative | REAL | 1.0 days | Low | Medium | HARD-LOCK | Stop commit process; tag current HEAD with emergency-freeze tag; export repo as tarball; switch to read-only clone for queries. |
| **Embedded Replicated Ledger (etcd/raft)** | Future | DEFERRED | >1.0 days | Medium | High | HARD-LOCK | Initiate graceful cluster shutdown; export snapshot; downgrade to single-node SQLite ledger via snapshot replay. |

**Security Assumptions:**
- Every entry signed by IdentityKMS (TPM-backed or encrypted local keystore).
- DB file protected with strict ACLs and full-disk encryption.
- Hash chain verified on every read operation.
- Immutable append-only schema enforced at application layer.

**Migration Notes:**
- SQLite ledger can be exported as signed JSON lines and re-imported.
- Git ledger supports native clone/export with full cryptographic history.
- Any migration must preserve signature chain and hash integrity.

---

### 3. DECISION HOP MANAGER

| Component | Default Choice | Type | Replacement Cost | Data Migration Risk | Security Regression Risk | Classification | Kill-Switch Strategy |
|-----------|---------------|------|------------------|---------------------|-------------------------|----------------|---------------------|
| **Lightweight Hop Manager + SQLite** | Primary | REAL | 0.5 days | Low | Low | SAFE-TO-SWAP | Stop service; set governance policy snapshot to `no-issue-permits` (signed policy commit) so Action Enforcement rejects new permits; pending hop records remain readable for forensics; export hop DB as JSON. |
| **Postgres + Orchestration API** | Alternative | DEFERRED | 0.75 days | Medium | Low | HARD-LOCK (if used) | Stop API service; dump Postgres DB to SQL export; switch to read-only Postgres replica while replacement service is deployed. |
| **File-Based Hop Artifacts** | Dev/Test | MOCK | <0.1 days | Low | Low (dev only) | SAFE-TO-SWAP | Stop file-watcher; archive hop files to read-only directory. |

**Security Assumptions:**
- All hop records signed before commit.
- Service signing keys in TPM/local keystore.
- Strict validation preventing hop tampering or reordering.
- Database ACLs enforced.

**Migration Notes:**
- SQLite hop store can be exported as structured JSON for replay.
- Postgres requires standard SQL dump/restore procedures.

---

### 4. POLICY & GOVERNANCE

| Component | Default Choice | Type | Replacement Cost | Data Migration Risk | Security Regression Risk | Classification | Kill-Switch Strategy |
|-----------|---------------|------|------------------|---------------------|-------------------------|----------------|---------------------|
| **Signed Git Policy Repo + HTTP Server** | Primary | REAL | 0.5 days | Low | Low | SAFE-TO-SWAP | Publish and pin last-known signed policy snapshot containing `no-issue-permits` flag; revoke policy-signing keys in keystore (rotate to emergency key that only issues read-only bundles); stop HTTP server and serve static snapshot from filesystem. |
| **Open Policy Agent (OPA) + Bundles** | Alternative | DEFERRED | 0.5 days | Low | Low | SAFE-TO-SWAP | Stop OPA runtime; export last-signed bundle to filesystem; serve bundle via simple HTTP server or embed directly in consuming services. |
| **Static YAML Policies** | Dev/Test | MOCK | <0.1 days | Low | Low (dev only) | SAFE-TO-SWAP | Copy YAML to read-only location; stop dynamic policy loading. |

**Security Assumptions:**
- Policy signing keys in TPM or encrypted local keystore.
- Only signed policy bundles accepted by services.
- Repository permissions enforce single-writer or dual-approval workflow.
- Working-tree integrity checked on startup.

**Migration Notes:**
- Git repo can be cloned with full history preservation.
- OPA bundles are portable JSON/Rego files.
- Any policy migration must maintain signature chain.

---

### 5. OPERATOR & SUPERVISOR CONSOLE (UI)

| Component | Default Choice | Type | Replacement Cost | Data Migration Risk | Security Regression Risk | Classification | Kill-Switch Strategy |
|-----------|---------------|------|------------------|---------------------|-------------------------|----------------|---------------------|
| **CLI-First TUI (WebAuthn/GPG)** | Primary | REAL | 0.25 days | Low | Low | SAFE-TO-SWAP | Disable UI process; accept queued signed tokens from filesystem only; publish read-only management UI for audit review; rotate device keys if compromise suspected. |
| **Minimal SPA (WebAuthn)** | Alternative | DEFERRED | 0.5 days | Low | Low | SAFE-TO-SWAP | Disable web server; serve static read-only audit viewer; queue signed acknowledgements to filesystem for later replay. |
| **Scripted Test Harness** | Dev/Test | MOCK | <0.1 days | Low | Low (dev only) | SAFE-TO-SWAP | Stop script execution; archive signed test files. |

**Security Assumptions:**
- Client device keys are device-bound (WebAuthn or protected GPG keyring).
- CLI/SPA verifies server TLS certificates.
- Signed tokens validated server-side by IdentityKMS.
- Session state encrypted at rest.

**Migration Notes:**
- Signed tokens are portable JSON files.
- UI replacement requires re-enrollment of device-bound keys (WebAuthn/GPG).

---

### 6. ESCALATION & NOTIFICATION

| Component | Default Choice | Type | Replacement Cost | Data Migration Risk | Security Regression Risk | Classification | Kill-Switch Strategy |
|-----------|---------------|------|------------------|---------------------|-------------------------|----------------|---------------------|
| **Local Multiplexer (SMTP/Webhook/Syslog)** | Primary | REAL | 0.5 days | Low | Low | SAFE-TO-SWAP | Stop outbound channels; log alerts locally and write to ledger; operator-visible emergency channel remains (local console) for immediate directives; export pending delivery receipts. |
| **Matrix (Synapse) Server** | Alternative | DEFERRED | 0.75 days | Medium | Medium | HARD-LOCK (if used) | Stop Synapse server; export room history and receipts; disable federation; switch to SMTP fallback for critical alerts. |
| **Local File / Terminal Pager** | Dev/Test | MOCK | <0.1 days | Low | Low (dev only) | SAFE-TO-SWAP | Stop file-watch; archive alert files. |

**Security Assumptions:**
- TLS for all outbound channels.
- Signed alert payloads with ledger references.
- Credentials for remote channels stored in TPM/encrypted keystore.
- Outbound-only connections to avoid direct internet exposure.

**Migration Notes:**
- Delivery receipts are ledger entries; no separate migration required.
- SMTP queue can be exported and replayed if needed.

---

### 7. IDENTITY & KEY MANAGEMENT (CROSS-CUTTING)

| Component | Default Choice | Type | Replacement Cost | Data Migration Risk | Security Regression Risk | Classification | Kill-Switch Strategy |
|-----------|---------------|------|------------------|---------------------|-------------------------|----------------|---------------------|
| **TPM/YubiKey-Backed Keys** | Primary | REAL | 0.75 days | Medium | High | HARD-LOCK | Rotate signing key to emergency-revoke key (immediately invalidates newly signed permits); if hardware present, physically remove or put TPM/HSM into lockdown; fallback uses rotated keystore but emergency freeze enforced by governance policy. |
| **Encrypted Local Keystore (age/GPG)** | Fallback | REAL | 0.5 days | Medium | High | HARD-LOCK | Rotate keys to new keystore; export old public keys for audit verification; re-issue all service credentials and device enrollments. |
| **Cloud KMS (AWS/Azure)** | Future | DEFERRED | 1.0 days | High | High | HARD-LOCK | Export signing keys to encrypted local keystore; rotate credentials; migrate all signature verification to local keys; terminate cloud KMS access. |

**Security Assumptions:**
- All signing keys stored with access controls preventing exfiltration.
- Key rotation and revocation operations recorded to Audit Ledger prior to enforcement.
- Operator-controlled offline backup of signing public keys for forensic verification.
- Local keystore fallback must support key export/import in <1 day.

**Migration Notes:**
- TPM/HSM key migration requires re-enrollment of all devices and services.
- Local keystore can be exported and re-imported on replacement node.
- Cloud KMS migration requires careful credential rotation to avoid lockout.

---

## CLASSIFICATION SUMMARY

### SAFE-TO-SWAP Components (Reversal ≤0.5 days, Low Risk):
- Telemetry Ingestion (Go Collector, Vector, File-Drop)
- Decision Hop Manager (SQLite-backed)
- Policy & Governance (Git repo, OPA)
- Operator UI (CLI TUI, SPA)
- Escalation & Notification (SMTP multiplexer)

### HARD-LOCK Components (Reversal >0.5 days OR Med/High Risk):
- Audit Ledger (SQLite, Git, etcd) — Critical to audit integrity; medium security regression risk
- Identity & Key Management (TPM, Local Keystore, Cloud KMS) — High security regression risk; medium/high data migration risk
- Decision Hop Manager (Postgres-backed) — Medium data migration risk if used
- Escalation & Notification (Matrix) — Medium migration and security risk if used

---

## KILL-SWITCH DECISION TREE

### Emergency Freeze (All Operations):
1. Rotate IdentityKMS signing key to emergency-revoke key.
2. Publish signed governance policy with `no-issue-permits` and `read-only-mode` flags.
3. Stop all write paths to Audit Ledger; activate fallback writer.
4. Disable UI processes; accept only queued signed tokens.
5. Stop Escalation & Notification outbound channels; log locally only.

### Partial Component Failure:
1. **Telemetry Ingestion:** Activate fallback queue; buffer to durable storage.
2. **Audit Ledger:** Activate fallback writer; queue appends for later merge.
3. **Decision Hop Manager:** Freeze new hop creation; allow read-only queries.
4. **Policy & Governance:** Serve last-signed snapshot; refuse new overrides.
5. **Identity/KMS:** Emergency key rotation; freeze new enrollments.
6. **Operator UI:** Queue signed tokens to filesystem; serve read-only audit viewer.
7. **Escalation:** Log alerts to ledger only; suspend outbound delivery.

### Component Swap Procedure:
1. Record swap intent to Audit Ledger (signed by operator + supervisor).
2. Execute component-specific kill-switch from matrix above.
3. Export data using migration notes (JSON, SQL dump, Git clone, etc.).
4. Deploy replacement component.
5. Import data and verify integrity (hash chains, signatures).
6. Resume operations; record swap completion to Audit Ledger.
7. Validate end-to-end flow with test transaction.

---

## REVERSAL COST BUDGET (SINGLE-NODE MVP)

| Scenario | Max Reversal Cost | Critical Path |
|----------|------------------|---------------|
| **Swap Telemetry Ingestion** | 0.5 days | Export queue → deploy replacement → replay buffered telemetry |
| **Swap Audit Ledger** | 1.0 days | Stop writes → export signed entries → deploy replacement → import with signature verification |
| **Swap Decision Hop Manager** | 0.5 days | Freeze permits → export hop DB → deploy replacement → resume |
| **Swap Policy & Governance** | 0.5 days | Pin last-signed snapshot → export repo → deploy replacement |
| **Swap Operator UI** | 0.25 days | Queue signed tokens → deploy replacement → re-enroll device keys |
| **Swap Escalation & Notification** | 0.5 days | Export delivery receipts → deploy replacement → resume outbound |
| **Rotate Identity/KMS Keys** | 0.75 days | Emergency key rotation → re-issue service creds → re-enroll devices |
| **Full Stack Replacement** | 2.0 days | Sequential component swaps following dependency order (KMS → Ledger → Governance → Hops → Others) |

---

## SECURITY REGRESSION MITIGATION

### High-Risk Swaps (Audit Ledger, Identity/KMS):
- Require dual-approval (operator + supervisor) with signed permits.
- Record swap intent, execution steps, and completion to Audit Ledger.
- Verify signature chains and hash integrity post-migration.
- Perform end-to-end smoke test before resuming production operations.

### Medium-Risk Swaps (Escalation/Matrix, Postgres Hop Store):
- Single-approval with signed permit.
- Record swap to Audit Ledger.
- Verify data export integrity before decommissioning old component.

### Low-Risk Swaps (All SAFE-TO-SWAP components):
- Operational approval sufficient; record swap to Audit Ledger.
- Standard export/import procedures; integrity checks recommended.

---

END OF FILE.
