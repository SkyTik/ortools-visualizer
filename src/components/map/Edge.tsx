import type { Location } from '@/types';

interface EdgeProps {
  from: Location;
  to: Location;
  isHighlighted: boolean;
  edgeNumber: number;
  isFinal?: boolean;
  totalEdges?: number;
}

export function Edge({ from, to, isHighlighted, edgeNumber, isFinal }: EdgeProps) {
  return (
    <g>
      {/* Glow effect for highlighted edge */}
      {isHighlighted && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="var(--color-edge-highlight)"
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.3}
          className="animate-pulse"
        />
      )}

      {/* Final step: Green glowing stroke */}
      {isFinal && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#10b981"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.4}
          className="animate-pulse"
        />
      )}

      {/* Directional arrow - only show on final step */}
      {isFinal && (
        <Arrow from={from} to={to} isHighlighted={isHighlighted} isFinal={isFinal} />
      )}

      {/* Edge order label */}
      <EdgeOrderLabel
        from={from}
        to={to}
        edgeNumber={edgeNumber}
        isHighlighted={isHighlighted}
        isFinal={isFinal}
      />
    </g>
  );
}

interface ArrowProps {
  from: Location;
  to: Location;
  isHighlighted: boolean;
  isFinal?: boolean;
}

function Arrow({ from, to, isHighlighted, isFinal }: ArrowProps) {
  // Calculate arrow position (80% along the line)
  const t = 0.75;
  const midX = from.x + (to.x - from.x) * t;
  const midY = from.y + (to.y - from.y) * t;

  // Calculate angle
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  const arrowSize = isHighlighted || isFinal ? 10 : 8;
  const fillColor = isFinal
    ? '#10b981'
    : isHighlighted
      ? 'var(--color-edge-highlight)'
      : 'var(--color-edge)';

  return (
    <polygon
      points={`0,${-arrowSize / 2} ${arrowSize},0 0,${arrowSize / 2}`}
      fill={fillColor}
      transform={`translate(${midX}, ${midY}) rotate(${angle})`}
      className="transition-all duration-300"
    />
  );
}

interface EdgeOrderLabelProps {
  from: Location;
  to: Location;
  edgeNumber: number;
  isHighlighted: boolean;
  isFinal?: boolean;
}

function EdgeOrderLabel({ from, to, edgeNumber, isHighlighted, isFinal }: EdgeOrderLabelProps) {
  // Position label at 30% along edge (before the midpoint distance label)
  const t = 0.3;
  const midX = from.x + (to.x - from.x) * t;
  const midY = from.y + (to.y - from.y) * t;

  // Offset label perpendicular to edge to avoid line overlap
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const offsetDistance = 14;
  const offsetX = midX - Math.sin(angle) * offsetDistance;
  const offsetY = midY + Math.cos(angle) * offsetDistance;

  const circleRadius = isHighlighted || isFinal ? 12 : 10;
  const fontSize = isHighlighted || isFinal ? 11 : 10;
  const bgColor = isFinal
    ? '#10b981'
    : isHighlighted
      ? 'var(--color-edge-highlight)'
      : '#475569';

  return (
    <g className="transition-all duration-300">
      {/* Background circle */}
      <circle
        cx={offsetX}
        cy={offsetY}
        r={circleRadius}
        fill={bgColor}
        opacity={0.95}
      />
      {/* Order number */}
      <text
        x={offsetX}
        y={offsetY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={fontSize}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {edgeNumber}
      </text>
    </g>
  );
}
