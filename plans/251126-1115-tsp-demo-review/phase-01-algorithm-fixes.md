# Phase 1: Algorithm Fixes

**Priority:** CRITICAL
**Status:** PENDING
**Estimated Effort:** 2-4 hours

---

## Context

Code review found algorithm correctness issues in Python solution generator that produce suboptimal/incorrect routes.

---

## Requirements

### 1.1 Fix Christofides Algorithm
**File:** `scripts/generate_solutions.py:776-797`
**Severity:** CRITICAL

**Problem:** Current implementation uses greedy matching instead of minimum weight perfect matching. Not true Christofides (1.5-approximation guarantee).

**Evidence:**
- 5 locations: Christofides=1256, Local Insertion=1144 (9.8% worse)
- 7 locations: Christofides=1586, Local Insertion=1401 (13.2% worse)

**Options:**
- **Option A (Quick):** Add disclaimer in strategy description: "Christofides-inspired (simplified greedy matching)"
- **Option B (Correct):** Implement Blossom/Hungarian algorithm for min-weight perfect matching

**Recommendation:** Option A for demo purposes, document limitation

---

### 1.2 Fix Global Cheapest Arc Cycle Detection
**File:** `scripts/generate_solutions.py:308-324`
**Severity:** CRITICAL

**Problem:** Off-by-one error in cycle validation
```python
# Current (line 320):
return len(selected_edges) < n - 1  # WRONG

# Should be:
return len(selected_edges) < n
```

**Fix:** Change condition to `< n`

---

### 1.3 Fix Savings Route Merge Validation
**File:** `scripts/generate_solutions.py:607-620`
**Severity:** HIGH

**Problem:** No validation that nodes i,j are at route endpoints before merging

**Fix:** Add assertions:
```python
def can_merge_routes(route1, route2, i, j):
    # Validate i is at endpoint of route1
    assert route1[1] == i or route1[-2] == i, f"Node {i} not at endpoint"
    # Validate j is at endpoint of route2
    assert route2[1] == j or route2[-2] == j, f"Node {j} not at endpoint"
    # Validate routes not same
    assert route1 != route2
```

---

## Implementation Steps

- [ ] 1. Update Christofides description in `strategies.ts` with disclaimer
- [ ] 2. Fix cycle detection in `generate_solutions.py:320`
- [ ] 3. Add merge validation to Savings algorithm
- [ ] 4. Regenerate all 42 solution files: `pnpm generate-solutions`
- [ ] 5. Verify solutions improved/correct

---

## Success Criteria

- [ ] Christofides clearly marked as simplified version
- [ ] Global Cheapest Arc produces valid routes
- [ ] Savings algorithm handles edge cases
- [ ] All 42 JSON files regenerated
- [ ] Build passes

---

## Related Files

- `scripts/generate_solutions.py`
- `src/data/strategies.ts`
- `src/data/solutions/**/*.json`

---

## Risk Assessment

**Low risk** - Changes isolated to solution generation. No frontend code changes except strategy description.
