============================================================
MAINTENANCE MODE — CANON PRESERVED, OPERATIONS STABILIZED
============================================================

OBJECTIVE
---------
Transition THEFENCE into long-term maintenance after completion
of Productization Phase 20.
Preserve trust, availability, and evidence while minimizing change.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No feature additions
- No doctrine changes
- No breaking changes
- No schema drift
- No silent fixes
- Security patches only

------------------------------------------------------------

MAINTENANCE SCOPE
-----------------
ALLOWED:
- Security updates (dependencies, configs)
- Performance tuning (non-behavioral)
- Reliability fixes (crash, leak, deadlock)
- Documentation clarifications
- Operational runbook updates

FORBIDDEN:
- New endpoints
- New capabilities
- New data models
- UI redesigns
- Policy changes

------------------------------------------------------------

CHANGE GOVERNANCE
-----------------
- All changes require a maintenance ticket
- Each ticket declares:
  - reason
  - risk level
  - rollback plan
- All changes audited

------------------------------------------------------------

VERSIONING
----------
- PATCH releases only
- No MINOR or MAJOR increments
- Changelog mandatory

------------------------------------------------------------

SECURITY POSTURE
----------------
- Regular dependency scans
- Key rotation drills
- Permission audits
- Incident simulations (tabletop)

------------------------------------------------------------

OPERATIONAL RHYTHM
------------------
- Scheduled health checks
- Backup verification
- Audit integrity checks
- Cost monitoring

------------------------------------------------------------

INCIDENT RESPONSE
-----------------
- Fail closed
- Preserve evidence
- Contain blast radius
- Postmortem required
- No blame, full accountability

------------------------------------------------------------

EXIT CRITERIA
-------------
Maintenance mode continues until:
- Explicit evolution authorization (Phase 14)
OR
- System retirement declared

------------------------------------------------------------

DECLARATION
-----------
THEFENCE is stable.
THEFENCE is governed.
THEFENCE endures.

END OF FILE
