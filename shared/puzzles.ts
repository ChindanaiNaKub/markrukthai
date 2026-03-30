import type { Board, Piece, PieceColor, PieceType, Position } from './types';
import { IMPORTED_PUZZLE_CANDIDATES } from './puzzleImportQueue';
import type { PuzzleOrigin } from './puzzleMetadata';
import { finalizePuzzle, type RawPuzzle } from './puzzleCatalog';

export interface PuzzleReviewChecklist {
  themeClarity: 'pass' | 'fail' | 'unreviewed';
  teachingValue: 'pass' | 'fail' | 'unreviewed';
  duplicateRisk: 'clear' | 'duplicate' | 'unreviewed';
  reviewNotes: string;
}

export interface Puzzle {
  id: number;
  title: string;
  description: string;
  explanation: string;
  source: string;
  origin: PuzzleOrigin;
  sourceGameId: string | null;
  sourcePly: number | null;
  theme: string;
  motif: string;
  tags: string[];
  difficultyScore: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reviewStatus: 'ship' | 'quarantine';
  reviewChecklist: PuzzleReviewChecklist;
  toMove: PieceColor;
  board: Board;
  solution: { from: Position; to: Position }[];
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

function shippedReview(reviewNotes: string): PuzzleReviewChecklist {
  return {
    themeClarity: 'pass',
    teachingValue: 'pass',
    duplicateRisk: 'clear',
    reviewNotes,
  };
}

function quarantineReview(
  reviewNotes: string,
  overrides: Partial<Omit<PuzzleReviewChecklist, 'reviewNotes'>> = {},
): PuzzleReviewChecklist {
  return {
    themeClarity: 'pass',
    teachingValue: 'fail',
    duplicateRisk: 'duplicate',
    reviewNotes,
    ...overrides,
  };
}

export function hasPassingReviewChecklist(puzzle: Puzzle): boolean {
  return puzzle.reviewChecklist.themeClarity === 'pass' &&
    puzzle.reviewChecklist.teachingValue === 'pass' &&
    puzzle.reviewChecklist.duplicateRisk === 'clear';
}

export function isPuzzleReadyToShip(puzzle: Puzzle): boolean {
  return puzzle.reviewStatus === 'ship' && hasPassingReviewChecklist(puzzle);
}

const CATALOG_PUZZLES_RAW: RawPuzzle[] = [
  {
    id: 1,
    title: 'Corner Clamp',
    description: 'Mate in 1. Slide the Rua down to finish the trapped king.',
    explanation: 'The rook lands on the mating rank while your Khon and king cover the last escape squares.',
    source: 'Starter pack: mate in 1',
    theme: 'SupportMate',
    motif: 'Rook mate with khon support',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Clear beginner mate pattern with distinct Khon support.'),
    toMove: 'white',
    board: board(
      ['a1', 'S', 'white'],
      ['c1', 'K', 'black'],
      ['f2', 'R', 'white'],
      ['c3', 'K', 'white'],
    ),
    solution: line('f2-f1'),
  },
  {
    id: 2,
    title: 'Long File Finish',
    description: 'Mate in 1. A long rook slide ends the game immediately.',
    explanation: 'Open files are deadly in Makruk. Once the rook reaches the first rank, the black king has no safe square left.',
    source: 'Starter pack: mate in 1',
    theme: 'MateIn1',
    motif: 'Long-file rook mate',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Fast rook mate that teaches how open files punish an exposed king.'),
    toMove: 'white',
    board: board(
      ['g1', 'K', 'black'],
      ['g3', 'K', 'white'],
      ['e7', 'R', 'white'],
    ),
    solution: line('e7-e1'),
  },
  {
    id: 3,
    title: 'Sidewall Mate',
    description: 'Mate in 1. Check from the side and seal the edge.',
    explanation: 'The rook checks across the third rank, and your king keeps the black king boxed in on the rim.',
    source: 'Starter pack: mate in 1',
    theme: 'MateIn1',
    motif: 'Side-rank rook mate',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Simple edge mate that teaches side checks and king support.'),
    toMove: 'white',
    board: board(
      ['g3', 'R', 'white'],
      ['f8', 'K', 'white'],
      ['h8', 'K', 'black'],
    ),
    solution: line('g3-h3'),
  },
  {
    id: 4,
    title: 'Seventh-Rank Ladder',
    description: 'Mate in 1. Lift the rook one square for mate.',
    explanation: 'The rook climbs to the back rank, while the Khon and king close every reply around the cornered king.',
    source: 'Starter pack: mate in 1',
    theme: 'MateIn1',
    motif: 'Rook lift mate',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Clean ladder-style finish that reinforces rook lift geometry.'),
    toMove: 'white',
    board: board(
      ['d5', 'S', 'white'],
      ['f6', 'K', 'white'],
      ['h7', 'R', 'white'],
      ['f8', 'K', 'black'],
    ),
    solution: line('h7-h8'),
  },
  {
    id: 5,
    title: 'Central Ladder',
    description: 'Mate in 1. Use the central rook lift to end it.',
    explanation: 'The rook invades the eighth rank and the supporting pieces take away the king squares around f8.',
    source: 'Starter pack: mate in 1',
    theme: 'MateIn1',
    motif: 'Central rook lift mate',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Compact central mate pattern that still reads clearly for newer players.'),
    toMove: 'white',
    board: board(
      ['d4', 'S', 'white'],
      ['f6', 'K', 'white'],
      ['d7', 'R', 'white'],
      ['f8', 'K', 'black'],
    ),
    solution: line('d7-d8'),
  },
  {
    id: 6,
    title: 'Met-Supported Sweep',
    description: 'Mate in 1. Let the Met support a horizontal rook finish.',
    explanation: 'The Met covers the key diagonals, so the rook can sweep across and deliver a clean mate on the sixth rank.',
    source: 'Starter pack: mate in 1',
    theme: 'SupportMate',
    motif: 'Rook mate with met support',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Distinct mate because the Met support is the actual lesson.'),
    toMove: 'white',
    board: board(
      ['f3', 'M', 'white'],
      ['d6', 'R', 'white'],
      ['f7', 'K', 'white'],
      ['h8', 'K', 'black'],
    ),
    solution: line('d6-h6'),
  },
  {
    id: 7,
    title: 'Supported Promotion',
    description: 'Promote the pawn safely with king support.',
    explanation: 'A single quiet step is enough. Once the pawn reaches the sixth rank, it becomes a promoted Met.',
    source: 'Starter pack: promotion',
    theme: 'Promotion',
    motif: 'Supported promotion',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Helpful first promotion puzzle because the supporting king plan is obvious after the idea clicks.'),
    toMove: 'white',
    board: board(
      ['g4', 'S', 'black'],
      ['c5', 'P', 'white'],
      ['d7', 'K', 'black'],
      ['g7', 'K', 'white'],
    ),
    solution: line('c5-c6'),
  },
  {
    id: 8,
    title: 'Quiet Promotion',
    description: 'Promote with the simplest legal pawn push.',
    explanation: 'This is the basic Makruk promotion pattern: step to the sixth rank and the Bia turns into a promoted Met.',
    source: 'Starter pack: promotion',
    theme: 'Promotion',
    motif: 'Quiet promotion',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Cleanest basic promotion example in the set.'),
    toMove: 'white',
    board: board(
      ['b2', 'K', 'white'],
      ['e5', 'P', 'white'],
      ['a7', 'K', 'black'],
    ),
    solution: line('e5-e6'),
  },
  {
    id: 9,
    title: 'Met Escort',
    description: 'Promote while the Met guards the route.',
    explanation: 'The Met and king keep the key squares under control, so the pawn can promote cleanly on the next step.',
    source: 'Starter pack: promotion',
    theme: 'Promotion',
    motif: 'Promotion with met escort',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Adds one more promotion pattern by showing how the Met controls the promotion route.'),
    toMove: 'white',
    board: board(
      ['f2', 'K', 'black'],
      ['h3', 'K', 'white'],
      ['b5', 'P', 'white'],
      ['e7', 'M', 'white'],
    ),
    solution: line('b5-b6'),
  },
  {
    id: 12,
    title: 'Open File Pickup',
    description: 'Use the open rank to win the opposing rook.',
    explanation: 'Horizontal rook moves are powerful when the path is clear. Capture the black rook and keep the extra material.',
    source: 'Starter pack: tactic',
    theme: 'HangingPiece',
    motif: 'Rook wins rook on open rank',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Clear major-piece pickup and better representative than weaker one-move captures.'),
    toMove: 'white',
    board: board(
      ['a2', 'R', 'black'],
      ['e2', 'R', 'white'],
      ['g3', 'K', 'white'],
      ['g6', 'K', 'black'],
      ['h6', 'M', 'white'],
      ['a7', 'P', 'black'],
    ),
    solution: line('e2-a2'),
  },
  {
    id: 13,
    title: 'Met Wins the Rua',
    description: 'A short diagonal step wins a rook outright.',
    explanation: 'Makruk Mets are small but sharp. The diagonal capture on d1 wins a full rook with no tactical drawback.',
    source: 'Starter pack: tactic',
    theme: 'HangingPiece',
    motif: 'Met wins rook',
    difficulty: 'beginner',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Distinct because the Met, not the rook, wins the material.'),
    toMove: 'white',
    board: board(
      ['d1', 'R', 'black'],
      ['e2', 'M', 'white'],
      ['g5', 'K', 'white'],
      ['d7', 'K', 'black'],
    ),
    solution: line('e2-d1'),
  },
  {
    id: 14,
    title: 'Sideways Pickup',
    description: 'Slide the rook across the rank to collect the Met.',
    explanation: 'When a high-value piece is loose on an open rank, the rook should not hesitate. This capture wins material cleanly.',
    source: 'Starter pack: tactic',
    theme: 'HangingPiece',
    motif: 'Rook wins loose met',
    difficulty: 'intermediate',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Good intermediate pickup because the sideways rook move is there, but not instantly seen.'),
    toMove: 'white',
    board: board(
      ['f2', 'K', 'black'],
      ['g3', 'N', 'white'],
      ['c4', 'R', 'white'],
      ['h4', 'M', 'black'],
      ['f5', 'K', 'white'],
    ),
    solution: line('c4-h4'),
  },
  {
    id: 15,
    title: 'Quiet Pivot, Then Mate',
    description: 'Mate in 2. Pivot first, then crash down the file when the king runs out of squares.',
    explanation: 'The rook pivot is still the point, but White’s pawn shell makes it feel practical instead of empty. Once the king is funneled to f1, the drop on d1 closes the mating net.',
    source: 'Curated tactic: practical mating net',
    theme: 'MateIn2',
    motif: 'Rook pivot mate in 2',
    difficulty: 'intermediate',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Quiet first move and forced reply give this mate-in-2 real teaching value.'),
    toMove: 'white',
    board: board(
      ['e1', 'K', 'black'],
      ['f3', 'K', 'white'],
      ['c5', 'R', 'white'],
      ['d6', 'M', 'white'],
      ['f8', 'S', 'white'],
      ['a4', 'P', 'white'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h4', 'P', 'white'],
    ),
    solution: line('c5-d5', 'e1-f1', 'd5-d1'),
  },
  {
    id: 16,
    title: 'Break The File, Break The King',
    description: 'Mate in 2. Switch files first, then break through on the back rank.',
    explanation: 'The rook swing feels patient because White already owns space with the pawns. Black cannot untangle the back rank in time, so the invasion on d8 seals the mating net.',
    source: 'Curated tactic: practical rook breakthrough',
    theme: 'BackRank',
    motif: 'Back-rank rook switch mate in 2',
    difficulty: 'intermediate',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Strong rook-file breakthrough lesson with a clean forced finish.'),
    toMove: 'white',
    board: board(
      ['a2', 'R', 'white'],
      ['a5', 'P', 'white'],
      ['h5', 'N', 'white'],
      ['f6', 'K', 'white'],
      ['b4', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['f4', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h4', 'P', 'white'],
      ['e8', 'K', 'black'],
    ),
    solution: line('a2-d2', 'e8-f8', 'd2-d8'),
  },
  {
    id: 17,
    title: 'Build The Fence',
    description: 'Mate in 2. Build the fence first, then drop the final rook blow.',
    explanation: 'The rook shift to c5 is the hard move to spot in a normal-looking structure. Once the fence is built and the king is nudged toward a1, Rc1 closes the mating net.',
    source: 'Curated tactic: practical mating net',
    theme: 'MateIn2',
    motif: 'Rook fence mate in 2',
    difficulty: 'intermediate',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Shows how a quiet restricting move can matter more than an immediate check.'),
    toMove: 'white',
    board: board(
      ['b1', 'K', 'black'],
      ['e1', 'N', 'white'],
      ['a3', 'K', 'white'],
      ['f5', 'R', 'white'],
      ['d3', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h3', 'P', 'white'],
    ),
    solution: line('f5-c5', 'b1-a1', 'c5-c1'),
  },
  {
    id: 18,
    title: 'Sweep The Fifth Rank',
    description: 'Mate in 2. Lift first, then sweep across once the king is pushed into place.',
    explanation: 'The rook lift is a quiet setup move from a more believable middlegame shell. Once the king is pushed to a7, the fifth-rank sweep closes the mating net at once.',
    source: 'Curated tactic: practical support mate',
    theme: 'MateIn2',
    motif: 'Fifth-rank rook sweep mate in 2',
    difficulty: 'intermediate',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Clean support-mate sequence with one setup move and one finishing sweep.'),
    toMove: 'white',
    board: board(
      ['c1', 'M', 'white'],
      ['f2', 'R', 'white'],
      ['a6', 'K', 'black'],
      ['c7', 'K', 'white'],
      ['b2', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['d4', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h4', 'P', 'white'],
    ),
    solution: line('f2-f5', 'a6-a7', 'f5-a5'),
  },
  {
    id: 19,
    title: 'Twin Rua Finale',
    description: 'Mate in 2. One rook lures the king deeper, the other slams the back rank shut.',
    explanation: 'The first rook move is only a setup, but White’s pawn shell makes the king’s shelter brittle. Once it is nudged to h8, the second rook lands the back-rank mate.',
    source: 'Curated tactic: practical back-rank finish',
    theme: 'BackRank',
    motif: 'Double rook mate in 2',
    difficulty: 'intermediate',
    reviewStatus: 'ship',
    reviewChecklist: shippedReview('Good coordination lesson for players learning how the two rooks force mating nets together.'),
    toMove: 'white',
    board: board(
      ['f2', 'R', 'white'],
      ['a6', 'R', 'white'],
      ['c6', 'K', 'white'],
      ['g8', 'K', 'black'],
      ['b3', 'P', 'white'],
      ['c4', 'P', 'white'],
      ['d4', 'P', 'white'],
      ['g3', 'P', 'white'],
      ['h4', 'P', 'white'],
    ),
    solution: line('a6-a7', 'g8-h8', 'f2-f8'),
  },
];

const CATALOG_PUZZLES: Puzzle[] = CATALOG_PUZZLES_RAW.map(finalizePuzzle);

export const ALL_PUZZLES: Puzzle[] = [...CATALOG_PUZZLES, ...IMPORTED_PUZZLE_CANDIDATES];

export const PUZZLES: Puzzle[] = ALL_PUZZLES.filter(isPuzzleReadyToShip);

export const QUARANTINED_PUZZLES: Puzzle[] = ALL_PUZZLES.filter(puzzle => !isPuzzleReadyToShip(puzzle));

export function getPuzzleById(id: number): Puzzle | undefined {
  return PUZZLES.find(p => p.id === id);
}

export function getPuzzlesByDifficulty(difficulty: Puzzle['difficulty']): Puzzle[] {
  return PUZZLES.filter(p => p.difficulty === difficulty);
}
