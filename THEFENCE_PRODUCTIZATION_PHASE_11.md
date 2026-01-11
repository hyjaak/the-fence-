============================================================
PRODUCTIZATION PHASE 11 — MULTI-TENANCY, PLANS & BILLING READINESS
============================================================

OBJECTIVE
---------
Prepare THEFENCE for multiple customers (tenants) while preserving
strict isolation, governance, and audit integrity.
Introduce plan boundaries without coupling to payment providers yet.

This phase enables selling without monetization lock-in.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No data leakage across tenants
- No shared mutable state
- No cross-tenant audit access
- No billing logic in /core
- Tenant context is mandatory everywhere
- Default deny on missing tenantId

------------------------------------------------------------

TENANCY MODEL
-------------
TENANT
- tenantId
- name
- plan (FREE | PRO | ENTERPRISE)
- status (ACTIVE | SUSPENDED)
- createdAt

TENANT CONTEXT
- tenantId
- plan
- limits (derived, not stored)
- enforcedAt (timestamp)

------------------------------------------------------------

PLAN CAPABILITIES (BASELINE)
----------------------------
FREE
- Limited events/day
- No foresight warnings
- No alert routing
- Short audit retention

PRO
- Higher event limits
- Foresight enabled
- Alerts enabled
- Extended audit retention

ENTERPRISE
- Unlimited events
- Advanced foresight
- Custom policies
- Long retention
- Priority support hooks

Plans define limits, not permissions.

------------------------------------------------------------

ZONE RESPONSIBILITIES
--------------------

/security
- Identity belongs to exactly one tenant
- Roles scoped per tenant
- Cross-tenant access forbidden

/api
- Extracts tenantId from auth context
- Enforces plan limits
- Rejects over-limit requests

/core
- Receives tenant-scoped events only
- No awareness of plans or billing

/audit
- Stores tenantId with every record
- Enforces retention per plan

/ui
- Tenant-scoped views only
- No cross-tenant navigation

------------------------------------------------------------

LIMIT ENFORCEMENT
-----------------
- Event ingestion limits checked pre-core
- Alert limits checked pre-delivery
- Hard denial on limit breach
- Limit breach is auditable

------------------------------------------------------------

CRASH PREVENTION
----------------
- Missing tenantId → request denied
- Unknown plan → denied
- Plan downgrade handled gracefully
- No silent truncation

------------------------------------------------------------

DELIVERABLE OF PHASE 11
-----------------------
- Tenant isolation enforced end-to-end
- Plan limits applied deterministically
- Audit records tenant-scoped
- UI reflects tenant context
- verify passes

------------------------------------------------------------

EXIT CRITERIA
-------------
- No cross-tenant access possible
- Plans affect behavior predictably
- No billing provider coupled yet

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 12
"PRODUCTION HARDENING, DEPLOYMENT & GO-TO-MARKET READINESS"

END OF FILE
