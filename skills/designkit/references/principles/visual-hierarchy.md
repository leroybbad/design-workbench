# Visual Hierarchy

## Rules

### Hierarchy needs exactly 3 levels to be legible
More than 3 levels and viewers lose track of the ranking; fewer than 3 collapses nuance into noise.

**Why:** Working memory handles roughly 3 tiers of relative importance before comparisons break down. When every element competes, nothing stands out. When there are only 2 levels (big vs. small), secondary relationships between body elements disappear.

**How to apply:** Primary = headings, large size, bold weight, full color. Secondary = body text, regular size, regular weight, full color. Tertiary = metadata, small size, regular weight, muted color (50–60% opacity or a low-contrast neutral).

**When to break it:** Complex data interfaces — IDEs, financial dashboards, dense admin UIs — can support 4–5 levels because users are trained to read them. Each extra level beyond 3 must be differentiated on at least 2 visual dimensions simultaneously (e.g., size + color + indentation), not just one.

---

### Use at least 2 visual dimensions to separate levels
Size alone does not establish hierarchy — it needs a partner.

**Why:** A single dimension (e.g., size) creates ranking but not semantic distance. Two dimensions (size + weight, size + color, weight + position) signal that the difference between levels is meaningful, not just quantitative. Single-dimension hierarchies collapse under real content where variation is inevitable.

**How to apply:** Primary = large size + bold weight + full color. Secondary = body size + regular weight + full color. Tertiary = small size + regular weight + muted color. Never change only one dimension between adjacent levels.

**When to break it:** Single-weight designs (e.g., a display typeface with no bold variant) can rely on extreme scale contrast of 5:1 or greater between primary and secondary. The scale gap compensates for the missing weight dimension.

---

### Position creates implicit hierarchy
Where something sits on the page communicates its rank before any text is read.

**Why:** In LTR interfaces, readers scan in an F-pattern or Z-pattern — top-left anchor, then horizontal, then down-left. Elements in high-attention zones (top-left, above the fold, centered above content) are perceived as primary regardless of their styling. Position is the fastest signal the eye processes.

**How to apply:** Place the most important element in the top-left or centered above the fold. Put primary calls-to-action in high-attention zones (end of F-pattern arm, or Z-pattern terminal). Deprioritize by moving elements down and to the right.

**When to break it:** RTL interfaces (Arabic, Hebrew) reverse the horizontal axis — top-right is the high-attention anchor. Deliberately subversive or editorial layouts can use position tension as a design statement, but only when the departure is intentional and the hierarchy is re-established through other dimensions.

---

### Contrast is relative, not absolute
An element is only as prominent as its surroundings allow.

**Why:** The eye detects difference, not absolute value. A bold heading surrounded by other bold headings is not prominent — it reads as body text. The same heading on a light, spacious page reads as dominant. Styling decisions made in isolation fail in context.

**How to apply:** Before styling a focal element, assess its immediate neighbors. If the surrounding context is dense, dark, or heavy — make the focal element lighter, more spacious, or thinner. If the context is airy and light — add weight and color to the focal element. Always evaluate hierarchy by looking at the full composition, not a component in isolation.

**When to break it:** Design systems that must remain consistent across wildly varied contexts (e.g., a component library used in both light dashboards and dark sidebars) sometimes sacrifice relative contrast for predictability. In these cases, document the trade-off explicitly.

---

### Whitespace amplifies hierarchy
An element surrounded by generous space reads as more important than a larger element in a crowded layout.

**Why:** Isolation signals significance. The eye is drawn to what has room to breathe. Whitespace creates a visual container around an element without adding any visual weight, making it one of the most powerful and underused hierarchy tools. Cramming everything together flattens hierarchy even when scale and weight differences exist.

**How to apply:** Give the most important element the most surrounding whitespace. Before increasing the size or weight of an element to make it stand out, try adding space around it first. Use tight spacing within secondary and tertiary groups to reinforce their lower rank by association.

**When to break it:** Dense data interfaces (spreadsheets, trading terminals, log viewers) cannot afford generous whitespace. In these contexts, color and weight must carry the full hierarchy load, and the baseline expectation of "important = spacious" is explicitly reset by the interface genre.
