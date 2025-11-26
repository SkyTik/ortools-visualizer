# Phase 2: UI Warnings for Not Recommended Strategies

**Priority:** HIGH
**Status:** PENDING
**Estimated Effort:** 1-2 hours

---

## Context

OR-Tools research explicitly recommends AGAINST two strategies currently shown in demo without warnings:
- **GLOBAL_CHEAPEST_ARC** (value 1) - "❌ AVOID" - slower and less effective
- **FIRST_UNBOUND_MIN_VALUE** (value 12) - "❌ Avoid" - very poor quality

Educational demo should inform users these are included for comparison only.

---

## Requirements

### 2.1 Add Warning Field to Strategy Type
**File:** `src/types/index.ts`

```typescript
export interface Strategy {
  id: string;
  name: string;
  shortDesc: string;
  pseudocode: string;
  wikipediaUrl?: string;
  warning?: string;  // NEW - optional warning message
}
```

---

### 2.2 Add Warnings to Strategy Data
**File:** `src/data/strategies.ts`

```typescript
GLOBAL_CHEAPEST_ARC: {
  id: 'GLOBAL_CHEAPEST_ARC',
  name: 'Global Cheapest Arc',
  shortDesc: 'Build route by always adding globally shortest edge',
  warning: 'Not recommended by OR-Tools - included for educational comparison',
  // ...
},

FIRST_UNBOUND_MIN_VALUE: {
  id: 'FIRST_UNBOUND_MIN_VALUE',
  name: 'First Unbound Min Value',
  shortDesc: 'Visit nodes in sequential index order (baseline)',
  warning: 'Very poor solution quality - use only for baseline comparison',
  // ...
},
```

---

### 2.3 Display Warning Badge in UI
**File:** `src/components/controls/StrategyTabs.tsx`

Add warning indicator when strategy selected:

```tsx
{strategy.warning && (
  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
    ⚠️ {strategy.warning}
  </div>
)}
```

---

## Implementation Steps

- [ ] 1. Add `warning` field to Strategy interface
- [ ] 2. Add warnings to GLOBAL_CHEAPEST_ARC and FIRST_UNBOUND_MIN_VALUE
- [ ] 3. Update StrategyTabs to display warning
- [ ] 4. Style warning with amber/yellow color
- [ ] 5. Test both strategies show warning
- [ ] 6. Verify build passes

---

## Success Criteria

- [ ] Warning displays when GLOBAL_CHEAPEST_ARC selected
- [ ] Warning displays when FIRST_UNBOUND_MIN_VALUE selected
- [ ] No warnings for other 5 strategies
- [ ] Warning visually distinct (amber background)
- [ ] Build and type check pass

---

## Related Files

- `src/types/index.ts`
- `src/data/strategies.ts`
- `src/components/controls/StrategyTabs.tsx`

---

## Risk Assessment

**Very low risk** - Additive change. Optional field won't break existing code.
