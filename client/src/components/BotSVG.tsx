import { memo } from 'react';

interface BotSVGProps {

  size?: number;

  className?: string;

}

const BotSVG = memo(function BotSVG({ size = 80, className }: BotSVGProps) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 80 80"

      className={className}

      xmlns="http://www.w3.org/2000/svg"

    >

      <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">

        <rect x="25" y="20" width="30" height="25" rx="5" />

        <circle cx="32" cy="30" r="3" fill="currentColor" />

        <circle cx="48" cy="30" r="3" fill="currentColor" />

        <rect x="35" y="40" width="10" height="3" rx="1" fill="currentColor" />

        <rect x="30" y="45" width="20" height="20" rx="3" />

        <line x1="25" y1="50" x2="20" y2="55" />

        <line x1="55" y1="50" x2="60" y2="55" />

        <line x1="35" y1="65" x2="35" y2="75" />

        <line x1="45" y1="65" x2="45" y2="75" />

      </g>

    </svg>

  );

});

export default BotSVG;