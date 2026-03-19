import { Board, Piece, PieceColor, Position, PieceType } from './types';

export interface Puzzle {
  id: number;
  title: string;
  description: string;
  theme: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  toMove: PieceColor;
  board: Board;
  solution: { from: Position; to: Position }[];
}

function p(type: PieceType, color: PieceColor): Piece {
  return { type, color };
}

function emptyBoard(): Board {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: 'Rua Power',
    description: 'Checkmate the Black Khun using your Rua (Rook).',
    theme: 'Checkmate',
    difficulty: 'beginner',
    toMove: 'white',
    board: (function() {
      const b = emptyBoard();
      b[0][4] = p('K', 'black');
      b[1][0] = p('K', 'white');
      b[1][7] = p('R', 'white');
      return b;
    })(),
    solution: [{ from: { row: 1, col: 7 }, to: { row: 0, col: 7 } }],
  },
  {
    id: 2,
    title: 'Double Met Mate',
    description: 'Two Met (Queens) can be deadly. Find the mate.',
    theme: 'Checkmate',
    difficulty: 'beginner',
    toMove: 'white',
    board: (function() {
      const b = emptyBoard();
      b[0][3] = p('K', 'black');
      b[2][3] = p('K', 'white');
      b[1][2] = p('M', 'white');
      b[2][4] = p('M', 'white');
      return b;
    })(),
    solution: [{ from: { row: 2, col: 4 }, to: { row: 1, col: 3 } }],
  },
  {
    id: 5,
    title: 'Bia Promotion',
    description: 'Promote your Bia (Pawn) to a Met to win.',
    theme: 'Promotion',
    difficulty: 'beginner',
    toMove: 'white',
    board: (function() {
      const b = emptyBoard();
      b[0][5] = p('K', 'black');
      b[2][5] = p('K', 'white');
      b[5][4] = p('P', 'white');
      return b;
    })(),
    solution: [{ from: { row: 5, col: 4 }, to: { row: 6, col: 4 } }],
  },
];

export function getPuzzleById(id: number): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id);
}

export function getPuzzlesByDifficulty(difficulty: Puzzle['difficulty']): Puzzle[] {
  return PUZZLES.filter(p => p.difficulty === difficulty);
}
