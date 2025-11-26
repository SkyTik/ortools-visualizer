import type { Location } from '@/types';
import { calculateDistance } from '@/data/locations';

interface PotentialEdgeProps {
  from: Location;
  to: Location;
  isSelected: boolean;
}

export function PotentialEdge({ from, to, isSelected }: PotentialEdgeProps) {
  const distance = calculateDistance(from, to);

  // Position label at midpoint
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Offset label perpendicular to edge
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const offsetDistance = 10;
  const offsetX = midX - Math.sin(angle) * offsetDistance;
  const offsetY = midY + Math.cos(angle) * offsetDistance;

  // Style based on selection state
  const strokeColor = isSelected ? 'var(--color-edge)' : '#cbd5e1';
  const strokeWidth = isSelected ? 2.5 : 1;
  const opacity = isSelected ? 0.9 : 0.4;
  const textColor = isSelected ? 'var(--color-edge)' : '#94a3b8';
  const fontWeight = isSelected ? '600' : 'normal';

  return (
    <g className="potential-edge transition-all duration-300">
      {/* Line - solid when selected, dashed when not */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isSelected ? 'none' : '4 4'}
        opacity={opacity}
        className="transition-all duration-300"
      />

      {/* Distance label */}
      <text
        x={offsetX}
        y={offsetY}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={9}
        fontWeight={fontWeight}
        opacity={isSelected ? 1 : 0.7}
        style={{ pointerEvents: 'none' }}
        className="transition-all duration-300"
      >
        {distance}
      </text>
    </g>
  );
}
