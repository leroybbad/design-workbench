# Color Strategy

## Rules

### Build surface depth with 3+ levels
Even "white" designs need distinct surface layers — #fafafa, #ffffff, and #f5f5f5 are not the same.

**Why:** Flat same-color stacking makes section boundaries invisible. When cards, sidebars, and page backgrounds share a single white, the visual hierarchy collapses — users can't tell what's elevated, recessed, or interactive.

**How to apply:** Define three base surface tokens at minimum:
- `--color-bg`: page-level base (e.g. #f5f5f5 or #fafafa)
- `--color-surface`: elevated elements like cards and modals (e.g. #ffffff)
- `--color-surface-recessed`: inset elements like inputs, code blocks, inner wells (e.g. #f0f0f0)

The delta between levels should be visible but not jarring — 3–6% lightness difference is usually enough.

**When to break it:** Dark mode designs that use elevation shadows (box-shadow depth) to signal hierarchy instead of lightness. Also immersive full-bleed designs where the visual concept requires flat surfaces.

---

### Accents need variants, not just one color
A single accent hex is not a design system — it's a starting point.

**Why:** One color gets asked to serve as button background, hover state, badge fill, link color, border tint, and icon fill simultaneously. Each context needs a different brightness/saturation level, and using the same hex for all of them produces muddiness or inaccessible contrast.

**How to apply:** Define 4–5 tokens per accent hue:
- `--color-accent`: base (buttons, primary CTAs)
- `--color-accent-hover`: darker by ~10–15% (hover and active states)
- `--color-accent-light`: 90%+ lightness (badge backgrounds, selected row fills, tag chips)
- `--color-accent-border`: subtle tint at 30–40% lightness, low saturation (input focus rings, selected borders)
- `--color-accent-text`: high-contrast variant for text on light backgrounds, if base doesn't meet 4.5:1

Derive these from the base hue in HSL — adjust L and S, keep H consistent.

**When to break it:** Strictly monochrome designs where opacity variants (`rgba(accent, 0.1)`) replace the light token. Also fine for quick prototypes where full token scaffolding is premature.

---

### Warm vs cool tints signal personality
Gray is not neutral — the undertone carries meaning.

**Why:** Warm grays (#f5f0eb, #ede8e3) read as approachable, human, and consumer-oriented. Cool grays (#f0f2f5, #eaecf0) read as precise, systematic, and enterprise-grade. Using the wrong family creates a subtle tonal dissonance that users feel even if they can't name it.

**How to apply:** Define a `--color-tint` token that establishes the undertone bias of the UI:
- Warm: add 2–4% red/yellow to neutral grays (e.g. #f5f0eb for background, #a89e94 for muted text)
- Cool: add 2–4% blue/cyan (e.g. #f0f2f5 for background, #8a9099 for muted text)

Apply the tint token to all surface and neutral values rather than using raw #f5f5f5, so the personality is consistent throughout.

**When to break it:** Intentional subversion — a warm-tinted data tool creates a surprising approachability, a cool-tinted consumer brand creates aspirational distance. Valid as a deliberate creative choice, not an oversight.

---

### Dark mode is not "invert all colors"
Dark mode requires independent design decisions, not a CSS filter.

**Why:** Inverting colors produces inverted problems — pure black (#000000) backgrounds feel harsh and increase perceived contrast, saturated accents become eye-straining on dark backgrounds, and the 3-level surface depth system needs to be rebuilt in reverse. Dark mode done right is dimmer and less saturated, not darker and more vivid.

**How to apply:**
- Surfaces: don't go below #121212 for base bg; use #1e1e1e / #242424 / #2c2c2c for depth levels (3–5% lightness delta, same principle as light mode)
- Accents: desaturate 15–20% and reduce lightness by 10–15% (e.g. a #3b82f6 blue → #5b8fd4 in dark mode)
- Text: use off-white (#e5e5e5 or #ebebeb), not pure white — pure white on dark reads as harsh and breaks the low-contrast calm of a dark UI
- Semantic colors: desaturate equally — dark mode greens and reds should feel muted, not neon

**When to break it:** High-contrast accessibility modes that intentionally maximize contrast (pure white on black). Also branded dark themes where vibrant accents are the intentional aesthetic (e.g. gaming, entertainment, creative tools).

---

### Semantic colors must harmonize with the palette
Stock Bootstrap green/red/yellow will clash with a custom palette.

**Why:** Default semantic colors (#28a745 green, #dc3545 red, #ffc107 yellow) have their own undertones — they're designed to read unambiguously in isolation, not to harmonize with a given palette's hue temperature. In a warm-toned UI, a cool emerald success color creates a jarring tonal break.

**How to apply:** Shift semantic hues to share the palette's undertone:
- Warm palette → teal-leaning success (#2d9e6b), coral/brick error (#d94f38), amber warning (#d97706)
- Cool palette → emerald success (#16a34a), crimson error (#dc2626), yellow-green warning (#ca8a04)

Keep semantic colors recognizable (still clearly green/red/yellow in category) but shift the hue 10–20° to align with the palette undertone. Adjust saturation to match the palette's general saturation level.

**When to break it:** Standardized enterprise interfaces where conventional semantic colors are a usability requirement (users expect the exact green/red they know). Healthcare, finance, and government interfaces often fall here.

---

### Limit the palette, then use it fully
3–5 colors used thoroughly beats 8 colors used sparingly.

**Why:** Palettes sprawl when designers reach for a new color every time they want variety. The result is a UI with 12 hues, none of which feel intentional. Constraints force creativity — a single primary accent with well-constructed tints, shades, and opacity variants can carry an entire product.

**How to apply:** Define exactly:
- 1 primary accent (all interactive UI, CTAs, highlights)
- 1 neutral family (surfaces, borders, text — derived from warm or cool tint)
- 3 semantic hues (success, error, warning — harmonized to palette as above)

That's 5 hues total. For visual variety, create tints and shades of existing hues rather than adding new ones. An accent-light at 10% opacity, an accent-muted at 50% saturation, and an accent-dark at 30% lightness gives three distinct values from one hue.

**When to break it:** Data visualization requiring distinct series colors (line charts, pie charts, multi-variable tables). Even here, build the series palette by rotating hue from the base accent in 30–45° increments rather than picking arbitrary colors.
