# Cloudscape Design System Intake Analysis

**Source:** https://cloudscape.design/components/ (103 components)
**Target:** Design Workbench block catalog + reference patterns

## The Question

What would it take to make Cloudscape's full component library available as blocks in the workbench — so a user could compose AWS-style console pages by dragging and dropping?

## Component Classification

### Tier 1: Page-Level Blocks (drop as sections)
These are the high-value blocks that compose full pages. Each becomes a `data-section` with `data-block`.

| Component | Block Name | Effort | Notes |
|-----------|-----------|--------|-------|
| App layout | `app-layout` | Medium | The core shell — nav, content, tools panel. This is the template, not a block. |
| App layout toolbar | `app-layout-toolbar` | Medium | Variant of above |
| Top navigation | `top-nav` | Low | Horizontal nav bar — straightforward HTML |
| Side navigation | `side-nav` | Low | Vertical nav with nested items |
| Breadcrumb group | `breadcrumbs` | Low | Simple horizontal list |
| Header | `page-header` | Low | Title + action buttons row |
| Content layout | `content-layout` | Medium | Hero/expressive page structure |
| Table | `data-table` | Medium | Full table with headers, rows, pagination — most complex single component |
| Cards (collection) | `card-collection` | Medium | Grid of cards with selection, filtering |
| Board | `board-layout` | High | Drag-and-drop configurable grid — complex interactions |
| Wizard | `wizard` | Medium | Multi-step form — needs step state |
| Form | `form-section` | Low | Wrapper with submit/cancel actions |
| Split panel | `split-panel` | Medium | Collapsible secondary panel |
| Tabs | `tab-group` | Low | Tab switching container |
| Modal | `modal` | Low | Dialog overlay |
| Drawer | `drawer-panel` | Medium | Slide-out supplementary panel |

**Count: 16 blocks, ~40-60 hours total**

### Tier 2: Content Blocks (drop into slots)
These fill the page-level structures. Each becomes a `data-block` inside a `data-slot`.

| Component | Block Name | Effort | Notes |
|-----------|-----------|--------|-------|
| Alert | `alert` | Low | Status banner with variants (info, warning, error, success) |
| Badge | `badge` | Low | Small label |
| Button | `button` | Low | Primary, secondary, icon variants |
| Button dropdown | `button-dropdown` | Low | Button with menu |
| Button group | `button-group` | Low | Row of related buttons |
| Container | `container` | Low | Bordered content wrapper with header |
| Expandable section | `expandable` | Low | Collapsible content |
| Flashbar | `flashbar` | Low | Stack of status notifications |
| Key-value pairs | `key-value` | Low | Label + value list |
| Status indicator | `status` | Low | Icon + text status |
| Steps | `steps-list` | Low | Ordered task list |
| Popover | `popover` | Low | Contextual tooltip |
| Progress bar | `progress` | Low | Loading/progress indicator |
| Loading bar | `loading-bar` | Low | Indeterminate progress |
| Spinner | `spinner` | Low | Loading animation |
| Copy to clipboard | `copy-btn` | Low | Copy action button |
| Link | `link` | Low | Styled anchor |
| Icon | `icon` | Low | SVG icon display |
| Avatar | `avatar` | Low | User/AI visual |
| Token / Token group | `token-group` | Low | Compact data items |
| Item card | `item-card` | Low | Single structured card |
| List | `list` | Low | Vertical item list |
| Tree view | `tree-view` | Medium | Nested hierarchical list |
| Text content | `text-block` | Low | Styled HTML block |
| Box | `box` | Low | Basic styled container |
| Column layout | `column-layout` | Low | Multi-column grid |
| Grid | `grid` | Low | Responsive layout grid |
| Space between | `spacer` | Low | Vertical spacing helper |
| Panel layout | `panel-layout` | Low | Side-by-side panels |
| Help panel | `help-panel` | Low | Documentation sidebar |
| Pagination | `pagination` | Low | Page navigation |

**Count: 31 blocks, ~30-40 hours total**

### Tier 3: Form Controls (drop into form sections)
These are input elements that go inside forms. Each becomes a `data-block` with form-specific styling.

| Component | Block Name | Effort | Notes |
|-----------|-----------|--------|-------|
| Input | `text-input` | Low | Single-line text |
| Text area | `textarea` | Low | Multi-line text |
| Select | `select` | Low | Dropdown |
| Multiselect | `multiselect` | Low | Multi-option dropdown |
| Autosuggest | `autosuggest` | Medium | Type-ahead input |
| Checkbox | `checkbox` | Low | On/off toggle |
| Radio group | `radio-group` | Low | Single selection |
| Toggle | `toggle` | Low | Switch control |
| Date picker | `date-picker` | Medium | Calendar date selection |
| Date input | `date-input` | Low | Text-based date entry |
| Date range picker | `date-range` | Medium | Start/end date selection |
| Time input | `time-input` | Low | Time entry |
| Calendar | `calendar` | Medium | Full calendar widget |
| Slider | `slider` | Low | Range value selection |
| File upload | `file-upload` | Low | File picker |
| File dropzone | `file-dropzone` | Low | Drag-and-drop file area |
| Code editor | `code-editor` | High | Monaco-style editor |
| Form field | `form-field` | Low | Label + control + description wrapper |
| Attribute editor | `attribute-editor` | Medium | Key-value CRUD |
| Tag editor | `tag-editor` | Medium | Resource tag management |
| Segmented control | `segmented` | Low | Toggle between formats |
| Tiles | `tiles` | Low | Visual option selection |
| Property filter | `property-filter` | High | Complex query builder |
| Text filter | `text-filter` | Low | Simple search input |
| Collection preferences | `preferences` | Medium | Display settings dialog |
| Collection select filter | `select-filter` | Low | Dropdown filter |
| Prompt input | `prompt-input` | Low | AI prompt field |
| Toggle button | `toggle-button` | Low | State toggle action |
| S3 resource selector | `s3-selector` | Skip | AWS-specific, not portable |

**Count: 28 blocks (27 portable), ~35-45 hours total**

### Tier 4: Charts (specialized visualization blocks)
Each chart type becomes a block with sample data.

| Component | Block Name | Effort | Notes |
|-----------|-----------|--------|-------|
| Area chart | `area-chart` | Medium | Stacked area time series |
| Bar chart | `bar-chart` | Medium | Vertical/horizontal bars |
| Line chart | `line-chart` | Medium | Time series lines |
| Mixed line and bar | `mixed-chart` | Medium | Combined chart types |
| Pie and donut | `pie-chart` | Medium | Part-to-whole |

**Count: 5 blocks, ~15-20 hours total**

### Tier 5: Skip (not useful as blocks)
These are infrastructure, accessibility, or tutorial components that don't make sense as droppable blocks.

- Annotation context, Hotspot, Tutorial panel, Tutorial components (tutorial system)
- Error boundary, Live region (invisible infrastructure)
- Generative AI components, Support prompt group, Chat bubble (specialized AI UI)
- Cartesian charts, Charts, Charts Legacy (meta/wrapper components)
- File token group, File input, File uploading components (sub-components of file upload)
- Board components, Board item (sub-components of board)

**Count: 16 components skipped**

---

## Page Layout Templates

Beyond individual components, Cloudscape implies specific page types. Each would be a template combining multiple blocks.

| Template | Components Used | Effort |
|----------|----------------|--------|
| **Console Home** | App layout + Top nav + Side nav + Cards collection + Header | Medium |
| **Table View** | App layout + Top nav + Side nav + Header + Table + Pagination + Text filter | Medium |
| **Detail Page** | App layout + Top nav + Breadcrumbs + Header + Container + Key-value pairs + Tabs | Medium |
| **Create/Edit Form** | App layout + Top nav + Breadcrumbs + Form + Form fields + Buttons | Medium |
| **Wizard Flow** | App layout + Top nav + Wizard + Form fields | Medium |
| **Dashboard** | App layout + Top nav + Side nav + Header + Board + Cards + Charts | High |
| **Settings Page** | App layout + Top nav + Breadcrumbs + Tabs + Form sections + Toggles | Medium |
| **Empty State** | App layout + Container + Icon + Text + Button | Low |
| **Error Page** | Minimal layout + Alert + Button | Low |

**Count: 9 templates, ~20-30 hours total**

---

## Intake Strategy

### What "intake" actually means

For each component, we need to produce a block file: an HTML fragment with:
1. YAML frontmatter (name, category, description, slots)
2. Scoped CSS using tokens (not Cloudscape's React/SCSS)
3. Semantic HTML with `data-block` and `data-slot` attributes
4. Sample content that demonstrates the component's purpose
5. Multiple variants where appropriate (e.g., button: primary, secondary, icon-only)

This is NOT a port of Cloudscape's React code. It's authoring standalone HTML blocks that look and feel like Cloudscape but work in our vanilla HTML workbench.

### Effort Estimate

| Tier | Blocks | Hours | Token cost (generation) |
|------|--------|-------|------------------------|
| Tier 1: Page-level | 16 | 40-60 | ~800K (50K per complex block) |
| Tier 2: Content | 31 | 30-40 | ~300K (10K per simple block) |
| Tier 3: Form controls | 27 | 35-45 | ~350K (13K per form block) |
| Tier 4: Charts | 5 | 15-20 | ~150K (30K per chart block) |
| Templates | 9 | 20-30 | ~270K (30K per template) |
| **Total** | **88 blocks + 9 templates** | **140-195 hours** | **~1.9M tokens** |

### Automation Opportunity

Most of this is automatable. Claude can generate each block given:
1. The Cloudscape docs page for that component (URL)
2. Our block authoring standards (from SKILL.md)
3. The token system to use
4. 2-3 examples of well-authored blocks from our catalog

A batch generation pipeline could produce all 88 blocks in ~2-3 hours of human oversight:
1. Feed each component URL + authoring standards to Claude
2. Claude generates the block HTML
3. Run through the Critic for quality check
4. Human reviews the visual output in the workbench
5. Approve or send back for revision

**Realistic timeline: 1-2 days of focused work to generate the full library, then 2-3 days of QA/polish.**

### What Changes in Our System

| Area | Change Needed | Effort |
|------|---------------|--------|
| Block catalog | Need file-based catalog back alongside live DOM palette | Medium — add a toggle or merge both sources |
| Category system | More categories needed (Forms, Charts, Layout, Feedback, etc.) | Low — already category-aware |
| Prep script | Already supports scanning block directories | None |
| Block panel | Needs to handle 80+ blocks — search/filter becomes essential | Already built |
| Token system | Need a Cloudscape token set (colors, spacing, typography) | Medium — one tokens.css file |
| Templates | Need page-level templates that compose multiple blocks | Low — template system exists |

### Alternative: Start Small

Instead of all 103 components, start with the **most-composed page type** and its dependencies:

**"Console Table View" starter kit (15 blocks):**
- App layout, Top nav, Side nav, Breadcrumbs, Header
- Table, Pagination, Text filter, Button, Button group
- Container, Alert, Badge, Status indicator, Key-value pairs

This covers the single most common AWS console page pattern. Expand from there based on user demand.

---

## Recommendation

1. **Don't port all 103** — start with a 15-block starter kit for the most common page type
2. **Build a batch generation pipeline** — automate block creation via Claude + Critic
3. **Re-enable file-based catalog** alongside the live DOM palette — toggle between "Design System Blocks" and "Page Blocks"
4. **Ship the Cloudscape token set** as a tokens.css preset
5. **Expand pattern-by-pattern** based on what users actually compose
