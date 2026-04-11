---
name: add-reference
description: "Internal dev skill: process URLs or screenshots into reference bank patterns for the design quality pipeline. Not shipped to users."
---

# Add Reference Pattern

Process a URL or screenshot into an annotated reference pattern for the design quality reference bank.

## When to Use

- You have a URL or screenshot of well-designed UI worth cataloging
- Expanding the reference bank with new patterns or techniques
- Batch processing multiple URLs in one session

## Inputs

Developer provides:
- URL or screenshot path (or multiple for batch mode)
- Optional guidance about what to focus on (layout, typography, color strategy, etc.)

---

## Process

### For URLs

**Step 1 — Screenshot**

Use Playwright to capture at two viewports:
- Desktop: 1440x900
- Mobile: 430x932

Wait for network idle. Take full-page screenshots.

**Step 2 — Analyze**

Read both screenshots. Identify distinct patterns worth extracting. Look for:
- Specific techniques demonstrated well (layout, typography, spacing rhythm, color)
- Useful references for the art director role
- Patterns distinctly different from existing `index.json` entries

**Step 3 — Present findings**

Tell the developer what patterns were found, ask which to capture. Format:

```
Found 3 patterns worth capturing:
1. Hero section — editorial typography with dramatic scale contrast
2. Pricing comparison — horizontal tier cards with highlighted plan
3. Footer — dense multi-column with newsletter CTA
Which should I capture? (1, 2, 3, all, or none)
```

**Step 4 — Reconstruct**

Build a minimal annotated HTML snippet per selected pattern. This is NOT a pixel-perfect clone — it's a distilled version capturing:
- Core layout technique
- Typography choices
- Color strategy
- Spacing rhythm

Every CSS property must have a comment explaining WHY it was chosen. Use CSS custom properties and semantic class names throughout.

**Step 5 — Generate metadata**

Write `meta.json` with:
- `id` — kebab-case identifier
- `name` — human-readable name
- `category` — from taxonomy below
- `audience` — from taxonomy below
- `mood` — 2–3 tags from taxonomy below
- `techniques` — 2–3 tags (reuse from existing `index.json` first)
- `principles` — brief design principles at work
- `summary` — one-sentence description
- `why_it_works` — what makes this design decision effective
- `when_to_use` — context where this pattern fits
- `watch_out` — pitfalls or misuse to avoid

**Step 6 — Preview**

Render the reconstructed pattern in the Design Companion browser for side-by-side review. Ask for approval or adjustments before committing.

**Step 7 — Commit**

Write files:
- `skills/designkit/references/patterns/<id>/meta.json`
- `skills/designkit/references/patterns/<id>/pattern.html`

Update `skills/designkit/references/index.json` (keep sorted by `id`).

Commit:
```bash
git add skills/designkit/references/patterns/<id>/
git add skills/designkit/references/index.json
git commit -m "feat(references): add <pattern-name> pattern from <source>"
```

---

### For Screenshots

Same flow starting at Step 2 (skip Step 1).

---

### Batch Mode

1. Screenshot all URLs in parallel
2. Analyze all screenshots
3. Present a consolidated summary across all sources
4. Developer cherry-picks which patterns to capture
5. Process selected patterns sequentially (Steps 4–7 per pattern)

---

## Quality Gates

Push back when:
- **Too similar to existing reference** — suggest updating the existing entry instead
- **Too complex to distill into a single snippet** — suggest splitting into multiple patterns
- **Content-driven quality rather than design technique** — great content doesn't make a great reference; skip it
- **Missing taxonomy tag needed** — ask developer to add it before proceeding

---

## Taxonomy

Current values — add new tags only when nothing fits. Keep taxonomy tight (5–7 values per dimension).

**Categories:** hero, cards, navigation, pricing, dashboard, forms, features

**Audience:** consumer, creative, enterprise, saas

**Mood:** bold, editorial, high-energy, confident, data-driven, clean, professional, modern, dynamic, balanced

**Techniques:** scale-contrast, asymmetric-grid, negative-space, metric-prominence, restrained-palette, clear-hierarchy, mixed-grid-sizes, varied-hierarchy, surface-depth, compact-density, visual-separators, image-text-pairing, rhythm-variation, overlapping-elements
