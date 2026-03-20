import { Board, Piece, PieceColor, Position, PieceType } from './types';

export interface Puzzle {
  id: number;
  title: string;
  description: string;
  explanation: string;
  source: string;
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
    explanation: 'The rook climbs to the back rank and locks down every escape square while your king keeps the mate net safe.',
    source: 'Curated mate study',
    theme: 'Checkmate',
    difficulty: 'beginner',
    toMove: 'white',
    board: (function() {
      const b = emptyBoard();
      b[7][0] = p('K', 'black');
      b[5][1] = p('K', 'white');
      b[6][2] = p('R', 'white');
      return b;
    })(),
    solution: [{ from: { row: 6, col: 2 }, to: { row: 7, col: 2 } }],
  },
  {
    id: 2,
    title: 'Double Met Mate',
    description: 'Two Met (Queens) can be deadly. Find the mate.',
    explanation: 'The second Met joins the attack to cover the last safe square and finish the king immediately.',
    source: 'Curated mate study',
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
    explanation: 'Push the pawn to the promotion rank. In Makruk that turns the Bia into a promoted Met and upgrades your attack.',
    source: 'Curated endgame study',
    theme: 'Promotion',
    difficulty: 'beginner',
    toMove: 'white',
    board: (function() {
      const b = emptyBoard();
      b[0][5] = p('K', 'black');
      b[2][5] = p('K', 'white');
      b[4][4] = p('P', 'white');
      return b;
    })(),
    solution: [{ from: { row: 4, col: 4 }, to: { row: 5, col: 4 } }],
  },
];

export function getPuzzleById(id: number): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id);
}

export function getPuzzlesByDifficulty(difficulty: Puzzle['difficulty']): Puzzle[] {
  return PUZZLES.filter(p => p.difficulty === difficulty);
}
