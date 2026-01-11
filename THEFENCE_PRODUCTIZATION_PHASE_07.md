============================================================
PRODUCTIZATION PHASE 07 — AUDIT PIPELINE: APPEND-ONLY DECISION LOG
============================================================

OBJECTIVE
---------
Create an immutable audit pipeline that records every
authorized evaluation and decision.

If it is not logged, it did not happen.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- Append-only writes ONLY
- No updates, deletes, or overwrites
- No silent failures
- Audit lives in /audit only
- /core never writes audit
- /api emits audit events
- /audit never executes logic

------------------------------------------------------------

AUDIT ZONE LAYOUT
-----------------
/audit
  /src
    /types
    /writers
    /storage
    /errors
    index.ts

------------------------------------------------------------

AUDIT RECORD (MINIMUM FIELDS)
-----------------------------
- auditId (uuid)
- requestId
- eventId
- decision
- ruleId
- phase
- identityId
- policyId
- timestamp (ISO)
- hash (optional placeholder)

------------------------------------------------------------

WRITE STRATEGY (BASELINE)
------------------------
- File-based JSONL (one record per line)
- Write-once, append-only
- Daily rotation optional
- Flush on write

NO databases yet.
NO message queues yet.

------------------------------------------------------------

API → AUDIT FLOW
----------------
For every POST /v1/events/evaluate:

1) Auth passes
2) Policy passes
3) Core returns Decision
4) API constructs AuditRecord
5) Audit writer appends record
6) Response is returned to client

Audit write failure = request failure.

------------------------------------------------------------

ERROR MODEL
-----------
- AuditWriteError
- StorageError
- AuditConfigError

Fail closed. No retry loops.

------------------------------------------------------------

CRASH PREVENTION
----------------
- Synchronous append OR awaited async append
- Explicit fsync / flush
- No background buffering
- Deterministic file path

------------------------------------------------------------

DELIVERABLE OF PHASE 07
-----------------------
- Audit records written on every decision
- Audit file grows monotonically
- Restart-safe (no corruption)
- verify passes

------------------------------------------------------------

EXIT CRITERIA
-------------
- Decisions cannot occur without audit
- No duplicate audit writers
- Audit schema stable
- Append-only property enforced

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 08
"OPERATOR DASHBOARD — READ-ONLY INTELLIGENCE VIEW"

END OF FILE
