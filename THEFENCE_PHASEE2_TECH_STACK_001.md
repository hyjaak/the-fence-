# PHASE E.2: TECH STACK SELECTION (REVERSIBLE)
## Phase: Execution
## Status: Defined

---

## OBJECTIVE
Define a minimal, reversible tech stack for single-node MVP deployment in a hostile environment. Every component must support replacement within ≤1 day and preserve audit integrity during transitions.

---

## CORE SYSTEM DOMAINS

### 1. TELEMETRY INGESTION
**Domain Purpose:** Validated, rate-limited collector; ephemeral queue + durable local store

**CANDIDATES:**

#### CANDIDATE A: Go HTTPS Collector + SQLite Durable Queue (REAL)
- **Why Chosen:** Single static binary, minimal runtime dependencies, durable local queue via SQLite WAL mode, easy cross-compilation, replaceable within hours.
- **Security Assumptions:** mTLS or signed provenance headers enforced at ingress; host filesystem hardened with ACLs; collector signing keys stored in TPM/encrypted local keystore; strict input schema validation and request rate-limiting applied.
- **Swap Replacement Options:** Vector (open-source observability agent), Fluent Bit (lightweight forwarder).
- **Marked:** REAL

#### CANDIDATE B: Vector Agent (DEFERRED)
- **Why Chosen:** Feature-rich, handles complex transformations and buffering; good mid-term option when telemetry scale and enrichment requirements increase.
- **Security Assumptions:** Run with local identity keys; TLS to all local services; config bundle signed and validated; file-permissions enforced on working directories.
- **Swap Replacement Options:** Go collector, Fluent Bit.
- **Marked:** DEFERRED

#### CANDIDATE C: File-Drop / Filesystem Staging (MOCK)
- **Why Chosen:** Very low friction for development and automated test vectors; easiest to reverse in seconds.
- **Security Assumptions:** Filesystem ACLs protect staging directory; signed files expected to prevent forgery; not suitable for hostile networks.
- **Swap Replacement Options:** Go collector, Vector.
- **Marked:** MOCK

**EXPLICITLY NOT CHOSEN:**
- Kafka/RabbitMQ: Heavy operational footprint, stateful cluster management, reversal cost >1 day for single-node MVP.
- Managed cloud ingestion services (AWS Kinesis, Azure Event Hubs): Vendor lock, data export friction, reversal cost >1 day.

---

### 2. AUDIT LEDGER
**Domain Purpose:** Append-only durable store with cryptographic chaining & signature proofs

**CANDIDATES:**

#### CANDIDATE A: SQLite Append-Only Ledger with SHA-256 Chaining + Entry Signatures (REAL)
- **Why Chosen:** Small footprint, single-file durability, easy offline inspection and backup/restore, minimal operational overhead, reversible in <1 day.
- **Security Assumptions:** DB file protected with strict ACLs and full-disk encryption or file-level encryption; every entry signed by IdentityKMS (TPM-backed or encrypted local keystore); immutable append-only schema enforced at application layer; hash chain verified on read.
- **Swap Replacement Options:** Git-backed ledger (signed commits), BadgerDB/LevelDB file store with same chaining logic.
- **Marked:** REAL

#### CANDIDATE B: Git Repository of Signed JSON Ledger Entries (GPG-Signed Commits) (REAL)
- **Why Chosen:** Familiar tooling, easy to clone/export/inspect, built-in cryptographic history via signed commits, reversible operations via checkout/branching.
- **Security Assumptions:** GPG keys stored in HSM/TPM or encrypted keystore; repository permissions locked to single writer; verify commit signatures before any ledger read; repo integrity validated on startup.
- **Swap Replacement Options:** SQLite ledger, bare filesystem blobs with hash manifest.
- **Marked:** REAL

#### CANDIDATE C: Embedded Replicated Ledger (etcd/raft) (DEFERRED)
- **Why Chosen:** Strong consistency guarantees for multi-node; considered only if cluster deployment required post-MVP.
- **Security Assumptions:** Secure cluster network with TLS+mTLS; protected key material for cluster peers; more complex operational security needs and larger attack surface.
- **Swap Replacement Options:** SQLite single-node ledger, Git-backed ledger.
- **Marked:** DEFERRED

**EXPLICITLY NOT CHOSEN:**
- Managed blockchain/ledger services (AWS QLDB, Azure Confidential Ledger): Vendor lock, data export friction, cost, reversal >1 day.
- Cluster-based systems (Cassandra, CockroachDB): Operational complexity and reversal/migration effort >1 day for single-node constraint.

---

### 3. DECISION HOP MANAGER
**Domain Purpose:** Hop-chain creation, ordering, permit issuance; persistent hop store

**CANDIDATES:**

#### CANDIDATE A: Lightweight Hop Manager (Go/Python Service) + SQLite Hop Store (REAL)
- **Why Chosen:** Simple REST/gRPC API, minimal statefulness, durable hop records in local append-only table enabling quick rollback or replacement; easy to audit and export.
- **Security Assumptions:** All hop records signed before commit; service signing keys in TPM/local keystore; strict validation preventing hop tampering or reordering; database ACLs enforced.
- **Swap Replacement Options:** Postgres-backed hop store, Temporal/workflow engine (if complex choreography needed later).
- **Marked:** REAL

#### CANDIDATE B: Postgres + Lightweight Orchestration API (DEFERRED)
- **Why Chosen:** Familiar relational DB when complex queries/joins or advanced indexing needed at scale; better transaction isolation guarantees.
- **Security Assumptions:** DB access controls, encrypted connections, keystore for DB credentials; incremental backup strategy required.
- **Swap Replacement Options:** SQLite hop store, Temporal.
- **Marked:** DEFERRED

#### CANDIDATE C: File-Based Hop Artifacts (MOCK)
- **Why Chosen:** Rapid test harness for decision-hop flows and forensic simulation in early development.
- **Security Assumptions:** Filesystem ACLs; signature embedded in file to detect tampering.
- **Swap Replacement Options:** SQLite hop store, Git ledger for hops.
- **Marked:** MOCK

**EXPLICITLY NOT CHOSEN:**
- Temporal/Cadence workflow engines: Heavy operational complexity, harder to reverse quickly; better suited for complex multi-step orchestrations beyond MVP scope.
- Managed workflow services (AWS Step Functions): Vendor lock and potential audit export friction.

---

### 4. POLICY & GOVERNANCE
**Domain Purpose:** Signed policy artifacts + override workflow; separate signing/validation service

**CANDIDATES:**

#### CANDIDATE A: Signed Policy Repository (Git) + Lightweight HTTP Policy Server (REAL)
- **Why Chosen:** Policies are artifacts — Git provides full provenance, signed commits/tags give non-repudiation; easy to freeze and publish last-signed snapshot during outage; minimal operational overhead.
- **Security Assumptions:** Policy signing keys in TPM or encrypted local keystore; only signed policy bundles accepted by services; repository permissions enforce single-writer or dual-approval workflow; working-tree integrity checked on startup.
- **Swap Replacement Options:** Open Policy Agent (OPA) with local bundle storage, simple YAML files served from secure filesystem.
- **Marked:** REAL

#### CANDIDATE B: Open Policy Agent (OPA) Local Bundle + Signed Bundle Distribution (DEFERRED)
- **Why Chosen:** Dedicated policy evaluation engine with decoupled bundle format; supports complex policy logic (Rego) and local evaluation without network dependencies.
- **Security Assumptions:** Bundles signed and verified at load time; OPA runs locally in read-only mode for governance queries; key material protected in HSM/local keystore; bundle storage encrypted.
- **Swap Replacement Options:** Signed Git repo, simple in-memory policy snapshots.
- **Marked:** DEFERRED

#### CANDIDATE C: Static YAML Policies Loaded at Startup (MOCK)
- **Why Chosen:** Fast to implement for experiments, unit tests, and proof-of-concept demonstrations.
- **Security Assumptions:** Filesystem ACLs and signature checks recommended; acceptable only for lab/dev environments.
- **Swap Replacement Options:** Signed Git repo, OPA.
- **Marked:** MOCK

**EXPLICITLY NOT CHOSEN:**
- Centralized managed policy services (cloud policy engines): Vendor lock, network dependencies, potential reversal time >1 day.
- Proprietary authorization systems: Expensive licensing, vendor lock, difficult to audit and reverse.

---

### 5. OPERATOR & SUPERVISOR CONSOLE (UI)
**Domain Purpose:** Human presence, signed acknowledgements — CLI-first + optional SPA

**CANDIDATES:**

#### CANDIDATE A: CLI-First TUI Emitting Signed JSON (WebAuthn/GPG) (REAL)
- **Why Chosen:** Minimal attack surface, quick to deliver, supports offline queueing of signed tokens, easily reversible/replaceable, supports scripted integration tests.
- **Security Assumptions:** Client device keys are device-bound (WebAuthn or protected GPG keyring); CLI verifies server TLS certificates; signed tokens validated server-side by IdentityKMS; session state encrypted at rest.
- **Swap Replacement Options:** Single-page app (SPA) with WebAuthn client certs, Electron desktop app.
- **Marked:** REAL

#### CANDIDATE B: Minimal SPA Served Over HTTPS with WebAuthn (DEFERRED)
- **Why Chosen:** Better ergonomics for operators and supervisors; supports richer evidence UI, session recordings, and visualizations.
- **Security Assumptions:** TLS with strict Content Security Policy (CSP); WebAuthn used for device-bound signatures; ephemeral session tokens stored encrypted in browser storage; no inline scripts or third-party dependencies.
- **Swap Replacement Options:** CLI TUI, Electron desktop app.
- **Marked:** DEFERRED

#### CANDIDATE C: Scripted Test Harness / Mock UI (MOCK)
- **Why Chosen:** Useful for integration tests, CI/CD pipelines, and automation; minimal code footprint.
- **Security Assumptions:** Signed files must be used for any permits; not for production operator use in hostile scenarios.
- **Swap Replacement Options:** CLI TUI, SPA.
- **Marked:** MOCK

**EXPLICITLY NOT CHOSEN:**
- Full Electron/desktop-native apps for MVP: Larger dependency surface, binary distribution complexity, higher reversal effort.
- Web-based admin panels with shared credentials: Weak presence guarantees, insufficient non-repudiation for doctrine requirements.

---

### 6. ESCALATION & NOTIFICATION
**Domain Purpose:** Alert multiplexer with ledgered delivery receipts

**CANDIDATES:**

#### CANDIDATE A: Local Multiplexer (SMTP + Webhooks + Syslog) (REAL)
- **Why Chosen:** Simple, easily auditable, uses standard protocols; local multiplexer can be stopped and swapped quickly; delivery receipts feed Audit Ledger for non-repudiation.
- **Security Assumptions:** TLS for all outbound channels; signed alert payloads with ledger references; credentials for remote channels stored in TPM/encrypted keystore; outbound-only connections to avoid direct internet exposure.
- **Swap Replacement Options:** Matrix (Synapse) local server, Signal CLI, SIP gateway.
- **Marked:** REAL

#### CANDIDATE B: Matrix (Synapse) Local Server for Secure Chat/Notices (DEFERRED)
- **Why Chosen:** End-to-end encrypted multi-channel communications with federation capability; good for secure operator channels if persistent, rich messaging required.
- **Security Assumptions:** Homeserver signing keys protected; federation disabled or tightly controlled for hostile environment; signed ledger references included in all messages; storage encrypted.
- **Swap Replacement Options:** SMTP multiplexer, Signal CLI.
- **Marked:** DEFERRED

#### CANDIDATE C: Local File / Terminal Pager (MOCK)
- **Why Chosen:** Immediate visibility in dev/test environments; reversible instantly.
- **Security Assumptions:** Filesystem ACLs; not for production use against hostile actors.
- **Swap Replacement Options:** SMTP multiplexer, Matrix.
- **Marked:** MOCK

**EXPLICITLY NOT CHOSEN:**
- Third-party cloud notification services (Twilio, AWS SNS, SendGrid): Vendor lock, dependency on external availability, potential reversal friction and data export challenges.
- Proprietary alerting platforms: Licensing costs, vendor lock, difficult to audit delivery receipts.

---

## IDENTITY & KEY MANAGEMENT (CROSS-CUTTING)

**PRIMARY APPROACH:**
- **TPM/YubiKey-Backed Signing Keys:** Preferred for all production deployments; hardware-protected keys provide strongest non-repudiation and are operator-verifiable offline.
- **Encrypted Local Keystore Fallback:** If TPM/HSM unavailable, use encrypted local keystore (age/GPG) protected by strong passphrase stored outside runtime node (operator-held).
- **Cloud KMS (DEFERRED):** Allowed only as a deferred option for multi-region or compliance scenarios; must be removable within 1 day via key export and local re-import.

**Security Assumptions:**
- All signing keys stored with access controls preventing exfiltration.
- Key rotation and revocation operations recorded to Audit Ledger prior to enforcement.
- Operator-controlled offline backup of signing public keys for forensic verification.
- Local keystore fallback must support key export/import in <1 day for node replacement scenarios.

---

## DEPLOYMENT CONSTRAINTS (SINGLE-NODE, HOSTILE ENVIRONMENT)

### Assumptions:
- Single-node deployment (no distributed consensus required for MVP).
- No trust in network, client devices, or operator endpoints beyond cryptographic proofs.
- All external inputs treated as hostile until validated and signed.
- No anonymity guarantees beyond what is defensible via cryptographic non-repudiation.
- No claims of "untraceable" or "impossible to hack" — system assumes breach and enforces auditability and recovery gating.

### Operational Rules:
- All control-plane actions gated by signed permits and audit writes.
- Fallback writers for ledger appends ensure auditability is never lost during partial failures.
- Kill-switches implemented for each component (stop process, pin signed read-only policies, rotate/revoke signing keys).
- Zone segmentation enforced via filesystem ACLs, process isolation, and network-level controls (VLANs/subnets where available).

---

## SUMMARY TABLE: DOMAIN → CHOSEN TECH (MVP)

| Domain | Chosen Technology | Type | Reversal Cost | Security Foundation |
|--------|------------------|------|---------------|---------------------|
| Telemetry Ingestion | Go HTTPS Collector + SQLite | REAL | <0.5 day | mTLS, TPM-backed keys, rate-limiting |
| Audit Ledger | SQLite append-only + SHA-256 chain | REAL | <1 day | Full-disk encryption, signed entries, hash chain |
| Decision Hops | Lightweight Hop Manager + SQLite | REAL | <0.5 day | TPM-backed signing, strict validation |
| Policy & Governance | Signed Git repo + HTTP policy server | REAL | <0.5 day | GPG/TPM-signed commits, read-only runtime |
| Operator UI | CLI-first TUI (WebAuthn/GPG) | REAL | <0.25 day | Device-bound keys, signed tokens |
| Escalation/Notifications | Local multiplexer (SMTP/webhook/syslog) | REAL | <0.5 day | TLS, signed payloads, ledgered receipts |

---

## NON-GOALS & EXPLICIT REJECTIONS

### Not Chosen for MVP:
- Heavy cluster-based systems (Kafka, etcd multi-node, Cassandra): Operational overhead and reversal cost >1 day.
- Managed cloud services for critical paths (QLDB, Kinesis, Step Functions): Vendor lock and data export friction.
- Autonomous ML-driven policy engines: Insufficient explainability and auditability for doctrine compliance.
- Full browser-based admin UIs with shared credentials: Weak non-repudiation and presence guarantees.
- Proprietary or closed-source components for Audit Ledger, Identity, or Governance: Unauditable, difficult to reverse, licensing lock.

### Dangerous Shortcuts Avoided:
- Bypassing audit writes for "performance."
- Exposing private signing keys or co-locating governance with low-level actuation.
- Accepting unsigned permits or unvalidated provenance.
- Single-actor unilateral recovery or override paths.
- Silent success paths without ledger evidence.

---

*End of tech stack definition.*
