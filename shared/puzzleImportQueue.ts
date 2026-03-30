import type { Board, Piece, PieceColor, PieceType, Position } from './types';
import type { Puzzle } from './puzzles';
import type { PuzzleOrigin } from './puzzleMetadata';
import { finalizePuzzle } from './puzzleCatalog';

export interface PuzzleCandidateDraft extends Omit<Puzzle, 'reviewStatus' | 'reviewChecklist' | 'origin' | 'sourceGameId' | 'sourcePly' | 'tags' | 'difficultyScore'> {
  origin?: PuzzleOrigin;
  sourceGameId?: string | null;
  sourcePly?: number | null;
  tags?: string[];
  difficultyScore?: number;
}

type Placement = [square: string, type: PieceType, color: PieceColor];

function p(type: PieceType, color: PieceColor): Piece {
  return { type, color };
}

function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function square(name: string): Position {
  if (!/^[a-h][1-8]$/.test(name)) {
    throw new Error(`Invalid square: ${name}`);
  }

  return {
    col: name.charCodeAt(0) - 97,
    row: parseInt(name[1], 10) - 1,
  };
}

function board(...placements: Placement[]): Board {
  const next = emptyBoard();

  for (const [name, type, color] of placements) {
    const { row, col } = square(name);
    next[row][col] = p(type, color);
  }

  return next;
}

function line(...steps: string[]): { from: Position; to: Position }[] {
  return steps.map(step => {
    const [from, to] = step.split('-');
    if (!from || !to) {
      throw new Error(`Invalid move step: ${step}`);
    }

    return { from: square(from), to: square(to) };
  });
}

export function createImportedPuzzleCandidate(draft: PuzzleCandidateDraft): Puzzle {
  return finalizePuzzle({
    ...draft,
    reviewStatus: 'quarantine',
    reviewChecklist: {
      themeClarity: 'unreviewed',
      teachingValue: 'unreviewed',
      duplicateRisk: 'unreviewed',
      reviewNotes: '',
    },
  });
}

function createReviewedImportedPuzzleCandidate(draft: PuzzleCandidateDraft, reviewNotes: string): Puzzle {
  return finalizePuzzle({
    ...draft,
    reviewStatus: 'ship',
    reviewChecklist: {
      themeClarity: 'pass',
      teachingValue: 'pass',
      duplicateRisk: 'clear',
      reviewNotes,
    },
  });
}

const CANDIDATE_DRAFTS: PuzzleCandidateDraft[] = [
  {
    id: 1001,
    title: 'Quiet Corridor',
    description: 'Mate in 2. Slide to the corridor first, then drop the final rook blow.',
    explanation: 'Nothing is taken on move one. The corridor switch is still a pure restriction move, but now it sits inside a more believable pawn shell before the final rook drop closes the mating net.',
    source: 'Curated tactic: practical corridor mate',
    theme: 'MateIn2',
    motif: 'Curated rook corridor mate in 2',
    difficulty: 'intermediate',
    toMove: 'white',
    board: board(
      ['d1', 'K', 'black'],
      ['c3', 'K', 'white'],
      ['f5', 'R', 'white'],
      ['e6', 'M', 'white'],
      ['c8', 'S', 'white'],
      ['a4', 'P', 'white'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h4', 'P', 'white'],
    ),
    solution: line('f5-e5', 'd1-c1', 'e5-e1'),
  },
  {
    id: 1002,
    title: 'Break The Back Rank',
    description: 'Mate in 2. Detour across the second rank, then break through on the eighth.',
    explanation: 'The rook does not check right away. It shifts first from a realistic middlegame shell, freezes the king, and only then rips through the back rank for mate.',
    source: 'Curated tactic: practical rook breakthrough',
    theme: 'BackRank',
    motif: 'Curated back-rank rook switch mate in 2',
    difficulty: 'intermediate',
    toMove: 'white',
    board: board(
      ['h2', 'R', 'white'],
      ['h5', 'P', 'white'],
      ['a5', 'N', 'white'],
      ['c6', 'K', 'white'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['d4', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['d8', 'K', 'black'],
    ),
    solution: line('h2-e2', 'd8-c8', 'e2-e8'),
  },
  {
    id: 5001,
    title: 'Trap The Knight Before It Escapes',
    description: 'Win material in 2. Shut the door first, then take the knight when it has nowhere useful left.',
    explanation: 'The key move is not a capture. It is the trap. Once the knight is boxed in, every black reply still leaves it falling next.',
    source: 'Exported rated game 8eb070e4 (ply 17)',
    theme: 'TrappedPiece',
    motif: 'Real-game trapped knight',
    difficulty: 'advanced',
    toMove: 'white',
    board: board(
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
    solution: line('c1-b2', 'a1-b3', 'b2-b3'),
  },
  {
    id: 6001,
    title: 'Fork Or Fail',
    description: 'Win material in 2. In the middlegame clutter, only one knight jump forks the king and rook cleanly.',
    explanation: 'Most forcing-looking moves are noise. The right jump checks the king and attacks the rook, and the extra pieces on the board make the fork easy to miss at first glance.',
    source: 'Curated tactic: middlegame knight fork',
    theme: 'Fork',
    motif: 'Curated knight fork in a dense middlegame shell',
    difficulty: 'advanced',
    toMove: 'white',
    board: board(
      ['b1', 'K', 'white'],
      ['c1', 'S', 'white'],
      ['d1', 'M', 'white'],
      ['e4', 'N', 'white'],
      ['h1', 'R', 'white'],
      ['a4', 'P', 'white'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['f3', 'P', 'white'],
      ['g4', 'P', 'white'],
      ['h3', 'P', 'white'],
      ['a5', 'P', 'black'],
      ['b6', 'P', 'black'],
      ['c6', 'P', 'black'],
      ['e6', 'P', 'black'],
      ['g6', 'P', 'black'],
      ['h6', 'P', 'black'],
      ['a8', 'R', 'black'],
      ['b7', 'R', 'black'],
      ['d8', 'M', 'black'],
      ['e8', 'K', 'black'],
      ['f8', 'S', 'black'],
      ['h8', 'R', 'black'],
    ),
    solution: line('e4-d6', 'e8-d7', 'd6-b7'),
  },
  {
    id: 6002,
    title: 'Quiet Move, Collapse The Defense',
    description: 'Win material in 2. In the middlegame traffic, the quiet Khon step creates the only clean double attack.',
    explanation: 'The first move does not capture anything. It attacks the king and rook together, and Black cannot untangle both threats in time.',
    source: 'Curated tactic: middlegame double attack',
    theme: 'DoubleAttack',
    motif: 'Curated khon double attack in a dense middlegame shell',
    difficulty: 'advanced',
    toMove: 'white',
    board: board(
      ['e4', 'K', 'white'],
      ['c1', 'S', 'white'],
      ['d1', 'M', 'white'],
      ['d4', 'S', 'white'],
      ['h1', 'R', 'white'],
      ['a4', 'P', 'white'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['f3', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h3', 'P', 'white'],
      ['a5', 'P', 'black'],
      ['b6', 'P', 'black'],
      ['c6', 'P', 'black'],
      ['g6', 'P', 'black'],
      ['h6', 'P', 'black'],
      ['a8', 'R', 'black'],
      ['c8', 'S', 'black'],
      ['d6', 'R', 'black'],
      ['d8', 'M', 'black'],
      ['f6', 'K', 'black'],
      ['f8', 'S', 'black'],
    ),
    solution: line('d4-e5', 'f6-g5', 'e5-d6'),
  },
  {
    id: 6006,
    title: 'Pin First, Then Punish',
    description: 'Win material in 2. Slide the rook into the open file, pin the knight, then take it when the king has to step away.',
    explanation: 'This one is meant to feel practical, not artificial. The rook move pins the knight on e7, and White already has enough nearby support that the follow-up capture on e7 is sound after the king moves.',
    source: 'Curated tactic: practical middlegame pin',
    theme: 'Pin',
    motif: 'Curated practical rook pin from a human middlegame structure',
    difficulty: 'advanced',
    toMove: 'white',
    board: board(
      ['a1', 'R', 'white'],
      ['c1', 'K', 'white'],
      ['c2', 'S', 'white'],
      ['c3', 'N', 'white'],
      ['g2', 'N', 'white'],
      ['h1', 'R', 'white'],
      ['a3', 'P', 'white'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['d4', 'P', 'white'],
      ['f3', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h3', 'P', 'white'],
      ['d2', 'M', 'white'],
      ['a6', 'P', 'black'],
      ['b6', 'P', 'black'],
      ['c6', 'P', 'black'],
      ['d6', 'P', 'black'],
      ['g6', 'P', 'black'],
      ['h6', 'P', 'black'],
      ['c7', 'M', 'black'],
      ['e7', 'N', 'black'],
      ['a8', 'R', 'black'],
      ['c8', 'S', 'black'],
      ['b8', 'N', 'black'],
      ['e8', 'K', 'black'],
      ['g7', 'S', 'black'],
      ['h8', 'R', 'black'],
    ),
    solution: line('h1-e1', 'e8-f7', 'e1-e7'),
  },
  {
    id: 6007,
    title: 'Pawn Fork In Slow Motion',
    description: 'Win material in 2. In the middlegame crowd, the quiet pawn push is the only move that forks king and rook.',
    explanation: 'The pawn advance looks modest beside the heavier pieces, but it forks the king and rook at once. Black still has several natural replies, yet the rook cannot be saved.',
    source: 'Curated tactic: middlegame pawn fork',
    theme: 'Fork',
    motif: 'Curated pawn fork in a dense middlegame shell',
    difficulty: 'advanced',
    toMove: 'white',
    board: board(
      ['e5', 'K', 'white'],
      ['c1', 'S', 'white'],
      ['d1', 'M', 'white'],
      ['h1', 'R', 'white'],
      ['d5', 'P', 'white'],
      ['a4', 'P', 'white'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['f3', 'P', 'white'],
      ['g4', 'P', 'white'],
      ['h3', 'P', 'white'],
      ['a6', 'P', 'black'],
      ['b6', 'P', 'black'],
      ['g6', 'P', 'black'],
      ['h6', 'P', 'black'],
      ['a8', 'R', 'black'],
      ['c7', 'R', 'black'],
      ['c8', 'S', 'black'],
      ['d8', 'M', 'black'],
      ['e7', 'K', 'black'],
      ['f8', 'S', 'black'],
    ),
    solution: line('d5-d6', 'e7-d7', 'd6-c7'),
  },
];

const REVIEWED_IMPORT_IDS = new Set([1001, 1002, 5001, 6001, 6002, 6006, 6007]);

export const IMPORTED_PUZZLE_CANDIDATES: Puzzle[] = CANDIDATE_DRAFTS.map(draft =>
  REVIEWED_IMPORT_IDS.has(draft.id)
    ? createReviewedImportedPuzzleCandidate(
      draft,
      'Promoted into the curated tactical pack because the motif is clear, legal, and worth replaying.',
    )
    : createImportedPuzzleCandidate(draft),
);
