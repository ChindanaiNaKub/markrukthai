import { useId } from 'react';
import type { PieceType, PieceColor } from '@shared/types';

interface PieceSVGProps {
  type: PieceType;
  color: PieceColor;
  size?: number;
  className?: string;
}

export default function PieceSVG({ type, color, size, className }: PieceSVGProps) {
  const uid = useId().replace(/:/g, '');
  const ids = {
    body: `${uid}-body`,
    ring: `${uid}-ring`,
    mark: `${uid}-mark`,
  };

  const palette = color === 'white'
    ? {
        bodyTop: '#f8f8f8',
        bodyMid: '#ececec',
        bodyBottom: '#d5d5d5',
        rim: '#8f949a',
        ring: '#ffffff',
        mark: '#2f3742',
        glow: 'rgba(255,255,255,0.65)',
        shadow: 'rgba(18, 12, 8, 0.30)',
      }
    : {
        bodyTop: '#50555d',
        bodyMid: '#2f343c',
        bodyBottom: '#1f2329',
        rim: '#7a8087',
        ring: '#a2a8b0',
        mark: '#e9edf2',
        glow: 'rgba(255,255,255,0.16)',
        shadow: 'rgba(6, 4, 3, 0.42)',
      };

  const markStroke = 2.8;

  const baseCircle = (
    <>
      <defs>
        <linearGradient id={ids.body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.bodyTop} />
          <stop offset="56%" stopColor={palette.bodyMid} />
          <stop offset="100%" stopColor={palette.bodyBottom} />
        </linearGradient>
        <linearGradient id={ids.ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.ring} stopOpacity="0.95" />
          <stop offset="100%" stopColor={palette.ring} stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={ids.mark} cx="0.3" cy="0.2" r="1.1">
          <stop offset="0%" stopColor={palette.mark} stopOpacity="1" />
          <stop offset="100%" stopColor={palette.mark} stopOpacity="0.88" />
        </radialGradient>
      </defs>

      <ellipse cx="40" cy="44" rx="26" ry="22" fill={palette.shadow} />
      <circle cx="40" cy="40" r="29" fill={`url(#${ids.body})`} stroke={palette.rim} strokeWidth="2.2" />
      <circle cx="40" cy="40" r="23.8" fill="none" stroke={`url(#${ids.ring})`} strokeWidth="1.2" />
      <path d="M21 28 Q40 14 59 28" stroke={palette.glow} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );

  const renderPiece = () => {
    switch (type) {
      case 'K': // Khun - King
        return (
          <g>
            {baseCircle}
            {/* Modern crown */}
            <path
              d="M27 47 L27 38 L32.5 41 L36.5 33.5 L40 39 L43.5 33.5 L47.5 41 L53 38 L53 47 Z"
              fill={`url(#${ids.mark})`}
              stroke={palette.mark}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <rect x="28.5" y="47" width="23" height="3" rx="1.5" fill={palette.mark} opacity="0.95" />
            <circle cx="40" cy="30" r="2.4" fill={palette.mark} />
          </g>
        );

      case 'M': // Met - Queen (moves 1 diag)
        return (
          <g>
            {baseCircle}
            {/* Geometric jewel */}
            <path
              d="M40 27 L51 40 L40 53 L29 40 Z"
              fill="none"
              stroke={palette.mark}
              strokeWidth={markStroke}
              strokeLinejoin="round"
            />
            <path
              d="M40 33 L45.8 40 L40 47 L34.2 40 Z"
              fill={palette.mark}
              opacity="0.3"
            />
            <circle cx="40" cy="40" r="2" fill={palette.mark} />
          </g>
        );

      case 'PM': // Promoted Pawn (Bia Ngai) - same as Met but with marker
        return (
          <g>
            {baseCircle}
            <path
              d="M40 27 L51 40 L40 53 L29 40 Z"
              fill="none"
              stroke={palette.mark}
              strokeWidth={markStroke}
              strokeLinejoin="round"
            />
            <path
              d="M40 33 L45.8 40 L40 47 L34.2 40 Z"
              fill={palette.mark}
              opacity="0.3"
            />
            <circle cx="40" cy="40" r="2" fill={palette.mark} />
            {/* Promotion marker */}
            <circle cx="40" cy="23.8" r="2.1" fill={color === 'white' ? '#2e8a3e' : '#8ed79b'} />
          </g>
        );

      case 'S': // Khon - Bishop/Silver General
        return (
          <g>
            {baseCircle}
            {/* Minimal spire */}
            <path
              d="M40 27 L47.6 44 L44 49 L36 49 L32.4 44 Z"
              fill="none"
              stroke={palette.mark}
              strokeWidth={markStroke}
              strokeLinejoin="round"
            />
            <path
              d="M40 32.5 L44.8 44 L35.2 44 Z"
              fill={palette.mark}
              opacity="0.3"
            />
            <line x1="32.6" y1="44" x2="47.4" y2="44" stroke={palette.mark} strokeWidth="1.6" />
          </g>
        );

      case 'R': // Rua - Rook
        return (
          <g>
            {baseCircle}
            {/* Tower glyph */}
            <rect x="31" y="36" width="18" height="13.8" rx="1.3" fill="none" stroke={palette.mark} strokeWidth={markStroke} />
            <rect x="31" y="31.2" width="4.2" height="6" rx="0.8" fill={palette.mark} />
            <rect x="37.9" y="31.2" width="4.2" height="6" rx="0.8" fill={palette.mark} />
            <rect x="44.8" y="31.2" width="4.2" height="6" rx="0.8" fill={palette.mark} />
            <line x1="33.5" y1="43" x2="46.5" y2="43" stroke={palette.mark} strokeWidth="1.3" opacity="0.8" />
          </g>
        );

      case 'N': // Ma - Knight
        return (
          <g>
            {baseCircle}
            {/* Stylized horse head */}
            <path
              d="M34 50 L34 39.8 L36.7 35.8 L34.5 31.8 L38.7 28.2 L43 30.5 L45.5 28.8 L45.2 33.2 L48.6 36.1 L46.8 42.1 L46.8 50"
              fill="none"
              stroke={palette.mark}
              strokeWidth={markStroke}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx="39.5" cy="33.2" r="1.45" fill={palette.mark} />
          </g>
        );

      case 'P': // Bia - Pawn
        return (
          <g>
            {baseCircle}
            {/* Modern seed glyph */}
            <ellipse cx="40" cy="40" rx="8" ry="10" fill="none" stroke={palette.mark} strokeWidth={markStroke} />
            <line x1="40" y1="30.2" x2="40" y2="49.8" stroke={palette.mark} strokeWidth="1.6" />
            <path
              d="M36 34.1 Q40 37 44 34.1"
              fill="none"
              stroke={palette.mark}
              strokeWidth="1"
            />
            <path
              d="M36 45.9 Q40 43 44 45.9"
              fill="none"
              stroke={palette.mark}
              strokeWidth="1"
            />
          </g>
        );

      default:
        return baseCircle;
    }
  };

  return (
    <svg
      viewBox="0 0 80 80"
      {...(className
        ? { className }
        : { width: size ?? 80, height: size ?? 80 }
      )}
      xmlns="http://www.w3.org/2000/svg"
    >
      {renderPiece()}
    </svg>
  );
}
