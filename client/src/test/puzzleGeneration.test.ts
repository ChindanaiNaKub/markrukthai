import { describe, expect, it } from 'vitest';

import { ALL_PUZZLES } from '@shared/puzzles';
import { createImportedPuzzleCandidate } from '@shared/puzzleImportQueue';
import { classifyMaterialTheme, generatePuzzleCandidateDraftsFromMoveSequence } from '@shared/puzzleGeneration';
import { parsePgnLikePuzzleSources } from '@shared/puzzleSourceImport';
import { SEED_PUZZLE_SOURCES } from '@shared/puzzleSeedSources';
import { validatePuzzle } from '@shared/puzzleValidation';
import type { Board, Piece, PieceColor, PieceType, Position } from '@shared/types';

function p(type: PieceType, color: PieceColor): Piece {
  return { type, color };
}

function emptyBoard(): Board {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

function square(name: string): Position {
  return {
    col: name.charCodeAt(0) - 97,
    row: parseInt(name[1], 10) - 1,
  };
}

describe('puzzleGeneration', () => {
  it('mines a valid multi-ply candidate from a solved puzzle move sequence', () => {
    const basePuzzle = ALL_PUZZLES.find(candidate => candidate.id === 15);
    expect(basePuzzle).toBeDefined();

    const generated = generatePuzzleCandidateDraftsFromMoveSequence({
      id: 'fixture-game',
      source: 'fixture import',
      moves: basePuzzle!.solution,
      initialBoard: basePuzzle!.board,
      startingTurn: basePuzzle!.toMove,
    }, {
      startingId: 7000,
      minPlies: 3,
      maxPlies: 3,
      maxCandidates: 1,
      minSourceMoves: 1,
    });

    expect(generated).toHaveLength(1);
    expect(generated[0].draft.id).toBe(7000);
    expect(generated[0].draft.theme).toBe('MateIn2');
    expect(generated[0].draft.description).toContain('Mate in 2');

    const candidate = createImportedPuzzleCandidate(generated[0].draft);
    const result = validatePuzzle(candidate);

    expect(result.errors).toEqual([]);
  });

  it('rejects trivial one-ply loose-piece pickups from the real-game mining pipeline', () => {
    const basePuzzle = ALL_PUZZLES.find(candidate => candidate.id === 12);
    expect(basePuzzle).toBeDefined();

    const generated = generatePuzzleCandidateDraftsFromMoveSequence({
      id: 'fixture-hanging-piece',
      source: 'fixture import',
      moves: basePuzzle!.solution,
      initialBoard: basePuzzle!.board,
      startingTurn: basePuzzle!.toMove,
    }, {
      startingId: 7100,
      minPlies: 1,
      maxPlies: 1,
      maxCandidates: 1,
      minSourceMoves: 1,
    });

    expect(generated).toHaveLength(0);
  });

  it('classifies Makruk forks when a knight attacks the king and material together', () => {
    const board = emptyBoard();
    board[square('a1').row][square('a1').col] = p('K', 'white');
    board[square('e4').row][square('e4').col] = p('N', 'white');
    board[square('e8').row][square('e8').col] = p('K', 'black');
    board[square('h5').row][square('h5').col] = p('R', 'black');

    const theme = classifyMaterialTheme(board, 'white', [
      { from: square('e4'), to: square('f6') },
    ]);

    expect(theme).toBe('Fork');
  });

  it('classifies Makruk pins when a rook freezes a piece against the king', () => {
    const board = emptyBoard();
    board[square('a1').row][square('a1').col] = p('K', 'white');
    board[square('a2').row][square('a2').col] = p('R', 'white');
    board[square('e7').row][square('e7').col] = p('N', 'black');
    board[square('e8').row][square('e8').col] = p('K', 'black');

    const theme = classifyMaterialTheme(board, 'white', [
      { from: square('a2'), to: square('e2') },
    ]);

    expect(theme).toBe('Pin');
  });

  it('classifies rook overloads as DoubleAttack when a non-knight attacks king and material together', () => {
    const board = emptyBoard();
    board[square('a1').row][square('a1').col] = p('K', 'white');
    board[square('a2').row][square('a2').col] = p('R', 'white');
    board[square('e8').row][square('e8').col] = p('K', 'black');
    board[square('h2').row][square('h2').col] = p('R', 'black');

    const theme = classifyMaterialTheme(board, 'white', [
      { from: square('a2'), to: square('e2') },
      { from: square('e8'), to: square('f8') },
      { from: square('e2'), to: square('h2') },
    ]);

    expect(theme).toBe('DoubleAttack');
  });

  it('mines candidates from the bundled seed game corpus', () => {
    const generated = generatePuzzleCandidateDraftsFromMoveSequence(SEED_PUZZLE_SOURCES[1], {
      startingId: 9100,
      minPlies: 3,
      maxPlies: 3,
      maxCandidates: 1,
      minSourceMoves: 1,
    });

    expect(generated).toHaveLength(1);
    expect(generated[0]?.draft.source).toContain('ply 17');
    expect(generated[0]?.draft.tags).toContain('seed-game');
    expect(generated[0]?.draft.tags).toContain('trap');
    expect(generated[0]?.draft.difficultyScore).toBeGreaterThan(0);
  });

  it('parses PGN-like coordinate imports into puzzle sources', () => {
    const sources = parsePgnLikePuzzleSources(`
[Game "seed-miniature"]
[Source "Seed game corpus: import-smoke"]
[Result "1-0"]
[ResultReason "checkmate"]
[MoveCount "24"]
[StartingPly "9"]

1. a2-a3 h7-h6 2. a3-a4 h6-h5
    `);

    expect(sources).toHaveLength(1);
    expect(sources[0]?.id).toBe('seed-miniature');
    expect(sources[0]?.source).toBe('Seed game corpus: import-smoke');
    expect(sources[0]?.startingPlyNumber).toBe(9);
    expect(sources[0]?.moves).toHaveLength(4);
  });
});
