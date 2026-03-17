# Makruk - Thai Chess Online ♟

A free, open-source Makruk (Thai Chess) platform inspired by [Lichess](https://lichess.org). Play with friends online — no registration required.

> **Our mission:** Make Makruk (หมากรุก) famous worldwide. Thai chess is one of the oldest board games in existence — it deserves a world-class online platform.

## Features

- **Play with Friends** — Create a game and share the link instantly
- **Real-time Multiplayer** — WebSocket-based instant move updates
- **Local Play** — Practice on the same screen at `/local`
- **Time Controls** — Bullet, Blitz, Rapid, and Classical presets
- **Full Makruk Rules** — Complete Thai Chess engine with all 6 piece types
- **Game History** — All completed games saved to database, browsable at `/games`
- **Beautiful UI** — Lichess-inspired dark theme with custom SVG pieces
- **Drag & Drop** — Move pieces by dragging or clicking
- **Mobile Friendly** — Touch support and responsive design
- **Sound Effects** — Audio feedback for moves, captures, and checks
- **Game Controls** — Draw offers, resignation, and rematch
- **100% Free** — No ads, no paywall, no registration

## Quick Start

```bash
npm install
npm run dev
```

This starts both the server (port 3000) and client (port 5173).

## Deploy for Free

This project is designed to run for **$0/month**. Here are your options, sorted by cost:

### Option 1: Render.com (Recommended — Free, No Credit Card)

Render.com is the best free option. **No credit card required.** WebSocket support included.

```bash
# 1. Push your code to GitHub
# 2. Go to render.com, sign up with GitHub (free, no credit card)
# 3. Click "New" → "Blueprint" → select your repo
# 4. Render reads the render.yaml and deploys automatically
# 5. Your app is live at https://your-app.onrender.com
```

Or manually: New → Web Service → connect repo → set:
- **Build Command:** `npm install && npm run build --workspace=client`
- **Start Command:** `npx tsx server/src/index.ts`
- **Environment:** `NODE_ENV=production`

**Cost: $0/month** — 750 free hours/month. Service sleeps after 15min idle, wakes in ~30s on first request. WebSocket activity keeps it awake during games.

> **Note:** Free tier has ephemeral storage — game history resets on redeploy. This is fine for starting out. Upgrade to a paid plan ($7/mo) later for persistent storage.

### Option 2: Self-host (Free Forever with Oracle Cloud)

Oracle Cloud offers **always-free** VMs that never expire. Best for persistent storage.

```bash
# 1. Sign up at cloud.oracle.com (free tier, credit card for verification only — never charged)
# 2. Create a free "Always Free" VM (ARM, 4 CPU, 24GB RAM)
# 3. SSH in and run:
git clone https://github.com/YOUR_USERNAME/markrukthai.git
cd markrukthai
npm install
npm run build --workspace=client
NODE_ENV=production npx tsx server/src/index.ts
```

Use `nginx` + Let's Encrypt for HTTPS. **Cost: $0/month forever.**

### Option 3: Docker (Any Platform)

```bash
docker build -t makruk .
docker run -p 3000:3000 -v makruk-data:/data makruk
```

### ⚠️ About Fly.io

Fly.io **no longer has a free tier** (as of 2024). Their "Pay As You Go" plan at $0/mo will charge you after a 2-hour trial. Minimum cost is ~$3-5/month. Only use Fly.io if you're willing to pay.

## Makruk Rules

Makruk (หมากรุก) is the traditional chess of Thailand.

| Piece | Thai Name | Symbol | Movement |
|-------|-----------|--------|----------|
| Khun (King) | ขุน | ♚ | 1 square in any direction |
| Met (Queen) | เม็ด | ♛ | 1 square diagonally |
| Khon (Bishop) | โคน | ⛊ | 1 square diagonally or 1 forward |
| Rua (Rook) | เรือ | ♜ | Any distance horizontally/vertically |
| Ma (Knight) | ม้า | ♞ | L-shape (same as chess) |
| Bia (Pawn) | เบี้ย | ♟ | 1 forward; captures diagonally |

**Key differences from Western Chess:**
- Pawns start on the 3rd rank and promote on the 6th rank (to Met)
- No castling, no en passant, no double pawn step
- The Queen only moves 1 square diagonally (much weaker)
- The Bishop moves 1 diagonally or 1 forward

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 |
| Backend | Node.js, Express, Socket.IO 4 |
| Database | SQLite (via better-sqlite3) |
| Game Engine | Custom TypeScript Makruk engine |

## Project Structure

```
├── shared/            # Shared types and game engine
│   ├── types.ts       # TypeScript type definitions
│   └── engine.ts      # Makruk game engine
├── server/            # Backend server
│   └── src/
│       ├── index.ts         # Express + Socket.IO server
│       ├── gameManager.ts   # Game room & clock management
│       └── database.ts      # SQLite persistence
├── client/            # React frontend
│   └── src/
│       ├── components/      # Board, pieces, pages
│       └── lib/             # Socket client, sounds
├── Dockerfile         # Container deployment
├── fly.toml           # Fly.io config
└── package.json       # Workspace root
```

## Contributing

We'd love your help making Makruk famous! Here's how:

1. **Star this repo** — helps others discover it
2. **Play and share** — invite your friends to play
3. **Report bugs** — open GitHub issues
4. **Submit PRs** — code contributions welcome
5. **Translate** — help us add Thai and other languages

## Roadmap

- [ ] Player accounts (optional, anonymous play always available)
- [ ] ELO rating system
- [ ] Puzzles and tactics trainer
- [ ] Game analysis and engine evaluation
- [ ] Thai language support (ภาษาไทย)
- [ ] Tournaments
- [ ] Mobile app (PWA)
- [ ] AI opponent
- [ ] Makruk counting rules (full implementation)
- [ ] Spectator mode improvements

## License

MIT — free to use, modify, and distribute.

---

*Made with ❤️ for Thai Chess. Inspired by [Lichess](https://lichess.org).*
