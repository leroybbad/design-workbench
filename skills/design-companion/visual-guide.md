# Design Companion Visual Guide

Detailed reference for the browser-based design companion tools.

## How It Works

The server watches a content directory for HTML files and serves the newest one. You write HTML to `screen_dir`, the designer sees it in their browser with the companion toolbar overlaid. They use Comment, Inspect, and Tune tools to provide structured feedback, then send it back to you via the events file.

**The companion chrome is always present.** Even full HTML documents are extracted and rendered inside the companion frame — the designer always has access to the toolbar, menus, and keyboard shortcuts.

## Tools

### Comment Mode (Shift+C)

Click any element to attach a text note. A popover appears with a text input — type the note, press Enter. A teardrop pin marks the location. The designer can add multiple comments, review them in the Changes sidebar (Shift+A), then send them all at once.

**What you receive:**
```jsonl
{"type":"annotation","selector":".card-body > h3","tag":"h3","text":"Revenue","note":"too heavy, try 400 weight","status":"new","timestamp":1749000001}
```

The `selector` is a CSS path from `#claude-content`. Use it to find the element in your HTML. The `note` is the designer's feedback — apply it.

### Inspect Mode (Shift+I)

Hover over any element to see a floating tooltip with computed design properties:
- Dimensions (width × height)
- Typography (font-size, line-height, weight, family)
- Colors (color, background-color with hex + swatch)
- Spacing (padding, margin — collapsed notation)
- Border (width, style, color, radius)
- Opacity, box-shadow presence

This is view-only — no events are generated. The designer uses this to understand what's there before deciding what to change.

### Tune Mode (Shift+T)

Click any element to open a bottom drawer panel with tabbed controls:

**Typography tab:** Font Size, Weight, Line Height, Tracking, Opacity sliders
**Spacing tab:** Padding, Margin sliders
**Colors tab:** Color and Background color pickers
**Shadow tab:** Preset ramps from 9 design systems (Tailwind, Material, Apple, Chakra, Polaris, Stripe, Bootstrap, Ant Design, Atlassian) with dark mode adaptation
**Border tab:** Radius, Width sliders

Changes update the element **live** as the designer drags sliders. If a property comes from a CSS custom property (token), the slider adjusts the token on `:root` — all elements using that token update simultaneously.

**Apply to all matching:** A checkbox in the panel footer cascades changes to all elements sharing the same base class. The label shows which class will match (e.g., "Apply to all `div.metric-card`").

**What you receive:**
```jsonl
{"type":"tune","selector":".metric-card","tag":"div","text":"Revenue...","changes":{"padding":"12px"},"tokenChanges":{"--space-md":"0.75rem"},"timestamp":1749000002}
```

`tokenChanges` should be applied to the `:root` token block. `changes` are inline overrides.

### Undo/Redo

**Cmd+Z** undoes the last tune adjustment. **Cmd+Shift+Z** redoes. Each slider drag or shadow preset click is one undo step. Available via Edit menu or keyboard.

### Changes Sidebar (Shift+A)

Lists all staged changes chronologically — comments (💬) and tune adjustments (🎛). Each entry shows the element, the feedback or property changes, and a Remove button. Opens from the right edge of the viewport.

### Send (Shift+Cmd+Enter)

Sends all staged changes to the events file via WebSocket. A toast confirms: "3 updates sent to Claude." The page stays on the current design — no reload. The designer remains in context.

Also accessible via the Send button in the header (appears when changes are staged) or Tools menu.

## App Menu

**Tools:** Deselect Tool (Esc), Comment (Shift+C), Inspect (Shift+I), Tune (Shift+T), Send Comments (Shift+Cmd+Enter)

**Edit:** Undo (Cmd+Z), Redo (Cmd+Shift+Z)

**View:** Show Changes (Shift+A)

## CSS Classes Available (Content Fragments)

When writing content fragments (no `<!DOCTYPE`), the frame template provides these ready-made CSS classes:

### Options (A/B/C choices)
```html
<div class="options">
  <div class="option" data-choice="a" onclick="toggleSelect(this)">
    <div class="letter">A</div>
    <div class="content"><h3>Title</h3><p>Description</p></div>
  </div>
</div>
```

### Cards, Mockups, Split View, Pros/Cons
See the frame template CSS for `.cards`, `.card`, `.mockup`, `.split`, `.pros-cons`, `.placeholder`, `.mock-nav`, `.mock-sidebar`, `.mock-button`, `.mock-input`.

## Platform Notes

**macOS / Linux:** Default mode — the start script backgrounds the server.

**Windows:** Auto-detects and uses foreground mode. Use `run_in_background: true` on the Bash tool call.

## Server Lifecycle

- Auto-exits after 30 minutes of inactivity
- Auto-exits if the parent Claude Code process dies
- Check `$STATE_DIR/server-info` exists before each write — if missing, restart the server
