import PieceSVG from './PieceSVG';
import type { PieceType, PieceColor } from '@shared/types';

interface PieceGuideProps {
  show: boolean;
  onClose: () => void;
}

const PIECES: { type: PieceType; name: string; thai: string; movement: string }[] = [
  { type: 'K', name: 'Khun (King)', thai: 'ขุน', movement: '1 square in any direction' },
  { type: 'M', name: 'Met (Queen)', thai: 'เม็ด', movement: '1 square diagonally only' },
  { type: 'S', name: 'Khon (Bishop)', thai: 'โคน', movement: '1 square diagonally or 1 forward' },
  { type: 'R', name: 'Rua (Rook)', thai: 'เรือ', movement: 'Any distance horizontally or vertically' },
  { type: 'N', name: 'Ma (Knight)', thai: 'ม้า', movement: 'L-shape: 2+1 squares' },
  { type: 'P', name: 'Bia (Pawn)', thai: 'เบี้ย', movement: '1 forward; captures diagonally' },
  { type: 'PM', name: 'Bia Ngai (Promoted)', thai: 'เบี้ยหงาย', movement: 'Same as Met (1 diagonal)' },
];

export default function PieceGuide({ show, onClose }: PieceGuideProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-surface-alt border border-surface-hover rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-bright">Piece Guide</h2>
          <button onClick={onClose} className="text-text-dim hover:text-text-bright text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-3">
          {PIECES.map(({ type, name, thai, movement }) => (
            <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors">
              <div className="flex gap-1 flex-shrink-0">
                <PieceSVG type={type} color="white" size={40} />
                <PieceSVG type={type} color="black" size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-text-bright font-semibold text-sm">{name}</span>
                  <span className="text-text-dim text-xs">{thai}</span>
                </div>
                <p className="text-text-dim text-xs mt-0.5">{movement}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
