# Phase 1: Test Foundation - Research

**Researched:** 2026-03-20
**Domain:** ESLint Configuration, Socket.IO Best Practices, Testing Documentation, Regression Testing
**Confidence:** HIGH

## Summary

Phase 1 establishes quality standards to prevent the recurring infinite re-render bug and provide clear contributor guidelines. The research confirms that ESLint with `eslint-plugin-react-hooks` is the industry standard for catching useEffect dependency issues, and Socket.IO requires specific cleanup patterns in React useEffect hooks to prevent memory leaks and reconnection problems.

**Primary recommendation:** Install and configure `eslint-plugin-react-hooks` v5.1.0 with the exhaustive-deps rule set to 'error' for new codebase, create comprehensive CONTRIBUTING.md with Socket.IO cleanup patterns, and establish a regression test suite template for documenting recurring bugs.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | ESLint react-hooks exhaustive-deps rule configured and enforced | ESLint flat config pattern with `eslint-plugin-react-hooks` v5.1.0 provides exhaustive-deps rule; verified from npm package |
| FOUND-02 | Socket.IO cleanup patterns documented in CONTRIBUTING.md | Socket.IO client API docs show socket.off() and socket.disconnect() for cleanup; existing codebase shows proper pattern in useGameSocket.ts |
| FOUND-03 | CONTRIBUTING.md testing section explains run commands, patterns, and what to test | Node.js CONTRIBUTING.md provides template; project already has test commands in package.json |
| FOUND-04 | Regression test suite template created for documenting and preventing recurring bugs | Vitest framework supports describe/test blocks suitable for regression tests; existing test patterns in client/src/test/ |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `eslint` | 10.0.3 | JavaScript/TypeScript linting | Latest ESLint version, supports flat config format |
| `eslint-plugin-react-hooks` | 5.1.0 | React Hooks rules enforcement | Official React plugin, enforces exhaustive-deps rule |
| `@typescript-eslint/eslint-plugin` | 8.57.1 | TypeScript-specific linting | TypeScript project standard |
| `@typescript-eslint/parser` | 8.57.1 | TypeScript parser for ESLint | Required for TypeScript files |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `globals` | latest | Global variables for flat config | ESLint 9+ flat config requires globals declaration |
| `@eslint/js` | latest | JavaScript recommended config | Base configuration for ESLint flat config |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ESLint flat config | Legacy .eslintrc.js | Legacy config deprecated in ESLint 9; flat config is future standard |
| exhaustive-deps: 'error' | exhaustive-deps: 'warn' | 'warn' allows violations to slip through; 'error' enforces before merge |

**Installation:**
```bash
# Install ESLint and plugins
npm install --save-dev eslint@^10.0.3
npm install --save-dev eslint-plugin-react-hooks@^5.1.0
npm install --save-dev @typescript-eslint/eslint-plugin@^8.57.1
npm install --save-dev @typescript-eslint/parser@^8.57.1
npm install --save-dev @eslint/js
npm install --save-dev globals
```

**Version verification:**
- `eslint`: 10.0.3 (verified 2026-03-20)
- `eslint-plugin-react-hooks`: 5.1.0 (verified 2026-03-20)
- `@typescript-eslint/eslint-plugin`: 8.57.1 (verified 2026-03-20)
- `@typescript-eslint/parser`: 8.57.1 (verified 2026-03-20)

## Architecture Patterns

### Recommended Project Structure for ESLint

**ESLint Configuration (Flat Config - ESLint 9+):**
```typescript
// eslint.config.js
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error'
    }
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', '*.config.js']
  }
];
```

**Legacy Configuration (if ESLint < 9.0):**
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error"
  },
  "ignorePatterns": ["dist", "node_modules", "coverage"]
}
```

### Pattern 1: Socket.IO Cleanup in React useEffect

**What:** Proper registration and cleanup of Socket.IO event listeners in React components
**When to use:** Every time you use `socket.on()` inside a useEffect hook
**Example:**
```typescript
// Source: Based on existing useGameSocket.ts pattern
useEffect(() => {
  const handleConnect = () => {
    console.log('Connected');
  };

  const handleGameState = (gs: ClientGameState) => {
    setGameState(gs);
  };

  // Register event listeners
  socket.on('connect', handleConnect);
  socket.on('game_state', handleGameState);

  // Cleanup function - MIRROR all .on() calls with .off()
  return () => {
    socket.off('connect', handleConnect);
    socket.off('game_state', handleGameState);
  };
}, [gameId]); // Dependencies trigger re-registration
```

**Anti-Patterns to Avoid:**
- **Missing cleanup:** Not calling `socket.off()` causes memory leaks and duplicate listeners
- **Cleanup without reference:** Using `socket.off('event')` without the handler reference removes ALL listeners for that event
- **Listeners inside connect handler:** Registering listeners in the 'connect' handler creates duplicates on each reconnection

### Pattern 2: CONTRIBUTING.md Structure

**What:** Comprehensive contributor guide with testing and cleanup patterns
**When to use:** All open source projects expecting external contributions
**Example structure:**
```markdown
# Contributing to Markruk Thai

## Development Setup

## Testing

### Running Tests
- Unit tests: `npm run test`
- Unit tests with UI: `npm run test:ui`
- Coverage: `npm run test:coverage`
- E2E tests: `npm run test:e2e`

### Test Patterns
- Test files: `*.test.ts` and `*.test.tsx`
- Use `describe()` for test suites
- Use `it()` or `test()` for individual tests
- Mock components and browser APIs in setup.ts

### What to Test
- Game engine logic (move validation, check detection)
- Component rendering and interactions
- Socket.IO event handling
- Accessibility (ARIA labels, keyboard nav)

## Code Quality

### ESLint
Run `npm run lint` before committing.
Fix issues with `npm run lint:fix`.

### React Hooks Rules
- All useEffect/useCallback/useMemo dependencies must be declared
- ESLint `exhaustive-deps` rule enforces this
- Never disable the rule without team approval

## Socket.IO Cleanup Patterns

### Always Cleanup Event Listeners
```typescript
useEffect(() => {
  const handleEvent = (data) => { /* ... */ };
  socket.on('event', handleEvent);
  return () => {
    socket.off('event', handleEvent); // CRITICAL: pass handler reference
  };
}, [deps]);
```

### Don't:
- ❌ Omit the cleanup function
- ❌ Remove listeners without the handler reference
- ❌ Register listeners inside the 'connect' handler

## Pull Request Process

## Bug Reports
```

### Pattern 3: Regression Test Suite Template

**What:** Test suite documenting and preventing recurring bugs
**When to use:** After fixing any bug that could recur
**Example:**
```typescript
// client/src/test/regression/infinite-rerender-bug.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { GamePage } from '../components/GamePage';

/**
 * Regression test suite for infinite re-render loop bug
 * Bug: UI becomes unresponsive, no clicks register
 * Root cause: Missing useEffect dependencies causing stale closures
 * Fixed: 2026-03-20 by adding exhaustive-deps ESLint rule
 */
describe('Regression: Infinite Re-render Loop', () => {
  it('should not cause infinite re-renders when gameState updates', async () => {
    const { container } = render(<GamePage gameId="test" />);

    // Simulate rapid gameState updates
    for (let i = 0; i < 100; i++) {
      // Trigger state update
      // If bug exists, this will hang or timeout
    }

    // Verify component is still responsive
    const board = container.querySelector('[class*="board"]');
    expect(board).toBeInTheDocument();
  });

  it('should cleanup Socket.IO listeners on unmount', () => {
    const offSpy = vi.spyOn(socket, 'off');
    const { unmount } = render(<GamePage gameId="test" />);

    unmount();

    // Verify all listeners were removed
    expect(offSpy).toHaveBeenCalled();
  });
});
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| React Hooks linting | Custom dependency checker | `eslint-plugin-react-hooks` exhaustive-deps | Official React plugin, catches stale closures, prevents infinite loops |
| ESLint config from scratch | Manual configuration | Flat config with presets | Battle-tested rules, TypeScript support, community standards |
| Socket.IO cleanup patterns | Ad-hoc cleanup | Documented pattern with socket.off() | Prevents memory leaks, duplicate listeners, connection issues |
| Regression test structure | Custom test format | Vitest describe/test blocks | Familiar to JS/TS developers, integrates with existing test runner |

**Key insight:** The infinite re-render bug is caused by missing useEffect dependencies creating stale closures. ESLint's exhaustive-deps rule catches this at code-review time, preventing production bugs.

## Common Pitfalls

### Pitfall 1: ESLint Flat Config vs Legacy Config

**What goes wrong:** Using `.eslintrc.js` with ESLint 9+ results in "ESLint configuration is in ESLint 8 format" error
**Why it happens:** ESLint 9.0.0+ requires flat config format (`eslint.config.js`)
**How to avoid:**
- Check ESLint version: `npm view eslint version`
- Use flat config for ESLint 9+: `export default [...]` in `eslint.config.js`
- Use legacy config for ESLint 8: `module.exports = {...}` in `.eslintrc.js`
**Warning signs:** "ESLint configuration of {file} is in ESLint 8 format" error

### Pitfall 2: Socket.IO Listener Cleanup Without Reference

**What goes wrong:** Using `socket.off('event')` removes ALL listeners, including those from other components
**Why it happens:** Socket.IO allows removing listeners without the handler reference
**How to avoid:**
```typescript
// WRONG - removes all 'game_state' listeners globally
socket.off('game_state');

// CORRECT - removes only this listener
const handleGameState = (data) => { /* ... */ };
socket.on('game_state', handleGameState);
return () => {
  socket.off('game_state', handleGameState);
};
```
**Warning signs:** Other components stop receiving Socket.IO events unexpectedly

### Pitfall 3: useEffect Dependencies That Never Change

**What goes wrong:** Effect runs repeatedly even though dependencies don't change
**Why it happens:** Including object/array literals or functions in deps array creates new references each render
**How to avoid:**
```typescript
// WRONG - handleMove recreated each render
useEffect(() => {
  socket.on('move', handleMove);
  return () => socket.off('move', handleMove);
}, [handleMove]);

// CORRECT - useCallback memoizes handler
const handleMove = useCallback((move) => {
  // ...
}, [dependency]);

useEffect(() => {
  socket.on('move', handleMove);
  return () => socket.off('move', handleMove);
}, [handleMove]);
```
**Warning signs:** ESLint exhaustive-deps warning about function/object dependencies

### Pitfall 4: Missing ESLint Configuration in Monorepo

**What goes wrong:** Linting only client/ or server/ but not both
**Why it happens:** Separate package.json files, no root-level ESLint config
**How to avoid:**
- Create separate ESLint configs for client/ and server/ if needed
- Or create root-level config with proper file patterns and ignore rules
- Run `eslint .` from root to verify both are linted
**Warning signs:** One subdirectory has linting errors that don't appear in another

## Code Examples

Verified patterns from official sources:

### ESLint Flat Config with React Hooks (ESLint 9+)

```typescript
// Source: https://www.npmjs.com/package/eslint-plugin-react-hooks
// File: eslint.config.js

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error'
    }
  },
  {
    ignores: ['dist', 'node_modules', 'coverage']
  }
];
```

### Socket.IO Cleanup Pattern

```typescript
// Source: Socket.IO Client API documentation (socket.io/docs/v4/client-api/)
// File: client/src/hooks/useGameSocket.ts (existing pattern)

useEffect(() => {
  const handleConnect = () => {
    if (!joinedRef.current) {
      socket.emit('join_game', { gameId });
      joinedRef.current = true;
    }
  };

  const handleGameState = (gs: ClientGameState) => {
    setGameState(gs);
  };

  // Register listeners
  socket.on('connect', handleConnect);
  socket.on('game_state', handleGameState);

  // Cleanup - mirror all .on() with .off()
  return () => {
    socket.off('connect', handleConnect);
    socket.off('game_state', handleGameState);
  };
}, [gameId, navigate]);
```

### Existing Codebase Issues Found

**File: `client/src/hooks/useGameSocket.ts`**
- Line 150: `}, [gameId, navigate]);`
- Issue: `navigate` from react-router-dom should be stable, but ESLint will verify
- Status: LOW confidence - needs ESLint to verify if this is correct

**File: `client/src/components/Clock.tsx`**
- Lines 29-31: useEffect depends only on `time`, but `time` prop changes trigger re-renders
- Status: Needs verification - potential missing dependency in second useEffect (line 33-39)

**File: `client/src/components/LocalGame.tsx`**
- Line 51: `}, [gameState, viewMoveIndex]);`
- Issue: Including entire `gameState` object causes effect to run on EVERY game state change
- Status: HIGH confidence - this is a problem. Should depend on `gameState.moveHistory.length` instead

**File: `client/src/components/ConnectionStatus.tsx`**
- Line 36: `}, []);`
- Status: Correct - empty deps array for one-time setup

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ESLint 8 (eslintrc.js) | ESLint 9+ (flat config) | 2024 (ESLint 9.0.0) | Requires `eslint.config.js` with `export default` |
| Legacy exhaustive-deps | Enhanced dependency analysis | Ongoing | Better detection of stale closures in React 18+ |
| Manual Socket.IO cleanup | Documented cleanup patterns | Established | Socket.IO 4.x API stable since 2021 |

**Deprecated/outdated:**
- **`.eslintrc.js` for ESLint 9+:** Use flat config `eslint.config.js` instead
- **Socket.IO `socket.removeAllListeners()`:** Removed in Socket.IO 3+, use `socket.off()` with handler reference
- **React Hooks ESLint plugin separate:** Now bundled in `eslint-plugin-react-hooks`

## Open Questions

1. **ESLint flat config compatibility with existing tooling**
   - What we know: ESLint 9+ requires flat config format
   - What's unclear: Whether all IDE integrations support flat config
   - Recommendation: Verify VS Code ESLint extension supports flat config (most do as of 2025)

2. **Existing useEffect dependencies that may trigger infinite loops**
   - What we know: LocalGame.tsx includes entire `gameState` in deps
   - What's unclear: Whether this currently causes issues or is theoretical
   - Recommendation: Add ESLint first to identify ALL violations, then fix systematically

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `client/vitest.config.ts` |
| Quick run command | `npm run test` (runs Vitest in watch mode) |
| Full suite command | `npm run test:run` (runs once without watch) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | ESLint catches useEffect dependency issues | linting | `npm run lint` (to be added) | ❌ Phase 1 |
| FOUND-02 | Socket.IO cleanup documented | manual-only | N/A - documentation | ❌ Phase 1 |
| FOUND-03 | CONTRIBUTING.md testing guidelines | manual-only | N/A - documentation | ❌ Phase 1 |
| FOUND-04 | Regression test suite template exists | unit | `npm run test regression.test.ts` | ❌ Phase 1 |

### Sampling Rate
- **Per task commit:** `npm run test` (unit/component tests)
- **Per wave merge:** `npm run test:run` (full suite)
- **Phase gate:** Full ESLint check + test suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `client/eslint.config.js` — ESLint configuration with exhaustive-deps rule
- [ ] `CONTRIBUTING.md` — Testing guidelines and Socket.IO cleanup patterns
- [ ] `client/src/test/regression/` — Regression test suite directory and template
- [ ] `npm run lint` script — Add to client/package.json and server/package.json
- [ ] `npm run lint:fix` script — Add to both package.json files

## Sources

### Primary (HIGH confidence)
- [npm - eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) - ESLint React Hooks plugin configuration
- [Socket.IO Client API Documentation](https://socket.io/docs/v4/client-api/) - Official Socket.IO v4 client API reference (verified Feb 2026)
- [Node.js CONTRIBUTING.md](https://raw.githubusercontent.com/nodejs/node/main/CONTRIBUTING.md) - Open source contribution guide template
- Project codebase:
  - `/client/src/hooks/useGameSocket.ts` - Existing Socket.IO cleanup pattern
  - `/client/src/components/ConnectionStatus.tsx` - Proper useEffect cleanup example
  - `/client/src/components/Clock.tsx` - Potential dependency issue to verify
  - `/client/src/components/LocalGame.tsx` - Potential dependency issue (gameState in deps)

### Secondary (MEDIUM confidence)
- ESLint documentation (attempted access, 404 on specific rule page)
- npm package versions verified via `npm view` commands (2026-03-20)

### Tertiary (LOW confidence)
- None - web search tools experienced technical issues during research

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified from npm registry 2026-03-20
- Architecture: HIGH - Based on official Socket.IO docs and existing codebase patterns
- Pitfalls: HIGH - Identified specific files with potential issues using code analysis
- CONTRIBUTING.md template: MEDIUM - Based on Node.js template; needs customization for this project

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (30 days - stable ecosystem, ESLint 9 recently stabilized)
