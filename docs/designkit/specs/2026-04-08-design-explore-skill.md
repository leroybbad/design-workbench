# Design Explore Skill — Spec

**Date:** 2026-04-08
**Status:** Draft
**Goal:** Add a pre-generation brainstorming skill to the designkit plugin that guides users through intent discovery, concept exploration, and visual direction before any prototype is generated — eliminating AI slop on the first round.

---

## Problem

The designkit plugin currently jumps straight from a user request to a rendered prototype. When the request is vague ("build me a dashboard"), the result is generic AI output — correct structure, zero personality. The refinement tools (Comment, Inspect, Tune) can polish what exists, but they can't fix a design that started without clear intent.

The missing piece is a divergent thinking phase — structured exploration that captures problem context, interaction model, and aesthetic direction before a single pixel is rendered.

## File Layout

```
skills/designkit/
├── SKILL.md                    # (existing) refinement workflow — unchanged
├── EXPLORE.md                  # NEW — main Explore skill instructions
├── visual-guide.md             # (existing) — unchanged
├── references/
│   ├── palettes.md             # NEW — token sets for all style options
│   ├── wireframe-guide.md      # NEW — lo-fi-with-warmth CSS patterns
│   └── brief-template.md       # NEW — design brief output structure
└── scripts/                    # (existing) — shared browser chrome, no changes
```

The Explore skill reuses the existing server (`server.cjs`), frame template, and `helper.js`. No script changes required. The visual companion infrastructure already supports showing HTML screens with clickable options and card grids.

Plugin registration: The new skill gets its own entry in `marketplace.json` and `plugin.json` as `designkit:explore`.

## The Adaptive Flow

### Phase 1: Read the Room

When invoked, the skill assesses context before asking anything:

- **What has the user already said?** Extract any stated problem, audience, aesthetic preferences, references. Never re-ask.
- **Is there an existing codebase?** Scan for: `tailwind.config.*`, `theme.*` files, CSS files with `:root` custom properties, design system package imports (`@mui`, `antd`, `@chakra-ui`, `@radix-ui`, `shadcn` config), or any `tokens` / `variables` CSS/SCSS files.
- **How specific is the request?** Vague idea → full discovery. Scoped feature → shorter discovery. "Make it look like X" → skip to concepts faster.

### Phase 2: Discover

One question per message. Multiple choice when possible. Three threads, adaptively ordered:

**Thread A — Problem & Audience**
- Who uses this? (Role, expertise level, frequency of use)
- What's the core job to be done?
- What does success look like for the user?
- Any constraints? (Accessibility, device targets, existing product context)

**Thread B — Interaction Model**
- Primary pattern: Dashboard / Wizard / Feed / Form-heavy / Canvas / Conversational
- Navigation model: Sidebar / Top tabs / Breadcrumb drill-down / Modal-based
- Data density: Sparse & focused / Medium / Dense & information-rich
- Responsive expectations: Desktop-first / Mobile-first / Both equally

**Thread C — Look & Feel**
- If codebase tokens detected: "I found [system/tokens] in your project. Should I use these as the base?"
- If no codebase: Show palette options in the browser (see Palette System below)
- Aesthetic signal must be captured before any wireframes are shown

**Adaptive ordering:**
- Vague idea → A first, then B, then C
- "I need a settings page for our app" → Light A (they know the product), B, then C (detect from codebase)
- "Build something that feels like Linear" → C is mostly answered, quick A, then B
- The skill uses judgment, not rigid sequence

### Phase 3: Explore Concepts

Once enough context exists (problem + interaction model + some aesthetic signal):

1. Ask: **"Want 3 focused concepts or a wider range to react to?"**
2. Generate lo-fi wireframe sketches in the browser (see Wireframe Style below)
3. Show as a card grid — each card has title, thumbnail wireframe, 1-2 sentence description
4. User clicks to select, comments, or asks to push wider
5. If "push wider" — generate 3-5 more concepts that are intentionally more divergent

### Phase 4: Converge

- User picks a direction (or mixes elements from multiple concepts)
- Skill confirms the synthesis: "So the direction is [concept A's layout] with [concept C's navigation approach], using the [palette] feel?"
- One round of refinement questions if needed

### Phase 5: Output

Two artifacts:
1. **Design brief** — written to `docs/designkit/briefs/YYYY-MM-DD-<topic>.md`
2. **First prototype** — the chosen concept rendered at higher fidelity with full palette applied, shown in the browser

## Palette System

### Tier 1: Adoptable Systems (shown first)

Real design systems people build apps with. Each is a complete token set (color, type scale, spacing, radius, shadow):

| System | Character |
|--------|-----------|
| **Material Design** | Medium density, bold type hierarchy, surface layering with elevation, rounded corners. Common in Android/web apps. |
| **Apple HIG** | Consumer-facing, generous whitespace, SF-inspired type, subtle depth, large touch targets. iOS/macOS feel. |
| **Tailwind/Shadcn** | De facto open-source web default. Utility-driven, clean, modern SaaS lean. |
| **Ant Design** | Data-heavy enterprise apps. Structured, good table/form patterns, global adoption. |

Four systems. These are the ones people actually adopt.

### Tier 2: Personality Archetypes (shown below)

Genericized vibes backed by real token sets. Named by feel, not brand:

| Archetype | Character | Inspired by |
|-----------|-----------|-------------|
| **Corporate Dense** | High information density, compact spacing, small type, lots of borders. Dashboard/admin feel. | Atlassian conventions |
| **Clean & Spacious** | Generous whitespace, restrained palette, one accent color, subtle shadows. Premium SaaS feel. | Stripe conventions |
| **Neon AI** | Dark backgrounds, vibrant accents, glow effects, monospace accents. AI/dev-tool feel. | — |
| **Editorial** | Strong typographic hierarchy, serif headings, reading-optimized layout. Content-heavy feel. | — |
| **Playful** | Rounded shapes, saturated colors, larger type, bouncy feel. Consumer/creative tool vibe. | — |
| **Minimal Mono** | Near-zero color, type weight and spacing for hierarchy. Ultra-clean. | — |

### How palettes are stored

Each palette in `references/palettes.md` is a complete CSS `:root` token block — colors, spacing scale, type scale, radius, shadow ramp — plus metadata (description, best-for, origin-system if applicable).

### How palettes are shown

In the browser as a card grid. Each card shows:
- Name and one-line description
- A small live-rendered sample (card with heading, body text, button, surface) using that palette's tokens
- Clickable — selection sent via WebSocket event

### Codebase detection supersedes both tiers

If the skill finds existing tokens, it presents those first. Tiers are fallback for starting from scratch.

## Wireframe Style: Lo-fi with Warmth

### What it is
- **Soft corners** — border-radius everywhere, nothing sharp-edged
- **Hint of palette** — chosen palette's primary and background colors at reduced saturation/opacity. Feels directional, not "designed"
- **Real labels** — actual text like "Total Revenue" and "$48,250", never lorem ipsum or "[Title]"
- **Simple iconography** — single-stroke or emoji placeholders, no icon library
- **Visible structure** — subtle borders or fill differences to show layout regions (nav, sidebar, content, cards)
- **No images** — placeholder regions with subtle pattern or icon, not gray boxes with X

### What it's not
- Not grayscale boxes with hard edges (traditional wireframe)
- Not a polished mockup (that comes after convergence)
- Not pixel-perfect — proportions matter, exact spacing doesn't yet

### How it's built

`references/wireframe-guide.md` provides a CSS class kit layered on top of the frame template's existing classes (`.cards`, `.options`, `.mockup`, `.split`). Adds wireframe-specific utilities:
- Muted version of selected palette (opacity/saturation reduced)
- Consistent soft radius and light borders
- Type scale that establishes hierarchy without fine-tuning
- Placeholder regions as soft dashed areas with centered labels

Each concept is a standalone HTML file written to the screen directory. Server picks up new files, browser reloads.

### Concept card layout

Multiple concepts shown as a card grid. Each card:
- Title — brief name (e.g. "Sidebar Nav + Card Grid", "Full-width Feed")
- Thumbnail wireframe — the layout rendered small
- 1-2 sentence description — what's different about this approach
- Clickable — selection sent via WebSocket

## Design Brief

Written to `docs/designkit/briefs/YYYY-MM-DD-<topic>.md` after convergence.

### Structure

```markdown
# Design Brief: [Topic]
Date: YYYY-MM-DD

## Problem
Who this is for, what they need, what success looks like.

## Concept Direction
Which concept was chosen (or how elements were combined).
Why this approach over the alternatives explored.

## Interaction Model
- Primary pattern: [dashboard/wizard/feed/etc.]
- Navigation: [sidebar/tabs/breadcrumbs/etc.]
- Data density: [sparse/medium/dense]
- Responsive: [desktop-first/mobile-first/both]

## Look & Feel
- Base: [palette name or "codebase tokens"]
- Personality: [1-2 sentence description of the vibe]
- Token set: [inline or reference to palette]

## Key Layout Decisions
Specific structural choices made during exploration.

## Open Questions
Anything deferred — edge cases, states, features noted but not resolved.
```

### How it's used downstream
- **Designkit refinement:** Brief's token set and layout decisions inform the first high-fidelity prototype
- **Implementation:** Coding skills reference the brief for design intent without re-asking the user
- **Future iterations:** Provides context so the agent doesn't start from zero weeks later

## EXPLORE.md Behavioral Rules

### Hard gate
No prototype generation until: a problem statement exists, an interaction model is identified, and some aesthetic signal is captured.

### Question discipline
- One question per message
- Multiple choice preferred
- Never re-ask what the user already stated
- Get aesthetic signal before showing any visuals

### Reference file usage
- Read `references/palettes.md` when showing palette options
- Read `references/wireframe-guide.md` when generating concept sketches
- Read `references/brief-template.md` when writing the design brief

### Visual companion usage
Uses the existing designkit server (same `start-server.sh`). Visual moments:
- Palette selection cards
- Concept wireframe grid
- First prototype

Text-only moments:
- Problem/audience questions
- Interaction model questions
- Tight vs. wide prompt
- Convergence confirmation

### Handoff
After the brief is written and first prototype is generated:
- If the user wants to refine → guide them to designkit (Tune, Comment, Inspect)
- If the user wants to implement → the brief serves as input for a coding plan
- The skill doesn't force either path

## Checklist (task-tracked when skill runs)

1. Read the room — assess what's known, scan codebase
2. Discover — adaptive questions (problem, interaction model, look & feel)
3. Show palette options in browser (if no codebase tokens)
4. Ask tight vs. wide
5. Generate concept wireframes in browser
6. Converge on direction
7. Write design brief
8. Generate first high-fidelity prototype
9. Hand off (to designkit for refinement, or done)

## Open Questions

- Should the Explore skill be able to invoke designkit directly for seamless transition, or should the user explicitly switch?
- Should the "push wider" concepts intentionally break conventions (e.g. unconventional navigation, non-standard layout) or stay within reasonable patterns?
- Should palette archetypes be extensible by the user (add their own named palette)?
