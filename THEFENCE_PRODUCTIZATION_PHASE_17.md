============================================================
PRODUCTIZATION PHASE 17 — v2 FOUNDATION & INITIAL IMPLEMENTATION
============================================================

OBJECTIVE
---------
Lay the concrete foundation for THEFENCE v2 and begin initial
implementation strictly within the authorized scope.
This phase establishes the v2 workspace and proves that extension
can occur without contaminating v1.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- v1 code is READ-ONLY
- v2 code lives in an isolated namespace or branch
- No shared mutable state
- No duplicated logic copied from v1 without abstraction
- All v2 components must be removable without breaking v1

------------------------------------------------------------

v2 STRUCTURE (LOGICAL)
---------------------
/v2
  /core-extensions
  /api-extensions
  /foresight-extensions
  /security-extensions
  /infra
  /docs

No folder mirrors v1 exactly.
Extensions wrap or adapt; they do not fork blindly.

------------------------------------------------------------

INITIAL IMPLEMENTATION SCOPE
----------------------------
Only the following may be implemented in this phase:
- Extension interfaces
- Adapter boundaries
- Feature flags (default OFF)
- Read-only integration paths

No user-facing changes yet.

------------------------------------------------------------

CORE EXTENSION RULES
-------------------
- Core extensions must be pure functions
- No side effects
- No I/O
- Must accept v1 outputs as input
- Must return additive results only

------------------------------------------------------------

API EXTENSION RULES
------------------
- New endpoints must be versioned
- v1 endpoints untouched
- Auth and policy enforced identically
- Extensions may be disabled independently

------------------------------------------------------------

FORESIGHT EXTENSIONS
--------------------
- Build advanced signal combinators
- Correlation logic only
- No ML yet unless explicitly authorized
- Explainability required

------------------------------------------------------------

SECURITY EXTENSIONS
-------------------
- Additional roles or scopes (if approved)
- Stronger tenant isolation features
- No weakening of existing guarantees

------------------------------------------------------------

FEATURE FLAGGING
----------------
- All v2 functionality behind flags
- Flags default OFF
- Flags auditable
- Flags tenant-scoped

------------------------------------------------------------

VALIDATION REQUIREMENTS
-----------------------
- v1 behavior unchanged
- v2 code compiles independently
- Flags OFF → zero effect
- Flags ON → additive behavior only

------------------------------------------------------------

DELIVERABLE OF PHASE 17
-----------------------
- v2 skeleton exists
- Extension points defined
- One minimal extension implemented (non-user-facing)
- verify passes for v1 and v2

------------------------------------------------------------

EXIT CRITERIA
-------------
- v2 foundation stable
- No regression in v1
- Governance intact
- Ready for capability expansion

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 18
"v2 CAPABILITY BUILD-OUT & CONTROLLED EXPANSION"

END OF FILE
