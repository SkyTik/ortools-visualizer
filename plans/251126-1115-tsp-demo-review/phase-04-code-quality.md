# Phase 4: Code Quality Improvements

**Priority:** LOW
**Status:** PENDING
**Estimated Effort:** 2-3 hours

---

## Context

Minor improvements for maintainability and documentation.

---

## Requirements

### 4.1 Optimize Navigation Callbacks
**File:** `src/hooks/useTSPDemo.ts:121-131`

**Problem:** goBack/goNext recreate on every step change due to canGoBack/canGoNext deps

**Fix:** Move boundary checks inside callbacks:
```typescript
const goBack = useCallback(() => {
  setStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
}, []);

const goNext = useCallback(() => {
  setStepIndex((prev) => {
    const max = solution?.steps.length ?? 0;
    return prev < max - 1 ? prev + 1 : prev;
  });
}, [solution]);
```

---

### 4.2 Add JSDoc to Optional Fields
**File:** `src/types/index.ts`

Add documentation explaining when optional fields are present:
```typescript
export interface Step {
  step: number;
  edges: Edge[];
  currentNode: number;
  /** Present when showing specific edge being added */
  highlightEdge?: Edge;
  /** Present for strategies evaluating multiple options */
  candidates?: Candidate[];
  explanation: string;
  totalDistance: number;
  /** True only for final summary step */
  isFinal?: boolean;
}
```

---

### 4.3 Extract Canvas Constants
**File:** `src/data/locations.ts`

```typescript
export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 500;

// Validate in dev mode
if (import.meta.env.DEV) {
  locations.forEach(loc => {
    if (loc.x < 0 || loc.x > CANVAS_WIDTH || loc.y < 0 || loc.y > CANVAS_HEIGHT) {
      console.warn(`Location ${loc.id} out of bounds`);
    }
  });
}
```

---

### 4.4 Add Input Validation to Python Script
**File:** `scripts/generate_solutions.py`

```python
def validate_inputs(location_count: int, strategy: str):
    if not isinstance(location_count, int):
        raise TypeError("location_count must be integer")
    if location_count < 5 or location_count > 10:
        raise ValueError(f"location_count must be 5-10, got {location_count}")
    if strategy not in STRATEGIES:
        raise ValueError(f"Unknown strategy: {strategy}")
```

---

### 4.5 Document Cache Behavior
**File:** `src/hooks/useTSPDemo.ts:37`

```typescript
/**
 * Module-level solution cache.
 * Persists for app lifetime (max 42 entries = ~500KB-2MB).
 * No cleanup needed for demo scope.
 */
const solutionCache = new Map<string, Solution>();
```

---

## Implementation Steps

- [ ] 1. Refactor goBack/goNext callbacks
- [ ] 2. Add JSDoc to types/index.ts
- [ ] 3. Extract canvas constants
- [ ] 4. Add Python input validation
- [ ] 5. Document cache behavior
- [ ] 6. Run type check and build

---

## Success Criteria

- [ ] Callbacks stable (don't recreate on step change)
- [ ] All optional fields documented
- [ ] Canvas dimensions extracted as constants
- [ ] Python script validates inputs
- [ ] Build passes

---

## Related Files

- `src/hooks/useTSPDemo.ts`
- `src/types/index.ts`
- `src/data/locations.ts`
- `scripts/generate_solutions.py`

---

## Risk Assessment

**Very low risk** - Refactoring and documentation. No functional changes.
