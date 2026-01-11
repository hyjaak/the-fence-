============================================================
PRODUCTIZATION PHASE 03 — REPOSITORY BOOTSTRAP & TOOLING SETUP
============================================================

OBJECTIVE
---------
Initialize the repository in a controlled, repeatable way.
Establish tooling, configs, and guardrails BEFORE writing logic.

This phase ensures the repo cannot drift or rot.

------------------------------------------------------------

NON-NEGOTIABLE RULES
-------------------
- No business logic
- No feature code
- No shortcuts
- No duplicate configs
- One tool = one responsibility
- All rules must be enforceable by tooling

------------------------------------------------------------

INITIAL FILES (ROOT)
-------------------
/README.md
/.gitignore
/.editorconfig
/.nvmrc
/package.json
/pnpm-lock.yaml
/tsconfig.base.json

No other root files allowed.

------------------------------------------------------------

TOOLING DECISIONS
-----------------

NODE
- Version pinned via .nvmrc
- LTS only

PACKAGE MANAGER
- pnpm
- Lockfile committed
- No npm / yarn allowed

TYPESCRIPT
- Strict mode ON
- Shared base config
- Per-zone tsconfig extends base

LINTING
- ESLint
- One config
- No per-folder overrides

FORMATTING
- Prettier
- Enforced via scripts
- No manual formatting rules

------------------------------------------------------------

ZONE BOOTSTRAP RULES
--------------------

/core
- tsconfig.json (extends base)
/api
- tsconfig.json (extends base)
/ui
- tsconfig.json (extends base)
/infra
- config only, no scripts yet
/audit
- schema definitions only
/security
- config + interfaces only
/docs
- markdown only

No cross-imports yet.

------------------------------------------------------------

SCRIPTS (package.json)
----------------------
- lint
- typecheck
- format
- test (placeholder, no tests yet)
- verify (runs all above)

No build script yet.

------------------------------------------------------------

GUARDRAILS
----------
- TypeScript strict = true
- noImplicitAny = true
- noUncheckedIndexedAccess = true
- isolatedModules = true

------------------------------------------------------------

CRASH PREVENTION
----------------
- Repo must pass lint + typecheck with ZERO code
- Empty folders allowed
- Placeholder files allowed
- Nothing auto-runs

------------------------------------------------------------

DELIVERABLE OF PHASE 03
-----------------------
- Repo installs cleanly
- verify script passes
- No warnings
- No errors
- No logic exists

------------------------------------------------------------

EXIT CRITERIA
-------------
- Tooling stable
- Guardrails active
- Repo reproducible on any machine

------------------------------------------------------------

NEXT PHASE
----------
PRODUCTIZATION PHASE 04
"CORE ENGINE — RULE EVALUATION SKELETON"

END OF FILE
