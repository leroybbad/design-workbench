# Typography

## Rules

### Limit to two font weights per surface
Use Regular (400) and Bold or Semibold (600–700). A third weight forces conscious ranking decisions and creates visual noise.

**Why:** Two weights create an automatic binary — default vs. emphasis. Three weights demand that every text element be explicitly ranked against two alternatives, which designers and AI agents both get wrong under time pressure. The cognitive cost of a third weight exceeds its expressive benefit in almost all UI surfaces.

**How to apply:** Set `font-weight: 400` as the base and reserve `font-weight: 600` or `700` for labels, headings, and emphasis. Never introduce 300, 500, or 800 unless one of those IS your regular weight. If a design has three weights, audit which one is doing the least work and remove it.

**When to break it:** Data-dense dashboards that include a functional monospace weight alongside regular and bold. The monospace serves a distinct semantic role (code, numbers, tabular data) rather than a hierarchical one, so it reads as a different system — not a third tier.

---

### Establish hierarchy through dramatic scale contrast
Headings should be 2–4x the body text size. A 3:1 ratio signals intentional hierarchy; a 1.25:1 ratio looks like a rendering inconsistency.

**Why:** Subtle size differences are ambiguous — the reader can't tell if the variation is intentional or accidental. Dramatic contrast removes doubt. The eye reads a 3rem heading above 1rem body as hierarchy instantly, without any other visual cues.

**How to apply:** Anchor body at `1rem` (16px). Subheadings: `1.25–1.5rem`. Section headings: `2–2.5rem`. Hero or display: `3rem+`. Skip intermediate sizes — the gaps between levels are what create the hierarchy. Do not use `1.1rem` or `1.15rem` for anything; the difference is invisible in most rendering contexts.

**When to break it:** Compact UI elements — navigation labels, table headers, form field labels — where space constraints demand tighter ratios. In dense interfaces, `0.875rem` to `1rem` is a legitimate pairing for supporting vs. primary content.

---

### Tighten letter-spacing on large type
Headings at `2rem` and above benefit from `letter-spacing: -0.01em` to `-0.03em`. Large type set at default tracking looks gappy.

**Why:** Type designers optimize letterforms and default spacing for body-text sizes (~16px). At display sizes, the same optical spacing becomes exaggerated — the gaps between letters grow faster than the letterforms themselves. Negative tracking compensates and gives large type its composed, deliberate quality.

**How to apply:** Body text: default (`letter-spacing: normal`). Subheadings (`1.25–1.5rem`): `-0.01em`. Headings (`2–2.5rem`): `-0.02em`. Display (`3rem+`): `-0.03em`. Apply incrementally — don't jump straight to `-0.05em`. Test at actual rendered size, not in a design tool at 50% zoom.

**When to break it:** Two cases. First, typefaces with tight default metrics (many grotesques like Inter above `2rem` already look dense — verify before adding tracking). Second, uppercase text: ALL CAPS needs MORE letter-spacing, not less. Start at `+0.05em` for uppercase headings and increase from there.

---

### Use line-height to control density
Different text roles require different vertical rhythm. Don't apply a single `line-height` globally.

**Why:** A line-height appropriate for a paragraph (1.5–1.6) makes a heading feel floaty and disconnected from its content. A tight heading line-height applied to body text makes long passages suffocating. Each role has a different primary job: headings landmark, body text sustains reading, captions support.

**How to apply:** Headings: `line-height: 1.1–1.2` (tight — multiple lines should read as a unit). Body text: `1.5–1.6` (comfortable reading rhythm). Captions and supporting labels: `1.3–1.4` (compact but legible). Single-line elements (buttons, badges, nav items): `line-height: 1` or controlled via padding. Set these as named tokens, not ad hoc values.

**When to break it:** Very long body text — articles, documentation, long-form prose — can go to `1.7–1.8` for improved readability. Increase with caution above 1.8; beyond that, the line breaks start to read as paragraph breaks.

---

### Headlines earn their size
A large heading is a promise that important content follows. An oversized heading on generic copy ("Welcome to Our Platform", "Getting Started") wastes the emphasis and trains the reader to ignore scale.

**Why:** Hierarchy only works when it's earned. If large type appears on low-value content, the reader recalibrates and stops using size as a signal. Once that calibration breaks, no amount of typographic contrast will direct attention effectively.

**How to apply:** Before sizing a heading, ask: "Is this the most important text on this surface?" If the answer is no or uncertain, drop it one level. Reserve `2.5rem+` for content that is genuinely the primary reason the user opened this view — a document title, a data metric, a critical status. Page chrome, navigation labels, and empty states should not compete for top-level heading scale.

**When to break it:** Editorial layouts where oversized type IS the aesthetic — landing pages, marketing surfaces, editorial features where the heading IS the content. In these contexts, scale is used expressively rather than hierarchically, and the usual rules don't apply. Be deliberate about the distinction.

---

### Choose typeface pairings intentionally
System-ui for every surface is safe but bland. A deliberate serif/sans pairing adds personality and can clarify content roles.

**Why:** Typeface selection is the single highest-leverage typographic decision. A well-chosen display face for headings paired with a neutral sans for body text signals that the interface was designed, not assembled. Generic system-ui stacks read as defaults, which is sometimes appropriate and sometimes a missed opportunity.

**How to apply:** Greenfield projects: consider a display face (geometric sans, humanist serif, or variable font with expressive optical sizes) for headings and a highly legible neutral sans (`Inter`, `DM Sans`, `Source Sans`) for body. Established codebases: audit the repo's existing typefaces before introducing anything new. If the codebase already imports a font, use it. Adding a second typeface to an existing system almost always creates inconsistency rather than personality.

**When to break it:** Utilitarian interfaces — developer tools, admin panels, internal dashboards — where a single high-legibility sans-serif is the right choice and typographic personality would feel out of place. Also: when the typeface decision has been made by a design system you're extending. Follow the system.
