============================================================
PRODUCTIZATION PHASE 05 — SECURITY & AUTH: IDENTITY FIRST
============================================================

OBJECTIVE
---------
Establish a security-first identity layer that governs every action.
No user, no authority.
No authority, no execution.

This phase defines authentication, authorization, and roles as
foundational infrastructure.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No duplicate auth systems
- No mixed token/session approaches
- No hardcoded secrets
- No bypass paths
- Security is a separate zone (/security)
- /core remains pure (no auth inside core)

------------------------------------------------------------

SECURITY ZONE LAYOUT
--------------------
/security
  /src
    /types
    /auth
    /policy
    /errors
    index.ts

------------------------------------------------------------

REQUIRED SECURITY CONCEPTS
--------------------------

IDENTITY
- id (string)
- handle (string)
- roles (string[])
- status (ACTIVE | SUSPENDED)

SESSION / TOKEN CLAIMS
- sub (identity id)
- roles
- iat
- exp
- jti

AUTH RESULT
- AUTHENTICATED | UNAUTHENTICATED
- identity (optional)
- reason (string)

AUTHZ RESULT
- AUTHORIZED | DENIED
- reason (string)
- policyId (string)

------------------------------------------------------------

AUTHENTICATION STRATEGY (BASELINE)
----------------------------------
- JWT access token
- Short-lived access tokens
- Refresh strategy defined later

No cookies required yet.
No OAuth required yet.
No third-party providers yet.

------------------------------------------------------------

AUTHORIZATION (POLICY ENGINE)
-----------------------------
- Role-based access control (RBAC) baseline
- Policies live in /security/policy
- Each API action maps to a required policy

Policies must be deterministic and explicit.

------------------------------------------------------------

ERROR MODEL
-----------
- AuthError
- PolicyError
- SecurityError

No silent failures.
Fail closed.

------------------------------------------------------------

INTEGRATION CONTRACT (CORE ↔ SECURITY)
--------------------------------------
- /security verifies identity + permission
- /core evaluates rules ONLY after authorization
- /core never knows about tokens
- /api is the bridge: security → core

------------------------------------------------------------

CRASH PREVENTION
----------------
- All auth functions return typed results
- No thrown exceptions uncaught
- No undefined identity states
- Deny on ambiguity

------------------------------------------------------------

DELIVERABLE OF PHASE 05
-----------------------
- Security zone compiles
- RBAC policy engine exists
- Typed auth/authz results exist
- verify passes
- No API routes required yet

------------------------------------------------------------

EXIT CRITERIA
-------------
- Identity + policy contract is stable
- Deny-by-default confirmed
- No duplicate auth logic anywhere else

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 06
"API GATEWAY — CORE + SECURITY WIRED TO HTTP"

END OF FILE
