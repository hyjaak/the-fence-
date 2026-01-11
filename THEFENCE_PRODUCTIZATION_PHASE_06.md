============================================================
PRODUCTIZATION PHASE 06 — API GATEWAY: CORE + SECURITY → HTTP
============================================================

OBJECTIVE
---------
Build the minimal HTTP API that:
- authenticates requests (via /security)
- authorizes actions (RBAC policy)
- accepts Event input
- executes /core rule evaluation deterministically
- returns Decision output
- never bypasses governance

This phase makes THEFENCE usable.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No duplicate servers
- No duplicate routers
- No duplicate auth middleware
- /core remains pure (no I/O)
- /security owns auth/authz (no auth logic in /api)
- Fail closed (deny on ambiguity)
- No UI work in this phase

------------------------------------------------------------

API ZONE LAYOUT
--------------
/api
  /src
    /server
    /routes
    /middleware
    /types
    /errors
    index.ts

------------------------------------------------------------

INSTALLS (ONLY IF NOT PRESENT)
------------------------------
- A minimal HTTP server framework
- Request validation library (optional but recommended)

Do NOT install:
- database clients
- ORMs
- UI packages
- websocket packages
- message queues

------------------------------------------------------------

REQUIRED API CONCEPTS
---------------------

REQUEST CONTEXT
- requestId
- timestamp
- identity (optional until auth passes)
- policyResult
- trace (append-only)

ENDPOINTS (MINIMUM)
1) GET /health
- returns 200 OK
- no auth required

2) POST /v1/events/evaluate
- auth REQUIRED
- policy REQUIRED
- accepts Event payload
- returns Decision JSON

------------------------------------------------------------

AUTH FLOW (MANDATORY ORDER)
---------------------------
For POST /v1/events/evaluate:

1) Extract token (Authorization: Bearer <token>)
2) Authenticate via /security
3) Authorize via /security policy engine
4) Validate Event payload (schema)
5) Call /core engine with deterministic ruleset
6) Return Decision

If any step fails: return error and STOP.

------------------------------------------------------------

ERROR MODEL
-----------
- 400 ValidationError
- 401 Unauthenticated
- 403 Forbidden
- 500 ServerError

No ambiguous 200 responses.
No partial success.

------------------------------------------------------------

CRASH PREVENTION
----------------
- Always wrap handler execution
- No uncaught throws
- Return typed error response
- RequestId always present
- Deterministic response shape

------------------------------------------------------------

DELIVERABLE OF PHASE 06
-----------------------
- Server starts reliably
- /health returns OK
- /v1/events/evaluate:
  - rejects missing token
  - rejects unauthorized roles
  - accepts valid Event
  - returns Decision from core
- lint + typecheck + verify pass

------------------------------------------------------------

EXIT CRITERIA
-------------
- API is the only network boundary
- Security gate cannot be bypassed
- Core executes only after authz
- No duplicates in middleware/routes

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 07
"AUDIT PIPELINE — APPEND-ONLY DECISION LOG"

END OF FILE
