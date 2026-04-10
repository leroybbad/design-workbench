// Workbench: placement mode, section controls, template picker, canvas operations.
window.DKWorkbench = (function () {
  let placementBlock = null;
  let placementLine = null;
  let placementTarget = null;

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

    // Find nearest section gap
    placementTarget = null;
    let bestGap = null;
    let bestDist = Infinity;

    // Gap before first section
    if (sections.length > 0) {
      const rect = sections[0].getBoundingClientRect();
      const dist = Math.abs(e.clientY - rect.top);
      if (dist < bestDist) { bestDist = dist; bestGap = { after: null, y: rect.top }; }
    }

    // Gaps between and after sections
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const dist = Math.abs(e.clientY - rect.bottom);
      if (dist < bestDist) { bestDist = dist; bestGap = { after: section, y: rect.bottom }; }
    });

    if (bestGap && bestDist < 60) {
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

    exitPlacementMode();
    if (window.DKCatalog) window.DKCatalog.clearSelection();
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

      // Drag handle (center)
      const dragBtn = document.createElement('button');
      dragBtn.className = 'dk-el-btn dk-el-drag';
      dragBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="4" r="1.2" fill="currentColor"/><circle cx="11" cy="4" r="1.2" fill="currentColor"/><circle cx="5" cy="8" r="1.2" fill="currentColor"/><circle cx="11" cy="8" r="1.2" fill="currentColor"/><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="11" cy="12" r="1.2" fill="currentColor"/></svg>';
      dragBtn.title = 'Drag to reorder';
      dragBtn.setAttribute('draggable', 'true');
      setupElementDrag(dragBtn, el);
      controls.appendChild(dragBtn);

      // Remove button
      const delBtn = document.createElement('button');
      delBtn.className = 'dk-el-btn dk-el-remove';
      delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 5h8l-.5 8H4.5L4 5z" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 5V3.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V5" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="3" y1="5" x2="13" y2="5" stroke="currentColor" stroke-width="1.2"/></svg>';
      delBtn.title = 'Remove';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeElement(el);
      });
      controls.appendChild(delBtn);

      el.style.position = 'relative';
      el.appendChild(controls);
    });

    setupCanvasDrop();
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

  function setupElementDrag(handle, el) {
    // Make the element itself draggable (not just the handle button)
    el.setAttribute('draggable', 'false');

    handle.addEventListener('mousedown', () => {
      el.setAttribute('draggable', 'true');
    });
    handle.addEventListener('mouseup', () => {
      el.setAttribute('draggable', 'false');
    });

    el.addEventListener('dragstart', (e) => {
      if (!el.getAttribute('draggable') || el.getAttribute('draggable') === 'false') {
        e.preventDefault();
        return;
      }
      e.stopPropagation();
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', ''); // Required for Firefox
      window._dragElement = el;
      window._dragParent = el.parentElement;
      requestAnimationFrame(() => el.classList.add('dk-section-dragging'));
    });

    el.addEventListener('dragend', () => {
      el.classList.remove('dk-section-dragging');
      el.setAttribute('draggable', 'false');
      document.querySelectorAll('.dk-drag-over').forEach(d => d.classList.remove('dk-drag-over'));
      window._dragElement = null;
      window._dragParent = null;
    });
  }

  // Global drag-over / drop on the canvas — finds the nearest sibling to drop before
  function setupCanvasDrop() {
    const canvas = document.getElementById('claude-content');
    if (!canvas || canvas._dkDropSetup) return;
    canvas._dkDropSetup = true;

    canvas.addEventListener('dragover', (e) => {
      if (!window._dragElement) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      const dragged = window._dragElement;
      const parent = window._dragParent;
      if (!parent) return;

      // Find the direct child of parent that we're hovering over
      const siblings = Array.from(parent.children).filter(c =>
        c !== dragged && !c.classList.contains('dk-el-controls')
      );
      document.querySelectorAll('.dk-drag-over').forEach(d => d.classList.remove('dk-drag-over'));

      let closest = null;
      let closestDist = Infinity;
      for (const sib of siblings) {
        const rect = sib.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const dist = Math.abs(e.clientY - midY);
        if (dist < closestDist) {
          closestDist = dist;
          closest = sib;
        }
      }
      if (closest) {
        const rect = closest.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          closest.classList.add('dk-drag-over');
        } else if (closest.nextElementSibling && closest.nextElementSibling !== dragged) {
          closest.nextElementSibling.classList.add('dk-drag-over');
        }
      }
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const dragged = window._dragElement;
      const parent = window._dragParent;
      if (!dragged || !parent) return;

      document.querySelectorAll('.dk-drag-over').forEach(d => d.classList.remove('dk-drag-over'));

      // Figure out where to insert based on mouse position
      const siblings = Array.from(parent.children).filter(c =>
        c !== dragged && !c.classList.contains('dk-el-controls')
      );
      let insertBefore = null;
      for (const sib of siblings) {
        const rect = sib.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          insertBefore = sib;
          break;
        }
      }

      const oldNext = dragged.nextElementSibling;
      if (insertBefore) {
        parent.insertBefore(dragged, insertBefore);
      } else {
        parent.appendChild(dragged);
      }

      hideElementControls();

      window.DKUndo.push({
        type: 'reorder',
        undo: () => {
          if (oldNext && oldNext.parentElement === parent) {
            parent.insertBefore(dragged, oldNext);
          } else {
            parent.appendChild(dragged);
          }
        },
        redo: () => {
          if (insertBefore && insertBefore.parentElement === parent) {
            parent.insertBefore(dragged, insertBefore);
          } else {
            parent.appendChild(dragged);
          }
        },
        description: 'Reorder element'
      });
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

  // ===== INIT =====

  function init() {
    injectSectionControls();
    updateSlotHints();

    // Watch for DOM changes to update slot hints
    const canvas = document.getElementById('claude-content');
    if (canvas) {
      new MutationObserver(updateSlotHints).observe(canvas, { childList: true, subtree: true });
    }

    // Check if this is a fresh session (no content on canvas)
    const hasContent = canvas && canvas.querySelector('[data-section]');
    if (!hasContent) {
      showTemplatePicker();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Defer slightly to ensure helper.js has run
    setTimeout(init, 50);
  }

  return { enterPlacementMode, exitPlacementMode, injectSectionControls, showTemplatePicker };
})();

// Global aliases for helper.js to call
function enterPlacementMode(block) { window.DKWorkbench.enterPlacementMode(block); }
function exitPlacementMode() { window.DKWorkbench.exitPlacementMode(); }
