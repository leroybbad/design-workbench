# Design Explore Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a pre-generation brainstorming skill (`designkit:explore`) that guides users through intent discovery, concept exploration, and visual direction before any prototype is generated.

**Architecture:** Four new files — one skill definition (`EXPLORE.md`) and three reference files (`palettes.md`, `wireframe-guide.md`, `brief-template.md`) in a `references/` subdirectory. The skill reuses the existing designkit server and browser chrome with no script changes. Plugin registration files are updated to expose the new skill.

**Tech Stack:** Markdown skill definitions, CSS token sets, HTML/CSS class patterns. No new runtime dependencies.

**Spec:** `docs/designkit/specs/2026-04-08-design-explore-skill.md`

---

## Files

- Create: `skills/designkit/references/palettes.md`
- Create: `skills/designkit/references/wireframe-guide.md`
- Create: `skills/designkit/references/brief-template.md`
- Create: `skills/designkit/EXPLORE.md`
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Create: `docs/designkit/briefs/` (empty directory, created by skill at runtime)

---

### Task 1: Create the Palette Reference File

The palette file is the data backbone — all other files reference it. It contains complete CSS `:root` token blocks for each adoptable system and personality archetype.

**Files:**
- Create: `skills/designkit/references/palettes.md`

- [ ] **Step 1: Create the references directory**

```bash
mkdir -p skills/designkit/references
```

- [ ] **Step 2: Write `palettes.md` with Tier 1 adoptable systems**

Create `skills/designkit/references/palettes.md` with this content:

```markdown
# Design Palettes

Reference file for the Explore skill. Each palette is a complete CSS `:root` token block
that can be applied to prototypes and wireframes. The Explore skill reads this file when
showing palette options or applying a chosen palette.

## How to Use

When generating palette selection cards in the browser, render each palette as a card
with its name, description, and a small live sample (card with heading, body text, button)
styled by its token block. Use `[data-choice]` attributes on each card so clicks are
captured by the WebSocket event system.

When applying a chosen palette to wireframes, copy its `:root` block into the prototype's
`<style>` tag. For wireframe mode, reduce saturation and opacity (see wireframe-guide.md).

---

## Tier 1: Adoptable Systems

Real design systems people build apps with. Show these first.

### Material Design

Medium density, bold type hierarchy, surface layering with elevation, rounded corners.
Common in Android and web apps.

**Best for:** Cross-platform apps, data-rich interfaces, teams familiar with Google's ecosystem.

```css
:root {
  /* Colors */
  --color-primary: #6750A4;
  --color-primary-hover: #7E67C1;
  --color-on-primary: #ffffff;
  --color-bg: #FEF7FF;
  --color-surface: #ffffff;
  --color-surface-variant: #E7E0EC;
  --color-border: #CAC4D0;
  --color-text: #1D1B20;
  --color-text-secondary: #49454F;
  --color-text-tertiary: #79747E;
  --color-success: #386A20;
  --color-warning: #7D5700;
  --color-danger: #BA1A1A;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography */
  --font-family: 'Roboto', system-ui, sans-serif;
  --font-xs: 0.6875rem;
  --font-sm: 0.75rem;
  --font-base: 0.875rem;
  --font-lg: 1.125rem;
  --font-xl: 1.375rem;
  --font-2xl: 1.75rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Shape */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15);
  --shadow-md: 0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15);
  --shadow-lg: 0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3);
}
```

### Apple HIG

Consumer-facing, generous whitespace, SF-inspired typography, subtle depth, large touch
targets. iOS and macOS aesthetic.

**Best for:** Consumer apps, content-focused experiences, apps targeting Apple platforms.

```css
:root {
  /* Colors */
  --color-primary: #007AFF;
  --color-primary-hover: #0A84FF;
  --color-on-primary: #ffffff;
  --color-bg: #F2F2F7;
  --color-surface: #ffffff;
  --color-surface-variant: #E5E5EA;
  --color-border: #C6C6C8;
  --color-text: #000000;
  --color-text-secondary: #3C3C43;
  --color-text-tertiary: #8E8E93;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-danger: #FF3B30;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.25rem;
  --space-xl: 2rem;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
  --font-xs: 0.6875rem;
  --font-sm: 0.8125rem;
  --font-base: 1rem;
  --font-lg: 1.25rem;
  --font-xl: 1.5rem;
  --font-2xl: 2rem;
  --font-weight-normal: 400;
  --font-weight-medium: 600;
  --font-weight-bold: 700;

  /* Shape */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 28px rgba(0,0,0,0.12);
}
```

### Tailwind / Shadcn

De facto open-source web default. Utility-driven, clean, slightly opinionated toward
modern SaaS. Neutral and adaptable.

**Best for:** Web apps, SaaS products, teams using Tailwind CSS or Shadcn UI.

```css
:root {
  /* Colors */
  --color-primary: #18181B;
  --color-primary-hover: #27272A;
  --color-on-primary: #ffffff;
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-surface-variant: #F4F4F5;
  --color-border: #E4E4E7;
  --color-text: #09090B;
  --color-text-secondary: #52525B;
  --color-text-tertiary: #A1A1AA;
  --color-success: #16A34A;
  --color-warning: #CA8A04;
  --color-danger: #DC2626;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --space-xl: 1.5rem;

  /* Typography */
  --font-family: 'Inter', system-ui, -apple-system, sans-serif;
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 0.875rem;
  --font-lg: 1.125rem;
  --font-xl: 1.25rem;
  --font-2xl: 1.5rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  /* Shape */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
}
```

### Ant Design

Structured system popular in data-heavy enterprise apps. Good table, form, and list
patterns. Chinese-origin with global adoption.

**Best for:** Admin dashboards, enterprise tools, data management interfaces.

```css
:root {
  /* Colors */
  --color-primary: #1677FF;
  --color-primary-hover: #4096FF;
  --color-on-primary: #ffffff;
  --color-bg: #F5F5F5;
  --color-surface: #ffffff;
  --color-surface-variant: #FAFAFA;
  --color-border: #D9D9D9;
  --color-text: rgba(0,0,0,0.88);
  --color-text-secondary: rgba(0,0,0,0.65);
  --color-text-tertiary: rgba(0,0,0,0.45);
  --color-success: #52C41A;
  --color-warning: #FAAD14;
  --color-danger: #FF4D4F;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 0.75rem;
  --space-lg: 1rem;
  --space-xl: 1.5rem;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 0.875rem;
  --font-lg: 1rem;
  --font-xl: 1.25rem;
  --font-2xl: 1.5rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  /* Shape */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02);
  --shadow-md: 0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05);
  --shadow-lg: 0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05);
}
```

---

## Tier 2: Personality Archetypes

Genericized vibes backed by real token sets. Named by feel, not brand.
Show these below the adoptable systems.

### Corporate Dense

High information density, compact spacing, small type, lots of borders and dividers.
Dashboard and admin feel.

**Best for:** Analytics dashboards, admin panels, monitoring tools, back-office systems.
**Inspired by:** Atlassian design conventions.

```css
:root {
  /* Colors */
  --color-primary: #0052CC;
  --color-primary-hover: #0065FF;
  --color-on-primary: #ffffff;
  --color-bg: #FAFBFC;
  --color-surface: #ffffff;
  --color-surface-variant: #F4F5F7;
  --color-border: #DFE1E6;
  --color-text: #172B4D;
  --color-text-secondary: #5E6C84;
  --color-text-tertiary: #97A0AF;
  --color-success: #00875A;
  --color-warning: #FF991F;
  --color-danger: #DE350B;

  /* Spacing — tighter than average */
  --space-xs: 0.125rem;
  --space-sm: 0.25rem;
  --space-md: 0.5rem;
  --space-lg: 0.75rem;
  --space-xl: 1rem;

  /* Typography — smaller base size */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-xs: 0.6875rem;
  --font-sm: 0.75rem;
  --font-base: 0.8125rem;
  --font-lg: 1rem;
  --font-xl: 1.25rem;
  --font-2xl: 1.5rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  /* Shape — small radii, subtle shadows */
  --radius-sm: 3px;
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 1px rgba(9,30,66,0.13);
  --shadow-md: 0 4px 8px -2px rgba(9,30,66,0.16), 0 0 1px rgba(9,30,66,0.12);
  --shadow-lg: 0 8px 16px -4px rgba(9,30,66,0.16), 0 0 1px rgba(9,30,66,0.12);
}
```

### Clean & Spacious

Generous whitespace, restrained palette, one accent color, subtle shadows.
Premium SaaS feel.

**Best for:** Landing pages, billing/settings interfaces, developer-facing products.
**Inspired by:** Stripe design conventions.

```css
:root {
  /* Colors */
  --color-primary: #635BFF;
  --color-primary-hover: #7A73FF;
  --color-on-primary: #ffffff;
  --color-bg: #F6F9FC;
  --color-surface: #ffffff;
  --color-surface-variant: #F0F3F7;
  --color-border: #E3E8EE;
  --color-text: #1A1F36;
  --color-text-secondary: #4F566B;
  --color-text-tertiary: #8792A2;
  --color-success: #3ECF8E;
  --color-warning: #F5A623;
  --color-danger: #E25950;

  /* Spacing — generous */
  --space-xs: 0.25rem;
  --space-sm: 0.75rem;
  --space-md: 1.25rem;
  --space-lg: 2rem;
  --space-xl: 3rem;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 0.9375rem;
  --font-lg: 1.125rem;
  --font-xl: 1.5rem;
  --font-2xl: 2rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  /* Shape — smooth, subtle */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 6px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 15px 35px rgba(0,0,0,0.08);
}
```

### Neon AI

Dark backgrounds, vibrant accent colors, glow effects, monospace accents.
AI and developer tool feel.

**Best for:** AI products, dev tools, terminal-adjacent interfaces, creative coding tools.

```css
:root {
  /* Colors */
  --color-primary: #00E5FF;
  --color-primary-hover: #18FFFF;
  --color-on-primary: #0A0A0F;
  --color-bg: #0A0A0F;
  --color-surface: #141420;
  --color-surface-variant: #1E1E2E;
  --color-border: #2A2A3C;
  --color-text: #E4E4F0;
  --color-text-secondary: #A0A0B8;
  --color-text-tertiary: #6C6C80;
  --color-success: #00FF9D;
  --color-warning: #FFD600;
  --color-danger: #FF3D71;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Typography — monospace accent */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-xs: 0.75rem;
  --font-sm: 0.8125rem;
  --font-base: 0.875rem;
  --font-lg: 1.125rem;
  --font-xl: 1.375rem;
  --font-2xl: 1.75rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  /* Shape — glow shadows */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --shadow-sm: 0 0 8px rgba(0,229,255,0.1);
  --shadow-md: 0 0 20px rgba(0,229,255,0.15);
  --shadow-lg: 0 0 40px rgba(0,229,255,0.2);
}
```

### Editorial

Strong typographic hierarchy, serif headings, reading-optimized layout.
Content-heavy feel.

**Best for:** Blogs, documentation, content platforms, publishing tools.

```css
:root {
  /* Colors */
  --color-primary: #1A1A1A;
  --color-primary-hover: #333333;
  --color-on-primary: #ffffff;
  --color-bg: #FDFCFA;
  --color-surface: #ffffff;
  --color-surface-variant: #F5F3EF;
  --color-border: #E8E4DD;
  --color-text: #1A1A1A;
  --color-text-secondary: #555555;
  --color-text-tertiary: #999999;
  --color-success: #2D7D46;
  --color-warning: #B8860B;
  --color-danger: #C23B22;

  /* Spacing — reading-optimized */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1.25rem;
  --space-lg: 2rem;
  --space-xl: 3rem;

  /* Typography — serif headings, readable body */
  --font-family: 'Georgia', 'Times New Roman', serif;
  --font-family-body: 'Charter', 'Georgia', serif;
  --font-family-ui: -apple-system, BlinkMacSystemFont, sans-serif;
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1.0625rem;
  --font-lg: 1.3125rem;
  --font-xl: 1.75rem;
  --font-2xl: 2.5rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --line-height-body: 1.7;

  /* Shape — minimal */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.08);
}
```

### Playful

Rounded shapes, saturated colors, larger type, bouncy feel.
Consumer and creative tool vibe.

**Best for:** Consumer apps, onboarding flows, creative tools, gamified interfaces.

```css
:root {
  /* Colors */
  --color-primary: #6C5CE7;
  --color-primary-hover: #7E70F0;
  --color-on-primary: #ffffff;
  --color-bg: #F8F7FF;
  --color-surface: #ffffff;
  --color-surface-variant: #F0EEFF;
  --color-border: #E2DFFF;
  --color-text: #2D2B55;
  --color-text-secondary: #5A5680;
  --color-text-tertiary: #9895B0;
  --color-success: #00B894;
  --color-warning: #FDCB6E;
  --color-danger: #E17055;

  /* Spacing — generous, breathing room */
  --space-xs: 0.25rem;
  --space-sm: 0.625rem;
  --space-md: 1rem;
  --space-lg: 1.75rem;
  --space-xl: 2.5rem;

  /* Typography — larger, friendly */
  --font-family: 'Nunito', 'Rubik', system-ui, sans-serif;
  --font-xs: 0.75rem;
  --font-sm: 0.875rem;
  --font-base: 1rem;
  --font-lg: 1.25rem;
  --font-xl: 1.625rem;
  --font-2xl: 2.25rem;
  --font-weight-normal: 400;
  --font-weight-medium: 600;
  --font-weight-bold: 700;

  /* Shape — very rounded */
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  --shadow-sm: 0 2px 8px rgba(108,92,231,0.08);
  --shadow-md: 0 6px 20px rgba(108,92,231,0.12);
  --shadow-lg: 0 12px 36px rgba(108,92,231,0.16);
}
```

### Minimal Mono

Near-zero color, relies on type weight and spacing for hierarchy. Ultra-clean.

**Best for:** Developer tools, settings panels, documentation, text-heavy interfaces.

```css
:root {
  /* Colors — almost no color */
  --color-primary: #111111;
  --color-primary-hover: #333333;
  --color-on-primary: #ffffff;
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-surface-variant: #F7F7F7;
  --color-border: #EBEBEB;
  --color-text: #111111;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-success: #111111;
  --color-warning: #111111;
  --color-danger: #111111;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;

  /* Typography — monospace available */
  --font-family: 'Inter', -apple-system, system-ui, sans-serif;
  --font-family-mono: 'SF Mono', 'Fira Code', monospace;
  --font-xs: 0.75rem;
  --font-sm: 0.8125rem;
  --font-base: 0.875rem;
  --font-lg: 1.125rem;
  --font-xl: 1.375rem;
  --font-2xl: 1.75rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  /* Shape — minimal, sharp */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
  --shadow-sm: 0 0 0 1px rgba(0,0,0,0.04);
  --shadow-md: 0 0 0 1px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06);
}
```
```

- [ ] **Step 3: Verify the file renders correctly**

Open the file and confirm all 10 palette token blocks (4 adoptable + 6 personality) are present with complete `:root` declarations. Each should have: Colors (12 tokens), Spacing (5 tokens), Typography (10+ tokens), Shape (6+ tokens).

- [ ] **Step 4: Commit**

```bash
git add skills/designkit/references/palettes.md
git commit -m "feat(explore): add palette reference file with 10 design system token sets

Four adoptable systems (Material, Apple, Tailwind/Shadcn, Ant Design) and
six personality archetypes (Corporate Dense, Clean & Spacious, Neon AI,
Editorial, Playful, Minimal Mono)."
```

---

### Task 2: Create the Wireframe Guide Reference File

Defines the "lo-fi with warmth" CSS class kit used for concept wireframes.

**Files:**
- Create: `skills/designkit/references/wireframe-guide.md`

- [ ] **Step 1: Write `wireframe-guide.md`**

Create `skills/designkit/references/wireframe-guide.md` with this content:

```markdown
# Wireframe Guide — Lo-fi with Warmth

Reference file for the Explore skill. Defines the CSS class kit and authoring rules
for concept wireframe screens. These wireframes sit between gray-box wireframes
and polished mockups — they have enough personality to feel directional without
locking in details.

## Principles

1. **Soft corners** — `border-radius` everywhere, nothing sharp-edged
2. **Hint of palette** — chosen palette's colors at reduced saturation/opacity
3. **Real labels** — actual text ("Total Revenue", "$48,250"), never lorem ipsum
4. **Simple iconography** — emoji or single-stroke SVG, no icon libraries
5. **Visible structure** — subtle borders and fills to show layout regions
6. **No images** — placeholder regions with soft dashed outline and centered label

## Muting a Palette for Wireframe Mode

When generating wireframe concepts, the chosen palette's tokens should be desaturated
and reduced in contrast. Apply this transformation to the token block:

```css
/* Wireframe muting layer — add after the palette :root block */
#claude-content {
  --color-primary: color-mix(in oklch, var(--color-primary), #888 40%);
  --color-bg: color-mix(in oklch, var(--color-bg), #f5f5f5 30%);
  --color-surface: color-mix(in oklch, var(--color-surface), #fafafa 20%);
  --color-border: color-mix(in oklch, var(--color-border), #ddd 30%);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 3px 8px rgba(0,0,0,0.05);
}
```

If `color-mix` is not reliable in the target browser, use manually desaturated hex
values derived from the palette. The goal: recognizably the palette, but quieter.

## CSS Class Kit

These classes layer on top of the frame template's existing classes (`.cards`,
`.options`, `.mockup`, `.split`, `.mock-nav`, `.mock-sidebar`, etc.). Use the
existing classes when they fit; add these for wireframe-specific patterns.

### Layout Shells

```css
/* Full app wireframe with optional sidebar */
.wf-app {
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: auto 1fr;
  min-height: 80vh;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.wf-topbar {
  grid-column: 1 / -1;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.wf-sidebar {
  padding: var(--space-md);
  background: var(--color-surface-variant);
  border-right: 1px solid var(--color-border);
  min-width: 180px;
  font-size: var(--font-sm);
}

.wf-main {
  padding: var(--space-lg);
  background: var(--color-bg);
  overflow-y: auto;
}
```

### Content Blocks

```css
/* Section heading */
.wf-heading {
  font-size: var(--font-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

/* Metric card (KPI, stat) */
.wf-metric {
  padding: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.wf-metric .label {
  font-size: var(--font-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: var(--space-xs);
}

.wf-metric .value {
  font-size: var(--font-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

/* Data table placeholder */
.wf-table {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.wf-table-header {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-variant);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  gap: var(--space-md);
}

.wf-table-row {
  padding: var(--space-sm) var(--space-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-sm);
  color: var(--color-text);
  display: flex;
  gap: var(--space-md);
}

/* Chart / visualization placeholder */
.wf-chart {
  aspect-ratio: 16 / 9;
  background: var(--color-surface-variant);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
}

/* Image / media placeholder */
.wf-placeholder {
  aspect-ratio: 16 / 10;
  background: var(--color-surface-variant);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-sm);
  padding: var(--space-md);
}

/* Button */
.wf-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: var(--font-weight-medium);
  cursor: default;
}

.wf-button.secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* Text input */
.wf-input {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: var(--color-text-tertiary);
  width: 100%;
}

/* Nav item list (for sidebar) */
.wf-nav-item {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  cursor: default;
}

.wf-nav-item.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
```

### Grid Utilities

```css
/* Responsive card grid */
.wf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
}

/* Two-column split */
.wf-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

/* Metric row (3-4 KPIs across) */
.wf-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-md);
}
```

## Authoring Rules

When generating concept wireframe HTML:

1. **Include the wireframe CSS** — add the class kit above in a `<style>` block at the top
2. **Include the palette tokens** — copy the chosen palette's `:root` block, then the muting layer
3. **Use semantic classes** — `.wf-metric`, `.wf-sidebar`, not `.p-4.bg-white`
4. **Use real text** — content plausible for the stated problem domain
5. **Keep it flat** — no deep nesting. One or two levels of structure max.
6. **No JavaScript** — wireframes are static HTML + CSS only

## Concept Card Layout

When showing multiple concepts for comparison, use the existing `.cards` and `.card`
classes from the frame template. Each card should contain:

```html
<div class="cards">
  <div class="card" data-choice="a">
    <div class="card-body">
      <h3>Sidebar Nav + Card Grid</h3>
      <p class="subtitle">Fixed sidebar navigation with a responsive card grid
         for the main content area. Good for multi-section apps.</p>
      <!-- Miniature wireframe preview here -->
      <div class="wf-app" style="min-height: 200px; font-size: 0.65rem;">
        <div class="wf-topbar">App Name</div>
        <div class="wf-sidebar">Nav</div>
        <div class="wf-main">
          <div class="wf-grid">
            <div class="wf-metric"><span class="label">Metric</span></div>
            <div class="wf-metric"><span class="label">Metric</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- More cards... -->
</div>
```

Use `data-choice="a"`, `data-choice="b"`, etc. so the companion's click handler
captures selections via WebSocket.
```

- [ ] **Step 2: Verify the file**

Confirm all sections present: Principles, Muting, CSS Class Kit (Layout Shells, Content Blocks, Grid Utilities), Authoring Rules, Concept Card Layout.

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/references/wireframe-guide.md
git commit -m "feat(explore): add wireframe guide with lo-fi-with-warmth CSS class kit

Layout shells, content blocks, grid utilities, palette muting technique,
and concept card layout patterns for the Explore skill."
```

---

### Task 3: Create the Brief Template Reference File

The template for design brief output documents.

**Files:**
- Create: `skills/designkit/references/brief-template.md`

- [ ] **Step 1: Write `brief-template.md`**

Create `skills/designkit/references/brief-template.md` with this content:

```markdown
# Design Brief Template

Reference file for the Explore skill. Use this template when writing the design brief
after the user converges on a direction. Save the completed brief to:

`docs/designkit/briefs/YYYY-MM-DD-<topic>.md`

Create the `docs/designkit/briefs/` directory if it doesn't exist.

---

## Template

```markdown
# Design Brief: [Topic]

**Date:** YYYY-MM-DD
**Status:** Active

---

## Problem

<!-- Who is this for? What do they need? What does success look like?
     Be specific about the user role, the job to be done, and how you'd
     know this design is working. -->

**User:** [Role and context]
**Job to be done:** [Core task or goal]
**Success looks like:** [Observable outcome]

## Concept Direction

<!-- Which concept was chosen from the exploration phase, or how elements
     from multiple concepts were combined. Include WHY this direction was
     chosen over alternatives. -->

**Chosen approach:** [Brief name and description]
**Why this direction:** [What made it the right fit]
**Rejected alternatives:** [What was considered and why it didn't fit]

## Interaction Model

- **Primary pattern:** [Dashboard / Wizard / Feed / Form-heavy / Canvas / Conversational]
- **Navigation:** [Sidebar / Top tabs / Breadcrumbs / Modal-based]
- **Data density:** [Sparse & focused / Medium / Dense & information-rich]
- **Responsive:** [Desktop-first / Mobile-first / Both equally]

## Look & Feel

- **Base:** [Palette name, "codebase tokens", or custom]
- **Personality:** [1-2 sentence description of the visual vibe]

**Token set:**

<!-- Paste the full :root token block here so downstream tools can apply it
     without re-reading the palette reference file. -->

```css
:root {
  /* paste tokens here */
}
```

## Key Layout Decisions

<!-- Specific structural choices made during exploration. These anchor future
     work so the agent doesn't drift back to generic defaults.
     Examples:
     - "Metrics across the top, not in a sidebar"
     - "Wizard steps as vertical timeline, not horizontal stepper"
     - "No left sidebar — top nav only to maximize content width" -->

- [Decision 1]
- [Decision 2]
- [Decision 3]

## Open Questions

<!-- Anything deferred — edge cases, states, features that were noted but not
     resolved during exploration. These should be addressed before or during
     implementation. -->

- [Question 1]
- [Question 2]
```

## Usage Notes

- **Fill every section.** If a section doesn't apply, write "N/A" with a brief reason.
- **Be concrete.** "Clean and modern" is not a personality description. "Generous whitespace,
  one accent color, muted palette — premium SaaS feel like Stripe's dashboard" is.
- **Include the token set inline.** The brief should be self-contained. Don't just reference
  "see palettes.md" — paste the actual tokens so downstream tools work without chasing files.
- **Record rejected alternatives.** This prevents future iterations from re-exploring dead ends.
```

- [ ] **Step 2: Commit**

```bash
git add skills/designkit/references/brief-template.md
git commit -m "feat(explore): add design brief template for exploration output"
```

---

### Task 4: Create the EXPLORE.md Skill File

The main skill definition that guides Claude through the adaptive brainstorming flow.

**Files:**
- Create: `skills/designkit/EXPLORE.md`

- [ ] **Step 1: Write `EXPLORE.md`**

Create `skills/designkit/EXPLORE.md` with this content:

````markdown
---
name: explore
description: "Explore design solutions before building — discover intent, explore concepts, and converge on direction. Use when starting UI/UX work from scratch or when a request is vague enough that jumping straight to a prototype would produce generic output."
---

# Design Explore

A pre-generation brainstorming skill that guides the user through intent discovery,
concept exploration, and visual direction before any prototype is rendered. Prevents
AI slop by anchoring every design decision to the user's actual intent.

## When to Use

- The user asks to design, build, or create UI — especially starting from scratch
- The request is vague enough that a prototype would be generic ("build me a dashboard")
- The user wants to explore different approaches before committing to one
- The user says "explore", "brainstorm", or "let's figure out what to build"

## When NOT to Use

- The user has a clear, specific request AND an existing design to refine (use designkit)
- The user is iterating on an existing prototype (use designkit)
- The user explicitly asks to skip exploration and just build something

## Hard Gate

<HARD-GATE>
Do NOT generate a prototype, write production HTML, or invoke the designkit skill until:
1. A problem statement exists (who, what, why)
2. An interaction model is identified (pattern, navigation, density)
3. Some aesthetic signal is captured (palette, vibe, or codebase tokens)

You MAY show visual content in the browser during exploration (palette cards, concept
wireframes). These are exploration artifacts, not prototypes.
</HARD-GATE>

## Checklist

You MUST create a task for each item and complete them in order:

1. **Read the room** — assess what's known, scan codebase for existing tokens
2. **Discover** — adaptive questions (problem, interaction model, look & feel)
3. **Show palette options** in browser (if no codebase tokens detected)
4. **Ask tight vs. wide** — 3 focused concepts or wider range?
5. **Generate concept wireframes** in browser
6. **Converge** on direction with the user
7. **Write design brief** to `docs/designkit/briefs/YYYY-MM-DD-<topic>.md`
8. **Generate first prototype** at higher fidelity with chosen palette
9. **Hand off** — offer refinement via designkit or implementation path

## Phase 1: Read the Room

Before asking any questions, assess what you already know:

**From the user's message:**
- Extract any stated problem, audience, aesthetic preferences, product references
- Note the specificity level: vague idea / scoped feature / extending existing product

**From the codebase (if one exists):**
Scan for existing design tokens and systems. Look for:
- `tailwind.config.*` files
- `theme.*` files
- CSS files with `:root` custom properties
- Package imports: `@mui`, `antd`, `@chakra-ui`, `@radix-ui`, shadcn config
- Any `tokens` or `variables` CSS/SCSS files

If tokens are found, note them. You'll confirm with the user in Phase 2.

**Adaptive depth:**
- Vague idea → full discovery (all three threads)
- Scoped feature → lighter problem questions (they know their product)
- "Make it look like X" → aesthetic is mostly answered, shorter discovery

**Rule:** Never re-ask something the user already told you. Mark it as known.

## Phase 2: Discover

One question per message. Multiple choice when possible.

Three threads — order them adaptively based on what's known:

### Thread A — Problem & Audience

Ask only what you don't already know:

- **Who uses this?** Role, expertise level, how often they use it
- **Core job to be done?** What is the user trying to accomplish?
- **What does success look like?** How would you know this design is working?
- **Constraints?** Accessibility needs, device targets, existing product it lives inside

### Thread B — Interaction Model

- **Primary pattern:** Dashboard / Wizard / Feed / Form-heavy / Canvas / Conversational
- **Navigation:** Sidebar / Top tabs / Breadcrumb drill-down / Modal-based
- **Data density:** Sparse & focused / Medium / Dense & information-rich
- **Responsive:** Desktop-first / Mobile-first / Both equally

### Thread C — Look & Feel

If codebase tokens were detected in Phase 1:
> "I found [system/tokens] in your project. Should I use these as the starting
> point, or do you want to explore other directions?"

If no codebase tokens, or the user wants to explore:
1. Start the Design Companion server (see Server section below)
2. Read `references/palettes.md` for the available palettes
3. Generate a palette selection screen showing all options as cards
4. Show Tier 1 (adoptable systems) at top, Tier 2 (personality archetypes) below
5. Each card: name, one-line description, live-rendered sample using that palette's tokens
6. Use `data-choice` attributes so clicks are captured
7. Tell the user the URL and wait for their selection

**Ordering rule:**
- Vague idea → Thread A first, then B, then C
- Scoped feature in existing product → Light A, B, then C (detect from codebase)
- "Build something that feels like X" → C is mostly answered, quick A, then B
- Use judgment. Get aesthetic signal before showing any wireframes.

## Phase 3: Explore Concepts

Once you have enough context (problem + interaction model + aesthetic signal):

1. **Ask:** "Want 3 focused concepts or a wider range to react to?"
2. Read `references/wireframe-guide.md` for the CSS class kit and authoring rules
3. Generate concept wireframes — one HTML file per concept, or a single file with a card grid showing all concepts
4. Each concept should:
   - Have a clear name and 1-2 sentence description
   - Show a distinct layout/approach to the stated problem
   - Use the lo-fi-with-warmth style (wireframe guide)
   - Use the chosen palette's tokens in muted form
   - Use real, plausible content labels — never lorem ipsum
   - Be clickable via `data-choice` attributes
5. Tell the user the URL and what to look at
6. Wait for their reaction

**If the user asks to "push wider":** Generate 3-5 more concepts that are intentionally
more divergent — different navigation models, unconventional layouts, alternative
information hierarchies. Label these as "wider exploration."

## Phase 4: Converge

- User picks a direction (or mixes elements from multiple concepts)
- Confirm your understanding: "So the direction is [concept A's layout] with
  [concept C's navigation approach], using the [palette] feel — does that capture it?"
- If they want adjustments, refine and re-confirm
- One round of refinement questions if needed, then move to output

## Phase 5: Output

### Write the design brief

1. Read `references/brief-template.md` for the template structure
2. Fill in every section based on the exploration conversation
3. Include the full token set inline (don't just reference palettes.md)
4. Record rejected alternatives so future iterations don't re-explore them
5. Save to `docs/designkit/briefs/YYYY-MM-DD-<topic>.md`
6. Create the `docs/designkit/briefs/` directory if it doesn't exist

### Generate the first prototype

1. Take the chosen concept wireframe and render it at higher fidelity
2. Apply the full (unmuted) palette tokens
3. Use real content, proper spacing, complete structure
4. Follow the designkit SKILL.md authoring standards:
   - CSS classes, not inline styles
   - CSS custom properties (tokens) for all design values
   - Semantic class names
   - Token block in `<style>` at top
5. Write to the screen directory and tell the user to check the browser

### Hand off

After the brief is written and prototype is shown:

> "Design brief saved to `docs/designkit/briefs/<filename>.md`. The first prototype
> is in the browser. From here you can:
>
> - **Refine** — use the Design Companion tools (Shift+C to comment, Shift+T to tune)
>   and send feedback for iteration
> - **Implement** — use the brief as input for a coding plan
> - **Keep exploring** — if this direction doesn't feel right, we can go back"

Don't force a path. Let the user decide.

## Server Management

The Explore skill uses the same Design Companion server as the designkit skill.

**Starting the server:**

```bash
skills/designkit/scripts/start-server.sh --project-dir "$PROJECT_DIR"
```

Returns JSON with `screen_dir`, `state_dir`, and `url`. Save all three.

**Writing screens:** Write HTML files to `screen_dir`. The server serves the newest
file by modification time. Content fragments (no `<!DOCTYPE`) are wrapped in the
companion frame template automatically.

**Reading events:** After telling the user to interact, read `$STATE_DIR/events`
for their feedback (clicks, comments, tune changes) as JSONL.

**When to start the server:**
- At the beginning of Thread C (look & feel) if palette cards need to be shown
- Before Phase 3 if not already running
- Check `$STATE_DIR/server-info` to see if a server is already running

## Key Behavioral Rules

- **One question per message.** Never combine multiple questions.
- **Multiple choice preferred.** Easier to answer than open-ended.
- **Never re-ask.** Skip questions the user already answered.
- **Aesthetic before visuals.** Always get some palette signal before showing wireframes.
- **Real content.** Never use lorem ipsum, "[Title]", or placeholder text.
- **Lo-fi with warmth.** Concept wireframes are soft, warm, directional — not gray boxes.
- **Document everything.** The design brief is the anchor against future AI slop.
````

- [ ] **Step 2: Verify the file**

Read the file and confirm:
- Frontmatter has `name: explore` and description
- Hard gate section is present
- All 9 checklist items are present
- All 5 phases are documented
- Server management section references correct scripts
- References to `references/palettes.md`, `references/wireframe-guide.md`, `references/brief-template.md` are present

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/EXPLORE.md
git commit -m "feat(explore): add Design Explore skill for pre-generation brainstorming

Adaptive discovery flow (problem, interaction model, look & feel),
concept wireframe generation, convergence, design brief output,
and first prototype handoff."
```

---

### Task 5: Update Plugin Registration

Register the new skill in the plugin config files so it's discoverable as `designkit:explore`.

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Update `plugin.json`**

The current `plugin.json` has no `skills` array. Add one that registers both the existing `designkit` skill and the new `explore` skill. Update the file to:

```json
{
  "name": "designkit",
  "description": "Browser-based design tools for Claude Code — explore design directions, then refine with Comment, Inspect, Tune, and Shadow modes",
  "version": "0.2.0",
  "author": {
    "name": "Lee McEwen"
  },
  "homepage": "https://github.com/leroybbad/designkit",
  "repository": "https://github.com/leroybbad/designkit",
  "license": "MIT",
  "keywords": [
    "design",
    "ui",
    "prototyping",
    "design-tools",
    "brainstorming",
    "explore",
    "inspect",
    "tune",
    "shadows",
    "design-tokens",
    "annotation"
  ]
}
```

- [ ] **Step 2: Update `marketplace.json`**

Update the description to reflect the new capability:

```json
{
  "name": "designkit-marketplace",
  "description": "Browser-based design exploration and refinement tools for Claude Code",
  "owner": {
    "name": "Lee McEwen"
  },
  "plugins": [
    {
      "name": "designkit",
      "description": "Explore design directions with guided brainstorming, then refine with Comment, Inspect, Tune, and Shadow tools",
      "version": "0.2.0",
      "source": "./",
      "author": {
        "name": "Lee McEwen"
      }
    }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "feat(explore): register explore skill in plugin config

Bump version to 0.2.0, update descriptions to reflect new
design exploration capability."
```

---

### Task 6: Verify End-to-End

Smoke test that everything is in place and the skill can be discovered.

- [ ] **Step 1: Verify file structure**

```bash
find skills/designkit -type f | sort
```

Expected output:
```
skills/designkit/EXPLORE.md
skills/designkit/SKILL.md
skills/designkit/references/brief-template.md
skills/designkit/references/palettes.md
skills/designkit/references/wireframe-guide.md
skills/designkit/scripts/helper.js
skills/designkit/scripts/frame-template.html
skills/designkit/scripts/server.cjs
skills/designkit/scripts/start-server.sh
skills/designkit/scripts/stop-server.sh
skills/designkit/visual-guide.md
```

- [ ] **Step 2: Verify EXPLORE.md frontmatter is parseable**

```bash
head -4 skills/designkit/EXPLORE.md
```

Expected:
```
---
name: explore
description: "Explore design solutions before building — discover intent, explore concepts, and converge on direction. Use when starting UI/UX work from scratch or when a request is vague enough that jumping straight to a prototype would produce generic output."
---
```

- [ ] **Step 3: Verify all cross-references resolve**

Check that EXPLORE.md references files that exist:
```bash
grep -o 'references/[a-z-]*\.md' skills/designkit/EXPLORE.md | sort -u
```

Expected:
```
references/brief-template.md
references/palettes.md
references/wireframe-guide.md
```

Confirm they all exist:
```bash
ls skills/designkit/references/
```

Expected:
```
brief-template.md
palettes.md
wireframe-guide.md
```

- [ ] **Step 4: Verify palette count**

```bash
grep -c '^### ' skills/designkit/references/palettes.md
```

Expected: `10` (4 adoptable + 6 personality)

- [ ] **Step 5: Final commit (if any fixes needed)**

If any issues were found and fixed, commit them. Otherwise, skip this step.
