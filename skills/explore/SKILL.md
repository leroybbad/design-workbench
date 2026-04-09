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
Do NOT generate a final prototype, write production HTML, or invoke the designkit skill until:
1. A problem statement exists (who, what, why)
2. An interaction model is identified (pattern, navigation, density)
3. A concept direction is chosen (from Crazy 8s → deep dive → convergence)

You MAY show visual content in the browser during exploration (concept thumbnails,
deep dive wireframes). These are exploration artifacts, not prototypes.
</HARD-GATE>

## Checklist

You MUST create a task for each item and complete them in order:

1. **Read the room** — assess what's known, scan codebase for existing tokens
2. **Discover** — adaptive questions (problem, interaction model)
3. **Crazy 8s** — generate 6-8 abstract structural thumbnails in a grid
4. **Deep dive** — render selected concepts at full detail
5. **Converge** — user picks a direction
6. **Generate first prototype** at full fidelity with Tailwind/Shadcn as default
7. **Hand off** — tell user to use Theme Selector (Shift+D) to swap design systems, colors, and fine-tune. Also offer refinement via designkit or implementation path

## Phase 1: Read the Room

Before asking any questions, assess what you already know:

**From the user's message:**
- Extract any stated problem, audience, aesthetic preferences, product references
- Note the specificity level: vague idea / scoped feature / extending existing product

**From the codebase (if one exists):**
Scan the project directory for existing design tokens. Search in this priority order:

1. **Token files** — `tokens.css`, `tokens.json`, `variables.css`, `variables.scss`,
   `design-tokens.*`, any file with "token" or "variable" in the name
2. **Theme files** — `theme.css`, `theme.ts`, `theme.js`, `tailwind.config.*`
3. **CSS with `:root` blocks** — any `.css` or `.scss` file containing `:root {` with
   custom properties
4. **Package imports** — `@mui`, `antd`, `@chakra-ui`, `@radix-ui`, shadcn config in
   `package.json`
5. **HTML with inline styles** — if no token files exist, scan `.html` files for
   repeated color/font/spacing values in `style=""` attributes

**When tokens are found:**
- Read the file and extract the CSS custom properties (or Tailwind config values)
- Map them to our token schema: `--color-*`, `--space-*`, `--font-*`, `--radius-*`, `--shadow-*`
- Tell the user what you found: "I found `tokens.css` with 22 custom properties.
  Here are the key values I'll use as your base: [primary: #3b82f6, bg: #ffffff, ...]
  Does this look right, or should I adjust anything?"
- Use these tokens instead of Tailwind/Shadcn defaults for the prototype

**When only inline-styled HTML is found:**
- Scan for the most common color values, font sizes, and spacing values
- Offer: "I don't see a token file, but `app.html` uses #3b82f6, #1e293b, and 16px
  body text consistently. Want me to build a token set from those, or start fresh?"

**When nothing is found:**
- Move on — Tailwind/Shadcn will be the default. The user can swap via Theme Selector.

**If the user points to an external file:**
- Accept a file path if they say "my tokens are at /path/to/tokens.css"
- Read and extract the same way

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

**Ordering rule:**
- Vague idea → Thread A first, then B
- Scoped feature in existing product → Light A, then B
- Use judgment. Skip questions the user already answered.

**Do NOT ask about look & feel or palettes during discovery.** Concepts should
be design-system-agnostic — neutral, clean styling so the user evaluates structure
and layout without being distracted by color or personality. The user swaps design
systems live in the viewer after the prototype is generated (Shift+D).

## Phase 3: Schematic Thumbnails (Diverge)

Once you have enough context (problem + interaction model):

1. Read `references/wireframe-guide.md` — specifically **Level 1: Schematic Thumbnails**
2. **Before generating anything:** assign semantic meaning to 2-3 colors (e.g. purple =
   AI/active, teal = success, blue = contextual). Hold this constant across ALL thumbnails.
3. Generate **6-8 abstract structural thumbnails** in a grid layout
4. Each thumbnail:
   - Numbered (01-08) with a short bold title
   - Uses only **rectangles, lines, and circles** — NO real text, NO real icons
   - The arrangement of primitives IS the concept, not a representation of it
   - One-line description below
   - Represents a **fundamentally different structural pattern**
   - Clickable via `data-choice` attributes
5. All thumbnails must fit in one view without scrolling
6. Tell the user: "8 structural patterns — click any to pressure-test"
7. Wait for selection (1-3 picks)

**If the user asks to "push wider":** Generate another batch exploring more
unconventional patterns. Maintain the same color system.

## Phase 3b: Structural Prototype (Pressure-Test)

After the user selects 1-3 thumbnails:

1. Read `references/wireframe-guide.md` — specifically **Level 2: Structural Prototype**
2. Render selected concepts **stacked vertically** (never in a grid)
3. Each prototype should:
   - Have **real chrome** (top bars, panels, tabs, search) correctly positioned
   - Have **real affordances** (filter chips, toggles, state indicators)
   - Use **abbreviated content** (representative names, short descriptions, plausible counts)
   - Build only the interactions that **test the core pattern assumption**
   - Include at least one **stress-test** that forces the pattern into a harder state
   - Use the same semantic color system from the thumbnails
   - Be clickable via `data-choice` attributes
4. **End with a structural verdict** for each concept — rendered as text below the
   prototype, not inside it: what the pattern gets right, where it strains, what it
   implies for next steps
5. Tell the user: "Scroll through and click your favorite. You can also use Comment (Shift+C) to tag specific elements you like from ANY concept — even ones you don't pick overall. When you Send, I'll combine your pick with your annotations to build the best version."

## Phase 4: Converge

### Converge on direction

- Read the user's choice and any annotations they sent from the viewer
- Confirm your understanding: "So the direction is [concept A's layout] with
  [these elements from concept B] — does that capture it?"
- Then offer another round: "If you'd like to see another round of concepts —
  maybe exploring a different angle or combining ideas differently — just tell me
  what you liked and I can generate 2-3 more. Otherwise we'll move to the prototype."
- If they want more concepts, go back to Phase 3b with their feedback
- If they're happy, move to prototype generation

## Phase 5: Output

### Write the design brief

1. Read `references/brief-template.md` for the template structure
2. Fill in every section based on the exploration conversation
3. Include the full token set inline (don't just reference palettes.md)
4. Record rejected alternatives so future iterations don't re-explore them
5. Save to `docs/designkit/briefs/YYYY-MM-DD-<topic>.md`
6. Create the `docs/designkit/briefs/` directory if it doesn't exist

### Generate the first prototype

1. Take the chosen concept and render it at full fidelity
2. Use **Tailwind/Shadcn tokens as the default** — the user will swap design systems
   live in the viewer using the Theme Selector (Shift+D)
3. If codebase tokens were detected in Phase 1, use those instead of Tailwind
4. Use real content, proper spacing, complete structure
5. Follow the designkit SKILL.md authoring standards (CSS classes, tokens, semantic names, Lucide icons, anti-slop rules)
6. Write to the screen directory and tell the user to check the browser

### Hand off

After the brief is written and prototype is shown:

> "Design brief saved to `docs/designkit/briefs/<filename>.md`. The first prototype
> is in the browser. From here you can:
>
> - **Theme** (Shift+D) — swap design systems, color palettes, and fine-tune typography/spacing/radius
> - **Refine** — use Comment (Shift+C) and Tune (Shift+T) for per-element adjustments
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
- Before Phase 3 (Crazy 8s) — first time visual content is shown
- Check `$STATE_DIR/server-info` to see if a server is already running

## Key Behavioral Rules

- **One question per message.** Never combine multiple questions.
- **Multiple choice preferred.** Easier to answer than open-ended.
- **Never re-ask.** Skip questions the user already answered.
- **Structure before style.** Explore layout patterns with neutral styling. Users swap design systems live in the viewer after the prototype is generated.
- **Semantic color, not decorative.** Assign 2-3 colors structural meaning before generating thumbnails. Hold constant across the session.
- **Two fidelity levels, never averaged.** Level 1 = abstract primitives for divergence. Level 2 = structural prototypes for pressure-testing. Don't mix them.
- **Stress-test every pattern.** Level 2 prototypes must include at least one toggle or scenario that forces the pattern into a harder state.
- **End with verdicts.** Every Level 2 concept gets explicit analysis: what works, where it strains, what's next.
- **Document everything.** The design brief is the anchor against future AI slop.
