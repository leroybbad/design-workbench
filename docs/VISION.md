# Design Superpowers — Vision

## The Problem

AI-generated design output is 80% right and 100% slop. Claude can scaffold layouts, build components, and render prototypes — but the last 20% that separates craft from generic AI output requires a designer's eye and hands-on control. Today, designers fall back to describing problems in the terminal ("the heading is too heavy", "the padding feels off") without spatial anchoring, or they open DevTools and mentally translate what they see into instructions Claude can act on.

## The Vision

A browser-based design companion that carries designers through the full design arc — from diverge to polish — without ever losing the interactive feedback loop.

**Diverge → Converge → Refine → Polish**

The existing brainstorm skill handles diverge and converge well (crazy 8s, A/B/C option selection, approach comparison). Design Superpowers extends this into the refinement and polish phases where AI output becomes craft.

## Core Principles

- **Hands-on, not hands-off.** The designer is in the driver's seat. The tool gives them direct manipulation controls, not more AI suggestions.
- **Single-surface focus.** We refine one component, one interaction, one layout at a time. Not multi-page flows.
- **Anti-slop.** Every feature exists to help the designer push past "good enough" into "actually good."
- **Simple lifecycle.** Each iteration is a clean slate. No complex state management. Drop comments, Claude acts, review, repeat.

## Three Interaction Modes

### 1. Comment (Implemented)

Click any element in a rendered prototype and attach a text note. Annotations batch-send to Claude as structured feedback with CSS selectors and element context. Claude reads the notes and makes targeted changes.

- Shift+C toggle (Figma muscle memory)
- Teardrop pin dots at click location
- Sidebar for reviewing all annotations
- Batch send on screen push

### 2. Inspect (Planned)

Toggle an overlay that shows design-relevant properties on hover: spacing, font sizes, colors, border radii, z-index. Like DevTools but purpose-built for design review — no DOM noise, just the values a designer cares about. Click to flag a value that feels wrong, and it becomes an annotation.

### 3. Tune (Planned)

Live controls for design tokens — typography scale, color palette, spacing system, animation timing/easing. Adjustments update the prototype in real-time in the browser without a Claude round-trip. When the designer is happy, the final values get sent back to Claude as concrete decisions.

## Architecture

Built on top of the superpowers brainstorm server — a zero-dependency Node.js HTTP + WebSocket server that watches for HTML files, serves them to the browser, and records user interactions.

- **server.cjs** — HTTP server, WebSocket, file watching
- **helper.js** — client-side interaction logic (comment mode, pins, popovers, sidebar)
- **frame-template.html** — CSS design system and page chrome
- **start-server.sh / stop-server.sh** — lifecycle management

All annotation logic lives client-side. The server is a thin pass-through that writes interaction events to a file Claude reads on its next turn.

## What This Is Not

- Not a prototyping tool (Figma does that)
- Not a design system manager (Storybook does that)
- Not a code editor (VS Code does that)
- It's the bridge between "Claude rendered something" and "this is actually good" — the refinement loop that turns AI output into craft.
