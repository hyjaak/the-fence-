============================================================
PRODUCTIZATION PHASE 08 — OPERATOR DASHBOARD: READ-ONLY INTELLIGENCE VIEW
============================================================

OBJECTIVE
---------
Build a read-only operator dashboard that visualizes:
- incoming events
- decisions
- audit trail
- trends (basic)
without granting execution authority.

UI observes. UI does not control.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- UI is READ-ONLY
- No privileged actions from UI
- No direct access to /core
- UI talks ONLY to /api
- No secrets in UI
- No duplicate pages/components for same feature

------------------------------------------------------------

UI ZONE LAYOUT
--------------
/ui
  /src
    /app
    /components
    /pages
    /types
    /services
    /errors
    index.tsx

------------------------------------------------------------

API ENDPOINTS REQUIRED (READ-ONLY)
----------------------------------
- GET /v1/audit/recent
- GET /v1/audit/by-event/:eventId
- GET /v1/audit/by-rule/:ruleId
- GET /v1/metrics/summary

UI must not infer missing data.

------------------------------------------------------------

DASHBOARD SCREENS (MINIMUM)
---------------------------
1) Overview
- totals: events, allow/deny/noop
- last 24h trend (basic counts)
- top triggering rules

2) Live Feed
- recent audit records (descending)
- filter: outcome, phase, ruleId

3) Drilldown
- event detail view
- decision reason
- rule + phase reference
- linked audit entries

------------------------------------------------------------

AUTH IN UI (READ-ONLY SESSION)
------------------------------
- UI stores token securely (no localStorage if avoidable)
- Token used only to call API
- If token expires → redirect to login
- No bypass.

------------------------------------------------------------

CRASH PREVENTION
----------------
- Empty state handling (no records)
- Loading states
- Error states
- Pagination or limit to avoid UI overload
- Strict typing on API responses

------------------------------------------------------------

DELIVERABLE OF PHASE 08
-----------------------
- Dashboard loads
- Shows recent decisions
- Can filter and drill down
- No write actions exist
- verify passes

------------------------------------------------------------

EXIT CRITERIA
-------------
- Operator visibility achieved
- No authority leakage
- UI is stable and deterministic
- No duplicate UI paths for same function

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 09
"FORESIGHT LAYER — SCORING, WATCHLISTS, EARLY WARNING"

END OF FILE
