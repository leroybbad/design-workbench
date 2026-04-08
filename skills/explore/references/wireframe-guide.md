# Wireframe Guide — Lo-Fi with Warmth

This is a reference file for the Design Explore skill. It defines the CSS class kit and authoring conventions used when generating lo-fi wireframe concepts during exploration.

**"Lo-fi with warmth"** means wireframes that are clearly rough and low-fidelity — not pixel-perfect — but still feel inviting and coherent. They use muted versions of the chosen palette, real labels, soft shapes, and visible structure. The goal is to communicate layout and hierarchy quickly, not to simulate a finished product.

---

## Principles

1. **Soft corners** — Apply `border-radius` everywhere. Sharp corners feel like a finished UI; rounded corners signal "this is a sketch."
2. **Hint of palette** — Use the chosen palette's colors, but muted (reduced saturation and opacity). The palette should be recognizable, not vibrant.
3. **Real labels** — Use actual text plausible for the problem domain. Never lorem ipsum. Labels communicate intent.
4. **Simple iconography** — Use emoji or single-stroke SVG only. No icon libraries, no complex graphics.
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

## Concept Card Layout

Use the frame template's existing `.cards` and `.card` classes to present multiple concepts side by side for comparison. Each card gets a `data-choice` attribute so the Explore skill can reference it by letter.

The miniature wireframe preview inside each card should use the `.wf-*` classes at a reduced `font-size` (e.g. `0.75rem`) to keep it compact.

```html
<div class="cards">

  <div class="card" data-choice="a">
    <h3>Concept A — Dashboard Hub</h3>
    <p>Centralized overview with metric cards and a sidebar nav for quick switching between views.</p>
    <div style="font-size: 0.75rem; margin-top: 1rem;">
      <div class="wf-app">
        <div class="wf-topbar">📊 ProjectPulse &nbsp;·&nbsp; Q2 Sprint Tracker</div>
        <div class="wf-sidebar">
          <div class="wf-nav-item active">Overview</div>
          <div class="wf-nav-item">Sprints</div>
          <div class="wf-nav-item">Team</div>
          <div class="wf-nav-item">Reports</div>
        </div>
        <div class="wf-main">
          <div class="wf-metrics">
            <div class="wf-metric">
              <div class="label">Velocity</div>
              <div class="value">42 pts</div>
            </div>
            <div class="wf-metric">
              <div class="label">Open issues</div>
              <div class="value">17</div>
            </div>
            <div class="wf-metric">
              <div class="label">On track</div>
              <div class="value">83%</div>
            </div>
          </div>
          <div class="wf-chart" style="margin-top: 1rem;">📈 Burndown chart</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" data-choice="b">
    <h3>Concept B — Timeline Feed</h3>
    <p>Chronological activity feed with inline status updates, no sidebar — optimized for async teams.</p>
    <div style="font-size: 0.75rem; margin-top: 1rem;">
      <div class="wf-app" style="grid-template-columns: 1fr; grid-template-rows: auto 1fr;">
        <div class="wf-topbar">📋 ProjectPulse &nbsp;·&nbsp; Activity Feed</div>
        <div class="wf-main">
          <div class="wf-heading">Recent activity</div>
          <div class="wf-table">
            <div class="wf-table-header">
              <span style="flex:2">Task</span>
              <span style="flex:1">Assignee</span>
              <span style="flex:1">Status</span>
            </div>
            <div class="wf-table-row">
              <span style="flex:2">API integration complete</span>
              <span style="flex:1">Maya</span>
              <span style="flex:1">Done ✅</span>
            </div>
            <div class="wf-table-row">
              <span style="flex:2">Write release notes</span>
              <span style="flex:1">Sam</span>
              <span style="flex:1">In progress</span>
            </div>
            <div class="wf-table-row">
              <span style="flex:2">QA sign-off</span>
              <span style="flex:1">Jordan</span>
              <span style="flex:1">Blocked 🔴</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" data-choice="c">
    <h3>Concept C — Split View</h3>
    <p>Left panel shows the sprint board; right panel shows detail for the selected item. Good for focused review sessions.</p>
    <div style="font-size: 0.75rem; margin-top: 1rem;">
      <div class="wf-app">
        <div class="wf-topbar">🗂 ProjectPulse &nbsp;·&nbsp; Sprint Board</div>
        <div class="wf-sidebar">
          <div class="wf-nav-item active">Sprint 4</div>
          <div class="wf-nav-item">Sprint 3</div>
          <div class="wf-nav-item">Backlog</div>
        </div>
        <div class="wf-main">
          <div class="wf-split">
            <div>
              <div class="wf-heading">Board</div>
              <div class="wf-table">
                <div class="wf-table-row">📌 API integration</div>
                <div class="wf-table-row">📝 Release notes</div>
                <div class="wf-table-row">🔍 QA sign-off</div>
              </div>
            </div>
            <div>
              <div class="wf-heading">Detail — QA sign-off</div>
              <div class="wf-placeholder">Attachment preview</div>
              <div style="margin-top: 0.5rem;">
                <div class="wf-input" style="margin-bottom: 0.5rem;" readonly placeholder="Add a comment…"></div>
                <div class="wf-button">Post comment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>
```
