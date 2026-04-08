---
name: designkit
description: "Use when designing or refining UI — launches a browser-based companion with Comment, Inspect, and Tune tools for hands-on design iteration with Claude."
---

# Design Companion

A browser-based design refinement tool. Launches a local server that renders prototypes and gives designers hands-on tools to annotate, inspect, and tune visual properties — then sends structured feedback to Claude for the next iteration.

## When to Use

- The user asks to design, prototype, or build a UI component, page, or layout
- The user wants to refine or polish an existing design
- The user says "let's brainstorm" about anything visual
- Any task where showing a visual in the browser would help

## Checklist

1. **Start the Design Companion server**
2. **Generate the prototype** following authoring standards
3. **Tell the user the URL** and what tools are available
4. **Wait for the user** to comment, inspect, or tune — then tell you to process
5. **Read the events file** for their feedback
6. **Apply changes** based on annotations and tune values
7. **Push the updated screen** — repeat until done

## Starting the Server

```bash
skills/designkit/scripts/start-server.sh --project-dir /path/to/project
```

Returns JSON with `screen_dir`, `state_dir`, and `url`. Save all three.

Tell the user to open the URL. Remind them of the keyboard shortcuts:
- **Shift+C** — Comment mode (click to annotate elements)
- **Shift+I** — Inspect mode (hover to see computed properties)
- **Shift+T** — Tune mode (click to open live adjustment panel)
- **Shift+A** — View staged changes
- **Cmd+Z / Cmd+Shift+Z** — Undo/redo tune adjustments
- **Shift+Cmd+Enter** — Send changes to Claude
- **Esc** — Deselect tool / close panels

## Generating Prototypes

Write HTML files to `screen_dir`. The server serves the newest file by modification time.

**Content fragments** (no `<!DOCTYPE` or `<html>`) are automatically wrapped in the companion frame template. Use for simple mockups.

**Full documents** are extracted — their `<style>` and `<body>` content are pulled into the frame. The companion chrome (toolbar, menus) always appears. Use for complete page designs.

### Full-Bleed Mode

By default, `#claude-content` has 2rem padding and inherits the frame background. For full-page layouts that control their own background (dark themes, full-width dashboards), add `data-bleed` to the content's root element:

```html
<div data-bleed>
  <!-- your full-page layout here -->
</div>
```

This removes the padding and makes the container transparent so the content fills the viewport edge-to-edge. Use for complete app layouts. Skip for concept cards, option grids, or wireframe fragments that benefit from the frame's padding.

### Authoring Standards

**Every prototype MUST follow these rules:**

1. **Use CSS classes, not inline styles.** Elements need semantic classes like `.metric-card`, `.nav-link`, `.chart-section`. The Tune panel's "Apply to all matching" finds siblings by class. Inline styles make every element unique and break this.

2. **Use CSS custom properties (tokens) for design values.** The Tune panel detects tokens and adjusts them on `:root` so changes cascade globally. Hardcoded values only affect one element.

3. **Semantic class names.** Classes describe what the element IS (`.metric-card`) not what it looks like (`.p-4.bg-white`). This makes annotation selectors meaningful.

**Token block template** — include at the top of every prototype's `<style>`:

```css
:root {
  /* Colors */
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-bg: #f4f5f7;
  --color-surface: #ffffff;
  --color-border: #e5e7eb;
  --color-text: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-success: #059669;
  --color-warning: #d97706;
  --color-danger: #dc2626;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography */
  --font-xs: 0.65rem;
  --font-sm: 0.8rem;
  --font-base: 1rem;
  --font-lg: 1.4rem;
  --font-xl: 1.6rem;

  /* Shape */
  --radius-sm: 6px;
  --radius-md: 10px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
}
```

Adjust token values to match the design direction. The token names should stay consistent so the Tune panel can find and adjust them.

**Example — correct:**
```html
<style>
  :root { --space-md: 1rem; --radius-md: 10px; --color-surface: #fff; }
  .metric-card {
    padding: var(--space-md);
    border-radius: var(--radius-md);
    background: var(--color-surface);
  }
</style>
<div class="metric-card">
  <h3 class="metric-label">Revenue</h3>
  <p class="metric-value">$48,250</p>
</div>
```

**Example — wrong (breaks tools):**
```html
<div style="padding: 1rem; border-radius: 10px; background: #fff;">
  <h3 style="font-size: 0.7rem;">Revenue</h3>
  <p style="font-size: 1.75rem;">$48,250</p>
</div>
```

### File Naming

- Use semantic names: `dashboard.html`, `client-detail.html`, `settings-page.html`
- Never reuse filenames — each screen must be a new file
- For iterations: `dashboard-v2.html`, `dashboard-v3.html`
- Use the Write tool — never cat/heredoc

## Reading Designer Feedback

After the user sends changes (via the Send button or Shift+Cmd+Enter), read the events file:

```
$STATE_DIR/events
```

The file contains JSONL — one JSON object per line. Two types:

### Comment annotations
```json
{"type":"annotation","id":"ann-123","selector":".metric-card:nth-of-type(2) > .metric-value","tag":"p","text":"$48,250","note":"too large, try 1.5rem","status":"new","timestamp":1749000001}
```

- `selector` — CSS path to the element from `#claude-content`
- `tag` + `text` — human-readable element identity
- `note` — the designer's feedback

### Tune changes
```json
{"type":"tune","selector":".metric-card","tag":"div","text":"Revenue...","changes":{"padding":"12px","borderRadius":"8px"},"tokenChanges":{"--space-md":"0.75rem","--radius-md":"8px"},"timestamp":1749000002}
```

- `changes` — inline style changes applied to the element
- `tokenChanges` — CSS custom property changes applied to `:root` (these cascade globally)

**Processing feedback:**
1. Read each line of the events file
2. For annotations: find the element by selector, apply the designer's note as a targeted change
3. For tune changes: apply `tokenChanges` to the `:root` token block, apply `changes` as inline overrides where needed
4. Write the updated HTML as a new file (e.g., `dashboard-v2.html`)

## The Iteration Loop

1. Write HTML to `screen_dir` following authoring standards
2. Tell the user: "Design is up at [URL]. Use the tools to review — Shift+C for comments, Shift+T to tune values. Click Send when ready."
3. User reviews, annotates, tunes, sends
4. Read `$STATE_DIR/events`
5. Apply changes, write new HTML file
6. Repeat until the user is satisfied

**Each iteration is a clean slate.** The events file is cleared when a new screen is pushed. Don't persist annotation state across iterations.

## Stopping the Server

```bash
skills/designkit/scripts/stop-server.sh $SESSION_DIR
```

Mockup files persist in `.superpowers/brainstorm/` under the project directory for later reference.

## Key Principles

- **The designer drives.** You generate, they refine. Don't skip the feedback loop.
- **Tokens over hardcoded values.** Always. The Tune panel's power comes from tokens.
- **Classes over inline styles.** Always. "Apply to all" depends on it.
- **One screen at a time.** Focus on refining one surface, not multi-page flows.
- **Simple lifecycle.** Fresh comments each round. No state management across iterations.
- **Don't guess what changed.** Read the events file. The designer's annotations are precise.
