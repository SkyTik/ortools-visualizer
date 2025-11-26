#!/usr/bin/env python3
"""
Generate pre-computed TSP solutions for all strategies and location counts.

This script implements 7 TSP first solution strategies and records each step
for visualization in the React demo.

Strategies:
1. PATH_CHEAPEST_ARC - Greedy nearest neighbor
2. GLOBAL_CHEAPEST_ARC - Build route by shortest edges globally
3. LOCAL_CHEAPEST_INSERTION - Insert nodes at minimum cost position
4. SAVINGS - Clarke-Wright savings algorithm
5. CHRISTOFIDES - MST + minimum matching (simplified)
6. FIRST_UNBOUND_MIN_VALUE - Sequential by index
7. SWEEP - Angular sweep from depot

Output: JSON files in src/data/solutions/{locationCount}/{strategy}.json
"""

import json
import math
import os
from dataclasses import dataclass, asdict
from typing import Optional
from pathlib import Path


@dataclass
class Location:
    id: int
    x: int
    y: int
    label: str
    is_depot: bool = False


@dataclass
class Edge:
    from_node: int  # 'from' is reserved in Python
    to: int


@dataclass
class Candidate:
    node: int
    distance: int
    selected: bool


@dataclass
class Step:
    step: int
    edges: list[dict]
    current_node: int
    highlight_edge: Optional[dict]
    candidates: Optional[list[dict]]
    explanation: str
    total_distance: int


@dataclass
class Solution:
    strategy: str
    location_count: int
    steps: list[dict]
    final_route: list[int]
    final_distance: int


# Fixed locations matching src/data/locations.ts
LOCATIONS = [
    Location(0, 250, 250, "Depot", True),
    Location(1, 100, 100, "A"),
    Location(2, 400, 80, "B"),
    Location(3, 450, 300, "C"),
    Location(4, 380, 450, "D"),
    Location(5, 150, 420, "E"),
    Location(6, 80, 280, "F"),
    Location(7, 200, 180, "G"),
    Location(8, 320, 200, "H"),
    Location(9, 280, 380, "I"),
]


def calculate_distance(loc1: Location, loc2: Location) -> int:
    """Calculate Euclidean distance between two locations."""
    dx = loc1.x - loc2.x
    dy = loc1.y - loc2.y
    return round(math.sqrt(dx * dx + dy * dy))


def generate_distance_matrix(locations: list[Location]) -> list[list[int]]:
    """Generate distance matrix for given locations."""
    n = len(locations)
    matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            matrix[i][j] = calculate_distance(locations[i], locations[j])
    return matrix


def calculate_route_distance(route: list[int], dist_matrix: list[list[int]]) -> int:
    """Calculate total distance of a route."""
    total = 0
    for i in range(len(route) - 1):
        total += dist_matrix[route[i]][route[i + 1]]
    return total


def edge_dict(from_node: int, to_node: int) -> dict:
    """Create edge dictionary for JSON serialization."""
    return {"from": from_node, "to": to_node}


def candidate_dict(node: int, distance: int, selected: bool) -> dict:
    """Create candidate dictionary for JSON serialization."""
    return {"node": node, "distance": distance, "selected": selected}


def step_dict(
    step: int,
    edges: list[dict],
    current_node: int,
    explanation: str,
    total_distance: int,
    highlight_edge: Optional[dict] = None,
    candidates: Optional[list[dict]] = None,
    is_final: bool = False,
) -> dict:
    """Create step dictionary for JSON serialization."""
    result = {
        "step": step,
        "edges": edges,
        "currentNode": current_node,
        "highlightEdge": highlight_edge,
        "candidates": candidates,
        "explanation": explanation,
        "totalDistance": total_distance,
    }
    if is_final:
        result["isFinal"] = True
    return result


def create_final_step(
    step_num: int,
    route: list[int],
    locations: list[Location],
    dist_matrix: list[list[int]],
) -> dict:
    """Create the final solution summary step."""
    # Build edges from the final route
    edges = [edge_dict(route[i], route[i + 1]) for i in range(len(route) - 1)]
    total_distance = calculate_route_distance(route, dist_matrix)

    # Build route description: Depot → A → B → C → ... → Depot
    route_labels = [locations[node].label for node in route]
    route_str = " → ".join(route_labels)

    return step_dict(
        step=step_num,
        edges=edges,
        current_node=0,
        explanation=f"Final Route: {route_str} | Total: {total_distance} units",
        total_distance=total_distance,
        is_final=True,
    )


# =============================================================================
# STRATEGY IMPLEMENTATIONS
# =============================================================================


def path_cheapest_arc(locations: list[Location], dist_matrix: list[list[int]]) -> Solution:
    """
    PATH_CHEAPEST_ARC: Greedy nearest neighbor.
    Always go to the nearest unvisited node from current position.
    """
    n = len(locations)
    steps = []
    edges = []
    route = [0]  # Start at depot
    visited = {0}
    current = 0
    total_distance = 0

    # Initial step
    steps.append(
        step_dict(
            step=0,
            edges=[],
            current_node=0,
            explanation="Start at Depot (node 0)",
            total_distance=0,
        )
    )

    step_num = 1
    while len(visited) < n:
        # Find candidates (unvisited nodes)
        candidates = []
        nearest = None
        nearest_dist = float("inf")

        for i in range(n):
            if i not in visited:
                dist = dist_matrix[current][i]
                is_nearest = dist < nearest_dist
                if is_nearest:
                    nearest_dist = dist
                    nearest = i
                candidates.append(candidate_dict(i, dist, False))

        # Mark the selected one
        for c in candidates:
            if c["node"] == nearest:
                c["selected"] = True

        # Sort candidates by distance
        candidates.sort(key=lambda x: x["distance"])

        # Add edge and update state
        new_edge = edge_dict(current, nearest)
        edges.append(new_edge)
        route.append(nearest)
        visited.add(nearest)
        total_distance += nearest_dist

        steps.append(
            step_dict(
                step=step_num,
                edges=list(edges),
                current_node=nearest,
                explanation=f"From {locations[current].label}, go to nearest: {locations[nearest].label} ({nearest_dist} units)",
                total_distance=total_distance,
                highlight_edge=new_edge,
                candidates=candidates,
            )
        )

        current = nearest
        step_num += 1

    # Return to depot
    return_dist = dist_matrix[current][0]
    return_edge = edge_dict(current, 0)
    edges.append(return_edge)
    route.append(0)
    total_distance += return_dist

    steps.append(
        step_dict(
            step=step_num,
            edges=list(edges),
            current_node=0,
            explanation=f"Return to Depot from {locations[current].label} ({return_dist} units). Tour complete!",
            total_distance=total_distance,
            highlight_edge=return_edge,
        )
    )
    step_num += 1

    # Add final solution step
    steps.append(create_final_step(step_num, route, locations, dist_matrix))

    return Solution(
        strategy="PATH_CHEAPEST_ARC",
        location_count=n,
        steps=steps,
        final_route=route,
        final_distance=total_distance,
    )


def global_cheapest_arc(locations: list[Location], dist_matrix: list[list[int]]) -> Solution:
    """
    GLOBAL_CHEAPEST_ARC: Build route by always adding the globally shortest edge.
    Constraint: no node can have degree > 2, no premature cycles.
    """
    n = len(locations)
    steps = []

    # Generate all possible edges sorted by distance
    all_edges = []
    for i in range(n):
        for j in range(i + 1, n):
            all_edges.append((dist_matrix[i][j], i, j))
    all_edges.sort()

    # Initial step
    steps.append(
        step_dict(
            step=0,
            edges=[],
            current_node=0,
            explanation=f"Start: {len(all_edges)} possible edges sorted by distance",
            total_distance=0,
        )
    )

    selected_edges = []
    degree = [0] * n
    adj = [[] for _ in range(n)]
    total_distance = 0
    step_num = 1

    def would_create_premature_cycle(i: int, j: int) -> bool:
        """Check if adding edge (i,j) would create a cycle before tour is complete."""
        if degree[i] == 0 or degree[j] == 0:
            return False
        # BFS to check if i and j are already connected
        visited = {i}
        queue = [i]
        while queue:
            node = queue.pop(0)
            for neighbor in adj[node]:
                if neighbor == j:
                    # Only a problem if we don't have n edges yet
                    return len(selected_edges) < n
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return False

    for dist, i, j in all_edges:
        if len(selected_edges) >= n:
            break

        # Check constraints
        if degree[i] >= 2 or degree[j] >= 2:
            continue
        if would_create_premature_cycle(i, j):
            continue

        # Add edge
        new_edge = edge_dict(i, j)
        selected_edges.append(new_edge)
        degree[i] += 1
        degree[j] += 1
        adj[i].append(j)
        adj[j].append(i)
        total_distance += dist

        # Show candidates (top few unused edges)
        candidates = []
        for d, a, b in all_edges:
            if edge_dict(a, b) not in selected_edges and edge_dict(b, a) not in selected_edges:
                if len(candidates) < 5:
                    is_selected = (a == i and b == j) or (a == j and b == i)
                    candidates.append(candidate_dict(b if a == i else (a if b == i else b), d, is_selected))

        steps.append(
            step_dict(
                step=step_num,
                edges=list(selected_edges),
                current_node=j,
                explanation=f"Add globally shortest valid edge: {locations[i].label}-{locations[j].label} ({dist} units)",
                total_distance=total_distance,
                highlight_edge=new_edge,
            )
        )
        step_num += 1

    # Construct route from edges
    route = [0]
    current = 0
    visited = {0}
    while len(route) <= n:
        for neighbor in adj[current]:
            if neighbor not in visited or (len(route) == n and neighbor == 0):
                route.append(neighbor)
                visited.add(neighbor)
                current = neighbor
                break
        else:
            break

    if route[-1] != 0:
        route.append(0)

    # Final step
    steps.append(
        step_dict(
            step=step_num,
            edges=selected_edges,
            current_node=0,
            explanation=f"Tour complete! Total distance: {total_distance} units",
            total_distance=total_distance,
        )
    )
    step_num += 1

    # Add final solution step
    steps.append(create_final_step(step_num, route, locations, dist_matrix))

    return Solution(
        strategy="GLOBAL_CHEAPEST_ARC",
        location_count=n,
        steps=steps,
        final_route=route,
        final_distance=total_distance,
    )


def local_cheapest_insertion(locations: list[Location], dist_matrix: list[list[int]]) -> Solution:
    """
    LOCAL_CHEAPEST_INSERTION: Start with depot + nearest node, then insert
    remaining nodes where they cause minimum cost increase.
    """
    n = len(locations)
    steps = []

    # Find nearest node to depot
    nearest = min(range(1, n), key=lambda x: dist_matrix[0][x])
    nearest_dist = dist_matrix[0][nearest]

    # Initial route: depot -> nearest -> depot
    route = [0, nearest, 0]
    unvisited = set(range(1, n)) - {nearest}
    total_distance = 2 * nearest_dist

    # Build initial edges
    edges = [edge_dict(0, nearest), edge_dict(nearest, 0)]

    steps.append(
        step_dict(
            step=0,
            edges=[],
            current_node=0,
            explanation="Start at Depot",
            total_distance=0,
        )
    )

    steps.append(
        step_dict(
            step=1,
            edges=list(edges),
            current_node=nearest,
            explanation=f"Create initial tour: Depot → {locations[nearest].label} → Depot",
            total_distance=total_distance,
            highlight_edge=edge_dict(0, nearest),
        )
    )

    step_num = 2
    while unvisited:
        best_node = None
        best_pos = None
        best_cost = float("inf")
        all_candidates = []

        for node in unvisited:
            # Find best position to insert this node
            for i in range(1, len(route)):
                prev, next_node = route[i - 1], route[i]
                # Cost = new edges - removed edge
                cost = (
                    dist_matrix[prev][node]
                    + dist_matrix[node][next_node]
                    - dist_matrix[prev][next_node]
                )
                if cost < best_cost:
                    best_cost = cost
                    best_node = node
                    best_pos = i

            # Record best insertion cost for this node
            min_cost_for_node = float("inf")
            for i in range(1, len(route)):
                prev, next_node = route[i - 1], route[i]
                cost = (
                    dist_matrix[prev][node]
                    + dist_matrix[node][next_node]
                    - dist_matrix[prev][next_node]
                )
                min_cost_for_node = min(min_cost_for_node, cost)
            all_candidates.append((node, min_cost_for_node))

        # Sort candidates by cost
        all_candidates.sort(key=lambda x: x[1])
        candidates = [
            candidate_dict(node, cost, node == best_node)
            for node, cost in all_candidates[:5]
        ]

        # Insert the best node
        route.insert(best_pos, best_node)
        unvisited.remove(best_node)
        total_distance += best_cost

        # Rebuild edges from route
        edges = [edge_dict(route[i], route[i + 1]) for i in range(len(route) - 1)]
        highlight = edge_dict(route[best_pos - 1], best_node)

        prev_label = locations[route[best_pos - 1]].label
        next_label = locations[route[best_pos + 1]].label

        steps.append(
            step_dict(
                step=step_num,
                edges=list(edges),
                current_node=best_node,
                explanation=f"Insert {locations[best_node].label} between {prev_label} and {next_label} (cost +{best_cost})",
                total_distance=total_distance,
                highlight_edge=highlight,
                candidates=candidates,
            )
        )
        step_num += 1

    # Final step
    steps.append(
        step_dict(
            step=step_num,
            edges=edges,
            current_node=0,
            explanation=f"Tour complete! Total distance: {total_distance} units",
            total_distance=total_distance,
        )
    )
    step_num += 1

    # Add final solution step
    steps.append(create_final_step(step_num, route, locations, dist_matrix))

    return Solution(
        strategy="LOCAL_CHEAPEST_INSERTION",
        location_count=n,
        steps=steps,
        final_route=route,
        final_distance=total_distance,
    )


def savings_algorithm(locations: list[Location], dist_matrix: list[list[int]]) -> Solution:
    """
    SAVINGS (Clarke-Wright): Calculate savings for merging routes,
    then merge in order of savings.
    """
    n = len(locations)
    steps = []

    # Calculate savings for all pairs (excluding depot)
    savings_list = []
    for i in range(1, n):
        for j in range(i + 1, n):
            saving = dist_matrix[0][i] + dist_matrix[0][j] - dist_matrix[i][j]
            savings_list.append((saving, i, j))
    savings_list.sort(reverse=True)

    # Initial: each customer is its own route (depot -> customer -> depot)
    # We'll merge these into a single TSP tour
    route_of = {i: i for i in range(1, n)}  # Which route each node belongs to
    routes = {i: [0, i, 0] for i in range(1, n)}  # Route for each "route id"

    # Build initial edges (star from depot)
    edges = []
    for i in range(1, n):
        edges.append(edge_dict(0, i))
        edges.append(edge_dict(i, 0))

    total_distance = sum(2 * dist_matrix[0][i] for i in range(1, n))

    steps.append(
        step_dict(
            step=0,
            edges=[],
            current_node=0,
            explanation="Calculate savings: s(i,j) = d(0,i) + d(0,j) - d(i,j)",
            total_distance=0,
        )
    )

    steps.append(
        step_dict(
            step=1,
            edges=list(edges),
            current_node=0,
            explanation=f"Initial: {n-1} separate routes from depot to each node",
            total_distance=total_distance,
        )
    )

    step_num = 2
    for saving, i, j in savings_list:
        if saving <= 0:
            continue

        route_i = route_of[i]
        route_j = route_of[j]

        if route_i == route_j:
            continue  # Already in same route

        ri = routes[route_i]
        rj = routes[route_j]

        # Check if i and j are at the ends of their routes (adjacent to depot)
        i_at_end = ri[1] == i or ri[-2] == i
        j_at_end = rj[1] == j or rj[-2] == j

        if not (i_at_end and j_at_end):
            continue

        # Merge routes
        # Remove depot connections and connect i to j
        if ri[-2] == i:
            ri = ri[:-1]  # Remove last depot
        else:
            ri = ri[::-1][:-1]  # Reverse and remove depot

        if rj[1] == j:
            rj = rj[1:]  # Remove first depot
        else:
            rj = rj[::-1][1:]  # Reverse and remove depot

        new_route = ri + rj
        new_route_id = route_i

        # Update route assignments
        for node in new_route:
            if node != 0:
                route_of[node] = new_route_id
        routes[new_route_id] = new_route
        del routes[route_j]

        # Calculate new total distance
        total_distance -= saving

        # Rebuild edges
        edges = []
        for r in routes.values():
            for k in range(len(r) - 1):
                edges.append(edge_dict(r[k], r[k + 1]))

        candidates = [candidate_dict(j, saving, True)]

        steps.append(
            step_dict(
                step=step_num,
                edges=list(edges),
                current_node=j,
                explanation=f"Merge: {locations[i].label}-{locations[j].label} saves {saving} units",
                total_distance=total_distance,
                highlight_edge=edge_dict(i, j),
                candidates=candidates,
            )
        )
        step_num += 1

        if len(routes) == 1:
            break

    # Get final route
    final_route = list(routes.values())[0]
    if final_route[0] != 0:
        # Rotate to start at depot
        depot_idx = final_route.index(0)
        final_route = final_route[depot_idx:] + final_route[1:depot_idx + 1]
    if final_route[-1] != 0:
        final_route.append(0)

    final_distance = calculate_route_distance(final_route, dist_matrix)

    steps.append(
        step_dict(
            step=step_num,
            edges=edges,
            current_node=0,
            explanation=f"Tour complete! Total distance: {final_distance} units",
            total_distance=final_distance,
        )
    )
    step_num += 1

    # Add final solution step
    steps.append(create_final_step(step_num, final_route, locations, dist_matrix))

    return Solution(
        strategy="SAVINGS",
        location_count=n,
        steps=steps,
        final_route=final_route,
        final_distance=final_distance,
    )


def christofides(locations: list[Location], dist_matrix: list[list[int]]) -> Solution:
    """
    CHRISTOFIDES: Simplified implementation.
    1. Build MST (Prim's)
    2. Find odd-degree vertices
    3. Minimum weight matching on odd vertices
    4. Combine to get Eulerian graph
    5. Find Eulerian circuit and shortcut to Hamiltonian

    Note: This is a simplified version for demonstration.
    """
    n = len(locations)
    steps = []

    # Step 1: Build MST using Prim's algorithm
    in_mst = [False] * n
    mst_edges = []
    in_mst[0] = True
    total_mst = 0

    steps.append(
        step_dict(
            step=0,
            edges=[],
            current_node=0,
            explanation="Step 1: Build Minimum Spanning Tree (MST) using Prim's algorithm",
            total_distance=0,
        )
    )

    step_num = 1
    while len(mst_edges) < n - 1:
        best_edge = None
        best_dist = float("inf")

        for i in range(n):
            if not in_mst[i]:
                continue
            for j in range(n):
                if in_mst[j]:
                    continue
                if dist_matrix[i][j] < best_dist:
                    best_dist = dist_matrix[i][j]
                    best_edge = (i, j)

        if best_edge:
            i, j = best_edge
            mst_edges.append(edge_dict(i, j))
            in_mst[j] = True
            total_mst += best_dist

            steps.append(
                step_dict(
                    step=step_num,
                    edges=list(mst_edges),
                    current_node=j,
                    explanation=f"MST: Add edge {locations[i].label}-{locations[j].label} ({best_dist} units)",
                    total_distance=total_mst,
                    highlight_edge=edge_dict(i, j),
                )
            )
            step_num += 1

    # Calculate degree of each vertex in MST
    degree = [0] * n
    adj = [[] for _ in range(n)]
    for e in mst_edges:
        degree[e["from"]] += 1
        degree[e["to"]] += 1
        adj[e["from"]].append(e["to"])
        adj[e["to"]].append(e["from"])

    # Step 2: Find odd-degree vertices
    odd_vertices = [i for i in range(n) if degree[i] % 2 == 1]

    steps.append(
        step_dict(
            step=step_num,
            edges=list(mst_edges),
            current_node=odd_vertices[0] if odd_vertices else 0,
            explanation=f"Step 2: Find odd-degree vertices: {[locations[v].label for v in odd_vertices]}",
            total_distance=total_mst,
        )
    )
    step_num += 1

    # Step 3: Minimum weight perfect matching on odd vertices (greedy approximation)
    matching_edges = []
    unmatched = set(odd_vertices)
    matching_dist = 0

    while unmatched:
        best_pair = None
        best_dist = float("inf")
        for i in unmatched:
            for j in unmatched:
                if i < j and dist_matrix[i][j] < best_dist:
                    best_dist = dist_matrix[i][j]
                    best_pair = (i, j)

        if best_pair:
            i, j = best_pair
            matching_edges.append(edge_dict(i, j))
            adj[i].append(j)
            adj[j].append(i)
            unmatched.remove(i)
            unmatched.remove(j)
            matching_dist += best_dist

    all_edges = mst_edges + matching_edges
    total_distance = total_mst + matching_dist

    steps.append(
        step_dict(
            step=step_num,
            edges=all_edges,
            current_node=0,
            explanation=f"Step 3: Add matching edges (green): +{matching_dist} units",
            total_distance=total_distance,
        )
    )
    step_num += 1

    # Step 4-5: Find Eulerian circuit and shortcut
    # DFS to find path, skipping visited nodes
    visited = set()
    route = []

    def dfs(node):
        visited.add(node)
        route.append(node)
        for neighbor in adj[node]:
            if neighbor not in visited:
                dfs(neighbor)

    dfs(0)
    route.append(0)  # Return to depot

    # Calculate final distance
    final_distance = calculate_route_distance(route, dist_matrix)
    final_edges = [edge_dict(route[i], route[i + 1]) for i in range(len(route) - 1)]

    steps.append(
        step_dict(
            step=step_num,
            edges=final_edges,
            current_node=0,
            explanation=f"Steps 4-5: Find Eulerian circuit & shortcut to tour. Distance: {final_distance}",
            total_distance=final_distance,
        )
    )
    step_num += 1

    # Add final solution step
    steps.append(create_final_step(step_num, route, locations, dist_matrix))

    return Solution(
        strategy="CHRISTOFIDES",
        location_count=n,
        steps=steps,
        final_route=route,
        final_distance=final_distance,
    )


def first_unbound_min_value(locations: list[Location], dist_matrix: list[list[int]]) -> Solution:
    """
    FIRST_UNBOUND_MIN_VALUE: Simply visit nodes in order of their index.
    This is the baseline strategy that ignores distances.
    """
    n = len(locations)
    steps = []
    edges = []
    route = [0]
    total_distance = 0

    steps.append(
        step_dict(
            step=0,
            edges=[],
            current_node=0,
            explanation="Baseline: Visit nodes in index order (ignores distances)",
            total_distance=0,
        )
    )

    for i in range(1, n):
        new_edge = edge_dict(route[-1], i)
        edges.append(new_edge)
        dist = dist_matrix[route[-1]][i]
        total_distance += dist
        route.append(i)

        steps.append(
            step_dict(
                step=i,
                edges=list(edges),
                current_node=i,
                explanation=f"Visit next index: {locations[i].label} (node {i}), +{dist} units",
                total_distance=total_distance,
                highlight_edge=new_edge,
            )
        )

    # Return to depot
    return_edge = edge_dict(route[-1], 0)
    edges.append(return_edge)
    return_dist = dist_matrix[route[-1]][0]
    total_distance += return_dist
    route.append(0)

    steps.append(
        step_dict(
            step=n,
            edges=list(edges),
            current_node=0,
            explanation=f"Return to Depot, +{return_dist} units. Tour complete!",
            total_distance=total_distance,
            highlight_edge=return_edge,
        )
    )

    # Add final solution step
    steps.append(create_final_step(n + 1, route, locations, dist_matrix))

    return Solution(
        strategy="FIRST_UNBOUND_MIN_VALUE",
        location_count=n,
        steps=steps,
        final_route=route,
        final_distance=total_distance,
    )


def sweep(locations: list[Location], dist_matrix: list[list[int]]) -> Solution:
    """
    SWEEP: Sort nodes by angle from depot, visit in angular order.
    """
    n = len(locations)
    depot = locations[0]
    steps = []

    # Calculate angle from depot for each node
    angles = []
    for i in range(1, n):
        dx = locations[i].x - depot.x
        dy = locations[i].y - depot.y
        angle = math.atan2(dy, dx)
        angles.append((angle, i))

    # Sort by angle
    angles.sort()

    steps.append(
        step_dict(
            step=0,
            edges=[],
            current_node=0,
            explanation="Calculate angle from Depot to each node, sort by angle",
            total_distance=0,
        )
    )

    route = [0]
    edges = []
    total_distance = 0

    for step_num, (angle, node_id) in enumerate(angles, 1):
        new_edge = edge_dict(route[-1], node_id)
        edges.append(new_edge)
        dist = dist_matrix[route[-1]][node_id]
        total_distance += dist
        route.append(node_id)

        angle_deg = round(math.degrees(angle))
        steps.append(
            step_dict(
                step=step_num,
                edges=list(edges),
                current_node=node_id,
                explanation=f"Visit {locations[node_id].label} (angle: {angle_deg}°), +{dist} units",
                total_distance=total_distance,
                highlight_edge=new_edge,
            )
        )

    # Return to depot
    return_edge = edge_dict(route[-1], 0)
    edges.append(return_edge)
    return_dist = dist_matrix[route[-1]][0]
    total_distance += return_dist
    route.append(0)

    steps.append(
        step_dict(
            step=n,
            edges=list(edges),
            current_node=0,
            explanation=f"Return to Depot, +{return_dist} units. Tour complete!",
            total_distance=total_distance,
            highlight_edge=return_edge,
        )
    )

    # Add final solution step
    steps.append(create_final_step(n + 1, route, locations, dist_matrix))

    return Solution(
        strategy="SWEEP",
        location_count=n,
        steps=steps,
        final_route=route,
        final_distance=total_distance,
    )


# =============================================================================
# MAIN
# =============================================================================

STRATEGIES = {
    "path_cheapest_arc": path_cheapest_arc,
    "global_cheapest_arc": global_cheapest_arc,
    "local_cheapest_insertion": local_cheapest_insertion,
    "savings": savings_algorithm,
    "christofides": christofides,
    "first_unbound_min_value": first_unbound_min_value,
    "sweep": sweep,
}


def validate_inputs(location_count: int, strategy: str) -> None:
    """Validate input parameters for solution generation."""
    if not isinstance(location_count, int):
        raise TypeError(f"location_count must be integer, got {type(location_count)}")
    if location_count < 5 or location_count > 10:
        raise ValueError(f"location_count must be 5-10, got {location_count}")
    if strategy not in STRATEGIES:
        raise ValueError(f"Unknown strategy: {strategy}. Valid: {list(STRATEGIES.keys())}")


def generate_solution(location_count: int, strategy_name: str) -> dict:
    """Generate solution for given location count and strategy."""
    validate_inputs(location_count, strategy_name)
    locations = LOCATIONS[:location_count]
    dist_matrix = generate_distance_matrix(locations)
    strategy_func = STRATEGIES[strategy_name]
    solution = strategy_func(locations, dist_matrix)
    return {
        "strategy": solution.strategy,
        "locationCount": solution.location_count,
        "steps": solution.steps,
        "finalRoute": solution.final_route,
        "finalDistance": solution.final_distance,
    }


def main():
    """Generate all solution files."""
    # Determine output directory
    script_dir = Path(__file__).parent
    output_base = script_dir.parent / "src" / "data" / "solutions"

    print(f"Output directory: {output_base}")
    print("=" * 60)

    total_files = 0
    for location_count in range(5, 11):
        output_dir = output_base / str(location_count)
        output_dir.mkdir(parents=True, exist_ok=True)

        print(f"\nGenerating solutions for {location_count} locations...")

        for strategy_name in STRATEGIES:
            solution = generate_solution(location_count, strategy_name)
            output_file = output_dir / f"{strategy_name}.json"

            with open(output_file, "w") as f:
                json.dump(solution, f, indent=2)

            print(f"  ✓ {strategy_name}: {solution['finalDistance']} units, {len(solution['steps'])} steps")
            total_files += 1

    print("\n" + "=" * 60)
    print(f"Generated {total_files} solution files")


if __name__ == "__main__":
    main()
