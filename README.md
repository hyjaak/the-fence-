# THEFENCE

THEFENCE doctrine validation and build system.

## Installation

```bash
npm install
npm run build
```

## Usage

### Run comprehensive gate checks

```bash
npm run gate
```

This command runs all quality gates in sequence:
1. TypeScript compilation (`npm run build`)
2. All unit tests (`npm test`)
3. Doctrine validation (`npx thefence validate`)
   - Non-Claims linting (detects forbidden absolute language)
   - Duplicate file detection
   - Duplicate phase number detection
   - Duplicate concept detection
   - END OF FILE marker validation

**All gates must pass before changes are accepted.**

### Validate doctrine files

```bash
npx thefence validate
```

Validates all doctrine files in `docs/` against THEFENCE rules:
- **Non-Claims Language**: Scans for forbidden absolute terms that violate doctrine principles
  - Forbidden: `guarantee`, `immunity`, `prevent all`, `ensure`, `always`, `never`
  - Use conditional language instead: `should`, `may`, `can`, `detect`, `attempt to prevent`
- **No Duplicates**: Enforces unique filenames, phase numbers, and concept hashes
- **Proper Format**: Requires valid Markdown structure and `END OF FILE` marker

### Build index and plan

```bash
npx thefence build
```

### Run HTTP API server

```bash
npm run server
```

## Testing

```bash
npm test
```

## Structure

- `/docs` - THEFENCE doctrine markdown files
  - `/docs/phases` - Clean phase files (THEFENCE_PHASE##_NAME_001.md format)
- `/src` - TypeScript source code
  - `/src/phase` - Phase registry and loader system
- `/tests` - Vitest unit tests
- `/dist` - Compiled JavaScript output
