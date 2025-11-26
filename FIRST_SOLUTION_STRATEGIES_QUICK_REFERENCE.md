# OR-Tools First Solution Strategies - Quick Reference Guide

**Quick lookup for FirstSolutionStrategy enum values and recommendations.**

---

## Strategy Value Enum Reference

| Value | Strategy | Category | Speed | Recommendation |
|-------|----------|----------|-------|---|
| 0 | UNSET | - | - | Not used |
| 1 | GLOBAL_CHEAPEST_ARC | Variable | Fast | ❌ **AVOID** |
| 2 | LOCAL_CHEAPEST_ARC | Variable | ⚡⚡⚡ Very Fast | ✅ Use with local search |
| 3 | PATH_CHEAPEST_ARC | Path | ⚡⚡⚡ Very Fast | ✅ **DEFAULT** |
| 4 | PATH_MOST_CONSTRAINED_ARC | Path | ⚡⚡ Fast | ✅ Complex constraints |
| 5 | EVALUATOR_STRATEGY | Path | ⚡ Slow | ✅ Custom costs |
| 6 | ALL_UNPERFORMED | Special | ⚡⚡⚡ Very Fast | ❌ Avoid |
| 7 | BEST_INSERTION | Insertion | ⚡ Slow | ✅ Quality over speed |
| 8 | PARALLEL_CHEAPEST_INSERTION | Insertion | ⚡ Slow | ✅ Pickup/delivery |
| 9 | LOCAL_CHEAPEST_INSERTION | Insertion | ⚡⚡ Fast | ✅ Large problems |
| 10 | SAVINGS | Path | ⚡⚡ Fast | ✅ Capacity-constrained |
| 11 | SWEEP | Path | ⚡⚡⚡ Very Fast | ✅ Geographic clustering |
| 12 | FIRST_UNBOUND_MIN_VALUE | Variable | ⚡⚡⚡ Very Fast | ❌ Avoid |
| 13 | CHRISTOFIDES | Path | ❌ Slow | ✅ High quality needed |
| 14 | SEQUENTIAL_CHEAPEST_INSERTION | Insertion | ⚡⚡ Fast | ✅ Tight capacity |
| 15 | AUTOMATIC | Auto | ⚡ Medium | ✅ **DEFAULT** |
| 16 | LOCAL_CHEAPEST_COST_INSERTION | Insertion | ⚡ Slow | ✅ Multi-objective |
| 17 | PARALLEL_SAVINGS | Path | ⚡⚡ Fast | ✅ Parallel routes |

---

## Decision Tree

```
START: Choose First Solution Strategy
│
├─ AUTOMATIC SELECTION?
│  ├─ YES → Use value 15 (AUTOMATIC)
│  │        [Solver auto-detects based on constraints]
│  │
│  └─ NO → Continue to problem type
│
├─ PROBLEM TYPE?
│  │
│  ├─ SIMPLE (few constraints)
│  │  ├─ Speed critical? → PATH_CHEAPEST_ARC (3)
│  │  ├─ Quality focus?  → SAVINGS (10)
│  │  └─ Geographic?     → SWEEP (11)
│  │
│  ├─ COMPLEX (time windows, capacity, precedence)
│  │  ├─ Tight constraints? → PATH_MOST_CONSTRAINED_ARC (4)
│  │  ├─ Pickup/Delivery?  → PARALLEL_CHEAPEST_INSERTION (8)
│  │  └─ Custom costs?     → EVALUATOR_STRATEGY (5)
│  │
│  ├─ LARGE SCALE (1000+ nodes)
│  │  ├─ Speed needed?     → LOCAL_CHEAPEST_ARC (2)
│  │  ├─ Balance quality?  → LOCAL_CHEAPEST_INSERTION (9)
│  │  └─ Geographic area?  → SWEEP (11)
│  │
│  ├─ HIGH QUALITY NEEDED
│  │  ├─ Computation time OK?  → CHRISTOFIDES (13)
│  │  └─ Balanced approach?    → BEST_INSERTION (7)
│  │
│  └─ SPECIAL CASES
│     ├─ Custom objective?     → EVALUATOR_STRATEGY (5)
│     ├─ Sequential routing?   → SEQUENTIAL_CHEAPEST_INSERTION (14)
│     ├─ Multi-objective?      → LOCAL_CHEAPEST_COST_INSERTION (16)
│     └─ Parallel multi-route? → PARALLEL_SAVINGS (17)
│
└─ END: Configure search_parameters.first_solution_strategy
```

---

## Python Quick Code

### Basic Setup
```python
from ortools.constraint_solver import routing_enums_pb2

search_parameters = routing_enums_pb2.RoutingSearchParameters()

# Strategy selection (choose one)
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC  # value: 3
)

routing.SearchForBestSolution(search_parameters)
```

### All Strategy Values (Copy-Paste Ready)
```python
# Path Construction Heuristics
PATH_CHEAPEST_ARC = 3
PATH_MOST_CONSTRAINED_ARC = 4
EVALUATOR_STRATEGY = 5
SAVINGS = 10
SWEEP = 11
CHRISTOFIDES = 13
PARALLEL_SAVINGS = 17

# Insertion Heuristics
BEST_INSERTION = 7
PARALLEL_CHEAPEST_INSERTION = 8
LOCAL_CHEAPEST_INSERTION = 9
SEQUENTIAL_CHEAPEST_INSERTION = 14
LOCAL_CHEAPEST_COST_INSERTION = 16

# Variable-Based Heuristics
GLOBAL_CHEAPEST_ARC = 1        # ❌ NOT RECOMMENDED
LOCAL_CHEAPEST_ARC = 2
FIRST_UNBOUND_MIN_VALUE = 12   # ❌ NOT RECOMMENDED

# Auto/Special
AUTOMATIC = 15
ALL_UNPERFORMED = 6            # ❌ NOT RECOMMENDED
```

### Recommended Combinations
```python
# Simple problems + strong local search
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
)
search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
)

# Complex constraints
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC
)
search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
)

# Quality focus
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES
)
search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.SIMULATED_ANNEALING
)

# Fast + reasonable quality
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_ARC
)
search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
)
search_parameters.time_limit.seconds = 30
```

---

## Algorithm Complexity Quick Reference

| Strategy | Time Complexity | Space | Speed Rank |
|----------|-----------------|-------|-----------|
| FIRST_UNBOUND_MIN_VALUE | O(n) | O(n) | 1 ⚡⚡⚡ |
| LOCAL_CHEAPEST_ARC | O(n²) | O(n) | 2 ⚡⚡⚡ |
| PATH_CHEAPEST_ARC | O(n²) | O(n) | 2 ⚡⚡⚡ |
| SWEEP | O(n log n) | O(n) | 3 ⚡⚡ |
| SAVINGS | O(n² log n) | O(n²) | 4 ⚡⚡ |
| LOCAL_CHEAPEST_INSERTION | O(n²) | O(n) | 5 ⚡ |
| PARALLEL_CHEAPEST_INSERTION | O(n²) | O(n) | 6 ⚡ |
| BEST_INSERTION | O(n³) | O(n) | 7 ⚡ |
| CHRISTOFIDES | O(n³) | O(n²) | 8 ❌ |

---

## When NOT to Use

### ❌ GLOBAL_CHEAPEST_ARC (Value: 1)
**Why avoid?** OR-Tools developers explicitly recommend against it.
- Slower than PATH_CHEAPEST_ARC
- Less effective for most problems
- Use PATH_CHEAPEST_ARC, SAVINGS, or insertion instead

### ❌ FIRST_UNBOUND_MIN_VALUE (Value: 12)
**Why avoid?** No cost optimization
- Creates arbitrary routes
- Very poor solution quality
- Only use for feasibility testing

### ❌ ALL_UNPERFORMED (Value: 6)
**Why avoid?** Only works with optional/penalty nodes
- Not practical for standard VRP
- Requires all nodes have penalties
- Use other strategies instead

---

## Constraint Handling Scorecard

| Strategy | Time Windows | Capacity | Precedence | Pickup/Delivery |
|----------|--------------|----------|-----------|-----------------|
| PATH_CHEAPEST_ARC | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| PATH_MOST_CONSTRAINED_ARC | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| SAVINGS | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| SWEEP | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ |
| CHRISTOFIDES | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| BEST_INSERTION | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| PARALLEL_CHEAPEST_INSERTION | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| LOCAL_CHEAPEST_ARC | ⭐ | ⭐⭐ | ⭐ | ⭐ |

---

## Performance Expectations

### Fast Strategies (< 1 second for 100 nodes)
- PATH_CHEAPEST_ARC
- LOCAL_CHEAPEST_ARC
- SWEEP
- LOCAL_CHEAPEST_INSERTION

### Medium Speed (1-5 seconds for 100 nodes)
- SAVINGS
- PATH_MOST_CONSTRAINED_ARC
- PARALLEL_CHEAPEST_INSERTION
- BEST_INSERTION
- EVALUATOR_STRATEGY (varies with evaluator)

### Slow (5+ seconds for 100 nodes)
- CHRISTOFIDES
- PARALLEL_SAVINGS (implementation dependent)

---

## Known Issues

### PARALLEL_CHEAPEST_INSERTION
- ⚠️ May fail with < 10 vehicles for large problems (500+ orders)
- Works reliably with 10+ vehicles
- Use BEST_INSERTION as fallback for small fleets

### GLOBAL_CHEAPEST_ARC
- ⚠️ **EXPLICITLY NOT RECOMMENDED** by OR-Tools team
- Slower and less effective than alternatives
- Use PATH_CHEAPEST_ARC, SAVINGS, or insertion instead

### Time Limit Interactions
- Very fast strategies (⚡⚡⚡) complete before time limit
- Medium strategies (⚡) use significant time limit
- Slow strategies (❌) hit time limits frequently
- Always combine with local search for best results

---

## Troubleshooting

### "Solution quality is poor"
1. Switch from FIRST_UNBOUND_MIN_VALUE → PATH_CHEAPEST_ARC
2. Add local search: use GUIDED_LOCAL_SEARCH
3. Try SAVINGS or CHRISTOFIDES for higher quality
4. Increase time_limit for local search

### "Solver is too slow"
1. Switch to faster strategy: SWEEP or LOCAL_CHEAPEST_ARC
2. Reduce time_limit (but keep local search running)
3. Avoid CHRISTOFIDES (it's inherently slow)
4. Use PARALLEL_CHEAPEST_INSERTION (not sequential)

### "Constraint violations in solution"
1. Use PATH_MOST_CONSTRAINED_ARC
2. Try PARALLEL_CHEAPEST_INSERTION
3. Verify constraint definitions (penalties, hard limits)
4. Check time_limit allows local search refinement

### "Routes are unbalanced"
1. Use PARALLEL strategies (PARALLEL_CHEAPEST_INSERTION)
2. Avoid LOCAL_CHEAPEST_INSERTION
3. Add load-balancing constraints to problem

---

## Recommended Production Defaults

### Best Overall Starting Point
```python
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC
)
search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
)
search_parameters.time_limit.seconds = 30
```

### For Testing/Benchmarking
```python
# Test multiple strategies
strategies = [3, 4, 7, 8, 10, 11]  # Common recommended strategies
for strategy in strategies:
    search_parameters.first_solution_strategy = strategy
    solution = routing.SearchForBestSolution(search_parameters)
    # Compare results
```

---

## Further Reading

- [Complete OR-Tools First Solution Strategies Report](./OR_TOOLS_FIRST_SOLUTION_STRATEGIES_REPORT.md)
- [Google OR-Tools Routing Documentation](https://developers.google.com/optimization/routing)
- [OR-Tools GitHub Repository](https://github.com/google/or-tools)

---

**Last Updated:** November 26, 2025
