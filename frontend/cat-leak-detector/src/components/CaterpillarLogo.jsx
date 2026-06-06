import React from 'react';

export default function CaterpillarLogo({ className = "h-8" }) {
  return (
    <div className={`relative flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 230 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto h-full"
      >
        {/* Yellow Triangle for the first letter 'A' of CATERPILLAR */}
        <polygon
          points="23,35 33,18 43,35"
          fill="#FFCD11"
        />
        {/* The text 'CATERPILLAR' */}
        <text
          x="2"
          y="31"
          fill="currentColor"
          fontFamily="'Montserrat', 'Outfit', sans-serif"
          fontWeight="900"
          fontSize="24"
          letterSpacing="-0.5px"
        >
          CATERPILLAR
        </text>
      </svg>
    </div>
  );
}
