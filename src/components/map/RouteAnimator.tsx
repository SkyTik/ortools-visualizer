import type { Location, Edge as EdgeType } from '@/types';

interface RouteAnimatorProps {
  edges: EdgeType[];
  locations: Location[];
}

export function RouteAnimator({ edges, locations }: RouteAnimatorProps) {
  if (edges.length === 0) return null;

  // Find depot (id = 0)
  const depot = locations.find((loc) => loc.id === 0);
  if (!depot) return null;

  // Build the complete path coordinates, always starting from depot
  const pathPoints: { x: number; y: number }[] = [{ x: depot.x, y: depot.y }];

  // Follow the edges in order
  for (const edge of edges) {
    const toLoc = locations.find((loc) => loc.id === edge.to);
    if (toLoc) {
      pathPoints.push({ x: toLoc.x, y: toLoc.y });
    }
  }

  if (pathPoints.length < 2) return null;

  // Create SVG path for the route
  const pathD = pathPoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  // Calculate total path length for animation timing
  let totalLength = 0;
  for (let i = 1; i < pathPoints.length; i++) {
    const dx = pathPoints[i].x - pathPoints[i - 1].x;
    const dy = pathPoints[i].y - pathPoints[i - 1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }

  // Animation duration based on path length (adjust speed as needed)
  const animationDuration = Math.max(3, totalLength / 150);

  return (
    <g className="route-animator">
      {/* Hidden path for motion reference */}
      <defs>
        <path id="route-motion-path" d={pathD} fill="none" />
      </defs>

      {/* Moving dot with glow */}
      <g>
        {/* Outer glow */}
        <circle r="14" fill="#10b981" opacity="0.2">
          <animateMotion
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>

        {/* Middle glow */}
        <circle r="10" fill="#10b981" opacity="0.4">
          <animateMotion
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>

        {/* Inner dot */}
        <circle r="6" fill="#10b981">
          <animateMotion
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>

        {/* Bright center */}
        <circle r="3" fill="#34d399">
          <animateMotion
            dur={`${animationDuration}s`}
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>
      </g>
    </g>
  );
}
