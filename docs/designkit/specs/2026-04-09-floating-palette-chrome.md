# Floating Palette Chrome — Spec

**Date:** 2026-04-09
**Status:** Draft
**Goal:** Replace the fixed header bar and bottom drawer chrome with a floating palette toolbar and floating panels — giving 100% of the viewport to the prototype.

**Reference prototype:** `docs/designkit/specs/floating-palette-reference.html`

---

## Problem

The current viewer chrome (fixed top header + bottom drawer panels) eats ~40px permanently from the top and up to 50% of the viewport when Tune/Theme panels are open. The prototype is squeezed between two layers of chrome. For a tool whose primary job is showing a prototype, this is backwards.

## Solution

A floating toolbar + floating panel system that sits on top of the prototype without affecting its layout. The prototype fills 100% of the viewport. Tools are always accessible but never in the way.

---

## Floating Toolbar

A small dark pill (~48px wide) positioned at top-left by default, containing:

1. **DK brand mark** (top) — "D/K" stacked, visual identity
2. **Divider**
3. **Comment** — mode toggle, no panel (icon goes blue when active)
4. **Inspect** — mode toggle, no panel (icon goes blue when active)
5. **Tune** — opens floating panel with typography/spacing/colors/shadow/border tabs
6. **Theme** — opens floating panel with system/colors/fine-tune tabs
7. **Divider**
8. **Changes** — opens floating panel with staged changes list + badge count
9. **Divider**
10. **Send** — disabled/gray by default, blue when changes exist

### Behavior
- **Draggable** from any non-button area (brand, dividers, padding)
- Tool button clicks work normally — no interference with drag
- Only one tool active at a time — clicking a new tool deactivates the previous
- Click active tool again to deactivate
- Panel follows toolbar when dragged (stays positioned relative to toolbar)

---

## Floating Panel

A single shared panel (~300px wide) that displays different content based on which tool is active.

### Structure
```
┌─ Panel Header (draggable) ──────────┐
│  [icon] Title                    [×] │
├─ Tabs (tool-specific) ──────────────┤
│  Tab1 | Tab2 | Tab3                  │
├─ Body (scrollable) ─────────────────┤
│                                      │
│  [content based on active tool]      │
│                                      │
├─ Footer (if needed) ────────────────┤
│                              [Save]  │
└──────────────────────────────────────┘
```

### Positioning
- Appears next to the toolbar (right side by default)
- Flips to left side if not enough room on the right
- Independently draggable via header — can be detached from toolbar
- `max-height: 70vh`, scrollable body

### Tool → Panel mapping
| Tool | Panel opens? | Content |
|------|-------------|---------|
| Comment | No — mode only | Icon toggles blue, click elements to annotate |
| Inspect | No — mode only | Icon toggles blue, hover for property tooltips |
| Tune | Yes | Tabs: Typography, Spacing, Colors, Shadow, Border. Number inputs for values, spacing groups for padding/margin |
| Theme | Yes | Tabs: System, Colors, Fine-tune. System grid, color variants, font/spacing/radius controls |
| Changes | Yes | Staged changes list with remove buttons |

---

## What Goes Away

| Current | Replacement |
|---------|-------------|
| Fixed top header bar (40px) | Gone — toolbar floats |
| App menu (Tools/Edit/View) | Gone — tools are in the toolbar, keyboard shortcuts still work |
| Bottom drawer (Tune panel) | Floating panel |
| Bottom drawer (Theme panel) | Floating panel (same panel, different content) |
| Sidebar (staged changes) | Floating panel (Changes tab) |
| Header "Send" button | Send button in toolbar |
| Comment badge in header | Badge on Changes icon in toolbar |

## What Stays

- All keyboard shortcuts (Ctrl+C/I/T/D/A, Shift+Cmd+Enter, Cmd+Z)
- Comment pin rendering and popovers
- Inspect hover tooltips
- Tune per-element adjustment logic
- Theme token swapping logic
- WebSocket event pipeline
- localStorage persistence

---

## Implementation Scope

### Files to modify
| File | Change |
|------|--------|
| `frame-template.html` | Remove fixed header, menu bar, bottom drawer CSS. Add floating toolbar + panel CSS. Remove old toolbar HTML. |
| `helper.js` | Replace toolbar creation code, panel creation code. Move from bottom drawer to floating panel. Keep all tool logic (tune, theme, comment, inspect) intact — just change where panels render. |

### Files NOT changed
| File | Reason |
|------|--------|
| `server.cjs` | No server changes |
| `theme-data.js` | Data stays the same |
| `SKILL.md` / `EXPLORE.md` | Shortcuts stay the same, just update any references to "header" or "toolbar" |

### Estimated size
- CSS: Replace ~300 lines of header/drawer CSS with ~200 lines of floating CSS (net reduction)
- JS: Refactor toolbar creation (~100 lines) + panel creation (~150 lines). Tool logic stays.
- HTML: Remove header markup from template, add minimal floating toolbar markup

### Risk
This is a significant refactor of the viewer chrome. The tool logic (tune, theme, comment, inspect) stays intact — only the container changes. But the panel lifecycle (open/close/position) is being rewritten.

**Mitigation:** Build on a feature branch. The reference prototype validates the interaction model.

---

## Open Questions

- Should the toolbar be horizontal or vertical? (Current prototype: vertical. Could offer both.)
- Should the toolbar auto-hide after inactivity? (e.g. fade to 20% opacity after 10s of no interaction)
- Should panels remember their position between page reloads?
- Do we need a "collapse toolbar to dot" feature for maximum viewport?
