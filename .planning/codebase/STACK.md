# Technology Stack

**Analysis Date:** 2025-03-20

## Languages

**Primary:**
- TypeScript 5.7.0 - All frontend and backend code
- JavaScript (ES Modules) - Runtime code

**Secondary:**
- HTML - Client markup

## Runtime

**Environment:**
- Node.js 22 - Backend runtime

**Package Manager:**
- npm - Package management
- Lockfile: package-lock.json present

## Frameworks

**Core:**
- React 19.0.0 - Frontend UI framework
- React Router DOM 7.1.0 - Client-side routing
- Express 4.21.0 - Backend web framework
- Socket.IO 4.8.0 - Real-time bidirectional communication

**Testing:**
- Vitest 4.1.0 - Unit and integration testing
- Playwright 1.58.2 - End-to-end testing
- Testing Library 6.9.1/16.3.2 - React component testing
- Jest 6.9.1 - Testing utilities

**Build/Dev:**
- Vite 6.0.0 - Frontend build tool
- TypeScript - Type checking and compilation
- Tailwind CSS 4.0.0 - Utility-first CSS framework

## Key Dependencies

**Critical:**
- Better SQLite3 12.8.0 - Local SQLite database
- Socket.IO 4.8.0 - Real-time game communication
- Express 4.21.0 - REST API server
- React Router DOM 7.1.0 - Frontend routing
- Socket.IO Client 4.8.0 - Client socket connection

**Infrastructure:**
- UUID 11.1.0 - Unique ID generation
- Express Rate Limit 8.3.1 - API rate limiting
- CORS 2.8.5 - Cross-Origin Resource Sharing
- TSX 4.19.0 - TypeScript execution

## Configuration

**Environment:**
- .env configuration for PORT and DATA_DIR
- NODE_ENV=development/production
- Default port: 3000

**Build:**
- TypeScript config in each workspace
- Vite config for frontend build
- Package.json workspace configuration

## Platform Requirements

**Development:**
- Node.js 22+
- npm
- Modern browser (ES6+ support)

**Production:**
- Node.js runtime
- Hosted on Fly.io or Render.com
- Persistent storage for SQLite (optional)

---

*Stack analysis: 2025-03-20*
```