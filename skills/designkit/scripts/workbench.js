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
