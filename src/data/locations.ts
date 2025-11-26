import type { Location } from '../types';

/** Canvas width for location coordinates */
export const CANVAS_WIDTH = 500;

/** Canvas height for location coordinates */
export const CANVAS_HEIGHT = 500;

/**
 * Fixed locations for TSP demo
 * - Depot at center (id: 0)
 * - 9 customer locations (id: 1-9)
 * - Coordinates in 500x500 canvas space
 */
export const locations: Location[] = [
  { id: 0, x: 250, y: 250, label: 'Depot', isDepot: true },
  { id: 1, x: 100, y: 100, label: 'A' },
  { id: 2, x: 400, y: 80, label: 'B' },
  { id: 3, x: 450, y: 300, label: 'C' },
  { id: 4, x: 380, y: 450, label: 'D' },
  { id: 5, x: 150, y: 420, label: 'E' },
  { id: 6, x: 80, y: 280, label: 'F' },
  { id: 7, x: 200, y: 180, label: 'G' },
  { id: 8, x: 320, y: 200, label: 'H' },
  { id: 9, x: 280, y: 380, label: 'I' },
];

/**
 * Calculate Euclidean distance between two locations
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

/**
 * Get subset of locations based on count (always includes depot)
 * @param count - Number of locations (5-10)
 */
export function getLocations(count: number): Location[] {
  if (count < 5 || count > 10) {
    throw new Error('Location count must be between 5 and 10');
  }
  return locations.slice(0, count);
}

/**
 * Generate distance matrix for given locations
 */
export function generateDistanceMatrix(locs: Location[]): number[][] {
  const n = locs.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      matrix[i][j] = calculateDistance(locs[i], locs[j]);
    }
  }

  return matrix;
}
