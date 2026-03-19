import { memo } from 'react';

interface QuickPlaySVGProps {

  size?: number;

  className?: string;

}

const QuickPlaySVG = memo(function QuickPlaySVG({ size = 80, className }: QuickPlaySVGProps) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 80 80"

      className={className}

      xmlns="http://www.w3.org/2000/svg"

    >

      <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">

        <polygon points="20,15 60,40 20,65" />

      </g>

    </svg>

  );

});

export default QuickPlaySVG;