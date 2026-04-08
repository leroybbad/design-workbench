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
2. Copy the pre-built palette selector to the screen directory:
   ```bash
   cp skills/designkit/scripts/palette-selector.html "$SCREEN_DIR/palette-selector.html"
   ```
   This is a static template with all 10 palettes as differentiated live-rendered cards.
   Each card has `data-choice` attributes so clicks are captured via WebSocket.
3. Tell the user the URL and wait for their selection
4. Read `$STATE_DIR/events` for their click — the choice value maps to a palette name
5. Read `references/palettes.md` to get the full token set for the chosen palette

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
