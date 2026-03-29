import { describe, expect, it } from 'vitest';
import { getEngineSearchTimeoutMs, normalizeEngineFen } from '../fairyStockfishBinary';
import { getReviewMovetime } from '../engineGateway';

describe('normalizeEngineFen', () => {
  it('expands compact board-and-turn positions into full engine fen', () => {
    expect(normalizeEngineFen('rnsmksnr/8/pppppppp/8/8/PPPPPPPP/RNSKMSNR w'))
      .toBe('rnsmksnr/8/pppppppp/8/8/PPPPPPPP/RNSKMSNR w - - 0 1');
  });

  it('keeps full fen strings unchanged', () => {
    expect(normalizeEngineFen('8/8/8/8/8/8/8/8 b - - 0 1'))
      .toBe('8/8/8/8/8/8/8/8 b - - 0 1');
  });

  it('uses a much tighter timeout budget for bot movetime searches', () => {
    expect(getEngineSearchTimeoutMs({
      variant: 'makruk',
      position: '8/8/8/8/8/8/8/8 w',
      search: { movetimeMs: 400 },
    }, 'bot')).toBe(2000);

    expect(getEngineSearchTimeoutMs({
      variant: 'makruk',
      position: '8/8/8/8/8/8/8/8 w',
      search: { movetimeMs: 1200 },
    }, 'analysis')).toBe(6200);
  });

  it('scales review movetime down for long games while preserving short-game quality', () => {
    expect(getReviewMovetime(10, 250)).toBe(250);
    expect(getReviewMovetime(77, 250)).toBe(102);
    expect(getReviewMovetime(200, 250)).toBe(80);
  });
});
