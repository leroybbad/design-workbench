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
- **Ctrl+C** — Comment mode (click to annotate elements)
- **Ctrl+I** — Inspect mode (hover to see computed properties)
- **Ctrl+T** — Tune mode (click to open live adjustment panel)
- **Ctrl+A** — View staged changes
- **Cmd+Z / Cmd+Shift+Z** — Undo/redo tune adjustments
- **Shift+Cmd+Enter** — Send changes to Claude
- **Esc** — Deselect tool / close panels

## Generating Prototypes

Write HTML files to `screen_dir`. The server serves the newest file by modification time.

**Content fragments** (no `<!DOCTYPE` or `<html>`) are automatically wrapped in the companion frame template. Use for simple mockups.

**Full documents** are extracted — their `<style>` and `<body>` content are pulled into the frame. The companion chrome (toolbar, menus) always appears. Use for complete page designs.

### Authoring Standards

**Every prototype MUST follow these rules:**

1. **Use CSS classes, not inline styles.** Elements need semantic classes like `.metric-card`, `.nav-link`, `.chart-section`. The Tune panel's "Apply to all matching" finds siblings by class. Inline styles make every element unique and break this.

2. **Use CSS custom properties (tokens) for design values.** The Tune panel detects tokens and adjusts them on `:root` so changes cascade globally. Hardcoded values only affect one element.

3. **Semantic class names.** Classes describe what the element IS (`.metric-card`) not what it looks like (`.p-4.bg-white`). This makes annotation selectors meaningful.

4. **Workbench data attributes on every prototype.** Every page must use these so the workbench controls (move, remove, block placement) work immediately:
   - Wrap the page content in `<main data-canvas>`
   - Every top-level section gets `<section data-section data-section-id="s1">` (increment the ID)
   - Major components within sections get `data-block="component-name"` (e.g. `data-block="hero"`, `data-block="nav-bar"`, `data-block="bento-grid"`)
   - Grid/flex containers that could accept more blocks get `data-slot="slot-name"` (e.g. `data-slot="features"`, `data-slot="cards"`)
   
   This adds zero visual impact — the attributes are invisible. But they make every generated page immediately editable with the workbench tools.

### Anti-Slop Rules

These are the most common tells of AI-generated UI. Avoid all of them:

4. **No emoji icons.** Never use 📊 📋 🔍 or any emoji as UI icons. Use Lucide icons instead. Include this in the `<head>`:
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lucide-static@latest/font/lucide.min.css">
   ```
   Then use: `<i class="lucide-chart-bar"></i>`, `<i class="lucide-search"></i>`, etc.

5. **Tight page headers.** Don't waste 1/3 of the screen on a page title with massive padding. The page heading, action buttons, and any breadcrumbs should sit in a compact row with minimal vertical padding. `padding: 0.75rem 0` max on the header row.

6. **No orphaned whitespace.** Every section should feel intentionally spaced. If there's a gap between a heading and content, or between the nav and the page body, it should be a deliberate rhythm (e.g. `--space-md` everywhere), not random large gaps.

7. **Body text at 16px (1rem).** Use `--font-base: 1rem` for body/table content. Reserve `--font-sm: 0.875rem` for secondary labels and metadata. Never set `--font-base` below 0.875rem.

8. **Consistent text hierarchy.** Navigation text, body text, and metadata should each have a clearly distinct size. Don't put tiny 11px text next to 16px text — it looks accidental. Use the token scale: `--font-xs` for labels, `--font-sm` for secondary, `--font-base` for body, `--font-lg` for headings.

9. **Dense layouts earn their density.** If you're building a table or dashboard, make it genuinely information-dense — not just a few items with lots of padding. Either fill the space with useful content or tighten the layout to fit its content.

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
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-lg: 1.25rem;
  --font-xl: 1.5rem;

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
2. Tell the user: "Design is up at [URL]. Use the tools to review — Ctrl+C for comments, Ctrl+T to tune values. Click Send when ready."
3. User reviews, annotates, tunes, sends
4. Read `$STATE_DIR/events`
5. Apply changes, write new HTML file
6. Repeat until the user is satisfied

**Each iteration is a clean slate.** The events file is cleared when a new screen is pushed. Don't persist annotation state across iterations.

## Stopping the Server

```bash
skills/designkit/scripts/stop-server.sh $SESSION_DIR
```

Mockup files persist in `.designkit/sessions/` under the project directory for later reference.

## Key Principles

- **The designer drives.** You generate, they refine. Don't skip the feedback loop.
- **Tokens over hardcoded values.** Always. The Tune panel's power comes from tokens.
- **Classes over inline styles.** Always. "Apply to all" depends on it.
- **One screen at a time.** Focus on refining one surface, not multi-page flows.
- **Simple lifecycle.** Fresh comments each round. No state management across iterations.
- **Don't guess what changed.** Read the events file. The designer's annotations are precise.

---

## Workbench Mode

The Design Companion also supports a **workbench mode** where designers compose pages from pre-built design system blocks. Additional keyboard shortcuts:

- **Ctrl+B** — Blocks panel (browse and insert catalog blocks)
- **Cmd+S** — Save snapshot
- **Alt** — Toggle move/remove controls on placed blocks
- **Escape** — Exit placement mode, close panels, hide controls

### Block Catalog

The workbench serves blocks from `catalog/` (relative to the skill directory). Run the prep script to generate a catalog from a component library:

```bash
node skills/designkit/scripts/prep.cjs --source <component-dir> --output skills/designkit/catalog [--tokens <css-file>] [--repo <project-root>]
```

This generates `catalog/blocks/`, `catalog/templates/`, `catalog/manifest.json`, and optionally `repo-context.json` when `--repo` is provided.

The `--repo` flag inspects the project's `package.json` to detect frameworks (Next.js, React, Vue, Svelte), styling systems (Tailwind, Emotion, Framer Motion), component libraries (Radix, Lucide, MUI), and CSS tokens. This context informs Claude's edits.

### Two-Layer Artifact Model

Every block and canvas state has two layers — handle them differently:

**Design system layer (match precisely):** Colors, gradients, shadows, border radii, spacing values, font sizes, font weights, letter-spacing, line-height, background effects, opacity, hover/transition states, layout structure. These MUST use CSS custom properties (tokens) so the Tune panel can adjust them globally. Never approximate — if the design says `--radius-md: 10px`, don't round to `12px`.

**Content layer (adapt freely):** Headings, body text, labels, placeholder data, button copy, image URLs, testimonial quotes. This is illustrative — replace with the user's actual content. Don't treat sample copy as sacred.

When generating or editing blocks, always separate these layers. Tokens define the visual system. Content fills the structure.

### Surgical Edits

When the workbench is running and the user asks Claude to make changes:

**Step 1 — Build a design brief** (internal, not shown to user):
Before touching HTML, write yourself a brief covering:
- What the user asked for and why
- The current canvas structure (sections, slots, blocks in use)
- Active tokens from `catalog/tokens.css`
- Repo context from `catalog/repo-context.json` if available (frameworks, styling, component libraries)
- Constraints: what to preserve vs. what to change

This brief costs nothing — it's your internal reasoning. It prevents drift and ensures edits stay coherent with the existing design.

**Step 2 — Make the edit:**
1. Read the current canvas state from the latest snapshot: `$SESSION_DIR/snapshots/NNN.html` (check `pointer.json` for the current number)
2. Read `catalog/tokens.css` and `catalog/manifest.json`
3. Make the requested HTML edit as a **fragment** — do NOT regenerate the entire page
4. Write the modified HTML as the next snapshot file (increment the snapshot counter, e.g. `004.html`)
5. Update `pointer.json` to `{ "current": 4, "total": 4 }`
6. The server will detect the new file and broadcast a reload to the browser

### Art Direction Rules

When generating layouts, sections, or new blocks — be a designer, not a template engine.

**Composition over repetition.** Don't generate three identical cards when you could create visual rhythm — vary sizes, emphasis, or content density across a grid. A dashboard isn't three equal boxes; it's a hero metric, supporting stats, and a detail table with intentional hierarchy.

**Intentional whitespace.** Every gap should be a deliberate rhythm. If you're adding padding, it should relate to the spacing scale. Random large gaps between sections feel accidental. Tight, considered spacing feels designed.

**Visual weight distribution.** Think about where the eye goes. A section with all elements the same size has no focal point. Use size, color, and density to create a clear reading order.

**Avoid AI tells:**
- No emoji icons — use Lucide (`<i class="lucide-chart-bar"></i>`)
- No massive page headers eating 1/3 of the viewport
- Body text at 16px minimum (`--font-base: 1rem`)
- Consistent text hierarchy — don't mix 11px and 16px accidentally
- Dense layouts should actually be dense, not three items with padding

**When the user's intent is vague**, bias toward:
- Asymmetric layouts over symmetric grids
- One strong focal point per section
- Content-first density (fill the space with useful structure)
- Dark-on-light for content, color accents for actions and emphasis

### Reference URL Modes

When the user provides a URL as a starting point, ask which mode they want:

- **Clone** — near-1:1 recreation of the referenced design. Faithfully reproduce layout, spacing, colors, typography. Content can be adapted but structure stays.
- **Enhance** — take the reference as a base and improve it. Modernize dated patterns, fix spacing issues, upgrade typography, add polish. Keep the content intent and overall structure.
- **Inspire** — use the reference as a mood board. Extract the vibe, color sensibility, and layout philosophy, then create something original that shares the same design DNA.

If the user just mentions a URL as context without requesting a specific mode, don't assume one — ask.

### Save to Catalog

When the user says "save this as a block" or "add this to the catalog":

1. Extract the selected section/element HTML
2. Add YAML frontmatter in an HTML comment (ask user for name and category if not obvious)
3. Ensure the design system layer uses tokens and the content layer is clearly sample data
4. Write to `catalog/blocks/<name>.html`
5. Re-run: `node skills/designkit/scripts/prep.cjs --source catalog/blocks --output catalog`
6. The blocks panel will show the new block on next refresh

### Adoption Brief

When the user is done composing and wants to integrate the design into their real codebase, generate an adoption brief:

1. Read the latest snapshot HTML
2. Read `catalog/repo-context.json` if available
3. Analyze the canvas: count sections, identify component patterns, list tokens used
4. Write a structured brief covering:
   - **Target route/file** — where this page should live in the codebase (match against detected routes)
   - **Component decomposition** — which sections should become separate components
   - **Token mapping** — which CSS custom properties to define in the project's token system (Tailwind config, CSS variables, etc.)
   - **Framework adaptation** — how to port from raw HTML to the project's framework (React components, Vue SFCs, etc.)
   - **Content slots** — which parts are sample content that the developer needs to replace with real data
   - **Warnings** — forms needing validation, interactions needing JS, accessibility gaps
5. Save to `$SESSION_DIR/adoption.md`

This turns a visual composition into an actionable dev ticket.

### Canvas Document Format

The canvas uses standard HTML with data attributes:

- `data-canvas` — root container (on `<main>`)
- `data-section` + `data-section-id` — top-level reorderable units
- `data-slot` — containers that accept child blocks (layout grids, stacks, etc.)
- `data-block` — identifies which catalog block was inserted

---

## Quality Pipeline

When generating a prototype from a **new request or a significant design direction change**, use the quality pipeline to improve visual output. Do NOT use it for incremental refinements from Comment, Inspect, or Tune feedback — those should be applied directly.

### Step 1: Art Director

Spawn a sub-agent (model: sonnet) with the contents of `skills/designkit/agents/art-director.md` as the system prompt. Pass it:

- The user's request (what they asked for)
- Repo context summary (frameworks, tokens, component directories — from the explore skill or your own inspection)
- The contents of `skills/designkit/references/index.json`
- The contents of all files in `skills/designkit/references/principles/`

The art director returns a creative brief and names 2-3 reference pattern IDs. After receiving the brief, read the `meta.json` and `pattern.html` files for each selected pattern from `skills/designkit/references/patterns/<pattern-id>/`.

### Step 2: Build

Generate the prototype HTML as usual (following the Authoring Standards above), but now your input includes:
- The art director's creative brief
- The selected reference pattern HTML files (2-3 annotated examples)
- The user's original request (for content and functional requirements)

Use the creative brief as your primary visual direction. Draw specific techniques from the reference patterns. Apply the user's content and functional requirements on top.

### Step 3: Critique

After writing the prototype HTML to `screen_dir`, spawn a sub-agent (model: sonnet) with the contents of `skills/designkit/agents/critic.md` as the system prompt. Pass it:

- The creative brief from Step 1
- The generated HTML (read the file you just wrote)
- The contents of `skills/designkit/references/principles/anti-patterns.md`
- The contents of the principles files referenced in the brief's "Linked to principle" annotations (typically 2-3 files)

The critic returns a JSON verdict:

- If `"pass": true` — the prototype is ready. Proceed to tell the user the URL.
- If `"pass": false` — read the `revision_prompt`. Apply the specific fixes to the HTML. Write the updated file. Do NOT run the critic again — one revision pass maximum.

### Pipeline Context Detection

To determine greenfield vs established codebase mode:

- **Greenfield:** The repo context shows fewer than 5 CSS custom properties, no component directories, or the user explicitly asks for a fresh/new direction.
- **Established codebase:** The repo context shows 10+ CSS custom properties, component directories, an identifiable design language.

Pass this determination to both the art director (affects creative freedom) and the critic (affects which checks apply — e.g., foreign-tokens check only applies in established codebase mode).
