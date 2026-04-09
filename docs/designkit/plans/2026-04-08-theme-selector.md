# Theme Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-side Theme Selector panel (Shift+D) to the Designkit Viewer that lets users swap design systems, color palettes, and fine-tune global typography/spacing/radius — all live via CSS custom property swapping, no agent regeneration.

**Architecture:** A new `theme-data.js` file provides palette token data (injected by server.cjs alongside helper.js). The Theme Selector panel logic lives in `helper.js`, following the same patterns as the existing Tune panel — bottom drawer, tabs, swatches. Token changes are applied via `style.setProperty()` on `#claude-content` and sent to Claude via the existing events/WebSocket pipeline.

**Tech Stack:** Vanilla JS, CSS custom properties, HTML. Zero dependencies (matches existing codebase).

**Spec:** `docs/designkit/specs/2026-04-08-theme-selector.md`

---

## Files

- Create: `skills/designkit/scripts/theme-data.js`
- Modify: `skills/designkit/scripts/server.cjs:105-108`
- Modify: `skills/designkit/scripts/frame-template.html` (CSS additions)
- Modify: `skills/designkit/scripts/helper.js` (Theme Selector panel logic)

---

### Task 1: Create theme-data.js with palette token data

The data backbone. Contains all 10 palette token sets plus 4 color variants (default, dark, warm, cool) for each, structured as a JS object that helper.js will consume.

**Files:**
- Create: `skills/designkit/scripts/theme-data.js`

- [ ] **Step 1: Create `theme-data.js`**

Read the palette token values from `skills/explore/references/palettes.md`. Convert each palette's `:root` CSS block into a JS object. The file should define a global `window.THEME_DATA` object.

Structure:

```js
window.THEME_DATA = {
  palettes: [
    {
      key: 'material',
      name: 'Material Design',
      tier: 1,
      tokens: {
        '--color-primary': '#6750A4',
        '--color-primary-hover': '#7E67C1',
        '--color-on-primary': '#ffffff',
        '--color-bg': '#FEF7FF',
        '--color-surface': '#ffffff',
        '--color-surface-variant': '#E7E0EC',
        '--color-border': '#CAC4D0',
        '--color-text': '#1D1B20',
        '--color-text-secondary': '#49454F',
        '--color-text-tertiary': '#79747E',
        '--color-success': '#386A20',
        '--color-warning': '#7D5700',
        '--color-danger': '#BA1A1A',
        '--space-xs': '0.25rem',
        '--space-sm': '0.5rem',
        '--space-md': '1rem',
        '--space-lg': '1.5rem',
        '--space-xl': '2rem',
        '--font-family': "'Roboto', system-ui, sans-serif",
        '--font-xs': '0.6875rem',
        '--font-sm': '0.75rem',
        '--font-base': '0.875rem',
        '--font-lg': '1.125rem',
        '--font-xl': '1.375rem',
        '--font-2xl': '1.75rem',
        '--font-weight-normal': '400',
        '--font-weight-medium': '500',
        '--font-weight-bold': '700',
        '--radius-sm': '8px',
        '--radius-md': '12px',
        '--radius-lg': '16px',
        '--radius-full': '9999px',
        '--shadow-sm': '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
        '--shadow-md': '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
        '--shadow-lg': '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)'
      },
      variants: {
        default: {},  // empty = use tokens as-is
        dark: {
          '--color-bg': '#1a1a1e',
          '--color-surface': '#2d2d30',
          '--color-surface-variant': '#3d3d40',
          '--color-border': '#4a4a4e',
          '--color-text': '#f0f0f2',
          '--color-text-secondary': '#b0b0b4',
          '--color-text-tertiary': '#808084'
        },
        warm: {
          '--color-bg': '#faf7f2',
          '--color-surface': '#fffcf7',
          '--color-surface-variant': '#f0ebe2',
          '--color-border': '#d8d0c4',
          '--color-text': '#2a2420',
          '--color-text-secondary': '#5a5248',
          '--color-text-tertiary': '#8a8278'
        },
        cool: {
          '--color-bg': '#f2f5fa',
          '--color-surface': '#f7f9ff',
          '--color-surface-variant': '#e2e8f0',
          '--color-border': '#c4cdd8',
          '--color-text': '#1a2030',
          '--color-text-secondary': '#485264',
          '--color-text-tertiary': '#788294'
        }
      }
    },
    // ... repeat for all 10 palettes (apple, tailwind, ant, corporate-dense,
    //     clean-spacious, neon-ai, editorial, playful, minimal-mono)
  ],

  fontFamilies: {
    system: "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    inter: "'Inter', system-ui, sans-serif",
    serif: "'Georgia', 'Charter', serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
  }
};
```

For each palette:
1. Copy the exact token values from `palettes.md`
2. Create `dark`, `warm`, `cool` variants that only override `--color-*` tokens
3. Dark variants: dark bg/surface, light text, same accent
4. Warm variants: stone/amber-tinted neutrals, same accent
5. Cool variants: slate/blue-tinted neutrals, same accent

The Neon AI palette is special — its default IS dark, so its `dark` variant can be the same as default, and it needs a `light` variant instead of `dark`.

- [ ] **Step 2: Verify all 10 palettes are present**

```bash
grep -c "key:" skills/designkit/scripts/theme-data.js
```
Expected: 10

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/scripts/theme-data.js
git commit -m "feat(theme): add theme-data.js with 10 palette token sets and color variants"
```

---

### Task 2: Inject theme-data.js via server.cjs

Add the theme data script injection alongside the existing helper.js injection.

**Files:**
- Modify: `skills/designkit/scripts/server.cjs:105-108`

- [ ] **Step 1: Add getThemeDataInjection function**

In `server.cjs`, after the existing `getHelperInjection()` function (line 105-108), add:

```js
function getThemeDataInjection() {
  const themeData = fs.readFileSync(path.join(__dirname, 'theme-data.js'), 'utf-8');
  return '<script>\n' + themeData + '\n</script>';
}
```

- [ ] **Step 2: Update the injection point**

Find the line that injects helper.js (line 168):
```js
html = html.replace('</body>', getHelperInjection() + '\n</body>');
```

Change it to inject theme-data.js BEFORE helper.js (so `window.THEME_DATA` is available when helper.js runs):

```js
html = html.replace('</body>', getThemeDataInjection() + '\n' + getHelperInjection() + '\n</body>');
```

Also update the else branch (line 170):
```js
html += getThemeDataInjection() + '\n' + getHelperInjection();
```

- [ ] **Step 3: Verify server starts**

```bash
# Kill any running server, then restart
skills/designkit/scripts/start-server.sh --project-dir .
```

Expected: server starts, returns JSON with URL. Open the URL — page should load normally (theme-data.js is loaded but not used yet).

- [ ] **Step 4: Commit**

```bash
git add skills/designkit/scripts/server.cjs
git commit -m "feat(theme): inject theme-data.js alongside helper.js in server"
```

---

### Task 3: Add Theme Selector CSS to frame-template.html

Add all CSS for the Theme Selector panel — panel container, system rows, color swatches, fine-tune controls.

**Files:**
- Modify: `skills/designkit/scripts/frame-template.html`

- [ ] **Step 1: Add Theme Selector CSS**

Add the following CSS after the existing Tune panel CSS (after the `.shadow-label` rule, around line 752). Insert before the `/* ===== ANNOTATION SIDEBAR =====` comment:

```css
    /* ===== THEME SELECTOR PANEL ===== */
    .theme-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #1a1a1e;
      border-top: 1px solid #3a3a3e;
      z-index: 2000;
      padding: 0.75rem 1.5rem;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
      max-height: 50vh;
      overflow-y: auto;
    }
    .theme-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .theme-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: #e5e5e7;
    }
    .theme-close {
      background: none;
      border: none;
      color: #8e8e93;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.2rem;
      line-height: 1;
    }
    .theme-tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #3a3a3e;
      margin-bottom: 0.75rem;
    }
    .theme-tab {
      padding: 0.35rem 0.75rem;
      font-size: 0.7rem;
      color: #8e8e93;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-family: inherit;
      transition: color 0.15s, border-color 0.15s;
      position: relative;
    }
    .theme-tab:hover { color: #d1d1d6; }
    .theme-tab.active {
      color: #e5e5e7;
      border-bottom-color: var(--accent);
    }
    .theme-tab .unsaved-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      position: absolute;
      top: 2px;
      right: 2px;
      display: none;
    }
    .theme-tab .unsaved-dot.visible { display: block; }

    /* System rows */
    .theme-system-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .theme-tier-label {
      font-size: 0.6rem;
      color: #636366;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.5rem 0.5rem 0.25rem;
    }
    .theme-system-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.1s;
    }
    .theme-system-row:hover { background: #2a2a2e; }
    .theme-system-row.active {
      background: #2a2a2e;
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }
    .theme-dots {
      display: flex;
      gap: 4px;
    }
    .theme-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .theme-system-name {
      font-size: 0.75rem;
      font-weight: 600;
      color: #e5e5e7;
    }
    .theme-tier-divider {
      border: none;
      border-top: 1px solid #2a2a2e;
      margin: 0.25rem 0;
    }

    /* Color variants */
    .theme-variants {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .theme-variant {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      border: 2px solid transparent;
      transition: border-color 0.15s;
    }
    .theme-variant:hover { border-color: #3a3a3e; }
    .theme-variant.active { border-color: var(--accent); }
    .theme-variant-label {
      font-size: 0.65rem;
      color: #8e8e93;
    }

    /* Accent picker */
    .theme-accent-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #3a3a3e;
    }
    .theme-accent-label {
      font-size: 0.7rem;
      color: #8e8e93;
    }
    .theme-accent-input {
      width: 32px;
      height: 32px;
      border: 1px solid #3a3a3e;
      border-radius: 6px;
      padding: 0;
      cursor: pointer;
      background: none;
    }
    .theme-accent-hex {
      font-size: 0.7rem;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      color: #e5e5e7;
    }

    /* Fine-tune controls */
    .theme-finetune-section {
      margin-bottom: 1rem;
    }
    .theme-finetune-label {
      font-size: 0.7rem;
      color: #8e8e93;
      margin-bottom: 0.5rem;
    }
    .theme-font-chips {
      display: flex;
      gap: 0.5rem;
    }
    .theme-font-chip {
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      border: 1px solid #3a3a3e;
      background: none;
      color: #aeaeb2;
      font-size: 0.7rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.15s;
    }
    .theme-font-chip:hover { background: #2a2a2e; color: #d1d1d6; }
    .theme-font-chip.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .theme-slider-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .theme-slider-label {
      font-size: 0.65rem;
      color: #636366;
      min-width: 55px;
    }
    .theme-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #3a3a3e;
      border-radius: 2px;
      outline: none;
    }
    .theme-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent);
      cursor: pointer;
    }
    .theme-slider-value {
      font-size: 0.7rem;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      color: #e5e5e7;
      min-width: 35px;
      text-align: right;
    }

    /* Save bar */
    .theme-save-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #3a3a3e;
    }
    .theme-save-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      font-family: inherit;
      font-weight: 500;
    }
    .theme-save-btn:hover { opacity: 0.9; }
```

- [ ] **Step 2: Verify CSS loads**

Open the browser. The styles won't be visible yet (no panel is created), but verify the page doesn't break — check for any CSS parse errors in devtools console.

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/scripts/frame-template.html
git commit -m "feat(theme): add Theme Selector panel CSS to frame template"
```

---

### Task 4: Add Theme Selector toolbar button and keyboard shortcut

Add the Shift+D shortcut and toolbar button to helper.js, with the panel open/close toggle.

**Files:**
- Modify: `skills/designkit/scripts/helper.js`

- [ ] **Step 1: Add theme mode state variables**

At the top of helper.js, after the existing state variables (around line 20, after `let redoStack = [];`), add:

```js
  let themeMode = false;
  let themePanel = null;
  const THEME_KEY = 'theme-state-' + window.location.port;
  let themeState = loadThemeState();

  function loadThemeState() {
    try {
      return JSON.parse(localStorage.getItem(THEME_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveThemeState() {
    localStorage.setItem(THEME_KEY, JSON.stringify(themeState));
  }
```

- [ ] **Step 2: Add the toolbar button**

Find the `designTools` array (around line 1350). Add a new entry after the tune toggle:

```js
    {
      id: 'theme-toggle',
      title: 'Theme (Shift+D)',
      icon: '<circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.25" fill="none"/><path d="M8 2.5a5.5 5.5 0 0 0 0 11V2.5z" fill="currentColor"/>',
      action: () => {
        if (commentMode) setCommentMode(false);
        if (inspectMode) setInspectMode(false);
        if (tuneMode) setTuneMode(false);
        setThemeMode(!themeMode);
      }
    }
```

- [ ] **Step 3: Add setThemeMode function**

After the existing `setTuneMode` function, add:

```js
  function setThemeMode(active) {
    themeMode = active;
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.classList.toggle('active', themeMode);

    if (themeMode) {
      // Close tune panel if open
      const existingTune = document.querySelector('.tune-panel');
      if (existingTune) existingTune.remove();

      openThemePanel();
    } else {
      closeThemePanel();
    }
  }

  function openThemePanel() {
    if (themePanel) return;
    themePanel = createThemePanel();
    document.body.appendChild(themePanel);
  }

  function closeThemePanel() {
    if (themePanel) {
      themePanel.remove();
      themePanel = null;
    }
  }
```

- [ ] **Step 4: Add keyboard shortcut**

Find the keydown event listener (search for `event.key === 'I'` or the keyboard shortcut handling). Add Shift+D alongside the existing shortcuts:

```js
    if (e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (commentMode) setCommentMode(false);
      if (inspectMode) setInspectMode(false);
      if (tuneMode) setTuneMode(false);
      setThemeMode(!themeMode);
    }
```

- [ ] **Step 5: Add placeholder createThemePanel function**

Add a minimal placeholder so the button works:

```js
  function createThemePanel() {
    const panel = document.createElement('div');
    panel.className = 'theme-panel';

    const header = document.createElement('div');
    header.className = 'theme-header';
    header.innerHTML = '<span class="theme-title">Theme Selector</span>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'theme-close';
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => setThemeMode(false));
    header.appendChild(closeBtn);
    panel.appendChild(header);

    panel.appendChild(document.createTextNode('Panel content coming in next tasks...'));

    return panel;
  }
```

- [ ] **Step 6: Verify in browser**

Restart the server. Open the page.
- Shift+D should toggle a dark bottom drawer with "Theme Selector" title and close button
- The toolbar should show the new button (half-filled circle icon)
- Clicking the button toggles the panel
- Opening Theme Selector should close Tune panel if it was open

- [ ] **Step 7: Commit**

```bash
git add skills/designkit/scripts/helper.js
git commit -m "feat(theme): add Theme Selector toolbar button and Shift+D shortcut"
```

---

### Task 5: Build Layer 1 — Design System tab

Replace the placeholder panel content with the full System tab showing all 10 palettes as clickable rows with live preview.

**Files:**
- Modify: `skills/designkit/scripts/helper.js`

- [ ] **Step 1: Replace createThemePanel with full implementation**

Replace the placeholder `createThemePanel` function with the full version:

```js
  function createThemePanel() {
    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    const cc = document.getElementById('claude-content');

    // Header
    const header = document.createElement('div');
    header.className = 'theme-header';
    header.innerHTML = '<span class="theme-title">Theme Selector</span>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'theme-close';
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => setThemeMode(false));
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tabs
    const tabBar = document.createElement('div');
    tabBar.className = 'theme-tabs';
    const tabNames = ['System', 'Colors', 'Fine-tune'];
    const tabPanels = {};

    tabNames.forEach((name, i) => {
      const tab = document.createElement('button');
      tab.className = 'theme-tab' + (i === 0 ? ' active' : '');
      tab.textContent = name;
      const dot = document.createElement('span');
      dot.className = 'unsaved-dot';
      tab.appendChild(dot);
      tab.addEventListener('click', () => {
        tabBar.querySelectorAll('.theme-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Object.values(tabPanels).forEach(p => p.style.display = 'none');
        tabPanels[name].style.display = '';
      });
      tabBar.appendChild(tab);
    });
    panel.appendChild(tabBar);

    // System tab
    tabPanels['System'] = buildSystemTab(panel, cc);
    panel.appendChild(tabPanels['System']);

    // Colors tab (placeholder for Task 6)
    tabPanels['Colors'] = document.createElement('div');
    tabPanels['Colors'].textContent = 'Select a design system first.';
    tabPanels['Colors'].style.cssText = 'color:#8e8e93; font-size:0.75rem; padding:1rem 0;';
    tabPanels['Colors'].style.display = 'none';
    panel.appendChild(tabPanels['Colors']);

    // Fine-tune tab (placeholder for Task 7)
    tabPanels['Fine-tune'] = document.createElement('div');
    tabPanels['Fine-tune'].textContent = 'Select a design system first.';
    tabPanels['Fine-tune'].style.cssText = 'color:#8e8e93; font-size:0.75rem; padding:1rem 0;';
    tabPanels['Fine-tune'].style.display = 'none';
    panel.appendChild(tabPanels['Fine-tune']);

    // Store references for later tabs to rebuild
    panel._tabPanels = tabPanels;
    panel._cc = cc;

    return panel;
  }

  function buildSystemTab(panel, cc) {
    const data = window.THEME_DATA;
    if (!data || !data.palettes) {
      const msg = document.createElement('div');
      msg.textContent = 'Theme data not available.';
      msg.style.cssText = 'color:#8e8e93; font-size:0.75rem;';
      return msg;
    }

    const container = document.createElement('div');

    const list = document.createElement('div');
    list.className = 'theme-system-list';

    let currentTier = 0;
    const dotColors = ['--color-primary', '--color-bg', '--color-surface', '--color-border', '--color-text'];

    data.palettes.forEach(palette => {
      // Tier divider
      if (palette.tier !== currentTier) {
        if (currentTier > 0) {
          const divider = document.createElement('hr');
          divider.className = 'theme-tier-divider';
          list.appendChild(divider);
        }
        const tierLabel = document.createElement('div');
        tierLabel.className = 'theme-tier-label';
        tierLabel.textContent = palette.tier === 1 ? 'Adoptable Systems' : 'Personality Archetypes';
        list.appendChild(tierLabel);
        currentTier = palette.tier;
      }

      const row = document.createElement('div');
      row.className = 'theme-system-row';
      if (themeState.system === palette.key) row.classList.add('active');

      // Color dots
      const dots = document.createElement('div');
      dots.className = 'theme-dots';
      dotColors.forEach(tokenName => {
        const dot = document.createElement('div');
        dot.className = 'theme-dot';
        dot.style.backgroundColor = palette.tokens[tokenName] || '#888';
        dots.appendChild(dot);
      });
      row.appendChild(dots);

      // Name
      const name = document.createElement('span');
      name.className = 'theme-system-name';
      name.textContent = palette.name;
      row.appendChild(name);

      // Click to preview
      row.addEventListener('click', () => {
        // Apply all tokens
        Object.entries(palette.tokens).forEach(([key, value]) => {
          cc.style.setProperty(key, value);
        });
        // Update active state
        list.querySelectorAll('.theme-system-row').forEach(r => r.classList.remove('active'));
        row.classList.add('active');
        // Track unsaved preview
        panel._previewSystem = palette.key;
        // Show unsaved dot on System tab
        const dot = panel.querySelector('.theme-tab .unsaved-dot');
        if (dot && themeState.system !== palette.key) dot.classList.add('visible');
      });

      list.appendChild(row);
    });

    container.appendChild(list);

    // Save bar
    const saveBar = document.createElement('div');
    saveBar.className = 'theme-save-bar';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'theme-save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      if (!panel._previewSystem) return;
      // Push current state to undo stack before changing
      const oldTokens = {};
      Object.keys(data.palettes[0].tokens).forEach(key => {
        oldTokens[key] = cc.style.getPropertyValue(key) || '';
      });
      undoStack.push({ element: cc, prop: '__themeSystem', oldValue: JSON.stringify({ system: themeState.system, tokens: oldTokens }), isToken: true });
      redoStack = [];

      themeState.system = panel._previewSystem;
      themeState.colorVariant = 'default';
      themeState.accentColor = null;
      saveThemeState();

      // Clear unsaved dot
      panel.querySelectorAll('.unsaved-dot').forEach(d => d.classList.remove('visible'));

      // Add to tuneChanges for the staged sidebar
      tuneChanges.push({
        selector: '#claude-content',
        tag: 'theme',
        text: 'Design system: ' + themeState.system,
        changes: {},
        tokenChanges: Object.fromEntries(
          Object.entries(data.palettes.find(p => p.key === themeState.system).tokens)
        ),
        timestamp: Date.now()
      });
      renderSidebar();

      // Rebuild Colors and Fine-tune tabs
      if (panel._tabPanels) {
        rebuildColorsTab(panel);
        rebuildFineTuneTab(panel);
      }
    });
    saveBar.appendChild(saveBtn);
    container.appendChild(saveBar);

    return container;
  }
```

- [ ] **Step 2: Add placeholder rebuild functions**

```js
  function rebuildColorsTab(panel) {
    // Will be implemented in Task 6
  }

  function rebuildFineTuneTab(panel) {
    // Will be implemented in Task 7
  }
```

- [ ] **Step 3: Re-apply saved theme on page load**

After the theme state loading code (near `loadThemeState`), add a function that re-applies the saved theme when the page loads:

```js
  function applyStoredTheme() {
    const data = window.THEME_DATA;
    if (!data || !themeState.system) return;
    const cc = document.getElementById('claude-content');
    if (!cc) return;

    const palette = data.palettes.find(p => p.key === themeState.system);
    if (!palette) return;

    // Apply base system tokens
    Object.entries(palette.tokens).forEach(([key, value]) => {
      cc.style.setProperty(key, value);
    });

    // Apply color variant
    if (themeState.colorVariant && themeState.colorVariant !== 'default' && palette.variants[themeState.colorVariant]) {
      Object.entries(palette.variants[themeState.colorVariant]).forEach(([key, value]) => {
        cc.style.setProperty(key, value);
      });
    }

    // Apply accent color
    if (themeState.accentColor) {
      cc.style.setProperty('--color-primary', themeState.accentColor);
      cc.style.setProperty('--color-primary-hover', lightenColor(themeState.accentColor, 15));
      cc.style.setProperty('--color-on-primary', relativeLuminance(themeState.accentColor) > 0.5 ? '#000000' : '#ffffff');
    }

    // Apply fine-tune
    if (themeState.fineTune) {
      if (themeState.fineTune.fontFamily && data.fontFamilies[themeState.fineTune.fontFamily]) {
        cc.style.setProperty('--font-family', data.fontFamilies[themeState.fineTune.fontFamily]);
      }
      if (themeState.fineTune.spacingMultiplier && themeState.fineTune.spacingMultiplier !== 1) {
        ['xs','sm','md','lg','xl'].forEach(size => {
          const base = parseFloat(palette.tokens['--space-' + size]);
          cc.style.setProperty('--space-' + size, (base * themeState.fineTune.spacingMultiplier).toFixed(3) + 'rem');
        });
      }
      if (themeState.fineTune.radiusMultiplier && themeState.fineTune.radiusMultiplier !== 1) {
        ['sm','md','lg'].forEach(size => {
          const base = parseFloat(palette.tokens['--radius-' + size]);
          cc.style.setProperty('--radius-' + size, Math.round(base * themeState.fineTune.radiusMultiplier) + 'px');
        });
      }
    }
  }

  // Call on page load
  applyStoredTheme();
```

- [ ] **Step 4: Add color utility functions**

```js
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return [parseInt(hex.slice(0,2), 16), parseInt(hex.slice(2,4), 16), parseInt(hex.slice(4,6), 16)];
  }

  function rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
  }

  function relativeLuminance(hex) {
    const [r, g, b] = hexToRgb(hex).map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function lightenColor(hex, percent) {
    const [r, g, b] = hexToRgb(hex);
    const amt = Math.round(2.55 * percent);
    return rgbToHex(r + amt, g + amt, b + amt);
  }
```

- [ ] **Step 5: Verify in browser**

Restart server. Open page.
- Shift+D → panel opens with System tab showing 10 palettes in rows with color dots
- Click "Material Design" → page instantly transforms (fonts, spacing, colors, radius change)
- Click "Neon AI" → page transforms to dark theme with cyan accent
- Click "Save" → changes persist. Reload page → theme stays applied.
- Check staged changes sidebar (Shift+A) → should show "Design system: material" entry

- [ ] **Step 6: Commit**

```bash
git add skills/designkit/scripts/helper.js
git commit -m "feat(theme): build Layer 1 — Design System selector with live preview and save"
```

---

### Task 6: Build Layer 2 — Colors tab

Implement the color variants (default/dark/warm/cool) and accent color picker.

**Files:**
- Modify: `skills/designkit/scripts/helper.js`

- [ ] **Step 1: Implement rebuildColorsTab**

Replace the placeholder `rebuildColorsTab` function:

```js
  function rebuildColorsTab(panel) {
    const data = window.THEME_DATA;
    const cc = panel._cc;
    const tabPanels = panel._tabPanels;
    if (!tabPanels || !themeState.system) return;

    const palette = data.palettes.find(p => p.key === themeState.system);
    if (!palette) return;

    const container = document.createElement('div');

    // Variant swatches
    const variants = document.createElement('div');
    variants.className = 'theme-variants';
    const variantDotColors = ['--color-primary', '--color-bg', '--color-surface', '--color-border', '--color-text'];

    ['default', 'dark', 'warm', 'cool'].forEach(variantKey => {
      const variantTokens = { ...palette.tokens, ...(palette.variants[variantKey] || {}) };

      const swatch = document.createElement('div');
      swatch.className = 'theme-variant';
      if ((themeState.colorVariant || 'default') === variantKey) swatch.classList.add('active');

      const dots = document.createElement('div');
      dots.className = 'theme-dots';
      variantDotColors.forEach(tokenName => {
        const dot = document.createElement('div');
        dot.className = 'theme-dot';
        dot.style.backgroundColor = variantTokens[tokenName] || '#888';
        dots.appendChild(dot);
      });
      swatch.appendChild(dots);

      const label = document.createElement('span');
      label.className = 'theme-variant-label';
      label.textContent = variantKey.charAt(0).toUpperCase() + variantKey.slice(1);
      swatch.appendChild(label);

      swatch.addEventListener('click', () => {
        // Reset to base system tokens first
        Object.entries(palette.tokens).forEach(([key, value]) => {
          if (key.startsWith('--color-')) cc.style.setProperty(key, value);
        });
        // Apply variant overrides
        if (variantKey !== 'default' && palette.variants[variantKey]) {
          Object.entries(palette.variants[variantKey]).forEach(([key, value]) => {
            cc.style.setProperty(key, value);
          });
        }
        // Update active state
        variants.querySelectorAll('.theme-variant').forEach(v => v.classList.remove('active'));
        swatch.classList.add('active');
        panel._previewVariant = variantKey;
      });

      variants.appendChild(swatch);
    });
    container.appendChild(variants);

    // Accent color picker
    const accentRow = document.createElement('div');
    accentRow.className = 'theme-accent-row';

    const accentLabel = document.createElement('span');
    accentLabel.className = 'theme-accent-label';
    accentLabel.textContent = 'Custom accent';
    accentRow.appendChild(accentLabel);

    const accentInput = document.createElement('input');
    accentInput.type = 'color';
    accentInput.className = 'theme-accent-input';
    accentInput.value = themeState.accentColor || palette.tokens['--color-primary'] || '#6750A4';
    accentRow.appendChild(accentInput);

    const accentHex = document.createElement('span');
    accentHex.className = 'theme-accent-hex';
    accentHex.textContent = accentInput.value;
    accentRow.appendChild(accentHex);

    accentInput.addEventListener('input', () => {
      const color = accentInput.value;
      accentHex.textContent = color;
      cc.style.setProperty('--color-primary', color);
      cc.style.setProperty('--color-primary-hover', lightenColor(color, 15));
      cc.style.setProperty('--color-on-primary', relativeLuminance(color) > 0.5 ? '#000000' : '#ffffff');
      panel._previewAccent = color;
    });

    container.appendChild(accentRow);

    // Save bar
    const saveBar = document.createElement('div');
    saveBar.className = 'theme-save-bar';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'theme-save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      themeState.colorVariant = panel._previewVariant || themeState.colorVariant || 'default';
      themeState.accentColor = panel._previewAccent || themeState.accentColor;
      saveThemeState();

      tuneChanges.push({
        selector: '#claude-content',
        tag: 'theme',
        text: 'Colors: ' + themeState.colorVariant + (themeState.accentColor ? ' + accent ' + themeState.accentColor : ''),
        changes: {},
        tokenChanges: { '--color-variant': themeState.colorVariant },
        timestamp: Date.now()
      });
      renderSidebar();
    });
    saveBar.appendChild(saveBtn);
    container.appendChild(saveBar);

    // Replace old tab content
    const oldPanel = tabPanels['Colors'];
    oldPanel.innerHTML = '';
    oldPanel.appendChild(container);
  }
```

- [ ] **Step 2: Verify in browser**

Restart server.
1. Shift+D → select a system → Save
2. Click Colors tab → should show 4 variant swatches + accent picker
3. Click "Dark" → page colors change (bg goes dark, text goes light), fonts/spacing stay
4. Use accent picker → primary color changes live
5. Save → check staged changes sidebar

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/scripts/helper.js
git commit -m "feat(theme): build Layer 2 — Color variants and accent picker"
```

---

### Task 7: Build Layer 3 — Fine-tune tab

Implement font family chips, spacing density slider, and border radius slider.

**Files:**
- Modify: `skills/designkit/scripts/helper.js`

- [ ] **Step 1: Implement rebuildFineTuneTab**

Replace the placeholder `rebuildFineTuneTab` function:

```js
  function rebuildFineTuneTab(panel) {
    const data = window.THEME_DATA;
    const cc = panel._cc;
    const tabPanels = panel._tabPanels;
    if (!tabPanels || !themeState.system) return;

    const palette = data.palettes.find(p => p.key === themeState.system);
    if (!palette) return;

    const container = document.createElement('div');

    // Font family chips
    const fontSection = document.createElement('div');
    fontSection.className = 'theme-finetune-section';
    const fontLabel = document.createElement('div');
    fontLabel.className = 'theme-finetune-label';
    fontLabel.textContent = 'Font Family';
    fontSection.appendChild(fontLabel);

    const chips = document.createElement('div');
    chips.className = 'theme-font-chips';

    Object.entries(data.fontFamilies).forEach(([key, value]) => {
      const chip = document.createElement('button');
      chip.className = 'theme-font-chip';
      if ((themeState.fineTune && themeState.fineTune.fontFamily) === key) chip.classList.add('active');
      chip.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      chip.style.fontFamily = value;
      chip.addEventListener('click', () => {
        cc.style.setProperty('--font-family', value);
        chips.querySelectorAll('.theme-font-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        panel._previewFont = key;
      });
      chips.appendChild(chip);
    });
    fontSection.appendChild(chips);
    container.appendChild(fontSection);

    // Spacing density slider
    const spacingSection = document.createElement('div');
    spacingSection.className = 'theme-finetune-section';
    const spacingLabel = document.createElement('div');
    spacingLabel.className = 'theme-finetune-label';
    spacingLabel.textContent = 'Spacing Density';
    spacingSection.appendChild(spacingLabel);

    const spacingRow = document.createElement('div');
    spacingRow.className = 'theme-slider-row';

    const spacingMin = document.createElement('span');
    spacingMin.className = 'theme-slider-label';
    spacingMin.textContent = 'Compact';
    spacingRow.appendChild(spacingMin);

    const spacingSlider = document.createElement('input');
    spacingSlider.type = 'range';
    spacingSlider.className = 'theme-slider';
    spacingSlider.min = '0.6';
    spacingSlider.max = '1.5';
    spacingSlider.step = '0.05';
    spacingSlider.value = (themeState.fineTune && themeState.fineTune.spacingMultiplier) || '1';
    spacingRow.appendChild(spacingSlider);

    const spacingMax = document.createElement('span');
    spacingMax.className = 'theme-slider-label';
    spacingMax.textContent = 'Spacious';
    spacingMax.style.textAlign = 'left';
    spacingRow.appendChild(spacingMax);

    const spacingVal = document.createElement('span');
    spacingVal.className = 'theme-slider-value';
    spacingVal.textContent = spacingSlider.value + 'x';
    spacingRow.appendChild(spacingVal);

    spacingSlider.addEventListener('input', () => {
      const mult = parseFloat(spacingSlider.value);
      spacingVal.textContent = mult.toFixed(2) + 'x';
      ['xs','sm','md','lg','xl'].forEach(size => {
        const base = parseFloat(palette.tokens['--space-' + size]);
        cc.style.setProperty('--space-' + size, (base * mult).toFixed(3) + 'rem');
      });
      panel._previewSpacing = mult;
    });
    spacingSection.appendChild(spacingRow);
    container.appendChild(spacingSection);

    // Border radius slider
    const radiusSection = document.createElement('div');
    radiusSection.className = 'theme-finetune-section';
    const radiusLabel = document.createElement('div');
    radiusLabel.className = 'theme-finetune-label';
    radiusLabel.textContent = 'Border Radius';
    radiusSection.appendChild(radiusLabel);

    const radiusRow = document.createElement('div');
    radiusRow.className = 'theme-slider-row';

    const radiusMin = document.createElement('span');
    radiusMin.className = 'theme-slider-label';
    radiusMin.textContent = 'Sharp';
    radiusRow.appendChild(radiusMin);

    const radiusSlider = document.createElement('input');
    radiusSlider.type = 'range';
    radiusSlider.className = 'theme-slider';
    radiusSlider.min = '0';
    radiusSlider.max = '2';
    radiusSlider.step = '0.1';
    radiusSlider.value = (themeState.fineTune && themeState.fineTune.radiusMultiplier) || '1';
    radiusRow.appendChild(radiusSlider);

    const radiusMax = document.createElement('span');
    radiusMax.className = 'theme-slider-label';
    radiusMax.textContent = 'Round';
    radiusMax.style.textAlign = 'left';
    radiusRow.appendChild(radiusMax);

    const radiusVal = document.createElement('span');
    radiusVal.className = 'theme-slider-value';
    radiusVal.textContent = radiusSlider.value + 'x';
    radiusRow.appendChild(radiusVal);

    radiusSlider.addEventListener('input', () => {
      const mult = parseFloat(radiusSlider.value);
      radiusVal.textContent = mult.toFixed(1) + 'x';
      ['sm','md','lg'].forEach(size => {
        const base = parseFloat(palette.tokens['--radius-' + size]);
        cc.style.setProperty('--radius-' + size, Math.round(base * mult) + 'px');
      });
      panel._previewRadius = mult;
    });
    radiusSection.appendChild(radiusRow);
    container.appendChild(radiusSection);

    // Save bar
    const saveBar = document.createElement('div');
    saveBar.className = 'theme-save-bar';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'theme-save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
      if (!themeState.fineTune) themeState.fineTune = {};
      if (panel._previewFont) themeState.fineTune.fontFamily = panel._previewFont;
      if (panel._previewSpacing) themeState.fineTune.spacingMultiplier = panel._previewSpacing;
      if (panel._previewRadius) themeState.fineTune.radiusMultiplier = panel._previewRadius;
      saveThemeState();

      tuneChanges.push({
        selector: '#claude-content',
        tag: 'theme',
        text: 'Fine-tune: ' + JSON.stringify(themeState.fineTune),
        changes: {},
        tokenChanges: { '--theme-finetune': JSON.stringify(themeState.fineTune) },
        timestamp: Date.now()
      });
      renderSidebar();
    });
    saveBar.appendChild(saveBtn);
    container.appendChild(saveBar);

    // Replace old tab content
    const oldPanel = tabPanels['Fine-tune'];
    oldPanel.innerHTML = '';
    oldPanel.appendChild(container);
  }
```

- [ ] **Step 2: Verify full flow in browser**

Restart server. Full end-to-end test:
1. Shift+D → System tab → click Material → page transforms → Save
2. Colors tab → click Dark → page goes dark → use accent picker → Save
3. Fine-tune tab → click Serif → page font changes → drag spacing slider → page tightens/loosens → drag radius slider → corners sharpen/round → Save
4. Shift+A → staged changes sidebar shows all three theme entries
5. Reload page → all theme choices persist
6. Shift+Cmd+Enter → send to Claude → check events file for theme payload

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/scripts/helper.js
git commit -m "feat(theme): build Layer 3 — Font family, spacing density, and radius fine-tune"
```

---

### Task 8: Wire up theme events in Send payload

Ensure theme changes are properly included when the user hits Send (Shift+Cmd+Enter) with the full semantic + tokenChanges format from the spec.

**Files:**
- Modify: `skills/designkit/scripts/helper.js`

- [ ] **Step 1: Update sendAnnotations to include theme summary**

Find the `sendAnnotations` function (around line 496). The tuneChanges array already captures theme entries from each Save (added in Tasks 5-7). But we should also add a consolidated theme summary event. After the existing `tuneChanges.forEach` block, add:

```js
    // Add consolidated theme state if any theme changes were made
    if (themeState.system) {
      const data = window.THEME_DATA;
      const palette = data ? data.palettes.find(p => p.key === themeState.system) : null;
      if (palette) {
        const allTokens = {};
        // Collect all applied token values from #claude-content
        const cc = document.getElementById('claude-content');
        if (cc) {
          Object.keys(palette.tokens).forEach(key => {
            const val = cc.style.getPropertyValue(key);
            if (val) allTokens[key] = val.trim();
          });
        }

        payload.push({
          type: 'theme',
          system: themeState.system,
          colorVariant: themeState.colorVariant || 'default',
          accentColor: themeState.accentColor || null,
          fineTune: themeState.fineTune || {},
          tokenChanges: allTokens,
          timestamp: Date.now()
        });
      }
    }
```

- [ ] **Step 2: Verify events file**

1. Open page, apply a theme, Save, then Shift+Cmd+Enter
2. Check the events file: `cat $STATE_DIR/events`
3. Should see a `"type":"theme"` entry with system, colorVariant, accentColor, fineTune, and tokenChanges fields

- [ ] **Step 3: Commit**

```bash
git add skills/designkit/scripts/helper.js
git commit -m "feat(theme): include consolidated theme event in Send payload"
```

---

### Task 9: End-to-end verification and version bump

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Full end-to-end verification**

Restart server. Run through the complete flow:

1. Load a prototype page in the viewer
2. Shift+D → panel opens, System tab visible
3. Click through several design systems — page transforms each time
4. Save one → Colors tab becomes active
5. Switch between Default/Dark/Warm/Cool variants → colors change, fonts stay
6. Use accent picker → primary color updates live
7. Save → Fine-tune tab becomes active
8. Toggle font chips → font changes
9. Drag spacing slider → layout tightens/loosens
10. Drag radius slider → corners change
11. Save
12. Shift+A → all changes visible in sidebar
13. Shift+Cmd+Enter → send to Claude
14. Reload page → theme persists
15. Shift+T → Tune panel works normally alongside theme
16. Cmd+Z → undo reverts to previous Save state

- [ ] **Step 2: Bump version**

Update both config files to 0.3.0 (minor version bump for new feature):

`.claude-plugin/plugin.json`: `"version": "0.3.0"`
`.claude-plugin/marketplace.json`: `"version": "0.3.0"`

- [ ] **Step 3: Commit and push**

```bash
git add .claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "chore: bump version to 0.3.0 for Theme Selector feature"
git push origin main
```

- [ ] **Step 4: Release**

```bash
./release.sh "v0.3.0 — Theme Selector: live design system, color, and fine-tune swapping"
cd ~/Dev/designkit && git push origin main
```
