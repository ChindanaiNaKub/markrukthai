import { v4 as uuidv4 } from 'uuid';
import {
  GameRoom, GameState, TimeControl, PieceColor,
  Position, ClientGameState, Move,
} from '../../shared/types';
import { createInitialGameState, makeMove, isInCheck, hasAnyLegalMoves } from '../../shared/engine';

export class GameManager {
  private games: Map<string, GameRoom> = new Map();
  private playerGames: Map<string, string> = new Map(); // socketId -> gameId
  private clockIntervals: Map<string, NodeJS.Timeout> = new Map();

  createGame(timeControl: TimeControl): GameRoom {
    const id = uuidv4().slice(0, 8);
    const initialMs = timeControl.initial * 1000;
    const gameState = createInitialGameState(initialMs, initialMs);

    const room: GameRoom = {
      id,
      white: null,
      black: null,
      spectators: [],
      gameState,
      timeControl,
      status: 'waiting',
      createdAt: Date.now(),
      drawOffer: null,
    };

    this.games.set(id, room);
    return room;
  }

  joinGame(gameId: string, socketId: string): { room: GameRoom; color: PieceColor } | null {
    const room = this.games.get(gameId);
    if (!room) return null;

    // Reconnection: if this player was already in the game
    if (room.white === socketId || room.black === socketId) {
      const color = room.white === socketId ? 'white' : 'black';
      return { room, color };
    }

    if (!room.white) {
      room.white = socketId;
      this.playerGames.set(socketId, gameId);
      return { room, color: 'white' };
    }

    if (!room.black) {
      room.black = socketId;
      this.playerGames.set(socketId, gameId);
      if (room.status === 'waiting') {
        room.status = 'playing';
        room.gameState.lastMoveTime = Date.now();
      }
      return { room, color: 'black' };
    }

    // Game is full, join as spectator
    room.spectators.push(socketId);
    this.playerGames.set(socketId, gameId);
    return null;
  }

  makeMove(gameId: string, socketId: string, from: Position, to: Position): {
    success: boolean;
    room?: GameRoom;
    move?: Move;
    error?: string;
  } {
    const room = this.games.get(gameId);
    if (!room) return { success: false, error: 'Game not found' };
    if (room.status !== 'playing') return { success: false, error: 'Game is not in progress' };

    const playerColor = this.getPlayerColor(room, socketId);
    if (!playerColor) return { success: false, error: 'You are not a player in this game' };
    if (playerColor !== room.gameState.turn) return { success: false, error: 'Not your turn' };

    // Update clock before move
    this.updateClock(room);

    // Check if time ran out
    if (room.gameState.whiteTime <= 0 || room.gameState.blackTime <= 0) {
      room.status = 'finished';
      room.gameState.gameOver = true;
      room.gameState.winner = room.gameState.whiteTime <= 0 ? 'black' : 'white';
      this.stopClock(gameId);
      return { success: true, room };
    }

    const newState = makeMove(room.gameState, from, to);
    if (!newState) return { success: false, error: 'Invalid move' };

    // Add time increment
    if (room.timeControl.increment > 0) {
      const incMs = room.timeControl.increment * 1000;
      if (playerColor === 'white') {
        newState.whiteTime += incMs;
      } else {
        newState.blackTime += incMs;
      }
    }

    newState.lastMoveTime = Date.now();
    room.gameState = newState;
    room.drawOffer = null;

    const lastMove = newState.moveHistory[newState.moveHistory.length - 1];

    if (newState.gameOver) {
      room.status = 'finished';
      this.stopClock(gameId);
    }

    return { success: true, room, move: lastMove };
  }

  resign(gameId: string, socketId: string): GameRoom | null {
    const room = this.games.get(gameId);
    if (!room || room.status !== 'playing') return null;

    const playerColor = this.getPlayerColor(room, socketId);
    if (!playerColor) return null;

    room.gameState.gameOver = true;
    room.gameState.winner = playerColor === 'white' ? 'black' : 'white';
    room.status = 'finished';
    this.stopClock(gameId);

    return room;
  }

  offerDraw(gameId: string, socketId: string): { room: GameRoom; by: PieceColor } | null {
    const room = this.games.get(gameId);
    if (!room || room.status !== 'playing') return null;

    const playerColor = this.getPlayerColor(room, socketId);
    if (!playerColor) return null;

    room.drawOffer = playerColor;
    return { room, by: playerColor };
  }

  respondDraw(gameId: string, socketId: string, accept: boolean): GameRoom | null {
    const room = this.games.get(gameId);
    if (!room || !room.drawOffer || room.status !== 'playing') return null;

    const playerColor = this.getPlayerColor(room, socketId);
    if (!playerColor || playerColor === room.drawOffer) return null;

    if (accept) {
      room.gameState.gameOver = true;
      room.gameState.isDraw = true;
      room.gameState.winner = null;
      room.status = 'finished';
      this.stopClock(gameId);
    } else {
      room.drawOffer = null;
    }

    return room;
  }

  createRematch(gameId: string): GameRoom | null {
    const oldRoom = this.games.get(gameId);
    if (!oldRoom) return null;

    const newRoom = this.createGame(oldRoom.timeControl);
    // Swap colors for rematch
    newRoom.white = oldRoom.black;
    newRoom.black = oldRoom.white;

    if (newRoom.white) this.playerGames.set(newRoom.white, newRoom.id);
    if (newRoom.black) this.playerGames.set(newRoom.black, newRoom.id);

    if (newRoom.white && newRoom.black) {
      newRoom.status = 'playing';
      newRoom.gameState.lastMoveTime = Date.now();
    }

    return newRoom;
  }

  handleDisconnect(socketId: string): { gameId: string; color: PieceColor } | null {
    const gameId = this.playerGames.get(socketId);
    if (!gameId) return null;

    const room = this.games.get(gameId);
    if (!room) return null;

    const color = this.getPlayerColor(room, socketId);
    this.playerGames.delete(socketId);

    return color ? { gameId, color } : null;
  }

  updatePlayerSocket(gameId: string, oldSocketId: string, newSocketId: string): void {
    const room = this.games.get(gameId);
    if (!room) return;

    if (room.white === oldSocketId) room.white = newSocketId;
    if (room.black === oldSocketId) room.black = newSocketId;

    this.playerGames.delete(oldSocketId);
    this.playerGames.set(newSocketId, gameId);
  }

  getGame(gameId: string): GameRoom | null {
    return this.games.get(gameId) || null;
  }

  getPlayerGame(socketId: string): string | null {
    return this.playerGames.get(socketId) || null;
  }

  getClientGameState(room: GameRoom, socketId: string): ClientGameState {
    const playerColor = this.getPlayerColor(room, socketId);
    return {
      board: room.gameState.board,
      turn: room.gameState.turn,
      moveHistory: room.gameState.moveHistory,
      isCheck: room.gameState.isCheck,
      isCheckmate: room.gameState.isCheckmate,
      isStalemate: room.gameState.isStalemate,
      isDraw: room.gameState.isDraw,
      gameOver: room.gameState.gameOver,
      winner: room.gameState.winner,
      whiteTime: room.gameState.whiteTime,
      blackTime: room.gameState.blackTime,
      moveCount: room.gameState.moveCount,
      status: room.status,
      playerColor: playerColor,
      drawOffer: room.drawOffer,
      gameId: room.id,
    };
  }

  private getPlayerColor(room: GameRoom, socketId: string): PieceColor | null {
    if (room.white === socketId) return 'white';
    if (room.black === socketId) return 'black';
    return null;
  }

  private updateClock(room: GameRoom): void {
    if (room.status !== 'playing') return;
    const now = Date.now();
    const elapsed = now - room.gameState.lastMoveTime;

    if (room.gameState.turn === 'white') {
      room.gameState.whiteTime = Math.max(0, room.gameState.whiteTime - elapsed);
    } else {
      room.gameState.blackTime = Math.max(0, room.gameState.blackTime - elapsed);
    }

    room.gameState.lastMoveTime = now;
  }

  startClock(gameId: string, onTick: (room: GameRoom) => void): void {
    this.stopClock(gameId);

    const interval = setInterval(() => {
      const room = this.games.get(gameId);
      if (!room || room.status !== 'playing') {
        this.stopClock(gameId);
        return;
      }

      this.updateClock(room);

      if (room.gameState.whiteTime <= 0) {
        room.gameState.whiteTime = 0;
        room.gameState.gameOver = true;
        room.gameState.winner = 'black';
        room.status = 'finished';
        this.stopClock(gameId);
      } else if (room.gameState.blackTime <= 0) {
        room.gameState.blackTime = 0;
        room.gameState.gameOver = true;
        room.gameState.winner = 'white';
        room.status = 'finished';
        this.stopClock(gameId);
      }

      onTick(room);
    }, 100);

    this.clockIntervals.set(gameId, interval);
  }

  stopClock(gameId: string): void {
    const interval = this.clockIntervals.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.clockIntervals.delete(gameId);
    }
  }

  cleanupOldGames(): void {
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, room] of this.games) {
      if (room.createdAt < oneHourAgo && room.status === 'finished') {
        this.games.delete(id);
        this.stopClock(id);
      }
    }
  }
}
