# Phase 3: Error Handling Improvements

**Priority:** MEDIUM
**Status:** PENDING
**Estimated Effort:** 1-2 hours

---

## Context

useTSPDemo hook has gaps in error handling that could cause poor UX in edge cases.

---

## Requirements

### 3.1 Add Error State to Hook
**File:** `src/hooks/useTSPDemo.ts`

**Problem:** Errors only logged to console. UI has no way to show "solution failed to load".

**Fix:**
```typescript
interface UseTSPDemoReturn {
  // existing...
  error: string | null;  // ADD
}

// In hook:
const [error, setError] = useState<string | null>(null);

// In loadSolution catch:
} catch (err) {
  console.error('Failed to load solution:', err);
  if (!cancelled) {
    setError(`Failed to load ${strategyId} for ${locationCount} locations`);
    setSolution(null);
  }
}

// Clear on new load:
setError(null);
```

---

### 3.2 Fix Stale Closure in Keyboard Handler
**File:** `src/hooks/useTSPDemo.ts:173,181`

**Problem:** End key uses `setStepIndex` directly but not in deps

**Fix:** Replace with `goToStep` call:
```typescript
case 'End':
  event.preventDefault();
  goToStep(totalSteps - 1);  // Use goToStep instead
  break;
```

---

### 3.3 Wrap localStorage in try-catch
**File:** `src/hooks/useTSPDemo.ts:59-60`

**Problem:** localStorage throws in private browsing mode

**Fix:**
```typescript
const [strategyId, setStrategyIdState] = useState(() => {
  try {
    const saved = localStorage.getItem('tsp-strategy');
    return saved && strategyOrder.includes(saved) ? saved : strategyOrder[0];
  } catch {
    return strategyOrder[0];
  }
});
```

---

### 3.4 Display Error in UI
**File:** `src/App.tsx` or relevant component

```tsx
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
    Error: {error}
    <button onClick={() => setError(null)}>Dismiss</button>
  </div>
)}
```

---

## Implementation Steps

- [ ] 1. Add error state to UseTSPDemoReturn interface
- [ ] 2. Add error state and setter to hook
- [ ] 3. Update catch block to set error
- [ ] 4. Clear error on new solution load
- [ ] 5. Fix End key to use goToStep
- [ ] 6. Wrap localStorage in try-catch
- [ ] 7. Add error display component
- [ ] 8. Test error scenarios

---

## Success Criteria

- [ ] Error state exposed from hook
- [ ] UI displays error when solution load fails
- [ ] End key works correctly after strategy changes
- [ ] App works in private browsing mode
- [ ] Build passes

---

## Related Files

- `src/hooks/useTSPDemo.ts`
- `src/App.tsx`

---

## Risk Assessment

**Low risk** - Error handling is additive. Won't break existing functionality.
