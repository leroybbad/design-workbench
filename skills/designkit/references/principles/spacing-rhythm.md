# Spacing & Rhythm

## Rules

### Vary vertical padding by section purpose
Section padding should reflect content weight and importance, not uniformity.

**Why:** Uniform padding kills rhythm — every section feels equal in weight, which means none of them feel important. Varied spacing creates a visual "score" with emphasis, pacing, and breathing room. Tall padding signals importance; tight padding signals utility.

**How to apply:** Match padding to section role:
- Hero / opening sections: `padding: 5rem–8rem` (tall = gravitas)
- Content / feature sections: `padding: 3rem–4rem` (standard reading rhythm)
- Dense / data sections: `padding: 2rem–2.5rem` (tight but not cramped)
- CTA / conversion sections: `padding: 2rem–3rem` (focused, not padded)
- Footer: `padding: 3rem–4rem` (generous close, not abrupt)

Define as tokens: `--section-padding-hero`, `--section-padding-content`, `--section-padding-dense`, `--section-padding-cta`, `--section-padding-footer`.

**When to break it:** Single-surface apps (dashboards, tools) where sections are panels rather than narrative beats — consistent rhythm aids spatial orientation more than expressive pacing.

---

### Group related items tighter, separate unrelated items wider
Proximity signals relationship. Items that belong together should be visually closer than items that don't.

**Why:** This is Gestalt proximity — the eye reads spatial grouping as semantic grouping before it reads labels or content. If your card's internal elements and your inter-card gap are the same spacing, the layout looks like noise.

**How to apply:** Use a 3:1 or 4:1 ratio between inter-group and intra-group spacing:
- Items within a card: `0.5rem` apart → cards in a grid: `1.5rem–2rem` apart
- Elements in a form group: `0.25rem–0.5rem` → form groups: `1.5rem` apart
- Lines within a content block: `0.75rem` → blocks within a section: `3rem–4rem`

Define inter/intra spacing as token pairs: `--gap-intra` and `--gap-inter`.

**When to break it:** Masonry or collage layouts where uniform or randomized gaps are an intentional aesthetic. Also decorative grids where the visual repetition is the point.

---

### Page margins anchor the content
Horizontal margins create a "stage" that frames content and signals the context of the interface.

**Why:** Content that runs edge-to-edge feels uncontained and hard to scan. Margins give the eye a consistent entry and exit point, creating the sense that content is placed rather than poured.

**How to apply:** Scale margins to interface density:
- Marketing / editorial: `10%–15%` side margins, or `max-width: 1200px` centered with `auto` margins
- App interfaces: `1rem–2rem` side padding
- Dense dashboards / tools: `0.75rem–1.5rem` side padding

Always define as `--page-margin` token so the entire layout can shift together. Do not hardcode px margins on individual sections — they won't adapt when the token changes.

**When to break it:** Full-bleed immersive experiences — hero video, background image sections, maps, or canvas-based tools — where the "stage" concept would clip the content.

---

### Use the spacing scale consistently
Pick 5–7 values from a scale and use only those. Never invent spacing values mid-design.

**Why:** Arbitrary spacing values (`14px`, `22px`, `37px`) look like accumulated accidents. A consistent scale makes every layout decision defensible and makes the UI feel intentional. It also makes token-based theming possible — you can't rescale what isn't named.

**How to apply:** Define tokens from a base-4 or base-8 scale:
```css
--space-xs:  0.25rem;  /* 4px  */
--space-sm:  0.5rem;   /* 8px  */
--space-md:  0.75rem;  /* 12px */
--space-base: 1rem;    /* 16px */
--space-lg:  1.5rem;   /* 24px */
--space-xl:  2rem;     /* 32px */
--space-2xl: 3rem;     /* 48px */
```
Use only these tokens for all margin, padding, and gap values. For derived cases, use `calc()` (e.g., `calc(var(--space-base) + var(--space-sm))`).

**When to break it:** Optical corrections — 1px or 2px nudges to align text baselines near icons or improve perceived centering. These are invisible at scale but matter at close inspection. Document them with a comment, not a new token.

---

### Dense layouts need tighter spacing AND visual separators
Reducing padding alone makes things cramped. Density requires both tighter spacing and compensating structure.

**Why:** Whitespace does double duty — it separates items AND creates breathing room. In dense layouts you remove the breathing room, so you must replace the separation with an explicit visual signal (border, background alternation, or rule). Without it, items bleed together.

**How to apply:** Reduce padding to `0.5rem–0.75rem` per cell or item, then add one of:
- `1px` borders between rows or columns (`border-bottom: 1px solid var(--color-border)`)
- Alternating row backgrounds (`nth-child(even)` at 3–5% opacity difference)
- A `0.5px` divider line between logical groups

Never reduce padding below `0.5rem` without a separator — it becomes illegible.

**When to break it:** Minimal or editorial designs where generous whitespace is itself the separator. If you're using `3rem+` of padding per item, you don't need borders — the space speaks.

---

### Breathing room is not uniform padding
Sections need different top and bottom padding depending on what comes before and after them.

**Why:** Uniform padding treats the top and bottom of every section as identical contexts, but they're not. A dense data table after a large hero needs extra space to "exhale" after the hero's weight. Two similar content sections back-to-back need equal spacing to feel balanced. Asymmetric padding creates narrative flow; symmetric padding creates stiffness.

**How to apply:** Set `padding-top` and `padding-bottom` independently based on context:
- After a heavy hero or large image: `padding-top: 5rem–6rem` on the next section ("exhale")
- Between two similar-weight sections: equal `padding-top` and `padding-bottom` (e.g., `3rem` each)
- Before a CTA or footer: reduce `padding-bottom` on the preceding section to pull the CTA closer
- Opening section of a page: `padding-top` can be reduced if the nav already provides separation

Use separate top/bottom token variants when the design is systematized: `--section-padding-top-after-hero: 5rem`.

**When to break it:** Component systems where sections are assembled without knowing their neighbors (e.g., a CMS block editor or a design system with isolated section components). In that case, uniform symmetric padding is a safer default — the component can't know its context.
