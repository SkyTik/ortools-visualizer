import type { Location } from '@/types';

interface NodeProps {
  location: Location;
  isCurrent: boolean;
  isVisited: boolean;
}

export function Node({ location, isCurrent, isVisited }: NodeProps) {
  const { x, y, label, isDepot } = location;

  // Node sizing
  const radius = isDepot ? 18 : 14;
  const fontSize = isDepot ? 10 : 11;

  // Color logic
  let fillColor: string;
  let strokeColor: string;
  let textColor: string;

  if (isDepot) {
    fillColor = 'var(--color-depot)';
    strokeColor = '#b45309';
    textColor = '#1f2937';
  } else if (isCurrent) {
    fillColor = 'var(--color-node-current)';
    strokeColor = '#166534';
    textColor = 'white';
  } else if (isVisited) {
    fillColor = 'var(--color-node)';
    strokeColor = '#1d4ed8';
    textColor = 'white';
  } else {
    fillColor = '#e5e7eb';
    strokeColor = '#9ca3af';
    textColor = '#374151';
  }

  return (
    <g className="transition-all duration-300">
      {/* Glow effect for current node */}
      {isCurrent && !isDepot && (
        <circle
          cx={x}
          cy={y}
          r={radius + 6}
          fill="none"
          stroke="var(--color-node-current)"
          strokeWidth={2}
          opacity={0.4}
          className="animate-pulse"
        />
      )}

      {/* Main circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isDepot ? 3 : 2}
        className="transition-all duration-300"
      />

      {/* Depot star icon */}
      {isDepot && (
        <text
          x={x}
          y={y - 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fill={textColor}
        >
          ★
        </text>
      )}

      {/* Label */}
      <text
        x={x}
        y={isDepot ? y + 32 : y + radius + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        fontWeight={isDepot || isCurrent ? 600 : 500}
        fill={isDepot ? '#b45309' : isCurrent ? 'var(--color-node-current)' : '#374151'}
        className="select-none"
      >
        {label}
      </text>
    </g>
  );
}
