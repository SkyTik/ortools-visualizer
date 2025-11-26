import type { Strategy } from '../types';

export const strategies: Record<string, Strategy> = {
  PATH_CHEAPEST_ARC: {
    id: 'PATH_CHEAPEST_ARC',
    name: 'Path Cheapest Arc',
    shortDesc: 'Greedy nearest neighbor - always go to closest unvisited node',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Nearest_neighbour_algorithm',
    pseudocode: `function pathCheapestArc(nodes, depot):
    route = [depot]
    current = depot
    unvisited = nodes - {depot}

    while unvisited is not empty:
        # Find nearest unvisited node
        nearest = argmin(distance(current, n) for n in unvisited)
        route.append(nearest)
        unvisited.remove(nearest)
        current = nearest

    route.append(depot)  # Return to depot
    return route`,
  },

  GLOBAL_CHEAPEST_ARC: {
    id: 'GLOBAL_CHEAPEST_ARC',
    name: 'Global Cheapest Arc',
    shortDesc: 'Build route by always adding globally shortest edge',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Greedy_algorithm',
    warning: 'Not recommended by OR-Tools developers - included for educational comparison only',
    pseudocode: `function globalCheapestArc(nodes, depot):
    edges = []
    degree = {n: 0 for n in nodes}

    # Sort all possible edges by distance
    all_edges = sorted([(i,j,dist) for i,j in pairs(nodes)])

    for (i, j, dist) in all_edges:
        # Add edge if it doesn't create cycle (except final)
        # and both nodes have degree < 2
        if valid_to_add(i, j, edges, degree):
            edges.append((i, j))
            degree[i] += 1
            degree[j] += 1

    return construct_route(edges, depot)`,
  },

  LOCAL_CHEAPEST_INSERTION: {
    id: 'LOCAL_CHEAPEST_INSERTION',
    name: 'Local Cheapest Insertion',
    shortDesc: 'Insert each node where it causes minimum route cost increase',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Travelling_salesman_problem#Constructive_heuristics',
    pseudocode: `function localCheapestInsertion(nodes, depot):
    # Start with depot -> nearest -> depot
    route = [depot, nearest_to_depot, depot]
    unvisited = nodes - route

    while unvisited is not empty:
        best_node = None
        best_position = None
        best_cost = infinity

        for node in unvisited:
            # Find best position to insert this node
            for i in range(1, len(route)):
                cost = insertion_cost(route, i, node)
                if cost < best_cost:
                    best_cost = cost
                    best_node = node
                    best_position = i

        route.insert(best_position, best_node)
        unvisited.remove(best_node)

    return route`,
  },

  BEST_INSERTION: {
    id: 'BEST_INSERTION',
    name: 'Best Insertion',
    shortDesc: 'Insert node with globally minimum insertion cost at each step',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Travelling_salesman_problem#Constructive_heuristics',
    pseudocode: `function bestInsertion(nodes, depot):
    # Start with depot -> nearest -> depot
    route = [depot, nearest_to_depot, depot]
    unvisited = nodes - route

    while unvisited is not empty:
        best_node = None
        best_position = None
        best_cost = infinity

        # Find globally optimal (node, position) pair
        for node in unvisited:
            for i in range(1, len(route)):
                cost = insertion_cost(route, i, node)
                if cost < best_cost:
                    best_cost = cost
                    best_node = node
                    best_position = i

        route.insert(best_position, best_node)
        unvisited.remove(best_node)

    return route

# Key: Evaluates ALL nodes × ALL positions
# Picks globally optimal insertion each step`,
  },

  PARALLEL_CHEAPEST_INSERTION: {
    id: 'PARALLEL_CHEAPEST_INSERTION',
    name: 'Parallel Cheapest Insertion',
    shortDesc: 'Select node closest to route, then insert at cheapest position',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Travelling_salesman_problem#Constructive_heuristics',
    pseudocode: `function parallelCheapestInsertion(nodes, depot):
    # Start with depot -> nearest -> depot
    route = [depot, nearest_to_depot, depot]
    unvisited = nodes - route

    while unvisited is not empty:
        # Step 1: Find node closest to ANY node in route
        best_node = argmin(
            min(dist(node, r) for r in route)
            for node in unvisited
        )

        # Step 2: Find cheapest position for this node
        best_pos = argmin(
            insertion_cost(route, i, best_node)
            for i in range(1, len(route))
        )

        route.insert(best_pos, best_node)
        unvisited.remove(best_node)

    return route

# Faster than BEST_INSERTION: O(n²) vs O(n³)`,
  },

  LOCAL_CHEAPEST_ARC: {
    id: 'LOCAL_CHEAPEST_ARC',
    name: 'Local Cheapest Arc',
    shortDesc: 'Find globally cheapest arc from visited to unvisited nodes',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Nearest_neighbour_algorithm',
    pseudocode: `function localCheapestArc(nodes, depot):
    route = [depot]
    visited = {depot}
    unvisited = nodes - {depot}

    while unvisited is not empty:
        # Find cheapest arc from ANY visited to ANY unvisited
        (best_from, best_to) = argmin(
            distance(v, u)
            for v in visited
            for u in unvisited
        )
        # Insert best_to after best_from in route
        insert_after(route, best_from, best_to)
        visited.add(best_to)
        unvisited.remove(best_to)

    route.append(depot)  # Return to depot
    return route

# Different from PATH_CHEAPEST_ARC:
# PATH extends only from route END
# LOCAL can branch from ANY visited node`,
  },

  SAVINGS: {
    id: 'SAVINGS',
    name: 'Savings (Clarke-Wright)',
    shortDesc: 'Merge routes based on distance savings calculation',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Clarke%E2%80%93Wright_algorithm',
    pseudocode: `function savings(nodes, depot):
    # Calculate savings for each pair
    # s(i,j) = d(depot,i) + d(depot,j) - d(i,j)
    savings = []
    for i, j in pairs(nodes - {depot}):
        s = dist(depot,i) + dist(depot,j) - dist(i,j)
        savings.append((s, i, j))

    # Sort by savings (descending)
    savings.sort(reverse=True)

    # Initialize: each node is own route
    routes = [[depot, n, depot] for n in nodes if n != depot]

    # Merge routes with highest savings
    for (s, i, j) in savings:
        if can_merge(routes, i, j):
            merge_routes(routes, i, j)

    return routes[0]  # Single TSP route`,
  },

  CHRISTOFIDES: {
    id: 'CHRISTOFIDES',
    name: 'Christofides',
    shortDesc: 'MST-based algorithm inspired by Christofides (simplified greedy matching)',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Christofides_algorithm',
    pseudocode: `function christofides(nodes):
    # Step 1: Build Minimum Spanning Tree
    mst = prim_mst(nodes)

    # Step 2: Find odd-degree vertices
    odd_vertices = [v for v in nodes if degree(v, mst) % 2 == 1]

    # Step 3: Minimum weight perfect matching on odd vertices
    matching = min_weight_matching(odd_vertices)

    # Step 4: Combine MST and matching (multigraph)
    multigraph = mst + matching

    # Step 5: Find Eulerian circuit
    euler_circuit = find_eulerian_circuit(multigraph)

    # Step 6: Convert to Hamiltonian (skip repeated)
    route = shortcut_to_hamiltonian(euler_circuit)

    return route`,
  },

  FIRST_UNBOUND_MIN_VALUE: {
    id: 'FIRST_UNBOUND_MIN_VALUE',
    name: 'First Unbound Min Value',
    shortDesc: 'Simple sequential assignment by node index',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Travelling_salesman_problem',
    warning: 'Very poor solution quality - use only as baseline comparison',
    pseudocode: `function firstUnboundMinValue(nodes, depot):
    route = [depot]
    unvisited = sorted(nodes - {depot})  # Sort by id

    # Simply visit nodes in order of their index
    for node in unvisited:
        route.append(node)

    route.append(depot)  # Return to depot
    return route

# Note: This is the simplest baseline strategy
# It ignores distances entirely and just visits
# nodes in index order: 0 -> 1 -> 2 -> ... -> n -> 0`,
  },

  SWEEP: {
    id: 'SWEEP',
    name: 'Sweep',
    shortDesc: 'Sort nodes by angle from depot, visit in angular order',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Sweep_line_algorithm',
    pseudocode: `function sweep(nodes, depot):
    # Calculate angle from depot for each node
    angles = {}
    for node in nodes - {depot}:
        dx = node.x - depot.x
        dy = node.y - depot.y
        angles[node] = atan2(dy, dx)

    # Sort nodes by angle (sweep clockwise or counter-clockwise)
    sorted_nodes = sorted(nodes - {depot}, key=lambda n: angles[n])

    # Build route in angular order
    route = [depot]
    for node in sorted_nodes:
        route.append(node)
    route.append(depot)

    return route`,
  },
};

export const strategyOrder = [
  'PATH_CHEAPEST_ARC',
  'GLOBAL_CHEAPEST_ARC',
  'LOCAL_CHEAPEST_ARC',
  'LOCAL_CHEAPEST_INSERTION',
  'BEST_INSERTION',
  'PARALLEL_CHEAPEST_INSERTION',
  'SAVINGS',
  'CHRISTOFIDES',
  'FIRST_UNBOUND_MIN_VALUE',
  'SWEEP',
];

export function getStrategy(id: string): Strategy {
  const strategy = strategies[id];
  if (!strategy) {
    throw new Error(`Unknown strategy: ${id}`);
  }
  return strategy;
}
