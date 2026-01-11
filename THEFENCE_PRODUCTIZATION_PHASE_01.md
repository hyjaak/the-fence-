============================================================
PRODUCTIZATION PHASE 01 — FOUNDATION & REPOSITORY LAYOUT
============================================================

OBJECTIVE
---------
Establish a clean, enforceable foundation for productization.
Define structure, boundaries, and rules BEFORE any code exists.

This phase prevents future chaos.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No duplicate files
- No duplicate concepts
- No cross-zone writes
- No editing /canon
- No code generation yet
- No installs yet
- Structure first, behavior later

------------------------------------------------------------

REPOSITORY ROOT
---------------
/thefence
  ├─ /canon        (READ-ONLY)
  ├─ /core
  ├─ /api
  ├─ /ui
  ├─ /infra
  ├─ /audit
  ├─ /security
  ├─ /docs
  └─ README.md

------------------------------------------------------------

ZONE DEFINITIONS
----------------

/canon
- Contains Phases 01–55
- READ-ONLY
- No imports, no exports
- Doctrine only

/core
- Execution logic
- Rule engine
- Deterministic decision flow
- No UI, no network calls

/api
- External interface layer
- Auth-gated
- Calls core, never canon

/ui
- Operator dashboard
- Visualization only
- Zero authority

/infra
- Build
- Deploy
- Runtime config
- Environments

/audit
- Logs
- Evidence
- Append-only artifacts

/security
- Auth
- Keys
- Trust boundaries
- Zero-trust enforcement

/docs
- Human explanations
- Sales, onboarding, compliance

------------------------------------------------------------

BOUNDARY ENFORCEMENT
--------------------
- canon → readable by all, writable by none
- core → callable only by api
- ui → reads api only
- audit → write-only by system
- security → wraps everything

------------------------------------------------------------

CRASH PREVENTION
----------------
- Empty folders allowed
- No circular dependencies
- No auto-generation
- No assumptions

------------------------------------------------------------

DELIVERABLE OF PHASE 01
-----------------------
- Folder structure exists
- README explains zones & rules
- No code files required

------------------------------------------------------------

EXIT CRITERIA
-------------
- Structure created
- Rules understood
- No violations

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 02
"TECH STACK SELECTION & RUNTIME STRATEGY"

END OF FILE
