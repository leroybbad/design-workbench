# Designkit 

This plugin was built to help step designers (and non-designers) through a hands-on method of designing with claude code.  With the right amount of specificity, you can move through divergent exercises into concepts, and finally into building out a prototype.

Ultimately, we want to get things into our user's hands as fast as possible.  Design, prototype, test, iterate.  We've essentially condensed a lot of the "Design" aspect directly into prototyping, allowing you to move immediately into learning from users.

## What It Does

Two skills work together — **Explore** for divergent concept work, and **Designkit** for hands-on refinement.

### Explore (`/explore`)

A guided brainstorming flow that prevents AI slop by anchoring every design decision to your actual intent:

1. **Discover** — Claude asks targeted questions about your problem, audience, and interaction model
2. **Crazy 8s** — 6-8 abstract structural thumbnails in a grid, showing fundamentally different layout patterns
3. **Pressure-test** — Select concepts to explore at higher fidelity with real chrome and abbreviated content
4. **Converge** — Pick a direction, then choose a visual identity (design system + colors)
5. **Prototype** — Claude generates the first high-fidelity prototype with your chosen palette applied

### Designkit Viewer (`/designkit`)

A browser-based companion for hands-on design refinement. Claude generates a prototype, you open it in the Designkit Viewer and use visual tools directly on the design:

- **Comment** (Shift+C) — Click any element, attach a note. Pins mark your feedback visually.
- **Inspect** (Shift+I) — Hover to see computed design properties: spacing, typography, colors, borders.
- **Tune** (Shift+T) — Click an element, drag sliders to adjust font size, spacing, colors, shadows, radius — live in the browser. Changes cascade through CSS tokens.
- **Theme** (Shift+D) — Swap entire design systems, color palettes, and fine-tune typography/spacing/radius globally. 10 built-in palettes with dark/warm/cool variants and custom accent color picker.

When you're done tweaking, hit **Send** (Shift+Cmd+Enter). Claude reads your structured feedback and updates the design. Repeat until it's right.

## Install

In the Claude Code VS Code extension, add `leroybbad/designkit` as a marketplace plugin. In the CLI, use `/plugin marketplace add leroybbad/designkit`.

The skills, server, and all tools ship with the plugin — nothing to build.

## How It Works

1. The plugin includes a zero-dependency Node.js server that watches a directory for HTML files and serves them in the Designkit Viewer with the companion toolbar
2. The Explore skill teaches Claude how to guide you through structured concept exploration before generating anything
3. The Designkit skill teaches Claude how to generate prototypes using CSS tokens and semantic classes (so the visual tools work properly)
4. Your feedback (comments, tune adjustments, theme changes) is captured as structured data and sent back to Claude
5. Claude reads the feedback and generates the next iteration

## Requirements

- Claude Code (CLI, VS Code extension, or desktop app)
- Node.js (for the local server)
- A browser (for the Designkit Viewer)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Shift+C | Toggle Comment mode |
| Shift+I | Toggle Inspect mode |
| Shift+T | Toggle Tune mode (per-element) |
| Shift+D | Toggle Theme Selector (global) |
| Shift+A | Show staged changes |
| Shift+Cmd+Enter | Send changes to Claude |
| Cmd+Z | Undo adjustment |
| Cmd+Shift+Z | Redo adjustment |
| Esc | Deselect tool / close panels |

## Philosophy

AI-generated design is 50% right and 50% slop. When finally narrowing down on a concept, the last 10% — the spacing, the weight, the shadow depth, the color temperature — is what separates craft from generic output. This tool keeps the designer's hands on the wheel during ideation and concept refinement.

## License

MIT
