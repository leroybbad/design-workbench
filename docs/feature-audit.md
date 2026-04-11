# Design Workbench — Feature Audit

## What It Is

Design Workbench is a Claude Code skill that launches a local browser-based companion for AI-assisted UI design. It operates as a tight loop between Claude (which generates and edits HTML prototypes) and a browser tool (which lets designers annotate, inspect, and tune the output in real time). Designers click to leave comments on specific elements, hover to inspect computed properties, and use sliders to adjust visual values live — then send all of that structured feedback back to Claude in one action. The result is a conversation interface for visual design: Claude generates, the designer reacts with precision tools, Claude refines, repeat. It also supports a "workbench mode" where designers can compose pages from a catalog of pre-built blocks, rearrange sections, edit text inline, and apply design system themes — all without writing code.

---

## How It Works (End-to-End Flow)

1. **Activate the skill.** Claude starts a local Node.js server (`start-server.sh`) which returns a `screen_dir`, `state_dir`, and URL. The server doubles as an HTTP server and a WebSocket server; the browser connects via WebSocket to receive live reloads.

2. **Claude generates a prototype.** It writes an HTML file to `screen_dir`. For content fragments (no `<html>` tag) the server wraps them in the companion frame template automatically. For full documents it extracts `<style>` and `<body>` content. The companion chrome (floating toolbar, panels) always appears on top.

3. **Claude tells the user the URL and tools.** The user opens the browser. They see their prototype rendered inside the Design Companion frame with a floating palette toolbar on the left edge.

4. **The quality pipeline fires (for new screens).** Before showing the prototype, Claude runs a two-agent quality pass: an Art Director sub-agent reads the request, consults reference patterns and principles, and produces a creative brief. Claude generates HTML using that brief as direction. A Critic sub-agent then checks the HTML against 9 hard-failure checks and 4 soft-flag checks. If it fails, Claude applies a targeted revision pass and proceeds.

5. **The designer reviews and annotates.** Using keyboard shortcuts or the floating toolbar, the designer activates tools:
   - **Comment mode (Ctrl+C)** — click any element to pin a numbered annotation bubble and type a note.
   - **Inspect mode (Ctrl+I)** — hover over any element to see a floating tooltip with computed font, color, spacing, radius, border, shadow, and opacity values.
   - **Tune mode (Ctrl+T)** — click any element to open a draggable panel with live sliders and inputs for every styleable property. Changes apply to the element immediately. A "Apply to all matching" toggle extends changes to sibling elements of the same class.
   - **Theme mode (Ctrl+D)** — open a floating panel with three tabs: System (choose a named color system/palette), Colors (customize individual token colors), Fine-tune (adjust individual spacing and typography tokens globally).

6. **The designer stages and sends changes.** Tune adjustments and comment annotations accumulate in a "staged changes" queue. The sidebar (Ctrl+A) shows everything staged. The Send button (or Shift+Cmd+Enter) fires all staged events to the server's events file in JSONL format, then clears the queue.

7. **Claude reads the events file.** It processes each line: annotation events carry a CSS selector, element tag, visible text, and the designer's note. Tune events carry the same selector plus a `changes` dict (inline style changes) and a `tokenChanges` dict (CSS custom property changes applied to `:root`). Claude applies these precisely to the HTML and writes a new file.

8. **The browser auto-reloads.** The server detects the new file by modification time, broadcasts a WebSocket reload signal, and the browser updates immediately.

9. **Workbench mode (optional).** The designer can switch to block-composition mode: open the Blocks panel (Ctrl+B or toolbar), browse blocks detected from the canvas's `data-block` attributes (or from a pre-built catalog), select one, and click a gap between sections or hover a `data-slot` container to place it. Alt key toggles move-up / move-down / remove controls on all sections and blocks. Double-click text to edit inline. Double-click a container to enter Focus Mode (isolates the block, adds "Add item" and "Done" controls). Cmd+S saves a numbered snapshot.

10. **Adoption brief (end of session).** When done, Claude generates an adoption brief: a structured document mapping the canvas to real routes, decomposing sections into components, mapping tokens to the project's styling system, and flagging gaps (forms needing validation, accessibility issues, etc.).

11. **Stopping.** `stop-server.sh` shuts the server down. All mockup HTML files persist in `.designkit/sessions/` for reference.

---

## Feature Inventory

### Explore Phase

**Concept exploration via the `explore` skill**
- **What it does:** A separate entry-point skill that focuses on discovering design intent and exploring options before generating anything.
- **How you use it:** Activate the `designkit:explore` skill instead of `designkit:designkit` when a request is vague or open-ended.
- **Current state:** Exists as a registered skill; the implementation lives in the skill's own instruction file (not audited here, but the skill description confirms it covers intent discovery and concept exploration before prototyping).

**Reference URL modes (Clone / Enhance / Inspire)**
- **What it does:** When the user provides a URL, Claude asks which mode they want: near-1:1 clone, modernized improvement, or mood-board inspiration.
- **How you use it:** Provide a URL as context and Claude prompts for mode selection before generating.
- **Current state:** Documented in SKILL.md as a defined behavior. Depends entirely on Claude's interpretation of the URL content — no automated screenshot or scraping is built in.

**Art Director agent**
- **What it does:** A Sonnet sub-agent that reads the user's request alongside the reference pattern library and all principles files, then produces a structured creative brief covering typographic scale strategy, color palette approach, layout composition, spacing rhythm, and specific anti-patterns to avoid for that brief's context.
- **How you use it:** It fires automatically on new-screen requests. The brief is internal — the user doesn't see it unless the workflow is made transparent.
- **Current state:** Fully implemented as a system-prompted sub-agent (`agents/art-director.md`). The brief format is tightly specified (200–400 words, opinionated, numbers and ratios required, linked to principle files). Greenfield vs. established codebase mode is detected automatically from repo context.

**Reference pattern library**
- **What it does:** A curated set of 5 reference patterns (currently: `hero-asymmetric`, `hero-metric-led`, `cards-bento`, `dashboard-kpi-strip`, `features-alternating`) with annotated HTML files and `meta.json` metadata covering surface type, audience, mood, and techniques.
- **How you use it:** The Art Director selects 2–3 patterns from `references/index.json` and Claude reads the `pattern.html` files for those selected patterns before generating the prototype.
- **Current state:** Working with 5 patterns. The library is intentionally small — the index has exactly 5 entries as of this audit. There is no tooling to browse or add patterns from the browser.

**Design principles library**
- **What it does:** Six principles files (`typography.md`, `color-strategy.md`, `layout-composition.md`, `spacing-rhythm.md`, `visual-hierarchy.md`, `anti-patterns.md`) that provide named, opinionated rules with "when to break it" guidance.
- **How you use it:** The Art Director and Critic agents both read these files to anchor their reasoning to named principles rather than generic advice.
- **Current state:** Fully written and functional. The `anti-patterns.md` file defines the 9 hard-failure checks the Critic enforces.

---

### Compose Phase

**Block catalog panel (Ctrl+B)**
- **What it does:** Opens a side panel showing all blocks detected on the current canvas (via `data-block` attributes), organized into auto-detected categories (Navigation, Sections, Cards, Features, Social Proof, Components). Shows a filter/search input and a count badge for repeated blocks.
- **How you use it:** Press Ctrl+B or click the grid icon in the toolbar. Click a block to select it, which enters placement mode.
- **Current state:** Fully implemented in `catalog.js`. Blocks are sourced from the live DOM — it scans `data-block` attributes on the current page rather than reading from a static catalog directory. This means the panel always reflects the current state of the canvas without needing a separate catalog build step.

**Block placement mode**
- **What it does:** After selecting a block from the catalog panel, the cursor changes and a horizontal blue line tracks gaps between sections. Hovering a `data-slot` container highlights it. Clicking places the block HTML at that position.
- **How you use it:** Select a block in the panel, then click between sections or inside a slot. Escape exits placement mode without placing.
- **Current state:** Fully implemented in `workbench.js`. Placement stays active after each placement so you can place multiple copies. Each placement is immediately undoable. The flash animation (`dk-just-placed`) confirms placement visually.

**Section arrangement controls (Alt key)**
- **What it does:** Toggling Alt key overlays move-up, move-down, and remove buttons on every element with `data-section` or `data-block` attributes.
- **How you use it:** Hold or press Alt. Buttons appear in the top-right corner of each section/block. Click an arrow to reorder; click the trash icon to remove.
- **Current state:** Fully implemented. The toolbar also has an "Arrange" button that toggles the same controls. Both reorder and remove are undoable through the shared undo stack.

**Inline text editing (double-click)**
- **What it does:** Double-clicking a text element (h1–h6, p, span, a, button, label, li, td, th) makes it contenteditable in place with text selected. Enter commits; Escape reverts.
- **How you use it:** Double-click any text in the canvas. Works in both normal and Focus Mode.
- **Current state:** Fully implemented. Edits are tracked in the undo stack. The Edit toggle button in the toolbar makes the editing mode explicit, though double-clicking works regardless.

**Focus Mode (double-click a container)**
- **What it does:** Double-clicking a block or section container that has multiple children isolates it visually and shows a "Editing: [block-name]" toolbar with "Add item" and "Done" controls. Child elements become individually editable. "Add item" duplicates the last child.
- **How you use it:** Double-click a card grid, a nav, or any multi-child container. Click outside or press Escape to exit.
- **Current state:** Fully implemented. The "Add item" action (duplicating the last child) is a reasonable approximation for adding list items, nav links, or cards but does not offer any way to pick what kind of item to add.

**Template picker**
- **What it does:** Fetches templates from the `/templates` endpoint (served from `catalog/templates/`) and presents a named grid for selecting a starting page layout.
- **How you use it:** Triggered by `showTemplatePicker()`. Code comment notes it's currently not auto-shown on load.
- **Current state:** Implemented but commented out of the auto-init flow. The template picker code is complete, but it does not surface to users unless the function is explicitly called. `catalog/templates/` contains only `_blank.html`.

**Pre-built block catalog (file-based)**
- **What it does:** 13 block HTML files in `catalog/blocks/`: blank, data-table, flex-row, footer, grid-2-col, grid-3-col, grid-4-col, hero-section, metric-card, nav-bar, sidebar-layout, split-60-40, and stack.
- **How you use it:** These are served by the server at `/blocks/`. In the current implementation, the Blocks panel reads from the live DOM rather than these files, so these blocks are accessible as server-side files but not surfaced in the UI unless a separate flow is wired up.
- **Current state:** Files exist but the `DKCatalog` implementation switched from file-based loading to live-DOM scanning. The `fetchBlockContent` method returns HTML from the scanned blocks map, not from `/blocks/` fetch calls — the file-based flow is effectively orphaned.

**Slot empty hints**
- **What it does:** Adds a `dk-slot-empty` CSS class to any `data-slot` container that has no child elements, providing a visual drop target hint.
- **How you use it:** Automatic — updates via `MutationObserver` whenever the canvas DOM changes.
- **Current state:** Fully implemented.

**Snapshot save (Cmd+S)**
- **What it does:** Serializes the current canvas HTML (stripping workbench UI chrome), sends it to the server as a `save` event, which writes a numbered snapshot file (`000.html`, `001.html`, etc.) to the session's `snapshots/` directory and updates `pointer.json`.
- **How you use it:** Press Cmd+S or click the save icon in the toolbar. A "Saved" toast confirms.
- **Current state:** Fully implemented. The snapshot system is what Claude reads when making surgical edits — it reads the current pointer and edits the latest snapshot file.

**Repo context detection (`--repo` flag)**
- **What it does:** Inspects `package.json` files (including monorepo packages) to detect frameworks (Next.js, React, Vue, Svelte, Astro), styling systems (Tailwind, styled-components, Emotion, Framer Motion), component libraries (Lucide, Radix, cva, Headless UI, MUI, Chakra, Ant Design), and scans known CSS files for custom property token names.
- **How you use it:** Pass `--repo <project-root>` to `prep.cjs`. Writes `catalog/repo-context.json`.
- **Current state:** Fully implemented. The context informs both the Art Director (creative freedom level) and surgical edits (framework adaptation). The scanner checks a predefined list of token file paths — it won't find tokens in unusual locations.

**Save to catalog**
- **What it does:** Extracts a section/element from the canvas, adds YAML frontmatter in an HTML comment, writes it to `catalog/blocks/<name>.html`, and re-runs `prep.cjs` to rebuild the manifest so the block appears in the panel on next refresh.
- **How you use it:** Tell Claude "save this as a block" or "add this to the catalog."
- **Current state:** Documented workflow in SKILL.md. Relies entirely on Claude performing the extraction and prep step correctly — there is no UI button for this action.

**Adoption brief generation**
- **What it does:** Produces a structured Markdown document covering target route, component decomposition, token mapping, framework adaptation notes, content slots, and warnings (forms, interactions, accessibility gaps). Saved to `$SESSION_DIR/adoption.md`.
- **How you use it:** Tell Claude you're done composing and want to integrate into the real codebase.
- **Current state:** Documented workflow in SKILL.md. Fully Claude-driven — no UI affordance.

---

### Refine Phase

**Comment mode (Ctrl+C)**
- **What it does:** Click any element in the prototype to drop a numbered pin bubble. A popover appears for typing a free-form note. Pins persist in `localStorage` across page reloads (keyed by port). Multiple annotations accumulate.
- **How you use it:** Ctrl+C activates comment mode. Click elements. Type notes. The pin number shows on the element and in the sidebar.
- **Current state:** Fully implemented. Comments survive page refresh. The events file format includes a precise CSS selector path so Claude can find the exact element.

**Inspect mode (Ctrl+I)**
- **What it does:** Hover over any element to see a floating tooltip showing: element tag + class, font size, font weight, font family, color (with swatch), background color (with swatch), padding, margin, border, border radius, opacity, and whether a box shadow is present.
- **How you use it:** Ctrl+I activates inspect mode. Hover any element. The tooltip follows the cursor.
- **Current state:** Fully implemented. Values are computed styles (not authored CSS), so they're always accurate regardless of how the CSS is structured. The shadow display is binary ("present") rather than showing the actual shadow value — a gap worth noting.

**Tune mode (Ctrl+T)**
- **What it does:** Click any element to open a draggable panel with adjustable controls for all styleable properties. Changes apply live to the element. "Apply to all matching" extends changes to all siblings of the same class (or same tag if no class match).
- **How you use it:** Ctrl+T activates tune mode. Click an element. Adjust controls. Click "Apply Changes" to stage the changes. Click "Reset" to revert.
- **Current state:** Fully implemented. Changes are tracked with element selectors and token names. The panel is draggable (header drag support is implemented). The "Apply to all matching" uses class-based sibling matching, not global selector matching — so changing one `.metric-card` doesn't affect `.metric-card` elements in other sections, only siblings in the same parent.

**Theme mode (Ctrl+D)**
- **What it does:** Opens a floating three-tab panel:
  - **System tab:** Named color system presets (from `THEME_DATA` — data embedded by the server). Clicking a preset previews it immediately by setting CSS custom properties on `#claude-content`. "Save System" stages the token changes.
  - **Colors tab:** Custom color overrides for individual tokens (unlocked after a system is saved).
  - **Fine-tune tab:** Individual spacing and typography token adjustments (unlocked after a system is saved).
- **How you use it:** Ctrl+D opens the panel. The System tab loads immediately; Colors and Fine-tune require saving a system first.
- **Current state:** System tab and save/reset flow are fully implemented. Colors and Fine-tune tabs are conditionally rendered based on whether a system has been saved, with placeholder text when locked. The `THEME_DATA` global is injected by the server — the actual palette definitions aren't visible in the audited scripts, suggesting they're defined in `frame-template.html` or server-side.

**Staged changes sidebar (Ctrl+A)**
- **What it does:** A slide-in sidebar showing all pending annotations and tune changes grouped and summarized. Each item shows the element description and what changed.
- **How you use it:** Ctrl+A toggles the sidebar. Items can be reviewed before sending.
- **Current state:** Fully implemented. The sidebar renders from the in-memory annotations and tuneChanges arrays.

**Send to Claude (Shift+Cmd+Enter or Send button)**
- **What it does:** Serializes all staged annotations and tune changes to JSONL, POSTs them to the server's events endpoint, clears the local queue, and shows a toast: "N updates sent to Claude."
- **How you use it:** When ready, press Shift+Cmd+Enter or click the Send button (which lights up when there are staged changes). Return to the terminal to process.
- **Current state:** Fully implemented. The send button has a `ready` CSS class state that the stylesheet can use to make it visually prominent when there are changes to send.

**Undo/redo (Cmd+Z / Cmd+Shift+Z)**
- **What it does:** A unified in-memory undo stack (`DKUndo`) covers: block insertion (section-gap and slot), block removal, element reorder, inline text edits, item duplication (Focus Mode "Add item"), and tune token/style changes.
- **How you use it:** Standard undo/redo keyboard shortcuts. Toast confirms each undo/redo action.
- **Current state:** Fully implemented as a clean push/undo/redo stack in `undo.js`. Forward history is truncated on new action (standard behavior). The stack is in-memory only — it clears on page reload.

---

### Quality Pipeline

**Art Director creative briefs**
- **What it does:** Produces an opinionated, numbered creative brief with specific values — not vague direction but exact scale ratios, weight pairs, named patterns, and contextual anti-patterns.
- **How you use it:** Fires automatically on new prototype requests via a Sonnet sub-agent.
- **Current state:** Fully specified. The brief format enforces specificity (200–400 word limit, ratios and numbers required, links to named principles). Greenfield vs. established codebase mode changes how much creative latitude the Art Director takes.

**Design Critic with 9 hard checks**
- **What it does:** Reviews generated HTML against hard-failure checks: `monotone-spacing`, `center-everything`, `single-weight-typography`, `uniform-containers`, `missing-focal-point`, `token-less-styling`, `generic-color`, `anti-pattern-violations`, and `foreign-tokens` (established codebase only). Returns structured JSON with `pass`, `hard_failures`, `soft_flags`, and a `revision_prompt`.
- **How you use it:** Fires automatically after each new prototype generation via a Sonnet sub-agent.
- **Current state:** Fully specified. One revision pass maximum — the critic doesn't run again after the fix. Soft flags (brief-drift, missed-opportunity, accessibility-gap, responsive-concern) are advisory and don't block.

**Principles library**
- **What it does:** Six files providing named, opinionated design rules with specific guidance and "when to break it" sections: typography, color-strategy, layout-composition, spacing-rhythm, visual-hierarchy, anti-patterns.
- **How you use it:** Read by both Art Director and Critic. Every creative brief section must link to a specific named rule from these files.
- **Current state:** Fully written. The anti-patterns file is the most directly enforced — its entries map 1:1 to Critic hard checks.

**Anti-slop authoring rules**
- **What it does:** A set of concrete "never do" rules baked into the prototype authoring standards: no emoji icons (use Lucide), no massive page headers, no orphaned whitespace, body text at 16px minimum, consistent text hierarchy, density must earn its density.
- **How you use it:** Claude follows these automatically as part of prototype generation.
- **Current state:** Defined in SKILL.md. Enforced through prompting, not automated checks — the Critic's `anti-pattern-violations` check is the closest enforcement mechanism.

---

### Persistence & Workflow

**Session management**
- **What it does:** Each server start creates a timestamped session directory under `.designkit/sessions/`. Sessions contain the screen HTML files, events JSONL, snapshots, and adoption.md.
- **How you use it:** Automatic. `stop-server.sh` takes the session directory as an argument.
- **Current state:** Fully implemented. Sessions persist after the server stops.

**Event file (JSONL)**
- **What it does:** The `$STATE_DIR/events` file receives all annotation and tune change events when the designer sends. Claude reads this file to process feedback.
- **How you use it:** Claude reads it after each Send action. The file is cleared when a new screen is pushed.
- **Current state:** Fully implemented. Two event types are defined: `annotation` (with selector, tag, text, note, status, timestamp) and `tune` (with selector, tag, text, changes dict, tokenChanges dict, timestamp). The "fresh each round" design is intentional — no accumulation of state across iterations.

**Numbered snapshot system**
- **What it does:** Cmd+S writes `snapshots/NNN.html` (zero-padded) and updates `pointer.json` (`{ "current": N, "total": N }`). Claude reads `pointer.json` to find the latest state before making surgical edits, then writes the next snapshot number and updates the pointer.
- **How you use it:** Cmd+S saves. Claude reads the pointer before editing.
- **Current state:** The client-side save and snapshot indicator update are implemented. The surgical edit protocol (reading pointer, incrementing, writing) is documented in SKILL.md and relies on Claude following the protocol correctly.

**localStorage annotation persistence**
- **What it does:** Comment annotations are persisted to `localStorage` under a key scoped to the server port. They survive page refresh and remain visible until sent or cleared.
- **How you use it:** Automatic. Pins appear on page load from saved state.
- **Current state:** Fully implemented. Tune changes are in-memory only and do not persist across refreshes.

**WebSocket live reload**
- **What it does:** The server broadcasts a reload signal to all connected browsers when it detects a new HTML file in `screen_dir` (detected by modification time). The browser reloads the prototype without a full page refresh.
- **How you use it:** Automatic. Write a file to `screen_dir` and the browser updates.
- **Current state:** Working. The server is zero-dependency Node.js. The WebSocket connection auto-reconnects on server restart.

---

## Role Perspectives

### As a Designer

**What this gives you that Figma/Sketch doesn't:**
- A real browser — you're reviewing actual rendered HTML with real fonts, real spacing, real hover states. Not vectors that approximate the browser.
- Annotation that generates structured, machine-readable feedback rather than sticky notes a developer has to interpret. Your "too large, try 1.5rem" note goes straight to Claude as a targeted CSS instruction.
- Live tuning with immediate visual feedback and a staged-changes model — you're not editing code, you're adjusting values and seeing results in milliseconds.
- A quality pipeline that catches common AI design failures (monotone spacing, uniform grids, single-weight typography) before you ever see the prototype.
- Block composition with undo — you can rearrange, remove, and add sections without code.

**What's missing:**
- No visual diff between versions. When Claude writes `dashboard-v3.html`, there's no side-by-side or highlight of what changed.
- The Inspect tooltip shows computed values but not authored values (you can't see which CSS rule set `font-size: 1.5rem` or whether it comes from a token).
- Shadow inspection is binary ("present" vs. absent) — you can't read the actual shadow values.
- No image handling — you can't drag in a photo or replace a placeholder image through the UI.
- The "Apply to all matching" in Tune mode is sibling-only, not global. Changing a `.metric-card` only affects cards in the same parent container, not all `.metric-card` instances across the page.
- No responsive preview — you can't resize to mobile/tablet viewport without browser DevTools.
- Tune changes don't persist through page refresh. If you tune something, don't send, and refresh, those changes are gone.

**What would make you switch workflows:**
Faster iteration than Figma for text-heavy, component-light pages (landing pages, dashboards, settings screens). The structured feedback loop is genuinely better than copy-pasting code snippets into chat. Figma still wins for anything involving images, iconography, or pixel-precise component work.

---

### As a Non-Designer (Developer, PM, Founder)

**What this lets you do that you couldn't before:**
- Generate a real, browser-rendered UI from a plain-language description without writing HTML.
- Give precise feedback ("this card is too padded") without knowing CSS — the Tune panel handles the numbers.
- Produce a working HTML prototype as a communication artifact for developer handoff.
- Get a structured adoption brief that names which CSS tokens to define, which sections to componentize, and which framework patterns to use.
- The quality pipeline means the output doesn't look like generic AI slop — anti-patterns are caught automatically.

**Where you'd still need a designer:**
- Color palette decisions and brand alignment. The Theme panel offers presets but you'd need a designer to define the presets.
- Anything beyond the reference pattern library's 5 patterns — the Art Director's range is limited by what patterns exist.
- Responsive behavior — the tool generates desktop-first prototypes; mobile adaptation isn't addressed.
- Production-ready asset work — images, illustrations, icons beyond Lucide.

**What makes this accessible vs. intimidating:**
The keyboard shortcuts and tool names (Comment, Inspect, Tune) map to familiar design review metaphors. The biggest friction point is understanding what `data-block` and `data-section` attributes do — the Blocks panel shows "No blocks detected" without explanation when a prototype lacks these attributes, which is confusing for non-technical users.

---

### As a Product Manager

**How this fits into product development workflow:**
Works best at the earliest stage of a feature — before a Figma ticket is written. A PM can articulate a feature need, see a prototype in minutes, leave structured feedback, and have a revised version within the same session. The adoption brief output is explicitly structured for developer handoff: it maps design sections to code routes, components, and token definitions.

**What artifacts it produces:**
- Numbered HTML snapshot files (the design record)
- A JSONL events file (feedback transcript)
- An `adoption.md` adoption brief (the developer handoff document)
- All files persist in `.designkit/sessions/` after the session ends

**How it connects to engineering handoff:**
The adoption brief is the key artifact. It does the translation work between design intent and implementation task. The HTML snapshot is reference-quality but not production-ready — it's a browser mockup, not React components. The brief bridges that gap by naming components, mapping tokens to the project's styling system, and flagging what needs developer attention.

**What's missing for PM workflows:**
- No shareable URL — the server is local only. To share a prototype, you'd need to share the HTML file or screenshot it.
- No versioning UI — the snapshot system exists but there's no way to browse "draft 1, draft 2, draft 3" in the browser or compare them.
- No annotation export — there's no way to get a PDF or document of the annotations as a formal review record.

---

### As a Design Ops Leader

**How this scales across a team:**
It doesn't yet, in any meaningful sense. The server is local per-session. There's no shared state, no team workspace, no design token synchronization across projects. Each engineer or designer running the tool has their own isolated instance.

**What governance it provides:**
The principles library and quality pipeline are the closest thing to governance — they enforce named rules consistently across every prototype Claude generates. This is meaningful for a team of one or for a team where Claude does most of the generation. The Art Director's "established codebase mode" specifically constrains creative output to use existing tokens rather than inventing new ones, which is a meaningful guardrail.

**How it relates to design systems:**
The token architecture (`--color-primary`, `--space-md`, `--radius-md`) is intentionally design-system-adjacent. The `prep.cjs` script can ingest a project's existing token file and block library, connecting the workbench to an existing design system. The adoption brief maps prototype tokens to the project's system. The `foreign-tokens` Critic check prevents token contamination in established codebases. These are the right building blocks for design system alignment, but they require manual setup per project.

**What's missing for enterprise adoption:**
- No shared block catalog — there's no way to publish approved blocks to the team.
- No design token synchronization — changes to prototype tokens don't flow back to a Figma token library, Style Dictionary config, or Tailwind config.
- No access control or audit trail beyond the JSONL events file.
- No integration with existing design tools (Figma, Storybook, Zeroheight).
- The server requires Node.js and runs locally — no cloud deployment path.
- The reference pattern library has 5 patterns. A real pattern library for a product team would need dozens, with team-specific governance over which patterns are approved.

---

## Gaps & Opportunities

**1. The file-based block catalog is orphaned.**
`catalog/blocks/` contains 13 block HTML files, but `DKCatalog` switched to scanning the live DOM for `data-block` attributes. The `/blocks/` server endpoint exists, `fetchBlockContent` has a file path parameter, but the current implementation resolves all blocks from the in-memory DOM scan map. The file-based blocks are invisible to users unless they're already on the canvas. Either re-wire `DKCatalog.load()` to fetch from `/blocks/manifest.json` and render those files in the panel alongside live-canvas blocks, or delete the file-based approach and document that all blocks come from the live page.

**2. The template picker is implemented but not surfaced.**
The `showTemplatePicker()` function is complete and functional (fetches from `/templates`, renders a grid, loads selected template HTML into the canvas). But the comment in `workbench.js` says "Template picker removed from auto-show — will be re-added when we have more starting points to offer." With a blank template already in `catalog/templates/`, even showing the picker with just Blank as an option would give users a clear starting point instead of an empty canvas.

**3. "Apply to all matching" is sibling-scoped, not class-scoped.**
In Tune mode, the "Apply to all matching" checkbox finds elements by class match within the same parent container — it's searching for siblings, not all instances of that class across the page. This contradicts the documented mental model ("Find siblings by class"). A `.metric-card` in section 1 and one in section 3 share a class but won't both update when you tune one. This should either be fixed to be truly global class-matching, or the UI label should be changed to "Apply to siblings."

**4. Inspect mode doesn't show box-shadow values.**
`getDesignProperties()` in `helper.js` checks `cs.boxShadow !== 'none'` and pushes `{ label: 'Shadow', value: 'present' }`. This is a placeholder — the actual shadow value is computed and available, just not displayed. Given that shadow values are one of the most common things designers want to reference or copy, displaying the actual value would be a high-value, low-effort fix.

**5. Tune changes don't survive page refresh.**
Comment annotations are persisted to `localStorage` and reload correctly. Tune changes are in `tuneChanges[]` — an in-memory array. If the user tunes without sending and refreshes, all tune work is lost with no warning. Either persist `tuneChanges` to `localStorage` alongside annotations (symmetric with the existing annotation persistence), or show a "unsaved changes" warning before navigating away.

**6. No visual diff between prototype versions.**
The snapshot system creates numbered files and Claude generates versioned HTML files (`dashboard-v2.html`, etc.), but there's no way to see what changed between versions in the browser. An overlay or highlight mode showing DOM changes between the current and previous snapshot would dramatically improve the review loop — especially useful when Claude's changes are subtle.

**7. The reference pattern library is thin.**
5 patterns is too few for a robust Art Director. The categories represented are: hero (2 variants), cards, dashboard KPI strip, and alternating features. Missing entirely: forms, tables, empty states, onboarding flows, navigation patterns, modals, settings screens, and data visualization. Each additional pattern increases the Art Director's ability to make informed, specific decisions rather than generic ones.

**8. Responsive preview is absent.**
The companion chrome is desktop-only. There's no way to preview the prototype at mobile or tablet width without using browser DevTools. This is significant because Claude's authoring standards don't include responsive CSS, and the Critic's `responsive-concern` soft flag exists precisely because responsive issues are common — but there's no way to actually see them within the tool.

**9. The theme Colors and Fine-tune tabs have a prerequisite gate.**
Both tabs show "Save a design system first to unlock color overrides / fine-tuning" until the System tab's "Save System" is clicked. This creates an awkward workflow: if you want to customize colors directly without choosing a named system, you can't. These tabs could be unlocked unconditionally and simply default to showing the current page's token values when no system is selected.

**10. No UI for the catalog prep workflow.**
Adding a custom block to the catalog requires: extracting HTML, adding YAML frontmatter, writing a file, and running `node prep.cjs`. This is completely outside the browser UI and requires terminal access. A "Save selection as block" button in the Blocks panel that triggers a Claude workflow to handle extraction and registration would close this gap.

**11. Block categories are auto-detected from naming conventions — fragile.**
`DKCatalog.load()` determines category from the block's `data-block` value: if it contains "nav", it's Navigation; "hero" or "cta" → Sections; "card" or "bento" → Cards, etc. A block named `data-block="header"` would fall into "Components" despite clearly being a section. This is fine for Claude-generated blocks (which follow naming conventions) but would break down for blocks from an existing component library with different naming conventions. Frontmatter-based category metadata (already supported in the prep script's `parseFrontmatter`) would be more reliable.

**12. The adoption brief has no UI trigger.**
The adoption brief is a high-value output, but triggering it requires telling Claude to generate it in the terminal. There's no "Export for development" button in the companion UI. Adding a button that sends a structured request to Claude to generate the adoption brief would make this workflow discoverable for non-designers who don't know to ask for it.
