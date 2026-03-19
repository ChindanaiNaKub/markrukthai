# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```
markrukthai-1/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Shared utilities and providers
│   │   └── test/          # Test utilities
│   ├── public/            # Static assets
│   ├── index.html         # HTML entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite build configuration
├── server/                # Express.js backend
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── gameManager.ts # Game logic and state
│   │   ├── database.ts    # Database operations
│   │   └── matchmaking.ts # Matchmaking system
│   ├── dist/              # Compiled TypeScript
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript config
├── shared/                # Shared code
│   ├── types.ts           # TypeScript interfaces and types
│   └── utils/             # Shared utilities
├── data/                  # Game data and assets
├── scripts/               # Build and utility scripts
└── .planning/            # GSD planning documents
```

## Directory Purposes

**client/src/components/:**
- Purpose: React components for UI elements
- Contains: Page components, game components, SVG assets
- Key files: `Board.tsx`, `GamePage.tsx`, `HomePage.tsx`

**client/src/hooks/:**
- Purpose: Custom React hooks for state and side effects
- Contains: Socket connection, game logic, UI interactions
- Key files: `useGameSocket.ts`, `useGameInteraction.ts`

**client/src/lib/:**
- Purpose: Shared utilities and providers
- Contains: Internationalization, socket client, sound effects
- Key files: `i18n.tsx`, `socket.ts`, `sounds.ts`

**server/src/:**
- Purpose: Backend application logic
- Contains: Express routes, Socket.IO handlers, database
- Key files: `index.ts`, `gameManager.ts`, `database.ts`

**shared/:**
- Purpose: Types and utilities shared across client/server
- Contains: Game interfaces, type definitions, validation
- Key files: `types.ts`, `utils/guards.ts`

**data/:**
- Purpose: Static game data and assets
- Contains: Game rules, puzzle data, images
- Key files: [Contains media and game data]

## Key File Locations

**Entry Points:**
- `/client/src/main.tsx`: React app entry with providers
- `/client/src/App.tsx`: Route definitions and lazy loading
- `/server/src/index.ts`: Express server and Socket.IO setup

**Configuration:**
- `/client/package.json`: Frontend dependencies and scripts
- `/server/package.json`: Backend dependencies and scripts
- `/client/tsconfig.json`: TypeScript configuration
- `/client/vite.config.ts`: Build and development server config
- `/server/tsconfig.json`: TypeScript configuration

**Core Logic:**
- `/shared/types.ts`: Game interfaces and type definitions
- `/server/src/gameManager.ts`: Game state and rule logic
- `/client/src/hooks/useGameSocket.ts`: Socket.IO integration

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Board.tsx`, `GameOverModal.tsx`)
- Hooks: camelCase prefixed with `use` (e.g., `useGameSocket.ts`)
- Utilities: camelCase (e.g., `socket.ts`, `sounds.ts`)
- Types: PascalCase (e.g., `types.ts`)
- Pages: PascalCase (e.g., `HomePage.tsx`, `AboutPage.tsx`)

**Directories:**
- Components: `components/`
- Hooks: `hooks/`
- Utilities: `lib/`
- Tests: `test/`
- Types: `types.ts` in shared directory

## Where to Add New Code

**New Game Mode:**
- Primary code: `/client/src/components/[GameMode]Game.tsx`
- Logic: Add to `/server/src/gameManager.ts`
- Routes: Add to `/client/src/App.tsx`
- Tests: `/client/src/components/[GameMode]Game.spec.tsx`

**New UI Component:**
- Implementation: `/client/src/components/[ComponentName].tsx`
- Styles: Follow existing CSS-in-JS pattern in component
- Tests: `/client/src/components/[ComponentName].spec.tsx`

**New API Endpoint:**
- Implementation: Add to `/server/src/index.ts`
- Validation: Add TypeScript interfaces in `/shared/types.ts`
- Testing: Add E2E tests in `/client/e2e/`

**New Shared Type:**
- Location: `/shared/types.ts`
- Export for both client and server usage

## Special Directories

**node_modules/:**
- Purpose: Dependencies
- Generated: Yes
- Committed: No (ignored in .gitignore)

**dist/: (server)**
- Purpose: Compiled TypeScript output
- Generated: Yes
- Committed: Yes (build artifact)

**.planning/codebase/:**
- Purpose: GSD architecture and planning documents
- Generated: Yes
- Committed: Yes (planning artifacts)

**e2e/:**
- Purpose: End-to-end tests with Playwright
- Generated: Yes (test execution)
- Committed: Yes (test files)

---

*Structure analysis: 2026-03-20*