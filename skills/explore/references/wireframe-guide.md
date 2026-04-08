# Wireframe Guide — Two-Level UX Exploration

This is a reference file for the Design Explore skill. It defines two distinct fidelity
levels used during concept exploration. They should **never be mixed or averaged** — the
power comes from using each at the right moment.

1. **Schematic thumbnails (diverge)** — Generate and compare many structural patterns
   simultaneously without committing to any. Quantity, speed, no commitment.
2. **Structural prototypes (pressure-test)** — Take one concept and reveal its mechanics.
   Not to make it pretty, but to make the pattern actually work at a level where you can
   feel whether it holds up.

---

## Level 1: Schematic Thumbnails (Diverge)

**Purpose:** Generate 6-8 structurally distinct layout patterns that the user can scan
and compare in a single view.

### Fidelity rules

- **No real text.** No real icons. No real content.
- Every element is a **rectangle, line, or circle** of a specific size, weight, and color.
- The arrangement of those primitives IS the concept — not a representation of it.
- A sidebar is a narrow rectangle on the left. A card grid is a 2×3 grid of equal
  rectangles. A search bar is a single full-width thin rectangle. Nothing else is needed.

### Color discipline

**This is critical.** Color at this level is **semantic, not decorative.**

Before generating any thumbnails, assign semantic meaning to 2-3 colors:
- e.g. Purple = AI-type or active/selected state
- e.g. Teal = enabled/success
- e.g. Blue = contextual info

**Hold that meaning constant across ALL thumbnails in the set.** The viewer should be
able to scan across thumbnails and compare structural patterns — not decode a new
visual system per thumbnail.

### Size and density

Thumbnails should be small enough that **all 6-8 fit in one view without scrolling.**
Each thumbnail canvas is roughly 150-200px wide. This constraint is intentional — it
forces each thumbnail to communicate only the dominant structural pattern and nothing else.

### Interactivity

None. Each thumbnail is static. The only interaction is clicking to select it for
deeper exploration.

### Structural diversity

Each thumbnail must represent a fundamentally different approach:
- Sidebar + content, card grid, command palette, canvas, split pane,
  timeline, table registry, category hub, etc.
- NOT 8 variations of "sidebar + content area"
- Resist the urge to make any thumbnail more detailed than the others — that
  signals preference before analysis

### CSS for the thumbnail grid

```css
.crazy8-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.crazy8-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.crazy8-card:hover {
  border-color: #8b7ec8;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}

.crazy8-header {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}
.crazy8-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f0eeff;
  color: #6c5ce7;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.crazy8-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
}

.crazy8-thumb {
  aspect-ratio: 4 / 3;
  background: #f8f8fa;
  border-radius: 8px;
  border: 1px solid #ebebeb;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  overflow: hidden;
}

.crazy8-desc {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.45;
}
```

### Building abstract thumbnails

Inside each `.crazy8-thumb`, use simple divs with inline styles to represent layout zones.
Use the 2-3 semantic colors you assigned, plus neutral grays for structure.

**Shapes vocabulary:**
- **Rectangles** — content areas, cards, panels
- **Thin horizontal lines** — text rows, list items, table rows
- **Small squares/circles** — icons, avatars, status indicators
- **Colored blocks** — primary actions, active states, headers (using semantic colors)

Example of a sidebar + card grid thumbnail:

```html
<div class="crazy8-thumb">
  <div style="display:flex; gap:6px; height:100%;">
    <!-- Sidebar -->
    <div style="width:28%; background:#e8e6f0; border-radius:4px; padding:6px;">
      <div style="height:3px; background:#c4c0d8; border-radius:2px; margin-bottom:5px; width:70%;"></div>
      <div style="height:3px; background:#8b7ec8; border-radius:2px; margin-bottom:4px;"></div>
      <div style="height:3px; background:#d4d0e4; border-radius:2px; margin-bottom:4px;"></div>
      <div style="height:3px; background:#d4d0e4; border-radius:2px; margin-bottom:4px;"></div>
    </div>
    <!-- Content -->
    <div style="flex:1; display:flex; flex-direction:column; gap:5px;">
      <div style="height:5px; background:#d0d0d4; border-radius:2px; width:40%;"></div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; flex:1;">
        <div style="background:#f0eeff; border-radius:4px;"></div>
        <div style="background:#f0eeff; border-radius:4px;"></div>
        <div style="background:#f0eeff; border-radius:4px;"></div>
      </div>
    </div>
  </div>
</div>
```

### HTML structure for the full page

```html
<h1>[Topic] — 8 structural patterns</h1>
<p style="color:#6b7280; margin-bottom:1.5rem;">Click any to explore further.</p>

<div class="crazy8-grid">
  <div class="crazy8-card" data-choice="1">
    <div class="crazy8-header">
      <span class="crazy8-num">01</span>
      <span class="crazy8-title">Marketplace grid</span>
    </div>
    <div class="crazy8-thumb">
      <!-- Abstract shapes only -->
    </div>
    <p class="crazy8-desc">Filter sidebar + search + card grid. Browse-first.</p>
  </div>
  <!-- Repeat for 02-08 -->
</div>
```

---

## Level 2: Structural Prototype (Pressure-Test)

**Purpose:** Take one selected concept and reveal its mechanics — the interaction model,
the state transitions, the failure modes. Not to make it pretty, not to fill in real
content, but to make the pattern actually work at a level where you can feel whether it
holds up.

### Fidelity rules

- **Real chrome** — top bars, panel headers, filter tabs, search inputs, breadcrumbs.
  The structural furniture of the UI should be present and correctly positioned.
- **Real affordances** — filter chips, toggles, state indicators. Show them in place
  but they don't need to be interactive at this stage.
- **Minimal content** — show **2-3 representative items** per list, grid, or table to
  establish the pattern. Then add a count indicator ("+ 25 more") rather than rendering
  every slot. The pattern is clear after 2 items — more is wasted tokens.
- **No descriptions** — item names and badges only. Omit body text, descriptions,
  paragraphs inside list items and cards. The structural role of each element is
  obvious from its position and label.
- **No visual polish** — correct structure, no decorative refinement.

### What to build

Only the interactions that **test the core pattern assumption.** Ask: what would either
validate or break this pattern?

- For a pipeline canvas: slot selection, tool insertion, connection flow
- For a three-panel layout: category filtering, item selection, detail rendering
- For a command palette: search, filtering, result types, keyboard hints

**Do NOT build:** hover states, animations, icon sets, loading states. Just the
structural interactions.

### Stress-test toggle

Always include at least one **stress test** — something that forces the pattern into
a harder state:
- More items (10 tools → 50 tools)
- A different role (admin vs. viewer)
- A different entry point (deep link vs. browse)
- A complex edge case (nested workflows, conflicting states)

Make the failure visible. Label it explicitly. This is where patterns either hold or
reveal their limits.

### Color continuity

Use the same semantic color system established in the Level 1 thumbnails, now applied
with actual CSS. The viewer should feel continuity between the schematic they chose
and the prototype they're now exploring.

### Structural verdict

**End every Level 2 exploration with explicit analysis** — rendered as prose outside
the prototype, not inside it:
- What the pattern gets right
- Where it strains or breaks
- What it implies about where to go next

### Layout

Stack prototypes **vertically, one per concept.** Each gets full page width but is
**visually scaled down** so the user can see 2-3 concepts in one scroll. The prototype
is rendered at full size inside a container, then CSS-scaled to ~65%.

```css
.concept-stack {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}

.concept-card {
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.concept-card:hover {
  border-color: var(--color-primary, #8b7ec8);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.concept-card h2 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.concept-desc {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

/* Scale the wireframe preview — constrained width, hugs content */
.concept-preview-frame {
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  max-width: 900px;
}
.concept-preview-inner {
  transform: scale(0.65);
  transform-origin: top left;
  width: 154%;            /* 1 / 0.65 to fill container width */
}
```

### HTML structure

```html
<h1>[Topic] — exploring [N] concepts</h1>
<p style="color:#6b7280; margin-bottom:1.5rem;">
  Click the one that resonates — you can mix elements from multiple.
</p>

<div class="concept-stack">
  <div class="concept-card" data-choice="a">
    <h2>A — [Concept Name]</h2>
    <p class="concept-desc">[1-sentence description]</p>
    <div class="concept-preview-frame">
      <div class="concept-preview-inner">
        <!-- Structural prototype at full size — the frame scales it down -->
      </div>
    </div>
  </div>
</div>
```

### Keeping it compact

**The goal: all concepts visible in 1-2 scrolls.** To achieve this:
- **2-3 items per list/grid/table** — enough to show the pattern. Add "+ N more" indicator.
- **Names and badges only** — omit descriptions, body text, paragraphs inside items.
- **One state** — show the default state. Skip stress-test content at this stage.
- **Scaled preview** — the `.concept-preview-frame` scales the prototype to 65% and
  hugs its content naturally. No fixed or max height — the frame fits snugly around
  the concept without clipping or empty space.

**Key rules:**
- `data-choice` on every `.concept-card`
- Each prototype shows the core structural pattern with minimal content
- Always use `.concept-stack` — never a grid at this stage
- Use the scale-down frame so concepts are comparable at a glance

---

## Palette Muting (for Level 2 only)

When a palette has been chosen (after convergence), apply a muting layer for Level 2
prototypes so tokens are desaturated. Level 1 thumbnails don't use palette tokens.

```css
#claude-content {
  --color-primary: color-mix(in oklch, var(--color-primary), #888 40%);
  --color-bg: color-mix(in oklch, var(--color-bg), #f5f5f5 30%);
  --color-surface: color-mix(in oklch, var(--color-surface), #fafafa 20%);
  --color-border: color-mix(in oklch, var(--color-border), #ddd 30%);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 3px 8px rgba(0,0,0,0.05);
}
```

> **Note:** Since palette selection now happens after convergence, Level 2 prototypes
> during exploration use neutral styling. Palette muting only applies if the user has
> already chosen a palette in a previous session or from codebase detection.

---

## CSS Class Kit (for Level 2 prototypes)

These classes layer on top of the frame template's existing classes. All values use
token variables — never hardcoded sizes or colors.

### Layout Shells

```css
.wf-app {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  min-height: 80vh;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.wf-topbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}

.wf-sidebar {
  background: var(--color-surface-variant);
  border-right: 1px solid var(--color-border);
  min-width: 180px;
  padding: var(--space-md);
}

.wf-main {
  flex: 1;
  padding: var(--space-lg);
  background: var(--color-bg);
  overflow-y: auto;
}
```

### Content Blocks

```css
.wf-heading {
  font-size: var(--font-lg);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.wf-metric {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
}
.wf-metric .label {
  font-size: var(--font-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-xs);
}
.wf-metric .value {
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--color-text);
}

.wf-table {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.wf-table-header {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  font-size: var(--font-xs);
  text-transform: uppercase;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}
.wf-table-row {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sm);
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}
.wf-table-row:last-child { border-bottom: none; }

.wf-chart {
  aspect-ratio: 16 / 9;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
  background: var(--color-surface);
}

.wf-placeholder {
  aspect-ratio: 16 / 10;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
  background: var(--color-surface);
}

.wf-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-md);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  cursor: pointer;
}
.wf-button.secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.wf-input {
  display: block;
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: var(--color-text);
  box-sizing: border-box;
}

.wf-nav-item {
  display: block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
}
.wf-nav-item.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
```

### Grid Utilities

```css
.wf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
}

.wf-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.wf-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-md);
}
```

---

## Authoring Rules

1. **Level 1 thumbnails** use `.crazy8-*` classes and abstract shapes only. No text in thumbnails. Assign semantic colors before generating.
2. **Level 2 prototypes** use `.wf-*` classes with real chrome and abbreviated content. Build only interactions that test the core pattern.
3. **Include a stress-test** in every Level 2 prototype — force the pattern into a harder state.
4. **End Level 2 with a verdict** — what the pattern gets right, where it strains, what's next.
5. **Semantic classes** — `.wf-metric`, `.wf-sidebar`, not utility stacks.
6. **No JavaScript** — static HTML + CSS only. Interaction is implied by structure.
7. **Color continuity** — the semantic color system from Level 1 carries into Level 2.
