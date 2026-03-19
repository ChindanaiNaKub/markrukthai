# External Integrations

**Analysis Date:** 2025-03-20

## APIs & External Services

**Internal APIs:**
- Custom REST API on /api/ - Game data, stats, and feedback
- Custom WebSocket API - Real-time game events via Socket.IO

## Data Storage

**Databases:**
- SQLite - Local file-based database
  - Connection: Via better-sqlite3
  - Storage: ./data/thaichess.db
  - Schema: Games and feedback tables

**File Storage:**
- Local filesystem only
- No external cloud storage

**Caching:**
- In-memory only via Socket.IO rooms
- No external caching service

## Authentication & Identity

**Auth Provider:**
- None detected - Anonymous access only
- No authentication system implemented

## Monitoring & Observability

**Error Tracking:**
- None detected - Console logging only
- No external error tracking service

**Logs:**
- Console logging on server
- Request logging for API endpoints
- Socket.IO connection logging

## CI/CD & Deployment

**Hosting:**
- Fly.io - Primary deployment target
- Render.com - Free alternative
- Supports persistent volumes for SQLite

**CI Pipeline:**
- GitHub Actions - Build and test
- Multi-stage Docker builds
- Workspace-based build process

## Environment Configuration

**Required env vars:**
- PORT - Server port (default: 3000)
- NODE_ENV - Environment mode
- DATA_DIR - Database directory path

**Secrets location:**
- No external secrets required
- Environment configuration in .env

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2025-03-20*
```