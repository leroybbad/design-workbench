# Anti-Patterns

Common AI-generated design failures. Each entry describes what the pattern looks like, why it's bad, and what to do instead.

The critic agent treats these as hard failures — any match triggers a revision pass.

---

## Layout

### Center-Everything Syndrome
Three or more consecutive sections where all text — headings, body copy, labels — is center-aligned.

**Why it's bad:** Center alignment removes the visual anchor that guides the eye. Readers lose their return point between lines, making body text slow to read. When every section uses it, the page feels ceremonial and inert — like a slide deck, not a designed interface.

**What to do instead:** Left-align body text and supporting copy by default. Reserve center alignment for short, standalone elements: hero headlines, single-line CTAs, pull quotes, or icon+label pairs. If a section has more than two lines of body text, it should be left-aligned.

**When to break it:** Landing pages for consumer products where every section is a short headline + one-line subhead + CTA button. Fully centered works when there is no body copy to anchor.

---

### Uniform Grid Monotony
Every card or grid item is the same size, same padding, same visual weight — a perfectly uniform repeating unit.

**Why it's bad:** Equal weight means no hierarchy. The viewer's eye has nowhere to go first, so they start at top-left and scan linearly. This kills engagement and buries important content. It also signals that the designer did not make choices — they accepted the default.

**What to do instead:** Vary at least one dimension to create a featured item. Options: a featured card that spans two columns, a first item with a larger image or headline, alternating row heights, or a hero item at 1.5x the card height. The variation should be intentional, not random.

**When to break it:** Genuinely uniform data sets where equal status is meaningful — team rosters, product comparison grids, icon libraries, data tables. Do not force hierarchy onto content that has none.

---

### Missing Focal Point
No single element demands attention. Every section is medium weight, medium size, medium contrast — everything competing equally for zero priority.

**Why it's bad:** Design without a focal point is passive. It asks the viewer to bring their own order to the content, which they will not do. Attention is lost, bounce rates rise, conversions fall. This pattern is extremely common in AI-generated UI because it comes from averaging rather than choosing.

**What to do instead:** Identify one element per section and make it dramatically different from everything else. Options: an oversized display number (5–10rem), a full-bleed background image behind a single section, a heading at 3x the surrounding body text size, a single CTA button with high-contrast fill when everything else is outline or text. The focal point should feel almost too big the first time — then it will feel right.

**When to break it:** Dense dashboard views where all widgets are genuinely co-equal (monitoring panels, admin tables). Even there, use section headers and spacing hierarchy rather than full uniformity.

---

## Typography

### Single-Weight Flatness
The entire page uses one font weight — usually 400 (regular) — for all headings, body copy, labels, and UI elements.

**Why it's bad:** Weight contrast is the primary signal for type hierarchy. Without it, the size differences between headings and body text carry all the work, which is not enough. The page reads as a wall of text regardless of scale. This pattern appears when an AI defaults to system fonts without specifying weights.

**What to do instead:** Use exactly two weights: 400 for body text and supporting copy, 600 or 700 for headings, labels, and emphasis. Do not use three or more weights — that creates new hierarchy problems. The jump from 400 to 700 should be visible at a glance, not something the viewer has to notice.

**When to break it:** Intentional single-weight designs where extreme scale contrast (5:1 ratio or more) creates hierarchy through size alone. Example: a display-only screen with a 120px number and a 20px label. The weight similarity becomes part of the aesthetic, but the scale difference must be dramatic.

---

### Timid Scale Differences
Heading set at 1.25rem, body at 1rem — a 25% size difference that is barely perceptible at reading distance.

**Why it's bad:** Hierarchy perceived at less than 2:1 scale ratio registers as a mistake, not a choice. Viewers cannot tell if the heading is intentionally larger or if it is the same text in a slightly different style. This forces them to read every line to find the structure, which exhausts attention.

**What to do instead:** Headings should be 2–4x body text size. A 1rem body with a 2.5rem heading (2.5:1 ratio) reads as intentional. A 1rem body with a 3.5rem display heading reads as designed. Use a type scale — `1rem / 1.25rem / 1.5rem / 2rem / 3rem` — and never place two adjacent sizes less than one step apart.

**When to break it:** Compact UI components (data tables, form labels, nav items) where space is constrained and all elements are the same type of content. In these contexts, color and weight carry hierarchy; scale is subordinate.

---

## Color

### Gray-Plus-One-Accent
White or light gray background, dark gray text, and a single brand accent color applied to buttons and links. No other surface colors, no color variation in backgrounds or containers.

**Why it's bad:** This palette has no depth. Every surface reads as the same plane. Important containers (cards, panels, modals) do not stand out from the page. The accent color does all the work and gets diluted by overuse. The result looks like a template with the brand color swapped in.

**What to do instead:** Define 2–3 surface levels: page background, raised surface (cards, panels), and elevated surface (modals, dropdowns). Add a muted variant of the primary accent for hover states, badges, and tag backgrounds. Add harmonized semantic colors for success, warning, and error — do not default to pure green/yellow/red. Even a subtle shift (gray-50 to gray-100 to gray-200) creates depth.

**When to break it:** Intentional minimal aesthetic where the single-accent flatness is the point. Acceptable only when the typography and spacing system is strong enough to create hierarchy on its own.

---

### Flat Surface Stacking
Multiple page sections share the same background color with no visual transition between them. The page reads as one undifferentiated surface.

**Why it's bad:** Section boundaries become invisible. The viewer cannot tell where one content group ends and another begins without reading all the text. This is especially damaging for marketing pages where each section is a distinct message. Scroll depth drops because there is no visual reward for continuing.

**What to do instead:** Alternate surface colors across sections — white, then gray-50, then white, then a color-tinted section. Use full-bleed color sections for pivotal moments (social proof, CTA sections). When alternating color is not appropriate, use top/bottom borders, increased vertical spacing (50%+ more than surrounding sections), or a thin decorative rule to mark transitions.

**When to break it:** Application dashboards and single-surface tool UIs where visual continuity is more important than section delineation. Also: intentional editorial layouts where the single background is a design decision, not an oversight.

---

## Spacing

### Monotone Vertical Rhythm
Every section has identical vertical padding — typically `padding: 4rem 0` applied globally — regardless of section type, content density, or visual weight.

**Why it's bad:** Spacing is a design signal. Equal padding says all sections are equally important. But a hero section deserves more breathing room than a dense feature grid, and a CTA section works differently than a content section. Uniform padding flattens the page's rhythm and makes it feel machine-generated.

**What to do instead:** Match padding to section purpose. Hero sections: 5–8rem top/bottom. Standard content sections: 3–4rem. Dense content or feature grids: 2–2.5rem. CTA sections: 2–3rem with extra visual contrast to compensate. Establish these as named tokens (`--space-section-hero`, `--space-section-content`) rather than hardcoded values.

**When to break it:** Intentional minimalist layouts where uniform spacing is the grid system. Acceptable when a strict baseline grid is being maintained and spacing variation would break it.

---

### Padding Overload
Excessive internal padding applied uniformly to all containers — cards with 3–4rem of padding, buttons with 2rem vertical padding, form fields padded like modals.

**Why it's bad:** Overpadded components look unfinished. The content floats in white space without an anchor. Cards look empty even when they have content. Buttons become large touch targets that telegraph "I did not check this on desktop." This pattern comes from applying mobile-first touch target sizing to all contexts without adjustment.

**What to do instead:** Match padding to content type. Cards: 1–1.5rem. Buttons: 0.5–0.75rem vertical, 1–1.5rem horizontal. Form inputs: 0.5–0.75rem vertical, 0.75–1rem horizontal. Navigation items: 0.5rem vertical, 0.75–1rem horizontal. The content should look comfortable, not lost.

**When to break it:** Hero CTAs that are meant to read as oversized. Feature tiles where the whitespace is part of the minimal aesthetic. Touch-primary mobile UIs where larger targets are genuinely required.

---

## Structure

### Token-Less Styling
Repeated values (colors, spacing, radii, font sizes) hardcoded directly in selectors throughout the stylesheet — `color: #2563eb`, `border-radius: 8px`, `padding: 1.5rem` appearing in dozens of rules with no central definition.

**Why it's bad:** Hardcoded values make the design system opaque. A critic or reviewer cannot see what the design language is — they have to reverse-engineer it from the specifics. More practically, making a global change (adjust the primary color, tighten the spacing) requires a find-and-replace across dozens of rules. Inconsistencies inevitably accumulate. This is the single most reliable signal that a prototype was generated without design systems thinking.

**What to do instead:** Define all repeated values as CSS custom properties in `:root`. Every color, spacing value, radius, shadow, and font size that appears more than once belongs in the token block. Name tokens semantically: `--color-primary`, `--space-4`, `--radius-card`. Reference them exclusively in rules. The token block at the top of the stylesheet should be a readable summary of the entire design language.

**When to break it:** One-off values that genuinely appear once and have no semantic meaning — a specific `transform: translateX(-2px)` visual tweak, a one-time animation keyframe value. These do not need tokens. The rule is: if you would ever need to change this value consistently across the design, it needs a token.

---

### Foreign Tokens (Established Codebase Mode)
Introducing new CSS custom properties (`--color-brand-new`, `--spacing-custom`) into a codebase that already has an existing token system, without verifying those names exist in the system.

**Why it's bad:** New tokens shadow or conflict with existing ones, produce invisible failures (the var() resolves to nothing), and contaminate the token namespace. In a real codebase, a developer reviewing the generated code has to audit every custom property to determine which are real system tokens and which are generated artifacts. This creates cleanup work and erodes trust in AI-generated output.

**What to do instead:** Before generating any UI for an established codebase, read the existing token definitions (CSS variables, design tokens JSON, Tailwind config, or equivalent). Use only tokens that exist. When you need a value the token system does not provide, do not invent a token — use a hardcoded value and add an explicit comment: `/* gap: no token for 2.5rem — closest is --space-8 at 2rem */`. This surfaces the gap without contaminating the system.

**When to break it:** Greenfield prototypes with no existing token system. In that case, inventing a token system is the correct behavior — but name the tokens according to the conventions in this principles file.
