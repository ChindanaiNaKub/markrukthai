import { Board, Piece, PieceColor, Position } from './types';

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

function p(type: Piece['type'], color: PieceColor): Piece {
  return { type, color };
}

function emptyBoard(): Board {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

export const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: 'Back Rank Mate',
    description: 'Use your rook to deliver checkmate on the back rank.',
    theme: 'Checkmate',
    difficulty: 'beginner',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[0][0] = p('R', 'white');
      b[7][4] = p('K', 'black');
      b[6][3] = p('P', 'black');
      b[6][4] = p('P', 'black');
      b[6][5] = p('P', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 0, col: 0 }, to: { row: 7, col: 0 } },
    ],
  },
  {
    id: 2,
    title: 'Knight Fork',
    description: 'Find the knight fork to win material.',
    theme: 'Fork',
    difficulty: 'beginner',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[2][2] = p('N', 'white');
      b[7][4] = p('K', 'black');
      b[5][3] = p('R', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 2, col: 2 }, to: { row: 4, col: 3 } },
    ],
  },
  {
    id: 3,
    title: 'Rook Skewer',
    description: 'Use the rook to skewer the king and win the piece behind it.',
    theme: 'Skewer',
    difficulty: 'beginner',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][0] = p('K', 'white');
      b[3][0] = p('R', 'white');
      b[5][4] = p('K', 'black');
      b[5][7] = p('R', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 3, col: 0 }, to: { row: 5, col: 0 } },
    ],
  },
  {
    id: 4,
    title: 'Promote and Win',
    description: 'Push the pawn to promotion and gain a decisive advantage.',
    theme: 'Promotion',
    difficulty: 'beginner',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][0] = p('K', 'white');
      b[4][3] = p('P', 'white');
      b[7][7] = p('K', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 4, col: 3 }, to: { row: 5, col: 3 } },
    ],
  },
  {
    id: 5,
    title: 'Double Rook Mate',
    description: 'Coordinate your two rooks to deliver checkmate.',
    theme: 'Checkmate',
    difficulty: 'intermediate',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[5][0] = p('R', 'white');
      b[6][7] = p('R', 'white');
      b[7][4] = p('K', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 6, col: 7 }, to: { row: 7, col: 7 } },
    ],
  },
  {
    id: 6,
    title: 'Knight Checkmate',
    description: 'Use the knight and rook together to deliver checkmate.',
    theme: 'Checkmate',
    difficulty: 'intermediate',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][0] = p('K', 'white');
      b[4][5] = p('N', 'white');
      b[5][0] = p('R', 'white');
      b[7][7] = p('K', 'black');
      b[6][7] = p('P', 'black');
      b[7][6] = p('P', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 4, col: 5 }, to: { row: 6, col: 6 } },
    ],
  },
  {
    id: 7,
    title: 'Win the Exchange',
    description: 'Find the tactic to win the opponent\'s rook.',
    theme: 'Tactic',
    difficulty: 'intermediate',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[0][0] = p('R', 'white');
      b[3][3] = p('N', 'white');
      b[7][4] = p('K', 'black');
      b[5][2] = p('R', 'black');
      b[5][5] = p('S', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 3, col: 3 }, to: { row: 5, col: 2 } },
    ],
  },
  {
    id: 8,
    title: 'Discovered Attack',
    description: 'Move one piece to reveal an attack from the piece behind it.',
    theme: 'Discovery',
    difficulty: 'intermediate',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[3][4] = p('R', 'white');
      b[3][3] = p('S', 'white');
      b[7][4] = p('K', 'black');
      b[5][2] = p('M', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 3, col: 3 }, to: { row: 4, col: 2 } },
    ],
  },
  {
    id: 9,
    title: 'Smothered Mate',
    description: 'The opponent\'s own pieces block their king\'s escape. Find the mate!',
    theme: 'Checkmate',
    difficulty: 'advanced',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[4][5] = p('N', 'white');
      b[7][7] = p('K', 'black');
      b[7][6] = p('R', 'black');
      b[6][7] = p('R', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 4, col: 5 }, to: { row: 6, col: 6 } },
    ],
  },
  {
    id: 10,
    title: 'Queen Trap',
    description: 'Trap the opponent\'s met (queen) with a clever move.',
    theme: 'Tactic',
    difficulty: 'advanced',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[2][1] = p('N', 'white');
      b[3][3] = p('S', 'white');
      b[7][4] = p('K', 'black');
      b[4][2] = p('M', 'black');
      b[6][0] = p('R', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 3, col: 3 }, to: { row: 4, col: 3 } },
    ],
  },
  {
    id: 11,
    title: 'Rook Endgame',
    description: 'Find the winning move in this rook endgame.',
    theme: 'Endgame',
    difficulty: 'advanced',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[1][4] = p('K', 'white');
      b[0][0] = p('R', 'white');
      b[4][3] = p('P', 'white');
      b[6][4] = p('K', 'black');
      b[7][7] = p('R', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 4, col: 3 }, to: { row: 5, col: 3 } },
    ],
  },
  {
    id: 12,
    title: 'Sacrifice for Mate',
    description: 'Sacrifice a piece to force checkmate.',
    theme: 'Sacrifice',
    difficulty: 'advanced',
    toMove: 'white',
    board: (() => {
      const b = emptyBoard();
      b[0][4] = p('K', 'white');
      b[5][0] = p('R', 'white');
      b[3][6] = p('R', 'white');
      b[7][6] = p('K', 'black');
      b[6][5] = p('P', 'black');
      b[6][6] = p('P', 'black');
      b[6][7] = p('P', 'black');
      return b;
    })(),
    solution: [
      { from: { row: 3, col: 6 }, to: { row: 6, col: 6 } },
    ],
  },
];

export function getPuzzleById(id: number): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id);
}

export function getPuzzlesByDifficulty(difficulty: Puzzle['difficulty']): Puzzle[] {
  return PUZZLES.filter(p => p.difficulty === difficulty);
}
