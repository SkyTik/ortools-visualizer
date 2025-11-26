# OR-Tools Vehicle Routing Problem: First Solution Strategies Report

**Date:** November 26, 2025
**Source:** Google OR-Tools Official Documentation & Repository
**Purpose:** Comprehensive documentation of FirstSolutionStrategy enum values and how they construct initial solutions for Vehicle Routing Problems

---

## Executive Summary

OR-Tools employs a two-phase solving approach:
1. **First Phase:** Generate feasible initial solution using First Solution Strategy
2. **Second Phase:** Improve solution using Local Search Metaheuristics (Greedy Descent, Guided Local Search, Tabu Search, Simulated Annealing)

The choice of first solution strategy significantly impacts solver performance, solution quality, and computation time. This report documents all 17 available strategies, their algorithms, use cases, and trade-offs.

---

## Strategy Categories

First Solution Strategies in OR-Tools are organized into three functional categories:

### 1. Path Construction Heuristics
Build routes by extending from an existing path one node at a time.

### 2. Insertion Heuristics
Build routes by iteratively selecting nodes and inserting them at optimal positions.

### 3. Variable-Based Heuristics
Build routes by selecting unbound variables and connecting them to available nodes.

---

## Complete First Solution Strategy Reference

### AUTOMATIC (Value: 15)

**Description:** Solver auto-detects optimal strategy based on problem characteristics.

**Algorithm:**
1. Analyzes problem constraints and structure
2. Applies selection hierarchy:
   - Pickup/Delivery constraints present → PARALLEL_CHEAPEST_INSERTION
   - Node precedences exist → PARALLEL_CHEAPEST_INSERTION
   - Single-vehicle restrictions → PATH_MOST_CONSTRAINED_ARC
   - All other cases → PATH_CHEAPEST_ARC

**When to Use:**
- Baseline testing and benchmarking
- Unknown problem structure
- Development phase prototyping
- When computational time allows experimentation

**Pros:**
- No manual tuning required
- Reasonable performance on standard problems
- Safe choice for initial exploration

**Cons:**
- May not be optimal for complex problems
- Lacks control over strategy selection
- Slower than strategically chosen alternatives

**Complexity:** O(n²) to O(n³) depending on selected strategy

---

### PATH_CHEAPEST_ARC (Value: 3)

**Category:** Path Construction Heuristic

**Description:** Nearest neighbor variant - grows routes sequentially by always adding cheapest feasible node.

**Algorithm:**
1. Initialize routes for each vehicle from depot
2. For each route:
   - Start from route's beginning point
   - Identify all unvisited nodes feasible from current route endpoint
   - Select node producing minimum cost arc
   - Add selected node to route
   - Repeat until no feasible nodes remain
3. Move to next vehicle and repeat

**When to Use:**
- Simple routing problems without complex constraints
- Single depot, uniform vehicle problems
- Baseline performance reference
- Problems requiring fast initial solutions
- Sufficient when local search metaheuristics provide optimization

**Pros:**
- Fast computation time (O(n²))
- Intuitive, easy to understand and debug
- Good starting point before local search
- Works reliably with single depot systems
- Effective for problems with limited constraints

**Cons:**
- Greedy approach can lead to suboptimal solutions
- Cannot escape local minima without local search
- Less effective with complex time windows
- Poor performance with tight capacity constraints
- Not recommended as-is for complex problems

**Implementation Complexity:** Low
**Computation Time:** Low

---

### PATH_MOST_CONSTRAINED_ARC (Value: 4)

**Category:** Path Construction Heuristic

**Description:** Similar to PATH_CHEAPEST_ARC but prioritizes nodes with restrictive constraints.

**Algorithm:**
1. Initialize routes for each vehicle
2. For each route:
   - Maintain "constraint tightness" metrics for unvisited nodes
   - Select node with most constraints (e.g., few vehicles allowed, tight time windows, high demand)
   - Add selected node to route
   - Update constraint tightness for remaining nodes
3. Repeat for remaining vehicles

**Constraint Factors:**
- Number of allowed vehicles
- Time window tightness
- Demand relative to vehicle capacity
- Precedence constraints (pickup/delivery pairs)
- Distance from vehicle start/end points

**When to Use:**
- Problems with strong time window constraints
- Mixed capacity and timing restrictions
- Heterogeneous vehicle fleets with different capabilities
- When nodes have high penalty costs for infeasibility
- Problems where constraint satisfaction is critical

**Pros:**
- Handles constrained nodes early (reduces infeasibility)
- Better feasibility preservation than PATH_CHEAPEST_ARC
- Effective with complex constraint combinations
- Prevents "painting yourself into a corner" with rigid nodes
- Improves solution quality for constrained problems

**Cons:**
- Slower than PATH_CHEAPEST_ARC (O(n³))
- Constraint evaluation adds computational overhead
- Still greedy without guarantees
- Requires problem-specific tuning
- More complex to implement and debug

**Implementation Complexity:** Medium
**Computation Time:** Medium

---

### EVALUATOR_STRATEGY (Value: 5)

**Category:** Path Construction Heuristic (Custom)

**Description:** Extends PATH_CHEAPEST_ARC with custom cost evaluator function via `SetFirstSolutionEvaluator()`.

**Algorithm:**
1. Initialize routes
2. For each route:
   - Use custom evaluator function to compute arc costs
   - Select arc with minimum custom cost
   - Add node to route
3. Repeat until route complete

**Custom Evaluator Parameters:**
- Vehicle capacity remaining
- Time window slack
- Node penalty cost
- Cumulative distance
- Custom domain-specific metrics

**When to Use:**
- Complex domain-specific routing problems
- Hybrid objective functions (cost + environmental impact)
- Variable pricing models (fuel, tolls, emissions)
- Problems requiring non-standard cost functions
- When standard strategies don't fit problem structure

**Pros:**
- Full flexibility in cost definition
- Incorporates domain knowledge
- Can weight multiple objectives
- Adaptive to problem characteristics
- Enables custom heuristics integration

**Cons:**
- Requires custom implementation (increased development time)
- Difficult to debug custom evaluators
- Performance depends on evaluator quality
- Added computational overhead from evaluator calls
- Not portable across different problem domains

**Implementation Complexity:** High
**Computation Time:** Medium-High (depends on evaluator complexity)

---

### SAVINGS (Value: 10)

**Category:** Path Construction Heuristic

**Description:** Clarke & Wright savings algorithm - merges routes based on distance savings.

**Algorithm:**
1. Initialize n routes: depot → node_i → depot (each node as separate route)
2. For all node pairs (i, j):
   - Calculate savings: S(i,j) = distance(depot→i) + distance(j→depot) - distance(i→j)
3. Sort savings in descending order
4. For each savings pair in order:
   - Merge routes if feasible (capacity, time windows, precedence)
   - Continue until no more feasible merges
5. Sequence nodes within merged routes

**Mathematical Formulation:**
```
Savings(i,j) = c(0,i) + c(j,0) - c(i,j)
Where: c = cost/distance
0 = depot
i, j = nodes
```

**When to Use:**
- Problems with single or few depots
- Capacity-constrained routing (CVRP)
- Time-windowed problems (VRPTW)
- Vehicle count is optimization variable
- When distance/cost savings are primary objective

**Pros:**
- Simple, well-understood algorithm
- Computationally efficient (O(n² log n))
- Good feasibility preservation
- Reduces number of vehicles naturally
- Produces balanced route lengths
- Extensive research and implementations available

**Cons:**
- Depends on good savings ordering
- May create long, inefficient routes early
- Route merging order affects final solution
- Doesn't handle all constraint types equally
- Fixed vehicle count reduces flexibility

**Implementation Complexity:** Low-Medium
**Computation Time:** Low

**Note:** Named after Clarke & Wright 1964 foundational research

---

### SWEEP (Value: 11)

**Category:** Path Construction Heuristic (Cluster-First, Route-Second)

**Description:** Wren & Holliday sweep algorithm - clusters nodes by polar angle from depot, then routes clusters.

**Algorithm:**
1. Calculate polar angle for each node from depot
2. Sort nodes by polar angle
3. Create initial routes by sweeping angle (cluster formation):
   - Start at angle 0
   - Add nodes in angular order to current route
   - Create new route when capacity/constraint violated
4. Sequence nodes within each route
5. Optimize routes if needed

**Spatial Grouping:**
Divides delivery area into radial sectors from depot, ensuring geographically contiguous routes.

**When to Use:**
- Geographically dispersed delivery areas
- Capacity-constrained VRP with geographic clustering
- Large problems where geographic coherence matters
- Vehicle count is optimization variable
- Delivery radius-based constraints
- Time-windowed geographic deliveries (VRPTW variants)

**Pros:**
- Cluster-first approach reduces cross-routes
- O(n log n) computational complexity
- Produces geographically coherent routes
- Fast initial solution generation
- Effective for Euclidean distance metrics
- Natural fit for cartographic/GPS data

**Cons:**
- Assumes geographic clustering improves solutions (not always true)
- Sensitive to depot location choice
- Polar angle sorting may miss better non-geographic groupings
- Less effective in non-Euclidean or abstract graphs
- Ignores temporal constraints early in clustering

**Implementation Complexity:** Low-Medium
**Computation Time:** Low

**Note:** Published by Wren & Holliday 1972 in Operations Research Quarterly

---

### CHRISTOFIDES (Value: 13)

**Category:** Path Construction Heuristic (Advanced)

**Description:** Approximation algorithm variant using maximal matching for route building.

**Algorithm:**
1. Construct minimum spanning tree (MST) of problem graph
2. Find nodes with odd degree in MST
3. Compute minimum-cost perfect matching on odd-degree nodes
4. Combine MST and matching to form Eulerian graph
5. Find Eulerian circuit
6. Convert Eulerian circuit to Hamiltonian path (vehicle route)
7. Extend route until no additional nodes feasible
8. Repeat for remaining vehicles

**Approximation Guarantee (Theoretical):**
- Classical Christofides: 3/2-approximation to optimal TSP
- OR-Tools variant (maximal vs maximum matching): No theoretical guarantee

**When to Use:**
- Small to medium problems requiring strong initial solutions
- Problems where approximation guarantees matter
- Optimization-focused applications
- When computational cost of initial solution is acceptable
- Theoretical analysis and comparison studies

**Pros:**
- Strong theoretical approximation properties
- Produces higher-quality initial solutions than greedy methods
- Handles various constraint types
- Suitable for academic/research applications
- Better scaling to optimal solutions

**Cons:**
- Computationally expensive (O(n³) for MST + matching)
- Complex implementation requiring advanced graph algorithms
- OR-Tools uses maximal (not maximum) matching → no guarantee
- Overkill for simple problems
- Slow compared to other heuristics
- Difficult to debug and modify

**Implementation Complexity:** High
**Computation Time:** High

**Note:** Reference: Nicos Christofides "Worst-case analysis of a new heuristic for the travelling salesman problem" CMU Report 388, 1976

---

### ALL_UNPERFORMED (Value: 6)

**Category:** Special Strategy

**Description:** Makes all nodes optional/unperformed - only feasible with penalty-based optional nodes.

**Algorithm:**
1. Initialize all nodes as inactive/unperformed
2. Solver must activate nodes through local search
3. Each unperformed node incurs penalty cost
4. Optimization balances service vs penalties

**When to Use:**
- Optional delivery/service problems
- Problems where skipping nodes has cost penalties
- Testing if routes are feasible without all locations
- Problems with flexible demand (some customers optional)
- Toll/access areas where delivery is discretionary

**Pros:**
- Allows pure penalty-based optimization
- Tests feasibility boundaries
- Models real-world optional services
- Baseline for worst-case scenarios

**Cons:**
- Only works with optional nodes (requires penalties defined)
- Non-practical as standalone strategy
- Usually combined with penalties, not realistic
- Requires good penalty calibration

**Implementation Complexity:** Low
**Computation Time:** Very Low

---

### BEST_INSERTION (Value: 7)

**Category:** Insertion Heuristic

**Description:** Global insertion - iteratively adds cheapest-to-insert node at globally-best position across all routes.

**Algorithm:**
1. Start with seed route(s) or partial solution
2. Calculate insertion cost for each unvisited node in each route:
   - Insertion_Cost(i) = cost(add node i at best position in route)
3. Select node with minimum global insertion cost
4. Insert selected node at its optimal position
5. Repeat until all nodes assigned
6. Optimize node sequences within routes

**Insertion Cost Calculation:**
```
Cost_To_Insert(i, position) = distance(prev→i) + distance(i→next) - distance(prev→next)
Global_Best = minimum across all routes and positions
```

**When to Use:**
- Medium to large problems requiring balanced quality/speed
- Time windows and capacity constraints
- When better initial solutions worth computation cost
- Heterogeneous fleet problems
- Mixed constraint scenarios

**Pros:**
- Produces higher-quality solutions than greedy methods
- Balances quality and computational efficiency
- Handles constraints during construction
- Relatively simple to implement
- Good performance on many problem types
- Doesn't require problem-specific tuning

**Cons:**
- O(n³) computational complexity
- Slower than path construction methods
- Still greedy (no backtracking/reordering)
- Performance varies with seed selection
- May create long routes early on

**Implementation Complexity:** Medium
**Computation Time:** Medium

---

### PARALLEL_CHEAPEST_INSERTION (Value: 8)

**Category:** Insertion Heuristic (Parallel Construction)

**Description:** Builds multiple routes simultaneously - faster than BEST_INSERTION using arc-based insertion costs.

**Algorithm:**
1. Initialize all vehicle routes simultaneously
2. For each unassigned node:
   - Calculate insertion cost in each route (arc cost basis)
   - Find cheapest insertion position across all routes
3. Simultaneously insert all nodes where costs improve
4. Repeat for remaining nodes
5. Continue until all nodes assigned

**Key Difference from BEST_INSERTION:**
- Uses arc cost calculation (simpler)
- Constructs multiple routes in parallel
- Faster due to reduced complexity

**When to Use:**
- Pickup/delivery problems (preferred by AUTOMATIC strategy)
- Node precedence constraints present
- Medium to large problems needing reasonable quality
- When computation time is constrained
- Fleet routing with diverse constraints

**Pros:**
- O(n²) complexity (faster than BEST_INSERTION)
- Parallel route building → balanced routes
- Works well with pickup/delivery
- Handles precedence constraints
- Good quality for reasonable time

**Cons:**
- May fail with few vehicles (e.g., 500 orders, 1-9 vehicles)
- Works better with ≥10 vehicles
- Parallel building may miss cross-route optimizations
- Still greedy approach
- Less documentation than PATH_CHEAPEST_ARC

**Implementation Complexity:** Medium
**Computation Time:** Medium (lower than BEST_INSERTION)

---

### LOCAL_CHEAPEST_INSERTION (Value: 9)

**Category:** Insertion Heuristic (Sequential, Local)

**Description:** Sequential insertion - nodes added in creation order at cheapest position in current routes.

**Algorithm:**
1. Initialize one or more seed routes
2. For each unassigned node in creation order:
   - Calculate insertion cost at each position in each route
   - Select position with minimum cost
   - Insert node at that position
3. Continue until all nodes assigned
4. Optionally optimize route sequences

**Creation Order:** Nodes processed in order they appear in problem definition, not in optimal order.

**When to Use:**
- Problems with natural node ordering (sequential deliveries)
- Fast initial solutions required
- When node creation order is meaningful
- Route sequence preservation is important
- Large problems needing quick feasible solutions

**Pros:**
- Fastest insertion heuristic (O(n²))
- Simple to implement and understand
- Maintains node order when relevant
- Good speed/quality trade-off
- Effective for large problems

**Cons:**
- Sequential order may not be optimal
- No global view of problem
- Cannot reorder nodes for better solutions
- Order-dependent results
- May create inefficient sequences

**Implementation Complexity:** Low
**Computation Time:** Low

---

### GLOBAL_CHEAPEST_ARC (Value: 1)

**Category:** Variable-Based Heuristic

**Description:** Greedy arc selection - connects any two nodes with minimum cost edge globally until routes form.

**Algorithm:**
1. Create list of all possible arcs (ordered pairs of unvisited nodes)
2. While unassigned nodes remain:
   - Sort remaining arcs by cost (ascending)
   - Select cheapest arc that:
     - Doesn't violate capacity
     - Doesn't create subtour (except at end)
     - Doesn't violate precedence
   - Add arc to solution (creates path segment)
   - Remove assigned arcs from candidate list
3. Merge path segments into complete routes
4. Optimize route sequences

**Arc Connectivity Rules:**
- Each node has in-degree ≤ 1 and out-degree ≤ 1
- Forms chain until all nodes in segment added
- Chains become routes when depot connected

**When to Use:**
- Very simple problems (few nodes)
- Academic exercises and learning
- Performance comparison benchmarks
- Problems where pure cost minimization is sole objective

**Pros:**
- Simple concept (greedy minimum edge)
- Pure cost-based optimization
- Straightforward to implement

**Cons:**
- **NOT RECOMMENDED** per OR-Tools developers
- O(n²) comparisons but complex logic
- Slower and less effective than PATH_CHEAPEST_ARC
- Doesn't efficiently handle constraints
- Often produces poor solutions
- OR-Tools recommends using: PATH_CHEAPEST_ARC, SAVINGS, or Insertion heuristics instead

**Implementation Complexity:** Medium (deceptively complex despite simple concept)
**Computation Time:** Medium (slower than advertised)

**Performance Note:** OR-Tools developers explicitly warn against GLOBAL_CHEAPEST_ARC: "It's in general slower and less effective than PathCheapestAddition, Savings or the Insertion heuristics."

---

### LOCAL_CHEAPEST_ARC (Value: 2)

**Category:** Variable-Based Heuristic

**Description:** First unbound node connected to cheapest feasible node - selective greedy approach.

**Algorithm:**
1. While unassigned nodes remain:
   - Identify first unbound (unvisited) node
   - Find all feasible connections from that node
   - Select connection with minimum cost
   - Add arc to solution
2. Once node pair connected, extend from that endpoint
3. Complete routes and sequence nodes

**Variable Selection:** "First unbound" = leftmost unassigned node in variable ordering.

**When to Use:**
- Fast approximate solutions needed
- Large problems requiring quick execution
- When combined with strong local search
- Baseline reference for more complex strategies
- Problems where node order provides structure

**Pros:**
- Fast computation (O(n²))
- Effective when combined with local search
- Performs well with GUIDED_LOCAL_SEARCH
- Simple to implement
- Reasonable solution quality

**Cons:**
- Deterministic order may miss opportunities
- First unbound selection is arbitrary
- Doesn't consider global problem structure
- Still greedy approach
- Order-dependent results

**Implementation Complexity:** Low
**Computation Time:** Low

**Performance Note:** When combined with GUIDED_LOCAL_SEARCH for 30 seconds, LOCAL_CHEAPEST_ARC produces good results in total travel time.

---

### FIRST_UNBOUND_MIN_VALUE (Value: 12)

**Category:** Variable-Based Heuristic

**Description:** Selects first unbound node and connects to first available feasible node (no optimization).

**Algorithm:**
1. While unassigned nodes remain:
   - Select first unbound node (arbitrary order)
   - Find first feasible node to connect (arbitrary order)
   - Add connection to solution
   - Mark nodes as bound
2. Continue until all nodes assigned
3. Optimize routes (minimal post-processing)

**Connection Selection:** No cost evaluation - uses **first available**, not cheapest.

**When to Use:**
- Strictly feasibility-focused applications
- When solution quality is secondary concern
- Quick prototyping and testing
- Constraint validation checking
- Learning/teaching VRP basics
- Absolute baseline comparison

**Pros:**
- Minimal computation (O(n))
- Guarantees feasible solution (if one exists)
- Very fast initial routes
- Good for constraint testing
- Simplest to implement

**Cons:**
- Very poor solution quality (highest cost)
- Inefficient route structures
- No optimization consideration
- Only useful with aggressive local search
- Not recommended for production use
- Creates arbitrary, wasteful routes

**Implementation Complexity:** Very Low
**Computation Time:** Very Low (theoretical minimum)

---

### PARALLEL_SAVINGS (Value: 17)

**Category:** Path Construction Heuristic (Parallel Savings)

**Description:** Clarke & Wright savings algorithm with parallel route building.

**Algorithm:**
1. Initialize routes for each vehicle simultaneously
2. Calculate savings for all node pairs: S(i,j) = c(0,i) + c(j,0) - c(i,j)
3. Sort savings in descending order
4. For each savings pair:
   - Attempt to merge routes in parallel
   - Insert nodes in multiple routes simultaneously
5. Continue until convergence

**Parallel Construction:** Multiple routes built concurrently vs sequentially.

**When to Use:**
- Similar to SAVINGS but when parallel building is beneficial
- Large-scale problems
- Multi-vehicle fleet routing
- When balanced routes are priority

**Pros:**
- Better load balancing than sequential SAVINGS
- Computational efficiency (parallel operations)
- Handles multiple vehicles naturally

**Cons:**
- Less documented than classic SAVINGS
- Complex implementation (parallel merge logic)
- May miss sequential optimization opportunities

**Implementation Complexity:** Medium-High
**Computation Time:** Medium

---

### SEQUENTIAL_CHEAPEST_INSERTION (Value: 14)

**Category:** Insertion Heuristic (Sequential, Global)

**Description:** Insertion heuristic building one route completely before starting next.

**Algorithm:**
1. Initialize first route
2. For current route:
   - Select unassigned node with cheapest insertion cost into this route
   - Insert at optimal position
   - Repeat until no more nodes can be added feasibly
3. Start new route with next vehicle
4. Repeat for all routes

**Sequential Route Building:** Complete one route → move to next vehicle.

**When to Use:**
- Problems where vehicle capacity is tight constraint
- Complete route adherence is important
- When computational efficiency matters
- Capacity-heavy routing problems

**Pros:**
- Enforces complete route constraints
- More efficient than global search
- O(n² / k) complexity (k = vehicles)
- Balances vehicle utilization

**Cons:**
- Early route decisions may block later optimizations
- Can create imbalanced vehicle loads
- Less flexible than parallel methods
- May miss cross-route optimizations

**Implementation Complexity:** Medium
**Computation Time:** Low-Medium

---

### LOCAL_CHEAPEST_COST_INSERTION (Value: 16)

**Category:** Insertion Heuristic (Sequential, Cost-Based)

**Description:** Like LOCAL_CHEAPEST_INSERTION but uses routing model costs instead of arc costs.

**Algorithm:**
1. Process nodes in creation order
2. For each node:
   - Evaluate insertion cost using full routing model metrics:
     - Arc costs
     - Time window penalties
     - Capacity penalties
     - Other constraints
   - Insert at position minimizing total model cost
3. Continue until all nodes assigned

**Cost Evaluation Scope:** Full objective function vs simple arc distance.

**When to Use:**
- Complex multi-objective routing problems
- When constraint penalties need early consideration
- Problems with composite cost functions
- Better feasibility preservation needed

**Pros:**
- Considers full problem costs early
- Better constraint handling
- More informed insertion decisions
- Lower infeasibility risk

**Cons:**
- Slower than arc-cost-based methods
- Complex cost calculation required
- Requires detailed cost model definition
- O(n² × cost_evaluation_time) complexity

**Implementation Complexity:** Medium-High
**Computation Time:** Medium-High

---

## Performance Comparison Matrix

| Strategy | Speed | Solution Quality | Constraint Handling | Use Case |
|----------|-------|------------------|-------------------|----------|
| AUTOMATIC | Medium | Good | Adaptive | Prototyping, unknown problems |
| PATH_CHEAPEST_ARC | Very Fast | Fair | Basic | Simple problems, baseline |
| PATH_MOST_CONSTRAINED_ARC | Fast | Good | Excellent | Time windows, complex constraints |
| EVALUATOR_STRATEGY | Medium-Slow | Custom | Custom | Domain-specific problems |
| SAVINGS | Fast | Good | Good | Capacity-constrained VRP |
| SWEEP | Very Fast | Good | Good | Geographic clustering |
| CHRISTOFIDES | Slow | Excellent | Good | High-quality initial solutions |
| ALL_UNPERFORMED | Very Fast | Poor | Poor | Penalty-based only |
| BEST_INSERTION | Medium | Good | Good | Balanced quality/speed |
| PARALLEL_CHEAPEST_INSERTION | Medium | Good | Excellent | Pickup/delivery, precedence |
| LOCAL_CHEAPEST_INSERTION | Fast | Fair | Fair | Sequential problems, large scale |
| GLOBAL_CHEAPEST_ARC | Medium | Poor | Fair | **NOT RECOMMENDED** |
| LOCAL_CHEAPEST_ARC | Very Fast | Fair | Fair | Fast solutions + local search |
| FIRST_UNBOUND_MIN_VALUE | Very Fast | Very Poor | Fair | Testing, feasibility only |
| PARALLEL_SAVINGS | Fast | Good | Good | Multi-vehicle, balanced routes |
| SEQUENTIAL_CHEAPEST_INSERTION | Fast | Good | Good | Tight capacity constraints |
| LOCAL_CHEAPEST_COST_INSERTION | Medium | Good | Excellent | Multi-objective, composite costs |

---

## Strategy Selection Guide

### For Simple Problems (Few Constraints)
1. **Primary:** PATH_CHEAPEST_ARC
2. **Fallback:** SWEEP
3. **Quality Focus:** SAVINGS

### For Complex Constraints (Time Windows, Capacity)
1. **Primary:** PATH_MOST_CONSTRAINED_ARC
2. **Alternative:** PARALLEL_CHEAPEST_INSERTION
3. **Quality:** CHRISTOFIDES

### For Pickup/Delivery Problems
1. **Primary:** PARALLEL_CHEAPEST_INSERTION (selected by AUTOMATIC)
2. **Alternative:** LOCAL_CHEAPEST_INSERTION
3. **Quality:** SEQUENTIAL_CHEAPEST_INSERTION

### For Large Problems (1000+ nodes)
1. **Primary:** LOCAL_CHEAPEST_INSERTION
2. **Alternative:** SWEEP
3. **Speed Critical:** LOCAL_CHEAPEST_ARC + GUIDED_LOCAL_SEARCH

### For Quality-First Applications
1. **Primary:** CHRISTOFIDES
2. **Alternative:** BEST_INSERTION
3. **Fast Quality:** SAVINGS

### For Custom Cost Functions
1. **Primary:** EVALUATOR_STRATEGY
2. **Alternative:** LOCAL_CHEAPEST_COST_INSERTION

---

## Automatic Strategy Selection Logic

OR-Tools AUTOMATIC strategy uses this decision hierarchy:

```
If problem has pickup/delivery constraints:
  → Use PARALLEL_CHEAPEST_INSERTION
Else if problem has node precedence constraints:
  → Use PARALLEL_CHEAPEST_INSERTION
Else if problem has single-vehicle restrictions:
  → Use PATH_MOST_CONSTRAINED_ARC
Else:
  → Use PATH_CHEAPEST_ARC
```

---

## Implementation Notes

### Setting First Solution Strategy (Python Example)
```python
from ortools.constraint_solver import routing_enums_pb2

search_parameters = routing_enums_pb2.RoutingSearchParameters()
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
)
```

### Common Combinations with Local Search
```python
# Good performance combination
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC
)
search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
)

# Fast with quality
search_parameters.first_solution_strategy = (
    routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_ARC
)
search_parameters.local_search_metaheuristic = (
    routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
)
```

---

## Critical Considerations

### Known Limitations
1. **PARALLEL_CHEAPEST_INSERTION:** May fail with few vehicles (1-9) for 500+ orders; works better with 10+ vehicles
2. **GLOBAL_CHEAPEST_ARC:** Explicitly NOT RECOMMENDED; slower and less effective than alternatives
3. **Vehicle Count:** Number of available vehicles significantly impacts strategy effectiveness
4. **Constraint Tightness:** Tight capacity or time windows require constraint-aware strategies

### Testing Recommendations
- Test multiple strategies on your specific problem
- Measure both computation time and solution cost
- Combine different first solution strategies with different local search methods
- Use AUTOMATIC as baseline for comparison
- For production, empirically determine best combination for your problem class

### Problem-Dependent Performance
Solution quality varies significantly based on:
- Problem size (10 nodes vs 1000 nodes)
- Geographic distribution (clustered vs dispersed)
- Constraint tightness (loose vs tight capacity/time)
- Objective function (distance, time, cost, etc.)
- Vehicle diversity (homogeneous vs heterogeneous fleet)

---

## Summary Table: All 17 Strategies

| # | Value | Name | Category | Speed | Quality | Recommended |
|---|-------|------|----------|-------|---------|-------------|
| 1 | 0 | UNSET | - | - | - | No |
| 2 | 1 | GLOBAL_CHEAPEST_ARC | Variable | Fast | Poor | **NO** |
| 3 | 2 | LOCAL_CHEAPEST_ARC | Variable | Very Fast | Fair | Conditional |
| 4 | 3 | PATH_CHEAPEST_ARC | Path | Very Fast | Fair | **YES** |
| 5 | 4 | PATH_MOST_CONSTRAINED_ARC | Path | Fast | Good | **YES** |
| 6 | 5 | EVALUATOR_STRATEGY | Path | Medium | Custom | **YES** (Custom) |
| 7 | 6 | ALL_UNPERFORMED | Special | Very Fast | Poor | No |
| 8 | 7 | BEST_INSERTION | Insertion | Medium | Good | **YES** |
| 9 | 8 | PARALLEL_CHEAPEST_INSERTION | Insertion | Medium | Good | **YES** |
| 10 | 9 | LOCAL_CHEAPEST_INSERTION | Insertion | Fast | Fair | **YES** |
| 11 | 10 | SAVINGS | Path | Fast | Good | **YES** |
| 12 | 11 | SWEEP | Path | Very Fast | Good | **YES** |
| 13 | 12 | FIRST_UNBOUND_MIN_VALUE | Variable | Very Fast | Very Poor | No |
| 14 | 13 | CHRISTOFIDES | Path | Slow | Excellent | **YES** (Quality) |
| 15 | 14 | SEQUENTIAL_CHEAPEST_INSERTION | Insertion | Fast | Good | **YES** |
| 16 | 15 | AUTOMATIC | Auto | Medium | Good | **YES** (Default) |
| 17 | 16 | LOCAL_CHEAPEST_COST_INSERTION | Insertion | Medium | Good | **YES** |
| 18 | 17 | PARALLEL_SAVINGS | Path | Fast | Good | **YES** |

---

## Unresolved Questions / Research Gaps

1. **Computational Complexity Analysis:** Exact Big-O analysis for each strategy not fully documented in official OR-Tools docs
2. **Hybrid Strategies:** Performance of combining multiple first solution strategies not well documented
3. **Problem-Size Breakpoints:** Specific node count thresholds where strategies outperform each other not established
4. **Geographic vs Abstract:** How performance differs between Euclidean and general graph problems
5. **EVALUATOR_STRATEGY Documentation:** Limited official guidance on custom evaluator implementation patterns
6. **PARALLEL_CHEAPEST_INSERTION Vehicle Count:** Why exactly does it fail below 10 vehicles? Root cause not explained
7. **Constraint Type Performance:** Systematic comparison of each strategy against different constraint types (time windows, capacity, precedence, etc.)
8. **CHRISTOFIDES vs BEST_INSERTION:** When is the O(n³) cost of CHRISTOFIDES justified over BEST_INSERTION?

---

## References & Sources

1. [Google OR-Tools Official Documentation - Routing Overview](https://developers.google.com/optimization/routing)
2. [OR-Tools Routing Options](https://developers.google.com/optimization/routing/routing_options)
3. [OR-Tools Vehicle Routing Problem](https://developers.google.com/optimization/routing/vrp)
4. [GitHub OR-Tools routing_enums.proto](https://github.com/google/or-tools/blob/stable/ortools/constraint_solver/routing_enums.proto)
5. [GitHub OR-Tools routing_parameters.proto](https://github.com/google/or-tools/blob/stable/ortools/constraint_solver/routing_parameters.proto)
6. [Automatic Strategy Selection in Google OR Tools - Aniket Sharma](https://www.aniketsharma.net/articles/automatic_strategy_selection_in_or_tools/)
7. [Stack Overflow: PATH_CHEAPEST_ARC vs GLOBAL_CHEAPEST_ARC](https://stackoverflow.com/questions/74140310/or-tools-difference-between-path-cheapest-arc-and-global-cheapest-arc)
8. Clarke, G. and Wright, W., "Scheduling of Vehicles from a Central Depot to a Number of Delivery Points," Operations Research, Vol. 12, No. 4, pp. 568-581, 1964.
9. Wren, A. and Holliday, A., "Computer scheduling of vehicles from one or more depots to a number of delivery points," Operations Research Quarterly, Vol. 23, pp. 333-344, 1972.
10. Christofides, N., "Worst-case analysis of a new heuristic for the travelling salesman problem," Report 388, Graduate School of Industrial Administration, CMU, 1976.
11. [Sweep Algorithms for the Capacitated Vehicle Routing Problem - arXiv](https://arxiv.org/abs/1901.02771)
12. [OR-Tools GitHub Issues - Parallel Cheapest Insertion Issues](https://github.com/google/or-tools/issues/733)

---

## Document Information

- **Created:** November 26, 2025
- **Last Updated:** November 26, 2025
- **OR-Tools Version Reference:** Stable branch (as of research date)
- **Completeness:** All 17 FirstSolutionStrategy enum values documented
- **Status:** Ready for production reference

---

**End of Report**
