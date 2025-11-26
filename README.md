# TSP First Solution Strategies Demo

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://skytik.github.io/ortools-visualizer/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff)](https://vite.dev/)
[![License](https://img.shields.io/badge/license-ISC-blue)](LICENSE)

An interactive React-based educational website demonstrating 10 first solution strategies from Google OR-Tools for the Traveling Salesman Problem (TSP).

**[View Live Demo](https://skytik.github.io/ortools-visualizer/)**

## Features

- **10 TSP Algorithms**: Path Cheapest Arc, Global Cheapest Arc, Local Cheapest Arc, Local Cheapest Insertion, Best Insertion, Parallel Cheapest Insertion, Savings (Clarke-Wright), Christofides, First Unbound Min Value, and Sweep
- **Step-by-Step Visualization**: Navigate through each algorithm's execution to see how routes are built
- **Interactive Controls**: Choose from 5-10 location counts and switch between strategies
- **Keyboard Navigation**: Use arrow keys (← →) and Home/End for quick navigation
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
or-tools/
├── scripts/
│   └── generate_solutions.py  # Python script to generate solution data
├── src/
│   ├── components/
│   │   ├── algorithm/         # Algorithm info panel
│   │   ├── controls/          # UI controls (location selector, strategy tabs)
│   │   ├── intro/             # Introduction section
│   │   ├── layout/            # Page layout
│   │   ├── map/               # SVG map visualization
│   │   └── ui/                # Reusable UI components
│   ├── data/
│   │   ├── locations.ts       # Fixed location coordinates
│   │   ├── strategies.ts      # Strategy metadata & pseudocode
│   │   └── solutions/         # Pre-computed solution JSON files (42 total)
│   ├── hooks/
│   │   └── useTSPDemo.ts      # Main state management hook
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── public/
│   └── favicon.svg
└── dist/                      # Production build output
```

## Regenerating Solution Data

The solution files are pre-generated. To regenerate them:

```bash
# Requires Python 3 with ortools installed
pip install ortools

# Run the generator
pnpm generate-solutions
# or directly:
python3 scripts/generate_solutions.py
```

This generates 60 JSON files (6 location counts × 10 strategies) in `src/data/solutions/`.

## Algorithms Explained

| Strategy | Description |
|----------|-------------|
| **Path Cheapest Arc** | Greedy nearest neighbor - always go to closest unvisited node |
| **Global Cheapest Arc** | Build route by always adding globally shortest edge |
| **Local Cheapest Arc** | From current node, go to nearest unvisited (similar to Path Cheapest) |
| **Local Cheapest Insertion** | Insert each node where it causes minimum route cost increase |
| **Best Insertion** | Insert node with globally minimum insertion cost at each step |
| **Parallel Cheapest Insertion** | Select node closest to route, then insert at cheapest position |
| **Savings (Clarke-Wright)** | Merge routes based on distance savings calculation |
| **Christofides** | 1.5-approximation using MST and minimum matching |
| **First Unbound Min Value** | Simple sequential assignment by node index |
| **Sweep** | Sort nodes by angle from depot, visit in angular order |

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` | Previous step |
| `→` | Next step |
| `Home` | First step |
| `End` | Last step |

## License

ISC
