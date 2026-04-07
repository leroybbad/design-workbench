# Annotation Mode for Brainstorm Companion

**Date:** 2026-04-07
**Status:** Approved

## Problem

The brainstorm companion handles diverge/converge well (A/B/C option selection) but drops off at refinement. When Claude renders a prototype that's 80% right, the designer has no way to give precise, element-level feedback from the browser. They fall back to describing problems in the terminal ("the heading is too heavy", "the padding on the second card feels off") without spatial anchoring. This makes the refinement loop slower and less precise than it needs to be.

## Solution

Add an **annotation mode** to the brainstorm companion. Designers toggle into comment mode (Shift+C, matching Figma muscle memory), click any element, and attach a text note via an inline popover. Annotations pin to elements as teardrop markers with a point indicating the exact click location. Notes batch up client-side and are sent to Claude holistically when the designer returns to the terminal. Annotations have lifecycle state (new → addressed → unaddressed) so designers can track what Claude has and hasn't acted on across iterations.

## Architecture

**Client-side state (Option A).** All annotation logic lives in `helper.js`. Annotation data persists in `localStorage` keyed by session. The events file is an export format — written once on batch send, read by Claude on the next turn. The server gets one new WebSocket message type but no state management.

### Interaction Model

**Two modes** toggled by Shift+C:
- **Select mode** (default) — existing behavior. Clicking `[data-choice]` elements selects them.
- **Comment mode** — clicking any element creates an annotation. Header chrome shows active state with comment count badge.

**Comment mode flow:**
1. Shift+C activates comment mode. Header updates to show "Comment · 0" with highlighted icon. Pins become visible.
2. Click any element — inline popover appears anchored to click point, text input auto-focused.
3. Type note, press Enter — popover closes, teardrop pin dot appears at click location. Badge increments.
4. Click more elements to add more annotations.
5. Click an existing pin — reopens popover for editing. Can delete from here.
6. Shift+C returns to select mode. Pins hide — clean canvas for evaluating the design without annotation clutter.

**Sidebar:** Collapsible panel toggled via button in header chrome. Lists all annotations as cards showing: pin number, element description, note text, status pill. Each card has delete and status toggle controls. Hidden by default — available on demand for reviewing the full annotation set.

### Annotation Lifecycle

Three states:
- **New** — just created by the designer. Sent to Claude on next batch.
- **Addressed** — automatically set when Claude pushes a new screen. Previous "new" annotations move here. Visually dimmed. Not re-sent.
- **Unaddressed** — manually set by the designer on an "addressed" annotation that wasn't handled well. Re-sent to Claude on next batch.

Annotations can be **deleted** from any state — removed from sidebar, pin, and localStorage.

### Data Model

**Annotation object:**
```json
{
  "id": "ann-1749000001-abc",
  "selector": ".card:nth-child(2) > .card-body > h3",
  "tag": "h3",
  "text": "Dashboard Overview",
  "note": "too heavy, try 400 weight",
  "status": "new",
  "position": { "x": 245, "y": 180 },
  "timestamp": 1749000001
}
```

Fields:
- `id` — unique, generated client-side (timestamp + random suffix)
- `selector` — CSS selector path from `#claude-content` root. Prefers classes and semantic tags over nth-child.
- `tag` + `text` — human-readable element identity for Claude (belt and suspenders with selector)
- `note` — the designer's feedback text
- `status` — `"new"` | `"addressed"` | `"unaddressed"`
- `position` — click coordinates relative to the annotated element, for pin placement
- `timestamp` — creation time (internal, not surfaced to user)

**localStorage key:** `annotations-{port}` where port is from the server URL (unique per session).

### Events File Format

What Claude reads — only annotations with status `new` or `unaddressed`:

```jsonl
{"type":"annotation","id":"ann-1749000001-abc","selector":".card:nth-child(2) > .card-body > h3","tag":"h3","text":"Dashboard Overview","note":"too heavy, try 400 weight","status":"new","timestamp":1749000001}
{"type":"annotation","id":"ann-1749000002-def","selector":".mockup-body > p","tag":"p","text":"Welcome to your dashboard","note":"still wrong after revision","status":"unaddressed","timestamp":1749000002}
```

### Batch Send Mechanism

Annotations are written to the events file at one point: when the client receives a WebSocket `reload` message (Claude pushed a new screen).

Sequence:
1. Claude writes new HTML file to content directory
2. Server detects it via `fs.watch`, broadcasts `{type: "reload"}` to WebSocket clients
3. Client intercepts the reload message
4. Client collects all annotations with status `new` or `unaddressed`
5. Client sends one WebSocket message: `{type: "annotations", items: [...]}`
6. Server receives it, writes each item as a JSONL line to the events file
7. Client transitions all `new` annotations to `addressed` in localStorage
8. Client reloads the page

This means the events file Claude reads on its next turn contains the batch of actionable annotations alongside any click events from option selection.

**Pin re-rendering after reload:** After the page reloads with new content, helper.js reads annotations from localStorage and attempts to re-attach pins by querying each annotation's stored selector against the new DOM. Pins that match are rendered; annotations whose selectors no longer match (because Claude changed the HTML structure) appear in the sidebar with a "detached" indicator but no pin on the canvas.

### Selector Generation

When the user clicks an element in comment mode, `helper.js` computes a CSS selector path:

1. Walk up from the clicked element to `#claude-content` (the content root)
2. At each level, prefer: `#id` > `.className` > `tag:nth-of-type(n)`
3. Skip frame-template selectors (`.header`, `.indicator-bar`, `.main`)
4. Produce a readable path like `.card:nth-child(2) > .card-body > h3`

The goal is a selector Claude can use to find the element in the HTML it authored. Doesn't need to be globally unique in a CSS sense — just unambiguous within `#claude-content`.

## UI Components

### Header Chrome

- Add comment icon button to the right side of the header bar, near "Connected" status
- Active state: icon highlighted (accent color), shows "Comment · {count}"
- Inactive state: icon muted, no label
- Sidebar toggle button (separate from comment toggle)

### Teardrop Pin Dots

- Inverted teardrop shape with a point at the bottom indicating exact click location
- Numbered (1, 2, 3...) in order of creation
- Color-coded by status:
  - Accent blue — new
  - Muted gray — addressed
  - Orange — unaddressed
- Positioned absolutely relative to the annotated element using stored position coordinates
- Clickable in comment mode (opens popover for edit/delete), non-interactive in select mode
- Visible in comment mode, hidden when comment mode is toggled off (clean canvas)

### Inline Popover

- Small card (matches light/dark theme) anchored near the pin position
- Contains single text input, auto-focused on open
- Enter saves and closes, Escape cancels and closes
- Positioned above or below the element depending on viewport space
- Shows delete button when editing an existing annotation
- Transient — never visible when user isn't actively creating or editing

### Sidebar Panel

- Slides in from right edge of viewport
- Fixed position, doesn't push content
- Lists annotations as cards, ordered by creation time
- Each card shows: pin number (color-coded), truncated element text, note text, status pill
- Controls per card: delete (all states), "mark unaddressed" toggle (addressed items only)
- Scrollable for long annotation lists
- Header with total count and "Close" button

## File Changes

### `helper.js`

All annotation logic added here:

- Shift+C key handler for mode toggle
- Click handler in comment mode: compute selector, create annotation, show popover
- Popover creation, positioning, save/cancel/delete handlers
- Pin dot rendering and re-rendering
- Sidebar panel creation, population, toggle
- localStorage read/write for annotation persistence
- Batch send: intercept WebSocket reload, send annotations, transition states, then reload
- Selector generation utility
- Comment count badge updates

### `frame-template.html`

CSS additions only:

- `.annotation-pin` — teardrop shape with point, numbered, color variants for status
- `.annotation-popover` — themed card, input styling, positioning
- `.annotation-sidebar` — right-edge panel, card list, status pills, slide-in animation
- `.comment-toggle` — header button active/inactive states
- `.comment-badge` — count badge next to comment icon
- Color variables: `--annotation-new` (accent blue), `--annotation-addressed` (gray), `--annotation-unaddressed` (orange)

No structural HTML changes — all annotation DOM is created by helper.js at runtime.

### `server.cjs`

One addition to `handleMessage`:

- Recognize `{type: "annotations", items: [...]}` messages
- Write each item as a JSONL line to the events file (same as click events)
- No annotation state management — server is a pass-through

## Not in Scope

- Inspect mode (spacing/color/sizing overlays)
- Tune mode (live design token sliders)
- Multi-page flow navigation
- Annotation export/import across sessions
- Visual companion documentation updates
- Skill prompt (SKILL.md) updates
