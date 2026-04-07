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

  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'C') {
      e.preventDefault();
      setCommentMode(!commentMode);
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

      card.appendChild(actions);

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

  // Add sidebar toggle to header on load
  document.addEventListener('DOMContentLoaded', () => {
    const headerRight = document.querySelector('.header > div:last-child');
    if (headerRight && !document.getElementById('sidebar-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'sidebar-toggle';
      btn.className = 'comment-toggle';
      btn.title = 'View all annotations';
      btn.innerHTML = '<svg class="comment-icon" viewBox="0 0 16 16" fill="none">' +
        '<rect x="2.5" y="1.5" width="11" height="13" rx="1" stroke="currentColor" stroke-width="1.25" fill="none"/>' +
        '<line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1"/>' +
        '<line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" stroke-width="1"/>' +
        '</svg>';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
      headerRight.insertBefore(btn, headerRight.firstChild);
    }
    updateBadge();
    renderSidebar();

    // Start with pins hidden
    document.body.classList.add('annotation-pins-hidden');
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
        // Batch send all annotations before reloading
        if (annotations.length > 0) {
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
          sendEvent({ type: 'annotations', items: payload });
        }

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

    const ignore = e.target.closest('.header, .indicator-bar, .annotation-pin, .annotation-popover, .annotation-sidebar, #comment-toggle');
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
  window.brainstorm = {
    send: sendEvent,
    choice: (value, metadata = {}) => sendEvent({ type: 'choice', value, ...metadata })
  };

  connect();
})();
