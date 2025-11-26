# OR-Tools First Solution Strategies - Code Examples

**Practical Python examples for implementing each FirstSolutionStrategy.**

---

## Basic Setup Template

```python
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def create_routing_model(distance_matrix):
    """Create routing model with distance callback."""
    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix),
        num_vehicles=1,
        starts=[0],
        ends=[0]
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        return distance_matrix[manager.IndexToNode(from_index)][
            manager.IndexToNode(to_index)
        ]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    return routing, manager
```

---

## Strategy 1: AUTOMATIC (Value: 15)

```python
def solve_with_automatic(routing, manager):
    """Use automatic strategy selection."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Prototyping, unknown problems, baseline testing
```

---

## Strategy 2: PATH_CHEAPEST_ARC (Value: 3)

```python
def solve_with_path_cheapest_arc(routing, manager):
    """Greedy path extension from current route endpoint."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 10

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Simple problems, baseline performance, fast solutions
# Time Complexity: O(n²)
# Best with: GUIDED_LOCAL_SEARCH or SIMULATED_ANNEALING
```

---

## Strategy 3: PATH_MOST_CONSTRAINED_ARC (Value: 4)

```python
def solve_with_path_most_constrained(routing, manager):
    """Path extension prioritizing constrained nodes."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 20

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Time windows, tight capacity, complex constraints
# Time Complexity: O(n³)
# Constraint awareness: High
```

---

## Strategy 4: EVALUATOR_STRATEGY (Value: 5)

```python
def solve_with_evaluator_strategy(routing, manager, custom_cost_function):
    """Use custom cost evaluator function."""

    # Register custom evaluator
    def custom_cost_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return custom_cost_function(from_node, to_node)

    custom_transit_index = routing.RegisterTransitCallback(
        custom_cost_callback
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.EVALUATOR_STRATEGY
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Example custom cost function:
def custom_cost_function(from_node, to_node):
    base_distance = distance_matrix[from_node][to_node]
    fuel_cost = base_distance * fuel_price
    toll_cost = calculate_toll(from_node, to_node)
    return int(fuel_cost + toll_cost)

# Recommended for: Domain-specific costs, hybrid objectives
```

---

## Strategy 5: SAVINGS (Value: 10)

```python
def solve_with_savings(routing, manager):
    """Clarke & Wright savings algorithm."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.SAVINGS
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 15

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Multi-vehicle routing, capacity constraints
# Time Complexity: O(n² log n)
# Best with: Multiple vehicles, capacity-constrained problems
```

---

## Strategy 6: SWEEP (Value: 11)

```python
def solve_with_sweep(routing, manager, node_coordinates):
    """Wren & Holliday sweep algorithm - geographic clustering."""
    import math

    # Calculate polar angles for each node from depot
    depot = node_coordinates[0]
    polar_angles = []

    for i, coord in enumerate(node_coordinates):
        angle = math.atan2(coord[1] - depot[1], coord[0] - depot[0])
        polar_angles.append(angle)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.SWEEP
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 10

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Geographic areas, spatial clustering, large problems
# Time Complexity: O(n log n)
# Spatial clustering: Excellent
```

---

## Strategy 7: CHRISTOFIDES (Value: 13)

```python
def solve_with_christofides(routing, manager):
    """Christofides algorithm with maximal matching."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.SIMULATED_ANNEALING
    )
    search_parameters.time_limit.seconds = 60  # Longer computation

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: High-quality solutions, small-medium problems
# Time Complexity: O(n³)
# Solution Quality: Excellent
# Warning: Much slower than other strategies
```

---

## Strategy 8: BEST_INSERTION (Value: 7)

```python
def solve_with_best_insertion(routing, manager):
    """Global cheapest insertion - optimal position search."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.BEST_INSERTION
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 20

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Quality-focused problems, medium size
# Time Complexity: O(n³)
# Quality vs Speed: Good balance
```

---

## Strategy 9: PARALLEL_CHEAPEST_INSERTION (Value: 8)

```python
def solve_with_parallel_cheapest_insertion(routing, manager):
    """Multi-route insertion, faster than BEST_INSERTION."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Pickup/delivery, node precedence, multiple vehicles
# Time Complexity: O(n²)
# Note: Works better with 10+ vehicles (may fail with fewer)
```

---

## Strategy 10: LOCAL_CHEAPEST_INSERTION (Value: 9)

```python
def solve_with_local_cheapest_insertion(routing, manager):
    """Sequential insertion in node creation order."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Large problems (1000+ nodes), sequential delivery
# Time Complexity: O(n²)
# Speed: Fast
# Warning: Order-dependent results
```

---

## Strategy 11: GLOBAL_CHEAPEST_ARC (Value: 1) - NOT RECOMMENDED

```python
def solve_with_global_cheapest_arc(routing, manager):
    """Greedy global arc selection."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# ❌ NOT RECOMMENDED - OR-Tools developers advise against this
# Why: Slower and less effective than PATH_CHEAPEST_ARC
# Use PATH_CHEAPEST_ARC, SAVINGS, or insertion instead
```

---

## Strategy 12: LOCAL_CHEAPEST_ARC (Value: 2)

```python
def solve_with_local_cheapest_arc(routing, manager):
    """First unbound node to cheapest available node."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# Recommended for: Fast solutions with strong local search
# Time Complexity: O(n²)
# Best with: GUIDED_LOCAL_SEARCH (30+ seconds)
# Performance: Good quality/speed balance when combined with local search
```

---

## Strategy 13: FIRST_UNBOUND_MIN_VALUE (Value: 12) - NOT RECOMMENDED

```python
def solve_with_first_unbound_min_value(routing, manager):
    """First unbound node to first available node."""
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.FIRST_UNBOUND_MIN_VALUE
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 60  # Needs strong local search

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    return solution

# ❌ NOT RECOMMENDED - Very poor solution quality
# Why: No cost optimization, creates arbitrary routes
# Only use for: Feasibility testing, constraint validation
```

---

## Strategy Comparison: Benchmark Function

```python
def benchmark_all_strategies(routing, manager, time_limit=30):
    """Compare all recommended strategies."""

    strategies = {
        'AUTOMATIC': routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC,
        'PATH_CHEAPEST_ARC': routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC,
        'PATH_MOST_CONSTRAINED_ARC': routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC,
        'SAVINGS': routing_enums_pb2.FirstSolutionStrategy.SAVINGS,
        'SWEEP': routing_enums_pb2.FirstSolutionStrategy.SWEEP,
        'CHRISTOFIDES': routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES,
        'BEST_INSERTION': routing_enums_pb2.FirstSolutionStrategy.BEST_INSERTION,
        'PARALLEL_CHEAPEST_INSERTION': routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION,
        'LOCAL_CHEAPEST_INSERTION': routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION,
        'LOCAL_CHEAPEST_ARC': routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_ARC,
    }

    results = {}

    for strategy_name, strategy_value in strategies.items():
        try:
            search_parameters = pywrapcp.DefaultRoutingSearchParameters()
            search_parameters.first_solution_strategy = strategy_value
            search_parameters.local_search_metaheuristic = (
                routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
            )
            search_parameters.time_limit.seconds = time_limit

            solution = routing.SolveFromAssignmentWithParameters(
                routing.ReadAssignmentFromRoutes([]), search_parameters
            )

            results[strategy_name] = {
                'status': solution.status(),
                'objective': routing.GetStatus() and solution.ObjectiveValue() or None,
                'time': search_parameters.time_limit.seconds,
            }

            print(f"{strategy_name:30} → Cost: {results[strategy_name]['objective']}")

        except Exception as e:
            results[strategy_name] = {'error': str(e)}
            print(f"{strategy_name:30} → ERROR: {e}")

    # Find best solution
    valid_results = {k: v for k, v in results.items()
                    if 'objective' in v and v['objective']}
    if valid_results:
        best = min(valid_results.items(),
                  key=lambda x: x[1]['objective'])
        print(f"\nBest Strategy: {best[0]} (Cost: {best[1]['objective']})")

    return results
```

---

## Production Configuration Example

```python
def create_optimized_routing_solution(distance_matrix, num_vehicles,
                                     problem_type='general'):
    """Create routing solution with optimized strategy selection."""

    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix),
        num_vehicles=num_vehicles,
        starts=[0] * num_vehicles,
        ends=[0] * num_vehicles
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        return distance_matrix[manager.IndexToNode(from_index)][
            manager.IndexToNode(to_index)
        ]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Strategy selection based on problem type
    if problem_type == 'simple':
        first_solution = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        time_limit = 10
    elif problem_type == 'complex':
        first_solution = routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC
        time_limit = 30
    elif problem_type == 'quality_focused':
        first_solution = routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES
        time_limit = 60
    else:  # default
        first_solution = routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC
        time_limit = 30

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = first_solution
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = time_limit

    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )

    return routing, manager, solution
```

---

## Enum Value Helper

```python
def get_strategy_name(strategy_value):
    """Get human-readable strategy name from enum value."""
    strategy_names = {
        1: 'GLOBAL_CHEAPEST_ARC',
        2: 'LOCAL_CHEAPEST_ARC',
        3: 'PATH_CHEAPEST_ARC',
        4: 'PATH_MOST_CONSTRAINED_ARC',
        5: 'EVALUATOR_STRATEGY',
        6: 'ALL_UNPERFORMED',
        7: 'BEST_INSERTION',
        8: 'PARALLEL_CHEAPEST_INSERTION',
        9: 'LOCAL_CHEAPEST_INSERTION',
        10: 'SAVINGS',
        11: 'SWEEP',
        12: 'FIRST_UNBOUND_MIN_VALUE',
        13: 'CHRISTOFIDES',
        14: 'SEQUENTIAL_CHEAPEST_INSERTION',
        15: 'AUTOMATIC',
        16: 'LOCAL_CHEAPEST_COST_INSERTION',
        17: 'PARALLEL_SAVINGS',
    }
    return strategy_names.get(strategy_value, 'UNKNOWN')

# Usage
print(get_strategy_name(3))  # → PATH_CHEAPEST_ARC
```

---

## Testing Framework

```python
def test_strategy_on_problem(distance_matrix, num_vehicles, strategy_value):
    """Test single strategy on problem."""
    import time

    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix), num_vehicles, [0] * num_vehicles, [0] * num_vehicles
    )
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        return distance_matrix[manager.IndexToNode(from_index)][
            manager.IndexToNode(to_index)
        ]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = strategy_value
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 30

    start_time = time.time()
    solution = routing.SolveFromAssignmentWithParameters(
        routing.ReadAssignmentFromRoutes([]), search_parameters
    )
    elapsed = time.time() - start_time

    strategy_name = get_strategy_name(strategy_value)

    return {
        'strategy': strategy_name,
        'objective': solution.ObjectiveValue() if solution else None,
        'time': elapsed,
        'status': solution.status() if solution else None,
    }

# Run test
result = test_strategy_on_problem(distance_matrix, num_vehicles=3,
                                 strategy_value=3)
print(f"Strategy: {result['strategy']}")
print(f"Cost: {result['objective']}")
print(f"Time: {result['time']:.2f}s")
```

---

**Last Updated:** November 26, 2025
