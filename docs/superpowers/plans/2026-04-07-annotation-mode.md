# Annotation Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an annotation mode to the brainstorm companion that lets designers click elements, attach text notes, and batch-send them to Claude as structured feedback.

**Architecture:** All annotation logic lives client-side in `helper.js`. Annotations persist in `localStorage`, render as teardrop pin dots over the prototype, and batch-send to the server via WebSocket when Claude pushes a new screen. The server gets one new message handler. CSS for annotation UI components goes in `frame-template.html`.

**Tech Stack:** Vanilla JS (helper.js), CSS (frame-template.html), Node.js (server.cjs). No dependencies.

**Spec:** `docs/superpowers/specs/2026-04-07-annotation-mode-design.md`

---

## File Map

- **Create:** `scripts/helper.js` — fork from `superpowers-main/skills/brainstorming/scripts/helper.js`, add all annotation logic
- **Create:** `scripts/frame-template.html` — fork from `superpowers-main/skills/brainstorming/scripts/frame-template.html`, add annotation CSS
- **Create:** `scripts/server.cjs` — fork from `superpowers-main/skills/brainstorming/scripts/server.cjs`, add annotations message handler
- **Create:** `scripts/start-server.sh` — copy from `superpowers-main/skills/brainstorming/scripts/start-server.sh`
- **Create:** `scripts/stop-server.sh` — copy from `superpowers-main/skills/brainstorming/scripts/stop-server.sh`

All files live under `/Users/leemcewen/Dev/design-superpowers/scripts/`. We fork the originals rather than modifying them in `superpowers-main/` (that's the upstream dependency).

---

## Chunk 1: Fork and Scaffold

### Task 1: Fork brainstorm scripts into project

**Files:**
- Create: `scripts/helper.js`
- Create: `scripts/frame-template.html`
- Create: `scripts/server.cjs`
- Create: `scripts/start-server.sh`
- Create: `scripts/stop-server.sh`

- [ ] **Step 1: Copy all brainstorm scripts to the project scripts directory**

```bash
mkdir -p /Users/leemcewen/Dev/design-superpowers/scripts
cp /Users/leemcewen/Dev/design-superpowers/superpowers-main/skills/brainstorming/scripts/helper.js /Users/leemcewen/Dev/design-superpowers/scripts/
cp /Users/leemcewen/Dev/design-superpowers/superpowers-main/skills/brainstorming/scripts/frame-template.html /Users/leemcewen/Dev/design-superpowers/scripts/
cp /Users/leemcewen/Dev/design-superpowers/superpowers-main/skills/brainstorming/scripts/server.cjs /Users/leemcewen/Dev/design-superpowers/scripts/
cp /Users/leemcewen/Dev/design-superpowers/superpowers-main/skills/brainstorming/scripts/start-server.sh /Users/leemcewen/Dev/design-superpowers/scripts/
cp /Users/leemcewen/Dev/design-superpowers/superpowers-main/skills/brainstorming/scripts/stop-server.sh /Users/leemcewen/Dev/design-superpowers/scripts/
chmod +x /Users/leemcewen/Dev/design-superpowers/scripts/start-server.sh
chmod +x /Users/leemcewen/Dev/design-superpowers/scripts/stop-server.sh
```

- [ ] **Step 2: Verify the forked server starts**

Run: `scripts/start-server.sh --project-dir /Users/leemcewen/Dev/design-superpowers`
Expected: JSON output with `type: "server-started"`, a port, and a URL

- [ ] **Step 3: Stop the test server**

Run: `scripts/stop-server.sh <session_dir_from_step_2>`
Expected: `{"status": "stopped"}`

---

## Chunk 2: Annotation CSS Foundation

### Task 2: Add annotation CSS to frame-template.html

**Files:**
- Modify: `scripts/frame-template.html`

- [ ] **Step 1: Add annotation color variables to the `:root` block**

Add after the existing `--selected-border` line inside `:root`:

```css
      --annotation-new: #0071e3;
      --annotation-addressed: #86868b;
      --annotation-unaddressed: #ff9f0a;
      --annotation-pin-size: 28px;
```

Add the dark mode overrides after the existing dark `--selected-border` line:

```css
        --annotation-new: #0a84ff;
        --annotation-addressed: #636366;
        --annotation-unaddressed: #ff9f0a;
```

- [ ] **Step 2: Add comment toggle button CSS**

Add after the `.indicator-bar .selected-text` rule block (after line ~96 area):

```css
    /* ===== COMMENT MODE TOGGLE ===== */
    .comment-toggle {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      border: 1px solid transparent;
      background: none;
      color: var(--text-secondary);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .comment-toggle:hover { background: var(--bg-tertiary); }
    .comment-toggle.active {
      background: var(--annotation-new);
      color: white;
      border-color: var(--annotation-new);
    }
    .comment-toggle .comment-icon {
      width: 14px;
      height: 14px;
    }
    .comment-badge {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      font-size: 0.65rem;
      padding: 0.1rem 0.35rem;
      border-radius: 10px;
      font-weight: 600;
      min-width: 1.1rem;
      text-align: center;
    }
    .comment-toggle.active .comment-badge {
      background: rgba(255,255,255,0.25);
      color: white;
    }
```

- [ ] **Step 3: Add teardrop pin dot CSS**

Add after the comment toggle CSS:

```css
    /* ===== ANNOTATION PINS ===== */
    .annotation-pin {
      position: absolute;
      width: var(--annotation-pin-size);
      height: var(--annotation-pin-size);
      transform: translate(-50%, -100%);
      cursor: pointer;
      z-index: 1000;
      pointer-events: auto;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,0.2));
      transition: transform 0.1s ease;
    }
    .annotation-pin:hover { transform: translate(-50%, -100%) scale(1.15); }
    .annotation-pin svg { width: 100%; height: 100%; }
    .annotation-pin .pin-number {
      position: absolute;
      top: 2px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.6rem;
      font-weight: 700;
      color: white;
      pointer-events: none;
      line-height: 1;
    }
    .annotation-pin[data-status="new"] svg .pin-fill { fill: var(--annotation-new); }
    .annotation-pin[data-status="addressed"] svg .pin-fill { fill: var(--annotation-addressed); }
    .annotation-pin[data-status="unaddressed"] svg .pin-fill { fill: var(--annotation-unaddressed); }
    .annotation-pins-hidden .annotation-pin { display: none; }
```

- [ ] **Step 4: Add inline popover CSS**

Add after the pin CSS:

```css
    /* ===== ANNOTATION POPOVER ===== */
    .annotation-popover {
      position: absolute;
      z-index: 1001;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.5rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      min-width: 220px;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .annotation-popover input {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.4rem 0.6rem;
      font-size: 0.85rem;
      color: var(--text-primary);
      outline: none;
      width: 100%;
      font-family: inherit;
    }
    .annotation-popover input:focus { border-color: var(--annotation-new); }
    .annotation-popover .popover-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .annotation-popover .popover-hint {
      font-size: 0.65rem;
      color: var(--text-tertiary);
    }
    .annotation-popover .popover-delete {
      background: none;
      border: none;
      color: var(--error);
      font-size: 0.7rem;
      cursor: pointer;
      padding: 0.15rem 0.3rem;
      border-radius: 4px;
      font-family: inherit;
    }
    .annotation-popover .popover-delete:hover { background: var(--bg-tertiary); }
```

- [ ] **Step 5: Add sidebar panel CSS**

Add after the popover CSS:

```css
    /* ===== ANNOTATION SIDEBAR ===== */
    .annotation-sidebar {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 300px;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border);
      z-index: 1002;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.2s ease;
      box-shadow: -4px 0 16px rgba(0,0,0,0.1);
    }
    .annotation-sidebar.open { transform: translateX(0); }
    .annotation-sidebar .sidebar-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .annotation-sidebar .sidebar-header h3 {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0;
    }
    .annotation-sidebar .sidebar-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.2rem;
      line-height: 1;
    }
    .annotation-sidebar .sidebar-list {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .annotation-sidebar .sidebar-card {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.6rem 0.75rem;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
    }
    .annotation-sidebar .sidebar-card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.3rem;
    }
    .annotation-sidebar .sidebar-pin-number {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    .annotation-sidebar .sidebar-pin-number[data-status="new"] { background: var(--annotation-new); }
    .annotation-sidebar .sidebar-pin-number[data-status="addressed"] { background: var(--annotation-addressed); }
    .annotation-sidebar .sidebar-pin-number[data-status="unaddressed"] { background: var(--annotation-unaddressed); }
    .annotation-sidebar .sidebar-element {
      color: var(--text-tertiary);
      font-size: 0.7rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .annotation-sidebar .sidebar-note {
      color: var(--text-primary);
      margin: 0.25rem 0;
    }
    .annotation-sidebar .sidebar-card[data-status="addressed"] .sidebar-note {
      color: var(--text-secondary);
    }
    .annotation-sidebar .sidebar-card-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.35rem;
    }
    .annotation-sidebar .sidebar-action {
      background: none;
      border: none;
      font-size: 0.65rem;
      cursor: pointer;
      padding: 0.15rem 0.3rem;
      border-radius: 4px;
      font-family: inherit;
    }
    .annotation-sidebar .sidebar-action.delete { color: var(--error); }
    .annotation-sidebar .sidebar-action.toggle-status { color: var(--annotation-unaddressed); }
    .annotation-sidebar .sidebar-action:hover { background: var(--bg-tertiary); }
    .annotation-sidebar .sidebar-card.detached {
      border-style: dashed;
      opacity: 0.7;
    }
    .annotation-sidebar .detached-label {
      font-size: 0.6rem;
      color: var(--text-tertiary);
      font-style: italic;
    }
    .annotation-sidebar .sidebar-empty {
      color: var(--text-tertiary);
      text-align: center;
      padding: 2rem 1rem;
      font-size: 0.8rem;
    }

    /* ===== COMMENT MODE CURSOR ===== */
    body.comment-mode #claude-content { cursor: crosshair; }
    body.comment-mode #claude-content [data-choice] { cursor: crosshair; }
```

- [ ] **Step 6: Add sidebar toggle button to the header HTML**

In the header div (around line 199), add a sidebar toggle button between the h1 and the status div:

Replace:
```html
  <div class="header">
    <h1><a href="https://github.com/obra/superpowers" style="color: inherit; text-decoration: none;">Superpowers Brainstorming</a></h1>
    <div class="status">Connected</div>
  </div>
```

With:
```html
  <div class="header">
    <h1>Design Companion</h1>
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <button class="comment-toggle" id="comment-toggle" title="Toggle comment mode (Shift+C)">
        <svg class="comment-icon" viewBox="0 0 16 16" fill="none">
          <path d="M2 2.5C2 1.67 2.67 1 3.5 1h9c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5H5.5L2 14V2.5z" fill="currentColor"/>
        </svg>
        <span class="comment-badge" id="comment-count">0</span>
      </button>
      <div class="status">Connected</div>
    </div>
  </div>
```

- [ ] **Step 7: Verify server starts with updated template**

Run: `scripts/start-server.sh --project-dir /Users/leemcewen/Dev/design-superpowers`
Then write a test HTML fragment to the content dir and open in browser. Verify the header shows the comment toggle button.

Stop the server after verifying.

---

## Chunk 3: Core Annotation Logic in helper.js

### Task 3: Add annotation state management and mode toggle

**Files:**
- Modify: `scripts/helper.js`

- [ ] **Step 1: Add annotation state and storage functions**

Add after the `let eventQueue = [];` line (line 4), before the `connect()` function:

```js
  // ===== ANNOTATION STATE =====
  const SESSION_KEY = 'annotations-' + window.location.port;
  let commentMode = false;
  let annotations = loadAnnotations();
  let pinCounter = annotations.length;
  let activePopover = null;

  function loadAnnotations() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveAnnotations() {
    localStorage.setItem(SESSION_KEY, JSON.stringify(annotations));
    updateBadge();
  }

  function generateId() {
    return 'ann-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
  }

  function updateBadge() {
    const badge = document.getElementById('comment-count');
    if (badge) badge.textContent = annotations.length;
  }
```

- [ ] **Step 2: Add selector generation utility**

Add after the storage functions:

```js
  // ===== SELECTOR GENERATION =====
  function generateSelector(el) {
    const parts = [];
    let current = el;
    const root = document.getElementById('claude-content');
    if (!root || !root.contains(el)) return null;

    while (current && current !== root) {
      if (current.id) {
        parts.unshift('#' + current.id);
        break;
      }
      let part = current.tagName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/)
          .filter(c => !c.startsWith('annotation-') && !c.startsWith('selected'));
        if (classes.length > 0) {
          part += '.' + classes.join('.');
          // Check if this is unique among siblings
          const parent = current.parentElement;
          if (parent) {
            const siblings = Array.from(parent.children).filter(s =>
              s.tagName === current.tagName && s !== current &&
              classes.every(c => s.classList.contains(c))
            );
            if (siblings.length > 0) {
              const idx = Array.from(parent.children).filter(s =>
                s.tagName === current.tagName
              ).indexOf(current) + 1;
              part += ':nth-of-type(' + idx + ')';
            }
          }
        } else {
          const parent = current.parentElement;
          if (parent) {
            const sameTag = Array.from(parent.children).filter(s => s.tagName === current.tagName);
            if (sameTag.length > 1) {
              part += ':nth-of-type(' + (sameTag.indexOf(current) + 1) + ')';
            }
          }
        }
      } else {
        const parent = current.parentElement;
        if (parent) {
          const sameTag = Array.from(parent.children).filter(s => s.tagName === current.tagName);
          if (sameTag.length > 1) {
            part += ':nth-of-type(' + (sameTag.indexOf(current) + 1) + ')';
          }
        }
      }
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }
```

- [ ] **Step 3: Add Shift+C mode toggle and comment toggle button handler**

Add after the selector generation:

```js
  // ===== MODE TOGGLE =====
  function setCommentMode(active) {
    commentMode = active;
    document.body.classList.toggle('comment-mode', active);
    const toggle = document.getElementById('comment-toggle');
    if (toggle) toggle.classList.toggle('active', active);

    if (active) {
      document.body.classList.remove('annotation-pins-hidden');
      renderAllPins();
    } else {
      document.body.classList.add('annotation-pins-hidden');
      closePopover();
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'C') {
      e.preventDefault();
      setCommentMode(!commentMode);
    }
  });

  // Button click toggle
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#comment-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      setCommentMode(!commentMode);
    }
  });
```

- [ ] **Step 4: Verify mode toggle works**

Start the server, write a simple test fragment to the content dir:
```html
<h2>Test Page</h2>
<p>Click me to annotate</p>
```

Open in browser. Press Shift+C — the comment toggle button in the header should highlight blue and the cursor should change to crosshair. Press Shift+C again — it should deactivate. Click the button directly — same behavior.

Stop the server after verifying.

### Task 4: Add pin rendering and popover interaction

**Files:**
- Modify: `scripts/helper.js`

- [ ] **Step 1: Add pin rendering functions**

Add after the mode toggle code:

```js
  // ===== PIN RENDERING =====
  const PIN_SVG = '<svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="pin-fill" d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z"/>' +
    '</svg>';

  function createPinElement(annotation, index) {
    const pin = document.createElement('div');
    pin.className = 'annotation-pin';
    pin.dataset.annotationId = annotation.id;
    pin.dataset.status = annotation.status;
    pin.innerHTML = PIN_SVG + '<span class="pin-number">' + (index + 1) + '</span>';

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      if (commentMode) {
        showPopover(annotation, pin);
      }
    });

    return pin;
  }

  function renderAllPins() {
    // Remove existing pins
    document.querySelectorAll('.annotation-pin').forEach(p => p.remove());

    const root = document.getElementById('claude-content');
    if (!root) return;

    annotations.forEach((ann, i) => {
      const target = root.querySelector(ann.selector);
      if (!target) {
        ann._detached = true;
        return;
      }
      ann._detached = false;

      // Ensure target is positioned for absolute pin placement
      const pos = window.getComputedStyle(target).position;
      if (pos === 'static') target.style.position = 'relative';

      const pin = createPinElement(ann, i);
      pin.style.left = ann.position.x + 'px';
      pin.style.top = ann.position.y + 'px';
      target.appendChild(pin);
    });
  }
```

- [ ] **Step 2: Add popover create/edit/delete functions**

Add after pin rendering:

```js
  // ===== POPOVER =====
  function closePopover() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
    }
  }

  function showPopover(annotation, anchorEl) {
    closePopover();

    const popover = document.createElement('div');
    popover.className = 'annotation-popover';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a note...';
    input.value = annotation ? annotation.note : '';

    const actions = document.createElement('div');
    actions.className = 'popover-actions';

    const hint = document.createElement('span');
    hint.className = 'popover-hint';
    hint.textContent = 'Enter to save · Esc to cancel';
    actions.appendChild(hint);

    if (annotation && annotation.id) {
      const del = document.createElement('button');
      del.className = 'popover-delete';
      del.textContent = 'Delete';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteAnnotation(annotation.id);
        closePopover();
      });
      actions.appendChild(del);
    }

    popover.appendChild(input);
    popover.appendChild(actions);

    // Position near the anchor
    const rect = anchorEl.getBoundingClientRect();
    popover.style.position = 'fixed';
    popover.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';

    // Show above or below depending on space
    if (rect.top > 200) {
      popover.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    } else {
      popover.style.top = (rect.bottom + 8) + 'px';
    }

    document.body.appendChild(popover);
    activePopover = popover;
    input.focus();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        e.preventDefault();
        if (annotation && annotation.id) {
          annotation.note = input.value.trim();
          saveAnnotations();
          renderSidebar();
        }
        closePopover();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // If this was a new annotation with no note, remove it
        if (annotation && annotation.id && !annotation.note) {
          deleteAnnotation(annotation.id);
        }
        closePopover();
      }
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!popover.contains(e.target) && !anchorEl.contains(e.target)) {
          if (annotation && annotation.id && !annotation.note) {
            deleteAnnotation(annotation.id);
          }
          closePopover();
          document.removeEventListener('click', handler);
        }
      });
    }, 0);
  }

  function deleteAnnotation(id) {
    annotations = annotations.filter(a => a.id !== id);
    saveAnnotations();
    renderAllPins();
    renderSidebar();
  }
```

- [ ] **Step 3: Add click handler for creating annotations in comment mode**

Modify the existing document click handler. The existing click handler captures `[data-choice]` clicks. We need to add annotation creation for comment mode. Add this after the mode toggle code, BEFORE the existing `document.addEventListener('click', ...)` that handles `[data-choice]`:

```js
  // ===== ANNOTATION CLICK HANDLER =====
  document.addEventListener('click', (e) => {
    if (!commentMode) return;

    // Don't annotate the frame chrome, pins, popovers, sidebar, or toggle button
    const ignore = e.target.closest('.header, .indicator-bar, .annotation-pin, .annotation-popover, .annotation-sidebar, #comment-toggle');
    if (ignore) return;

    const target = e.target.closest('#claude-content *');
    if (!target) return;

    // Don't annotate the content container itself
    if (target.id === 'claude-content') return;

    e.preventDefault();
    e.stopPropagation();

    const selector = generateSelector(target);
    if (!selector) return;

    const rect = target.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const annotation = {
      id: generateId(),
      selector: selector,
      tag: target.tagName.toLowerCase(),
      text: (target.textContent || '').trim().slice(0, 100),
      note: '',
      status: 'new',
      position: {
        x: e.clientX - targetRect.left,
        y: e.clientY - targetRect.top
      },
      timestamp: Date.now()
    };

    pinCounter++;
    annotations.push(annotation);
    saveAnnotations();
    renderAllPins();
    renderSidebar();

    // Show popover on the newly created pin
    const newPin = document.querySelector('[data-annotation-id="' + annotation.id + '"]');
    if (newPin) {
      showPopover(annotation, newPin);
    }
  }, true); // Use capture phase so this runs before the [data-choice] handler
```

- [ ] **Step 4: Verify pin creation and popover work**

Start the server, push a test fragment:
```html
<h2>Dashboard</h2>
<div class="cards">
  <div class="card">
    <div class="card-body">
      <h3>Revenue</h3>
      <p>$12,345</p>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h3>Users</h3>
      <p>1,234</p>
    </div>
  </div>
</div>
```

Open in browser. Press Shift+C. Click on "Revenue" heading. A popover should appear with text input. Type "make this bolder" and press Enter. A blue teardrop pin should appear where you clicked. The badge should show "1". Press Shift+C to exit — pins should hide.

Stop the server after verifying.

### Task 5: Add sidebar panel

**Files:**
- Modify: `scripts/helper.js`

- [ ] **Step 1: Add sidebar rendering functions**

Add after the `deleteAnnotation` function:

```js
  // ===== SIDEBAR =====
  let sidebarOpen = false;

  function createSidebar() {
    let sidebar = document.querySelector('.annotation-sidebar');
    if (sidebar) return sidebar;

    sidebar = document.createElement('div');
    sidebar.className = 'annotation-sidebar';

    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = '<h3>Annotations <span id="sidebar-count"></span></h3>';

    const close = document.createElement('button');
    close.className = 'sidebar-close';
    close.textContent = '\u00d7';
    close.addEventListener('click', () => toggleSidebar(false));
    header.appendChild(close);

    const list = document.createElement('div');
    list.className = 'sidebar-list';

    sidebar.appendChild(header);
    sidebar.appendChild(list);
    document.body.appendChild(sidebar);
    return sidebar;
  }

  function renderSidebar() {
    const sidebar = createSidebar();
    const list = sidebar.querySelector('.sidebar-list');
    const count = sidebar.querySelector('#sidebar-count');
    if (count) count.textContent = '(' + annotations.length + ')';

    list.innerHTML = '';

    if (annotations.length === 0) {
      list.innerHTML = '<div class="sidebar-empty">No annotations yet.<br>Press Shift+C to start commenting.</div>';
      return;
    }

    annotations.forEach((ann, i) => {
      const card = document.createElement('div');
      card.className = 'sidebar-card' + (ann._detached ? ' detached' : '');
      card.dataset.status = ann.status;

      const cardHeader = document.createElement('div');
      cardHeader.className = 'sidebar-card-header';

      const pinNum = document.createElement('span');
      pinNum.className = 'sidebar-pin-number';
      pinNum.dataset.status = ann.status;
      pinNum.textContent = i + 1;

      const elDesc = document.createElement('span');
      elDesc.className = 'sidebar-element';
      elDesc.textContent = '<' + ann.tag + '> ' + (ann.text || '').slice(0, 40);

      cardHeader.appendChild(pinNum);
      cardHeader.appendChild(elDesc);
      card.appendChild(cardHeader);

      if (ann._detached) {
        const detached = document.createElement('span');
        detached.className = 'detached-label';
        detached.textContent = 'Element changed — detached';
        card.appendChild(detached);
      }

      const note = document.createElement('div');
      note.className = 'sidebar-note';
      note.textContent = ann.note || '(no note)';
      card.appendChild(note);

      const actions = document.createElement('div');
      actions.className = 'sidebar-card-actions';

      const del = document.createElement('button');
      del.className = 'sidebar-action delete';
      del.textContent = 'Delete';
      del.addEventListener('click', () => {
        deleteAnnotation(ann.id);
      });
      actions.appendChild(del);

      if (ann.status === 'addressed') {
        const toggle = document.createElement('button');
        toggle.className = 'sidebar-action toggle-status';
        toggle.textContent = 'Mark unaddressed';
        toggle.addEventListener('click', () => {
          ann.status = 'unaddressed';
          saveAnnotations();
          renderAllPins();
          renderSidebar();
        });
        actions.appendChild(toggle);
      }

      card.appendChild(actions);

      // Click card to scroll to pin
      card.addEventListener('click', (e) => {
        if (e.target.closest('.sidebar-action')) return;
        const pin = document.querySelector('[data-annotation-id="' + ann.id + '"]');
        if (pin) pin.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      list.appendChild(card);
    });
  }

  function toggleSidebar(forceState) {
    sidebarOpen = forceState !== undefined ? forceState : !sidebarOpen;
    const sidebar = createSidebar();
    sidebar.classList.toggle('open', sidebarOpen);
    if (sidebarOpen) renderSidebar();
  }
```

- [ ] **Step 2: Add sidebar toggle button handler to the header**

Add after the `toggleSidebar` function. We also need to add the sidebar toggle button to the header at runtime since the comment toggle button is already there from the template:

```js
  // Add sidebar toggle to header on load
  document.addEventListener('DOMContentLoaded', () => {
    const headerRight = document.querySelector('.header > div:last-child');
    if (headerRight && !document.getElementById('sidebar-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'sidebar-toggle';
      btn.className = 'comment-toggle';
      btn.title = 'View all annotations';
      btn.innerHTML = '<svg class="comment-icon" viewBox="0 0 16 16" fill="none">' +
        '<path d="M2 1h12v14H2V1zm1 1v12h10V2H3zm2 2h6v1H5V4zm0 3h6v1H5V7zm0 3h4v1H5v-1z" fill="currentColor"/>' +
        '</svg>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
      headerRight.insertBefore(btn, headerRight.firstChild);
    }
    updateBadge();
    renderSidebar();
  });
```

- [ ] **Step 3: Verify sidebar works**

Start the server, push the test fragment. Toggle comment mode with Shift+C. Add 2-3 annotations. Click the sidebar (list icon) button in the header. Sidebar should slide in from the right showing all annotations with pin numbers, element descriptions, and notes. Click "Delete" on one — it should remove. Close sidebar with the X button.

Stop the server after verifying.

---

## Chunk 4: Batch Send and Lifecycle

### Task 6: Add batch send on reload and lifecycle transitions

**Files:**
- Modify: `scripts/helper.js`
- Modify: `scripts/server.cjs`

- [ ] **Step 1: Modify the WebSocket reload handler in helper.js**

Replace the existing `ws.onmessage` handler:

```js
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'reload') {
        window.location.reload();
      }
    };
```

With:

```js
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'reload') {
        // Batch send annotations before reloading
        const sendable = annotations.filter(a => a.status === 'new' || a.status === 'unaddressed');
        if (sendable.length > 0) {
          const payload = sendable.map(a => ({
            type: 'annotation',
            id: a.id,
            selector: a.selector,
            tag: a.tag,
            text: a.text,
            note: a.note,
            status: a.status,
            timestamp: a.timestamp
          }));
          sendEvent({ type: 'annotations', items: payload });
        }

        // Transition new → addressed
        annotations.forEach(a => {
          if (a.status === 'new') a.status = 'addressed';
        });
        saveAnnotations();

        window.location.reload();
      }
    };
```

- [ ] **Step 2: Add annotations message handler in server.cjs**

In `server.cjs`, modify the `handleMessage` function. Replace:

```js
function handleMessage(text) {
  let event;
  try {
    event = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse WebSocket message:', e.message);
    return;
  }
  touchActivity();
  console.log(JSON.stringify({ source: 'user-event', ...event }));
  if (event.choice) {
    const eventsFile = path.join(STATE_DIR, 'events');
    fs.appendFileSync(eventsFile, JSON.stringify(event) + '\n');
  }
}
```

With:

```js
function handleMessage(text) {
  let event;
  try {
    event = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse WebSocket message:', e.message);
    return;
  }
  touchActivity();
  console.log(JSON.stringify({ source: 'user-event', ...event }));
  if (event.choice) {
    const eventsFile = path.join(STATE_DIR, 'events');
    fs.appendFileSync(eventsFile, JSON.stringify(event) + '\n');
  }
  if (event.type === 'annotations' && Array.isArray(event.items)) {
    const eventsFile = path.join(STATE_DIR, 'events');
    event.items.forEach(item => {
      fs.appendFileSync(eventsFile, JSON.stringify(item) + '\n');
    });
  }
}
```

- [ ] **Step 3: Verify batch send works end-to-end**

Start the server. Push a test fragment. Toggle comment mode, add 2 annotations. Now push a second HTML file to the content dir (simulating Claude pushing a new screen). Check:

1. The `state/events` file should contain the 2 annotations as JSONL lines
2. After the page reloads, annotations in localStorage should have status "addressed"
3. Pins should not render (comment mode is off by default after reload)
4. Toggle comment mode — pins should render in gray (addressed color)
5. Open sidebar — annotations should show as addressed with "Mark unaddressed" option

Run: `cat <state_dir>/events`
Expected: Two JSONL lines with `type: "annotation"`, each with selector, tag, text, note, status

Stop the server after verifying.

### Task 7: Add pin re-rendering after page load

**Files:**
- Modify: `scripts/helper.js`

- [ ] **Step 1: Add initialization on page load to re-render pins from localStorage**

Add to the `DOMContentLoaded` handler (from Task 5 Step 2), at the end of the callback:

```js
    // Re-render pins if comment mode was active (check localStorage)
    if (annotations.length > 0) {
      renderAllPins();
      // Pins start hidden — only visible when comment mode is toggled on
      document.body.classList.add('annotation-pins-hidden');
    }
```

- [ ] **Step 2: Verify persistence across reloads**

Start the server. Push a test fragment. Add 3 annotations. Manually reload the browser page (F5). Toggle comment mode — the 3 pins should reappear at their original positions. Open sidebar — all 3 should be listed.

Stop the server after verifying.

---

## Chunk 5: Integration Verification

### Task 8: Full workflow smoke test

- [ ] **Step 1: Start the server**

Run: `scripts/start-server.sh --project-dir /Users/leemcewen/Dev/design-superpowers`
Save the screen_dir and state_dir from the output.

- [ ] **Step 2: Push a realistic prototype screen**

Write this to `<screen_dir>/dashboard.html`:

```html
<h2>Dashboard Design</h2>
<p class="subtitle">Review this layout and leave feedback</p>

<div class="mockup">
  <div class="mockup-header">Preview: Dashboard</div>
  <div class="mockup-body">
    <div class="mock-nav">Logo | Home | Dashboard | Settings</div>
    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
      <div style="flex: 1;">
        <h3 style="margin-bottom: 0.75rem;">Revenue</h3>
        <p style="font-size: 2rem; font-weight: 700;">$48,250</p>
        <p style="color: var(--success); font-size: 0.85rem;">+12.5% from last month</p>
      </div>
      <div style="flex: 1;">
        <h3 style="margin-bottom: 0.75rem;">Active Users</h3>
        <p style="font-size: 2rem; font-weight: 700;">2,847</p>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">-3.2% from last month</p>
      </div>
      <div style="flex: 1;">
        <h3 style="margin-bottom: 0.75rem;">Conversion</h3>
        <p style="font-size: 2rem; font-weight: 700;">4.6%</p>
        <p style="color: var(--success); font-size: 0.85rem;">+0.8% from last month</p>
      </div>
    </div>
    <div style="margin-top: 1.5rem;">
      <h3 style="margin-bottom: 0.75rem;">Recent Activity</h3>
      <div class="placeholder">Activity feed goes here</div>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Test the full annotation workflow**

In the browser:
1. Open `http://localhost:<port>`
2. Press Shift+C — verify comment mode activates (button highlights, crosshair cursor)
3. Click on "$48,250" — verify popover appears
4. Type "too large, try 1.5rem" — press Enter — verify blue teardrop pin appears
5. Click on "Active Users" heading — type "needs icon" — Enter
6. Click on the placeholder area — type "show last 5 items, not a placeholder" — Enter
7. Verify badge shows "3"
8. Click the sidebar button — verify all 3 annotations listed
9. Press Shift+C — verify pins hide, clean canvas
10. Press Shift+C again — verify pins reappear

- [ ] **Step 4: Test batch send by pushing a new screen**

Write a second file to `<screen_dir>/dashboard-v2.html` (any content — just to trigger reload).

After the browser reloads:
1. Check `<state_dir>/events` — should contain 3 annotation JSONL lines
2. Toggle comment mode — pins should render in gray (addressed)
3. Open sidebar — annotations should show as "addressed"
4. Click "Mark unaddressed" on one — it should turn orange
5. Add a new annotation — it should appear blue (new)
6. Push a third file `<screen_dir>/dashboard-v3.html` — check events file contains only the unaddressed + new annotations

- [ ] **Step 5: Verify events file format is what Claude expects**

Run: `cat <state_dir>/events`

Expected format (each line):
```json
{"type":"annotation","id":"ann-...","selector":"...","tag":"...","text":"...","note":"...","status":"new","timestamp":...}
```

- [ ] **Step 6: Stop the server and clean up**

Run: `scripts/stop-server.sh <session_dir>`
Expected: `{"status": "stopped"}`
