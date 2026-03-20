import { getLegalMoves, hasAnyLegalMoves, isInCheck, makeMove } from './engine';
import type { Board, GameState, PieceColor, Position } from './types';
import type { Puzzle } from './puzzles';

export interface PuzzleValidationResult {
  puzzleId: number;
  title: string;
  errors: string[];
  warnings: string[];
}

function createGameStateFromPuzzle(puzzle: Puzzle): GameState {
  return {
    board: puzzle.board.map(row => row.map(cell => (cell ? { ...cell } : null))),
    turn: puzzle.toMove,
    moveHistory: [],
    isCheck: isInCheck(puzzle.board, puzzle.toMove),
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    gameOver: false,
    winner: null,
    whiteTime: 0,
    blackTime: 0,
    lastMoveTime: 0,
    moveCount: 0,
  };
}

function countKings(board: Board, color: PieceColor): number {
  let count = 0;
  for (const row of board) {
    for (const piece of row) {
      if (piece?.type === 'K' && piece.color === color) count++;
    }
  }
  return count;
}

function isBoardShapeValid(board: Board): boolean {
  return board.length === 8 && board.every(row => row.length === 8);
}

function isPawnPlacementValid(board: Board): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.type !== 'P') continue;
      if (piece.color === 'white' && row >= 5) return false;
      if (piece.color === 'black' && row <= 2) return false;
    }
  }
  return true;
}

function isLegalMove(board: Board, from: Position, to: Position): boolean {
  return getLegalMoves(board, from).some(move => move.row === to.row && move.col === to.col);
}

function validateThemeOutcome(puzzle: Puzzle, finalState: GameState, errors: string[]): void {
  const lastMove = finalState.moveHistory[finalState.moveHistory.length - 1];

  if (puzzle.theme === 'Checkmate' && !finalState.isCheckmate) {
    errors.push('Final position does not end in checkmate for a Checkmate puzzle.');
  }

  if (puzzle.theme === 'Promotion' && !lastMove?.promoted) {
    errors.push('Final move does not promote a pawn for a Promotion puzzle.');
  }
}

export function validatePuzzle(puzzle: Puzzle): PuzzleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isBoardShapeValid(puzzle.board)) {
    errors.push('Board must be 8x8.');
    return { puzzleId: puzzle.id, title: puzzle.title, errors, warnings };
  }

  if (countKings(puzzle.board, 'white') !== 1 || countKings(puzzle.board, 'black') !== 1) {
    errors.push('Puzzle board must contain exactly one white king and one black king.');
  }

  if (!isPawnPlacementValid(puzzle.board)) {
    errors.push('Puzzle board contains an unpromoted pawn on or beyond its promotion rank.');
  }

  if (puzzle.explanation.trim().length < 20) {
    warnings.push('Puzzle explanation is too short to teach the idea clearly.');
  }

  if (!puzzle.solution.length) {
    errors.push('Puzzle must contain at least one solution move.');
    return { puzzleId: puzzle.id, title: puzzle.title, errors, warnings };
  }

  if (puzzle.solution.length % 2 === 0) {
    errors.push('Puzzle solution must end on the solving side, so solution length must be odd.');
  }

  let state = createGameStateFromPuzzle(puzzle);
  if (!hasAnyLegalMoves(state.board, state.turn)) {
    errors.push('Side to move has no legal moves in the starting position.');
    return { puzzleId: puzzle.id, title: puzzle.title, errors, warnings };
  }

  const firstMove = puzzle.solution[0];
  if (!isLegalMove(state.board, firstMove.from, firstMove.to)) {
    errors.push('First solution move is illegal in the starting position.');
    return { puzzleId: puzzle.id, title: puzzle.title, errors, warnings };
  }

  for (let index = 0; index < puzzle.solution.length; index++) {
    const expectedMove = puzzle.solution[index];
    if (!isLegalMove(state.board, expectedMove.from, expectedMove.to)) {
      errors.push(`Solution move ${index + 1} is illegal for ${state.turn}.`);
      break;
    }

    const nextState = makeMove(state, expectedMove.from, expectedMove.to);
    if (!nextState) {
      errors.push(`Solution move ${index + 1} could not be applied.`);
      break;
    }

    state = nextState;
  }

  if (errors.length === 0) {
    validateThemeOutcome(puzzle, state, errors);
  }

  return { puzzleId: puzzle.id, title: puzzle.title, errors, warnings };
}

export function validatePuzzles(puzzles: Puzzle[]): PuzzleValidationResult[] {
  return puzzles.map(validatePuzzle);
}
