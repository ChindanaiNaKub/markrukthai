# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Multi-tier client-server architecture with real-time features

**Key Characteristics:**
- Frontend: React SPA with TypeScript and Vite
- Backend: Express.js with Socket.IO for real-time communication
- Shared: Shared TypeScript types for type safety across layers
- State: React state + Socket.IO real-time synchronization
- Database: SQLite for persistent storage

## Layers

**Presentation Layer (client/):**
- Purpose: User interface and game visualization
- Location: `/client/src`
- Contains: React components, hooks, utilities, and assets
- Depends on: React, React Router, Socket.IO client
- Used by: End users

**Application Logic Layer (shared/):**
- Purpose: Shared types and utilities across client/server
- Location: `/shared/types.ts`, `/shared/utils/`
- Contains: Game state interfaces, move types, Socket.IO events
- Depends on: TypeScript type system
- Used by: Both client and server

**Business Logic Layer (server/):**
- Purpose: Game rules, matchmaking, and game state management
- Location: `/server/src`
- Contains: GameManager, matchmaking queue, game rules
- Depends on: Database layer, Socket.IO server
- Used by: Socket.IO connections

**Data Layer (server/database.ts):**
- Purpose: Persistent storage of games and feedback
- Location: `/server/src/database.ts`
- Contains: SQLite database operations
- Depends on: better-sqlite3
- Used by: Business logic layer

## Data Flow

**Real-time Game Flow:**

1. Client connects via Socket.IO
2. Game room created/joined
3. GameManager maintains game state
4. State changes broadcast to all clients
5. UI updates based on new state

**Move Flow:**
1. User clicks/selects piece
2. Client validates move locally
3. Move sent to server via socket
4. Server validates and updates game state
5. Broadcast move confirmation to all clients
6. UI reflects updated board state

**State Management:**
- Client: React useState, useEffect, and custom hooks
- Server: GameManager singleton with in-memory state
- Persistence: SQLite for completed games

## Key Abstractions

**GameRoom:**
- Purpose: Represents a single game session
- Examples: `/shared/types.ts` - GameRoom interface
- Pattern: Centralized state management

**ClientGameState:**
- Purpose: Client-specific game state with UI-related data
- Examples: `/shared/types.ts` - ClientGameState interface
- Pattern: Separate client/server data models

**useGameSocket Hook:**
- Purpose: Encapsulates Socket.IO logic and event handling
- Examples: `/client/src/hooks/useGameSocket.ts`
- Pattern: Custom hook for side effects

**GameManager:**
- Purpose: Core game logic and state management
- Examples: `/server/src/gameManager.ts`
- Pattern: Singleton with game room management

## Entry Points

**Client Entry Point:**
- Location: `/client/src/main.tsx`
- Triggers: Initial app boot
- Responsibilities: Mount React app with providers (ErrorBoundary, I18nProvider, Router)

**Server Entry Point:**
- Location: `/server/src/index.ts`
- Triggers: Server start and Socket.IO initialization
- Responsibilities: Express app setup, Socket.IO server, API endpoints

**Route Entry Points:**
- Location: `/client/src/App.tsx`
- Triggers: Route-based component mounting
- Responsibilities: Route definitions, lazy loading, layout

## Error Handling

**Strategy:** Layered error handling with boundaries

**Patterns:**
- ErrorBoundary components for React component errors
- Try/catch in game logic
- Socket.IO error events
- API endpoint error responses

## Cross-Cutting Concerns

**Logging:**
- Server: Console logging for requests and errors
- Client: Console errors, error boundaries with GitHub reporting

**Validation:**
- Client: Move validation before sending
- Server: Complete move validation
- Types: TypeScript for compile-time safety

**Authentication:**
- Service: Not implemented - uses anonymous gameplay
- Security: Rate limiting on API endpoints

---

*Architecture analysis: 2026-03-20*