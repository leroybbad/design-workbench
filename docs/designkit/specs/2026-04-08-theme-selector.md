# Theme Selector — Spec

**Date:** 2026-04-08
**Status:** Draft
**Goal:** Add a browser-side Theme Selector panel (Shift+D) that lets users swap design systems, color palettes, and fine-tune global axes live — no agent regeneration needed.

---

## Problem

After the Explore skill converges on a concept and the user picks a palette, the agent has to regenerate the entire prototype HTML with the new palette applied — slow and token-heavy. During refinement, switching palettes or adjusting global styling means full regeneration again. Every visual identity change costs time and tokens.

## Solution

A new panel in the Designkit Viewer toolbar that swaps CSS custom properties on `#claude-content` in real-time. Three progressive layers — design system, colors, fine-tune — each with explicit Save points. Changes stack in the staged changes sidebar and are only sent to Claude when the user explicitly hits Send.

---

## Panel Structure

### Activation
- **Keyboard shortcut:** Shift+D
- **Toolbar button:** New button in the header toolbar group (alongside Inspect, Tune, Comment), with a palette/paintbrush icon. Badge shows current system name when selected.
- **Panel type:** Bottom drawer, same style as Tune (`#1a1a1e` background, tabs at top)
- **Mutual exclusion:** Opening Theme Selector closes Tune if open, and vice versa. Only one bottom drawer at a time.

### Tabs
```
[ System ]  [ Colors ]  [ Fine-tune ]
```
- Each tab has a **Save** button that locks the current layer
- Unsaved changes show a dot indicator on the tab
- Save highlights the next tab with a subtle pulse to guide the workflow

### State
```js
themeState = {
  system: null,         // palette key e.g. "material"
  colorVariant: null,   // "default" | "dark" | "warm" | "cool"
  accentColor: null,    // hex string or null
  fineTune: {
    fontFamily: null,   // "system" | "inter" | "serif" | "mono"
    spacingMultiplier: 1.0,
    radiusMultiplier: 1.0
  }
}
```

---

## Layer 1: Design System

Shows all 10 palettes as clickable rows. Each row has:
- **5 color dots** — `--color-primary`, `--color-bg`, `--color-surface`, `--color-border`, `--color-text`
- **System name** in bold
- **Active indicator** — border/highlight on selected row
- Subtle divider between Tier 1 (adoptable systems) and Tier 2 (personality archetypes)

### Interaction
- Click any row → immediately preview by swapping ALL `:root` tokens on `#claude-content` (colors, fonts, spacing, radius, shadows)
- Click a different row → previous preview is replaced (not stacked)
- Previews are ephemeral — not persisted or pushed to undo stack
- **Save** → locks choice into `themeState.system`, pushes to undo stack, advances to Colors tab

### Token application
```js
Object.entries(palette.tokens).forEach(([key, value]) => {
  claudeContent.style.setProperty(key, value);
});
```

### Palette data
The 10 palette token sets from `references/palettes.md`, stored as a JS object. Each entry:
```js
{
  key: "material",
  name: "Material Design",
  tier: 1,
  description: "Medium density, bold type hierarchy...",
  tokens: {
    "--color-primary": "#6750A4",
    "--color-primary-hover": "#7E67C1",
    // ... all tokens
  },
  variants: { default: {...}, dark: {...}, warm: {...}, cool: {...} }
}
```

---

## Layer 2: Color Palette

### Pre-built variants
Each design system has 4 color variants that only change `--color-*` tokens — fonts, spacing, radius, shadows stay as the system defined them:

| Variant | Description |
|---------|-------------|
| **Default** | System's original colors (already applied from Layer 1) |
| **Dark** | Dark bg/surface, light text, adjusted borders. Same accent. |
| **Warm** | Warmer neutrals (stone/amber-tinted grays). Same accent. |
| **Cool** | Cooler neutrals (slate/blue-tinted grays). Same accent. |

Each variant is shown as a clickable swatch strip (same 5-dot pattern). Click to preview, Save to lock.

### Accent color picker
Below the pre-built variants. Standard HTML `<input type="color">` for choosing a custom primary color.

When the user picks a color, generate:
- `--color-primary` → chosen color
- `--color-primary-hover` → lighten by ~10%
- `--color-on-primary` → white or black based on relative luminance (>0.5 threshold)

Leave all other color tokens unchanged — the accent picker only modifies the brand color, not the neutral palette. Pre-built variants handle neutral tone shifts.

### Luminance calculation
Reuse the existing luminance function in helper.js (used by shadow dark-mode adaptation):
```js
function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

### Interaction
- Clicking a variant swaps only `--color-*` tokens
- Accent picker updates `--color-primary` and `--color-primary-hover` live as user drags
- **Save** → locks into `themeState.colorVariant` / `themeState.accentColor`, pushes to undo stack

---

## Layer 3: Fine-tune

Global axis controls that modify specific token groups without resetting the whole system.

### Font Family
Clickable chips, one active at a time:
- **System UI** — `-apple-system, BlinkMacSystemFont, system-ui, sans-serif`
- **Inter** — `'Inter', system-ui, sans-serif`
- **Serif** — `'Georgia', 'Charter', serif`
- **Mono** — `'JetBrains Mono', 'Fira Code', monospace`

Sets `--font-family` on `#claude-content`.

### Spacing Density
Single slider, 0.6x to 1.5x multiplier. Scales all `--space-*` tokens proportionally from current system values.
- 0.6x = Corporate Dense feel
- 1.0x = system default
- 1.5x = Clean & Spacious feel

```js
['xs','sm','md','lg','xl'].forEach(size => {
  const base = parseFloat(systemTokens[`--space-${size}`]);
  claudeContent.style.setProperty(`--space-${size}`, `${base * multiplier}rem`);
});
```

### Border Radius
Single slider, 0x to 2x multiplier. Scales `--radius-sm/md/lg` from system values. `--radius-full` stays at `9999px` always.

### Interaction
- All changes preview live as user adjusts
- **Save** → locks into `themeState.fineTune`, pushes to undo stack

---

## Events & Integration

### Staged changes
Theme changes appear in the staged changes sidebar (Shift+A) as a "Theme" entry showing what was changed. They stack alongside Comment and Tune changes.

### Send to Claude (Shift+Cmd+Enter)
All theme changes are included in the events payload:

```json
{
  "type": "theme",
  "system": "material",
  "colorVariant": "dark",
  "accentColor": "#635BFF",
  "fineTune": {
    "fontFamily": "inter",
    "spacingMultiplier": 0.8,
    "radiusMultiplier": 1.2
  },
  "tokenChanges": {
    "--color-primary": "#6750A4",
    "--color-bg": "#1d1d1f",
    "--font-family": "'Inter', system-ui, sans-serif",
    "--space-md": "0.8rem"
  }
}
```

- `tokenChanges` = flattened result of all tokens that differ from prototype's original values (same format Tune uses)
- Semantic fields (`system`, `colorVariant`, `fineTune`) give Claude intent context for design briefs

### Undo/Redo
- Each Save pushes the full token state to the undo stack
- Cmd+Z reverts to the prior Save point
- Preview clicks (before Save) are ephemeral — not undo targets

### Persistence
- Theme state stored in `localStorage` keyed by port (same pattern as annotations)
- On page reload (when Claude pushes new content), theme is re-applied automatically
- User doesn't lose theme choices between iterations

### Relationship to Tune
- Tune (Shift+T) = per-element adjustments via inline styles
- Theme (Shift+D) = global adjustments via `:root` properties on `#claude-content`
- Inline styles always win over `:root` — per-element Tune tweaks are preserved even if global theme changes underneath
- No conflict

---

## Files Changed

| File | Change | ~Lines |
|------|--------|--------|
| `helper.js` | Theme Selector panel logic: creation, tabs, palette swapping, accent generation, slider scaling, events, localStorage | +300-400 |
| `frame-template.html` | Theme Selector CSS: panel styles, swatch rows, chips, sliders, tab states. Toolbar button markup. | +100 |
| `theme-data.js` (new) | Palette token data + color variants for all 10 systems. Injected by `server.cjs` as a `<script>` block (same pattern as helper.js). Keeps helper.js from growing past ~2000 lines. | +400 |
| `server.cjs` | Add `theme-data.js` injection alongside helper.js injection (~3 lines) | +3 |

### Files NOT changed
- `server.cjs` — minor change only: inject theme-data.js alongside helper.js
- `SKILL.md` / `EXPLORE.md` — skill instructions unchanged; theme selector is a browser-side discovery
- `start-server.sh` / `stop-server.sh` — no changes
- `palettes.md` — reference file stays as-is; theme-data.js is the runtime version

---

## Non-destructive guarantees

- **Preview clicks are ephemeral** — tokens swap live but nothing is written to events or persisted until Save
- **Save is additive** — pushes to undo stack, never destroys previous state
- **Changes stack, never auto-submit** — all theme changes queue in staged changes sidebar until explicit Send
- **Layer cascade is transparent** — switching design systems resets colors (new system brings its own), but previous state remains in undo stack
- **Tune and Theme don't conflict** — inline style (Tune) always beats `:root` (Theme)
