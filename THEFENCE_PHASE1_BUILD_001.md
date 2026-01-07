# THE FENCE — BUILD PREP (NO CODE)
## Phase: Infrastructure
## Status: Build-Ready Definition

---

## OBJECTIVE
Translate the locked Phase-1 concept into **clear build boundaries and modules** so coding can start clean, small, and controlled.

---

## BUILD RULES (LOCKED)
- No new ideas
- No scope expansion
- No predictions
- Human-in-the-loop allowed
- Manual > Automated (initially)
- Small, testable modules only

---

## SYSTEM BOUNDARIES

### WHAT THE FENCE DOES
- Detects weak operational signals in thermal data
- Evaluates deviation from baseline in transmission lines
- Assigns **risk states** based on thresholds
- Forces **preventive actions** like audits and restrictions
- Records immutable audit events for accountability

### WHAT THE FENCE DOES NOT DO
- No surveillance of individuals
- No certainty claims on failures
- No autonomous decisions without override
- No analytics dashboards for “everyone”
- No cross-domain intelligence

---

## CORE MODULES (CONCEPTUAL)

### MODULE 1 — SIGNAL INTAKE
**Purpose:** Capture inputs safely and consistently  
**Inputs:**
- Line sensor telemetry
- Weather station feeds
- Load balancing logs
- Manual checklists

**Notes:**
- Start with CSV/API/manual upload
- No real-time streaming required v1

---

### MODULE 2 — BASELINE & DEVIATION
**Purpose:** Understand “normal” for thermal metrics  
**Functions:**
- Baseline creation from historical data
- Deviation thresholds for temperature and current
- Drift detection in patterns

**Notes:**
- Simple rules first
- No ML dependency required v1

---

### MODULE 3 — RISK STATE ENGINE
**Purpose:** Translate deviation into action levels  
**States:**
- GREEN — Normal thermal metrics
- AMBER — Elevated temperature detected
- RED — Stress indicators exceed thresholds
- BLACK — Critical overheating confirmed

**Notes:**
- Deterministic logic based on breaches
- Configurable thresholds

---

### MODULE 4 — PREVENTION ACTIONS
**Purpose:** Force intervention before failure  
**Actions:**
- Notify team for monitoring
- Mandate verification audit
- Restrict load increases
- Activate load shedding

**Notes:**
- Actions are enforced, not advisory

---

### MODULE 5 — AUDIT MEMORY
**Purpose:** Accountability and learning  
**Records:**
- Signals received from sensors
- State transitions triggered
- Actions taken or overridden
- Timestamps and user acknowledgments

**Notes:**
- Append-only
- Tamper-resistant design later

---

## MANUAL VS AUTOMATED (V1)

### MANUAL
- Signal review and upload
- Threshold tuning
- Override decisions on actions
- Incident resolution logging

### AUTOMATED
- Signal ingestion from feeds
- State transitions on breaches
- Action triggering based on states
- Audit logging of events

---

## FIRST USABLE VERSION (V1)

### USERS
- Asset managers
- Reliability engineers

### CAN DO
- Upload thermal signals
- See current risk state
- Trigger/acknowledge actions
- Review audit trail

### VALUE (WEEK 1)
- Earlier intervention on thermal stress
- Reduced fault-related downtime
- Clear accountability for decisions

---

## OUT OF SCOPE (V1)
- Advanced ML for predictions
- Predictive analytics
- Cross-system orchestration
- Public-facing UI
- Multi-tenant complexity

---

## BUILD READINESS CHECKLIST
- [x] Modules defined
- [x] Boundaries enforced
- [x] Manual steps identified
- [x] V1 success criteria clear

---