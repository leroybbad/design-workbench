(function() {
  const WS_URL = 'ws://' + window.location.host;
  let ws = null;
  let eventQueue = [];

  // ===== ANNOTATION STATE =====
  const SESSION_KEY = 'annotations-' + window.location.port;
  let commentMode = false;
  let annotations = loadAnnotations();
  let pinCounter = annotations.length;
  let activePopover = null;
  let inspectMode = false;
  let inspectTooltip = null;
  let tuneMode = false;
  let tuneTarget = null;
  let tuneOriginalStyles = {};
  let tuneChanges = [];
  let tuneStyleObserver = null;
  let undoStack = []; // {element, prop, oldValue}
  let redoStack = [];
  let themeMode = false;
  let themePanel = null;
  const THEME_KEY = 'theme-state-' + window.location.port;
  let themeState = loadThemeState();

  function loadThemeState() {
    try { return JSON.parse(localStorage.getItem(THEME_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveThemeState() {
    localStorage.setItem(THEME_KEY, JSON.stringify(themeState));
  }

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
    const sendBtn = document.getElementById('send-annotations');
    if (sendBtn) sendBtn.style.display = (annotations.length > 0 || tuneChanges.length > 0) ? 'flex' : 'none';
  }

  function generateId() {
    return 'ann-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
  }

  function updateBadge() {
    const badge = document.getElementById('comment-count');
    if (badge) badge.textContent = annotations.length;
  }

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

  function setInspectMode(active) {
    inspectMode = active;
    document.body.classList.toggle('inspect-mode', active);
    const toggle = document.getElementById('inspect-toggle');
    if (toggle) toggle.classList.toggle('active', active);

    // Deactivate comment mode if activating inspect
    if (active && commentMode) setCommentMode(false);

    if (!active && inspectTooltip) {
      inspectTooltip.remove();
      inspectTooltip = null;
    }
  }

  function setTuneMode(active) {
    tuneMode = active;
    document.body.classList.toggle('tune-mode', active);
    const toggle = document.getElementById('tune-toggle');
    if (toggle) toggle.classList.toggle('active', active);

    if (active) {
      if (commentMode) setCommentMode(false);
      if (inspectMode) setInspectMode(false);
    } else {
      closeTunePanel();
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'C') {
      e.preventDefault();
      if (inspectMode) setInspectMode(false);
      setCommentMode(!commentMode);
    }
    if (e.shiftKey && e.key === 'I') {
      e.preventDefault();
      if (commentMode) setCommentMode(false);
      setInspectMode(!inspectMode);
    }
    if (e.shiftKey && e.key === 'T') {
      e.preventDefault();
      if (commentMode) setCommentMode(false);
      if (inspectMode) setInspectMode(false);
      setTuneMode(!tuneMode);
    }
    if (e.shiftKey && e.key === 'D') {
      e.preventDefault();
      if (commentMode) setCommentMode(false);
      if (inspectMode) setInspectMode(false);
      if (tuneMode) setTuneMode(false);
      setThemeMode(!themeMode);
    }
    if (e.key === 'Escape') {
      if (sidebarOpen) {
        e.preventDefault();
        toggleSidebar(false);
      } else if (commentMode || inspectMode || tuneMode || themeMode) {
        e.preventDefault();
        setCommentMode(false);
        setInspectMode(false);
        setTuneMode(false);
        setThemeMode(false);
      }
    }
    if (e.shiftKey && e.key === 'A' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      toggleSidebar();
    }
    if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      sendAnnotations();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
      if (undoStack.length > 0) {
        e.preventDefault();
        const action = undoStack.pop();
        if (action.isToken) {
          redoStack.push({ element: action.element, prop: action.prop, oldValue: action.element.style.getPropertyValue(action.prop) || '', isToken: true });
          if (action.oldValue) {
            action.element.style.setProperty(action.prop, action.oldValue);
          } else {
            action.element.style.removeProperty(action.prop);
          }
        } else {
          redoStack.push({ element: action.element, prop: action.prop, oldValue: action.element.style[action.prop] || '' });
          action.element.style[action.prop] = action.oldValue;
        }
        showToast('Undo: ' + action.prop);
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
      if (redoStack.length > 0) {
        e.preventDefault();
        const action = redoStack.pop();
        if (action.isToken) {
          undoStack.push({ element: action.element, prop: action.prop, oldValue: action.element.style.getPropertyValue(action.prop) || '', isToken: true });
          if (action.oldValue) {
            action.element.style.setProperty(action.prop, action.oldValue);
          } else {
            action.element.style.removeProperty(action.prop);
          }
        } else {
          undoStack.push({ element: action.element, prop: action.prop, oldValue: action.element.style[action.prop] || '' });
          action.element.style[action.prop] = action.oldValue;
        }
        showToast('Redo: ' + action.prop);
      }
    }
  });

  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('#comment-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      setCommentMode(!commentMode);
    }
  });

  // ===== PIN RENDERING =====
  function createPinElement(annotation, index) {
    const pin = document.createElement('div');
    pin.className = 'annotation-pin';
    pin.dataset.annotationId = annotation.id;
    pin.dataset.status = annotation.status;
    pin.innerHTML = '<div class="pin-body"><span class="pin-number">' + (index + 1) + '</span></div>';

    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      if (commentMode) {
        showPopover(annotation, pin);
      }
    });

    return pin;
  }

  function renderAllPins() {
    document.querySelectorAll('.annotation-pin').forEach(p => p.remove());

    const root = document.getElementById('claude-content');
    if (!root) return;

    // Ensure root is positioned for absolute pin placement
    const rootPos = window.getComputedStyle(root).position;
    if (rootPos === 'static') root.style.position = 'relative';

    annotations.forEach((ann, i) => {
      const pin = createPinElement(ann, i);
      pin.style.left = ann.position.x + 'px';
      pin.style.top = ann.position.y + 'px';
      root.appendChild(pin);
    });
  }

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
    hint.textContent = 'Enter to save \u00b7 Esc to cancel';
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

    const rect = anchorEl.getBoundingClientRect();
    popover.style.position = 'fixed';
    popover.style.left = Math.min(rect.left, window.innerWidth - 340) + 'px';

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
        if (annotation && annotation.id && !annotation.note) {
          deleteAnnotation(annotation.id);
        }
        closePopover();
      }
    });

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

  // ===== SIDEBAR =====
  let sidebarOpen = false;

  function createSidebar() {
    let sidebar = document.querySelector('.annotation-sidebar');
    if (sidebar) return sidebar;

    sidebar = document.createElement('div');
    sidebar.className = 'annotation-sidebar';

    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = '<h3>Changes <span id="sidebar-count"></span></h3>';

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
    const totalCount = annotations.length + tuneChanges.length;
    if (count) count.textContent = '(' + totalCount + ')';

    list.innerHTML = '';

    if (totalCount === 0) {
      list.innerHTML = '<div class="sidebar-empty">No changes yet.<br>Use Comment, Inspect, or Tune to get started.</div>';
      return;
    }

    // Build unified list of all changes
    const allChanges = [];

    annotations.forEach((ann, i) => {
      allChanges.push({
        type: 'comment',
        id: ann.id,
        element: '<' + ann.tag + '> ' + (ann.text || '').slice(0, 40),
        detail: ann.note || '(no note)',
        timestamp: ann.timestamp,
        index: i,
        data: ann
      });
    });

    tuneChanges.forEach((tc, i) => {
      const propList = Object.keys(tc.changes).map(p => p + ': ' + tc.changes[p]).join(', ');
      allChanges.push({
        type: 'tune',
        id: 'tune-' + i,
        element: '<' + tc.tag + '> ' + (tc.text || '').slice(0, 40),
        detail: propList,
        timestamp: tc.timestamp || Date.now(),
        index: i,
        data: tc
      });
    });

    // Sort by timestamp
    allChanges.sort((a, b) => a.timestamp - b.timestamp);

    allChanges.forEach(change => {
      const card = document.createElement('div');
      card.className = 'sidebar-card';
      card.dataset.changeType = change.type;

      const cardHeader = document.createElement('div');
      cardHeader.className = 'sidebar-card-header';

      const typeIcon = document.createElement('span');
      typeIcon.className = 'sidebar-type-icon';
      typeIcon.textContent = change.type === 'comment' ? '💬' : '🎛';

      const elDesc = document.createElement('span');
      elDesc.className = 'sidebar-element';
      elDesc.textContent = change.element;

      cardHeader.appendChild(typeIcon);
      cardHeader.appendChild(elDesc);
      card.appendChild(cardHeader);

      const note = document.createElement('div');
      note.className = 'sidebar-note';
      note.textContent = change.detail;
      card.appendChild(note);

      const actions = document.createElement('div');
      actions.className = 'sidebar-card-actions';

      const del = document.createElement('button');
      del.className = 'sidebar-action delete';
      del.textContent = 'Remove';
      del.addEventListener('click', () => {
        if (change.type === 'comment') {
          deleteAnnotation(change.data.id);
        } else {
          tuneChanges.splice(change.index, 1);
          saveAnnotations();
          renderSidebar();
        }
      });
      actions.appendChild(del);

      card.appendChild(actions);

      if (change.type === 'comment') {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.sidebar-action')) return;
          const pin = document.querySelector('[data-annotation-id="' + change.data.id + '"]');
          if (pin) pin.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }

      list.appendChild(card);
    });
  }

  function toggleSidebar(forceState) {
    sidebarOpen = forceState !== undefined ? forceState : !sidebarOpen;
    const sidebar = createSidebar();
    sidebar.classList.toggle('open', sidebarOpen);
    if (sidebarOpen) renderSidebar();
  }

  function sendAnnotations() {
    if (annotations.length === 0 && tuneChanges.length === 0) return;

    const payload = annotations.map(a => ({
      type: 'annotation',
      id: a.id,
      selector: a.selector,
      tag: a.tag,
      text: a.text,
      note: a.note,
      status: a.status,
      timestamp: a.timestamp
    }));

    // Include tune changes as a special annotation type
    tuneChanges.forEach(tc => {
      payload.push({
        type: 'tune',
        selector: tc.selector,
        tag: tc.tag,
        text: tc.text,
        changes: tc.changes,
        tokenChanges: tc.tokenChanges || {},
        timestamp: Date.now()
      });
    });

    // Add consolidated theme state if any theme changes were made
    if (themeState && themeState.system) {
      const data = window.THEME_DATA;
      const palette = data ? data.palettes.find(p => p.key === themeState.system) : null;
      if (palette) {
        const allTokens = {};
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

    sendEvent({ type: 'annotations', items: payload });

    const totalCount = annotations.length + tuneChanges.length;
    annotations = [];
    tuneChanges = [];
    saveAnnotations();
    renderAllPins();
    renderSidebar();
    showToast(totalCount + ' update' + (totalCount !== 1 ? 's' : '') + ' sent to Claude. Return to terminal to process.');
  }

  function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ===== INSPECT MODE =====
  function getDesignProperties(el) {
    const cs = window.getComputedStyle(el);
    const props = [];

    // Dimensions
    const w = Math.round(el.getBoundingClientRect().width);
    const h = Math.round(el.getBoundingClientRect().height);
    props.push({ label: 'Size', value: w + ' × ' + h + 'px' });

    // Typography (only for elements with text)
    if (el.childNodes.length > 0 && Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())) {
      props.push({ label: 'Font', value: cs.fontSize + ' / ' + cs.lineHeight + ' · ' + cs.fontWeight });
      const family = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
      props.push({ label: 'Family', value: family });
      if (cs.letterSpacing !== 'normal') props.push({ label: 'Tracking', value: cs.letterSpacing });
    }

    // Colors
    if (cs.color && cs.color !== 'rgba(0, 0, 0, 0)') {
      props.push({ label: 'Color', value: rgbToHex(cs.color), color: cs.color });
    }
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
      props.push({ label: 'Background', value: rgbToHex(cs.backgroundColor), color: cs.backgroundColor });
    }

    // Spacing
    const padding = cs.padding;
    if (padding && padding !== '0px') {
      props.push({ label: 'Padding', value: formatSpacing(cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft) });
    }
    const margin = cs.margin;
    if (margin && margin !== '0px') {
      props.push({ label: 'Margin', value: formatSpacing(cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft) });
    }

    // Border
    if (cs.borderWidth && cs.borderWidth !== '0px' && cs.borderStyle !== 'none') {
      let borderStr = cs.borderWidth + ' ' + cs.borderStyle;
      if (cs.borderColor) borderStr += ' ' + rgbToHex(cs.borderColor);
      props.push({ label: 'Border', value: borderStr });
    }

    // Border radius
    if (cs.borderRadius && cs.borderRadius !== '0px') {
      props.push({ label: 'Radius', value: cs.borderRadius });
    }

    // Opacity
    if (cs.opacity !== '1') {
      props.push({ label: 'Opacity', value: cs.opacity });
    }

    // Box shadow
    if (cs.boxShadow && cs.boxShadow !== 'none') {
      props.push({ label: 'Shadow', value: 'present' });
    }

    return props;
  }

  function rgbToHex(rgb) {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return rgb;
    return '#' + [match[1], match[2], match[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  }

  function formatSpacing(top, right, bottom, left) {
    if (top === right && right === bottom && bottom === left) return top;
    if (top === bottom && left === right) return top + ' ' + right;
    return top + ' ' + right + ' ' + bottom + ' ' + left;
  }

  function showInspectTooltip(el, e) {
    if (inspectTooltip) inspectTooltip.remove();

    const props = getDesignProperties(el);
    if (props.length === 0) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'inspect-tooltip';

    // Element tag line
    const tagLine = document.createElement('div');
    tagLine.className = 'inspect-tag';
    const tag = el.tagName.toLowerCase();
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).filter(c => !c.startsWith('inspect-')).slice(0, 2).join('.')
      : '';
    tagLine.textContent = tag + cls;
    tooltip.appendChild(tagLine);

    props.forEach(p => {
      const row = document.createElement('div');
      row.className = 'inspect-row';
      const label = document.createElement('span');
      label.className = 'inspect-label';
      label.textContent = p.label;
      const value = document.createElement('span');
      value.className = 'inspect-value';
      if (p.color) {
        const swatch = document.createElement('span');
        swatch.className = 'inspect-swatch';
        swatch.style.background = p.color;
        value.appendChild(swatch);
      }
      value.appendChild(document.createTextNode(p.value));
      row.appendChild(label);
      row.appendChild(value);
      tooltip.appendChild(row);
    });

    // Position near cursor
    tooltip.style.left = Math.min(e.clientX + 16, window.innerWidth - 280) + 'px';
    tooltip.style.top = Math.min(e.clientY + 16, window.innerHeight - 300) + 'px';

    document.body.appendChild(tooltip);
    inspectTooltip = tooltip;
  }

  // Inspect hover handler
  document.addEventListener('mousemove', (e) => {
    if (!inspectMode) return;

    const ignore = e.target.closest('#dc-header, .indicator-bar, .annotation-pin, .annotation-popover, .annotation-sidebar, .inspect-tooltip');
    if (ignore) {
      if (inspectTooltip) { inspectTooltip.remove(); inspectTooltip = null; }
      document.querySelectorAll('.inspect-highlight').forEach(el => el.classList.remove('inspect-highlight'));
      return;
    }

    const root = document.getElementById('claude-content');
    if (!root) return;

    let target = e.target;
    if (!root.contains(target) && target !== root) {
      if (inspectTooltip) { inspectTooltip.remove(); inspectTooltip = null; }
      document.querySelectorAll('.inspect-highlight').forEach(el => el.classList.remove('inspect-highlight'));
      return;
    }

    // Highlight the hovered element
    document.querySelectorAll('.inspect-highlight').forEach(el => el.classList.remove('inspect-highlight'));
    if (target !== root) target.classList.add('inspect-highlight');

    showInspectTooltip(target, e);
  });

  // Clear inspect on mouse leave
  document.addEventListener('mouseleave', () => {
    if (inspectTooltip) { inspectTooltip.remove(); inspectTooltip = null; }
    document.querySelectorAll('.inspect-highlight').forEach(el => el.classList.remove('inspect-highlight'));
  });

  // ===== TUNE MODE =====
  function closeTunePanel() {
    if (tuneStyleObserver) { tuneStyleObserver.disconnect(); tuneStyleObserver = null; }
    const panel = document.querySelector('.tune-panel');
    if (panel) panel.remove();
    // Revert unapplied changes
    if (tuneTarget && Object.keys(tuneOriginalStyles).length > 0) {
      Object.keys(tuneOriginalStyles).forEach(key => {
        if (key.startsWith('token:')) {
          const tokenName = key.slice(6);
          if (tuneOriginalStyles[key]) {
            document.documentElement.style.setProperty(tokenName, tuneOriginalStyles[key]);
          } else {
            document.documentElement.style.removeProperty(tokenName);
          }
        } else {
          tuneTarget.style[key] = tuneOriginalStyles[key];
        }
      });
    }
    tuneTarget = null;
    tuneOriginalStyles = {};
    document.querySelectorAll('.tune-highlight').forEach(el => el.classList.remove('tune-highlight'));
  }

  function openTunePanel(el) {
    closeTunePanel();
    tuneTarget = el;
    tuneOriginalStyles = {};
    el.classList.add('tune-highlight');
    setTimeout(() => el.classList.add('faded'), 2000);

    const cs = window.getComputedStyle(el);
    const panel = document.createElement('div');
    panel.className = 'tune-panel';

    const header = document.createElement('div');
    header.className = 'tune-header';
    const tag = el.tagName.toLowerCase();
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).filter(c => !c.startsWith('tune-') && !c.startsWith('inspect-')).slice(0, 2).join('.')
      : '';
    header.innerHTML = '<span class="tune-tag">' + tag + cls + '</span>';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tune-close';
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => closeTunePanel());
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.className = 'tune-tabs';
    const tabNames = ['Typography', 'Spacing', 'Colors', 'Shadow', 'Border'];
    const tabPanels = {};

    tabNames.forEach((name, i) => {
      const tab = document.createElement('button');
      tab.className = 'tune-tab' + (i === 0 ? ' active' : '');
      tab.textContent = name;
      tab.addEventListener('click', () => {
        tabBar.querySelectorAll('.tune-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Object.values(tabPanels).forEach(p => p.style.display = 'none');
        tabPanels[name].style.display = '';
      });
      tabBar.appendChild(tab);
    });
    panel.appendChild(tabBar);

    // Global apply toggle (lives in apply bar)
    let applyGlobally = false;

    // Typography tab
    const typographyPanel = document.createElement('div');
    typographyPanel.className = 'tune-controls';
    const fontSize = parseFloat(cs.fontSize);
    const fontSizeToken = resolveToken(el, 'font-size');
    typographyPanel.appendChild(createSlider('Font Size', 'fontSize', fontSize, 8, 72, 'px', 1, fontSizeToken));
    const fontWeight = parseInt(cs.fontWeight) || 400;
    const fontWeightToken = resolveToken(el, 'font-weight');
    typographyPanel.appendChild(createSlider('Weight', 'fontWeight', fontWeight, 100, 900, '', 100, fontWeightToken));
    const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.5;
    const lineHeightToken = resolveToken(el, 'line-height');
    typographyPanel.appendChild(createSlider('Line Height', 'lineHeight', lineHeight, 8, 80, 'px', 1, lineHeightToken));
    const letterSpacing = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
    const letterSpacingToken = resolveToken(el, 'letter-spacing');
    typographyPanel.appendChild(createSlider('Tracking', 'letterSpacing', letterSpacing, -2, 10, 'px', 0.1, letterSpacingToken));
    const opacity = parseFloat(cs.opacity);
    typographyPanel.appendChild(createSlider('Opacity', 'opacity', opacity, 0, 1, '', 0.05));
    tabPanels['Typography'] = typographyPanel;
    panel.appendChild(typographyPanel);

    // Spacing tab
    const spacingPanel = document.createElement('div');
    spacingPanel.className = 'tune-controls';
    spacingPanel.style.display = 'none';
    const paddingTop = parseFloat(cs.paddingTop) || 0;
    const paddingToken = resolveToken(el, 'padding');
    spacingPanel.appendChild(createSlider('Padding', 'padding', paddingTop, 0, 80, 'px', 1, paddingToken));
    const marginTop = parseFloat(cs.marginTop) || 0;
    const marginToken = resolveToken(el, 'margin');
    spacingPanel.appendChild(createSlider('Margin', 'margin', marginTop, 0, 80, 'px', 1, marginToken));
    tabPanels['Spacing'] = spacingPanel;
    panel.appendChild(spacingPanel);

    // Colors tab
    const colorsPanel = document.createElement('div');
    colorsPanel.className = 'tune-controls';
    colorsPanel.style.display = 'none';
    const color = rgbToHex(cs.color);
    const colorToken = resolveToken(el, 'color');
    colorsPanel.appendChild(createColorPicker('Color', 'color', color, colorToken));
    const bgColor = cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent' ? '#ffffff' : rgbToHex(cs.backgroundColor);
    const bgColorToken = resolveToken(el, 'background-color');
    colorsPanel.appendChild(createColorPicker('Background', 'backgroundColor', bgColor, bgColorToken));
    tabPanels['Colors'] = colorsPanel;
    panel.appendChild(colorsPanel);

    // Shadow tab
    const shadowPanel = document.createElement('div');
    shadowPanel.className = 'tune-controls';
    shadowPanel.style.display = 'none';

    const shadowRamps = {
      'Tailwind': [
        { label: 'none', value: 'none' },
        { label: 'xs', value: '0 1px 2px 0 rgba(0,0,0,0.05)' },
        { label: 'sm', value: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)' },
        { label: 'md', value: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' },
        { label: 'lg', value: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' },
        { label: 'xl', value: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' },
        { label: '2xl', value: '0 25px 50px -12px rgba(0,0,0,0.25)' }
      ],
      'Material': [
        { label: '0', value: 'none' },
        { label: '1', value: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' },
        { label: '2', value: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)' },
        { label: '3', value: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)' },
        { label: '4', value: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)' },
        { label: '5', value: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)' }
      ],
      'Apple': [
        { label: 'none', value: 'none' },
        { label: 'subtle', value: '0 0.5px 1px rgba(0,0,0,0.1)' },
        { label: 'small', value: '0 2px 8px rgba(0,0,0,0.12)' },
        { label: 'medium', value: '0 4px 16px rgba(0,0,0,0.12)' },
        { label: 'large', value: '0 8px 32px rgba(0,0,0,0.14)' },
        { label: 'prominent', value: '0 16px 48px rgba(0,0,0,0.2)' }
      ],
      'Chakra': [
        { label: 'none', value: 'none' },
        { label: 'xs', value: '0 1px 2px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)' },
        { label: 'sm', value: '0 2px 4px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.3)' },
        { label: 'md', value: '0 4px 8px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.3)' },
        { label: 'lg', value: '0 8px 16px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.3)' },
        { label: 'xl', value: '0 16px 24px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.3)' },
        { label: '2xl', value: '0 24px 40px rgba(0,0,0,0.16), 0 0 1px rgba(0,0,0,0.3)' }
      ],
      'Polaris': [
        { label: '0', value: 'none' },
        { label: '100', value: '0 1px 0 0 rgba(26,26,26,0.07)' },
        { label: '200', value: '0 3px 1px -1px rgba(26,26,26,0.07)' },
        { label: '300', value: '0 4px 6px -2px rgba(26,26,26,0.2)' },
        { label: '400', value: '0 8px 16px -4px rgba(26,26,26,0.22)' },
        { label: '500', value: '0 12px 20px -8px rgba(26,26,26,0.24)' },
        { label: '600', value: '0 20px 20px -8px rgba(26,26,26,0.28)' }
      ],
      'Stripe': [
        { label: 'none', value: 'none' },
        { label: '1', value: '0 2px 5px rgba(50,50,93,0.09), 0 1px 2px rgba(0,0,0,0.07)' },
        { label: '2', value: '0 4px 6px rgba(50,50,93,0.09), 0 1px 3px rgba(0,0,0,0.08)' },
        { label: '3', value: '0 7px 14px rgba(50,50,93,0.1), 0 3px 6px rgba(0,0,0,0.07)' },
        { label: '4', value: '0 15px 35px rgba(50,50,93,0.1), 0 5px 15px rgba(0,0,0,0.07)' },
        { label: '5', value: '0 15px 35px rgba(50,50,93,0.15), 0 5px 15px rgba(0,0,0,0.1)' }
      ],
      'Bootstrap': [
        { label: 'none', value: 'none' },
        { label: 'sm', value: '0 2px 4px rgba(0,0,0,0.075)' },
        { label: 'base', value: '0 8px 16px rgba(0,0,0,0.15)' },
        { label: 'lg', value: '0 16px 48px rgba(0,0,0,0.175)' }
      ],
      'Ant Design': [
        { label: 'none', value: 'none' },
        { label: 'tertiary', value: '0 1px 2px rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.02)' },
        { label: 'primary', value: '0 6px 16px rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12), 0 9px 28px 8px rgba(0,0,0,0.05)' },
        { label: 'card', value: '0 1px 2px -2px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.12), 0 5px 12px 4px rgba(0,0,0,0.09)' }
      ],
      'Atlassian': [
        { label: 'none', value: 'none' },
        { label: 'raised', value: '0 1px 1px rgba(30,31,33,0.25), 0 0 1px rgba(30,31,33,0.31)' },
        { label: 'overlay', value: '0 8px 12px rgba(30,31,33,0.15), 0 0 1px rgba(30,31,33,0.31)' }
      ]
    };

    let activeRamp = 'Tailwind';

    // Ramp dropdown selector
    const rampSelector = document.createElement('div');
    rampSelector.className = 'shadow-ramp-selector';
    const rampSelect = document.createElement('select');
    rampSelect.className = 'shadow-ramp-select';
    Object.keys(shadowRamps).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      if (name === activeRamp) opt.selected = true;
      rampSelect.appendChild(opt);
    });
    rampSelect.addEventListener('change', () => {
      activeRamp = rampSelect.value;
      renderShadowPresets();
    });
    rampSelector.appendChild(rampSelect);
    shadowPanel.appendChild(rampSelector);

    // Detect if target element has a dark background
    function isDarkBackground(el) {
      const bg = window.getComputedStyle(el).backgroundColor;
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return false;
      const luminance = (0.299 * parseInt(match[1]) + 0.587 * parseInt(match[2]) + 0.114 * parseInt(match[3])) / 255;
      return luminance < 0.5;
    }

    // Boost shadow opacity for dark backgrounds
    function adaptShadow(shadowValue, forDark) {
      if (shadowValue === 'none') return 'none';
      if (!forDark) return shadowValue;
      return shadowValue.replace(/rgba?\(([^)]+)\)/g, (match, inner) => {
        const parts = inner.split(',').map(s => s.trim());
        if (parts.length === 4) {
          const alpha = Math.min(parseFloat(parts[3]) * 2.5, 0.7);
          return 'rgba(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + alpha.toFixed(2) + ')';
        }
        return match;
      });
    }

    const targetIsDark = isDarkBackground(tuneTarget);

    // Preset grid
    const presetGrid = document.createElement('div');
    presetGrid.className = 'shadow-presets';
    shadowPanel.appendChild(presetGrid);

    function renderShadowPresets() {
      presetGrid.innerHTML = '';
      const adaptedShadows = shadowRamps[activeRamp].map(preset => ({
        label: preset.label,
        value: preset.value,
        adapted: adaptShadow(preset.value, targetIsDark)
      }));

      adaptedShadows.forEach(preset => {
        const swatch = document.createElement('div');
        swatch.className = 'shadow-swatch';
        const currentShadow = tuneTarget.style.boxShadow || '';
        if (currentShadow === preset.adapted || (preset.value === 'none' && !currentShadow)) {
          swatch.classList.add('active');
        }

        // Show preview on both light and dark backgrounds
        const previewRow = document.createElement('div');
        previewRow.className = 'shadow-preview-row';

        const lightPreview = document.createElement('div');
        lightPreview.className = 'shadow-preview shadow-preview-light';
        lightPreview.style.boxShadow = preset.value === 'none' ? 'none' : preset.value;

        const darkPreview = document.createElement('div');
        darkPreview.className = 'shadow-preview shadow-preview-dark';
        darkPreview.style.boxShadow = preset.value === 'none' ? 'none' : adaptShadow(preset.value, true);

        previewRow.appendChild(lightPreview);
        previewRow.appendChild(darkPreview);

        const label = document.createElement('span');
        label.className = 'shadow-label';
        label.textContent = preset.label;

        swatch.appendChild(previewRow);
        swatch.appendChild(label);

        swatch.addEventListener('click', () => {
          if (!tuneOriginalStyles.hasOwnProperty('boxShadow')) {
            tuneOriginalStyles['boxShadow'] = tuneTarget.style.boxShadow || '';
          }
          const oldVal = tuneTarget.style.boxShadow || '';
          const shadowVal = preset.adapted === 'none' ? 'none' : preset.adapted;
          tuneTarget.style.boxShadow = shadowVal;
          applyToMatching('boxShadow', shadowVal);
          undoStack.push({ element: tuneTarget, prop: 'boxShadow', oldValue: oldVal });
          redoStack = [];
          presetGrid.querySelectorAll('.shadow-swatch').forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
        });

        presetGrid.appendChild(swatch);
      });
    }
    renderShadowPresets();

    tabPanels['Shadow'] = shadowPanel;
    panel.appendChild(shadowPanel);

    // Border tab
    const borderPanel = document.createElement('div');
    borderPanel.className = 'tune-controls';
    borderPanel.style.display = 'none';
    const borderRadius = parseFloat(cs.borderRadius) || 0;
    const borderRadiusToken = resolveToken(el, 'border-radius');
    borderPanel.appendChild(createSlider('Radius', 'borderRadius', borderRadius, 0, 50, 'px', 1, borderRadiusToken));
    const borderWidth = parseFloat(cs.borderWidth) || 0;
    const borderWidthToken = resolveToken(el, 'border-width');
    borderPanel.appendChild(createSlider('Width', 'borderWidth', borderWidth, 0, 10, 'px', 1, borderWidthToken));
    tabPanels['Border'] = borderPanel;
    panel.appendChild(borderPanel);

    // Global apply: mirror changes to all matching elements
    function findMatchingElements() {
      const root = document.getElementById('claude-content');
      if (!root) return [];
      const targetTag = tuneTarget.tagName;
      const targetClasses = Array.from(tuneTarget.classList).filter(c => !c.startsWith('tune-') && !c.startsWith('inspect-') && !c.startsWith('faded'));
      const matches = [];

      if (targetClasses.length > 0) {
        // Match by first (base) class — e.g., .metric-card, not .metric-card--revenue
        const baseClass = targetClasses[0];
        root.querySelectorAll(targetTag + '.' + baseClass).forEach(el => {
          if (el !== tuneTarget) matches.push(el);
        });
      } else {
        // No classes — match by same parent and same tag (sibling elements)
        root.querySelectorAll(targetTag).forEach(el => {
          if (el !== tuneTarget && el.parentElement === tuneTarget.parentElement) matches.push(el);
        });
      }
      return matches;
    }

    function applyToMatching(prop, value) {
      if (!applyGlobally) return;
      findMatchingElements().forEach(el => { el.style[prop] = value; });
    }

    // Observe style changes on tuneTarget to mirror them
    tuneStyleObserver = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.attributeName === 'style' && applyGlobally) {
          Object.keys(tuneOriginalStyles).forEach(prop => {
            applyToMatching(prop, tuneTarget.style[prop]);
          });
        }
      });
    });
    tuneStyleObserver.observe(tuneTarget, { attributes: true, attributeFilter: ['style'] });

    // Apply button
    const applyBar = document.createElement('div');
    applyBar.className = 'tune-apply-bar';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'tune-reset';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => {
      Object.keys(tuneOriginalStyles).forEach(prop => {
        tuneTarget.style[prop] = tuneOriginalStyles[prop];
      });
      tuneOriginalStyles = {};
      tuneChanges = tuneChanges.filter(c => c.selector !== generateSelector(tuneTarget));
      closeTunePanel();
    });

    const applyBtn = document.createElement('button');
    applyBtn.className = 'tune-apply';
    applyBtn.textContent = 'Apply Changes';
    applyBtn.addEventListener('click', () => {
      // Collect current changes for this element
      const selector = generateSelector(tuneTarget) || '#claude-content';
      const changes = {};
      const tokenChanges = {};
      Object.keys(tuneOriginalStyles).forEach(key => {
        if (key.startsWith('token:')) {
          const tokenName = key.slice(6);
          tokenChanges[tokenName] = document.documentElement.style.getPropertyValue(tokenName).trim();
        } else {
          changes[key] = tuneTarget.style[key] || window.getComputedStyle(tuneTarget)[key];
        }
      });
      // Remove old changes for this element, add new
      tuneChanges = tuneChanges.filter(c => c.selector !== selector);
      tuneChanges.push({
        selector: selector,
        tag: tuneTarget.tagName.toLowerCase(),
        text: (tuneTarget.textContent || '').trim().slice(0, 60),
        changes: changes,
        tokenChanges: tokenChanges,
        timestamp: Date.now()
      });

      // If global, record changes for matching elements too
      if (applyGlobally) {
        findMatchingElements().forEach(el => {
          const elSelector = generateSelector(el) || selector;
          tuneChanges.push({
            selector: elSelector,
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 60),
            changes: Object.assign({}, changes),
            timestamp: Date.now()
          });
        });
      }

      tuneOriginalStyles = {}; // Mark as committed
      const flashEl = tuneTarget;
      closeTunePanel();
      saveAnnotations(); // Update send button visibility
      renderSidebar();
      // Flash the element to confirm
      if (flashEl) {
        flashEl.classList.remove('tune-highlight', 'faded');
        flashEl.classList.add('tune-highlight-flash');
        flashEl.offsetHeight; // force reflow
        setTimeout(() => {
          flashEl.classList.add('faded');
          setTimeout(() => flashEl.classList.remove('tune-highlight-flash', 'faded'), 500);
        }, 50);
      }
      showToast('Changes added to staged changes.');
    });

    const globalLabel = document.createElement('label');
    globalLabel.className = 'tune-global-label';
    const baseClasses = el.className && typeof el.className === 'string'
      ? el.className.trim().split(/\s+/).filter(c => !c.startsWith('tune-') && !c.startsWith('inspect-'))
      : [];
    const baseLabel = baseClasses.length > 0 ? tag + '.' + baseClasses[0] : tag;
    globalLabel.innerHTML = '<input type="checkbox" id="tune-global-check"> ' +
      '<span>Apply to all <code>' + baseLabel + '</code></span>';
    const globalCheck = globalLabel.querySelector('#tune-global-check');
    globalCheck.addEventListener('change', () => {
      applyGlobally = globalCheck.checked;
      // Immediately apply current changes to matching elements
      if (applyGlobally) {
        Object.keys(tuneOriginalStyles).forEach(prop => {
          applyToMatching(prop, tuneTarget.style[prop]);
        });
      }
    });
    applyBar.appendChild(globalLabel);
    applyBar.appendChild(resetBtn);
    applyBar.appendChild(applyBtn);
    panel.appendChild(applyBar);

    document.body.appendChild(panel);
  }

  // ===== TOKEN RESOLUTION =====
  function resolveToken(el, cssProp) {
    // Check if a computed CSS property comes from a CSS custom property
    // by scanning all stylesheets for rules matching this element
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
      try {
        const rules = sheets[i].cssRules || [];
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (!rule.selectorText || !el.matches(rule.selectorText)) continue;
          const value = rule.style.getPropertyValue(cssProp) ||
                        rule.style.getPropertyValue(cssPropToKebab(cssProp));
          if (value && value.trim().startsWith('var(')) {
            const match = value.trim().match(/var\(\s*(--[^,)]+)/);
            if (match) {
              return {
                token: match[1].trim(),
                computedValue: window.getComputedStyle(el).getPropertyValue(cssPropToKebab(cssProp)).trim()
              };
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheets throw SecurityError
        continue;
      }
    }
    return null;
  }

  function cssPropToKebab(prop) {
    return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  function createSlider(label, prop, value, min, max, unit, step, tokenInfo) {
    step = step || 1;
    const row = document.createElement('div');
    row.className = 'tune-row';

    const lbl = document.createElement('label');
    lbl.className = 'tune-label';
    if (tokenInfo) {
      lbl.innerHTML = label + ' <code class="tune-token-name">' + tokenInfo.token + '</code>';
    } else {
      lbl.textContent = label;
    }

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'tune-slider';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;

    const val = document.createElement('span');
    val.className = 'tune-value';
    val.textContent = (step < 1 ? value.toFixed(2) : Math.round(value)) + unit;

    let beforeDrag = '';
    slider.addEventListener('mousedown', () => {
      if (tokenInfo) {
        beforeDrag = document.documentElement.style.getPropertyValue(tokenInfo.token) || '';
      } else {
        beforeDrag = tuneTarget.style[prop] || '';
      }
    });
    slider.addEventListener('input', () => {
      const newVal = parseFloat(slider.value);
      val.textContent = (step < 1 ? newVal.toFixed(2) : Math.round(newVal)) + unit;
      if (tokenInfo) {
        // Adjust the token on :root — cascades to all elements using it
        if (!tuneOriginalStyles.hasOwnProperty('token:' + tokenInfo.token)) {
          tuneOriginalStyles['token:' + tokenInfo.token] = document.documentElement.style.getPropertyValue(tokenInfo.token) || '';
        }
        document.documentElement.style.setProperty(tokenInfo.token, newVal + unit);
      } else {
        if (!tuneOriginalStyles.hasOwnProperty(prop)) {
          tuneOriginalStyles[prop] = tuneTarget.style[prop] || '';
        }
        tuneTarget.style[prop] = newVal + unit;
      }
    });
    slider.addEventListener('change', () => {
      if (tokenInfo) {
        undoStack.push({ element: document.documentElement, prop: tokenInfo.token, oldValue: beforeDrag, isToken: true });
      } else {
        undoStack.push({ element: tuneTarget, prop: prop, oldValue: beforeDrag });
      }
      redoStack = [];
    });

    row.appendChild(lbl);
    row.appendChild(slider);
    row.appendChild(val);
    return row;
  }

  function createColorPicker(label, prop, value, tokenInfo) {
    const row = document.createElement('div');
    row.className = 'tune-row';

    const lbl = document.createElement('label');
    lbl.className = 'tune-label';
    if (tokenInfo) {
      lbl.innerHTML = label + ' <code class="tune-token-name">' + tokenInfo.token + '</code>';
    } else {
      lbl.textContent = label;
    }

    const picker = document.createElement('input');
    picker.type = 'color';
    picker.className = 'tune-color';
    picker.value = value;

    const val = document.createElement('span');
    val.className = 'tune-value';
    val.textContent = value;

    let beforeColor = '';
    picker.addEventListener('focus', () => {
      if (tokenInfo) {
        beforeColor = document.documentElement.style.getPropertyValue(tokenInfo.token) || '';
      } else {
        beforeColor = tuneTarget.style[prop] || '';
      }
    });
    picker.addEventListener('input', () => {
      val.textContent = picker.value;
      if (tokenInfo) {
        if (!tuneOriginalStyles.hasOwnProperty('token:' + tokenInfo.token)) {
          tuneOriginalStyles['token:' + tokenInfo.token] = document.documentElement.style.getPropertyValue(tokenInfo.token) || '';
        }
        document.documentElement.style.setProperty(tokenInfo.token, picker.value);
      } else {
        if (!tuneOriginalStyles.hasOwnProperty(prop)) {
          tuneOriginalStyles[prop] = tuneTarget.style[prop] || '';
        }
        tuneTarget.style[prop] = picker.value;
      }
    });
    picker.addEventListener('change', () => {
      if (tokenInfo) {
        undoStack.push({ element: document.documentElement, prop: tokenInfo.token, oldValue: beforeColor, isToken: true });
      } else {
        undoStack.push({ element: tuneTarget, prop: prop, oldValue: beforeColor });
      }
      redoStack = [];
    });

    row.appendChild(lbl);
    row.appendChild(picker);
    row.appendChild(val);
    return row;
  }

  // Tune click handler — click element to open tune panel
  document.addEventListener('click', (e) => {
    if (!tuneMode) return;

    const ignore = e.target.closest('#dc-header, .indicator-bar, .tune-panel, .annotation-sidebar, .annotation-popover, .annotation-pin');
    if (ignore) return;

    const root = document.getElementById('claude-content');
    if (!root) return;
    if (!root.contains(e.target) && e.target !== root) return;

    e.preventDefault();
    e.stopPropagation();

    let target = e.target;
    if (target === root) return; // Don't tune the container itself

    openTunePanel(target);
  }, true);

  // ===== COLOR UTILITIES (for Theme panel) =====
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return [parseInt(hex.slice(0,2), 16), parseInt(hex.slice(2,4), 16), parseInt(hex.slice(4,6), 16)];
  }
  function numToHex(r, g, b) {
    return '#' + [r,g,b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
  }
  function themeRelativeLuminance(hex) {
    const [r, g, b] = hexToRgb(hex).map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function lightenColor(hex, percent) {
    const [r, g, b] = hexToRgb(hex);
    const amt = Math.round(2.55 * percent);
    return numToHex(r + amt, g + amt, b + amt);
  }

  // ===== THEME MODE =====
  function setThemeMode(active) {
    themeMode = active;
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.classList.toggle('active', themeMode);
    if (themeMode) {
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
    if (themePanel) { themePanel.remove(); themePanel = null; }
  }

  function createThemePanel() {
    const panel = document.createElement('div');
    panel.className = 'tune-panel theme-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'tune-header';
    header.innerHTML = '<span class="tune-tag">Theme Selector</span>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'tune-close';
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => { setThemeMode(false); });
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.className = 'tune-tabs';
    const tabNames = ['System', 'Colors', 'Fine-tune'];
    const tabPanels = {};

    tabNames.forEach((name, i) => {
      const tab = document.createElement('button');
      tab.className = 'tune-tab' + (i === 0 ? ' active' : '');
      tab.textContent = name;
      tab.addEventListener('click', () => {
        tabBar.querySelectorAll('.tune-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Object.values(tabPanels).forEach(p => p.style.display = 'none');
        tabPanels[name].style.display = '';
        if (name === 'Colors') rebuildColorsTab(panel);
        if (name === 'Fine-tune') rebuildFineTuneTab(panel);
      });
      tabBar.appendChild(tab);
    });
    panel.appendChild(tabBar);

    // System tab
    const systemTab = buildSystemTab(panel);
    systemTab.style.display = '';
    tabPanels['System'] = systemTab;
    panel.appendChild(systemTab);

    // Colors tab (placeholder)
    const colorsTab = document.createElement('div');
    colorsTab.className = 'tune-controls';
    colorsTab.style.display = 'none';
    colorsTab.innerHTML = '<div style="padding:16px;color:var(--dc-text-secondary,#888);font-size:13px;">Save a design system first to unlock color overrides.</div>';
    tabPanels['Colors'] = colorsTab;
    panel.appendChild(colorsTab);

    // Fine-tune tab (placeholder)
    const fineTuneTab = document.createElement('div');
    fineTuneTab.className = 'tune-controls';
    fineTuneTab.style.display = 'none';
    fineTuneTab.innerHTML = '<div style="padding:16px;color:var(--dc-text-secondary,#888);font-size:13px;">Save a design system first to unlock fine-tuning.</div>';
    tabPanels['Fine-tune'] = fineTuneTab;
    panel.appendChild(fineTuneTab);

    panel._tabPanels = tabPanels;
    return panel;
  }

  function buildSystemTab(panel) {
    const container = document.createElement('div');
    container.className = 'tune-controls';

    const td = window.THEME_DATA;
    if (!td || !td.palettes) {
      container.innerHTML = '<div style="padding:16px;color:#888;font-size:13px;">No theme data available.</div>';
      return container;
    }

    let previewKey = themeState.system || null;

    // Palette list
    const list = document.createElement('div');
    list.className = 'theme-palette-list';
    list.style.cssText = 'overflow-y:auto;flex:1;padding:8px 0;';

    function applyPaletteTokens(palette) {
      const cc = document.getElementById('claude-content');
      if (!cc) return;
      if (palette && palette.tokens) {
        Object.entries(palette.tokens).forEach(([key, value]) => {
          cc.style.setProperty(key, value);
        });
      }
    }

    function clearPaletteTokens(palette) {
      const cc = document.getElementById('claude-content');
      if (!cc || !palette || !palette.tokens) return;
      Object.keys(palette.tokens).forEach(key => {
        cc.style.removeProperty(key);
      });
    }

    td.palettes.forEach(palette => {
      const row = document.createElement('div');
      row.className = 'theme-palette-row';
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;border-radius:6px;transition:background 0.1s;';
      if (previewKey === palette.key) row.style.background = 'rgba(0,0,0,0.06)';

      // 5 color dots from palette tokens
      const dots = document.createElement('div');
      dots.style.cssText = 'display:flex;gap:4px;flex-shrink:0;';
      const colorProps = ['--color-primary','--color-secondary','--color-background','--color-surface','--color-text'];
      colorProps.forEach(prop => {
        const dot = document.createElement('div');
        dot.style.cssText = 'width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,0.12);flex-shrink:0;';
        const val = palette.tokens && palette.tokens[prop];
        dot.style.background = val || '#ccc';
        dots.appendChild(dot);
      });

      // Name + tier
      const nameWrap = document.createElement('div');
      nameWrap.style.cssText = 'flex:1;min-width:0;';
      const nameEl = document.createElement('div');
      nameEl.style.cssText = 'font-size:13px;font-weight:500;color:var(--dc-text,#111);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      nameEl.textContent = palette.name;
      const tierEl = document.createElement('div');
      tierEl.style.cssText = 'font-size:11px;color:var(--dc-text-secondary,#888);margin-top:1px;';
      tierEl.textContent = 'Tier ' + palette.tier;
      nameWrap.appendChild(nameEl);
      nameWrap.appendChild(tierEl);

      // Active indicator
      const check = document.createElement('div');
      check.style.cssText = 'width:16px;height:16px;flex-shrink:0;';
      if (themeState.system === palette.key) {
        check.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#0066ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }

      row.appendChild(dots);
      row.appendChild(nameWrap);
      row.appendChild(check);

      row.addEventListener('mouseenter', () => { row.style.background = 'rgba(0,0,0,0.05)'; });
      row.addEventListener('mouseleave', () => {
        row.style.background = previewKey === palette.key ? 'rgba(0,0,0,0.06)' : '';
      });

      row.addEventListener('click', () => {
        // Clear previous preview
        if (previewKey && previewKey !== palette.key) {
          const prev = td.palettes.find(p => p.key === previewKey);
          if (prev) clearPaletteTokens(prev);
        }
        previewKey = palette.key;
        applyPaletteTokens(palette);
        // Update row highlights
        list.querySelectorAll('.theme-palette-row').forEach(r => {
          r.style.background = '';
        });
        row.style.background = 'rgba(0,0,0,0.06)';
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
      });

      list.appendChild(row);
    });

    container.appendChild(list);

    // Apply bar
    const applyBar = document.createElement('div');
    applyBar.className = 'tune-apply-bar';
    applyBar.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:flex-end;';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'tune-reset';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => {
      // Remove all applied tokens from all palettes
      td.palettes.forEach(p => clearPaletteTokens(p));
      themeState.system = null;
      saveThemeState();
      previewKey = null;
      list.querySelectorAll('.theme-palette-row').forEach(r => { r.style.background = ''; });
      list.querySelectorAll('.theme-palette-row > div:last-child').forEach(c => { c.innerHTML = ''; });
      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.5';
      showToast('Design system reset.');
    });

    const saveBtn = document.createElement('button');
    saveBtn.className = 'tune-apply';
    saveBtn.textContent = 'Save System';
    const hasExisting = !!themeState.system;
    saveBtn.disabled = !hasExisting && !previewKey;
    if (!hasExisting && !previewKey) saveBtn.style.opacity = '0.5';

    saveBtn.addEventListener('click', () => {
      if (!previewKey) return;
      const palette = td.palettes.find(p => p.key === previewKey);
      if (!palette) return;

      const oldSystem = themeState.system;
      themeState.system = previewKey;
      saveThemeState();

      // Push to undo stack
      const cc = document.getElementById('claude-content');
      if (cc && palette.tokens) {
        Object.entries(palette.tokens).forEach(([key, value]) => {
          const oldVal = cc.style.getPropertyValue(key) || '';
          undoStack.push({ element: cc, prop: key, oldValue: oldVal, isToken: true });
        });
        redoStack = [];
      }

      // Add to tuneChanges for sidebar
      const tokenChanges = {};
      if (palette.tokens) Object.entries(palette.tokens).forEach(([k, v]) => { tokenChanges[k] = v; });
      tuneChanges = tuneChanges.filter(c => c.selector !== '#claude-content' || !c._themeSystem);
      tuneChanges.push({
        selector: '#claude-content',
        tag: 'div',
        text: 'Design system: ' + palette.name,
        changes: {},
        tokenChanges: tokenChanges,
        timestamp: Date.now(),
        _themeSystem: true
      });

      // Update check marks
      list.querySelectorAll('.theme-palette-row').forEach((r, i) => {
        const p = td.palettes[i];
        const check = r.querySelector('div:last-child');
        if (check) {
          check.innerHTML = p.key === previewKey
            ? '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#0066ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '';
        }
      });

      saveAnnotations();
      renderSidebar();
      showToast('Design system set to ' + palette.name + '.');
    });

    applyBar.appendChild(resetBtn);
    applyBar.appendChild(saveBtn);
    container.appendChild(applyBar);

    return container;
  }

  function applyStoredTheme() {
    const td = window.THEME_DATA;
    if (!td || !td.palettes) return;
    if (!themeState.system) return;
    const palette = td.palettes.find(p => p.key === themeState.system);
    if (!palette || !palette.tokens) return;
    const cc = document.getElementById('claude-content');
    if (!cc) return;
    Object.entries(palette.tokens).forEach(([key, value]) => {
      cc.style.setProperty(key, value);
    });
  }

  function rebuildColorsTab(panel) {
    const colorsPanel = panel._tabPanels['Colors'];
    if (!colorsPanel) return;

    const td = window.THEME_DATA;
    if (!td || !td.palettes) return;
    if (!themeState.system) {
      colorsPanel.innerHTML = '<div style="padding:16px;color:var(--dc-text-secondary,#888);font-size:13px;">Save a design system first to unlock color overrides.</div>';
      return;
    }

    const palette = td.palettes.find(p => p.key === themeState.system);
    if (!palette) return;

    const cc = document.getElementById('claude-content');

    // Track working color variant and accent
    let activeVariant = themeState.colorVariant || 'default';
    let activeAccent = themeState.accentColor || palette.tokens['--color-primary'] || '#0066ff';

    const VARIANT_NAMES = ['default', 'dark', 'warm', 'cool'];
    const VARIANT_LABELS = { default: 'Default', dark: 'Dark', warm: 'Warm', cool: 'Cool' };
    // Five color dots to show per variant
    const DOT_TOKENS = ['--color-bg', '--color-surface', '--color-primary', '--color-text', '--color-border'];

    function getVariantTokens(variantKey) {
      const base = palette.tokens || {};
      const overrides = (palette.variants && palette.variants[variantKey]) || {};
      return Object.assign({}, base, overrides);
    }

    function applyVariant(variantKey) {
      if (!cc) return;
      const vTokens = getVariantTokens(variantKey);
      // Only swap --color-* tokens
      Object.entries(vTokens).forEach(([k, v]) => {
        if (k.startsWith('--color-')) cc.style.setProperty(k, v);
      });
    }

    function applyAccent(hex) {
      if (!cc) return;
      cc.style.setProperty('--color-primary', hex);
      cc.style.setProperty('--color-primary-hover', lightenColor(hex, -15));
      const lum = themeRelativeLuminance(hex);
      cc.style.setProperty('--color-on-primary', lum > 0.35 ? '#000000' : '#FFFFFF');
    }

    // Build container
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:12px 16px;';

    // Section: Color Variant
    const variantLabel = document.createElement('div');
    variantLabel.className = 'theme-finetune-label';
    variantLabel.textContent = 'COLOR MODE';
    wrap.appendChild(variantLabel);

    const variantsRow = document.createElement('div');
    variantsRow.className = 'theme-variants';

    VARIANT_NAMES.forEach(vKey => {
      const vTokens = getVariantTokens(vKey);
      const card = document.createElement('div');
      card.className = 'theme-variant' + (activeVariant === vKey ? ' active' : '');
      card.title = VARIANT_LABELS[vKey];

      const dots = document.createElement('div');
      dots.className = 'theme-dots';
      DOT_TOKENS.forEach(tok => {
        const dot = document.createElement('div');
        dot.className = 'theme-dot';
        dot.style.background = vTokens[tok] || '#888';
        dots.appendChild(dot);
      });

      const lbl = document.createElement('div');
      lbl.className = 'theme-variant-label';
      lbl.textContent = VARIANT_LABELS[vKey];

      card.appendChild(dots);
      card.appendChild(lbl);

      card.addEventListener('click', () => {
        activeVariant = vKey;
        variantsRow.querySelectorAll('.theme-variant').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        applyVariant(vKey);
      });

      variantsRow.appendChild(card);
    });
    wrap.appendChild(variantsRow);

    // Section: Accent Color
    const accentRow = document.createElement('div');
    accentRow.className = 'theme-accent-row';

    const accentLabel = document.createElement('div');
    accentLabel.className = 'theme-accent-label';
    accentLabel.textContent = 'Accent color';

    const accentInput = document.createElement('input');
    accentInput.type = 'color';
    accentInput.className = 'theme-accent-input';
    accentInput.value = activeAccent.length === 7 ? activeAccent : '#0066ff';

    const accentHex = document.createElement('div');
    accentHex.className = 'theme-accent-hex';
    accentHex.textContent = accentInput.value.toUpperCase();

    accentInput.addEventListener('input', () => {
      activeAccent = accentInput.value;
      accentHex.textContent = activeAccent.toUpperCase();
      applyAccent(activeAccent);
    });

    accentRow.appendChild(accentLabel);
    accentRow.appendChild(accentInput);
    accentRow.appendChild(accentHex);
    wrap.appendChild(accentRow);

    // Save bar
    const saveBar = document.createElement('div');
    saveBar.className = 'theme-save-bar';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'theme-save-btn';
    saveBtn.textContent = 'Save Colors';

    saveBtn.addEventListener('click', () => {
      themeState.colorVariant = activeVariant;
      themeState.accentColor = activeAccent;
      saveThemeState();

      // Build tokenChanges for sidebar
      const tokenChanges = {};
      const vTokens = getVariantTokens(activeVariant);
      Object.entries(vTokens).forEach(([k, v]) => {
        if (k.startsWith('--color-')) tokenChanges[k] = v;
      });
      // Accent overrides
      tokenChanges['--color-primary'] = activeAccent;
      tokenChanges['--color-primary-hover'] = lightenColor(activeAccent, -15);
      const lum = themeRelativeLuminance(activeAccent);
      tokenChanges['--color-on-primary'] = lum > 0.35 ? '#000000' : '#FFFFFF';

      tuneChanges = tuneChanges.filter(c => c.selector !== '#claude-content' || !c._themeColors);
      tuneChanges.push({
        selector: '#claude-content',
        tag: 'div',
        text: 'Color variant: ' + VARIANT_LABELS[activeVariant] + (activeAccent ? ' / accent ' + activeAccent.toUpperCase() : ''),
        changes: {},
        tokenChanges: tokenChanges,
        timestamp: Date.now(),
        _themeColors: true
      });

      saveAnnotations();
      renderSidebar();
      showToast('Colors saved.');
    });

    saveBar.appendChild(saveBtn);
    wrap.appendChild(saveBar);

    colorsPanel.innerHTML = '';
    colorsPanel.appendChild(wrap);
  }

  function rebuildFineTuneTab(panel) {
    const ftPanel = panel._tabPanels['Fine-tune'];
    if (!ftPanel) return;

    const td = window.THEME_DATA;
    if (!td || !td.palettes) return;
    if (!themeState.system) {
      ftPanel.innerHTML = '<div style="padding:16px;color:var(--dc-text-secondary,#888);font-size:13px;">Save a design system first to unlock fine-tuning.</div>';
      return;
    }

    const palette = td.palettes.find(p => p.key === themeState.system);
    if (!palette) return;

    const cc = document.getElementById('claude-content');
    const ft = themeState.fineTune || {};

    // Working state
    let activeFont = ft.fontFamily || 'system';
    let spacingMult = ft.spacingMultiplier !== undefined ? ft.spacingMultiplier : 1;
    let radiusMult = ft.radiusMultiplier !== undefined ? ft.radiusMultiplier : 1;

    const FONT_LABELS = { system: 'System UI', inter: 'Inter', serif: 'Serif', mono: 'Mono' };
    const SPACE_TOKENS = ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl'];
    const RADIUS_TOKENS = ['--radius-sm', '--radius-md', '--radius-lg'];

    function parseRem(val) {
      if (!val) return 0;
      const s = val.trim();
      if (s.endsWith('rem')) return parseFloat(s);
      if (s.endsWith('px')) return parseFloat(s) / 16;
      return parseFloat(s);
    }
    function parsePx(val) {
      if (!val) return 0;
      const s = val.trim();
      if (s.endsWith('px')) return parseFloat(s);
      if (s.endsWith('rem')) return parseFloat(s) * 16;
      return parseFloat(s);
    }

    function applyFont(key) {
      if (!cc || !td.fontFamilies) return;
      const val = td.fontFamilies[key];
      if (val) cc.style.setProperty('--font-family', val);
    }

    function applySpacing(mult) {
      if (!cc || !palette.tokens) return;
      SPACE_TOKENS.forEach(tok => {
        const base = palette.tokens[tok];
        if (base) {
          const remVal = parseRem(base);
          cc.style.setProperty(tok, (remVal * mult).toFixed(4) + 'rem');
        }
      });
    }

    function applyRadius(mult) {
      if (!cc || !palette.tokens) return;
      RADIUS_TOKENS.forEach(tok => {
        const base = palette.tokens[tok];
        if (base) {
          const pxVal = parsePx(base);
          cc.style.setProperty(tok, (pxVal * mult).toFixed(1) + 'px');
        }
      });
      // --radius-full always stays 9999px
      cc.style.setProperty('--radius-full', '9999px');
    }

    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:12px 16px;';

    // ── Font Family ──
    const fontSection = document.createElement('div');
    fontSection.className = 'theme-finetune-section';

    const fontLabel = document.createElement('div');
    fontLabel.className = 'theme-finetune-label';
    fontLabel.textContent = 'FONT FAMILY';
    fontSection.appendChild(fontLabel);

    const chips = document.createElement('div');
    chips.className = 'theme-font-chips';

    Object.entries(FONT_LABELS).forEach(([key, label]) => {
      const chip = document.createElement('button');
      chip.className = 'theme-font-chip' + (activeFont === key ? ' active' : '');
      chip.textContent = label;
      chip.addEventListener('click', () => {
        activeFont = key;
        chips.querySelectorAll('.theme-font-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyFont(key);
      });
      chips.appendChild(chip);
    });

    fontSection.appendChild(chips);
    wrap.appendChild(fontSection);

    // ── Spacing Density ──
    const spacingSection = document.createElement('div');
    spacingSection.className = 'theme-finetune-section';

    const spacingLabel = document.createElement('div');
    spacingLabel.className = 'theme-finetune-label';
    spacingLabel.textContent = 'SPACING DENSITY';
    spacingSection.appendChild(spacingLabel);

    const spacingRow = document.createElement('div');
    spacingRow.className = 'theme-slider-row';

    const spacingSliderLabel = document.createElement('div');
    spacingSliderLabel.className = 'theme-slider-label';
    spacingSliderLabel.textContent = 'Density';

    const spacingSlider = document.createElement('input');
    spacingSlider.type = 'range';
    spacingSlider.className = 'theme-slider';
    spacingSlider.min = '0.6';
    spacingSlider.max = '1.5';
    spacingSlider.step = '0.05';
    spacingSlider.value = String(spacingMult);

    const spacingValue = document.createElement('div');
    spacingValue.className = 'theme-slider-value';
    spacingValue.textContent = parseFloat(spacingMult).toFixed(2) + 'x';

    spacingSlider.addEventListener('input', () => {
      spacingMult = parseFloat(spacingSlider.value);
      spacingValue.textContent = spacingMult.toFixed(2) + 'x';
      applySpacing(spacingMult);
    });

    spacingRow.appendChild(spacingSliderLabel);
    spacingRow.appendChild(spacingSlider);
    spacingRow.appendChild(spacingValue);
    spacingSection.appendChild(spacingRow);
    wrap.appendChild(spacingSection);

    // ── Border Radius ──
    const radiusSection = document.createElement('div');
    radiusSection.className = 'theme-finetune-section';

    const radiusLabel = document.createElement('div');
    radiusLabel.className = 'theme-finetune-label';
    radiusLabel.textContent = 'BORDER RADIUS';
    radiusSection.appendChild(radiusLabel);

    const radiusRow = document.createElement('div');
    radiusRow.className = 'theme-slider-row';

    const radiusSliderLabel = document.createElement('div');
    radiusSliderLabel.className = 'theme-slider-label';
    radiusSliderLabel.textContent = 'Radius';

    const radiusSlider = document.createElement('input');
    radiusSlider.type = 'range';
    radiusSlider.className = 'theme-slider';
    radiusSlider.min = '0';
    radiusSlider.max = '2';
    radiusSlider.step = '0.1';
    radiusSlider.value = String(radiusMult);

    const radiusValue = document.createElement('div');
    radiusValue.className = 'theme-slider-value';
    radiusValue.textContent = parseFloat(radiusMult).toFixed(1) + 'x';

    radiusSlider.addEventListener('input', () => {
      radiusMult = parseFloat(radiusSlider.value);
      radiusValue.textContent = radiusMult.toFixed(1) + 'x';
      applyRadius(radiusMult);
    });

    radiusRow.appendChild(radiusSliderLabel);
    radiusRow.appendChild(radiusSlider);
    radiusRow.appendChild(radiusValue);
    radiusSection.appendChild(radiusRow);
    wrap.appendChild(radiusSection);

    // ── Save Bar ──
    const saveBar = document.createElement('div');
    saveBar.className = 'theme-save-bar';
    const saveBtn = document.createElement('button');
    saveBtn.className = 'theme-save-btn';
    saveBtn.textContent = 'Save Fine-tune';

    saveBtn.addEventListener('click', () => {
      themeState.fineTune = {
        fontFamily: activeFont,
        spacingMultiplier: spacingMult,
        radiusMultiplier: radiusMult
      };
      saveThemeState();

      // Build tokenChanges for sidebar
      const tokenChanges = {};
      if (td.fontFamilies && td.fontFamilies[activeFont]) {
        tokenChanges['--font-family'] = td.fontFamilies[activeFont];
      }
      if (palette.tokens) {
        SPACE_TOKENS.forEach(tok => {
          const base = palette.tokens[tok];
          if (base) {
            const remVal = parseRem(base);
            tokenChanges[tok] = (remVal * spacingMult).toFixed(4) + 'rem';
          }
        });
        RADIUS_TOKENS.forEach(tok => {
          const base = palette.tokens[tok];
          if (base) {
            const pxVal = parsePx(base);
            tokenChanges[tok] = (pxVal * radiusMult).toFixed(1) + 'px';
          }
        });
        tokenChanges['--radius-full'] = '9999px';
      }

      tuneChanges = tuneChanges.filter(c => c.selector !== '#claude-content' || !c._themeFineTune);
      tuneChanges.push({
        selector: '#claude-content',
        tag: 'div',
        text: 'Fine-tune: ' + FONT_LABELS[activeFont] + ' / spacing ' + spacingMult.toFixed(2) + 'x / radius ' + radiusMult.toFixed(1) + 'x',
        changes: {},
        tokenChanges: tokenChanges,
        timestamp: Date.now(),
        _themeFineTune: true
      });

      saveAnnotations();
      renderSidebar();
      showToast('Fine-tune settings saved.');
    });

    saveBar.appendChild(saveBtn);
    wrap.appendChild(saveBar);

    ftPanel.innerHTML = '';
    ftPanel.appendChild(wrap);
  }

  // Add toolbar and header buttons on load
  document.addEventListener('DOMContentLoaded', () => {
    const toolbar = document.getElementById('toolbar-group');
    const headerRight = document.querySelector('.header > div:last-child');

    // Toolbar buttons (center group)
    if (toolbar) {
      // Design tools
      const designTools = [
        { id: 'inspect-toggle', title: 'Inspect (Shift+I)', icon: '<path d="M13.5 2.5l-1-1-2 2-1-1-5 5 2 2 5-5-1-1z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" fill="none"/><path d="M4.5 9.5l-2 4 4-2" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round" fill="none"/>', action: () => { if (commentMode) setCommentMode(false); if (tuneMode) setTuneMode(false); setInspectMode(!inspectMode); } },
        { id: 'tune-toggle', title: 'Tune (Shift+T)', icon: '<line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><circle cx="9" cy="4" r="1.5" fill="currentColor"/><line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><circle cx="5" cy="8" r="1.5" fill="currentColor"/><line x1="3" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><circle cx="10" cy="12" r="1.5" fill="currentColor"/>', action: () => { if (commentMode) setCommentMode(false); if (inspectMode) setInspectMode(false); setTuneMode(!tuneMode); } },
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
      ];

      designTools.forEach(t => {
        if (document.getElementById(t.id)) return;
        const btn = document.createElement('button');
        btn.id = t.id;
        btn.className = 'comment-toggle';
        btn.title = t.title;
        btn.innerHTML = '<svg class="comment-icon" viewBox="0 0 16 16" fill="none">' + t.icon + '</svg>';
        btn.addEventListener('click', (e) => { e.stopPropagation(); t.action(); });
        toolbar.appendChild(btn);
      });

      // Divider
      const divider = document.createElement('div');
      divider.className = 'toolbar-divider';
      toolbar.appendChild(divider);

      // Feedback tools: comment + sidebar
      // Move comment button from header into toolbar
      const existingComment = document.getElementById('comment-toggle');
      if (existingComment) {
        toolbar.appendChild(existingComment);
      }

    }

    // Right side: changes panel + send button
    if (headerRight) {
      if (!document.getElementById('sidebar-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'sidebar-toggle';
        btn.className = 'comment-toggle';
        btn.title = 'View changes (Shift+A)';
        btn.innerHTML = '<svg class="comment-icon" viewBox="0 0 16 16" fill="none">' +
          '<rect x="2.5" y="1.5" width="11" height="13" rx="1" stroke="currentColor" stroke-width="1.25" fill="none"/>' +
          '<line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" stroke-width="1"/>' +
          '<line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1"/>' +
          '<line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" stroke-width="1"/>' +
          '</svg>';
        btn.addEventListener('click', (e) => { e.stopPropagation(); toggleSidebar(); });
        headerRight.appendChild(btn);
      }

      if (!document.getElementById('send-annotations')) {
        const sendBtn = document.createElement('button');
        sendBtn.id = 'send-annotations';
        sendBtn.className = 'comment-toggle';
        sendBtn.title = 'Send comments to Claude';
        sendBtn.style.display = 'none';
        sendBtn.innerHTML = '<span>Send</span> <svg class="comment-icon" viewBox="0 0 16 16" fill="none">' +
          '<line x1="2" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>' +
          '<polyline points="9,4 13,8 9,12" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
          '</svg>';
        sendBtn.addEventListener('click', (e) => { e.stopPropagation(); sendAnnotations(); });
        headerRight.appendChild(sendBtn);
      }
    }

    updateBadge();
    renderSidebar();
    applyStoredTheme();

    // Start with pins hidden
    document.body.classList.add('annotation-pins-hidden');

    // ===== APP MENU =====
    let openMenu = null;

    function closeAllMenus() {
      document.querySelectorAll('.menu-dropdown').forEach(d => d.classList.remove('open'));
      openMenu = null;
    }

    function updateMenuState() {
      const mc = document.getElementById('menu-comment');
      const mi = document.getElementById('menu-inspect');
      const mt = document.getElementById('menu-tune');
      const mu = document.getElementById('menu-undo');
      const mr = document.getElementById('menu-redo');
      const ms = document.getElementById('menu-send');
      const mtc = document.getElementById('menu-toggle-comments');
      if (mc) mc.classList.toggle('active', commentMode);
      if (mi) mi.classList.toggle('active', inspectMode);
      if (mt) mt.classList.toggle('active', tuneMode);
      if (mu) mu.classList.toggle('disabled', undoStack.length === 0);
      if (mr) mr.classList.toggle('disabled', redoStack.length === 0);
      if (ms) ms.classList.toggle('disabled', annotations.length === 0 && tuneChanges.length === 0);
      if (mtc) mtc.classList.toggle('active', sidebarOpen);
    }

    document.querySelectorAll('.menu-item[data-menu]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuId = 'menu-' + item.dataset.menu;
        const dropdown = document.getElementById(menuId);
        if (!dropdown) return;

        if (openMenu === menuId) {
          closeAllMenus();
          return;
        }
        closeAllMenus();
        updateMenuState();
        dropdown.classList.add('open');
        openMenu = menuId;
      });

      // Hover to switch between open menus
      item.addEventListener('mouseenter', () => {
        if (openMenu) {
          const menuId = 'menu-' + item.dataset.menu;
          const dropdown = document.getElementById(menuId);
          if (dropdown && openMenu !== menuId) {
            closeAllMenus();
            updateMenuState();
            dropdown.classList.add('open');
            openMenu = menuId;
          }
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (openMenu && !e.target.closest('.app-menu')) {
        closeAllMenus();
      }
    });

    document.querySelectorAll('.menu-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (item.classList.contains('disabled')) return;

        const action = item.dataset.action;
        if (action === 'deselect-mode') {
          setCommentMode(false);
          setInspectMode(false);
          setTuneMode(false);
        } else if (action === 'comment-mode') {
          if (inspectMode) setInspectMode(false);
          if (tuneMode) setTuneMode(false);
          setCommentMode(!commentMode);
        } else if (action === 'inspect-mode') {
          if (commentMode) setCommentMode(false);
          if (tuneMode) setTuneMode(false);
          setInspectMode(!inspectMode);
        } else if (action === 'tune-mode') {
          if (commentMode) setCommentMode(false);
          if (inspectMode) setInspectMode(false);
          setTuneMode(!tuneMode);
        } else if (action === 'send-comments') {
          sendAnnotations();
        } else if (action === 'toggle-comments') {
          toggleSidebar();
        } else if (action === 'undo') {
          if (undoStack.length > 0) {
            const act = undoStack.pop();
            if (act.isToken) {
              redoStack.push({ element: act.element, prop: act.prop, oldValue: act.element.style.getPropertyValue(act.prop) || '', isToken: true });
              if (act.oldValue) {
                act.element.style.setProperty(act.prop, act.oldValue);
              } else {
                act.element.style.removeProperty(act.prop);
              }
            } else {
              redoStack.push({ element: act.element, prop: act.prop, oldValue: act.element.style[act.prop] || '' });
              act.element.style[act.prop] = act.oldValue;
            }
            showToast('Undo: ' + act.prop);
          }
        } else if (action === 'redo') {
          if (redoStack.length > 0) {
            const act = redoStack.pop();
            if (act.isToken) {
              undoStack.push({ element: act.element, prop: act.prop, oldValue: act.element.style.getPropertyValue(act.prop) || '', isToken: true });
              if (act.oldValue) {
                act.element.style.setProperty(act.prop, act.oldValue);
              } else {
                act.element.style.removeProperty(act.prop);
              }
            } else {
              undoStack.push({ element: act.element, prop: act.prop, oldValue: act.element.style[act.prop] || '' });
              act.element.style[act.prop] = act.oldValue;
            }
            showToast('Redo: ' + act.prop);
          }
        }
        closeAllMenus();
      });
    });
  });

  function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      eventQueue.forEach(e => ws.send(JSON.stringify(e)));
      eventQueue = [];
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === 'reload') {
        // Clear annotations — each screen is a clean slate
        annotations = [];
        saveAnnotations();

        window.location.reload();
      }
    };

    ws.onclose = () => {
      setTimeout(connect, 1000);
    };
  }

  function sendEvent(event) {
    event.timestamp = Date.now();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    } else {
      eventQueue.push(event);
    }
  }

  // ===== ANNOTATION CLICK HANDLER =====
  document.addEventListener('click', (e) => {
    if (!commentMode) return;

    const ignore = e.target.closest('#dc-header, .indicator-bar, .annotation-pin, .annotation-popover, .annotation-sidebar, #comment-toggle');
    if (ignore) return;

    const root = document.getElementById('claude-content');
    if (!root) return;

    // Allow clicks anywhere inside #claude-content, including padding
    if (!root.contains(e.target) && e.target !== root) return;

    e.preventDefault();
    e.stopPropagation();

    // Find the most specific element for the selector, fall back to root
    let target = e.target.closest('#claude-content *');
    if (!target || target.id === 'claude-content') target = root;

    const selector = target === root ? '#claude-content' : generateSelector(target);
    if (!selector) return;

    // Position relative to #claude-content root — consistent regardless of target
    const rootRect = root.getBoundingClientRect();

    const annotation = {
      id: generateId(),
      selector: selector,
      tag: target.tagName.toLowerCase(),
      text: (target.textContent || '').trim().slice(0, 100),
      note: '',
      status: 'new',
      position: {
        x: e.clientX - rootRect.left,
        y: e.clientY - rootRect.top
      },
      timestamp: Date.now()
    };

    pinCounter++;
    annotations.push(annotation);
    saveAnnotations();
    renderAllPins();
    renderSidebar();

    const newPin = document.querySelector('[data-annotation-id="' + annotation.id + '"]');
    if (newPin) {
      showPopover(annotation, newPin);
    }
  }, true);

  // Capture clicks on choice elements
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-choice]');
    if (!target) return;

    sendEvent({
      type: 'click',
      text: target.textContent.trim(),
      choice: target.dataset.choice,
      id: target.id || null
    });

    // Update indicator bar (defer so toggleSelect runs first)
    setTimeout(() => {
      const indicator = document.getElementById('indicator-text');
      if (!indicator) return;
      const container = target.closest('.options') || target.closest('.cards');
      const selected = container ? container.querySelectorAll('.selected') : [];
      if (selected.length === 0) {
        indicator.textContent = 'Click an option above, then return to the terminal';
      } else if (selected.length === 1) {
        const label = selected[0].querySelector('h3, .content h3, .card-body h3')?.textContent?.trim() || selected[0].dataset.choice;
        indicator.innerHTML = '<span class="selected-text">' + label + ' selected</span> — return to terminal to continue';
      } else {
        indicator.innerHTML = '<span class="selected-text">' + selected.length + ' selected</span> — return to terminal to continue';
      }
    }, 0);
  });

  // Frame UI: selection tracking
  window.selectedChoice = null;

  window.toggleSelect = function(el) {
    const container = el.closest('.options') || el.closest('.cards');
    const multi = container && container.dataset.multiselect !== undefined;
    if (container && !multi) {
      container.querySelectorAll('.option, .card').forEach(o => o.classList.remove('selected'));
    }
    if (multi) {
      el.classList.toggle('selected');
    } else {
      el.classList.add('selected');
    }
    window.selectedChoice = el.dataset.choice;
  };

  // Expose API for explicit use
  window.designkit = {
    send: sendEvent,
    choice: (value, metadata = {}) => sendEvent({ type: 'choice', value, ...metadata })
  };

  connect();
})();
