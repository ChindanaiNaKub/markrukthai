import { Board, Piece, PieceColor, PieceType, Position, GameState } from './types';
import { getLegalMoves, makeMove, getAllPieces, isInCheck } from './engine';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

interface ScoredMove {
  from: Position;
  to: Position;
  score: number;
}

const PIECE_VALUES: Record<PieceType, number> = {
  K: 0,
  R: 500,
  N: 300,
  S: 250,
  M: 200,
  PM: 200,
  P: 100,
};

const CENTER_BONUS: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 5, 15, 15, 15, 15, 5, 0],
  [0, 5, 15, 25, 25, 15, 5, 0],
  [0, 5, 15, 25, 25, 15, 5, 0],
  [0, 5, 15, 15, 15, 15, 5, 0],
  [0, 5, 5, 5, 5, 5, 5, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PAWN_ADVANCE_BONUS_WHITE = [0, 0, 0, 5, 15, 30, 0, 0];
const PAWN_ADVANCE_BONUS_BLACK = [0, 0, 30, 15, 5, 0, 0, 0];

const KING_SAFETY: number[][] = [
  [20, 20, 10, 0, 0, 10, 20, 20],
  [20, 15, 5, 0, 0, 5, 15, 20],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [20, 15, 5, 0, 0, 5, 15, 20],
  [20, 20, 10, 0, 0, 10, 20, 20],
];

function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0;
  const opponent = color === 'white' ? 'black' : 'white';

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const value = PIECE_VALUES[piece.type];
      const centerBonus = CENTER_BONUS[row][col];
      let positional = centerBonus;

      if (piece.type === 'P') {
        positional += piece.color === 'white'
          ? PAWN_ADVANCE_BONUS_WHITE[row]
          : PAWN_ADVANCE_BONUS_BLACK[row];
      }

      if (piece.type === 'K') {
        positional = KING_SAFETY[row][col];
      }

      if (piece.type === 'N') {
        positional += centerBonus * 0.5;
      }

      if (piece.color === color) {
        score += value + positional;
      } else {
        score -= value + positional;
      }
    }
  }

  if (isInCheck(board, opponent)) {
    score += 50;
  }
  if (isInCheck(board, color)) {
    score -= 50;
  }

  return score;
}

function getAllMovesForColor(board: Board, color: PieceColor): ScoredMove[] {
  const moves: ScoredMove[] = [];
  const pieces = getAllPieces(board, color);

  for (const { pos } of pieces) {
    const legalMoves = getLegalMoves(board, pos);
    for (const to of legalMoves) {
      moves.push({ from: pos, to, score: 0 });
    }
  }

  return moves;
}

function orderMoves(moves: ScoredMove[], board: Board): ScoredMove[] {
  return moves.sort((a, b) => {
    const captureA = board[a.to.row][a.to.col];
    const captureB = board[b.to.row][b.to.col];
    const scoreA = captureA ? PIECE_VALUES[captureA.type] : 0;
    const scoreB = captureB ? PIECE_VALUES[captureB.type] : 0;
    return scoreB - scoreA;
  });
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  botColor: PieceColor,
): number {
  if (depth === 0 || state.gameOver) {
    if (state.isCheckmate) {
      return maximizing ? -100000 + (10 - depth) : 100000 - (10 - depth);
    }
    if (state.isDraw || state.isStalemate) {
      return 0;
    }
    return evaluateBoard(state.board, botColor);
  }

  const currentColor = state.turn;
  let moves = getAllMovesForColor(state.board, currentColor);
  moves = orderMoves(moves, state.board);

  if (moves.length === 0) {
    if (isInCheck(state.board, currentColor)) {
      return maximizing ? -100000 + (10 - depth) : 100000 - (10 - depth);
    }
    return 0;
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move.from, move.to);
      if (!newState) continue;
      const eval_ = minimax(newState, depth - 1, alpha, beta, false, botColor);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = makeMove(state, move.from, move.to);
      if (!newState) continue;
      const eval_ = minimax(newState, depth - 1, alpha, beta, true, botColor);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getRandomMove(state: GameState): ScoredMove | null {
  const moves = getAllMovesForColor(state.board, state.turn);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

function getEasyMove(state: GameState): ScoredMove | null {
  const moves = getAllMovesForColor(state.board, state.turn);
  if (moves.length === 0) return null;

  for (const move of moves) {
    const captured = state.board[move.to.row][move.to.col];
    if (captured) {
      move.score = PIECE_VALUES[captured.type] + Math.random() * 50;
    } else {
      move.score = Math.random() * 100;
    }
  }

  moves.sort((a, b) => b.score - a.score);

  if (Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const topN = Math.min(3, moves.length);
  return moves[Math.floor(Math.random() * topN)];
}

function getMediumMove(state: GameState): ScoredMove | null {
  const botColor = state.turn;
  let moves = getAllMovesForColor(state.board, botColor);
  if (moves.length === 0) return null;

  moves = orderMoves(moves, state.board);

  for (const move of moves) {
    const newState = makeMove(state, move.from, move.to);
    if (!newState) continue;
    move.score = minimax(newState, 1, -Infinity, Infinity, false, botColor);
  }

  moves.sort((a, b) => b.score - a.score);

  if (Math.random() < 0.1 && moves.length > 1) {
    const topN = Math.min(3, moves.length);
    return moves[Math.floor(Math.random() * topN)];
  }

  return moves[0];
}

function getHardMove(state: GameState): ScoredMove | null {
  const botColor = state.turn;
  let moves = getAllMovesForColor(state.board, botColor);
  if (moves.length === 0) return null;

  moves = orderMoves(moves, state.board);

  for (const move of moves) {
    const newState = makeMove(state, move.from, move.to);
    if (!newState) continue;
    move.score = minimax(newState, 3, -Infinity, Infinity, false, botColor);
  }

  moves.sort((a, b) => b.score - a.score);
  return moves[0];
}

export function getBotMove(
  state: GameState,
  difficulty: BotDifficulty,
): { from: Position; to: Position } | null {
  if (state.gameOver) return null;

  let move: ScoredMove | null = null;

  switch (difficulty) {
    case 'easy':
      move = getEasyMove(state);
      break;
    case 'medium':
      move = getMediumMove(state);
      break;
    case 'hard':
      move = getHardMove(state);
      break;
  }

  if (!move) return null;
  return { from: move.from, to: move.to };
}
