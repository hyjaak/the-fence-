============================================================
EXECUTION EXIT CRITERIA & HANDOFF — CONTROLLED TRANSITION
============================================================

TIMESTAMP (UTC)
---------------
Captured during sustained EXECUTE mode with freeze enforced.

------------------------------------------------------------

EXIT OBJECTIVE
--------------
Define the only valid conditions under which THEFENCE may
exit active execution and transition control to a new state
without violating governance or integrity.

Exit is deliberate, not accidental.

------------------------------------------------------------

VALID EXIT CONDITIONS
---------------------
Execution may exit ONLY when one of the following is true:
- Explicit HALT directive with authority
- Completion of all governed objectives
- Transition to AUDIT-only mode
- Authorized UNFREEZE for evolution

Any other exit is invalid.

------------------------------------------------------------

HANDOFF PRINCIPLES
------------------
- Authority must transfer explicitly
- State must be preserved
- No partial handoff allowed
- No implicit continuation

------------------------------------------------------------

HANDOFF REQUIREMENTS
--------------------
Before handoff:
- All execution paths are quiesced
- Invariants are revalidated
- Logs are sealed
- Audit hooks remain active

------------------------------------------------------------

FORBIDDEN TRANSITIONS
---------------------
- Silent shutdown
- Implicit restart
- Background execution
- Authority leakage

------------------------------------------------------------

POST-EXIT STATE
---------------
After exit:
- Execution: STOPPED
- Creation: DISABLED
- Modification: DISABLED
- Audit: ACTIVE
- Recovery: LOCKED pending authority

------------------------------------------------------------

ASSURANCE
---------
Execution ends cleanly.
Control transfers without ambiguity.
Governance remains sovereign.

------------------------------------------------------------

DECLARATION
-----------
THEFENCE exits execution only by rule.
There is no accidental end state.

END OF FILE
