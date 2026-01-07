# THE FENCE — TECHNICAL REQUIREMENTS (NO CODE)
## Phase: Infrastructure
## Status: Engineering-Ready Specification

---

## SCOPE
Define **what must exist** for V1 to function.
Define **what must not exist** to prevent scope creep.

---

## NON-GOALS
- No prediction guarantees
- No autonomous decision-making
- No public dashboards
- No cross-domain intelligence
- No ML dependency in V1

---

## SYSTEM COMPONENTS (REQUIRED)

### COMPONENT 1 — INPUT GATEWAY
**Responsibility**
- Accept structured signal inputs for thermal data

**Accepted Inputs**
- CSV upload of sensor telemetry
- JSON API batch for weather feeds
- Manual event entry for checklists

**Constraints**
- Idempotent ingestion
- Schema validation for temperature/current
- Timestamp normalization

---

### COMPONENT 2 — BASELINE STORE
**Responsibility**
- Persist “normal” operating ranges for transmission lines

**Data**
- Metric name (e.g., temperature)
- Time window (e.g., hourly averages)
- Threshold bounds (min/max)

**Constraints**
- Read-heavy for comparisons
- Versioned baselines
- Human-editable for tuning

---

### COMPONENT 3 — DEVIATION EVALUATOR
**Responsibility**
- Compare incoming thermal signals to baseline

**Outputs**
- Deviation score from normal
- Breach flags for thresholds

**Constraints**
- Deterministic logic
- Configurable thresholds
- No probabilistic output

---

### COMPONENT 4 — RISK STATE ENGINE
**Responsibility**
- Map deviation to risk states for lines

**States**
- GREEN
- AMBER
- RED
- BLACK

**Constraints**
- Explicit transition rules on breaches
- No hidden state
- Auditable transitions

---

### COMPONENT 5 — ACTION ORCHESTRATOR
**Responsibility**
- Enforce preventive actions on thermal stress

**Actions**
- Notify team for monitoring
- Require verification audit
- Restrict load increases
- Activate load shedding

**Constraints**
- Human override required
- Action confirmation logged

---

### COMPONENT 6 — AUDIT LEDGER
**Responsibility**
- Immutable record of system behavior

**Records**
- Inputs received from sensors
- State transitions triggered
- Actions triggered or overridden
- Timestamps and user IDs

**Constraints**
- Append-only
- Time-ordered
- Exportable as CSV

---

## INTERFACES (CONCEPTUAL)

### INPUT INTERFACE
- Authenticated for operators
- Rate-limited to prevent overload
- Schema-enforced for thermal metrics

### OPERATOR INTERFACE
- View current risk state for lines
- Acknowledge actions manually
- Apply overrides with justification

### EXPORT INTERFACE
- Audit logs for compliance
- State history for reviews

---

## SECURITY REQUIREMENTS
- Role-based access for asset managers
- Least-privilege enforcement
- Full action traceability in audits

---

## PERFORMANCE REQUIREMENTS
- Batch processing acceptable for uploads
- Sub-minute state updates on new signals
- Graceful degradation on sensor failure

---

## DEPLOYMENT ASSUMPTIONS (V1)
- Single tenant for one utility
- Single environment (on-prem or cloud)
- Manual configuration of baselines

---

## OUT OF SCOPE (V1)
- Multi-tenancy
- Real-time streaming
- Predictive analytics
- Self-healing automation
- Third-party enforcement

---

## ACCEPTANCE CRITERIA
- Risk states change deterministically on breaches
- Actions cannot be bypassed silently
- Audit trail reconstructs incidents end-to-end

---

## DEPENDENCIES
- Reliable sensor and weather data sources
- Operator availability for overrides
- Clear escalation authority in org

---

## OPEN QUESTIONS
- Final threshold ownership by buyer
- Override governance policy
- Data retention limits for audits