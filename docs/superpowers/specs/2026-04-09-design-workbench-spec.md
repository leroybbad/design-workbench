# Design Workbench — Product Spec

**Date:** 2026-04-09
**Status:** Draft
**Repo:** Hard fork of `designkit-dev`

## Vision

A browser-based design workbench where designers compose pages from pre-built design system components, with Claude as an on-demand creative partner. The goal is designing fully in code — owning every artifact in your repo — without relying on external platforms like Lovable, Webflow, or Framer.

This is a tool for design system teams and contributing designers within an organization.

## Problem

- Prompt-driven assembly is probabilistic — Claude may not pick the right variant, place it correctly, or remember what components exist
- Designers can't browse and discover their own component library visually
- Every session rebuilds from scratch — no persistence, no undo, no save points
- Refreshing the browser loses all in-session changes

## Core Workflow

```
Explore → Prep → Compose → Create
(discover)  (build kit)  (assemble)  (fill gaps)
```

### Phase 1: Explore (existing flow, front door)

Discover design direction through rough concept screens. Claude generates options, user reacts, converges on a direction. Output informs what templates and blocks to prep. This phase is unchanged from the current DesignKit plugin — it remains a side activity that feeds into the workbench.

### Phase 2: Prep (runs once per design system, re-runnable)

**Input:** Component library directory (e.g., `components/ui/`), optional token/config files (Tailwind config, CSS variables, theme files).

**Process:** A Node.js script that:

1. Scans the component directory for component files
2. Renders block snippets — standalone HTML fragments showing each component in context with sample content
3. Extracts design tokens from CSS/config into a shared token sheet
4. Writes each block to a catalog directory as an individual `.html` file with YAML frontmatter
5. Generates page templates — full-page HTML skeletons with section and slot markers

**Block snippet format:**

```html
<!--
name: Metric Card
category: Cards
description: KPI display with label, value, and trend indicator
slots: none
variants: default, compact
-->
<div class="metric-card" data-block="metric-card">
  <span class="metric-label">Revenue</span>
  <span class="metric-value">$24.5k</span>
  <span class="metric-trend up">+12%</span>
</div>
```

**Page template format:**

```html
<main data-canvas>
  <section data-section data-section-id="s1" data-slot="nav">...</section>
  <section data-section data-section-id="s2">
    <div class="grid" data-slot="metrics-grid">...</div>
  </section>
  <section data-section data-section-id="s3">...</section>
</main>
```

**Output:** A `catalog/` directory containing:

- `blocks/` — individual component HTML snippets with frontmatter
- `templates/` — page skeleton HTML files (including a blank template)
- `tokens.css` — extracted design tokens

The catalog is committed to the repo. It's an artifact the team owns and can hand-edit.

**Who runs prep:** Claude, guided by a prep skill/script. User points it at their codebase, reviews the output, tweaks, re-runs as needed.

### Phase 3: Compose (browser workbench)

The core interaction loop. User opens the workbench, selects a template (or blank), and assembles pages by browsing and inserting blocks.

#### Block Catalog (two tiers)

- **Sections** — full-width page units (hero, feature grid, pricing table, footer). Drop between existing sections.
- **Components** — smaller units (cards, buttons, navs, form groups). Drop into slots within sections.

#### Blocks Panel

A new tool mode in the toolbar (alongside Tune/Comment/Inspect):

- **Category groups** — collapsible sections derived from block frontmatter (Sections, Cards, Navigation, Tables, Forms, etc.)
- **Block previews** — live HTML thumbnails rendered with the active token sheet, not screenshots
- **Search/filter** — text input at top for large catalogs
- **Click to select** — selects a block and enters placement mode

#### Placement Mode

After selecting a block from the panel:

- Hovering the canvas highlights valid drop targets:
  - **Between sections** — horizontal insertion line appears between `data-section` elements
  - **Inside slots** — `data-slot` containers highlight, showing where the block would land
- Click to place — client inserts the block HTML directly into the canvas DOM (no server round-trip). The change lives in browser memory until the user hits Save.
- Escape cancels placement mode

#### Section Manipulation

Sections on the canvas show lightweight controls on hover:

- **Drag handle** — left edge, reorder sections by dragging
- **Delete button** — removes the section (undoable via in-browser undo)

These controls are injected by the client and stripped before saving. They never appear in persisted HTML.

#### Existing Tools (carried forward)

- **Tune** — click any element, open property panel, adjust tokens/styles live
- **Inspect** — hover to see computed design properties
- **Comment** — drop annotation pins, add notes for Claude or teammates
- **Theme** — global token adjustments

### Phase 4: Create (Claude as creative partner)

Claude enters on demand, not as the default assembly engine. Three interaction patterns:

#### Surgical Edit

User selects a section/element and invokes Claude with an instruction. The plugin sends Claude the current canvas HTML, the selected element, and the instruction. Claude returns a modified HTML fragment patched into the canvas.

#### New Component

User describes something not in the catalog. Claude generates it styled with the active tokens. User previews it on canvas. A "Save to Catalog" action writes it as a new block snippet in `catalog/blocks/`. It becomes available in the panel for future use.

#### Remix / Brainstorm

User wants to explore variations. Claude generates 2-3 alternatives for a section, shown for comparison. User picks one, it lands on the canvas.

#### What Claude receives:

- The canvas HTML (current state)
- The token sheet (`tokens.css`)
- The block catalog manifest (list of available components)
- User's instruction + any comments/annotations

#### What Claude returns:

- An HTML fragment (not a full page) — the server patches it into the canvas

This keeps Claude's context small and focused. It patches a known document, not rebuilding from scratch.

## Persistence & Undo

Two-layer system:

| Layer | Scope | Storage | Granularity |
|-------|-------|---------|-------------|
| Undo/Redo | Fine edits within a session | Browser memory | Every DOM change |
| Snapshots | Explicit save points | Disk | User-initiated (Save button) |

### In-Browser Undo/Redo

The client maintains a memory stack of DOM operations (extending the existing Tune undo system). Handles all fine-grained changes — block insertions, reorders, deletes, style tweaks. Lost on browser close, as expected.

### Snapshot System

- User presses **Save** (same position as current Send button)
- Client serializes the canvas HTML, stripping all client-injected UI (drag handles, selection outlines, hover highlights)
- Sends to server via WebSocket
- Server writes to `session/snapshots/001.html`, `002.html`, etc.
- A `pointer.json` tracks `{ "current": 3, "total": 3 }`
- **Snapshot undo:** roll back to a previous save point (coarse-grained, intentional)
- **Forward truncation:** saving while pointer is behind `total` discards forward snapshots (standard undo behavior)

Typical session produces 5-10 snapshots. No cleanup process needed.

### Canvas on Refresh

Server reads the current snapshot from disk on every `GET /` request. Refreshing the browser loads the last saved state. Unsaved in-browser changes are lost — same mental model as any design tool.

### Claude's Changes

When Claude makes an edit, the result is written as the next snapshot. Claude's changes are undoable at the snapshot level, same as manual saves.

## Canvas Document Format

Standard HTML with data attributes. No framework, no virtual DOM.

```html
<main data-canvas>
  <section data-section data-section-id="s1">
    <nav data-block="top-nav">...</nav>
  </section>
  <section data-section data-section-id="s2">
    <div class="grid" data-slot="metrics-grid">
      <div data-block="metric-card">...</div>
      <div data-block="metric-card">...</div>
    </div>
  </section>
  <section data-section data-section-id="s3">
    <div data-block="data-table">...</div>
  </section>
</main>
```

- `data-canvas` — root container
- `data-section` + `data-section-id` — top-level units (reorderable, removable)
- `data-slot` — containers that accept child blocks
- `data-block` — identifies which catalog block was inserted (for traceability)

## Server Architecture

Upgraded from the current DesignKit server. Still zero-dependency Node.js.

**New responsibilities:**

- Serve the block catalog (list blocks, serve individual block HTML)
- Manage snapshot stack (write snapshots, move pointer, serve current)
- Accept full serialized canvas HTML on save (client does all DOM manipulation locally; server only receives the result on explicit Save)
- Serve page templates for session start

**Session directory structure:**

```
.designkit/sessions/{id}/
  canvas/          # current working state
  snapshots/       # numbered save points
    001.html
    002.html
    pointer.json
  catalog/         # symlink or copy of the design system catalog
  state/
    events         # annotation/interaction log (existing)
```

## Client Architecture

Hard fork of `helper.js`. Gains:

- **Blocks panel** — new tool mode, renders catalog as browsable categories with live previews
- **Placement mode** — insertion line / slot highlighting system
- **Section controls** — drag handles, delete buttons (injected, not persisted)
- **Save button** — serializes canvas, sends to server, triggers snapshot
- **Snapshot navigation** — undo/redo at save-point level

Retains:

- Tune, Inspect, Comment, Theme panels and all their functionality
- WebSocket communication with server
- Keyboard shortcuts for mode switching

## Packaging

The workbench is delivered as a Claude Code plugin (skill) initially. The architecture is intentionally decoupled from Claude Code — the server, client, and catalog system have no dependency on the plugin harness. This keeps the door open for:

- **Electron app** hitting the Claude API directly
- **Standalone CLI** tool
- **Web app** wrapper

These are packaging decisions, not architecture changes. The spec covers the core system only.

## Out of Scope (for v1)

- Collaborative multi-user editing
- Component prop panels (edit component data/props via UI)
- Visual grid/layout editor (freeform positioning)
- Design-to-code export (React, Vue, etc. — the HTML is the code)
- Version branching (non-linear snapshot history)
- Integration with Figma or other design tools
