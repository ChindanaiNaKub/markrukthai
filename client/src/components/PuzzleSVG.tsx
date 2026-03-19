import { memo } from 'react';

interface PuzzleSVGProps {

  size?: number;

  className?: string;

}

const PuzzleSVG = memo(function PuzzleSVG({ size = 80, className }: PuzzleSVGProps) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 80 80"

      className={className}

      xmlns="http://www.w3.org/2000/svg"

    >

      <path d="M10 20 L30 20 L30 10 L40 10 L40 20 L60 20 L60 40 L50 40 L50 30 L40 30 L40 40 L30 40 L30 50 L20 50 L20 40 L10 40 Z" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />

    </svg>

  );

});

export default PuzzleSVG;