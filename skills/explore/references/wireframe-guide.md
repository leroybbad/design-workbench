# Wireframe Guide — Concept UI Quality

This is a reference file for the Design Explore skill. It defines the CSS class kit and
authoring conventions used when generating concept wireframes during exploration.

**Concept wireframes must look good.** These are high-quality thumbnail UI concepts — not
rough sketches, not gray boxes, not low-fidelity throwaway work. Each concept should look
like a real interface rendered with slightly muted colors. The user should be able to
immediately feel the layout, hierarchy, and personality of each approach.

Think of it as: **the app at 90% polish with desaturated colors.** Not a wireframe. Not a
mockup. A concept that communicates "this is what it would feel like to use."

---

## Principles

1. **High quality rendering** — Concepts should look like real UI, not sketches. Readable text, proper spacing, complete layouts. The only thing muted is the color palette.
2. **Palette personality** — Use the chosen palette's colors in muted form. The palette should be recognizable and give each concept a feel, not just be gray.
3. **Real labels** — Use actual text plausible for the problem domain. Never lorem ipsum. Labels communicate intent.
4. **Enough content** — Show 4-6 rows in tables, 3-4 nav items, multiple metrics. Sparse content looks broken.
5. **Visible structure** — Use subtle borders and fills to make regions legible. Structure should be obvious at a glance.
6. **No images** — Use placeholder regions with a soft dashed outline and a centered label instead of any `<img>` tags.

---

## Muting a Palette for Wireframe Mode

Apply a muting layer scoped to `#claude-content` so the palette tokens are desaturated for wireframe rendering without altering the tokens globally.

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

> **Fallback note:** `color-mix(in oklch, ...)` requires Chrome 111+ / Safari 16.2+. If you need broader compatibility, replace with manually desaturated hex values derived from the palette (e.g. take the palette's primary hue and reduce chroma by ~40%).

---

## CSS Class Kit

These classes layer on top of the frame template's existing classes (`.cards`, `.card`, `.mockup`, `.split`, `.mock-nav`, `.mock-sidebar`, etc.). They do not replace them.

All values use token variables — never hardcoded sizes or colors.

### Layout Shells

```css
/* Full app shell — use as the outermost wireframe container */
.wf-app {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  min-height: 80vh;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

/* Top bar spanning full width */
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

/* Left sidebar */
.wf-sidebar {
  background: var(--color-surface-variant);
  border-right: 1px solid var(--color-border);
  min-width: 180px;
  padding: var(--space-md);
}

/* Main content area */
.wf-main {
  flex: 1;
  padding: var(--space-lg);
  background: var(--color-bg);
  overflow-y: auto;
}
```

### Content Blocks

```css
/* Section heading */
.wf-heading {
  font-size: var(--font-lg);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

/* Metric / stat card */
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

/* Simple table */
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
.wf-table-row:last-child {
  border-bottom: none;
}

/* Chart placeholder */
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

/* Generic image / media placeholder */
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

/* Buttons */
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

/* Text input */
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

/* Sidebar nav item */
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
/* Responsive card grid */
.wf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
}

/* Two-column split */
.wf-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

/* Metrics row */
.wf-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-md);
}
```

---

## Authoring Rules

1. **Include wireframe CSS in a `<style>` block** inside the prototype's `<head>`. Do not use external stylesheets.
2. **Include palette tokens and the muting layer** — paste both the token block and the `#claude-content` muting override into the same `<style>` block.
3. **Use semantic classes** — `.wf-metric`, `.wf-sidebar`, `.wf-nav-item`. Do not use utility-style class stacks.
4. **Use real text plausible for the problem domain** — if the concept is a project tracker, say "Sprint 4 velocity" not "Metric label."
5. **Keep nesting flat** — one or two levels of HTML nesting max. Wireframes should be readable at a glance, not deeply nested.
6. **No JavaScript** — wireframes are static HTML + CSS only. Interaction is implied by structure, not implemented.

---

## Concept Layout

**Stack concepts vertically, not in a grid.** Each concept gets the full page width so
wireframe previews are legible and detailed. Users scroll through concepts like pages
in a lookbook — each one gets room to breathe.

**Do NOT use the `.cards` grid for concepts.** Side-by-side cards squish complex
wireframes into unreadable thumbnails. Use a simple vertical stack instead.

### Wireframe preview sizing

- Use the palette's base font size (typically `--font-base`) for the wireframe —
  **not** a reduced size like `0.75rem`. The previews should be readable, not tiny.
- Set `min-height: 400px` on `.wf-app` so layouts have room to show real content.
- The wireframe should feel like looking at the actual app at ~80% scale, not a
  postage stamp.

### Fidelity level

These are **not** gray boxes. Each wireframe should:
- Show 4-6 realistic data rows in tables/lists (not 2-3)
- Include secondary UI elements (search bars, filters, status badges)
- Use the muted palette colors to hint at hierarchy
- Feel like a working interface rendered in pencil, not a diagram of one

### HTML structure

```html
<style>
  .concept-stack { display: flex; flex-direction: column; gap: 2rem; }
  .concept-card {
    background: #fff;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .concept-card:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  .concept-card h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.375rem;
  }
  .concept-desc {
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
    margin-bottom: 1.25rem;
  }
</style>

<h1>Tool Management — 3 Concepts</h1>
<p class="page-subtitle">Scroll through each concept. Click the one that resonates —
you can mix elements from multiple.</p>

<div class="concept-stack">

  <div class="concept-card" data-choice="a">
    <h2>A — Sidebar + Detail Panel</h2>
    <p class="concept-desc">Categories on the left, tool list in the middle,
    configuration detail on the right. Familiar, scannable, scales with many tools.</p>
    <div class="wireframe-preview">
      <div class="wf-app" style="min-height: 400px;">
        <div class="wf-topbar">🔧 Tool Manager · 12 tools active</div>
        <div class="wf-sidebar">
          <div class="wf-nav-item active">All Tools</div>
          <div class="wf-nav-item">Data Processing</div>
          <div class="wf-nav-item">Communication</div>
          <div class="wf-nav-item">Reporting</div>
        </div>
        <div class="wf-main">
          <div class="wf-heading">All Tools</div>
          <!-- Full-size wireframe content here -->
        </div>
      </div>
    </div>
  </div>

  <div class="concept-card" data-choice="b">
    <h2>B — Card Grid with Filters</h2>
    <p class="concept-desc">Tools as visual cards grouped by category.
    Filter chips across the top. Click a card to configure inline.</p>
    <div class="wireframe-preview">
      <div class="wf-app" style="grid-template-columns: 1fr; min-height: 400px;">
        <div class="wf-topbar">🔧 Tool Manager · 12 tools active</div>
        <div class="wf-main">
          <div class="wf-heading">Tools</div>
          <!-- Full-size wireframe content here -->
        </div>
      </div>
    </div>
  </div>

  <div class="concept-card" data-choice="c">
    <h2>C — Flat List with Expandable Rows</h2>
    <p class="concept-desc">Simple list of tools with expand-in-place detail.
    No panels, no modals — everything inline.</p>
    <div class="wireframe-preview">
      <div class="wf-app" style="grid-template-columns: 1fr; min-height: 400px;">
        <div class="wf-topbar">🔧 Tool Manager · 12 tools active</div>
        <div class="wf-main">
          <div class="wf-heading">Tools</div>
          <!-- Full-size wireframe content here -->
        </div>
      </div>
    </div>
  </div>

</div>
```

**Key rules:**
- `data-choice` on every `.concept-card` — this is how clicks get sent to Claude
- Wireframe previews at full readable font size, not miniaturized
- Each concept must show a meaningfully different layout approach
- The `.concept-stack` class ensures vertical flow — never switch to a grid
