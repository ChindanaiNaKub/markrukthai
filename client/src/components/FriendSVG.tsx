import { memo } from 'react';

interface FriendSVGProps {

  size?: number;

  className?: string;

}

const FriendSVG = memo(function FriendSVG({ size = 80, className }: FriendSVGProps) {

  return (

    <svg

      width={size}

      height={size}

      viewBox="0 0 80 80"

      className={className}

      xmlns="http://www.w3.org/2000/svg"

    >

      <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">

        <path d="M20 40 Q20 30 30 30 Q40 30 40 40 Q40 50 30 50 Q20 50 20 40" />

        <path d="M40 40 Q40 30 50 30 Q60 30 60 40 Q60 50 50 50 Q40 50 40 40" />

        <line x1="30" y1="40" x2="50" y2="40" />

      </g>

      <path d="M40 20 Q50 25 50 35 Q50 45 40 50 Q30 45 30 35 Q30 25 40 20" fill="currentColor" opacity="0.2" />

    </svg>

  );

});

export default FriendSVG;