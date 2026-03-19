import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { Board as BoardType, Position, PieceColor, Move } from '@shared/types';
import { createInitialBoard } from '@shared/engine';
import Board, { type Arrow } from '../components/Board';

vi.mock('../components/PieceSVG', () => ({
  default: ({ type, color }: { type: string; color: string }) => {
    return <div data-testid={`piece-${type}-${color}`} />;
  },
}));

const createProps = (overrides: any = {}): any => ({
  board: createInitialBoard(),
  playerColor: 'white' as PieceColor,
  isMyTurn: true,
  legalMoves: [],
  selectedSquare: null,
  lastMove: null,
  isCheck: false,
  checkSquare: null,
  onSquareClick: vi.fn(),
  onPieceDrop: vi.fn(),
  ...overrides,
});

describe('Board Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render 64 squares', () => {
      const { container } = render(<Board {...createProps()} />);
      const squares = container.querySelectorAll('[class*="board-square"]');
      expect(squares.length).toBe(64);
    });

    it('should render pieces on the board', () => {
      const { container } = render(<Board {...createProps()} />);
      const pieces = container.querySelectorAll('[data-testid^="piece-"]');
      expect(pieces.length).toBe(32);
    });

    it('should render white king', () => {
      const { container } = render(<Board {...createProps()} />);
      const whiteKing = container.querySelector('[data-testid="piece-K-white"]');
      expect(whiteKing).toBeInTheDocument();
    });

    it('should render black king', () => {
      const { container } = render(<Board {...createProps()} />);
      const blackKing = container.querySelector('[data-testid="piece-K-black"]');
      expect(blackKing).toBeInTheDocument();
    });
  });

  describe('Square Highlighting', () => {
    it('should highlight selected square', () => {
      const selectedSquare: Position = { row: 2, col: 4 };
      const { container } = render(
        <Board {...createProps({ selectedSquare })} />
      );
      const selectedSquareEl = container.querySelector('.board-square-selected');
      expect(selectedSquareEl).toBeInTheDocument();
    });

    it('should highlight last move squares', () => {
      const lastMove: Move = {
        from: { row: 2, col: 4 },
        to: { row: 3, col: 4 },
      };
      const { container } = render(
        <Board {...createProps({ lastMove })} />
      );
      const lastMoveSquares = container.querySelectorAll('[class*="board-square-lastmove"]');
      expect(lastMoveSquares.length).toBe(2);
    });

    it('should highlight check square', () => {
      const checkSquare: Position = { row: 0, col: 4 };
      const { container } = render(
        <Board {...createProps({ isCheck: true, checkSquare })} />
      );
      const checkSquareEl = container.querySelector('.board-square-check');
      expect(checkSquareEl).toBeInTheDocument();
    });

    it('should show legal move dots', () => {
      const legalMoves: Position[] = [{ row: 3, col: 4 }, { row: 3, col: 3 }];
      const { container } = render(<Board {...createProps({ legalMoves })} />);
      const legalDots = container.querySelectorAll('.legal-dot');
      expect(legalDots.length).toBe(legalMoves.length);
    });

    it('should highlight premove squares', () => {
      const premove = { from: { row: 2, col: 4 }, to: { row: 3, col: 4 } };
      const { container } = render(<Board {...createProps({ premove })} />);
      const premoveSquares = container.querySelectorAll('[class*="board-square-premove"]');
      expect(premoveSquares.length).toBe(2);
    });
  });

  describe('Arrows', () => {
    it('should render arrows', () => {
      const arrows: Arrow[] = [
        { from: { row: 2, col: 4 }, to: { row: 4, col: 4 }, color: '#15781B' },
      ];
      const { container } = render(<Board {...createProps({ arrows })} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const lines = svg?.querySelectorAll('line');
      expect(lines?.length).toBe(1);
    });

    it('should render multiple arrows', () => {
      const arrows: Arrow[] = [
        { from: { row: 2, col: 4 }, to: { row: 4, col: 4 }, color: '#15781B' },
        { from: { row: 2, col: 3 }, to: { row: 4, col: 2 }, color: '#e84040' },
      ];
      const { container } = render(<Board {...createProps({ arrows })} />);
      const lines = container.querySelectorAll('svg line');
      expect(lines.length).toBe(2);
    });

    it('should not render svg when no arrows', () => {
      const { container } = render(<Board {...createProps({ arrows: [] })} />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe('Board Orientation', () => {
    it('should render board for black player', () => {
      const { container } = render(<Board {...createProps({ playerColor: 'black' })} />);
      const pieces = container.querySelectorAll('[data-testid^="piece-"]');
      expect(pieces.length).toBe(32);
    });
  });

  describe('Interactions', () => {
    it('should call onSquareClick when square is clicked', () => {
      const onSquareClick = vi.fn();
      const { container } = render(<Board {...createProps({ onSquareClick })} />);
      const squares = container.querySelectorAll('[class*="board-square"]');
      fireEvent.click(squares[0]);
      expect(onSquareClick).toHaveBeenCalled();
    });

    it('should prevent context menu', () => {
      const { container } = render(<Board {...createProps()} />);
      const board = container.firstChild as HTMLElement;
      const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      board.dispatchEvent(contextMenuEvent);
      expect(contextMenuEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null playerColor', () => {
      const { container } = render(<Board {...createProps({ playerColor: null })} />);
      const board = container.firstChild as HTMLElement;
      expect(board).toBeInTheDocument();
    });

    it('should render empty board', () => {
      const emptyBoard: BoardType = Array(8).fill(null).map(() => Array(8).fill(null));
      const { container } = render(<Board {...createProps({ board: emptyBoard })} />);
      const pieces = container.querySelectorAll('[data-testid^="piece-"]');
      expect(pieces.length).toBe(0);
    });
  });
});
