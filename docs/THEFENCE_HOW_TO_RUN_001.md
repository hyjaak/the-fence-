# THEFENCE — How to Run

Version: 001  
Date: 2026-01-06

## Purpose

This document provides instructions for building, testing, validating, and running the THEFENCE infrastructure anomaly detection and doctrine validation system. Follow these steps to verify system integrity and execute anomaly detection on event streams.

## Setup

**Prerequisites**: Node.js version 20 or higher is required.

**Installation**:
```bash
npm install
```

This installs all dependencies including TypeScript, Vitest, Commander, Zod, Fast-Glob, Chalk, Winston, and other required packages.

## Commands

### Build TypeScript
```bash
npm run build
```
Compiles all TypeScript source files in `src/` to JavaScript in `dist/` directory. Build must complete with zero errors before running CLI commands.

### Run Tests
```bash
npm test
```
Executes the Vitest test suite. Currently includes 60 unit tests across 10 test files covering parser, validator, phase registry, feature extraction, rolling statistics, scoring, classification, and multi-metric anomaly detection.

### Validate Doctrine
```bash
npx thefence validate
```
Runs comprehensive validation on doctrine files in `docs/` directory:
- Non-Claims linting (detects forbidden absolute language)
- Duplicate file name detection
- Duplicate phase number detection
- Duplicate concept detection (SHA-256 hash-based)
- END OF FILE marker validation

### Run All Gates
```bash
npm run gate
```
Executes build + test + validate in sequence. All gates must pass before changes are accepted.

### Run Anomaly Detection (File Input)
```bash
node dist/clis/anomaly.js --file <path-to-events.ndjson>
```
Processes NDJSON event stream from file. Each line must be valid JSON containing: `eventId`, `ts`, `source`, `type`, `severity`, `tags`, `message`, `metrics`, `context`.

Example:
```bash
node dist/clis/anomaly.js --file test-events-multimetric.ndjson
```

### Run Anomaly Detection (Stdin)
```bash
echo '{"eventId":"1","ts":"2026-01-06T00:00:00Z","source":"api","type":"latency","severity":2,"tags":[],"message":"ok","metrics":{"p95":120},"context":{}}' | node dist/clis/anomaly.js
```

## Expected Outputs

### npm run build
No output indicates success. Any TypeScript compilation errors will be displayed with file path and line number.

### npm test
Output shows test file names, test counts, and pass/fail status. Expected result:
```
Test Files  10 passed (10)
Tests  60 passed (60)
```

### npx thefence validate
Output shows:
- Non-Claims linting result
- Total files validated
- Total phases discovered
- Error count and error messages (if any)
- Warning count and warning messages (if any)
- Final PASS or FAIL status

Expected success output:
```
✓ Non-Claims linting passed
Total files: 10
Total phases: 10
Errors: 0
Warnings: 0
✓ VALIDATION PASSED
```

### node dist/clis/anomaly.js
NDJSON output with one decision per input event. Each decision includes:
- `eventId`: Event identifier
- `ts`: Timestamp
- `score`: Anomaly score (z-score)
- `classification`: NORMAL, SUSPICIOUS, ANOMALOUS, or CRITICAL
- `action`: IGNORE, LOG, ALERT, or PAGE
- `source`: Event source
- `type`: Event type
- `severity`: Event severity (0-10)
- `reason`: Human-readable explanation
- `signals`: Array of metric-specific anomaly signals (optional)

## Troubleshooting

### Error: "Duplicate concept across phases"
**Cause**: Same concept text appears in multiple phase files.

**Resolution**:
1. If the concept must be shared, add it to `docs/THEFENCE_SHARED_CONCEPTS_ALLOWLIST_001.md`
2. Otherwise, reword one of the duplicates to make it unique
3. Re-run `npx thefence validate` to verify fix

### Warning: "Skipping file with invalid name format"
**Cause**: File does not match required naming pattern.

**Resolution**:
1. Rename file to match `THEFENCE_PHASE##_NAME_001.md` format
2. Use zero-padded phase numbers (01, 02, 03, etc.)
3. Use uppercase letters and underscores only in NAME section
4. Ensure version suffix is `_001`

### Error: "File does not end with END OF FILE"
**Cause**: File is missing required terminator marker.

**Resolution**:
1. Open the file
2. Add a blank line at the end
3. Add the exact text: `END OF FILE`
4. Save the file
5. Re-run validation

### Error: "Found forbidden term: <term>"
**Cause**: Doctrine file contains absolute guarantee language.

**Resolution**:
1. Locate the forbidden term (guarantee, immunity, prevent all, ensure, always, never)
2. Replace with conditional language (should, may, can, detect, attempt to)
3. Re-run validation

### Validation shows "Total files: 0"
**Cause**: Doctrine files not found in expected location.

**Resolution**:
1. Verify files exist in `docs/phases/` directory
2. Check file naming matches `THEFENCE_PHASE\d+_*_\d+\.md` pattern
3. Ensure working directory is repository root when running validation

### Build fails with TypeScript errors
**Cause**: Source code syntax errors or type mismatches.

**Resolution**:
1. Review error messages for file path and line number
2. Fix reported issues
3. Re-run `npm run build`
4. If errors persist, ensure dependencies are installed: `npm install`

### Tests fail
**Cause**: Code changes broke existing functionality.

**Resolution**:
1. Review test failure messages
2. Fix implementation (not tests) to restore expected behavior
3. Re-run `npm test`
4. All 60 tests must pass before accepting changes

### Anomaly CLI produces no output
**Cause**: Invalid input format or empty input stream.

**Resolution**:
1. Verify input is valid NDJSON (one JSON object per line)
2. Check each event has required fields: `eventId`, `ts`, `source`, `type`, `severity`, `tags`, `message`, `metrics`, `context`
3. Ensure file path is correct if using `--file` flag
4. Test with sample file: `node dist/clis/anomaly.js --file test-events-multimetric.ndjson`

## Success Checklist

System is operational when:

- [ ] `npm install` completes without errors
- [ ] `npm run build` completes with zero errors
- [ ] `npm test` shows 60/60 tests passing
- [ ] `npx thefence validate` shows PASS with 0 errors
- [ ] `npm run gate` passes all three gates (build, test, validate)
- [ ] `node dist/clis/anomaly.js --file test-events-multimetric.ndjson` produces NDJSON output
- [ ] All doctrine files end with `END OF FILE`
- [ ] No duplicate concepts outside allowlist
- [ ] No forbidden Non-Claims language in doctrine files

END OF FILE
