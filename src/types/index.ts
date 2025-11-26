export interface Location {
  /** Node ID (0 = depot) */
  id: number;
  /** X coordinate in canvas space */
  x: number;
  /** Y coordinate in canvas space */
  y: number;
  /** Display label */
  label: string;
  /** True only for depot (node 0), undefined for customer nodes */
  isDepot?: boolean;
}

export interface Candidate {
  node: number;
  distance: number;
  selected: boolean;
}

export interface Edge {
  from: number;
  to: number;
}

export interface Step {
  /** Step number in sequence */
  step: number;
  /** All edges drawn so far */
  edges: Edge[];
  /** Current node being processed */
  currentNode: number;
  /** Present when showing specific edge being added */
  highlightEdge?: Edge;
  /** Present for strategies that evaluate multiple candidate nodes */
  candidates?: Candidate[];
  /** Human-readable explanation of this step */
  explanation: string;
  /** Cumulative distance so far */
  totalDistance: number;
  /** True only for final summary step */
  isFinal?: boolean;
}

export interface Solution {
  strategy: string;
  locationCount: number;
  steps: Step[];
  finalRoute: number[];
  finalDistance: number;
}

export interface Strategy {
  /** Unique strategy identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description of the algorithm */
  shortDesc: string;
  /** Pseudocode for algorithm visualization */
  pseudocode: string;
  /** Optional link to Wikipedia article */
  wikipediaUrl?: string;
  /** Optional warning message for not-recommended strategies */
  warning?: string;
}

export type StrategyId =
  | 'PATH_CHEAPEST_ARC'
  | 'GLOBAL_CHEAPEST_ARC'
  | 'LOCAL_CHEAPEST_INSERTION'
  | 'SAVINGS'
  | 'CHRISTOFIDES'
  | 'FIRST_UNBOUND_MIN_VALUE'
  | 'SWEEP';
