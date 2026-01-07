# THEFENCE — GOVERNANCE RULES (IMMUTABLE)

This document defines the non-negotiable governance rules for THEFENCE.
These rules apply to ALL code, documentation, releases, and operations.

Any violation invalidates certification.

---

## 1. RELEASE & GIT IMMUTABILITY (ABSOLUTE)

1. Do NOT amend the commit referenced by tag v1.0.0-certified
2. Do NOT retag v1.0.0-certified
3. Do NOT delete v1.0.0-certified
4. Do NOT force-push any branch that contains the v1.0.0-certified commit
5. Do NOT rewrite history prior to v1.0.0-certified
6. All post-v1 changes must be forward-only commits
7. All future releases require new tags and new certification

---

## 2. FILE SYSTEM RULES (NO DUPLICATES)

8. NO duplicate files
9. One filename equals one meaning
10. The same filename must NOT exist in multiple directories
11. Phase documents must exist in exactly one location
12. NO copied files with suffixes such as:
    - _copy
    - _final
    - _new
    - _v2
    - _backup
13. Temporary or alternative versions of doctrine files are forbidden

---

## 3. PHASE & DOCTRINE RULES

14. One phase equals one authoritative document
15. Phases must not overlap in responsibility
16. A phase may not redefine another phase
17. Phase documents must follow canonical naming
18. Phase documents must end with END OF FILE

---

## 4. CONCEPT & CONTENT RULES (NO DUPLICATION)

19. NO duplicate concepts across phases
20. NO rewording to bypass duplication detection
21. NO duplicated Non-Claims text
22. Shared concepts must be declared once and only once in:
    THEFENCE_SHARED_CONCEPTS_ALLOWLIST_001.md
23. Concepts not in the allowlist must be unique per phase

---

## 5. VALIDATION & TOOLING ENFORCEMENT

24. Validation MUST fail on duplicate files
25. Validation MUST fail on duplicate concepts
26. Linting MUST fail on duplicated Non-Claims
27. Build MUST fail if validation fails
28. Tests MUST fail if validation fails
29. Manual overrides are forbidden
30. Validation output is part of the audit trail

---

## 6. NAMING & STRUCTURE RULES

31. Files with invalid naming formats are ignored
32. Files outside the /docs directory are ignored
33. All doctrine files must:
    - Follow canonical naming
    - End with END OF FILE
    - Pass validator and linter

---

## 7. FREEZE & CERTIFICATION RULES

34. Frozen means immutable
35. Certified means non-editable
36. No emergency exceptions
37. No temporary bypasses
38. Any exception requires a new major version and re-certification

---

## 8. HUMAN ACCOUNTABILITY

39. Humans remain accountable for all decisions
40. Systems advise; humans decide
41. Responsibility cannot be delegated to tooling
42. Violations are operator responsibility

---

## 9. ENFORCEMENT STATEMENT

These rules override all other documentation.
If a conflict exists, this document prevails.

END OF FILE
