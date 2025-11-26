# Design Guidelines

TSP First Solution Strategies visualization app design system.

## Typography Scale

Improved typography scale for better UX and readability.

### Size Reference

| Role | Old Size | New Size | Tailwind Class |
|------|----------|----------|----------------|
| Page title | 16px | 18px | `text-lg` |
| Page subtitle | 12px | 14px | `text-sm` |
| Section headers | 12px | 14px | `text-sm` |
| Labels | 12px | 14px | `text-sm` |
| Body text | 12px | 14px | `text-sm` |
| Explanations | 12px | 14px | `text-sm` |
| Button text | 12px | 14px | `text-sm` |
| Tabs | 11px | 12px | `text-xs` |
| Strategy buttons | 11px | 12px | `text-xs` |
| Strategy description | 11px | 12px | `text-xs` |
| Badges | 10px | 12px | `text-xs` |
| Stat labels | 9px | 10px | `text-[10px]` |
| Candidates labels | 9px | 11px | `text-[11px]` |
| Candidate badges | 10px | 12px | `text-xs` |
| Candidate distance | 9px | 11px | `text-[11px]` |
| Keyboard hints | 9px | 11px | `text-[11px]` |
| Kbd elements | 8px | 10px | `text-[10px]` |
| Pseudocode | 10px | 13px | `text-[13px]` |
| Stat values | 16px | 18px | `text-lg` |
| Step counter | 18px | 20px | `text-xl` |

### Guidelines

1. **Minimum readable size**: 10px for labels, 12px for body text
2. **Code/monospace**: 13px minimum for readability
3. **Line height**: 1.5-1.6 for body text, 1.7 for code
4. **Font weights**: 400 normal, 500 medium, 600 semibold, 700 bold

## Spacing Scale

| Context | Old | New |
|---------|-----|-----|
| Header padding | 8px | 12px |
| Main content gap | 12px | 16px |
| Main content padding | 12px | 16px |
| Card padding | 12px | 16px |
| Card gap | 8px | 12px |
| Button height | 32px | 36px |
| Icon button | 32px | 36px |

## Color System

### Primary Colors
- **Indigo 500**: `#6366f1` - Primary actions, active states
- **Violet 500**: `#8b5cf6` - Strategy selection

### Semantic Colors
- **Emerald 500**: `#10b981` - Success, completion
- **Slate palette**: UI backgrounds, borders, text

### Map Colors (CSS Variables)
- `--color-depot`: Gold star (depot)
- `--color-node`: Blue nodes
- `--color-node-current`: Green current node
- `--color-edge`: Gray edges
- `--color-edge-highlight`: Green highlighted edges

## Component Heights

| Component | Height |
|-----------|--------|
| Location buttons | 36px |
| Strategy buttons | auto (padding: 6px 10px) |
| Tab triggers | 32px |
| Navigation buttons | 36px |
| Icon buttons | 36px |

## Fonts

- **Primary**: Inter
- **Monospace**: JetBrains Mono, Fira Code
