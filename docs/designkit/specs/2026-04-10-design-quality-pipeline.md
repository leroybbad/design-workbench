# Design Quality Pipeline

**Date:** 2026-04-10
**Status:** Approved

## Problem

Claude generates prototypes that work structurally but lack visual taste. Typography, spacing, color harmony, and layout composition default to safe, generic choices. The output doesn't have a point of view — it feels like a template rather than a designed surface.

## Solution

A sub-agent pipeline that separates the roles Claude is good at (structure, logic, code generation) from the ones that need scaffolding (art direction, visual judgment, quality assurance). Three agents — art director, builder, critic — with a curated reference bank and design principles as their knowledge base.

## Architecture

```
User brief + repo context
        |
        v
+------------------+
|  Art Director    | <-- index.json, principles/*.md, selected pattern HTML
|  (sub-agent)     |
+--------+---------+
         |  creative brief + selected references
         v
+------------------+
|  Builder          | <-- brief, pattern HTML, user request, authoring standards
|  (main session)   |
+--------+---------+
         |  prototype HTML
         v
+------------------+
|  Critic           | <-- brief, HTML, anti-patterns.md, relevant principles
|  (sub-agent)      |
+--------+---------+
         | pass / revision notes
         v
   If fail: builder revises (one pass)
         |
         v
   HTML written to screen_dir --> companion renders
```

### When the Pipeline Runs

The pipeline runs when generating a prototype from a **new request or a significant design direction change**. It does NOT run for incremental refinements from Comment, Inspect, or Tune feedback — those are applied directly.

### Context-Aware Creative Freedom

The pipeline operates in two modes based on what the explore skill or repo inspection discovers:

**Greenfield mode** — no established design system, or the user explicitly wants a fresh direction. The art director has full creative license on color, typography, spacing, and everything else. The reference bank and principles drive the output.

**Established codebase mode** — the product already has tokens, a component library, brand colors, type scale, and spacing system. The art director's creative scope narrows to:
- Layout and composition (how to arrange things on the surface)
- Information hierarchy (what's prominent, secondary, or tucked away)
- Interaction patterns (reveal, collapse, transition)
- Density and rhythm (breathing room, tightening, opening up)
- Confident use of existing tokens in unexpected ways

Detection: if the repo has a populated token system (CSS custom properties in globals.css or equivalent), component directories, and a clear design language, the pipeline operates in established codebase mode. The art director respects existing tokens as hard constraints. The critic treats introducing tokens that don't exist in the system as a hard failure.

### Model Delegation

| Stage | Model | Rationale |
|-------|-------|-----------|
| Art director | Sonnet | Selection + synthesis from provided references |
| Builder | Sonnet | HTML generation — execution work |
| Critic | Sonnet | Applying a structured rubric |
| Orchestration | Lead session | Judgment calls about when to pipeline, how to handle critic feedback |

### Token Budget

| Input | Tokens (approx) |
|-------|-----------------|
| `index.json` (30 patterns) | 2–3K |
| Principles files (6 files) | 6K |
| Art director output (brief) | 500 |
| Selected pattern HTML (2–3) | 4K |
| Critic rubric + output | 2K |
| **Pipeline overhead total** | **15–20K across sub-agents** |
| **Main session additional** | **~7K** (brief + patterns + critic result) |

## Reference Bank

### Location

`skills/designkit/references/`

### Directory Structure

```
skills/designkit/references/
+-- index.json
+-- principles/
|   +-- typography.md
|   +-- color-strategy.md
|   +-- layout-composition.md
|   +-- visual-hierarchy.md
|   +-- spacing-rhythm.md
|   +-- anti-patterns.md
+-- patterns/
    +-- hero-asymmetric/
    |   +-- meta.json
    |   +-- pattern.html
    +-- hero-editorial/
    |   +-- meta.json
    |   +-- pattern.html
    +-- dashboard-dense/
    |   +-- meta.json
    |   +-- pattern.html
    +-- ...
```

### index.json

Flat array for art director lookup. Each entry is enough to match against a brief without reading every HTML file:

```json
[
  {
    "id": "hero-asymmetric",
    "category": "hero",
    "audience": ["consumer", "creative"],
    "mood": ["bold", "editorial", "high-energy"],
    "techniques": ["scale-contrast", "asymmetric-grid", "overlapping-elements"],
    "summary": "Full-bleed hero with dramatic type scale and off-grid image placement. Hierarchy through size, not weight."
  }
]
```

### meta.json (per pattern)

Full description for the builder when a pattern is selected:

```json
{
  "id": "hero-asymmetric",
  "name": "Asymmetric Hero",
  "category": "hero",
  "audience": ["consumer", "creative"],
  "mood": ["bold", "editorial", "high-energy"],
  "techniques": ["scale-contrast", "asymmetric-grid", "overlapping-elements"],
  "principles": ["layout-composition", "visual-hierarchy"],
  "summary": "Full-bleed hero with dramatic type scale and off-grid image placement.",
  "why_it_works": "The oversized headline (5rem+) creates an immediate focal point. The asymmetric split breaks the centered-everything monotony that AI defaults to. Negative space on the left balances the dense image on the right.",
  "when_to_use": "Landing pages, product launches, brand-forward consumer sites.",
  "watch_out": "Needs strong copy to earn the scale. Weak headlines get exposed by large type."
}
```

### pattern.html (per pattern)

Minimal, self-contained HTML snippet — one pattern, not a full page. Annotated with comments explaining design decisions:

```html
<!-- PATTERN: hero-asymmetric -->
<!-- Hierarchy through scale contrast (5rem heading vs 1.125rem body = ~4.4:1 ratio) -->
<!-- Asymmetric 7/5 grid breaks centered monotony -->
<section class="hero">
  <!-- Oversized heading earns the space with tight letter-spacing (-0.03em) -->
  <h1 class="hero-heading">...</h1>
  <!-- Body text stays restrained -- contrast makes hierarchy, not uniform bigness -->
  <p class="hero-body">...</p>
</section>
```

### Pattern Categories (Starter Set)

Target ~25-30 patterns across both consumer and enterprise:

| Category | Consumer/Creative | Enterprise |
|----------|------------------|------------|
| Hero | asymmetric, editorial, immersive | clean, metric-led, product-focused |
| Cards | bento grid, staggered, magazine | data card, stat tile, compact list |
| Navigation | minimal, overlay, scroll-linked | sidebar, breadcrumb-heavy, command bar |
| Pricing | bold comparison, single spotlight | tier table, feature matrix |
| Dashboard | -- | dense analytics, spacious overview, KPI strip |
| Forms | conversational, stepped | dense enterprise form, settings panel |
| Feature sections | showcase, alternating, bento | spec grid, comparison table |

### Principles Files

Markdown files with opinionated rules, reasoning, exceptions, and links to reference patterns:

```markdown
# Typography

## Rules

### Limit to two font weights per surface
Use regular and bold (or medium and semibold). A third weight creates
visual noise -- the eye can't build a reliable hierarchy from three
similar-but-different weights.

**Why:** Three weights force the viewer to consciously rank them. Two
weights create an automatic binary: primary/secondary.

**When to break it:** Data-dense dashboards where a monospace or
tabular weight serves a functional (not decorative) role.
See: [dashboard-dense](../patterns/dashboard-dense/)
```

Six principles files covering:
- **typography.md** — weight limits, scale ratios, letter-spacing, line-height, heading treatment
- **color-strategy.md** — palette construction, surface depth, accent use, dark mode, avoiding gray-plus-one-accent
- **layout-composition.md** — grid strategies, asymmetry, focal points, breaking the grid, density
- **visual-hierarchy.md** — scale contrast, weight contrast, position, whitespace as emphasis
- **spacing-rhythm.md** — vertical rhythm variation, section breathing, padding strategies, density calibration
- **anti-patterns.md** — catalog of common AI design failures with what to do instead

## Agent Designs

### Art Director (`skills/designkit/agents/art-director.md`)

**Role:** Takes user brief + repo context, selects relevant references, produces a creative brief for the builder.

**Inputs:**
- User's request
- Repo context summary (frameworks, tokens, design language)
- `references/index.json`
- All `references/principles/*.md` files

**Process:**
1. Analyze user intent — surface type, audience, mood
2. Determine creative freedom level (greenfield vs established codebase)
3. Scan `index.json`, select 2-3 relevant reference patterns
4. Read `meta.json` and `pattern.html` for selected patterns
5. Write a creative brief

**Creative Brief Format:**

```
## Direction
One sentence on overall feel and point of view.

## Typography
Scale ratio, weight strategy, heading treatment.
Linked to principle.

## Color Strategy
Palette approach -- not hex values but strategy.
In established codebase mode: how to use existing tokens more confidently.

## Layout & Composition
Grid approach, asymmetry vs symmetry, density, focal point.
Which reference pattern to draw from and what to take.

## Spacing & Rhythm
Vertical rhythm approach, section breathing, density calibration.

## Do Not
3-5 specific anti-patterns to avoid for THIS brief. Not generic advice --
targeted to what would go wrong with this particular request.

## Reference Patterns
- [pattern-id]: what to take from it
- [pattern-id]: what to take from it
```

**Key constraint:** The art director does NOT write HTML. It writes direction only.

### Critic (`skills/designkit/agents/critic.md`)

**Role:** Reviews generated HTML against a quality rubric. Returns pass or specific revision notes.

**Inputs:**
- The creative brief
- The generated HTML
- `references/principles/anti-patterns.md`
- Relevant principles files based on brief emphasis

**Hard Failures (trigger revision):**

| Check | Catches |
|-------|---------|
| Monotone spacing | Every section has identical padding — no vertical rhythm variation |
| Center-everything | All text center-aligned across 3+ sections |
| Single-weight typography | Only one font-weight, or heading/body too close in size |
| Uniform containers | Every card/block identical dimensions — no hierarchy |
| Missing focal point | No element breaks the grid or demands attention |
| Token-less styling | Inline styles or magic numbers instead of CSS custom properties |
| Generic color | Gray + one accent, no surface variation or subtle tints |
| Anti-pattern violations | Anything in anti-patterns.md |
| Foreign tokens (established mode) | Introducing CSS custom properties that don't exist in the repo's system |

**Soft Flags (not blockers):**

| Check | Catches |
|-------|---------|
| Brief drift | Output doesn't reflect specific direction from creative brief |
| Missed opportunity | A section could be bolder but isn't broken |
| Accessibility gap | Color contrast below 4.5:1, missing landmarks |
| Responsive concern | Layout that would break at mobile widths |

**Output Format:**

```json
{
  "pass": false,
  "hard_failures": [
    {
      "check": "monotone-spacing",
      "detail": "Sections 1-4 all use padding: 4rem 0. Vary the rhythm.",
      "elements": "section.hero, section.features, section.pricing, section.cta"
    }
  ],
  "soft_flags": [
    {
      "check": "missed-opportunity",
      "detail": "The stats row uses equal-width columns. Primary KPI could be wider."
    }
  ],
  "revision_prompt": "Fix the vertical rhythm: hero padding to 6rem, features to 3rem, pricing to 4rem, CTA to 2.5rem."
}
```

**Revision loop:** One pass maximum. If the revision still has hard failures, it ships anyway. The one-pass constraint forces the critic to be specific enough that one revision is sufficient.

### Pipeline Integration in SKILL.md

A new "Quality Pipeline" section in SKILL.md with orchestration instructions:

**Step 1 — Art Director:** Spawn sub-agent with `agents/art-director.md`. Pass user request, repo context, `index.json`, all principles files. Receives creative brief + selected pattern IDs. Read selected pattern HTML files.

**Step 2 — Builder:** Main session generates HTML (same as current flow). Input is now the creative brief, selected pattern HTML (2-3 examples), user's original request, and existing authoring standards.

**Step 3 — Critic:** Spawn sub-agent with `agents/critic.md`. Pass creative brief, generated HTML, anti-patterns.md, and the principles files referenced in the brief's "Linked to principle" annotations (typically 2-3 of the 6 files). If pass, done. If fail, main session applies revision_prompt fixes and writes updated HTML. No second critic pass.

## Dev Workflow (Internal Only)

### Location

`skills/designkit/dev/add-reference.md`

**Excluded from public release** via `release.sh` exclusion list. Tracked in private repo.

### URL Workflow

1. **Screenshot** — Playwright captures desktop (1440px) and mobile (430px)
2. **Analysis** — Claude reads screenshots, identifies distinct patterns worth extracting
3. **Selection** — Presents identified patterns, developer confirms which to capture
4. **Reconstruction** — Builds minimal annotated HTML per selected pattern. Distilled version capturing technique, proportions, and decisions — not a pixel-perfect clone
5. **Metadata** — Generates `meta.json` with full structured fields
6. **Preview** — Renders reconstructed pattern in companion for side-by-side review with original
7. **Commit** — On approval, writes to `references/patterns/<id>/`, updates `index.json`

### Screenshot Workflow

Same flow starting at step 2. Developer provides a screenshot path and optional guidance about what to focus on.

### Taxonomy Management

- Suggest existing tags when they fit rather than inventing new ones
- Flag when a new tag is genuinely needed
- Keep `index.json` sorted and deduplicated

### Quality Gate on References

The dev skill should push back when:
- Reconstructed pattern is too similar to an existing reference (suggest updating instead)
- Pattern is too complex to distill into a single snippet
- What makes it good is content/copy rather than design technique

### Batch Processing

For scale: screenshot all URLs in parallel, present summary of findings across all, cherry-pick which to reconstruct, process selected ones.

## File Manifest

New files this spec introduces:

```
skills/designkit/
+-- agents/
|   +-- art-director.md          NEW  agent prompt
|   +-- critic.md                NEW  agent prompt
+-- references/
|   +-- index.json               NEW  pattern catalog
|   +-- principles/
|   |   +-- typography.md        NEW  design principles
|   |   +-- color-strategy.md    NEW  design principles
|   |   +-- layout-composition.md NEW  design principles
|   |   +-- visual-hierarchy.md  NEW  design principles
|   |   +-- spacing-rhythm.md    NEW  design principles
|   |   +-- anti-patterns.md     NEW  design principles
|   +-- patterns/
|       +-- <pattern-id>/
|           +-- meta.json        NEW  per-pattern metadata
|           +-- pattern.html     NEW  annotated HTML snippet
+-- dev/
    +-- add-reference.md         NEW  internal dev workflow skill
```

Modified files:
- `skills/designkit/SKILL.md` — new "Quality Pipeline" section
- `release.sh` — add `skills/designkit/dev/` to exclusion list

## Implementation Order

1. **Principles files** — highest leverage, cheapest to build. Improves output quality even without the full pipeline by informing prototype generation.
2. **Critic agent** — adds a quality gate. Can be tested standalone against existing prototypes to calibrate the rubric.
3. **Reference bank structure** — `index.json`, initial `meta.json` and `pattern.html` entries. Start with 5-8 patterns to prove the format.
4. **Art director agent** — wired to the reference bank. Can be tested standalone to evaluate brief quality.
5. **Pipeline integration in SKILL.md** — wire the three stages together.
6. **Dev workflow skill** — the internal tool for scaling the reference bank.
7. **Reference bank expansion** — grow from 5-8 to 25-30 patterns.
