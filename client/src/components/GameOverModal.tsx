import type { PieceColor } from '@shared/types';

interface GameOverModalProps {
  winner: PieceColor | null;
  reason: string;
  playerColor: PieceColor | null;
  onRematch: () => void;
  onNewGame: () => void;
}

export default function GameOverModal({ winner, reason, playerColor, onRematch, onNewGame }: GameOverModalProps) {
  const isDraw = !winner;
  const isWinner = winner === playerColor;

  const getTitle = () => {
    if (isDraw) return 'Draw';
    if (isWinner) return 'You Win!';
    return 'You Lost';
  };

  const getReasonText = () => {
    switch (reason) {
      case 'checkmate': return isDraw ? '' : `by checkmate`;
      case 'resignation': return `by resignation`;
      case 'timeout': return `on time`;
      case 'stalemate': return 'by stalemate';
      case 'draw_agreement': return 'by mutual agreement';
      case 'insufficient_material': return 'by insufficient material';
      default: return reason;
    }
  };

  const getIcon = () => {
    if (isDraw) return '½';
    if (isWinner) return '🏆';
    return '✖';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-surface-alt border border-surface-hover rounded-xl p-8 max-w-sm w-full mx-4 animate-slideUp shadow-2xl">
        <div className="text-center">
          <div className="text-5xl mb-3">{getIcon()}</div>
          <h2 className={`text-2xl font-bold mb-1 ${
            isDraw ? 'text-accent' : isWinner ? 'text-primary-light' : 'text-danger'
          }`}>
            {getTitle()}
          </h2>
          <p className="text-text-dim text-sm mb-6">{getReasonText()}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onRematch}
              className="w-full py-3 px-6 bg-primary hover:bg-primary-light text-white font-semibold rounded-lg transition-colors"
            >
              Rematch
            </button>
            <button
              onClick={onNewGame}
              className="w-full py-3 px-6 bg-surface-hover hover:bg-surface-hover/80 text-text-bright font-semibold rounded-lg transition-colors border border-surface-hover"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
