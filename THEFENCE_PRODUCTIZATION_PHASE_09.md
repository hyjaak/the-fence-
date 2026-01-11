============================================================
PRODUCTIZATION PHASE 09 — FORESIGHT LAYER: SCORING, WATCHLISTS, EARLY WARNING
============================================================

OBJECTIVE
---------
Add intelligence features that allow THEFENCE to:
- score risk
- detect patterns
- raise early warnings
- suggest preventative posture
WITHOUT introducing black-box behavior.

Foresight must be explainable.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No ML required in this phase
- No opaque scoring
- No hidden heuristics
- Every score must have reasons
- Foresight lives in /core as PURE computation
- Storage of foresight outputs lives in /audit or /api storage only
- No duplicate scoring systems

------------------------------------------------------------

CORE ADDITIONS (FORESIGHT MODULE)
---------------------------------
/core
  /src
    /foresight
      /types
      /scoring
      /signals
      /warnings
      index.ts

------------------------------------------------------------

FORESIGHT CONCEPTS
------------------

SIGNAL
- signalId
- type (ANOMALY | FREQUENCY | ESCALATION | SEVERITY_SHIFT)
- weight (number)
- evidence (string[])

RISK SCORE
- score (0–100)
- level (LOW | MEDIUM | HIGH | CRITICAL)
- drivers (Signal[])
- computedAt

WARNING
- warningId
- level
- title
- description
- relatedEventIds
- recommendedPosture (string)
- evidence (Signal[])
- createdAt

WATCHLIST
- watchId
- name
- matchRules (simple matchers)
- severityBias (optional)
- enabled

------------------------------------------------------------

SCORING MODEL (EXPLAINABLE BASELINE)
------------------------------------
Compute score using:
- base severity from event payload (if present)
- frequency of similar events in window
- escalation chains (ALLOW->DENY trend)
- policy denials rate

Score must include driver signals.

No randomness.
No ML.

------------------------------------------------------------

EARLY WARNING RULES
-------------------
Warnings are raised when:
- score crosses thresholds
- repeated denials occur within window
- phase/rule triggers spike abnormally
- watchlist match occurs with elevated score

Every warning must attach evidence.

------------------------------------------------------------

API REQUIREMENTS (READ-ONLY OUTPUT)
-----------------------------------
- GET /v1/foresight/summary
- GET /v1/foresight/warnings/recent
- GET /v1/foresight/warnings/:warningId
- GET /v1/watchlists

NO UI write actions in this phase.
Watchlist creation can be phase 10.

------------------------------------------------------------

AUDIT INTEGRATION
-----------------
When evaluation occurs:
- decision is produced
- foresight score is computed
- warning may be produced
- audit record links:
  - decision + score + warningId (if any)

Foresight outputs must be logged.

------------------------------------------------------------

CRASH PREVENTION
----------------
- Bound all windows and queries
- Default safe score when data missing
- Evidence arrays never undefined
- Warning generation must be deterministic

------------------------------------------------------------

DELIVERABLE OF PHASE 09
-----------------------
- Risk scoring works and is explainable
- Warning stream exists
- UI shows:
  - risk level summary
  - recent warnings
  - drilldown evidence
- verify passes

------------------------------------------------------------

EXIT CRITERIA
-------------
- Foresight is explainable and deterministic
- No duplicate scoring paths exist
- Warnings are reproducible from audit history

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 10
"WATCHLIST MANAGEMENT & ALERT ROUTING"

END OF FILE
