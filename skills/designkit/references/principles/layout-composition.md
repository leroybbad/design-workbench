# Layout & Composition

## Rules

### Break the symmetric default
AI defaults to centered, symmetric layouts. Asymmetry creates energy and directs attention.

**Why:** Centered, equal-column layouts feel safe but inert. They distribute visual weight evenly, which means no element commands attention. Asymmetry creates hierarchy by giving more real estate to what matters most, and generates forward motion that pulls the eye through the page.

**How to apply:** Use unequal column ratios — 7/5, 8/4, or 2/1 — rather than 6/6 splits. Offset headings so they bleed into the wider column. Place CTAs left- or right-of-center rather than dead center. Anchor hero content to one side of the viewport with the opposing side holding supporting imagery or negative space.

**When to break it:** Comparison layouts where parity is the message — pricing tiers, feature matrices, A/B comparisons. Here symmetry reinforces the idea that options are equivalent and aids direct comparison.

---

### One oversized element per section
Every section needs a visual anchor dramatically larger or bolder than everything else around it.

**Why:** When every element competes at the same scale, the eye has nowhere to land. A single oversized element resolves that competition immediately, giving viewers an entry point and a hierarchy to follow downward.

**How to apply:** Hero sections: headline at 3–5rem, supporting text at 1–1.25rem. Stats sections: the primary number at 3–4rem, the label at 0.875rem. Feature sections: lead illustration or icon at 2–3x the size of supporting ones. Card grids: a featured card spanning 2 columns while siblings occupy 1.

**When to break it:** Uniform data displays — tables, ordered lists, changelog entries — where visual equivalence communicates that items have equal rank. Introducing scale contrast here implies false priority.

---

### Earn density with content
Dense layouts with sparse content feel broken. Match layout density to information density.

**Why:** A compact 4-column grid holding 3 items looks like something failed to load. The layout signals "there is more here" and the content fails to deliver. Density is a commitment — it tells users to expect a lot, and the content must follow through.

**How to apply:** 3–5 cards: generous spacing (2–3rem gaps), large card size, single-column on mobile, 2-column max on desktop. 6–11 items: standard grid (1.5rem gaps), 3-column desktop. 12–20 items: compact grid or table (0.75–1rem gaps), 4-column desktop with truncation. 20+ items: table or virtualized list — abandon grid entirely.

**When to break it:** Intentionally spacious heroes and section intros — sparse is luxurious there, not broken. Intentionally dense dashboards where power users expect information saturation and the density itself communicates professionalism.

---

### Use negative space as a design element, not leftover
Undirected whitespace looks like a bug. Directed whitespace looks luxurious.

**Why:** Whitespace that appears randomly — inconsistent margins, uneven gaps, sections that just trail off — reads as incomplete. Whitespace that follows a system reads as intentional breathing room that elevates the content within it.

**How to apply:** Define margins and gaps as tokens with deliberate values (e.g., `--space-section: 6rem`, `--space-component: 2rem`, `--space-element: 1rem`). Vary section gaps by content type — hero gets more top padding than a feature row. Use consistent gap sizes within a component category so cards always breathe the same way. Point whitespace at something — a large gap above a CTA increases its weight.

**When to break it:** Ultra-compact interfaces — terminals, dense admin panels, IDE-style tools — where users have explicitly opted into information density and whitespace reads as wasted screen real estate.

---

### Full-bleed breaks create visual punctuation
Alternating contained and full-bleed color sections breaks long pages into distinct chapters.

**Why:** A page that stays the same background color throughout blurs into one long scroll. Section changes using full-bleed color blocks act as visual paragraph breaks — they signal "new topic" without requiring a heading to do all the work, and they break the monotony that causes users to stop reading.

**How to apply:** Every 2–3 contained sections, insert a full-bleed section with a contrasting background pulled from the color palette — a tinted surface, a dark band, or a brand-color wash. Alternate the rhythm: light → dark → light, or white → tinted → white. Keep full-bleed sections to 1–2 per page to preserve their impact.

**When to break it:** Single-surface applications — dashboards, editors, document tools, data apps — where the interface is a persistent workspace rather than a scrolling narrative. Full-bleed breaks in these contexts fragment the workspace and undermine spatial coherence.

---

### Grid columns are a vocabulary, not a prison
Use 5-column, 7-column, or irregular spans when content demands it. Don't force 5 items into a 3-column grid leaving an orphaned row.

**Why:** Defaulting to 12-column grids and then fitting content into 3- or 4-column slots ignores the actual quantity and shape of the content. Orphaned items in the last row — a single card sitting alone — signal that the grid is running the layout rather than serving it.

**How to apply:** Let content quantity drive column count. 4 items: 4-column grid, or 2×2. 5 items: 5-column single row, or a 3+2 stacked layout where the second row is intentionally smaller. 7 items: 4+3 staggered rows. Use CSS `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` to let the browser resolve orphan problems responsively. When a 5- or 7-column layout is needed, define it explicitly rather than fighting a 12-column system.

**When to break it:** Standardized card catalogs — e-commerce product grids, image galleries, app icon grids — where uniform repetition is the interface and users expect consistent column structure regardless of item count.
