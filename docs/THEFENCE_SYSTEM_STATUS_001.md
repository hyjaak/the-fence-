# THEFENCE — System Status

Version: 001  
Date: 2026-01-06

## What Exists Right Now

- **Repository Purpose**: THEFENCE is a TypeScript-based infrastructure anomaly detection and doctrine validation system. It validates governance documentation and detects anomalies in operational events using rolling baseline statistics and multi-metric analysis.

- **Doctrine Phases**: Clean phases stored in `docs/phases/` using naming convention `THEFENCE_PHASE##_NAME_001.md` where ## is zero-padded phase number. Legacy phases exist in root directory with various naming formats.

- **Validation Command**: `npx thefence validate` — Runs Non-Claims linting, duplicate detection (files/phases/concepts), and END OF FILE marker validation.

- **Build Command**: `npm run build` — Compiles TypeScript to JavaScript in `dist/` directory.

- **Test Command**: `npm test` — Runs Vitest test suite with 60 unit tests covering parser, validator, phase registry, feature extraction, rolling stats, scoring, classification, and multi-metric anomaly detection.

- **Gate Command**: `npm run gate` — Runs build + test + validate in sequence. All gates must pass before changes are accepted.

- **Anomaly CLI Command**: `npx thefence anomaly` or `node dist/clis/anomaly.js` — Accepts NDJSON event streams via `--file` flag or stdin. Outputs decisions with score, classification, action, reason, and signals.

- **Phase Registry**: System can discover and load phases from `docs/phases/*.md` and root `THEFENCE_PHASE\d+_*.md` files with metadata extraction and uniqueness enforcement.

## Verified Working (Evidence)

- **TypeScript Build**: Compiles successfully with no errors. All source files under `src/` including anomaly detection engine, validators, parsers, CLI, and server components build cleanly.

- **Test Suite**: 60 tests passing across 10 test files including:
  - 16 parser tests (metadata, END OF FILE validation, CRLF handling)
  - 5 validator tests (duplicate detection, allowlist support)
  - 5 phase registry tests (discovery, parsing, uniqueness)
  - 6 non-claims lint tests (forbidden term detection)
  - 2 feature extraction tests (metric normalization)
  - 5 rolling stats tests (mean, std, window management)
  - 3 scorer tests (z-score computation, group baselines)
  - 6 classifier tests (threshold mapping, action assignment)
  - 4 anomaly engine tests (end-to-end detection)
  - 8 multi-metric tests (error rate, auth failures, traffic drop detection)

- **Validation Passes**: `npx thefence validate` succeeds with 0 errors and 0 warnings when doctrine files are consistent. Validates 10 clean phase files in `docs/phases/` directory.

- **Known Issues Resolved**:
  - Duplicate concept detection with SHA-256 hashing and allowlist support
  - CRLF line ending handling in END OF FILE validation (fixed with trim)
  - Duplicate phase number and filename detection
  - Non-Claims language enforcement (6 forbidden terms: guarantee, immunity, prevent all, ensure, always, never)

## Current Constraints (Frozen Rules)

- **File Naming Format**: Doctrine phase files must match `THEFENCE_PHASE\d+_[A-Z_]+_\d+\.md` pattern. Clean convention: `THEFENCE_PHASE##_NAME_001.md` with zero-padded numbers.

- **END OF FILE Rule**: Every doctrine markdown file must end with the exact literal line `END OF FILE` (case-sensitive, trimmed whitespace allowed for cross-platform compatibility).

- **Duplicate Concept Rule**: No duplicate concepts across phases. Concepts identified by SHA-256 hash of normalized text. Duplicates cause validation failure.

- **Allowlist Rule**: Shared concepts that must appear in multiple phases are defined in `docs/THEFENCE_SHARED_CONCEPTS_ALLOWLIST_001.md`. Currently contains 21 allowed shared concepts.

- **Non-Claims Rules**: Doctrine files must not contain absolute guarantee language. Forbidden terms: `guarantee`, `immunity`, `prevent all`, `ensure`, `always`, `never`. Use conditional language: `should`, `may`, `can`, `detect`, `attempt to prevent`.

- **No Duplicates Across Dimensions**: Enforce uniqueness for filenames, phase numbers, and concept hashes. Any duplicate triggers validation failure and blocks acceptance.

## Known Risks / Not Done Yet

- **Integration Gaps**:
  - No real-time event stream ingestion (only file and stdin supported)
  - Limited sink implementations (console and in-memory only)
  - No webhook, email, or Slack alert routing configured
  - No persistent storage for baseline statistics (in-memory only, resets on restart)
  - No configuration file support (relies on environment variables and code defaults)

- **Anomaly Detection Limitations**:
  - Rolling window limited to 100 samples (configurable but not dynamic)
  - Warm-up period requires 20 samples before full sensitivity (may delay detection)
  - Z-score thresholds are static (SUSPICIOUS≥2.0, ANOMALOUS≥3.0, CRITICAL≥4.0)
  - Traffic drop detection uses fixed 1.5x asymmetric multiplier
  - No adaptive thresholds or machine learning
  - No correlation detection across multiple event sources
  - Severity weighting formula is fixed (1.0 + severity/10 * 0.75, clamped to 1.0-1.75)

- **Documentation Gaps**:
  - No operator runbooks or HOW_TO guides
  - No troubleshooting playbooks
  - No phase lifecycle documentation
  - No API documentation beyond code comments

## Recommended Next Actions (Stabilize-First)

**A1. Lock/Freeze Doctrine Structure**  
Stop creating new phases until the existing 10 clean phases in `docs/phases/` are validated stable. Archive or migrate legacy root phases to a separate `archive/` directory. Establish phase creation governance: new phases require review + validation pass before acceptance.

**A2. Add Operator Documentation**  
Create 2-3 essential operator docs in `docs/` directory:
- `HOW_TO_RUN.md` — Installation, build, validation, and CLI usage instructions
- `PHASE_LIFECYCLE.md` — How phases are discovered, parsed, validated, and registered
- `TROUBLESHOOTING.md` — Common errors (duplicate concepts, missing END OF FILE, forbidden terms) with resolution steps

**A3. Add CI Suggestion (Optional)**  
Consider adding continuous integration to automatically run `npm run gate` on every commit. Suggested platforms: GitHub Actions, GitLab CI, or similar. Do NOT implement without explicit approval. Document the proposed workflow in a separate `CI_PROPOSAL.md` if desired.

## Definition of Success

**Success Criteria**: The THEFENCE system is considered stable and production-ready when:

1. ✓ `npm run build` completes with zero errors
2. ✓ `npm test` passes all tests (currently 60/60)
3. ✓ `npx thefence validate` passes with 0 errors and 0 warnings
4. ✓ Doctrine files follow consistent naming and formatting rules
5. ✓ No duplicate concepts, filenames, or phase numbers exist
6. ✓ All files end with `END OF FILE` marker
7. ✓ No forbidden Non-Claims language in doctrine files
8. ✓ Anomaly detection produces decisions with score, classification, action, reason, and signals for test events

**Stability Checklist**:
- [ ] All 10 clean phases validated and frozen
- [ ] Legacy phases archived or migrated
- [ ] Operator documentation complete (HOW_TO, LIFECYCLE, TROUBLESHOOTING)
- [ ] CI workflow proposed and approved (optional)
- [ ] No changes to core validation rules without governance approval
- [ ] All tests passing for 7+ consecutive days
- [ ] Zero unresolved validation errors in production docs

END OF FILE
