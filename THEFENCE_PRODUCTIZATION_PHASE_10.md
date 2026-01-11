============================================================
PRODUCTIZATION PHASE 10 — WATCHLIST MANAGEMENT & ALERT ROUTING
============================================================

OBJECTIVE
---------
Enable controlled configuration of watchlists and deterministic
alert routing so foresight outputs reach the right humans/systems
without granting execution authority.

Configuration is governed.
Delivery is reliable.
No noise.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No duplicate watchlists
- No overlapping alert routes without priority
- No write access from UI to core
- Configuration changes are audited
- Alerts are deterministic and explainable
- Fail closed on ambiguity

------------------------------------------------------------

SCOPE
-----
- Watchlist definitions (CRUD with governance)
- Alert routes (email/webhook baseline)
- Severity thresholds
- Quiet hours / rate limits
- Evidence attachment

------------------------------------------------------------

DATA MODELS (MINIMUM)
--------------------

WATCHLIST
- watchId
- name
- description
- matchRules (explicit matchers)
- severityBias (optional)
- enabled
- createdBy
- createdAt

ALERT ROUTE
- routeId
- type (EMAIL | WEBHOOK)
- destination
- minSeverity
- rateLimit
- quietHours (optional)
- enabled

ALERT EVENT
- alertId
- warningId
- severity
- title
- message
- evidence (signals)
- deliveredAt
- routeId

------------------------------------------------------------

ZONE RESPONSIBILITIES
--------------------

/core
- Computes foresight scores and warnings ONLY
- No delivery logic

/api
- Validates config changes
- Enforces authz policies
- Triggers alert delivery

/security
- Authorizes who can manage watchlists/routes

/audit
- Records:
  - config changes
  - alert delivery attempts
  - successes/failures

/ui
- Read/write for configuration ONLY
- Read-only for alerts stream

------------------------------------------------------------

ALERT TRIGGER RULES
-------------------
An alert is emitted when:
- A warning is created AND
- Severity ≥ route.minSeverity AND
- Route is enabled AND
- Rate limits allow

All conditions must pass.

------------------------------------------------------------

DELIVERY BASELINE
-----------------
- Email: SMTP or provider API
- Webhook: HTTPS POST with signed payload

No SMS.
No push notifications.
No retries without policy.

------------------------------------------------------------

CRASH PREVENTION
----------------
- Alert delivery failures are logged
- No infinite retry loops
- Backoff is deterministic
- Alert failure does NOT block decision path

------------------------------------------------------------

DELIVERABLE OF PHASE 10
-----------------------
- Watchlists configurable
- Alerts delivered deterministically
- Evidence included
- Audit trail complete
- UI supports config + alert viewing

------------------------------------------------------------

EXIT CRITERIA
-------------
- No duplicate watchlists or routes
- Alerts are predictable and explainable
- Audit captures all config + delivery events

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 11
"MULTI-TENANCY, PLANS & BILLING READINESS"

END OF FILE
