import {
  derivePuzzleOrigin,
  derivePuzzleSourceReference,
  derivePuzzleTags,
  estimatePuzzleDifficultyScore,
  type PuzzleOrigin,
} from './puzzleMetadata';
import type { Puzzle } from './puzzles';

export type RawPuzzle = Omit<Puzzle, 'origin' | 'sourceGameId' | 'sourcePly' | 'tags' | 'difficultyScore'> & {
  origin?: PuzzleOrigin;
  sourceGameId?: string | null;
  sourcePly?: number | null;
  tags?: string[];
  difficultyScore?: number;
};

export function finalizePuzzle(puzzle: RawPuzzle): Puzzle {
  const sourceReference = derivePuzzleSourceReference(puzzle.source);

  return {
    ...puzzle,
    origin: puzzle.origin ?? derivePuzzleOrigin(puzzle.source),
    sourceGameId: puzzle.sourceGameId ?? sourceReference.sourceGameId,
    sourcePly: puzzle.sourcePly ?? sourceReference.sourcePly,
    tags: derivePuzzleTags({
      theme: puzzle.theme,
      difficulty: puzzle.difficulty,
      source: puzzle.source,
      motif: puzzle.motif,
      board: puzzle.board,
      toMove: puzzle.toMove,
      solution: puzzle.solution,
      tags: puzzle.tags,
    }),
    difficultyScore: puzzle.difficultyScore ?? estimatePuzzleDifficultyScore({
      theme: puzzle.theme,
      difficulty: puzzle.difficulty,
      source: puzzle.source,
      motif: puzzle.motif,
      board: puzzle.board,
      toMove: puzzle.toMove,
      solution: puzzle.solution,
      tags: puzzle.tags,
    }),
  };
}
