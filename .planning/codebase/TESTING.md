# Testing Patterns

**Analysis Date:** 2026-03-20

## Test Framework

**Runner:**
- Vitest for unit and component tests
- Playwright for E2E tests
- Configuration files: `vitest.config.ts`, `playwright.config.ts`

**Assertion Library:**
- Vitest's built-in `expect`
- `@testing-library/jest-dom` matchers for DOM assertions
- `@testing-library/react` for component testing
- `@testing-library/user-event` for user interaction simulation

**Run Commands:**
```bash
npm run test          # Run unit and component tests
npm run test:ui       # Run tests with UI
npm run test:run      # Run tests without watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e       # Run E2E tests
npm run test:e2e:ui   # Run E2E tests with UI
```

## Test File Organization

**Location:**
- Unit tests: `client/src/test/` (co-located with source)
- E2E tests: `client/e2e/` (separate directory)
- Test files use `.test.ts` and `.test.tsx` suffixes

**Naming:**
- Mirror source file names: `Board.test.tsx` tests `Board.tsx`
- Feature-based naming: `engine.test.ts` for game engine
- E2E tests: `home.spec.ts`, `local-game.spec.ts`

**Structure:**
```
client/src/test/
├── engine.test.ts         # Game engine logic tests
├── Board.test.tsx         # Board component tests
└── a11y.test.tsx         # Accessibility tests

client/e2e/
├── home.spec.ts          # Homepage E2E tests
└── local-game.spec.ts    # Local game E2E tests
```

## Test Structure

**Suite Organization:**
```typescript
describe('Game Engine', () => {
  describe('createInitialBoard', () => {
    it('should create an 8x8 board', () => {
      // Test implementation
    });
  });

  describe('getLegalMoves - King (K)', () => {
    it('should move 1 square in any direction', () => {
      // Test implementation
    });
  });
});
```

**Patterns:**
- Test file setup in `setup.ts` for global mocks
- `beforeEach()` for test isolation
- `vi.clearAllMocks()` for cleanup
- Descriptive test names with context

## Mocking

**Framework:**
- Vitest's `vi` for mocking
- Manual mocking for components: `vi.mock('../components/PieceSVG')`
- Mock of browser APIs for testing in Node.js

**Patterns:**
```typescript
// Component mocking
vi.mock('../components/PieceSVG', () => ({
  default: ({ type, color }: { type: string; color: string }) => {
    return <div data-testid={`piece-${type}-${color}`} />;
  },
}));

// Browser API mocking
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

**What to Mock:**
- Complex SVG components
- Browser APIs (IntersectionObserver, ResizeObserver)
- Third-party libraries with side effects
- Non-critical dependencies

**What NOT to Mock:**
- Core React functionality
- Game engine logic (business rules)
- CSS-in-JS styling
- Custom hooks

## Fixtures and Factories

**Test Data:**
- Shared engine functions for test data creation
- Factory functions in test files
- Consistent piece and board setup

**Patterns:**
```typescript
// From shared engine
import { createInitialBoard, createInitialGameState } from '@shared/engine';

// Custom factory in test
const createProps = (overrides: any = {}): any => ({
  board: createInitialBoard(),
  playerColor: 'white' as PieceColor,
  isMyTurn: true,
  legalMoves: [],
  selectedSquare: null,
  lastMove: null,
  isCheck: false,
  checkSquare: null,
  onSquareClick: vi.fn(),
  onPieceDrop: vi.fn(),
  ...overrides,
});
```

## Coverage

**Requirements:**
- Coverage configured in `vitest.config.ts`
- Provider: V8
- Reports: text, HTML, JSON formats
- Excluded from coverage: node_modules, dist, test files, e2e
- Target: Not explicitly defined in config

**View Coverage:**
```bash
npm run test:coverage
# Open coverage/index.html for HTML report
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and utilities
- Location: `client/src/test/engine.test.ts`
- Focus: Game logic validation
- Mocking: Minimal, only external dependencies
- Examples: Piece movement, check detection, move validation

**Component Tests:**
- Scope: React components
- Location: `client/src/test/Board.test.tsx`, `a11y.test.tsx`
- Focus: Rendering, user interactions, props handling
- Tools: `@testing-library/react`, user event simulation
- Patterns: Test rendering, event handling, accessibility

**E2E Tests:**
- Scope: Full user workflows
- Location: `client/e2e/`
- Framework: Playwright
- Focus: User journeys across multiple pages
- Patterns: Page navigation, form submission, game play

**Common Patterns:**

**Async Testing:**
```typescript
// Promise-based async code
test('should handle async operation', async () => {
  await expect(promise).resolves.toBe(true);
});

// Timer-based async
test('should update after delay', async () => {
  jest.useFakeTimers();
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(updatedValue).toBe(true);
});
```

**Error Testing:**
```typescript
test('should handle invalid input', () => {
  const result = functionThatShouldThrow();
  expect(result).toThrow();
});

test('should return null for invalid move', () => {
  const result = makeMove(state, invalidMove);
  expect(result).toBeNull();
});
```

**Accessibility Testing:**
```typescript
test('should have accessible board squares', () => {
  const { container } = render(<Board {...props} />);
  const squares = container.querySelectorAll('[class*="board-square"]');
  expect(squares.length).toBe(64);
});

test('should have proper ARIA labels', () => {
  const pieces = container.querySelectorAll('[data-testid^="piece-"]');
  pieces.forEach(piece => {
    expect(piece.getAttribute('aria-label')).toBeTruthy();
  });
});
```

## Test Setup

**Global Setup:**
```typescript
// client/src/test/setup.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock browser APIs
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

---

*Testing analysis: 2026-03-20*