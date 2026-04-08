# Design Companion

A browser-based design refinement plugin for Claude Code. Gives designers hands-on tools to annotate, inspect, and tune prototypes — bridging the gap between "Claude rendered something" and "this is actually good."

## What It Does

Claude generates a UI prototype. You open it in your browser alongside VS Code. Instead of describing what to fix in the terminal, you use visual tools directly on the design:

- **Comment** (Shift+C) — Click any element, attach a note. "This heading is too heavy." "Add an icon here." Pins mark your feedback visually.
- **Inspect** (Shift+I) — Hover to see computed properties: spacing, typography, colors, borders. Like DevTools, but only the design-relevant stuff.
- **Tune** (Shift+T) — Click an element, drag sliders to adjust font size, spacing, colors, shadows, border radius — live, in the browser. Changes cascade through CSS tokens automatically.
- **Shadow Presets** — Pick from 9 design system shadow ramps (Tailwind, Material, Apple, Chakra, Polaris, Stripe, Bootstrap, Ant Design, Atlassian).

When you're done tweaking, hit **Send** (Shift+Cmd+Enter). Claude reads your structured feedback — selectors, notes, tuned values, token changes — and updates the design. Repeat until it's right.

## Install

In Claude Code, run these two commands:

```
/plugin marketplace add leroybbad/design-superpowers
/plugin install design-companion@leroybbad-design-superpowers
```

Then reload plugins without restarting:

```
/reload-plugins
```

That's it. The skill, server, and all tools ship with the plugin — nothing to build.
```

## How It Works

1. The plugin includes a zero-dependency Node.js server that watches a directory for HTML files and serves them in a browser frame with the companion toolbar
2. The skill teaches Claude how to generate prototypes using CSS tokens and semantic classes (so the tools work properly)
3. Your feedback (comments + tune adjustments) is captured as structured data and sent back to Claude
4. Claude reads the feedback and generates the next iteration

## Requirements

- Claude Code (CLI, VS Code extension, or desktop app)
- Node.js (for the local server)
- A browser (for the companion)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Shift+C | Toggle Comment mode |
| Shift+I | Toggle Inspect mode |
| Shift+T | Toggle Tune mode |
| Shift+A | Show staged changes |
| Shift+Cmd+Enter | Send changes to Claude |
| Cmd+Z | Undo tune adjustment |
| Cmd+Shift+Z | Redo tune adjustment |
| Esc | Deselect tool / close panels |

## Philosophy

AI-generated design is 80% right and 100% slop. The last 20% — the spacing, the weight, the shadow depth, the animation timing — is what separates craft from generic output. This tool keeps the designer's hands on the wheel during that critical refinement phase.

Read more in [docs/VISION.md](docs/VISION.md).

## License

MIT
