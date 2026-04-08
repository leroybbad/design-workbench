# Brief Template Reference

This file is a reference for the Design Explore skill. After the user converges on a direction, output a completed brief to:

```
docs/designkit/briefs/YYYY-MM-DD-<topic>.md
```

Create the directory if it doesn't exist (`mkdir -p docs/designkit/briefs`).

---

## Template

```markdown
# Design Brief: [Topic]

**Date:** YYYY-MM-DD
**Status:** Active

---

## Problem

<!-- Who is this for? What do they need? What does success look like? -->

**User:** [Role and context]
**Job to be done:** [Core task or goal]
**Success looks like:** [Observable outcome]

## Concept Direction

<!-- Which concept was chosen, or how elements from multiple were combined. Include WHY. -->

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

```css
:root {
  /* paste tokens here */
}
```

## Key Layout Decisions

<!-- Specific structural choices. Anchors future work. -->

- [Decision 1]
- [Decision 2]
- [Decision 3]

## Open Questions

<!-- Deferred items to address before/during implementation. -->

- [Question 1]
- [Question 2]
```

---

## Usage Notes

- **Fill every section.** If something is genuinely N/A, write "N/A" and say why — don't leave blanks.
- **Be concrete.** Not "clean and modern" — instead "Generous whitespace, one accent color, muted palette — premium SaaS feel like Stripe's dashboard."
- **Include the token set inline.** The brief should be self-contained. Don't just reference `palettes.md` — paste the actual values so the brief works without external lookups.
- **Record rejected alternatives.** This prevents re-exploring dead ends in future sessions. If you considered three concepts and picked one, name what the others were and why they lost.
