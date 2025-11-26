# TSP First Solution Strategies Demo - Implementation Plan

**Date:** 2024-11-26
**Project:** or-tools-demo
**Type:** Static React Website

---

## Overview

A React-based educational website demonstrating 7 TSP (Traveling Salesman Problem) first solution strategies from Google OR-Tools. Users step through algorithm execution via Next/Back buttons, seeing how each strategy builds a route.

---

## Phase 1: Project Setup & Foundation ✅ COMPLETE

**Goal:** Scaffold project, configure tooling, establish base structure

### Tasks

- [x] Initialize Vite + React + TypeScript project
- [x] Install dependencies: Tailwind CSS v4, shadcn/ui components
- [x] Configure shadcn/ui components (Button, Tabs, Card)
- [x] Create folder structure
- [x] Define TypeScript types (`types/index.ts`)
- [x] Create fixed locations data (`data/locations.ts`)
- [x] Create strategies metadata with pseudocode (`data/strategies.ts`)

### Deliverables
- ✅ Running dev server with empty app shell
- ✅ All type definitions complete
- ✅ Static data files ready

---

## Phase 2: Data Generation (Python) ⚠️ COMPLETE WITH ISSUES

**Goal:** Generate pre-computed solution JSON files for all strategy/location combinations

### Tasks

- [x] Create Python script `scripts/generate_solutions.py`
- [x] Implement step recording for each strategy:
  - PATH_CHEAPEST_ARC (greedy nearest neighbor) ✅
  - GLOBAL_CHEAPEST_ARC (global shortest edges) ⚠️ cycle detection bug
  - LOCAL_CHEAPEST_INSERTION (minimum cost insertion) ✅
  - SAVINGS (Clarke-Wright) ⚠️ route merging edge cases
  - CHRISTOFIDES (MST + matching) ❌ greedy matching not min-weight
  - FIRST_UNBOUND_MIN_VALUE (sequential baseline) ✅
  - SWEEP (angular sweep - replaced PARALLEL_CHEAPEST_INSERTION) ✅
- [x] Generate distance matrix from fixed locations
- [x] Output JSON files: `src/data/solutions/{locationCount}/{strategy}.json`
- [x] Validate all 42 files (6 counts × 7 strategies)
- [ ] Fix Christofides to use min-weight perfect matching OR add disclaimer
- [ ] Fix Global Cheapest Arc cycle detection logic
- [ ] Add input validation and error handling
- [ ] Add unit tests for algorithm correctness

### Deliverables
- ✅ `scripts/generate_solutions.py` - 1068 lines of Python
- ✅ 42 JSON solution files generated
- ✅ Each step includes: edges, currentNode, highlightEdge, candidates, explanation, totalDistance
- ⚠️ Code review completed - 2 critical issues found (see reports/251126-code-review-tsp-solution-generator.md)

---

## Phase 3: Core UI Components ✅ COMPLETE

**Goal:** Build main UI layout and static components

### Tasks

- [x] Create `MainLayout.tsx` - two-column responsive layout
- [x] Build `LocationSelector.tsx` - buttons for 5-10 locations
- [x] Build `StrategyTabs.tsx` - tabs for 7 strategies
- [x] Build `StepControls.tsx` - Back/Next buttons with step counter + progress bar
- [x] Build `AlgorithmPanel.tsx` - description + pseudocode + candidates display
- [x] Style all components with Tailwind

### Deliverables
- ✅ All UI components rendering correctly
- ✅ Responsive layout (desktop-first, mobile-friendly)
- ✅ Components fully integrated with state

---

## Phase 4: SVG Map Visualization ✅ COMPLETE

**Goal:** Create interactive SVG canvas showing nodes and edges

### Tasks

- [x] Build `MapCanvas.tsx` - SVG container with viewBox (500x500)
- [x] Build `Node.tsx` - circle component for locations
  - Depot: gold star icon
  - Regular nodes: blue circles with labels
  - Current node: green with pulse animation
- [x] Build `Edge.tsx` - line component for route segments
  - Normal edge: gray solid line with arrow
  - Highlight edge: green with glow animation
- [x] Implement edge drawing from step data
- [x] Add CSS transitions for smooth state changes
- [x] Add grid background and legend

### Deliverables
- ✅ SVG canvas rendering all nodes
- ✅ Edges render based on current step
- ✅ Visual distinction for depot, current node, new edge

---

## Phase 5: State Management & Integration ✅ COMPLETE

**Goal:** Wire everything together with state logic

### Tasks

- [x] Create `useTSPDemo.ts` hook:
  - locationCount state
  - strategy state
  - stepIndex state
  - Solution data loading with cache
  - Navigation functions (goBack, goNext, reset, goToStep)
- [x] Load solution JSON dynamically based on selections
- [x] Connect LocationSelector to state
- [x] Connect StrategyTabs to state
- [x] Connect StepControls to navigation
- [x] Connect MapCanvas to current step data
- [x] Connect AlgorithmPanel to current step explanation
- [x] Reset stepIndex when strategy or locationCount changes
- [x] Add keyboard navigation (←, →, Home, End)

### Deliverables
- ✅ Fully functional step-through demo
- ✅ All components reactive to state changes
- ✅ Smooth transitions between steps
- ✅ Keyboard navigation support

---

## Phase 6: Polish & Enhancement ✅ COMPLETE

**Goal:** Improve UX, add finishing touches

### Tasks

- [x] Add `StepExplainer.tsx` - detailed current step breakdown
  - Show candidates with distances (in AlgorithmPanel)
  - Highlight selected candidate
- [x] Add distance metrics display (current total, final total)
- [x] Add keyboard navigation (← → arrow keys, Home/End)
- [x] Add progress indicator (progress bar in StepControls)
- [x] Improve mobile responsiveness (sticky header, bottom nav hint, responsive spacing)
- [x] Add loading states for solution data
- [x] Add intro/instructions section (IntroSection component)

### Deliverables
- ✅ Polished user experience
- ✅ Keyboard accessibility
- ✅ Clear visual feedback

---

## Phase 7: Documentation & Deployment ✅ COMPLETE

**Goal:** Prepare for production and deploy

### Tasks

- [x] Write README.md with:
  - Project overview
  - Local development setup
  - How to regenerate solution data
- [x] Add meta tags for SEO (title, description, og:image, twitter cards)
- [x] Create favicon (SVG with TSP route visualization)
- [x] Configure Vite for static build
- [ ] Deploy to Vercel/Netlify/GitHub Pages (pending deployment)
- [x] Test production build

### Deliverables
- ✅ Production-ready static site (`pnpm build` → dist/)
- ⏳ Live deployment URL (ready to deploy)
- ✅ Complete documentation

---

## Technical Specifications

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

### File Structure (Final)

```
or-tools-demo/
├── public/
│   └── favicon.ico
├── scripts/
│   └── generate_solutions.py
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── MainLayout.tsx
│   │   ├── map/
│   │   │   ├── MapCanvas.tsx
│   │   │   ├── Node.tsx
│   │   │   └── Edge.tsx
│   │   ├── controls/
│   │   │   ├── LocationSelector.tsx
│   │   │   ├── StrategyTabs.tsx
│   │   │   └── StepControls.tsx
│   │   └── algorithm/
│   │       ├── AlgorithmPanel.tsx
│   │       └── StepExplainer.tsx
│   ├── data/
│   │   ├── locations.ts
│   │   ├── strategies.ts
│   │   └── solutions/
│   │       ├── 5/
│   │       ├── 6/
│   │       ├── 7/
│   │       ├── 8/
│   │       ├── 9/
│   │       └── 10/
│   ├── hooks/
│   │   └── useTSPDemo.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

### Type Definitions

```typescript
// types/index.ts

export interface Location {
  id: number;
  x: number;
  y: number;
  label: string;
  isDepot?: boolean;
}

export interface Candidate {
  node: number;
  distance: number;
  selected: boolean;
}

export interface Edge {
  from: number;
  to: number;
}

export interface Step {
  step: number;
  edges: Edge[];
  currentNode: number;
  highlightEdge?: Edge;
  candidates?: Candidate[];
  explanation: string;
  totalDistance: number;
}

export interface Solution {
  strategy: string;
  locationCount: number;
  steps: Step[];
  finalRoute: number[];
  finalDistance: number;
}

export interface Strategy {
  id: string;
  name: string;
  shortDesc: string;
  pseudocode: string;
}
```

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OR-Tools doesn't expose intermediate steps | High | Certain | Implement algorithm logic manually in Python |
| CHRISTOFIDES complex to step through | Medium | High | Simplify visualization or show key milestones only |
| PARALLEL_CHEAPEST_INSERTION not applicable to single vehicle | Medium | High | Adapt or substitute with similar strategy |
| JSON files too large | Low | Low | Optimize structure, lazy load if needed |

---

## Success Criteria

- [x] All 7 strategies demonstrable
- [x] Step-by-step navigation works smoothly
- [x] Clear visual distinction between algorithm states
- [x] Pseudocode matches visualization
- [x] Works on desktop and mobile
- [x] Loads fast (< 2s initial load)
- [x] No console errors

---

## Notes

- **Single vehicle only** - this is TSP, not VRP
- **Pre-computed data** - no real-time solving
- **Educational focus** - clarity over optimization
- **Static deployment** - no backend required
