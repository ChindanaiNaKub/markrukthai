import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Position, PieceColor, Move, GameState } from '@shared/types';
import { getLegalMoves, makeMove, createInitialGameState, createInitialBoard } from '@shared/engine';
import { getBotMove, BotDifficulty } from '@shared/botEngine';
import { playMoveSound, playCaptureSound, playCheckSound, playGameOverSound } from '../lib/sounds';
import Board from './Board';
import MoveHistory from './MoveHistory';
import GameOverModal from './GameOverModal';
import PieceSVG from './PieceSVG';

const DIFFICULTY_CONFIG: Record<BotDifficulty, { label: string; description: string; emoji: string }> = {
  easy: { label: 'Easy', description: 'Random moves with basic captures', emoji: '🟢' },
  medium: { label: 'Medium', description: 'Thinks 2 moves ahead', emoji: '🟡' },
  hard: { label: 'Hard', description: 'Thinks 4 moves ahead', emoji: '🔴' },
};

export default function BotGame() {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(0, 0));
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [gameOverInfo, setGameOverInfo] = useState<{ reason: string; winner: PieceColor | null } | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const botColor: PieceColor = playerColor === 'white' ? 'black' : 'white';
  const isPlayerTurn = gameState.turn === playerColor;

  useEffect(() => {
    if (!gameStarted || gameState.gameOver || isPlayerTurn) return;

    setBotThinking(true);
    const delay = difficulty === 'easy' ? 300 : difficulty === 'medium' ? 600 : 800;

    botTimeoutRef.current = setTimeout(() => {
      const botMoveResult = getBotMove(gameState, difficulty);
      if (botMoveResult) {
        const newState = makeMove(gameState, botMoveResult.from, botMoveResult.to);
        if (newState) {
          setGameState(newState);

          const lastMove = newState.moveHistory[newState.moveHistory.length - 1];
          if (newState.isCheck) playCheckSound();
          else if (lastMove.captured) playCaptureSound();
          else playMoveSound();

          if (newState.gameOver) {
            const reason = newState.isCheckmate ? 'checkmate' : newState.isStalemate ? 'stalemate' : 'draw';
            setGameOverInfo({ reason, winner: newState.winner });
            playGameOverSound();
          }
        }
      }
      setBotThinking(false);
    }, delay);

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, [gameState, gameStarted, isPlayerTurn, difficulty]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameState.gameOver || !isPlayerTurn || botThinking) return;

    const piece = gameState.board[pos.row][pos.col];

    if (selectedSquare) {
      const isLegal = legalMoves.some(m => m.row === pos.row && m.col === pos.col);
      if (isLegal) {
        const newState = makeMove(gameState, selectedSquare, pos);
        if (newState) {
          setGameState(newState);
          setSelectedSquare(null);
          setLegalMoves([]);

          const lastMove = newState.moveHistory[newState.moveHistory.length - 1];
          if (newState.isCheck) playCheckSound();
          else if (lastMove.captured) playCaptureSound();
          else playMoveSound();

          if (newState.gameOver) {
            const reason = newState.isCheckmate ? 'checkmate' : newState.isStalemate ? 'stalemate' : 'draw';
            setGameOverInfo({ reason, winner: newState.winner });
            playGameOverSound();
          }
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
  }, [gameState, selectedSquare, legalMoves, isPlayerTurn, botThinking, playerColor]);

  const handlePieceDrop = useCallback((from: Position, to: Position) => {
    if (gameState.gameOver || !isPlayerTurn || botThinking) return;
    const piece = gameState.board[from.row][from.col];
    if (!piece || piece.color !== playerColor) return;

    const legal = getLegalMoves(gameState.board, from);
    if (legal.some(m => m.row === to.row && m.col === to.col)) {
      const newState = makeMove(gameState, from, to);
      if (newState) {
        setGameState(newState);
        setSelectedSquare(null);
        setLegalMoves([]);

        const lastMove = newState.moveHistory[newState.moveHistory.length - 1];
        if (newState.isCheck) playCheckSound();
        else if (lastMove.captured) playCaptureSound();
        else playMoveSound();

        if (newState.gameOver) {
          const reason = newState.isCheckmate ? 'checkmate' : newState.isStalemate ? 'stalemate' : 'draw';
          setGameOverInfo({ reason, winner: newState.winner });
          playGameOverSound();
        }
      }
    }
  }, [gameState, isPlayerTurn, botThinking, playerColor]);

  const handleStartGame = () => {
    setGameState(createInitialGameState(0, 0));
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameOverInfo(null);
    setBotThinking(false);
    setGameStarted(true);
  };

  const handleReset = () => {
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    setGameStarted(false);
    setGameState(createInitialGameState(0, 0));
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameOverInfo(null);
    setBotThinking(false);
  };

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      const newState = { ...gameState };
      newState.gameOver = true;
      newState.winner = botColor;
      setGameState(newState);
      setGameOverInfo({ reason: 'resignation', winner: botColor });
      playGameOverSound();
    }
  };

  const getLastMove = (): Move | null => {
    if (gameState.moveHistory.length === 0) return null;
    return gameState.moveHistory[gameState.moveHistory.length - 1];
  };

  const getCheckSquare = (): Position | null => {
    if (!gameState.isCheck) return null;
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

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <header className="bg-surface-alt border-b border-surface-hover">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <PieceSVG type="K" color="white" size={36} />
              <h1 className="text-xl font-bold text-text-bright tracking-tight">Makruk</h1>
            </button>
            <span className="text-text-dim text-sm">Play vs Bot</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="bg-surface-alt border border-surface-hover rounded-xl p-6 w-full max-w-lg animate-slideUp">
            <h2 className="text-2xl font-bold text-text-bright mb-6 text-center">Play vs Computer</h2>

            <div className="mb-6">
              <label className="text-sm text-text-dim mb-2 block">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(DIFFICULTY_CONFIG) as [BotDifficulty, typeof DIFFICULTY_CONFIG['easy']][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`py-3 px-3 rounded-lg text-sm font-medium transition-all ${
                      difficulty === key
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-surface hover:bg-surface-hover text-text border border-surface-hover'
                    }`}
                  >
                    <div className="text-lg mb-1">{config.emoji}</div>
                    <div className="font-bold">{config.label}</div>
                    <div className="text-xs opacity-70 mt-1">{config.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm text-text-dim mb-2 block">Play as</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPlayerColor('white')}
                  className={`py-3 px-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
                    playerColor === 'white'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-surface hover:bg-surface-hover text-text border border-surface-hover'
                  }`}
                >
                  <PieceSVG type="K" color="white" size={32} />
                  <span className="text-sm">White</span>
                </button>
                <button
                  onClick={() => setPlayerColor(Math.random() < 0.5 ? 'white' : 'black')}
                  className={`py-3 px-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 bg-surface hover:bg-surface-hover text-text border border-surface-hover`}
                >
                  <span className="text-2xl">🎲</span>
                  <span className="text-sm">Random</span>
                </button>
                <button
                  onClick={() => setPlayerColor('black')}
                  className={`py-3 px-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
                    playerColor === 'black'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-surface hover:bg-surface-hover text-text border border-surface-hover'
                  }`}
                >
                  <PieceSVG type="K" color="black" size={32} />
                  <span className="text-sm">Black</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3 px-6 bg-primary hover:bg-primary-light text-white font-bold rounded-lg text-lg transition-colors shadow-md"
            >
              Start Game
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-3 py-2 px-6 bg-surface hover:bg-surface-hover text-text border border-surface-hover font-medium rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-surface-alt border-b border-surface-hover">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PieceSVG type="K" color="white" size={32} />
            <h1 className="text-lg font-bold text-text-bright tracking-tight">Makruk</h1>
          </button>
          <div className="flex items-center gap-2 text-sm text-text-dim">
            <span>vs Bot ({DIFFICULTY_CONFIG[difficulty].label})</span>
            <span>{DIFFICULTY_CONFIG[difficulty].emoji}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 w-full max-w-[1100px]">
          <div className="flex flex-col items-center gap-3 w-full lg:flex-1 lg:max-w-[calc(100vh-140px)] max-w-[720px]">
            <div className={`rounded-lg px-4 py-2 text-center text-sm font-medium w-full max-w-xs ${
              botThinking
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-surface-alt text-text-dim border border-surface-hover'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <PieceSVG type="K" color={botColor} size={20} />
                <span>Bot ({DIFFICULTY_CONFIG[difficulty].label})</span>
                {botThinking && <span className="animate-pulse">thinking...</span>}
              </div>
            </div>

            <Board
              board={gameState.board}
              playerColor={playerColor}
              isMyTurn={isPlayerTurn && !botThinking}
              legalMoves={legalMoves}
              selectedSquare={selectedSquare}
              lastMove={getLastMove()}
              isCheck={gameState.isCheck}
              checkSquare={getCheckSquare()}
              onSquareClick={handleSquareClick}
              onPieceDrop={handlePieceDrop}
              disabled={gameState.gameOver || !isPlayerTurn || botThinking}
            />

            <div className={`rounded-lg px-4 py-2 text-center text-sm font-medium w-full max-w-xs ${
              isPlayerTurn && !gameState.gameOver
                ? 'bg-primary/20 text-primary-light border border-primary/30'
                : 'bg-surface-alt text-text-dim border border-surface-hover'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <PieceSVG type="K" color={playerColor} size={20} />
                <span>You ({playerColor})</span>
                {isPlayerTurn && !gameState.gameOver && <span>· Your turn</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:w-72 w-full max-w-[720px]">
            <div className={`
              rounded-lg px-4 py-3 text-center font-semibold text-sm
              ${gameState.gameOver
                ? gameState.winner === playerColor
                  ? 'bg-primary/20 text-primary-light border border-primary/30'
                  : gameState.winner
                    ? 'bg-danger/20 text-danger border border-danger/30'
                    : 'bg-accent/20 text-accent border border-accent/30'
                : isPlayerTurn
                  ? 'bg-primary/20 text-primary-light border border-primary/30'
                  : 'bg-surface-alt text-text-dim border border-surface-hover'
              }
            `}>
              {gameState.gameOver
                ? gameState.winner === playerColor ? 'You Won!' : gameState.winner ? 'Bot Wins' : 'Draw'
                : isPlayerTurn ? 'Your turn' : 'Bot is thinking...'
              }
            </div>

            <MoveHistory moves={gameState.moveHistory} initialBoard={createInitialBoard()} />

            {!gameState.gameOver && (
              <button
                onClick={handleResign}
                className="w-full py-2 px-4 bg-surface-alt hover:bg-danger/20 text-text hover:text-danger text-sm rounded-lg border border-surface-hover transition-colors"
              >
                ⚐ Resign
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-surface-alt hover:bg-surface-hover text-text-bright text-sm rounded-lg border border-surface-hover transition-colors"
            >
              ↺ New Game
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-light text-white text-sm rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>

      {gameOverInfo && (
        <GameOverModal
          winner={gameOverInfo.winner}
          reason={gameOverInfo.reason}
          playerColor={playerColor}
          onRematch={handleStartGame}
          onNewGame={handleReset}
        />
      )}
    </div>
  );
}
