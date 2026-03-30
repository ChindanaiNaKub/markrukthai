import { describe, expect, it } from 'vitest';

import { getPuzzleProgressSummary } from '../lib/puzzleProgress';

describe('puzzleProgress summary', () => {
  it('computes success rate and adaptive difficulty from attempts', () => {
    const summary = getPuzzleProgressSummary([
      {
        puzzleId: 6,
        lastPlayedAt: 1711660000,
        completedAt: 1711660000,
        attempts: 1,
        successes: 1,
        failures: 0,
      },
      {
        puzzleId: 5001,
        lastPlayedAt: 1711660100,
        completedAt: null,
        attempts: 2,
        successes: 0,
        failures: 2,
      },
    ]);

    expect(summary.completedCount).toBeGreaterThanOrEqual(1);
    expect(summary.attemptCount).toBe(3);
    expect(summary.successRate).toBe(33);
    expect(summary.recommendedDifficultyScore).toBeGreaterThan(0);
    expect(summary.nextPuzzle).not.toBeNull();
  });
});
