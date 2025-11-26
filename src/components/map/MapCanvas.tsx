import { useMemo } from 'react';
import { Node } from './Node';
import { Edge } from './Edge';
import { PotentialEdge } from './PotentialEdge';
import { RouteAnimator } from './RouteAnimator';
import { MapPin } from 'lucide-react';
import type { Location, Edge as EdgeType, Step } from '@/types';

interface MapCanvasProps {
  locations: Location[];
  currentStep: Step | null;
}

export function MapCanvas({ locations, currentStep }: MapCanvasProps) {
  const visitedNodes = new Set<number>();
  if (currentStep) {
    visitedNodes.add(0);
    currentStep.edges.forEach((edge) => {
      visitedNodes.add(edge.from);
      visitedNodes.add(edge.to);
    });
  }

  const isHighlightedEdge = (edge: EdgeType) => {
    if (!currentStep?.highlightEdge) return false;
    return (
      edge.from === currentStep.highlightEdge.from &&
      edge.to === currentStep.highlightEdge.to
    );
  };

  const getLocation = (id: number): Location | undefined => {
    return locations.find((loc) => loc.id === id);
  };

  const allPotentialEdges = useMemo(() => {
    const edges: Array<{ from: Location; to: Location }> = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        edges.push({ from: locations[i], to: locations[j] });
      }
    }
    return edges;
  }, [locations]);

  const isEdgeSelected = (fromId: number, toId: number): boolean => {
    if (!currentStep) return false;
    return currentStep.edges.some(
      (e) =>
        (e.from === fromId && e.to === toId) ||
        (e.from === toId && e.to === fromId)
    );
  };

  return (
    <div className="h-full bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-slate-800">Route Visualization</h2>
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded">
          <MapPin className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-medium text-slate-600">{locations.length} nodes</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 p-2 min-h-0">
        <div className="h-full bg-slate-50 rounded-lg border border-slate-200">
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="500" height="500" fill="url(#grid)" />

            <g className="potential-edges">
              {allPotentialEdges.map(({ from, to }) => (
                <PotentialEdge
                  key={`potential-${from.id}-${to.id}`}
                  from={from}
                  to={to}
                  isSelected={isEdgeSelected(from.id, to.id)}
                />
              ))}
            </g>

            <g className="edges">
              {currentStep?.edges.map((edge, index) => {
                const fromLoc = getLocation(edge.from);
                const toLoc = getLocation(edge.to);
                if (!fromLoc || !toLoc) return null;
                return (
                  <Edge
                    key={`${edge.from}-${edge.to}-${index}`}
                    from={fromLoc}
                    to={toLoc}
                    isHighlighted={isHighlightedEdge(edge)}
                    edgeNumber={index + 1}
                    isFinal={currentStep?.isFinal}
                    totalEdges={currentStep?.edges.length}
                  />
                );
              })}
            </g>

            <g className="nodes">
              {locations.map((location) => (
                <Node
                  key={location.id}
                  location={location}
                  isCurrent={currentStep?.currentNode === location.id}
                  isVisited={visitedNodes.has(location.id)}
                />
              ))}
            </g>

            {currentStep?.isFinal && currentStep.edges.length > 0 && (
              <RouteAnimator
                key={`route-final-${currentStep.step}-${locations.length}`}
                edges={currentStep.edges}
                locations={locations}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 px-3 py-1.5 border-t border-slate-100 flex gap-3 justify-center">
        <LegendItem color="var(--color-depot)" label="Depot" />
        <LegendItem color="var(--color-node)" label="Visited" />
        <LegendItem color="var(--color-node-current)" label="Current" />
        <LegendItem color="#e5e7eb" label="Unvisited" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
