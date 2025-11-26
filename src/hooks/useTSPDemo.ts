import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLocations } from '@/data/locations';
import { getStrategy, strategyOrder } from '@/data/strategies';
import type { Solution, Step, Location, Strategy } from '@/types';

interface UseTSPDemoReturn {
  // State
  locationCount: number;
  strategyId: string;
  stepIndex: number;

  // Derived data
  locations: Location[];
  strategy: Strategy;
  solution: Solution | null;
  currentStep: Step | null;
  totalSteps: number;
  finalDistance: number;

  // Navigation
  canGoBack: boolean;
  canGoNext: boolean;
  goBack: () => void;
  goNext: () => void;
  goToStep: (step: number) => void;
  reset: () => void;

  // Setters
  setLocationCount: (count: number) => void;
  setStrategyId: (id: string) => void;

  // Loading state
  isLoading: boolean;

  // Error state
  error: string | null;
  clearError: () => void;
}

/**
 * Module-level solution cache.
 * Persists for app lifetime (max 42 entries = ~500KB-2MB).
 * No cleanup needed for demo scope.
 */
const solutionCache = new Map<string, Solution>();

async function loadSolution(locationCount: number, strategyId: string): Promise<Solution> {
  const cacheKey = `${locationCount}-${strategyId}`;

  if (solutionCache.has(cacheKey)) {
    return solutionCache.get(cacheKey)!;
  }

  // Dynamic import of JSON file
  const strategyFile = strategyId.toLowerCase();
  const module = await import(`@/data/solutions/${locationCount}/${strategyFile}.json`);
  const solution = module.default as Solution;

  solutionCache.set(cacheKey, solution);
  return solution;
}

export function useTSPDemo(): UseTSPDemoReturn {
  // Core state - persist strategyId to localStorage
  const [locationCount, setLocationCount] = useState(5);
  const [strategyId, setStrategyIdState] = useState(() => {
    try {
      const saved = localStorage.getItem('tsp-strategy');
      return saved && strategyOrder.includes(saved) ? saved : strategyOrder[0];
    } catch {
      // localStorage may throw in private browsing mode
      return strategyOrder[0];
    }
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Persist strategy selection
  const setStrategyId = useCallback((id: string) => {
    setStrategyIdState(id);
    try {
      localStorage.setItem('tsp-strategy', id);
    } catch {
      // Ignore localStorage errors in private browsing
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Solution state
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derived data
  const locations = useMemo(() => getLocations(locationCount), [locationCount]);
  const strategy = useMemo(() => getStrategy(strategyId), [strategyId]);

  // Load solution when locationCount or strategyId changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const sol = await loadSolution(locationCount, strategyId);
        if (!cancelled) {
          setSolution(sol);
          setStepIndex(0); // Reset to first step
        }
      } catch (err) {
        console.error('Failed to load solution:', err);
        if (!cancelled) {
          setError(`Failed to load ${strategyId} for ${locationCount} locations`);
          setSolution(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [locationCount, strategyId]);

  // Current step
  const currentStep = useMemo(() => {
    if (!solution || stepIndex < 0 || stepIndex >= solution.steps.length) {
      return null;
    }
    return solution.steps[stepIndex];
  }, [solution, stepIndex]);

  // Navigation helpers
  const totalSteps = solution?.steps.length ?? 0;
  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < totalSteps - 1;
  const finalDistance = solution?.finalDistance ?? 0;

  // Navigation functions - optimized to avoid recreation on step changes
  const goBack = useCallback(() => {
    setStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((prev) => {
      const max = solution?.steps.length ?? 0;
      return prev < max - 1 ? prev + 1 : prev;
    });
  }, [solution]);

  const goToStep = useCallback(
    (step: number) => {
      const max = solution?.steps.length ?? 0;
      if (step >= 0 && step < max) {
        setStepIndex(step);
      }
    },
    [solution]
  );

  const reset = useCallback(() => {
    setStepIndex(0);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goBack();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goNext();
          break;
        case 'Home':
          event.preventDefault();
          reset();
          break;
        case 'End':
          event.preventDefault();
          goToStep(totalSteps - 1);
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goNext, reset, goToStep, totalSteps]);

  return {
    // State
    locationCount,
    strategyId,
    stepIndex,

    // Derived data
    locations,
    strategy,
    solution,
    currentStep,
    totalSteps,
    finalDistance,

    // Navigation
    canGoBack,
    canGoNext,
    goBack,
    goNext,
    goToStep,
    reset,

    // Setters
    setLocationCount,
    setStrategyId,

    // Loading
    isLoading,

    // Error
    error,
    clearError,
  };
}
