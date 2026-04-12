# Design Workbench

A Claude Code plugin for designing in code. Explore concepts, compose pages from blocks, tune every detail in the browser — then hand off production-ready HTML.

## What It Does

- **Explore** — Claude generates concept pages from your brief, guided by an art director agent and a quality critic
- **Compose** — Browse and place blocks from the page palette, arrange sections, fill slots
- **Refine** — Edit text inline, tune spacing/colors/typography live, comment for Claude
- **Save** — Snapshots persist to disk. Claude reads the latest snapshot for surgical edits.

## Quick Start

1. Install the plugin in Claude Code
2. Describe what you want to design — Claude runs the quality pipeline and generates a prototype
3. Open the URL — the workbench toolbar appears on every generated page
4. Use the toolbar to refine, rearrange, and edit
5. Save (Cmd+S), then ask Claude for changes — it patches your layout, not rebuild from scratch

## Toolbar

| Button | What it does |
|--------|-------------|
| **Blocks** | Browse components on the current page. Click one, click the canvas to stamp copies. |
| **Edit** | Double-click text to edit inline. Double-click a container to focus into it (add/remove children). |
| **Arrange** | Show move up/down and remove controls on every section and block. |
| **Comment** | Click elements to attach feedback notes for Claude. |
| **Inspect** | Hover to see computed properties — spacing, fonts, colors, borders. |
| **Tune** | Click any element, adjust properties with sliders. Changes cascade via CSS tokens. |
| **Theme** | Swap palettes, adjust global typography/spacing/radius. |
| **Changes** | Review all staged comments and tune adjustments. |
| **Snapshots** | Browse save points. Claude builds from the latest one. |
| **Save** | Write the current canvas to disk as a snapshot. |
| **Send** | Send comments and tune changes to Claude for the next iteration. |

**Keyboard shortcuts:** Ctrl+B (blocks), Ctrl+C (comment), Ctrl+I (inspect), Ctrl+T (tune), Ctrl+D (theme), Cmd+S (save), Cmd+Z (undo), Escape (close/cancel), Alt (toggle arrange).

## Quality Pipeline

New concept pages run through a 3-step pipeline:

1. **Art Director** — reads your request + design principles + reference patterns, writes a creative brief
2. **Build** — Claude generates the prototype following the brief
3. **Critic** — reviews against anti-patterns and principles, requests fixes if needed

The pipeline adapts to context:
- **Greenfield** (no existing design system) — full creative freedom, art-directed compositions
- **Established codebase** (detected tokens, components, frameworks) — respects existing patterns, enforces token compliance

## Design System Integration

The workbench works at two levels:

- **Without a design system** — Claude generates original designs. The Blocks panel shows components from the current page. Full creative latitude.
- **With a design system** — Load a component library into `catalog/systems/<name>/`. The prep script scans it into blocks with a matching token set. Claude composes within your system's constraints.

Both modes use the same tools. The difference is the input library and how much creative freedom the art director takes.

## Architecture

- Zero-dependency Node.js server (HTTP + WebSocket, no npm packages)
- Vanilla JS client (no framework, no build step)
- HTML with `data-section`, `data-block`, `data-slot` attributes for structure
- CSS custom properties for the design system layer
- Snapshots on disk, undo/redo in browser memory
- Agents (art director, critic) run as Claude sub-agents with Sonnet

## Requirements

- Claude Code (CLI, VS Code, or desktop app)
- Node.js 18+
- A browser

## License

MIT
