import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Position, PieceColor, Move, GameState, Board as BoardType } from '@shared/types';
import { getLegalMoves, makeMove, isInCheck } from '@shared/engine';
import { PUZZLES, Puzzle } from '@shared/puzzles';
import { playMoveSound, playCaptureSound, playCheckSound, playGameOverSound } from '../lib/sounds';
import Board from './Board';
import PieceSVG from './PieceSVG';

type PuzzleStatus = 'playing' | 'success' | 'failed';

function createGameStateFromPuzzle(puzzle: Puzzle): GameState {
  return {
    board: puzzle.board.map(row => row.map(cell => cell ? { ...cell } : null)),
    turn: puzzle.toMove,
    moveHistory: [],
    isCheck: isInCheck(puzzle.board, puzzle.toMove),
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    gameOver: false,
    winner: null,
    whiteTime: 0,
    blackTime: 0,
    lastMoveTime: 0,
    moveCount: 0,
  };
}

function PuzzleListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const completedPuzzles = new Set(
    JSON.parse(localStorage.getItem('completedPuzzles') || '[]') as number[]
  );

  const filteredPuzzles = filter === 'all'
    ? PUZZLES
    : PUZZLES.filter(p => p.difficulty === filter);

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-text';
    }
  };

  const getDifficultyBg = (d: string) => {
    switch (d) {
      case 'beginner': return 'bg-green-400/10 border-green-400/30';
      case 'intermediate': return 'bg-yellow-400/10 border-yellow-400/30';
      case 'advanced': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-surface-alt border-surface-hover';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-surface-alt border-b border-surface-hover">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PieceSVG type="K" color="white" size={36} />
            <h1 className="text-xl font-bold text-text-bright tracking-tight">Makruk</h1>
          </button>
          <span className="text-text-dim text-sm">Puzzles</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text-bright mb-2">Makruk Puzzles</h2>
          <p className="text-text-dim">
            Sharpen your Makruk skills with tactical puzzles.
            Find the best move!
          </p>
          <p className="text-primary text-sm mt-1">
            {completedPuzzles.size}/{PUZZLES.length} completed
          </p>
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-surface-alt hover:bg-surface-hover text-text border border-surface-hover'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPuzzles.map(puzzle => (
            <button
              key={puzzle.id}
              onClick={() => navigate(`/puzzle/${puzzle.id}`)}
              className="bg-surface-alt border border-surface-hover rounded-xl p-5 text-left hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-text-bright group-hover:text-primary-light transition-colors">
                  #{puzzle.id} · {puzzle.title}
                </h3>
                {completedPuzzles.has(puzzle.id) && (
                  <span className="text-primary text-sm font-bold">✓</span>
                )}
              </div>
              <p className="text-text-dim text-sm mb-3">{puzzle.description}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyBg(puzzle.difficulty)} ${getDifficultyColor(puzzle.difficulty)}`}>
                  {puzzle.difficulty}
                </span>
                <span className="text-xs text-text-dim px-2 py-0.5 rounded bg-surface border border-surface-hover">
                  {puzzle.theme}
                </span>
                <span className="text-xs text-text-dim ml-auto">
                  {puzzle.toMove === 'white' ? 'White' : 'Black'} to move
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-surface-alt hover:bg-surface-hover text-text-bright rounded-lg border border-surface-hover transition-colors"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}

function PuzzlePlayer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const puzzleId = parseInt(id || '1');
  const puzzle = PUZZLES.find(p => p.id === puzzleId);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [status, setStatus] = useState<PuzzleStatus>('playing');
  const [currentSolutionStep, setCurrentSolutionStep] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (puzzle) {
      setGameState(createGameStateFromPuzzle(puzzle));
      setSelectedSquare(null);
      setLegalMoves([]);
      setStatus('playing');
      setCurrentSolutionStep(0);
      setHintUsed(false);
      setShowHint(false);
    }
  }, [puzzleId]);

  const markCompleted = useCallback(() => {
    const completed = JSON.parse(localStorage.getItem('completedPuzzles') || '[]') as number[];
    if (!completed.includes(puzzleId)) {
      completed.push(puzzleId);
      localStorage.setItem('completedPuzzles', JSON.stringify(completed));
    }
  }, [puzzleId]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (!gameState || !puzzle || status !== 'playing') return;

    const piece = gameState.board[pos.row][pos.col];
    const playerColor = puzzle.toMove;

    if (selectedSquare) {
      const isLegal = legalMoves.some(m => m.row === pos.row && m.col === pos.col);
      if (isLegal) {
        const expectedMove = puzzle.solution[currentSolutionStep];

        const isCorrect =
          selectedSquare.row === expectedMove.from.row &&
          selectedSquare.col === expectedMove.from.col &&
          pos.row === expectedMove.to.row &&
          pos.col === expectedMove.to.col;

        if (isCorrect) {
          const newState = makeMove(gameState, selectedSquare, pos);
          if (newState) {
            setGameState(newState);
            setSelectedSquare(null);
            setLegalMoves([]);

            const lastMove = newState.moveHistory[newState.moveHistory.length - 1];
            if (newState.isCheck) playCheckSound();
            else if (lastMove.captured) playCaptureSound();
            else playMoveSound();

            const nextStep = currentSolutionStep + 1;
            if (nextStep >= puzzle.solution.length) {
              setStatus('success');
              markCompleted();
              playGameOverSound();
            } else {
              setCurrentSolutionStep(nextStep);
            }
          }
        } else {
          setStatus('failed');
          setSelectedSquare(null);
          setLegalMoves([]);
        }
        return;
      }
    }

    if (piece && piece.color === playerColor) {
      setSelectedSquare(pos);
      setLegalMoves(getLegalMoves(gameState.board, pos));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [gameState, puzzle, selectedSquare, legalMoves, status, currentSolutionStep, markCompleted]);

  const handlePieceDrop = useCallback((from: Position, to: Position) => {
    if (!gameState || !puzzle || status !== 'playing') return;
    const piece = gameState.board[from.row][from.col];
    if (!piece || piece.color !== puzzle.toMove) return;

    const legal = getLegalMoves(gameState.board, from);
    if (!legal.some(m => m.row === to.row && m.col === to.col)) return;

    const expectedMove = puzzle.solution[currentSolutionStep];
    const isCorrect =
      from.row === expectedMove.from.row &&
      from.col === expectedMove.from.col &&
      to.row === expectedMove.to.row &&
      to.col === expectedMove.to.col;

    if (isCorrect) {
      const newState = makeMove(gameState, from, to);
      if (newState) {
        setGameState(newState);
        setSelectedSquare(null);
        setLegalMoves([]);

        const lastMove = newState.moveHistory[newState.moveHistory.length - 1];
        if (newState.isCheck) playCheckSound();
        else if (lastMove.captured) playCaptureSound();
        else playMoveSound();

        const nextStep = currentSolutionStep + 1;
        if (nextStep >= puzzle.solution.length) {
          setStatus('success');
          markCompleted();
          playGameOverSound();
        } else {
          setCurrentSolutionStep(nextStep);
        }
      }
    } else {
      setStatus('failed');
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  }, [gameState, puzzle, status, currentSolutionStep, markCompleted]);

  const handleRetry = () => {
    if (puzzle) {
      setGameState(createGameStateFromPuzzle(puzzle));
      setSelectedSquare(null);
      setLegalMoves([]);
      setStatus('playing');
      setCurrentSolutionStep(0);
      setShowHint(false);
    }
  };

  const handleHint = () => {
    if (!puzzle || status !== 'playing') return;
    setHintUsed(true);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };

  const getNextPuzzle = (): number | null => {
    const idx = PUZZLES.findIndex(p => p.id === puzzleId);
    if (idx >= 0 && idx < PUZZLES.length - 1) return PUZZLES[idx + 1].id;
    return null;
  };

  const getPrevPuzzle = (): number | null => {
    const idx = PUZZLES.findIndex(p => p.id === puzzleId);
    if (idx > 0) return PUZZLES[idx - 1].id;
    return null;
  };

  const getLastMove = (): Move | null => {
    if (!gameState || gameState.moveHistory.length === 0) return null;
    return gameState.moveHistory[gameState.moveHistory.length - 1];
  };

  const getCheckSquare = (): Position | null => {
    if (!gameState?.isCheck) return null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.type === 'K' && piece.color === gameState.turn) {
          return { row, col };
        }
      }
    }
    return null;
  };

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-bright mb-4">Puzzle not found</h2>
          <button onClick={() => navigate('/puzzles')} className="px-6 py-2 bg-primary text-white rounded-lg">
            Back to Puzzles
          </button>
        </div>
      </div>
    );
  }

  const hintMove = puzzle.solution[currentSolutionStep];
  const hintSquare = showHint ? hintMove?.from : null;
  const nextPuzzle = getNextPuzzle();
  const prevPuzzle = getPrevPuzzle();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-surface-alt border-b border-surface-hover">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PieceSVG type="K" color="white" size={32} />
            <h1 className="text-lg font-bold text-text-bright tracking-tight">Makruk</h1>
          </button>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => navigate('/puzzles')}
              className="text-text-dim hover:text-text-bright transition-colors"
            >
              All Puzzles
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 w-full max-w-[1100px]">
          <div className="flex flex-col items-center gap-3 w-full lg:flex-1 lg:max-w-[calc(100vh-140px)] max-w-[720px]">
            {gameState && (
              <Board
                board={gameState.board}
                playerColor={puzzle.toMove}
                isMyTurn={status === 'playing'}
                legalMoves={legalMoves}
                selectedSquare={selectedSquare || hintSquare}
                lastMove={getLastMove()}
                isCheck={gameState.isCheck}
                checkSquare={getCheckSquare()}
                onSquareClick={handleSquareClick}
                onPieceDrop={handlePieceDrop}
                disabled={status !== 'playing'}
              />
            )}
          </div>

          <div className="flex flex-col gap-3 lg:w-80 w-full max-w-[720px]">
            <div className="bg-surface-alt border border-surface-hover rounded-xl p-5">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-lg font-bold text-text-bright">
                  #{puzzle.id} · {puzzle.title}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded border ${
                  puzzle.difficulty === 'beginner' ? 'bg-green-400/10 border-green-400/30 text-green-400' :
                  puzzle.difficulty === 'intermediate' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' :
                  'bg-red-400/10 border-red-400/30 text-red-400'
                }`}>
                  {puzzle.difficulty}
                </span>
              </div>
              <p className="text-text-dim text-sm mb-3">{puzzle.description}</p>
              <div className="flex items-center gap-2 text-xs text-text-dim">
                <span className="px-2 py-0.5 rounded bg-surface border border-surface-hover">{puzzle.theme}</span>
                <span>{puzzle.toMove === 'white' ? 'White' : 'Black'} to move</span>
              </div>
            </div>

            {status === 'playing' && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 text-center">
                <p className="text-primary-light font-semibold text-sm">
                  Find the best move for {puzzle.toMove}!
                </p>
                <p className="text-text-dim text-xs mt-1">
                  Step {currentSolutionStep + 1} of {puzzle.solution.length}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-primary/20 border border-primary/30 rounded-lg px-4 py-4 text-center animate-slideUp">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-primary-light font-bold text-lg">Correct!</p>
                <p className="text-text-dim text-sm">
                  {hintUsed ? 'Solved with hint' : 'Solved without hints!'}
                </p>
              </div>
            )}

            {status === 'failed' && (
              <div className="bg-danger/20 border border-danger/30 rounded-lg px-4 py-4 text-center animate-slideUp">
                <div className="text-3xl mb-2">✗</div>
                <p className="text-danger font-bold text-lg">Not quite!</p>
                <p className="text-text-dim text-sm">That wasn't the best move. Try again!</p>
              </div>
            )}

            <div className="flex gap-2">
              {status === 'playing' && (
                <button
                  onClick={handleHint}
                  disabled={showHint}
                  className="flex-1 py-2 px-3 bg-accent/20 hover:bg-accent/30 text-accent text-sm rounded-lg border border-accent/30 transition-colors disabled:opacity-50"
                >
                  💡 Hint
                </button>
              )}
              {status !== 'playing' && (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2 px-3 bg-surface-alt hover:bg-surface-hover text-text-bright text-sm rounded-lg border border-surface-hover transition-colors"
                >
                  ↺ Retry
                </button>
              )}
              {status === 'success' && nextPuzzle && (
                <button
                  onClick={() => navigate(`/puzzle/${nextPuzzle}`)}
                  className="flex-1 py-2 px-3 bg-primary hover:bg-primary-light text-white text-sm rounded-lg transition-colors font-semibold"
                >
                  Next Puzzle →
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {prevPuzzle && (
                <button
                  onClick={() => navigate(`/puzzle/${prevPuzzle}`)}
                  className="flex-1 py-2 px-3 bg-surface-alt hover:bg-surface-hover text-text text-sm rounded-lg border border-surface-hover transition-colors"
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={() => navigate('/puzzles')}
                className="flex-1 py-2 px-3 bg-surface-alt hover:bg-surface-hover text-text text-sm rounded-lg border border-surface-hover transition-colors"
              >
                All Puzzles
              </button>
              {nextPuzzle && status !== 'success' && (
                <button
                  onClick={() => navigate(`/puzzle/${nextPuzzle}`)}
                  className="flex-1 py-2 px-3 bg-surface-alt hover:bg-surface-hover text-text text-sm rounded-lg border border-surface-hover transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export { PuzzleListPage, PuzzlePlayer };
export default PuzzleListPage;
