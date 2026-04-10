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

  // ===== SECTION CONTROLS =====

  function injectSectionControls() {
    const canvas = document.getElementById('claude-content');
    if (!canvas) return;

    canvas.querySelectorAll('.dk-section-controls').forEach(el => el.remove());

    canvas.querySelectorAll('[data-section]').forEach(section => {
      const controls = document.createElement('div');
      controls.className = 'dk-section-controls';

      // Drag handle
      const dragBtn = document.createElement('button');
      dragBtn.className = 'dk-section-btn dk-drag-handle';
      dragBtn.innerHTML = '\u2807';
      dragBtn.title = 'Drag to reorder';
      dragBtn.setAttribute('draggable', 'true');
      setupSectionDrag(dragBtn, section);
      controls.appendChild(dragBtn);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'dk-section-btn';
      delBtn.innerHTML = '\u2715';
      delBtn.title = 'Remove section';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeSection(section);
      });
      controls.appendChild(delBtn);

      section.appendChild(controls);
    });
  }

  function removeSection(section) {
    const parent = section.parentElement;
    const nextSibling = section.nextElementSibling;
    section.remove();

    window.DKUndo.push({
      type: 'remove-section',
      undo: () => {
        if (nextSibling && nextSibling.parentElement) {
          parent.insertBefore(section, nextSibling);
        } else {
          parent.appendChild(section);
        }
        injectSectionControls();
      },
      redo: () => {
        section.remove();
      },
      description: 'Remove section'
    });
  }

  function setupSectionDrag(handle, section) {
    handle.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      section.classList.add('dk-section-dragging');
      window._dragSection = section;
    });

    handle.addEventListener('dragend', () => {
      section.classList.remove('dk-section-dragging');
      document.querySelectorAll('.dk-drag-over').forEach(el => el.classList.remove('dk-drag-over'));
      window._dragSection = null;
    });

    section.addEventListener('dragover', (e) => {
      if (!window._dragSection || window._dragSection === section) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      section.classList.add('dk-drag-over');
    });

    section.addEventListener('dragleave', () => {
      section.classList.remove('dk-drag-over');
    });

    section.addEventListener('drop', (e) => {
      e.preventDefault();
      section.classList.remove('dk-drag-over');
      const dragged = window._dragSection;
      if (!dragged || dragged === section) return;

      const parent = section.parentElement;
      const oldNext = dragged.nextElementSibling;

      parent.insertBefore(dragged, section);
      injectSectionControls();

      window.DKUndo.push({
        type: 'reorder-section',
        undo: () => {
          if (oldNext && oldNext.parentElement) {
            parent.insertBefore(dragged, oldNext);
          } else {
            parent.appendChild(dragged);
          }
          injectSectionControls();
        },
        redo: () => {
          parent.insertBefore(dragged, section);
          injectSectionControls();
        },
        description: 'Reorder section'
      });
    });
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

  // ===== INIT =====

  function init() {
    injectSectionControls();

    // Check if this is a fresh session (no content on canvas)
    const canvas = document.getElementById('claude-content');
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
