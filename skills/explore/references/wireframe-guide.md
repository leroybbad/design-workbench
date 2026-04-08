# Wireframe Guide — Two-Stage Concept Exploration

This is a reference file for the Design Explore skill. It defines two levels of concept
rendering used during exploration, plus the CSS class kit for detailed wireframes.

Concept exploration works in two stages, like a designer at a whiteboard:

1. **Crazy 8s grid** — Abstract structural thumbnails in a grid. Show the *pattern*, not
   the content. Compact, scannable, 6-8 options. The user picks 1-2 to explore deeper.
2. **Deep dive** — Full-width detailed renders of the chosen concepts. Real content,
   readable font sizes, enough detail to evaluate the approach seriously.

---

## Stage 1: Crazy 8s — Structural Thumbnails

Show 6-8 concepts as a grid of abstract structural diagrams. Each thumbnail communicates
a **layout pattern** using simple shapes — rectangles, lines, blocks — not real UI text
or data. Think of these as the tiny sketches a designer draws on sticky notes.

### Principles

1. **Abstract, not literal** — Use colored blocks, lines, and shapes to represent layout
   zones (sidebar, content area, cards, tables). Do NOT render actual text or data.
2. **Structurally distinct** — Each thumbnail must show a fundamentally different approach.
   Not 8 variations of "sidebar + content" — show sidebar, tabs, command palette, canvas,
   split pane, card grid, timeline, etc.
3. **Numbered and named** — Each concept gets a number badge and a short bold title
   (e.g. "01 Marketplace grid", "02 Command palette").
4. **One-line description** — Below the thumbnail, a single sentence describing the
   structural idea. Not a paragraph.
5. **Grid layout works here** — Unlike detailed wireframes, abstract thumbnails are
   compact enough for a 2x4 or 2x3 grid. Use it.

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
Use muted colors from the palette (or neutral grays if no palette is chosen yet).

**Shapes vocabulary:**
- **Rectangles** — represent content areas, cards, panels
- **Thin horizontal lines** — represent text rows, list items, table rows
- **Small squares/circles** — represent icons, avatars, status indicators
- **Colored blocks** — represent primary actions, active states, headers

Example of an abstract sidebar + content thumbnail:

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
      <!-- Abstract shapes here -->
    </div>
    <p class="crazy8-desc">Filter sidebar + search + card grid. Browse-first.</p>
  </div>

  <!-- Repeat for 02-08 -->
</div>
```

---

## Stage 2: Deep Dive — Full-Width Detailed Concepts

After the user selects 1-3 thumbnails from the Crazy 8s grid, render those concepts
at full detail. Stack them vertically — each one gets the full page width.

### Principles

1. **High quality rendering** — These should look like real UI with muted palette colors.
   Readable text, proper spacing, complete layouts.
2. **Real labels** — Use actual text plausible for the problem domain. Never lorem ipsum.
3. **Enough content** — Show 4-6 rows in tables, 3-4 nav items, multiple metrics.
4. **Visible structure** — Subtle borders and fills to make regions legible at a glance.
5. **No images** — Placeholder regions with a soft dashed outline and centered label.

### Sizing

- Use the palette's base font size — never shrink below it.
- Set `min-height: 400px` on `.wf-app` so layouts have room.
- The wireframe should feel like the actual app at ~90% polish, not a miniature.

### CSS for the vertical stack

```css
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
    <p class="concept-desc">[1-2 sentence description]</p>
    <div class="wireframe-preview">
      <div class="wf-app" style="min-height: 400px;">
        <!-- Full detailed wireframe using wf-* classes -->
      </div>
    </div>
  </div>
  <!-- More concepts -->
</div>
```

**Key rules for deep dives:**
- `data-choice` on every `.concept-card`
- Full readable font size, never miniaturized
- Each concept must show a meaningfully different layout approach
- Always use `.concept-stack` for vertical flow — never a grid at this stage

---

## Muting a Palette

When generating wireframes with a chosen palette, apply a muting layer scoped to
`#claude-content` so tokens are desaturated without altering them globally.

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

> **Note:** For the Crazy 8s stage, palette muting is optional — abstract thumbnails
> can use neutral grays since they're showing structure, not style. Apply palette
> muting when generating Stage 2 deep dives.

---

## CSS Class Kit (for Stage 2 wireframes)

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

1. **Include CSS in a `<style>` block** — no external stylesheets.
2. **Stage 1 thumbnails** use the `.crazy8-*` classes and abstract shapes. No real text in thumbnails.
3. **Stage 2 deep dives** use palette tokens + muting layer + `.wf-*` classes. Real text, real content.
4. **Semantic classes** — `.wf-metric`, `.wf-sidebar`, not utility stacks.
5. **Real text for deep dives** — plausible for the problem domain.
6. **No JavaScript** — static HTML + CSS only.
