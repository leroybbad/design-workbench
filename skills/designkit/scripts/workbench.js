// Workbench: placement mode, section controls, template picker, canvas operations.
window.DKWorkbench = (function () {
  let placementBlock = null;
  let placementLine = null;
  let placementTarget = null;

  function flashElement(el) {
    el.classList.add('dk-just-placed');
    el.addEventListener('animationend', () => el.classList.remove('dk-just-placed'), { once: true });
  }

  // ===== PLACEMENT MODE =====

  function enterPlacementMode(block) {
    placementBlock = block;
    document.body.classList.add('placement-mode');

    placementLine = document.createElement('div');
    placementLine.className = 'dk-placement-line';
    placementLine.style.display = 'none';
    document.body.appendChild(placementLine);

    document.getElementById('claude-content').addEventListener('mousemove', onPlacementMouseMove);
    document.getElementById('claude-content').addEventListener('click', onPlacementClick, true);
    document.addEventListener('keydown', onPlacementKeydown);
  }

  function exitPlacementMode() {
    placementBlock = null;
    placementTarget = null;
    document.body.classList.remove('placement-mode');

    if (placementLine) { placementLine.remove(); placementLine = null; }

    document.querySelectorAll('.dk-slot-highlight').forEach(el => el.classList.remove('dk-slot-highlight'));

    const canvas = document.getElementById('claude-content');
    if (canvas) {
      canvas.removeEventListener('mousemove', onPlacementMouseMove);
      canvas.removeEventListener('click', onPlacementClick, true);
    }
    document.removeEventListener('keydown', onPlacementKeydown);
  }

  function onPlacementKeydown(e) {
    if (e.key === 'Escape') {
      exitPlacementMode();
      if (window.DKCatalog) window.DKCatalog.clearSelection();
    }
  }

  function onPlacementMouseMove(e) {
    const canvas = document.getElementById('claude-content');
    const sections = Array.from(canvas.querySelectorAll('[data-section]'));

    document.querySelectorAll('.dk-slot-highlight').forEach(el => el.classList.remove('dk-slot-highlight'));

    // Check if hovering over a slot
    const slot = e.target.closest('[data-slot]');
    if (slot) {
      slot.classList.add('dk-slot-highlight');
      placementTarget = { type: 'slot', container: slot };
      if (placementLine) placementLine.style.display = 'none';
      return;
    }

    // Only show section-gap line if the mouse is NOT inside any section's bounding box
    placementTarget = null;
    const insideSection = sections.some(s => {
      const r = s.getBoundingClientRect();
      return e.clientY >= r.top + 8 && e.clientY <= r.bottom - 8;
    });

    if (insideSection) {
      if (placementLine) placementLine.style.display = 'none';
      return;
    }

    // Find the gap the mouse is closest to
    let bestGap = null;
    let bestDist = Infinity;

    if (sections.length > 0) {
      const rect = sections[0].getBoundingClientRect();
      const dist = Math.abs(e.clientY - rect.top);
      if (dist < bestDist) { bestDist = dist; bestGap = { after: null, y: rect.top }; }
    }

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const dist = Math.abs(e.clientY - rect.bottom);
      if (dist < bestDist) { bestDist = dist; bestGap = { after: section, y: rect.bottom }; }
    });

    if (bestGap && bestDist < 30) {
      const canvasRect = canvas.getBoundingClientRect();
      placementLine.style.display = 'block';
      placementLine.style.top = (bestGap.y - canvasRect.top + canvas.scrollTop) + 'px';
      placementLine.style.left = '0';
      placementLine.style.right = '0';
      placementTarget = { type: 'section-gap', after: bestGap.after };
    } else {
      if (placementLine) placementLine.style.display = 'none';
    }
  }

  async function onPlacementClick(e) {
    if (!placementBlock || !placementTarget) return;
    e.preventDefault();
    e.stopPropagation();

    const content = await window.DKCatalog.fetchBlockContent(placementBlock.file);
    if (!content) return;

    if (placementTarget.type === 'section-gap') {
      insertSection(content, placementTarget.after);
    } else if (placementTarget.type === 'slot') {
      insertIntoSlot(content, placementTarget.container);
    }

    // Stay in placement mode — user can keep clicking to place more
    // Hide the line and clear target so the next hover recalculates
    placementTarget = null;
    if (placementLine) placementLine.style.display = 'none';
    document.querySelectorAll('.dk-slot-highlight').forEach(el => el.classList.remove('dk-slot-highlight'));
  }

  function insertSection(html, afterSection) {
    const canvas = document.getElementById('claude-content');
    const wrapper = document.createElement('section');
    wrapper.setAttribute('data-section', '');
    wrapper.setAttribute('data-section-id', 's' + Date.now());
    wrapper.innerHTML = html;

    if (afterSection) {
      afterSection.insertAdjacentElement('afterend', wrapper);
    } else {
      canvas.insertAdjacentElement('afterbegin', wrapper);
    }
    flashElement(wrapper);

    window.DKUndo.push({
      type: 'insert-section',
      undo: () => { wrapper.remove(); injectSectionControls(); },
      redo: () => {
        if (afterSection && afterSection.parentElement) {
          afterSection.insertAdjacentElement('afterend', wrapper);
        } else {
          canvas.insertAdjacentElement('afterbegin', wrapper);
        }
        injectSectionControls();
      },
      description: 'Insert section'
    });

    injectSectionControls();
  }

  function insertIntoSlot(html, slotContainer) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const inserted = temp.firstElementChild || temp;

    slotContainer.appendChild(inserted);
    flashElement(inserted);

    window.DKUndo.push({
      type: 'insert-block',
      undo: () => inserted.remove(),
      redo: () => slotContainer.appendChild(inserted),
      description: 'Insert block into slot'
    });
  }

  // ===== ELEMENT CONTROLS (Alt-hold overlay) =====

  let controlsVisible = false;

  function showElementControls() {
    if (controlsVisible) return;
    controlsVisible = true;
    document.body.classList.add('dk-controls-visible');

    const canvas = document.getElementById('claude-content');
    if (!canvas) return;

    // Add controls to sections and blocks
    const targets = canvas.querySelectorAll('[data-section], [data-block]');
    targets.forEach(el => {
      if (el.querySelector('.dk-el-controls')) return;

      const controls = document.createElement('div');
      controls.className = 'dk-el-controls';

      // Move up button
      const upBtn = document.createElement('button');
      upBtn.className = 'dk-el-btn dk-el-move';
      upBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3L3 9h10L8 3z" fill="currentColor"/></svg>';
      upBtn.title = 'Move up';
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveElement(el, -1);
      });
      controls.appendChild(upBtn);

      // Move down button
      const downBtn = document.createElement('button');
      downBtn.className = 'dk-el-btn dk-el-move';
      downBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 13L3 7h10L8 13z" fill="currentColor"/></svg>';
      downBtn.title = 'Move down';
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moveElement(el, 1);
      });
      controls.appendChild(downBtn);

      // Remove button
      const delBtn = document.createElement('button');
      delBtn.className = 'dk-el-btn dk-el-remove';
      delBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 5h8l-.5 8H4.5L4 5z" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 5V3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V5" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="3" y1="5" x2="13" y2="5" stroke="currentColor" stroke-width="1.2"/></svg>';
      delBtn.title = 'Remove';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeElement(el);
      });
      controls.appendChild(delBtn);

      el.style.position = 'relative';
      el.appendChild(controls);
    });
  }

  function hideElementControls() {
    if (!controlsVisible) return;
    controlsVisible = false;
    document.body.classList.remove('dk-controls-visible');
    document.querySelectorAll('.dk-el-controls').forEach(el => el.remove());
  }

  function removeElement(el) {
    const parent = el.parentElement;
    const nextSibling = el.nextElementSibling;
    const isSection = el.hasAttribute('data-section');
    el.remove();
    hideElementControls();

    window.DKUndo.push({
      type: isSection ? 'remove-section' : 'remove-block',
      undo: () => {
        if (nextSibling && nextSibling.parentElement) {
          parent.insertBefore(el, nextSibling);
        } else {
          parent.appendChild(el);
        }
      },
      redo: () => {
        el.remove();
      },
      description: isSection ? 'Remove section' : 'Remove block'
    });
  }

  function moveElement(el, direction) {
    const parent = el.parentElement;
    // Get real siblings (skip injected controls)
    const siblings = Array.from(parent.children).filter(c => !c.classList.contains('dk-el-controls'));
    const idx = siblings.indexOf(el);
    if (idx < 0) return;

    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= siblings.length) return;

    const oldNext = el.nextElementSibling;
    if (direction < 0) {
      parent.insertBefore(el, siblings[newIdx]);
    } else {
      const after = siblings[newIdx];
      if (after.nextElementSibling) {
        parent.insertBefore(el, after.nextElementSibling);
      } else {
        parent.appendChild(el);
      }
    }

    // Refresh controls so they stay on the right elements
    hideElementControls();
    showElementControls();

    window.DKUndo.push({
      type: 'reorder',
      undo: () => {
        if (oldNext && oldNext.parentElement === parent) {
          parent.insertBefore(el, oldNext);
        } else {
          parent.appendChild(el);
        }
        hideElementControls();
      },
      redo: () => {
        moveElement(el, direction);
      },
      description: 'Move element ' + (direction < 0 ? 'up' : 'down')
    });
  }

  // Alt key toggle — press Alt to show controls, press again or Escape to hide
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Alt' && !e.repeat) {
      e.preventDefault();
      if (controlsVisible) {
        hideElementControls();
      } else {
        showElementControls();
      }
    }
    if (e.key === 'Escape' && controlsVisible) {
      hideElementControls();
    }
  });

  // Legacy compat
  function injectSectionControls() {
    // No-op — controls are now shown via Alt key
  }

  // ===== TEMPLATE PICKER =====

  async function showTemplatePicker() {
    let templates = [];
    try {
      const res = await fetch('/templates');
      templates = await res.json();
    } catch { templates = []; }

    if (!templates.find(t => t.file === '_blank.html')) {
      templates.unshift({ file: '_blank.html', name: 'Blank' });
    }

    const overlay = document.createElement('div');
    overlay.className = 'dk-template-picker';
    overlay.innerHTML = '<div class="dk-template-picker-inner">'
      + '<h2>Choose a starting template</h2>'
      + '<p>Pick a page layout to start from, or begin with a blank canvas.</p>'
      + '<div class="dk-template-grid"></div></div>';

    const grid = overlay.querySelector('.dk-template-grid');

    templates.forEach(tpl => {
      const option = document.createElement('div');
      option.className = 'dk-template-option';
      option.innerHTML = '<div class="dk-template-option-name">' + tpl.name + '</div>';
      option.addEventListener('click', async () => {
        try {
          const res = await fetch('/templates/' + encodeURIComponent(tpl.file));
          const html = await res.text();
          document.getElementById('claude-content').innerHTML = html;
          injectSectionControls();
        } catch (e) {
          console.error('Failed to load template', e);
        }
        overlay.remove();
      });
      grid.appendChild(option);
    });

    document.body.appendChild(overlay);
  }

  // ===== SLOT EMPTY HINTS =====

  function updateSlotHints() {
    document.querySelectorAll('[data-slot]').forEach(slot => {
      const hasContent = Array.from(slot.children).some(c => !c.classList.contains('dk-el-controls'));
      slot.classList.toggle('dk-slot-empty', !hasContent);
    });
  }

  // ===== INLINE TEXT EDITING =====

  const TEXT_TAGS = new Set(['H1','H2','H3','H4','H5','H6','P','SPAN','A','BUTTON','LABEL','LI','TD','TH']);
  let activeEditor = null;

  function setupInlineEditing() {
    const canvas = document.getElementById('claude-content');
    if (!canvas) return;

    canvas.addEventListener('dblclick', (e) => {
      // If we're in a mode that uses clicks (placement, comment, tune), skip
      if (document.body.classList.contains('placement-mode')) return;
      if (document.body.classList.contains('dk-focus-mode')) {
        handleFocusDblClick(e);
        return;
      }

      const el = e.target;

      // Check if this is a text element
      if (TEXT_TAGS.has(el.tagName)) {
        startInlineEdit(el);
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Check if this is a container — enter focus mode
      const block = el.closest('[data-block]') || el.closest('[data-section]');
      if (block && block.children.length > 1) {
        enterFocusMode(block);
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  function startInlineEdit(el) {
    if (activeEditor) commitInlineEdit(activeEditor);

    const oldText = el.textContent;
    el.setAttribute('contenteditable', 'true');
    el.classList.add('dk-editing');
    el.focus();
    activeEditor = el;

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    function onBlur() {
      commitInlineEdit(el, oldText);
      el.removeEventListener('blur', onBlur);
      el.removeEventListener('keydown', onKey);
    }

    function onKey(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      }
      if (e.key === 'Escape') {
        el.textContent = oldText;
        el.blur();
      }
    }

    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKey);
  }

  function commitInlineEdit(el, oldText) {
    el.removeAttribute('contenteditable');
    el.classList.remove('dk-editing');
    activeEditor = null;

    const newText = el.textContent;
    if (oldText !== undefined && newText !== oldText) {
      window.DKUndo.push({
        type: 'text-edit',
        undo: () => { el.textContent = oldText; },
        redo: () => { el.textContent = newText; },
        description: 'Edit text'
      });
    }
  }

  // ===== FOCUS MODE =====

  let focusTarget = null;

  function enterFocusMode(block) {
    if (focusTarget) exitFocusMode();
    focusTarget = block;
    document.body.classList.add('dk-focus-mode');
    block.classList.add('dk-focused');

    // Show child controls inside the focused block
    const children = Array.from(block.children).filter(c =>
      c.nodeType === 1 && !c.classList.contains('dk-el-controls') && !c.classList.contains('dk-focus-toolbar')
    );

    if (children.length > 0) {
      // Add a small toolbar at the top of the focused block
      const toolbar = document.createElement('div');
      toolbar.className = 'dk-focus-toolbar';

      const label = document.createElement('span');
      label.className = 'dk-focus-label';
      const blockName = block.getAttribute('data-block') || block.tagName.toLowerCase();
      label.textContent = 'Editing: ' + blockName;
      toolbar.appendChild(label);

      const addBtn = document.createElement('button');
      addBtn.className = 'dk-focus-btn dk-focus-add';
      addBtn.innerHTML = '<i class="lucide-plus" style="width:12px;height:12px;"></i> Add item';
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        duplicateLastChild(block);
      });
      toolbar.appendChild(addBtn);

      const doneBtn = document.createElement('button');
      doneBtn.className = 'dk-focus-btn';
      doneBtn.textContent = 'Done';
      doneBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exitFocusMode();
      });
      toolbar.appendChild(doneBtn);

      block.insertAdjacentElement('afterbegin', toolbar);

      // Mark each child for individual controls
      children.forEach(child => {
        child.classList.add('dk-focus-child');
      });
    }
  }

  function exitFocusMode() {
    if (!focusTarget) return;
    document.body.classList.remove('dk-focus-mode');
    focusTarget.classList.remove('dk-focused');
    focusTarget.querySelectorAll('.dk-focus-toolbar').forEach(t => t.remove());
    focusTarget.querySelectorAll('.dk-focus-child').forEach(c => c.classList.remove('dk-focus-child'));
    focusTarget = null;
  }

  function handleFocusDblClick(e) {
    const el = e.target;

    // Text editing inside focus mode
    if (TEXT_TAGS.has(el.tagName)) {
      startInlineEdit(el);
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Clicking outside the focused block exits focus mode
    if (focusTarget && !focusTarget.contains(el)) {
      exitFocusMode();
    }
  }

  function duplicateLastChild(container) {
    const children = Array.from(container.children).filter(c =>
      c.nodeType === 1 && !c.classList.contains('dk-focus-toolbar')
    );
    if (children.length === 0) return;

    const lastChild = children[children.length - 1];
    const clone = lastChild.cloneNode(true);
    clone.classList.add('dk-focus-child');
    container.appendChild(clone);
    flashElement(clone);

    window.DKUndo.push({
      type: 'duplicate-child',
      undo: () => clone.remove(),
      redo: () => container.appendChild(clone),
      description: 'Add item'
    });
  }

  // Escape exits focus mode
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && focusTarget) {
      exitFocusMode();
    }
  });

  // Click outside focused block exits focus mode
  document.addEventListener('click', (e) => {
    if (!focusTarget) return;
    if (e.target.closest('.dk-focus-toolbar')) return;
    if (e.target.closest('#dk-toolbar')) return;
    if (e.target.closest('.dk-panel')) return;
    if (!focusTarget.contains(e.target)) {
      exitFocusMode();
    }
  });

  // ===== INIT =====

  function init() {
    injectSectionControls();
    updateSlotHints();
    setupInlineEditing();

    // Watch for DOM changes to update slot hints
    const canvas = document.getElementById('claude-content');
    if (canvas) {
      new MutationObserver(updateSlotHints).observe(canvas, { childList: true, subtree: true });
    }

    // Template picker removed from auto-show — will be re-added
    // when we have more starting points to offer.
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Defer slightly to ensure helper.js has run
    setTimeout(init, 50);
  }

  return { enterPlacementMode, exitPlacementMode, injectSectionControls, showTemplatePicker, showElementControls, hideElementControls };
})();

// Global aliases for helper.js to call
function enterPlacementMode(block) { window.DKWorkbench.enterPlacementMode(block); }
function exitPlacementMode() { window.DKWorkbench.exitPlacementMode(); }
