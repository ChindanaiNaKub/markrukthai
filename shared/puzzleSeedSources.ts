import type { Board, Piece, PieceColor, PieceType, Position } from './types';
import { createSeedPuzzleSource } from './puzzleSourceImport';

function p(type: PieceType, color: PieceColor): Piece {
  return { type, color };
}

function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function square(name: string): Position {
  return {
    col: name.charCodeAt(0) - 97,
    row: Number.parseInt(name[1], 10) - 1,
  };
}

function board(...placements: [square: string, type: PieceType, color: PieceColor][]): Board {
  const next = emptyBoard();

  for (const [name, type, color] of placements) {
    const { row, col } = square(name);
    next[row][col] = p(type, color);
  }

  return next;
}

function line(...steps: string[]) {
  return steps.map((step) => {
    const [from, to] = step.split('-');
    if (!from || !to) {
      throw new Error(`Invalid move step: ${step}`);
    }

    return {
      from: square(from),
      to: square(to),
    };
  });
}

export const SEED_PUZZLE_SOURCES = [
  createSeedPuzzleSource({
    id: 'seed-corridor-switch',
    source: 'Seed game corpus: corridor-switch',
    moveCount: 38,
    result: '1-0',
    resultReason: 'checkmate',
    startingPlyNumber: 21,
    initialBoard: board(
      ['d1', 'K', 'black'],
      ['c3', 'K', 'white'],
      ['f5', 'R', 'white'],
      ['e6', 'M', 'white'],
      ['c8', 'S', 'white'],
    ),
    moves: line('f5-e5', 'd1-c1', 'e5-e1'),
  }),
  createSeedPuzzleSource({
    id: 'seed-trapped-knight',
    source: 'Seed game corpus: trapped-knight',
    moveCount: 34,
    result: '1-0',
    resultReason: 'resignation',
    startingPlyNumber: 17,
    initialBoard: board(
      ['a1', 'N', 'black'],
      ['c1', 'S', 'white'],
      ['d1', 'K', 'white'],
      ['e1', 'M', 'white'],
      ['f1', 'S', 'white'],
      ['g1', 'N', 'white'],
      ['h1', 'R', 'white'],
      ['a3', 'P', 'white'],
      ['c3', 'N', 'white'],
      ['f3', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['a6', 'P', 'black'],
      ['d6', 'P', 'black'],
      ['e6', 'P', 'black'],
      ['f6', 'P', 'black'],
      ['g6', 'P', 'black'],
      ['h6', 'P', 'black'],
      ['e7', 'N', 'black'],
      ['a8', 'R', 'black'],
      ['c8', 'S', 'black'],
      ['d8', 'M', 'black'],
      ['e8', 'K', 'black'],
      ['f8', 'S', 'black'],
      ['h8', 'R', 'black'],
    ),
    moves: line('c1-b2', 'a1-b3', 'b2-b3'),
  }),
  createSeedPuzzleSource({
    id: 'seed-rook-fork',
    source: 'Seed game corpus: rook-fork',
    moveCount: 26,
    result: '1-0',
    resultReason: 'resignation',
    startingPlyNumber: 13,
    initialBoard: board(
      ['a1', 'K', 'white'],
      ['a2', 'R', 'white'],
      ['e8', 'K', 'black'],
      ['h2', 'R', 'black'],
    ),
    moves: line('a2-e2', 'e8-f8', 'e2-h2'),
  }),
];
