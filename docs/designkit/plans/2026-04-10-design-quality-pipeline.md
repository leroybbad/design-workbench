# Design Quality Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sub-agent pipeline (art director, builder, critic) backed by a curated reference bank and design principles to raise the visual quality of generated prototypes.

**Architecture:** Three stages — art director selects references and writes a creative brief, builder generates HTML with that brief as input, critic reviews against a quality rubric and triggers one revision if needed. A reference bank of annotated pattern HTML and design principles files provides the knowledge base. The pipeline integrates into the existing SKILL.md as a new section, invoked for fresh prototypes but skipped for incremental refinements.

**Tech Stack:** Markdown skill files, JSON metadata, annotated HTML patterns, Claude Code sub-agents via the Agent tool.

---

## Task 1: Create `anti-patterns.md` Principles File

The anti-patterns file is the highest-leverage single file — it directly tells the critic what to flag and the art director what to avoid. Write it first so every subsequent task can reference it.

**Files:**
- Create: `skills/designkit/references/principles/anti-patterns.md`

- [ ] **Step 1: Create the directory structure**

```bash
mkdir -p skills/designkit/references/principles
```

- [ ] **Step 2: Write anti-patterns.md**

Write the file to `skills/designkit/references/principles/anti-patterns.md` with the following content:

```markdown
# Anti-Patterns

Common AI-generated design failures. Each entry describes what the pattern looks like, why it's bad, and what to do instead.

The critic agent treats these as hard failures — any match triggers a revision pass.

## Layout

### Center-Everything Syndrome
All text and elements center-aligned across 3+ consecutive sections.

**Why it's bad:** Center alignment removes visual anchoring. The eye has no consistent left edge to return to, so scanning becomes fatiguing. It also makes every section feel identical — no rhythm, no hierarchy.

**What to do instead:** Left-align body text and most headings. Reserve center alignment for short hero headlines, CTAs, or single-line elements that benefit from symmetry. Mix alignment across sections to create rhythm.

**When to break it:** Single-surface landing pages with very short copy (3-5 words per line max) where center alignment creates intentional symmetry.

### Uniform Grid Monotony
Every card, tile, or content block is identical in size, padding, and visual weight. A 3x3 grid where all 9 items look exactly the same.

**Why it's bad:** Equal weight means no hierarchy. The viewer doesn't know where to look first. It signals "I generated N items and put them in a grid" rather than "I designed an information hierarchy."

**What to do instead:** Vary at least one dimension — make the primary item span 2 columns, give the featured card a different background, vary card heights with content. Bento grids with mixed sizes create natural scanning paths.

**When to break it:** Genuinely uniform data (e.g., a team roster, a product catalog where parity matters). Even then, consider a featured/highlighted item.

### Missing Focal Point
No single element on the page demands attention. Everything is the same visual weight — medium-sized text, medium spacing, medium contrast.

**Why it's bad:** Without a focal point, the page has no entry point. The eye bounces randomly. Every element competing equally means none win.

**What to do instead:** Pick one element per section and make it dramatically different — an oversized number, a full-bleed image, a headline that's 3x the body text size. The focal point anchors the visual hierarchy and gives viewers a starting point.

**When to break it:** Reference/documentation pages where uniform scannability is the goal. Even then, the page title should be a clear entry point.

## Typography

### Single-Weight Flatness
The entire page uses one font-weight (typically 400). Headings, body, labels — all the same weight.

**Why it's bad:** Weight is a primary hierarchy signal. Without weight variation, the only hierarchy tool left is size, and AI tends to use timid size differences. The result looks like a wall of text with slightly different sizes.

**What to do instead:** Use exactly two weights — regular (400) for body, bold/semibold (600-700) for headings and emphasis. The binary creates an automatic primary/secondary distinction.

**When to break it:** Typographic designs that use a single weight at dramatically different scales (e.g., 12px vs 72px). Scale alone can create hierarchy, but the contrast must be extreme (4:1+ ratio).

### Timid Scale Differences
Heading is 1.25rem, body is 1rem. The "hierarchy" is a 25% size difference that's barely perceptible.

**Why it's bad:** Subtle size differences look like mistakes, not decisions. The viewer can't tell if the 1.25rem text is a heading or just slightly larger body text.

**What to do instead:** Use dramatic scale contrast. Headings should be 2-4x body text for clear hierarchy. A 3rem heading with 1rem body (3:1 ratio) reads as intentional design. A 1.25rem heading with 1rem body reads as a rendering bug.

**When to break it:** Dense data interfaces (tables, dashboards) where space is limited. Even there, use weight and color to distinguish levels rather than relying on barely-different sizes.

## Color

### Gray-Plus-One-Accent
The entire palette is white/gray surfaces with a single accent color (usually blue or purple). No surface depth, no tonal variation.

**Why it's bad:** It's the default output of every AI code generator. It signals "I didn't make a color decision." Real designed products have surface depth — subtle warm/cool tints on backgrounds, muted accent variants for hover/active states, tonal progression from surface to elevated surface.

**What to do instead:** Build a palette with at least: 2-3 surface levels (base, elevated, recessed) with subtle tonal differences; a primary accent with light/dark variants; a semantic set (success, warning, danger) that harmonizes with the primary. Even "minimal" palettes have intentional surface variation.

**When to break it:** Truly monochrome editorial designs where the restriction is the aesthetic. But this must be a deliberate choice with strong typography to compensate, not a default.

### Flat Surface Stacking
Multiple content sections stacked vertically with no visual differentiation between them — same background, same padding, no borders or separation.

**Why it's bad:** Without surface variation, the page reads as one continuous scroll of text. Section boundaries are invisible. The viewer can't chunk content into digestible groups.

**What to do instead:** Alternate surface colors (even subtly — #fafafa vs #ffffff), use full-bleed color breaks for emphasis sections, add top borders or generous vertical spacing to mark transitions. The viewer should be able to squint and still see the section boundaries.

**When to break it:** Long-form editorial content (blog posts, documentation) where continuous flow is desirable and section headings provide sufficient structure.

## Spacing

### Monotone Vertical Rhythm
Every section uses identical padding — typically `padding: 4rem 0` or `padding: 3rem 0` repeated throughout.

**Why it's bad:** Uniform spacing removes rhythm. A page with the same gap everywhere feels mechanical and undesigned. Different content types need different breathing room — a hero needs generous space, a dense data section can be tighter, a CTA can be compact.

**What to do instead:** Vary vertical padding by section purpose: hero/intro sections get the most space (5-8rem), content sections get moderate space (3-4rem), dense sections can tighten (2-2.5rem), CTAs can be compact (2-3rem). The variation creates a visual rhythm the eye follows.

**When to break it:** Uniform spacing works in highly structured interfaces like settings pages or form sequences where consistent rhythm aids completion. But even there, group related items tighter and add more space between groups.

### Padding Overload
Excessive internal padding on every element — cards with 2rem+ padding, buttons with huge padding, containers that are more whitespace than content.

**Why it's bad:** It's the AI equivalent of "I don't know how big this should be, so I'll add extra space to be safe." Excessive padding makes interfaces feel bloated and wastes screen real estate. It also reduces information density to the point where one screen shows very little useful content.

**What to do instead:** Match padding to content type. Cards: 1-1.5rem. Buttons: 0.5-0.75rem vertical, 1-1.5rem horizontal. Page sections: 1-1.5rem horizontal. Compact elements (tags, badges): 0.25-0.5rem. Dense layouts earn tighter spacing.

**When to break it:** Hero sections or isolated promotional elements where generous padding creates intentional focus through whitespace.

## Structure

### Token-Less Styling
Hardcoded values (colors, spacing, radii) instead of CSS custom properties. Magic numbers scattered through the stylesheet.

**Why it's bad:** Beyond the tooling issue (the Tune panel can't detect or cascade changes to hardcoded values), it signals "these values aren't part of a system." Real design systems define tokens; one-off values are exceptions. Hardcoded values also make consistency accidental rather than guaranteed.

**What to do instead:** Define all repeated values as CSS custom properties in a `:root` block. Even one-off overrides should reference the token scale (`calc(var(--space-md) * 1.5)` rather than `1.5rem`).

**When to break it:** Truly one-off decorative values (a specific gradient angle, a unique border pattern) that wouldn't be reused. But the color values in that gradient should still be tokens.

### Foreign Tokens (Established Codebase Mode)
Introducing new CSS custom properties that don't exist in the repo's established token system.

**Why it's bad:** The prototype looks designed but won't port cleanly. Every foreign token becomes a merge decision — adopt it into the system (scope creep) or replace it with an existing token (rework). It also signals the prototype didn't respect the existing design language.

**What to do instead:** Use only tokens that exist in the repo's system. If the system lacks a token you need, note it as a gap ("this design needs a `--surface-elevated` token that doesn't exist yet") rather than silently inventing one.

**When to break it:** When the user explicitly asks for a design direction that requires expanding the token system. But this should be a conscious, documented decision, not an accidental side effect.
```

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/references/principles/anti-patterns.md
git commit -m "feat: anti-patterns principles file for design quality pipeline"
```

---

## Task 2: Create `typography.md` Principles File

**Files:**
- Create: `skills/designkit/references/principles/typography.md`

- [ ] **Step 1: Write typography.md**

Write the file to `skills/designkit/references/principles/typography.md`:

```markdown
# Typography

Rules for typographic hierarchy, scale, weight, and rhythm in UI design.

## Rules

### Limit to two font weights per surface
Use regular (400) and bold/semibold (600-700). A third weight creates visual noise — the eye can't build a reliable hierarchy from three similar-but-different weights.

**Why:** Three weights force the viewer to consciously rank them ("Is medium more important than regular? Less important than bold?"). Two weights create an automatic binary: primary/secondary.

**How to apply:** Set body text at weight 400, headings and emphasis at weight 600 or 700. If you need more hierarchy levels, use size or color — not a third weight.

**When to break it:** Data-dense dashboards where a monospace or tabular weight serves a functional (not decorative) role. Also acceptable: a single-weight design where hierarchy comes entirely from extreme scale contrast (see next rule).

### Establish hierarchy through dramatic scale contrast
Headings should be 2-4x body text size. A 3:1 ratio reads as intentional design. A 1.25:1 ratio reads as a rendering inconsistency.

**Why:** The human eye detects size differences logarithmically. A 20% increase is barely noticeable. A 200% increase is unmistakable. Timid scale differences create ambiguity about what's a heading and what's body text.

**How to apply:** Body text at 1rem (16px). Subheadings at 1.25-1.5rem. Section headings at 2-2.5rem. Page/hero headings at 3rem+. Skip sizes — don't use every step in the scale. The gaps between levels are what create hierarchy.

**When to break it:** Compact UI elements (dropdowns, tooltips, sidebars) where space constraints demand tighter ratios. Even there, combine size with weight to maintain distinction.

### Tighten letter-spacing on large type
As type gets larger, its default letter-spacing becomes visually loose. Headings at 2rem+ benefit from negative letter-spacing (-0.01em to -0.03em).

**Why:** Type designers optimize letterfitting for body sizes (14-18px). At display sizes, the default spacing looks gappy and amateurish. Tightening restores visual density and makes headlines feel crafted.

**How to apply:** Body text: default letter-spacing (0). Subheadings: -0.01em. Headings: -0.02em. Display/hero: -0.03em. These are starting points — adjust by typeface.

**When to break it:** Typefaces with tight default metrics (condensed faces, tight display fonts). Also: uppercase text, which needs more spacing, not less.

### Use line-height to control density
Line-height is the primary lever for how dense or airy text blocks feel. Don't use a single line-height everywhere.

**Why:** Headings with 1.6 line-height look double-spaced and floaty. Body text with 1.2 line-height feels cramped. Different text roles need different rhythm.

**How to apply:** Headings: 1.1-1.2 (tight, dense, architectural). Body text: 1.5-1.6 (comfortable reading). Captions/labels: 1.3-1.4 (compact but legible). Single-line elements (buttons, badges): 1.

**When to break it:** Very long body text (articles, documentation) benefits from 1.7-1.8 for sustained reading comfort. Short UI text can go tighter.

### Headlines earn their size
A large heading is a promise that important content follows. An oversized heading on generic content ("Welcome to Our Platform") wastes the visual emphasis.

**Why:** Scale is a limited resource. If every heading is large, none are large. Reserve dramatic size for content that rewards the attention — a key metric, a product name, a compelling statement.

**How to apply:** Before sizing a heading, ask: "Is this the most important text on the surface?" If yes, make it 3x+ body size. If no, keep it moderate (1.5-2x). Not every heading needs to be a hero.

**When to break it:** Editorial/magazine layouts where oversized type IS the aesthetic, even for secondary content. The scale itself creates the visual interest, independent of content hierarchy.

### Choose typeface pairings intentionally
Using system-ui or a single sans-serif for everything is safe but bland. A serif/sans-serif pairing or a distinctive display face adds personality.

**Why:** A single typeface at different sizes is a hierarchy tool. Two typefaces create contrast and personality — the combination communicates brand character before anyone reads a word.

**How to apply:** In greenfield mode: consider a display face for headings paired with a neutral sans for body. Sans + mono is effective for technical products. Serif + sans signals editorial authority. In established codebase mode: use whatever the repo defines — do not introduce new typefaces.

**When to break it:** Highly technical/utilitarian interfaces (dev tools, admin panels) where a single sans-serif family is the right choice for clarity over personality.
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/references/principles/typography.md
git commit -m "feat: typography principles file for design quality pipeline"
```

---

## Task 3: Create `color-strategy.md` Principles File

**Files:**
- Create: `skills/designkit/references/principles/color-strategy.md`

- [ ] **Step 1: Write color-strategy.md**

Write the file to `skills/designkit/references/principles/color-strategy.md`:

```markdown
# Color Strategy

Rules for palette construction, surface depth, accent use, and tonal variation in UI design.

## Rules

### Build surface depth with 3+ levels
A designed interface has visible layers — base, elevated, and recessed surfaces. Even "white" designs use at least #fafafa / #ffffff / #f5f5f5.

**Why:** Flat same-color stacking makes section boundaries invisible. Surface depth creates visual grouping without needing borders or dividers. The viewer can squint and still see the structure.

**How to apply:** Define at least three surface tokens: `--color-bg` (page base), `--color-surface` (cards, panels — elevated), `--color-surface-recessed` (inset areas, code blocks, secondary panels). Alternate them across sections. Use subtle tonal shifts — 2-3% lightness difference is enough.

**When to break it:** Dark mode designs where surface depth comes from elevation shadows rather than color shifts. Also: immersive full-bleed designs where the background IS the design element.

### Accents need variants, not just one color
A single accent color (one blue, one purple) creates flat interactions. Designed products have a primary accent plus light/dark/muted variants for hover, active, backgrounds, and borders.

**Why:** One accent has to serve too many roles — button fills, link text, focus rings, badge backgrounds. It either works for buttons and is too strong for badges, or works for badges and is too weak for buttons. Variants let each usage have appropriate visual weight.

**How to apply:** For each accent, define at least: base (buttons, primary actions), hover/active (slightly darker), light (badge backgrounds, tinted surfaces — 90%+ lightness), border (subtle tint for outlined elements). That's 4-5 tokens per accent color.

**When to break it:** Strictly monochrome designs where the single-accent constraint is the aesthetic. But even there, use opacity variants (`rgba(accent, 0.1)` for backgrounds, `rgba(accent, 0.7)` for secondary text).

### Warm vs cool tints signal personality
Gray is not neutral — it's cold. A product with warm grays (#f5f0eb instead of #f5f5f5) feels approachable. Cool grays (#f0f2f5) feel technical and precise.

**Why:** Tint direction is one of the strongest subliminal personality signals in UI. Warm tints say "consumer, friendly, creative." Cool tints say "enterprise, serious, data-driven." Choosing the wrong tint undermines the product's voice.

**How to apply:** For consumer/creative products: warm the grays with a yellow or orange undertone. For enterprise/technical products: cool the grays with a blue or slate undertone. For neutral products: use true neutral grays but add warmth or coolness through the accent color. Define a `--color-tint` token that shifts the entire surface palette.

**When to break it:** Products that deliberately subvert expectations — a warm, approachable data tool or a cool, minimal consumer brand. The break should be intentional, not accidental.

### Dark mode is not "invert all colors"
Dark mode requires independent surface depth, different contrast ratios, and desaturated accent colors. Inverting a light theme produces washed-out, eye-straining results.

**Why:** Light text on dark surfaces has higher perceived contrast. Colors that look fine on white backgrounds become neon on dark backgrounds. Surface depth inverts — lighter surfaces are "elevated" in dark mode (opposite of light mode).

**How to apply:** Darken and desaturate accent colors by 15-20%. Reduce surface depth contrast (dark surfaces should vary by 3-5% lightness, not 10%). Use `--color-surface: #1e1e1e` (elevated) against `--color-bg: #121212` (base). Text should be off-white (#e5e5e5) not pure white (#ffffff) to reduce glare.

**When to break it:** High-contrast accessibility modes that specifically need maximum contrast. Also: branded dark themes where vibrant accents on dark surfaces ARE the design language (gaming, entertainment).

### Semantic colors must harmonize with the palette
Success (green), warning (amber), danger (red) should feel like they belong to the same color family as the primary palette, not like they were pulled from a different product.

**Why:** Stock semantic colors (Bootstrap green/red/yellow) clash with most custom palettes. They look bolted-on rather than integrated. This is one of the most obvious signs of undesigned UI.

**How to apply:** Adjust semantic hues to share the undertone of your palette. If your palette is warm, shift green toward teal and red toward coral. If cool, shift green toward emerald and red toward crimson. Test semantic colors on your actual surface colors, not in isolation.

**When to break it:** Standardized enterprise interfaces where users expect conventional semantic colors because they switch between many products (e.g., admin tools, B2B SaaS with mixed-product dashboards).

### Limit the palette, then use it fully
3-5 colors used thoroughly is better than 8 colors used sparingly. A small palette applied consistently to surfaces, text, borders, and interactions creates cohesion. A large palette used inconsistently creates noise.

**Why:** Each additional color is a decision the viewer has to process. Fewer colors mean fewer decisions, which means faster comprehension. The design feels "tight" when the same 3-4 colors appear everywhere for clear, predictable reasons.

**How to apply:** Define: 1 primary accent, 1 neutral family (backgrounds/text/borders), and 3 semantic colors. That's 5 hues total. If you need more variety, create tints and shades of existing colors rather than introducing new hues.

**When to break it:** Data visualization and analytics interfaces where each data series needs a distinct color. But even there, build the data palette from your base hue with hue rotation rather than picking arbitrary colors.
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/references/principles/color-strategy.md
git commit -m "feat: color strategy principles file for design quality pipeline"
```

---

## Task 4: Create `layout-composition.md` Principles File

**Files:**
- Create: `skills/designkit/references/principles/layout-composition.md`

- [ ] **Step 1: Write layout-composition.md**

Write the file to `skills/designkit/references/principles/layout-composition.md`:

```markdown
# Layout & Composition

Rules for grid strategies, asymmetry, focal points, density, and page structure in UI design.

## Rules

### Break the symmetric default
AI defaults to centered, symmetric layouts — equal columns, centered headings, mirrored sections. Asymmetry creates visual energy and directs attention.

**Why:** Symmetric layouts feel stable but static. Asymmetry creates tension and movement — the eye follows the imbalance. It also allows different content types to occupy proportionally appropriate space rather than forcing everything into equal columns.

**How to apply:** Use unequal column ratios: 7/5, 8/4, 2/1 instead of 6/6 or 4/4/4. Offset headings from their content blocks. Place the primary CTA off-center. Create one "heavy" side and one "light" side per section.

**When to break it:** Comparison layouts (pricing tiers, A/B feature tables) where visual symmetry reinforces conceptual parity. Also: centered hero headlines where symmetry creates intentional gravity.

### One oversized element per section
Every section needs a visual anchor — one element that's dramatically larger, bolder, or more prominent than everything else. Without it, the section is a soup of equally weighted items.

**Why:** The oversized element creates an entry point. The viewer sees it first, then scans outward to understand the supporting content. This is the "inverted pyramid" of visual design — start with the biggest thing.

**How to apply:** In hero sections: the headline (3-5rem). In stat sections: the primary number (3-4rem, bold). In feature sections: the illustration or icon (2-3x the size of supporting icons). In card grids: one featured card that spans 2 columns or has a distinct background.

**When to break it:** Uniform data displays (tables, lists) where every row should have equal visual weight. But the section itself should have a heading or filter bar that acts as the entry point.

### Earn density with content
Dense layouts with sparse content feel broken. Spacious layouts with dense content feel wasteful. Match the layout density to the actual information density.

**Why:** AI tends to create layouts that are either uniformly padded (wasting space) or uniformly dense (cramming items without enough content to justify it). The result feels "off" even when structurally correct because the density doesn't match the content.

**How to apply:** Count the actual content items. 3-5 cards? Use generous spacing and large cards. 12-20 items? Use a compact grid or table. A sidebar with 4 links shouldn't have the same padding as a sidebar with 20 links. Let content quantity drive layout density.

**When to break it:** Intentionally spacious hero sections or intentionally dense dashboards where the density itself is the design choice, independent of current content volume.

### Use negative space as a design element, not leftover
Whitespace should be placed with the same intentionality as content. Large margins, generous section spacing, and breathing room between elements are design decisions, not "emptiness."

**Why:** Undirected whitespace (random gaps, uneven margins) looks like a layout bug. Directed whitespace (consistent generous margins, intentional asymmetric spacing) looks luxurious and confident. The difference is whether the whitespace was designed or left over.

**How to apply:** Define whitespace intentionally: page margins should be a token (`--page-margin`), section gaps should vary by section type (see spacing-rhythm.md), and internal element spacing should follow a scale. If there's a large gap, it should be the same size as other intentional gaps — not a unique value.

**When to break it:** Ultra-compact interfaces (terminals, code editors, dense admin panels) where minimizing whitespace is a functional requirement. Even there, consistent minimal spacing is better than zero spacing.

### Full-bleed breaks create visual punctuation
Alternating between contained content and full-bleed color sections breaks up long pages and creates natural pause points.

**Why:** A page of contained-width content on the same background feels like a single endless scroll. Full-bleed color breaks create "chapters" — the viewer mentally groups the content before and after the break. They also provide opportunities for visual impact (dark sections, accent-colored CTAs, image breaks).

**How to apply:** Every 2-3 content sections, insert a full-bleed section with a different background color. Use this for emphasis content: testimonials, CTAs, key stats, or transition statements. The color should come from the existing palette (a darker shade, an accent tint, a surface variant).

**When to break it:** Single-surface applications (dashboards, editors, settings pages) that should maintain consistent surface treatment. Full-bleed breaks are for marketing/landing pages and multi-section scrolling experiences.

### Grid columns are a vocabulary, not a prison
12-column grids exist to provide flexibility, not to force everything into even divisions. Use 5-column, 7-column, or irregular spans when the content demands it.

**Why:** AI defaults to 3-column or 4-column grids because they divide evenly. But real content rarely comes in neat groups of 3 or 4. Forcing 5 items into a 3-column grid means one row has 3 items and the next has 2 — the orphaned pair looks unfinished.

**How to apply:** Let content quantity drive column count. 5 features? Use a 5-column grid at desktop (or 3+2 with a wider gap). 7 stats? Use a 7-column strip. For mixed content, use CSS grid with named areas or auto-fit rather than fixed columns. Avoid orphaned items in the last row.

**When to break it:** Standardized card catalogs (product listings, image galleries) where uniform columns create expected browsing patterns. Users know how to scan a 4-column product grid.
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/references/principles/layout-composition.md
git commit -m "feat: layout composition principles file for design quality pipeline"
```

---

## Task 5: Create `visual-hierarchy.md` Principles File

**Files:**
- Create: `skills/designkit/references/principles/visual-hierarchy.md`

- [ ] **Step 1: Write visual-hierarchy.md**

Write the file to `skills/designkit/references/principles/visual-hierarchy.md`:

```markdown
# Visual Hierarchy

Rules for directing viewer attention through scale, weight, position, contrast, and whitespace.

## Rules

### Hierarchy needs exactly 3 levels to be legible
Primary, secondary, and tertiary. More than three levels and the viewer can't track the ranking. Fewer than three and there's not enough differentiation.

**Why:** Human working memory handles ~3 categories of "importance" before they blur together. A heading, body, and caption is intuitive. A heading, subheading, body, secondary body, caption, and micro-label requires conscious decoding.

**How to apply:** Define three text levels: primary (headings — large, bold), secondary (body text — regular size, regular weight), tertiary (metadata, timestamps, labels — small, muted color). Everything on the page should fit into one of these three levels. If you need a fourth level, reconsider whether two items can merge.

**When to break it:** Complex data interfaces (IDEs, financial dashboards) where domain experts expect 4-5 levels of nested hierarchy. But each additional level should be distinguished by at least 2 visual dimensions (size + weight, or size + color) to remain distinguishable.

### Use at least 2 visual dimensions to separate levels
Size alone is not enough. Weight alone is not enough. Combine size + weight, or size + color, or weight + position to make hierarchy unmistakable.

**Why:** A single dimension (e.g., only size) requires dramatic contrast to be noticed — 3:1 ratio minimum. Two dimensions (size + weight) create hierarchy at more subtle contrasts because the signals reinforce each other. The viewer doesn't have to look closely to see the difference.

**How to apply:** Primary text: large (2-3x body) + bold (600-700) + full-strength color. Secondary text: body size + regular weight + full-strength color. Tertiary text: small (0.75-0.875x body) + regular weight + muted color (60-70% opacity or a lighter gray). Each level differs on at least 2 of the 3 axes.

**When to break it:** Single-weight typographic designs that achieve hierarchy purely through extreme scale contrast (see typography.md). This is valid but requires dramatic ratios (5:1+) to work.

### Position creates implicit hierarchy
Top-left is seen first (in LTR languages). Larger elements are seen before smaller ones. Elements above the fold get more attention than those below. These are not guidelines — they're neurological facts.

**Why:** Eye-tracking research consistently shows an F-pattern or Z-pattern reading flow. Content placed at the natural entry points (top-left for text-heavy, center for visual-heavy) gets seen first. Burying important content below the fold or in the right column reduces its effective importance regardless of how it's styled.

**How to apply:** Place the most important element in the top-left quadrant or centered above the fold. Primary actions (CTAs, main navigation) should be in high-attention zones. Secondary information can go below the fold or in sidebars. Don't rely on styling alone to convey importance — position reinforces it.

**When to break it:** Right-to-left interfaces (Arabic, Hebrew). Also: deliberately subversive layouts that place the focal point in an unexpected position for visual impact — but this only works if the surrounding layout clearly guides the eye there.

### Contrast is relative, not absolute
An element is "prominent" only relative to its neighbors. A bold heading next to other bold headings is not prominent. A regular-weight heading in a sea of bold text is.

**Why:** The eye detects differences, not absolute values. A button with 4px border-radius looks rounded on a page of sharp corners, and looks sharp on a page of 16px rounded elements. Prominence is about contrast with the local environment, not about using the "loudest" style.

**How to apply:** Before styling an element, look at what surrounds it. If the surrounding content is dense and dark, the focal element should be lighter and more spacious. If the context is airy and minimal, the focal element should be denser and bolder. Work by contrast, not by maxing out every property.

**When to break it:** Design systems that need consistency across varied contexts — a button should look the same whether it's on a light or dark surface. Use the system's contrast tokens rather than one-off contrast adjustments.

### Whitespace amplifies hierarchy
An element with generous space around it reads as more important than a cramped element, regardless of size or weight.

**Why:** Whitespace creates isolation, and isolation creates focus. A stat number floating in generous padding reads as a "featured metric." The same number squeezed between other elements reads as data in a table row. Whitespace is a multiplier for every other hierarchy signal.

**How to apply:** Give the most important element the most surrounding space. Hero headlines should have more top/bottom padding than section headings. Featured cards should have more margin than list items. When something isn't reading as important enough, try adding space around it before increasing its size.

**When to break it:** Dense data interfaces where whitespace is premium. In these contexts, use color and weight for hierarchy instead of spacing. But even in dense layouts, the primary element should have slightly more breathing room than secondary elements.
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/references/principles/visual-hierarchy.md
git commit -m "feat: visual hierarchy principles file for design quality pipeline"
```

---

## Task 6: Create `spacing-rhythm.md` Principles File

**Files:**
- Create: `skills/designkit/references/principles/spacing-rhythm.md`

- [ ] **Step 1: Write spacing-rhythm.md**

Write the file to `skills/designkit/references/principles/spacing-rhythm.md`:

```markdown
# Spacing & Rhythm

Rules for vertical rhythm, section breathing, padding strategies, and density calibration in UI design.

## Rules

### Vary vertical padding by section purpose
Different sections need different breathing room. A hero needs generous space. A dense data section can be tighter. Uniform padding everywhere kills rhythm.

**Why:** Varied spacing creates a visual "score" — the eye moves through the page at different speeds. Generous spacing slows the viewer down (emphasis). Tight spacing speeds them up (supporting content). Uniform spacing is monotone — no emphasis, no pacing.

**How to apply:** Hero/intro sections: 5-8rem vertical padding. Content sections (features, benefits): 3-4rem. Dense sections (tables, card grids): 2-2.5rem. CTAs and transitions: 2-3rem. Footer: 3-4rem. The progression creates natural rhythm.

**When to break it:** Single-surface applications (settings, editors) where consistent rhythm aids usability. Uniform spacing works when the user is scanning a predictable list of similar items.

### Group related items tighter, separate unrelated items wider
Internal spacing within a group should be tighter than the spacing between groups. This creates visual "chunks" the eye can process as units.

**Why:** Gestalt proximity principle — items close together are perceived as related. A card with 0.75rem between its title and description but 2rem between it and the next card communicates "these two texts belong together, the next card is a separate thing." Without this ratio, everything blends into one undifferentiated mass.

**How to apply:** Use a 3:1 or 4:1 ratio between inter-group and intra-group spacing. If items within a card are spaced 0.5rem apart, cards should be 1.5-2rem apart. If sections have 1rem internal padding, the space between sections should be 3-4rem. Consistent ratios matter more than specific values.

**When to break it:** Masonry or collage layouts where deliberately uniform (or deliberately random) gaps create a specific visual texture. Also: design systems where the spacing scale has specific steps that don't align to exact ratios.

### Page margins anchor the content
Generous, consistent page margins make content feel composed rather than edge-to-edge. The margin width signals content type — narrow margins for dense apps, wide margins for editorial content.

**Why:** Content touching the viewport edges feels cramped and unfinished. Margins create a "stage" that frames the content. Wider margins increase perceived quality — compare a medium article (wide margins, generous line-length) to a crammed admin panel (narrow margins, full-width tables).

**How to apply:** Marketing/editorial pages: 10-15% side margins (or max-width: 1200px centered). App interfaces: 1-2rem side margins. Dense dashboards: 0.75-1.5rem side margins. Always define margin as a token (`--page-margin`) so it can be adjusted globally.

**When to break it:** Full-bleed immersive experiences (photo galleries, maps, video players). Also: intentional edge-to-edge sections within a page that otherwise has margins (full-bleed color breaks).

### Use the spacing scale consistently
Don't invent new spacing values. Pick 5-7 values from a scale (4, 8, 12, 16, 24, 32, 48 — or the token scale) and use only those. Consistency creates cohesion.

**Why:** Random spacing values (13px here, 18px there, 22px elsewhere) look like accumulated accidents. A consistent scale means every gap is a deliberate choice from a limited vocabulary. The viewer unconsciously registers the consistency even if they can't articulate why it "feels right."

**How to apply:** Define the spacing scale as tokens: `--space-xs` through `--space-xl`. Use only these tokens for padding, margin, and gap. If none of the scale values work perfectly, pick the closest one — the consistency benefit outweighs the precision loss. Use `calc()` with tokens for special cases (`calc(var(--space-lg) + var(--space-xs))`).

**When to break it:** Optical adjustments where mathematical spacing looks wrong. Text next to icons often needs 1-2px optical adjustment. These micro-corrections are acceptable but should be noted with a comment.

### Dense layouts need tighter internal spacing AND visual separators
Reducing spacing alone doesn't make a layout "dense" — it makes it cramped. Dense layouts work because they combine tight spacing with clear visual boundaries (borders, alternating colors, divider lines).

**Why:** In spacious layouts, whitespace itself creates separation. Remove the whitespace and items blur together. Dense layouts must replace the separating role of whitespace with explicit visual boundaries — a 1px border, a subtle background alternation, or a hairline divider.

**How to apply:** When tightening a layout: reduce padding to 0.5-0.75rem, but add 1px borders between items (`border-bottom: 1px solid var(--color-border)`), or alternate row backgrounds (`--color-surface` / `--color-bg`). Tables should always use one of these techniques. Card grids at tight spacing need visible borders or shadows.

**When to break it:** Minimal/editorial designs that use generous whitespace as the separation mechanism. If the layout is spacious enough, explicit separators add visual noise.

### Breathing room is not uniform padding
Sections need different amounts of top and bottom padding. A section that follows a hero needs more top padding (transition from high-impact to content). Two adjacent content sections need moderate, equal padding.

**Why:** Uniform top/bottom padding ignores the context of what comes before and after. A section's top padding should account for the visual weight of the preceding section. After a heavy hero, more padding creates a "exhale." Between similar content sections, consistent padding maintains rhythm.

**How to apply:** Use asymmetric section padding: `padding-top` and `padding-bottom` can differ. After hero sections: add extra top padding to the next section (or extra bottom padding to the hero). Between similar sections: use equal padding. Before footer: add extra padding to create a "conclusion" feeling.

**When to break it:** CSS frameworks or component systems where sections manage their own padding independently and can't know what's above or below them. In those cases, use consistent padding and rely on margin-collapse or container queries for context-aware adjustments.
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/references/principles/spacing-rhythm.md
git commit -m "feat: spacing rhythm principles file for design quality pipeline"
```

---

## Task 7: Create the Critic Agent

The critic agent reviews prototype HTML against the quality rubric. This is independent of the reference bank — it works with the principles files.

**Files:**
- Create: `skills/designkit/agents/critic.md`

- [ ] **Step 1: Create the agents directory**

```bash
mkdir -p skills/designkit/agents
```

- [ ] **Step 2: Write critic.md**

Write the file to `skills/designkit/agents/critic.md`:

```markdown
# Design Critic

You review generated prototype HTML against a quality rubric. Your job is to catch common AI design failures before the user sees the prototype.

## Inputs You Receive

- **Creative brief**: the art director's brief that guided the builder. This tells you what was intended.
- **Generated HTML**: the prototype to review.
- **Anti-patterns file**: `references/principles/anti-patterns.md` — the catalog of known failures.
- **Relevant principles files**: the principles files referenced in the creative brief (typically 2-3).

## Your Output

Return a JSON block in this exact format:

```json
{
  "pass": true,
  "hard_failures": [],
  "soft_flags": [],
  "revision_prompt": ""
}
```

Or if there are failures:

```json
{
  "pass": false,
  "hard_failures": [
    {
      "check": "check-id",
      "detail": "Specific description of what's wrong and where.",
      "elements": "CSS selectors of affected elements"
    }
  ],
  "soft_flags": [
    {
      "check": "check-id",
      "detail": "What could be improved and why."
    }
  ],
  "revision_prompt": "Specific, actionable instructions for fixing all hard failures. Each fix should name the element, the current value, and the target value."
}
```

## Hard Failure Checks (trigger revision)

Run each of these checks against the HTML. If ANY hard failure is found, set `pass: false`.

### monotone-spacing
Scan all top-level sections (`<section>`, or direct children of `<main>` or `<body>`). If 3+ consecutive sections have identical vertical padding values, flag it.

**How to check:** Look at the CSS for each section. Extract `padding`, `padding-top`, `padding-bottom` values. If 3+ are identical (e.g., all `padding: 4rem 0`), flag.

**Revision guidance:** Specify different padding for each section type: hero (5-6rem), content (3-4rem), dense (2-2.5rem), CTA (2-3rem).

### center-everything
Check text-align across sections. If 3+ sections have `text-align: center` on their primary text content (headings AND body text), flag it.

**How to check:** Look at the CSS rules applied to headings and paragraph elements within each section. If most sections center both headings and body text, flag.

**Revision guidance:** Specify which sections should be left-aligned and which can stay centered. Typically: hero headline can be centered, all other sections should be left-aligned.

### single-weight-typography
Check `font-weight` usage across the stylesheet. If only one weight value appears (e.g., everything is 400, or everything is inherited), flag it.

**How to check:** Scan all CSS rules for `font-weight`. Count distinct weight values. If fewer than 2, flag. Also flag if headings and body text use the same weight.

**Revision guidance:** Specify: headings at weight 600 or 700, body text at weight 400.

### uniform-containers
Check card/tile/block elements. If every card has identical dimensions (same width, same height, same padding), flag it.

**How to check:** Identify elements that look like cards (class names containing "card", "tile", "feature", "item" or repeated sibling elements with similar structure). If all have identical sizing, flag.

**Revision guidance:** Suggest making the primary/featured item larger (span 2 columns, more padding) or varying card heights by allowing content to determine height.

### missing-focal-point
Check each section for at least one element with dramatically different visual weight. If a section has no oversized heading, no large number, no prominent image, and no element that breaks the grid, flag it.

**How to check:** In each section, look for elements with font-size > 2x the body size, or elements that span multiple columns, or elements with distinctive backgrounds/borders. If a section has none of these, flag.

**Revision guidance:** Identify which element in the section should be the focal point and specify how to make it prominent (increase size, add background, span columns).

### token-less-styling
Check for hardcoded color, spacing, or radius values that should be tokens. If 5+ style rules use hardcoded values instead of `var(--token)`, flag it.

**How to check:** Scan the `<style>` block. Count properties that use literal values (hex colors, px/rem values for padding/margin/border-radius) vs. properties that use `var(--*)`. If the ratio is heavily toward hardcoded values, flag.

**Revision guidance:** List the specific hardcoded values and what token they should reference.

### generic-color
Check the color palette. If the design uses only grays + one accent color with no surface depth (no background variation between sections), flag it.

**How to check:** Extract all color values from the stylesheet. Count distinct background colors used across sections. If there are fewer than 3 distinct surface colors, flag.

**Revision guidance:** Suggest specific surface color additions: a subtle tinted background for alternate sections, a darker surface for emphasis sections.

### anti-pattern-violations
Cross-reference the generated HTML against every entry in `anti-patterns.md`. If any pattern matches, flag it with the specific anti-pattern name.

**How to check:** For each anti-pattern, assess whether the HTML exhibits that pattern. This is a judgment call — use the "Why it's bad" description to calibrate severity.

**Revision guidance:** Reference the specific anti-pattern's "What to do instead" guidance.

### foreign-tokens (established codebase mode only)
If the creative brief indicates established codebase mode, check whether the prototype introduces CSS custom properties that don't exist in the repo's token system.

**How to check:** Compare `--*` properties defined in the prototype's `:root` block against the token list provided in the repo context. Any property not in the repo's system is a foreign token.

**Revision guidance:** List each foreign token and the repo token it should map to. If no mapping exists, note it as a gap the user should decide on.

## Soft Flag Checks (included but not blockers)

### brief-drift
Compare the generated HTML against the creative brief's direction. If a specific instruction was ignored (e.g., brief says "asymmetric layout" but the HTML is centered and symmetric), flag it.

### missed-opportunity
Identify areas where the design could be bolder or more interesting without breaking anything. E.g., "The stats row uses equal columns — the primary KPI could span 2 columns."

### accessibility-gap
Check for obvious accessibility issues: color contrast below 4.5:1 on text, missing heading hierarchy (h1 → h3 with no h2), no landmark elements (`<main>`, `<nav>`, `<footer>`).

### responsive-concern
Identify layouts that would clearly break at mobile widths: fixed-width elements wider than 430px, grids with no responsive breakpoints, absolute positioning that would overlap on small screens.

## Rules for Writing revision_prompt

The revision prompt is sent back to the builder. It must be:

1. **Specific** — name the element (by class or selector), the current value, and the target value.
2. **Actionable** — the builder should be able to apply it without interpretation.
3. **Consolidated** — combine all hard failure fixes into one prompt. Don't send one fix at a time.
4. **Prioritized** — list the most impactful fix first.

Bad: "Make the spacing more varied."
Good: "Change section.hero padding from 4rem 0 to 6rem 0. Change section.features padding from 4rem 0 to 3rem 0. Change section.cta padding from 4rem 0 to 2.5rem 0."

Bad: "Add more color variety."
Good: "Add --color-surface-alt: #f8f7f5 to :root. Apply background: var(--color-surface-alt) to section.features and section.testimonials to alternate with the default white surface."

## Constraints

- **One revision pass maximum.** Your revision prompt gets one chance. Be specific enough that one pass fixes everything.
- **Don't redesign.** You're reviewing, not art directing. Flag what's wrong against the rubric, don't propose a different design direction.
- **Respect the brief.** If the brief says "minimal, clean" and the design is minimal and clean, don't flag it for being too simple. Judge against the intended direction, not your preferences.
- **Be concise.** The builder needs instructions, not a design essay. Keep hard_failure details under 2 sentences each. Keep the revision_prompt under 300 words total.
```

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/agents/critic.md
git commit -m "feat: critic agent prompt for design quality pipeline"
```

---

## Task 8: Create the Reference Bank Structure with Initial Starter Patterns

Set up `index.json` and create 5 initial patterns to prove the format. We'll start with high-impact patterns across the consumer/enterprise spectrum: one hero (consumer), one hero (enterprise), one card layout, one dashboard section, and one feature section.

**Files:**
- Create: `skills/designkit/references/index.json`
- Create: `skills/designkit/references/patterns/hero-asymmetric/meta.json`
- Create: `skills/designkit/references/patterns/hero-asymmetric/pattern.html`
- Create: `skills/designkit/references/patterns/hero-metric-led/meta.json`
- Create: `skills/designkit/references/patterns/hero-metric-led/pattern.html`
- Create: `skills/designkit/references/patterns/cards-bento/meta.json`
- Create: `skills/designkit/references/patterns/cards-bento/pattern.html`
- Create: `skills/designkit/references/patterns/dashboard-kpi-strip/meta.json`
- Create: `skills/designkit/references/patterns/dashboard-kpi-strip/pattern.html`
- Create: `skills/designkit/references/patterns/features-alternating/meta.json`
- Create: `skills/designkit/references/patterns/features-alternating/pattern.html`

- [ ] **Step 1: Create directories**

```bash
mkdir -p skills/designkit/references/patterns/hero-asymmetric
mkdir -p skills/designkit/references/patterns/hero-metric-led
mkdir -p skills/designkit/references/patterns/cards-bento
mkdir -p skills/designkit/references/patterns/dashboard-kpi-strip
mkdir -p skills/designkit/references/patterns/features-alternating
```

- [ ] **Step 2: Write index.json**

Write the file to `skills/designkit/references/index.json`:

```json
[
  {
    "id": "hero-asymmetric",
    "category": "hero",
    "audience": ["consumer", "creative"],
    "mood": ["bold", "editorial", "high-energy"],
    "techniques": ["scale-contrast", "asymmetric-grid", "negative-space"],
    "summary": "Full-bleed hero with dramatic type scale and off-grid image placement. Hierarchy through size, not weight."
  },
  {
    "id": "hero-metric-led",
    "category": "hero",
    "audience": ["enterprise", "saas"],
    "mood": ["confident", "data-driven", "clean"],
    "techniques": ["metric-prominence", "restrained-palette", "clear-hierarchy"],
    "summary": "Product hero led by a key metric or value proposition number. Clean layout with clear CTA hierarchy."
  },
  {
    "id": "cards-bento",
    "category": "cards",
    "audience": ["consumer", "creative", "saas"],
    "mood": ["modern", "dynamic", "editorial"],
    "techniques": ["mixed-grid-sizes", "varied-hierarchy", "surface-depth"],
    "summary": "Bento-style card grid with mixed sizes — featured item spans 2 columns, supporting items fill remaining space. No two cards are the same size."
  },
  {
    "id": "dashboard-kpi-strip",
    "category": "dashboard",
    "audience": ["enterprise", "saas"],
    "mood": ["data-driven", "clean", "professional"],
    "techniques": ["metric-prominence", "compact-density", "visual-separators"],
    "summary": "Horizontal KPI strip with primary metric given 2x visual weight. Compact, data-dense, with clear visual boundaries between metrics."
  },
  {
    "id": "features-alternating",
    "category": "features",
    "audience": ["consumer", "saas", "enterprise"],
    "mood": ["balanced", "professional", "clear"],
    "techniques": ["asymmetric-grid", "image-text-pairing", "rhythm-variation"],
    "summary": "Alternating left-right feature sections with image/content asymmetric split. Each section flips the layout for visual rhythm."
  }
]
```

- [ ] **Step 3: Write hero-asymmetric pattern**

Write `skills/designkit/references/patterns/hero-asymmetric/meta.json`:

```json
{
  "id": "hero-asymmetric",
  "name": "Asymmetric Hero",
  "category": "hero",
  "audience": ["consumer", "creative"],
  "mood": ["bold", "editorial", "high-energy"],
  "techniques": ["scale-contrast", "asymmetric-grid", "negative-space"],
  "principles": ["layout-composition", "visual-hierarchy", "typography"],
  "summary": "Full-bleed hero with dramatic type scale and off-grid image placement.",
  "why_it_works": "The oversized headline (clamp 3-5rem) creates an immediate focal point. The asymmetric 7/5 split breaks the centered-everything monotony. Negative space on the text side balances the dense visual on the opposite side. Tight letter-spacing on the headline signals intentional typographic craft.",
  "when_to_use": "Landing pages, product launches, brand-forward consumer sites, portfolio showcases.",
  "watch_out": "Needs strong copy to earn the scale. Weak or generic headlines get exposed by large type. The image/visual must be high-quality — empty placeholder boxes undermine the layout."
}
```

Write `skills/designkit/references/patterns/hero-asymmetric/pattern.html`:

```html
<!-- PATTERN: hero-asymmetric -->
<!-- Asymmetric 7/5 grid breaks centered-everything default -->
<!-- Hierarchy through scale contrast: heading 4rem vs body 1.125rem = 3.5:1 ratio -->
<!-- Negative space on text side balances dense visual on image side -->
<style>
  .hero-asymmetric {
    --hero-heading-size: clamp(2.5rem, 5vw, 4.5rem);
    --hero-body-size: 1.125rem;
    --hero-pad-y: 6rem;
    --hero-pad-x: clamp(1.5rem, 5vw, 4rem);
    --hero-gap: 3rem;

    display: grid;
    /* 7/5 split — text gets more horizontal space than the visual */
    grid-template-columns: 7fr 5fr;
    gap: var(--hero-gap);
    align-items: center;
    padding: var(--hero-pad-y) var(--hero-pad-x);
    min-height: 80vh;
  }

  .hero-asymmetric__content {
    /* Left-aligned, not centered — creates a strong reading anchor */
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .hero-asymmetric__heading {
    font-size: var(--hero-heading-size);
    font-weight: 700;
    /* Tight letter-spacing on large type — default spacing looks loose at display sizes */
    letter-spacing: -0.03em;
    line-height: 1.1;
    /* Two weights only: 700 for heading, 400 for body */
  }

  .hero-asymmetric__body {
    font-size: var(--hero-body-size);
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-text-secondary);
    /* Constrain line length for readability — don't let it stretch to full column width */
    max-width: 36ch;
  }

  .hero-asymmetric__cta-group {
    display: flex;
    gap: 0.75rem;
    /* Left-aligned with text, not centered */
    align-items: center;
    padding-top: 0.5rem;
  }

  .hero-asymmetric__cta-primary {
    padding: 0.75rem 2rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: #fff;
  }

  .hero-asymmetric__cta-secondary {
    padding: 0.75rem 2rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-primary);
    border: 1.5px solid var(--color-primary);
  }

  .hero-asymmetric__visual {
    /* Visual side: image or illustration fills the space -->
    /* Slight upward offset breaks rigid grid alignment */
    border-radius: var(--radius-md);
    aspect-ratio: 4/3;
    background: var(--color-bg);
    margin-top: -2rem;
  }
</style>

<section class="hero-asymmetric">
  <div class="hero-asymmetric__content">
    <h1 class="hero-asymmetric__heading">Build something worth showing off</h1>
    <p class="hero-asymmetric__body">The platform for teams who care about the details. Ship faster without sacrificing craft.</p>
    <div class="hero-asymmetric__cta-group">
      <a class="hero-asymmetric__cta-primary" href="#">Get started</a>
      <a class="hero-asymmetric__cta-secondary" href="#">See examples</a>
    </div>
  </div>
  <div class="hero-asymmetric__visual"></div>
</section>
```

- [ ] **Step 4: Write hero-metric-led pattern**

Write `skills/designkit/references/patterns/hero-metric-led/meta.json`:

```json
{
  "id": "hero-metric-led",
  "name": "Metric-Led Hero",
  "category": "hero",
  "audience": ["enterprise", "saas"],
  "mood": ["confident", "data-driven", "clean"],
  "techniques": ["metric-prominence", "restrained-palette", "clear-hierarchy"],
  "principles": ["visual-hierarchy", "typography", "color-strategy"],
  "summary": "Product hero led by a key metric or value proposition number.",
  "why_it_works": "Leading with a number (98.7%, 10x, $2.4M) creates instant credibility and curiosity. The oversized metric is the focal point — everything else supports it. The restrained palette (2 colors max) keeps focus on the data rather than decoration.",
  "when_to_use": "SaaS landing pages, B2B products, analytics tools, any product where a number tells the story better than adjectives.",
  "watch_out": "The metric must be real and impressive. A mediocre number at hero scale backfires — it amplifies weakness. Pair with a clear explanation of what the number means."
}
```

Write `skills/designkit/references/patterns/hero-metric-led/pattern.html`:

```html
<!-- PATTERN: hero-metric-led -->
<!-- Focal point is a single oversized metric — 5rem+ to dominate the section -->
<!-- Restrained palette: surface + one accent. Let the data speak. -->
<!-- Stacked vertical layout (not split grid) — the number earns center stage -->
<style>
  .hero-metric {
    --metric-size: clamp(3.5rem, 8vw, 6rem);
    --hero-pad-y: 5rem;
    --hero-pad-x: clamp(1.5rem, 5vw, 4rem);

    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--hero-pad-y) var(--hero-pad-x);
    gap: 1.5rem;
    min-height: 70vh;
    justify-content: center;
  }

  .hero-metric__eyebrow {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-primary);
    /* Eyebrow contextualizes the metric before you read it */
  }

  .hero-metric__number {
    font-size: var(--metric-size);
    font-weight: 700;
    letter-spacing: -0.04em;
    line-height: 1;
    /* Dramatic scale: this number is 5-6x the body text */
    /* Tight letter-spacing and line-height make it feel dense and impactful */
  }

  .hero-metric__explanation {
    font-size: 1.25rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--color-text-secondary);
    max-width: 42ch;
    /* Explanation is restrained — don't compete with the metric */
  }

  .hero-metric__cta {
    margin-top: 1rem;
    padding: 0.875rem 2.5rem;
    font-weight: 600;
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: #fff;
    /* Single CTA — don't dilute with secondary actions at the hero level */
  }

  .hero-metric__proof {
    display: flex;
    gap: 2rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
    /* Social proof strip: compact, muted, below the CTA -->
    /* Separated by a border to establish it as supporting, not primary */
  }

  .hero-metric__proof-item {
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
  }

  .hero-metric__proof-item strong {
    color: var(--color-text);
    font-weight: 600;
  }
</style>

<section class="hero-metric">
  <span class="hero-metric__eyebrow">Average time saved per deployment</span>
  <div class="hero-metric__number">47 min</div>
  <p class="hero-metric__explanation">Teams using our pipeline ship 3x faster with zero manual rollback. The 47 minutes add up to whole sprints recovered.</p>
  <a class="hero-metric__cta" href="#">Start free trial</a>
  <div class="hero-metric__proof">
    <span class="hero-metric__proof-item"><strong>2,400+</strong> teams</span>
    <span class="hero-metric__proof-item"><strong>99.97%</strong> uptime</span>
    <span class="hero-metric__proof-item"><strong>SOC 2</strong> certified</span>
  </div>
</section>
```

- [ ] **Step 5: Write cards-bento pattern**

Write `skills/designkit/references/patterns/cards-bento/meta.json`:

```json
{
  "id": "cards-bento",
  "name": "Bento Card Grid",
  "category": "cards",
  "audience": ["consumer", "creative", "saas"],
  "mood": ["modern", "dynamic", "editorial"],
  "techniques": ["mixed-grid-sizes", "varied-hierarchy", "surface-depth"],
  "principles": ["layout-composition", "visual-hierarchy", "spacing-rhythm"],
  "summary": "Bento-style card grid with mixed sizes — featured item spans 2 columns.",
  "why_it_works": "Mixed card sizes create natural visual hierarchy without extra styling. The large card is the focal point, smaller cards are supporting details. The irregular grid feels curated rather than generated — it signals editorial judgment about what matters most.",
  "when_to_use": "Feature overviews, product showcases, content grids, portfolio displays.",
  "watch_out": "Needs at least 4 items to work — fewer than that and the large card looks lonely. Content in the featured card must justify the size; don't put the least interesting item in the biggest container."
}
```

Write `skills/designkit/references/patterns/cards-bento/pattern.html`:

```html
<!-- PATTERN: cards-bento -->
<!-- Mixed card sizes create hierarchy: featured card 2-col span, others 1-col -->
<!-- No two cards are the same visual weight — this is the key anti-pattern avoidance -->
<!-- Surface depth through subtle background variation between cards -->
<style>
  .bento-grid {
    --bento-gap: 1rem;
    --bento-pad: 1.5rem;
    --bento-radius: var(--radius-md);

    display: grid;
    /* 3 columns — featured card spans 2, rest fill in */
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bento-gap);
    padding: 3rem clamp(1.5rem, 5vw, 4rem);
  }

  .bento-card {
    padding: var(--bento-pad);
    border-radius: var(--bento-radius);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .bento-card--featured {
    /* Featured card: spans 2 columns AND 2 rows — dominates the grid */
    grid-column: span 2;
    grid-row: span 2;
    padding: 2rem;
    /* Tinted background creates surface depth against regular cards */
    background: var(--color-primary);
    color: #fff;
    border-color: transparent;
  }

  .bento-card--featured .bento-card__title {
    font-size: 1.75rem;
    color: #fff;
  }

  .bento-card--featured .bento-card__body {
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.0625rem;
  }

  .bento-card__icon {
    /* Icon container: constrained, not oversized */
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 8px;
    background: var(--color-bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bento-card--featured .bento-card__icon {
    background: rgba(255, 255, 255, 0.15);
  }

  .bento-card__title {
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.3;
    color: var(--color-text);
  }

  .bento-card__body {
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--color-text-secondary);
    /* Don't let card body text stretch too wide */
  }
</style>

<section class="bento-grid">
  <div class="bento-card bento-card--featured">
    <div class="bento-card__icon"><i class="lucide-zap"></i></div>
    <h3 class="bento-card__title">Real-time collaboration without the lag</h3>
    <p class="bento-card__body">Every edit syncs in under 50ms. No save button, no conflicts, no "someone else is editing." Just build together.</p>
  </div>
  <div class="bento-card">
    <div class="bento-card__icon"><i class="lucide-shield-check"></i></div>
    <h3 class="bento-card__title">Enterprise-grade security</h3>
    <p class="bento-card__body">SOC 2 Type II, SSO, and audit logs. Your compliance team will love it.</p>
  </div>
  <div class="bento-card">
    <div class="bento-card__icon"><i class="lucide-git-branch"></i></div>
    <h3 class="bento-card__title">Branch anything</h3>
    <p class="bento-card__body">Create parallel versions of any project. Merge when ready, discard when not.</p>
  </div>
  <div class="bento-card">
    <div class="bento-card__icon"><i class="lucide-puzzle"></i></div>
    <h3 class="bento-card__title">Plugin ecosystem</h3>
    <p class="bento-card__body">300+ integrations. Connect the tools your team already uses.</p>
  </div>
  <div class="bento-card">
    <div class="bento-card__icon"><i class="lucide-bar-chart-3"></i></div>
    <h3 class="bento-card__title">Built-in analytics</h3>
    <p class="bento-card__body">Track engagement, usage patterns, and performance without third-party tools.</p>
  </div>
</section>
```

- [ ] **Step 6: Write dashboard-kpi-strip pattern**

Write `skills/designkit/references/patterns/dashboard-kpi-strip/meta.json`:

```json
{
  "id": "dashboard-kpi-strip",
  "name": "KPI Strip",
  "category": "dashboard",
  "audience": ["enterprise", "saas"],
  "mood": ["data-driven", "clean", "professional"],
  "techniques": ["metric-prominence", "compact-density", "visual-separators"],
  "principles": ["visual-hierarchy", "spacing-rhythm", "typography"],
  "summary": "Horizontal KPI strip with primary metric given 2x visual weight.",
  "why_it_works": "The primary KPI is visually dominant (larger number, accent background) while secondary KPIs are compact and uniform. Visual separators (borders) replace whitespace as the grouping mechanism, allowing higher density. Change indicators (+/-%) give metrics context without requiring a chart.",
  "when_to_use": "Dashboard headers, analytics overviews, report summaries, any context where 3-6 key metrics need to be scannable at a glance.",
  "watch_out": "More than 6 KPIs in a strip becomes a wall of numbers. If you need more, group into categories. The primary KPI must be genuinely the most important — don't just pick the first one."
}
```

Write `skills/designkit/references/patterns/dashboard-kpi-strip/pattern.html`:

```html
<!-- PATTERN: dashboard-kpi-strip -->
<!-- Primary KPI gets 2x visual weight: larger type, accent background -->
<!-- Secondary KPIs are compact with visual separators (borders, not whitespace) -->
<!-- Change indicators (+/- %) give context without charts -->
<style>
  .kpi-strip {
    display: flex;
    align-items: stretch;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .kpi-strip__item {
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    /* Border separators replace whitespace — denser layout */
    border-right: 1px solid var(--color-border);
    flex: 1;
  }

  .kpi-strip__item:last-child {
    border-right: none;
  }

  .kpi-strip__item--primary {
    /* Primary KPI: wider, accent-tinted background, larger type */
    flex: 1.8;
    background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
    border-right: 2px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
  }

  .kpi-strip__label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .kpi-strip__value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text);
  }

  .kpi-strip__item--primary .kpi-strip__value {
    /* Primary metric: 2x the secondary metric size */
    font-size: 2.25rem;
    letter-spacing: -0.02em;
  }

  .kpi-strip__change {
    font-size: 0.75rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .kpi-strip__change--up {
    color: var(--color-success);
  }

  .kpi-strip__change--down {
    color: var(--color-danger);
  }
</style>

<div class="kpi-strip">
  <div class="kpi-strip__item kpi-strip__item--primary">
    <span class="kpi-strip__label">Monthly Recurring Revenue</span>
    <span class="kpi-strip__value">$2.4M</span>
    <span class="kpi-strip__change kpi-strip__change--up">+12.3% vs last month</span>
  </div>
  <div class="kpi-strip__item">
    <span class="kpi-strip__label">Active Users</span>
    <span class="kpi-strip__value">18,420</span>
    <span class="kpi-strip__change kpi-strip__change--up">+8.1%</span>
  </div>
  <div class="kpi-strip__item">
    <span class="kpi-strip__label">Churn Rate</span>
    <span class="kpi-strip__value">1.2%</span>
    <span class="kpi-strip__change kpi-strip__change--down">-0.3pp</span>
  </div>
  <div class="kpi-strip__item">
    <span class="kpi-strip__label">Avg. Response</span>
    <span class="kpi-strip__value">142ms</span>
    <span class="kpi-strip__change kpi-strip__change--up">-18ms</span>
  </div>
</div>
```

- [ ] **Step 7: Write features-alternating pattern**

Write `skills/designkit/references/patterns/features-alternating/meta.json`:

```json
{
  "id": "features-alternating",
  "name": "Alternating Features",
  "category": "features",
  "audience": ["consumer", "saas", "enterprise"],
  "mood": ["balanced", "professional", "clear"],
  "techniques": ["asymmetric-grid", "image-text-pairing", "rhythm-variation"],
  "principles": ["layout-composition", "spacing-rhythm", "visual-hierarchy"],
  "summary": "Alternating left-right feature sections with image/content asymmetric split.",
  "why_it_works": "Flipping the layout every other section creates a natural zig-zag reading pattern. The asymmetric 5/7 (then 7/5) split gives the visual side more room when it leads, and the text side more room when it leads. Varied section backgrounds create visual punctuation between features.",
  "when_to_use": "Product feature overviews, 'how it works' sections, benefit breakdowns with 3-5 feature items.",
  "watch_out": "Needs strong visuals (screenshots, illustrations, diagrams) — empty placeholder boxes make this pattern look worse than a simple list. Each feature must be distinct enough to justify its own section; similar features should be grouped into a card grid instead."
}
```

Write `skills/designkit/references/patterns/features-alternating/pattern.html`:

```html
<!-- PATTERN: features-alternating -->
<!-- Zig-zag layout: odd sections = content left / visual right, even sections = flipped -->
<!-- Asymmetric 5/7 split gives the leading element more space -->
<!-- Alternate section backgrounds create visual punctuation -->
<style>
  .feature-section {
    --feature-pad-y: 4rem;
    --feature-pad-x: clamp(1.5rem, 5vw, 4rem);
    --feature-gap: clamp(2rem, 4vw, 4rem);

    display: grid;
    grid-template-columns: 5fr 7fr;
    gap: var(--feature-gap);
    align-items: center;
    padding: var(--feature-pad-y) var(--feature-pad-x);
  }

  .feature-section:nth-child(even) {
    /* Flip the grid for alternating sections */
    grid-template-columns: 7fr 5fr;
    /* Alternate background creates visual break */
    background: var(--color-bg);
  }

  .feature-section:nth-child(even) .feature-section__content {
    /* Content moves to right (column 2) on even sections */
    order: 2;
  }

  .feature-section:nth-child(even) .feature-section__visual {
    order: 1;
  }

  .feature-section__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .feature-section__eyebrow {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-primary);
  }

  .feature-section__heading {
    font-size: clamp(1.5rem, 3vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    /* Heading is the focal point: 2x+ body size, bold weight */
  }

  .feature-section__body {
    font-size: 1.0625rem;
    line-height: 1.6;
    color: var(--color-text-secondary);
    max-width: 48ch;
    /* Constrained width for readability */
  }

  .feature-section__visual {
    border-radius: var(--radius-md);
    aspect-ratio: 16/10;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    /* Placeholder for screenshot/illustration — must be filled with real content */
  }
</style>

<section class="feature-section">
  <div class="feature-section__content">
    <span class="feature-section__eyebrow">Workflow</span>
    <h2 class="feature-section__heading">Design once, ship everywhere</h2>
    <p class="feature-section__body">Build responsive layouts that adapt to any screen. Components know how to reflow, resize, and reorganize without breakpoint spaghetti.</p>
  </div>
  <div class="feature-section__visual"></div>
</section>

<section class="feature-section">
  <div class="feature-section__content">
    <span class="feature-section__eyebrow">Collaboration</span>
    <h2 class="feature-section__heading">Review without the back-and-forth</h2>
    <p class="feature-section__body">Click any element to leave a note. Your team sees exactly what you mean — no more "the thing on the left, no the other left."</p>
  </div>
  <div class="feature-section__visual"></div>
</section>

<section class="feature-section">
  <div class="feature-section__content">
    <span class="feature-section__eyebrow">Integration</span>
    <h2 class="feature-section__heading">From prototype to production in one step</h2>
    <p class="feature-section__body">Export tokens, components, and layout specs directly into your codebase. No translation layer, no copy-paste, no drift.</p>
  </div>
  <div class="feature-section__visual"></div>
</section>
```

- [ ] **Step 8: Commit all patterns and index**

```bash
git add skills/designkit/references/index.json
git add skills/designkit/references/patterns/
git commit -m "feat: reference bank with 5 starter patterns — hero, cards, dashboard, features"
```

---

## Task 9: Create the Art Director Agent

The art director depends on the reference bank and principles — both now exist.

**Files:**
- Create: `skills/designkit/agents/art-director.md`

- [ ] **Step 1: Write art-director.md**

Write the file to `skills/designkit/agents/art-director.md`:

```markdown
# Art Director

You write creative briefs for UI prototypes. You do NOT write HTML. Your job is to take a user's request, select relevant reference patterns, and produce a specific, opinionated creative direction that a builder agent will translate into code.

## Inputs You Receive

- **User request**: what the user asked for.
- **Repo context**: frameworks, tokens, design language detected in the codebase. May be empty for greenfield work.
- **Reference index** (`index.json`): the catalog of available reference patterns with tags and summaries.
- **Principles files**: all files from `references/principles/` — the design rules, reasoning, and exceptions.

## Your Process

### 1. Analyze the request
Identify:
- **Surface type**: landing page, dashboard, settings, form, detail view, etc.
- **Audience**: consumer, enterprise, developer, creative professional, etc.
- **Mood**: what should this feel like? Bold, clean, dense, playful, serious, editorial?
- **Content type**: text-heavy, data-heavy, visual-heavy, mixed?

### 2. Determine creative freedom level

**Greenfield mode** — the repo context has no established tokens, no component library, or fewer than 5 CSS custom properties. OR the user explicitly asks for a new/fresh direction.

In greenfield mode, you have full creative license: palette, typography, spacing, layout — everything is yours to direct.

**Established codebase mode** — the repo context shows a populated token system (10+ CSS custom properties), component directories, an identifiable design language.

In established codebase mode, your creative scope narrows to:
- Layout and composition (how to arrange elements on the surface)
- Information hierarchy (what's prominent, secondary, tucked away)
- Interaction patterns (how things reveal, collapse, transition)
- Density and rhythm (breathing room, tightening, opening up)
- Confident use of existing tokens in unexpected or more assertive ways

You MUST NOT direct new colors, new typefaces, or new spacing values that contradict the repo's token system. Instead, direct how to use the existing system more boldly.

### 3. Select reference patterns
Scan `index.json` for patterns that match the surface type, audience, and mood. Select 2-3 patterns:
- One primary reference — the closest match to the overall request
- One or two supporting references — for specific techniques to borrow (e.g., "use the typography approach from hero-editorial but the layout from cards-bento")

For each selected pattern, read its `meta.json` and `pattern.html`. Understand what makes it work before directing the builder to draw from it.

### 4. Write the creative brief

## Output Format

Your entire output must be a creative brief in this format:

```
## Direction
One sentence on the overall feel and point of view for this prototype.
This is not a description — it's a creative position. Not "a clean dashboard" but "a dashboard that treats data like editorial content — generous whitespace, typographic hierarchy, metrics that read like headlines."

## Typography
- Scale strategy: what ratio between heading and body? What's the largest element?
- Weight strategy: which two weights? Where does each appear?
- Letter-spacing: tight on headings? Tracked on eyebrows?
- Line-height: tight on headings (1.1-1.2), comfortable on body (1.5-1.6)?
- Typeface direction (greenfield only): serif/sans/mono pairing? System fonts or a specific recommendation?

Linked to principle: [name the relevant typography.md rule]

## Color Strategy
- Palette approach: warm or cool? How many surface levels? What's the accent strategy?
- Surface depth: what differentiates background from card from recessed?
- In established codebase mode: which existing tokens to lean on more heavily. How to create depth with what exists.

Linked to principle: [name the relevant color-strategy.md rule]

## Layout & Composition
- Grid approach: symmetric or asymmetric? Column ratio?
- Focal point: what single element anchors the page? How is it emphasized?
- Density: spacious, moderate, or dense? Why?
- Reference pattern to draw from and specifically what technique to take.

Linked to principle: [name the relevant layout-composition.md rule]

## Spacing & Rhythm
- Vertical rhythm: how does padding vary across sections?
- Internal spacing: tight or generous within components?
- Grouping: what ratio between intra-group and inter-group spacing?

Linked to principle: [name the relevant spacing-rhythm.md rule]

## Do Not
3-5 specific anti-patterns to avoid for THIS particular brief. Not generic design advice — targeted to what would go wrong with this specific request and surface type.

Each "do not" should name the anti-pattern from anti-patterns.md and explain why it's specifically dangerous here.

## Reference Patterns
- [pattern-id]: what to take from it (be specific — "the 7/5 grid split and left-aligned CTA placement", not just "the layout")
- [pattern-id]: what to take from it
```

## Rules

- **Be opinionated.** A brief that says "use good typography" is worthless. A brief that says "3.5:1 heading-to-body scale ratio, weight 700 on headings, -0.03em letter-spacing above 2rem" gives the builder something to execute.
- **Be specific.** Name numbers, ratios, techniques. Vague direction produces vague output.
- **Be concise.** The brief should be 200-400 words total. It's direction, not a design essay.
- **Don't write HTML.** If you catch yourself writing `<div>` or `style=`, stop. That's the builder's job.
- **Don't prescribe content.** Don't write copy, headlines, or placeholder text. Direct the visual treatment of content, not the content itself.
- **Link to principles.** Every section should reference the specific rule from the principles files that supports your direction. This helps the critic agent verify the output.
- **Prioritize.** If the brief has 10 directions and the builder can only execute 7, which 3 should be skipped? Lead with the most impactful directions.
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/agents/art-director.md
git commit -m "feat: art director agent prompt for design quality pipeline"
```

---

## Task 10: Integrate Quality Pipeline into SKILL.md

Add a new section to the existing SKILL.md that describes when and how to invoke the quality pipeline.

**Files:**
- Modify: `skills/designkit/SKILL.md` (append after the "Key Principles" section, before end of file)

- [ ] **Step 1: Append the Quality Pipeline section to SKILL.md**

Add the following content at the end of `skills/designkit/SKILL.md`:

```markdown

## Quality Pipeline

When generating a prototype from a **new request or a significant design direction change**, use the quality pipeline to improve visual output. Do NOT use it for incremental refinements from Comment, Inspect, or Tune feedback — those should be applied directly.

### Step 1: Art Director

Spawn a sub-agent (model: sonnet) with the contents of `skills/designkit/agents/art-director.md` as the system prompt. Pass it:

- The user's request (what they asked for)
- Repo context summary (frameworks, tokens, component directories — from the explore skill or your own inspection)
- The contents of `skills/designkit/references/index.json`
- The contents of all files in `skills/designkit/references/principles/`

The art director returns a creative brief and names 2-3 reference pattern IDs. After receiving the brief, read the `meta.json` and `pattern.html` files for each selected pattern from `skills/designkit/references/patterns/<pattern-id>/`.

### Step 2: Build

Generate the prototype HTML as usual (following the Authoring Standards above), but now your input includes:
- The art director's creative brief
- The selected reference pattern HTML files (2-3 annotated examples)
- The user's original request (for content and functional requirements)

Use the creative brief as your primary visual direction. Draw specific techniques from the reference patterns. Apply the user's content and functional requirements on top.

### Step 3: Critique

After writing the prototype HTML to `screen_dir`, spawn a sub-agent (model: sonnet) with the contents of `skills/designkit/agents/critic.md` as the system prompt. Pass it:

- The creative brief from Step 1
- The generated HTML (read the file you just wrote)
- The contents of `skills/designkit/references/principles/anti-patterns.md`
- The contents of the principles files referenced in the brief's "Linked to principle" annotations (typically 2-3 files)

The critic returns a JSON verdict:

- If `"pass": true` — the prototype is ready. Proceed to tell the user the URL.
- If `"pass": false` — read the `revision_prompt`. Apply the specific fixes to the HTML. Write the updated file. Do NOT run the critic again — one revision pass maximum.

### Pipeline Context Detection

To determine greenfield vs established codebase mode:

- **Greenfield:** The repo context shows fewer than 5 CSS custom properties, no component directories, or the user explicitly asks for a fresh/new direction.
- **Established codebase:** The repo context shows 10+ CSS custom properties, component directories, an identifiable design language.

Pass this determination to both the art director (affects creative freedom) and the critic (affects which checks apply — e.g., foreign-tokens check only applies in established codebase mode).
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/SKILL.md
git commit -m "feat: integrate quality pipeline section into designkit SKILL.md"
```

---

## Task 11: Create the Dev Workflow Skill (Internal Only)

The dev skill for building the reference bank. This is tracked in the private repo, excluded from public release.

**Files:**
- Create: `skills/designkit/dev/add-reference.md`

- [ ] **Step 1: Create the dev directory**

```bash
mkdir -p skills/designkit/dev
```

- [ ] **Step 2: Write add-reference.md**

Write the file to `skills/designkit/dev/add-reference.md`:

```markdown
---
name: add-reference
description: "Internal dev skill: process URLs or screenshots into reference bank patterns for the design quality pipeline. Not shipped to users."
---

# Add Reference Pattern

Process a URL or screenshot into an annotated reference pattern for the design quality pipeline's pattern library.

## When to Use

- You have a URL or screenshot of a well-designed UI and want to capture specific patterns from it
- You're expanding the reference bank in `skills/designkit/references/patterns/`
- Batch processing: you have multiple URLs to review and selectively capture

## Inputs

The developer provides:
- A **URL** or **screenshot path** (or multiple for batch mode)
- Optional **guidance**: what to focus on ("look at the hero typography", "the card density is great", "enterprise dashboard style")

## Process

### For URLs

1. **Screenshot**: Use Playwright to capture the page at desktop (1440×900) and mobile (430×932) viewports.

```
Navigate to the URL, wait for network idle, take full-page screenshots at both viewports.
```

2. **Analyze**: Read the screenshots. Identify distinct design patterns worth extracting. Not everything on the page is worth capturing — look for:
   - Patterns that demonstrate specific techniques well (asymmetric layout, metric prominence, bento grid, etc.)
   - Patterns that would be useful as reference for the art director agent
   - Patterns that are distinctly different from what already exists in `skills/designkit/references/index.json`

3. **Present findings**: Tell the developer what patterns you identified and ask which to capture. Format:
   ```
   Found 3 patterns worth capturing:
   1. Hero section — editorial typography with dramatic scale contrast (4:1 ratio), asymmetric layout
   2. Pricing comparison — horizontal tier cards with highlighted recommended plan
   3. Footer — dense multi-column with newsletter CTA

   Which should I capture? (1, 2, 3, all, or none)
   ```

4. **Reconstruct**: For each selected pattern, build a minimal annotated HTML snippet. This is NOT a pixel-perfect clone — it's a distilled version that captures:
   - The core layout technique (grid structure, column ratios)
   - Typography choices (scale, weight, spacing)
   - Color strategy (surface depth, accent use)
   - Spacing rhythm (padding, gaps, density)

   Every CSS property that embodies a design decision gets an HTML comment explaining WHY. Use CSS custom properties for all values. Use semantic class names.

5. **Generate metadata**: Write `meta.json` with:
   - `id`: kebab-case identifier (e.g., `hero-editorial-split`)
   - `name`: human-readable name
   - `category`: match existing categories from index.json, or propose a new one
   - `audience`: `["consumer"]`, `["enterprise"]`, `["saas"]`, etc.
   - `mood`: 2-3 mood tags
   - `techniques`: 2-3 technique tags — check existing index.json tags first, reuse when they fit
   - `principles`: which principles files this pattern demonstrates
   - `summary`: one-line description for the index
   - `why_it_works`: 2-3 sentences explaining the design decisions
   - `when_to_use`: contexts where this pattern is the right choice
   - `watch_out`: pitfalls or requirements for using this pattern well

6. **Preview**: Render the reconstructed pattern in the Design Companion browser so the developer can review it side-by-side with the original. Ask for approval or adjustments.

7. **Commit**: On approval:
   - Write files to `skills/designkit/references/patterns/<id>/meta.json` and `pattern.html`
   - Update `skills/designkit/references/index.json` — add the new entry, keep the array sorted by id
   - Commit with message: `feat(references): add <pattern-name> pattern from <source>`

### For Screenshots

Same flow starting at step 2. The developer provides a screenshot path instead of a URL. Read the image directly.

### Batch Mode

When multiple URLs are provided:
1. Screenshot all URLs in parallel
2. Analyze all screenshots
3. Present a consolidated summary of all patterns found across all URLs
4. Developer cherry-picks which patterns to capture
5. Process selected patterns sequentially (reconstruct, metadata, preview, commit)

## Quality Gates

Push back when:

- **Too similar**: The reconstructed pattern is close to an existing reference. Say: "This is similar to `[existing-id]` — should I update that entry instead of creating a new one?"
- **Too complex**: The pattern can't be distilled into a single focused snippet. Say: "This is really 2-3 patterns combined. Let me split it into separate entries."
- **Content-driven**: What makes it "good" is the copy or photography, not the design technique. Say: "The quality here comes from the content, not the layout. The layout itself is a standard [X]. Not worth a reference entry."
- **Missing taxonomy**: A new tag is needed. Say: "This uses a technique we haven't categorized — '[new-tag]'. Should I add it to the taxonomy?"

## Taxonomy

When assigning tags, prefer existing values from `index.json`. The current taxonomy:

**Categories:** hero, cards, navigation, pricing, dashboard, forms, features
**Audience:** consumer, creative, enterprise, saas
**Mood:** bold, editorial, high-energy, confident, data-driven, clean, professional, modern, dynamic, balanced
**Techniques:** scale-contrast, asymmetric-grid, negative-space, metric-prominence, restrained-palette, clear-hierarchy, mixed-grid-sizes, varied-hierarchy, surface-depth, compact-density, visual-separators, image-text-pairing, rhythm-variation, overlapping-elements

Add new tags only when nothing existing fits. Keep the taxonomy tight — 5-7 values per dimension is the sweet spot.
```

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/dev/add-reference.md
git commit -m "feat: add-reference dev workflow skill (internal only)"
```

---

## Task 12: Exclude Dev Directory from Public Release

Add the `skills/designkit/dev/` directory to the `release.sh` exclusion list.

**Files:**
- Modify: `release.sh` (add exclusion line)

- [ ] **Step 1: Read release.sh to confirm exact insertion point**

Read `release.sh` and find the rsync exclusion block (lines 25-35 based on the grep results).

- [ ] **Step 2: Add exclusion for skills/designkit/dev/**

Add `--exclude 'skills/designkit/dev/'` to the rsync command in `release.sh`, after the existing exclusions. Insert it after the `--exclude 'benchmark/'` line:

Find this block:
```bash
  --exclude 'benchmark/' \
```

Add after it:
```bash
  --exclude 'skills/designkit/dev/' \
```

- [ ] **Step 3: Commit**

```bash
git add release.sh
git commit -m "chore: exclude skills/designkit/dev/ from public release"
```

---

## Task 13: Verify the Full Pipeline Manually

Run a manual end-to-end test to verify the pipeline works when invoked by the skill.

**Files:**
- No new files. This task reads existing files to verify.

- [ ] **Step 1: Verify all reference bank files exist and parse**

```bash
# Verify index.json is valid JSON
node -e "JSON.parse(require('fs').readFileSync('skills/designkit/references/index.json', 'utf8')); console.log('index.json: OK')"

# Verify all meta.json files are valid JSON
for d in skills/designkit/references/patterns/*/; do
  node -e "JSON.parse(require('fs').readFileSync('${d}meta.json', 'utf8')); console.log('${d}meta.json: OK')"
done

# Verify all pattern.html files exist and are non-empty
for d in skills/designkit/references/patterns/*/; do
  test -s "${d}pattern.html" && echo "${d}pattern.html: OK" || echo "${d}pattern.html: MISSING/EMPTY"
done
```

Expected: All files report OK.

- [ ] **Step 2: Verify index.json IDs match pattern directories**

```bash
node -e "
const index = JSON.parse(require('fs').readFileSync('skills/designkit/references/index.json', 'utf8'));
const fs = require('fs');
const dirs = fs.readdirSync('skills/designkit/references/patterns');
const indexIds = index.map(e => e.id).sort();
const dirIds = dirs.sort();
console.log('Index IDs:', indexIds);
console.log('Dir IDs:', dirIds);
const match = JSON.stringify(indexIds) === JSON.stringify(dirIds);
console.log('Match:', match ? 'OK' : 'MISMATCH');
"
```

Expected: Match: OK

- [ ] **Step 3: Verify principles files exist**

```bash
for f in anti-patterns typography color-strategy layout-composition visual-hierarchy spacing-rhythm; do
  test -s "skills/designkit/references/principles/${f}.md" && echo "${f}.md: OK" || echo "${f}.md: MISSING"
done
```

Expected: All 6 files report OK.

- [ ] **Step 4: Verify agent files exist**

```bash
test -s "skills/designkit/agents/art-director.md" && echo "art-director.md: OK" || echo "art-director.md: MISSING"
test -s "skills/designkit/agents/critic.md" && echo "critic.md: OK" || echo "critic.md: MISSING"
```

Expected: Both OK.

- [ ] **Step 5: Verify SKILL.md has the Quality Pipeline section**

```bash
grep -c "Quality Pipeline" skills/designkit/SKILL.md
```

Expected: at least 1 match.

- [ ] **Step 6: Verify dev directory is excluded from release**

```bash
grep "skills/designkit/dev" release.sh
```

Expected: shows the `--exclude 'skills/designkit/dev/'` line.

- [ ] **Step 7: Commit verification pass (if any fixes were needed)**

If any verification step failed and was fixed, commit the fixes:

```bash
git add -A
git commit -m "fix: address verification issues in design quality pipeline"
```

If all passed with no changes needed, skip this step.
