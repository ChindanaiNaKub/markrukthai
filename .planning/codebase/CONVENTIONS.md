# Coding Conventions

**Analysis Date:** 2026-03-20

## Naming Patterns

**Files:**
- PascalCase for components: `Board.tsx`, `ErrorBoundary.tsx`, `PieceSVG.tsx`
- camelCase for utilities and hooks: `useGameInteraction.ts`, `createInitialBoard.ts`
- kebab-case for assets: `piece-images/king-white.svg`
- Test files: `*.test.ts` and `*.test.tsx` (e.g., `Board.test.tsx`, `engine.test.ts`)
- E2E test files: `*.spec.ts` (e.g., `home.spec.ts`)

**Functions:**
- camelCase for all functions
- Factory functions start with `create`: `createInitialBoard()`, `createInitialGameState()`
- Hook names start with `use`: `useGameInteraction()`
- Getter methods start with `get`: `getLegalMoves()`, `getAllPieces()`
- Boolean prefix methods use `is`, `has`, `can`: `isInCheck()`, `hasAnyLegalMoves()`, `canMove()`

**Variables:**
- camelCase for all variables
- State variables: `const [selectedSquare, setSelectedSquare]`
- Ref variables: `const boardRef = useRef<HTMLDivElement>(null)`
- Boolean flags: `const isMyTurn`, `const isCheck`
- Constants in UPPER_SNAKE_CASE: `const INITIAL_TIME = 300000`

**Types:**
- PascalCase for type names: `interface Piece`, `type Position`, `type Board`
- Union types use snake_case: `type PieceType`, `type PieceColor`
- Generic type parameters: `T`, `K`, `V`

## Code Style

**Formatting:**
- No explicit linting configuration detected (no ESLint, Prettier, or stylelint files)
- Code appears formatted with standard TypeScript/React conventions
- Uses TypeScript strict mode enabled in `tsconfig.json`

**Imports:**
- Always use named imports with specific module references
- Relative imports for local files: `import Board from './Board'`
- Absolute imports for shared packages: `import { createInitialBoard } from '@shared/engine'`
- React imports: `import { useState, useCallback, memo } from 'react'`
- Import order:
  1. React
  2. Third-party libraries
  3. Shared modules (@shared/*)
  4. Local imports

```typescript
import { useState, useCallback } from 'react';
import { render, fireEvent } from '@testing-library/react';
import type { Position, PieceColor } from '@shared/types';
import Board from '../components/Board';
```

**Component Structure:**
- Default export for components
- Component names should start with capital letter
- Interface Props for component props
- Use `React.memo` for performance optimization
- Use functional components with hooks

```typescript
interface BoardProps {
  board: BoardType;
  playerColor: PieceColor | null;
  isMyTurn: boolean;
  onSquareClick: (pos: Position) => void;
}

export default memo(function Board({
  board,
  playerColor,
  isMyTurn,
  onSquareClick,
}: BoardProps) {
  // Component logic
});
```

## Error Handling

**Patterns:**
- No try-catch blocks detected in component code
- Errors handled through:
  - React Error Boundaries: `ErrorBoundary` component catches rendering errors
  - Validation functions return null for invalid operations
  - Graceful fallbacks in UI for edge cases
- Error logging: `console.error('[ErrorBoundary] Caught error:', error, errorInfo)`

**Error Boundaries:**
- `ErrorBoundary` component catches and displays errors
- Shows error message with recovery options
- Reports errors to GitHub issues
- Maintains app state without crashing

**Validation:**
- Game engine returns `null` for invalid moves
- Components handle null values gracefully
- Type safety enforced by TypeScript strict mode

## Comments

**When to Comment:**
- Complex game logic in engine functions
- Implementation details of algorithms
- Edge cases in move validation
- TODO items for future features

**JSDoc/TSDoc:**
- Limited use of TSDoc in components
- Type annotations serve as documentation
- Clear interface definitions for props

## Function Design

**Size:**
- Small focused functions (5-20 lines)
- Single responsibility principle
- Helper functions extracted for reusability

**Parameters:**
- Objects for multiple related parameters
- Optional parameters with defaults
- Explicit typing for all parameters

**Return Values:**
- Consistent return types
- null for failure cases
- typed responses (never untyped returns)

## Module Design

**Exports:**
- Named exports for utilities and types
- Default exports for React components
- Barrel files for organizing exports

**Barrel Files:**
- Not detected - direct imports from specific files
- Shared package exports all functions from main files

---

*Convention analysis: 2026-03-20*