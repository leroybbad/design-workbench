// Catalog panel: scans the live canvas for blocks, renders them as a palette.
// Blocks are detected from data-block attributes on the page.
// Clicking a block enters placement mode to stamp another copy.
window.DKCatalog = (function () {
  let blocks = [];
  let selectedBlock = null;
  let onSelect = null;
  let onDeselect = null;

  function load() {
    // Scan the live DOM for unique data-block elements
    blocks = [];
    const canvas = document.getElementById('claude-content');
    if (!canvas) return Promise.resolve();

    const seen = new Map(); // data-block value -> first element
    canvas.querySelectorAll('[data-block]').forEach(el => {
      const name = el.getAttribute('data-block');
      if (!seen.has(name)) {
        seen.set(name, el);
      }
    });

    seen.forEach((el, name) => {
      // Clone and strip workbench injected UI
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.dk-el-controls, .dk-focus-toolbar').forEach(c => c.remove());
      clone.classList.remove('dk-focus-child', 'dk-focused', 'dk-just-placed', 'dk-editing');

      // Derive a readable name from data-block
      const displayName = name
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      // Detect category from context
      let category = 'Components';
      const parent = el.closest('[data-section]');
      if (el.tagName === 'NAV' || name.includes('nav')) category = 'Navigation';
      else if (name.includes('hero') || name.includes('cta')) category = 'Sections';
      else if (name.includes('footer')) category = 'Sections';
      else if (name.includes('card') || name.includes('bento')) category = 'Cards';
      else if (name.includes('feature') || name.includes('row')) category = 'Features';
      else if (name.includes('proof') || name.includes('strip')) category = 'Social Proof';
      else if (parent && el === parent.firstElementChild && el === parent.lastElementChild) category = 'Sections';

      // Count how many of this block are on the page
      const count = canvas.querySelectorAll('[data-block="' + name + '"]').length;

      blocks.push({
        name: name,
        displayName: displayName,
        category: category,
        count: count,
        html: clone.outerHTML,
        // Keep file for compat with placement mode
        file: '_live_' + name
      });
    });

    return Promise.resolve();
  }

  function fetchBlockContent(file) {
    // Find the block by file key and return its HTML
    const block = blocks.find(b => b.file === file);
    return Promise.resolve(block ? block.html : null);
  }

  function getCategories(filter) {
    const filtered = filter
      ? blocks.filter(b =>
          b.displayName.toLowerCase().includes(filter) ||
          b.category.toLowerCase().includes(filter) ||
          b.name.toLowerCase().includes(filter))
      : blocks;

    const groups = {};
    filtered.forEach(b => {
      if (!groups[b.category]) groups[b.category] = [];
      groups[b.category].push(b);
    });
    return groups;
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderPanel(container, selectCallback, deselectCallback) {
    onSelect = selectCallback;
    onDeselect = deselectCallback || null;
    container.innerHTML = '';

    if (blocks.length === 0) {
      container.innerHTML = '<div class="dk-panel-empty">'
        + '<strong>No blocks detected</strong><br>'
        + '<span style="color:#888;font-size:11px;line-height:1.5;">'
        + 'This page has no <code>data-block</code> attributes. '
        + 'Use Comment and Tune to refine, or ask Claude to regenerate with workbench attributes.'
        + '</span></div>';
      return;
    }

    // Search input
    const search = document.createElement('input');
    search.className = 'dk-blocks-search';
    search.placeholder = 'Filter blocks...';
    search.addEventListener('input', () => renderCategories(listContainer, search.value.toLowerCase()));
    container.appendChild(search);

    const listContainer = document.createElement('div');
    container.appendChild(listContainer);
    renderCategories(listContainer, '');
  }

  function renderCategories(container, filter) {
    container.innerHTML = '';
    const groups = getCategories(filter);

    const cats = Object.keys(groups).sort((a, b) => {
      if (a === 'Sections') return -1;
      if (b === 'Sections') return 1;
      return a.localeCompare(b);
    });

    cats.forEach(cat => {
      const catDiv = document.createElement('div');
      catDiv.className = 'dk-blocks-category';

      const title = document.createElement('div');
      title.className = 'dk-blocks-category-title';
      title.textContent = cat + ' (' + groups[cat].length + ')';
      title.addEventListener('click', () => catDiv.classList.toggle('collapsed'));
      catDiv.appendChild(title);

      const list = document.createElement('div');
      list.className = 'dk-blocks-list';

      groups[cat].forEach(block => {
        const item = document.createElement('div');
        item.className = 'dk-block-item';
        if (selectedBlock && selectedBlock.file === block.file) item.classList.add('selected');

        const countBadge = block.count > 1
          ? '<span style="opacity:0.5;font-size:10px;margin-left:4px;">\u00d7' + block.count + '</span>'
          : '';

        item.innerHTML = '<div class="dk-block-item-name">' + escapeHtml(block.displayName) + countBadge + '</div>';
        item.addEventListener('click', () => {
          if (selectedBlock && selectedBlock.file === block.file) {
            selectedBlock = null;
            item.classList.remove('selected');
            if (onDeselect) onDeselect();
          } else {
            selectedBlock = block;
            container.querySelectorAll('.dk-block-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            if (onSelect) onSelect(block);
          }
        });
        list.appendChild(item);
      });

      catDiv.appendChild(list);
      container.appendChild(catDiv);
    });
  }

  function getSelected() { return selectedBlock; }
  function clearSelection() { selectedBlock = null; }
  function getManifest() { return { blocks: blocks }; }

  return { load, fetchBlockContent, renderPanel, getSelected, clearSelection, getManifest };
})();
