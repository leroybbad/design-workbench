// Catalog panel: fetches manifest, renders blocks grouped by category, handles search/filter.
window.DKCatalog = (function () {
  let manifest = null;
  let blocks = [];
  let selectedBlock = null;
  let onSelect = null;
  let onDeselect = null;

  async function load() {
    try {
      const res = await fetch('/catalog');
      manifest = await res.json();
      blocks = manifest.blocks || [];
    } catch (e) {
      console.warn('DKCatalog: failed to load manifest', e);
      blocks = [];
    }
  }

  async function fetchBlockContent(file) {
    try {
      const res = await fetch('/catalog/blocks/' + encodeURIComponent(file));
      const data = await res.json();
      return data.content;
    } catch {
      return null;
    }
  }

  function getCategories(filter) {
    const filtered = filter
      ? blocks.filter(b =>
          b.name.toLowerCase().includes(filter) ||
          (b.description || '').toLowerCase().includes(filter) ||
          (b.category || '').toLowerCase().includes(filter))
      : blocks;

    const groups = {};
    filtered.forEach(b => {
      const cat = b.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(b);
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

    // Search input
    const search = document.createElement('input');
    search.className = 'dk-blocks-search';
    search.placeholder = 'Filter blocks...';
    search.addEventListener('input', () => renderCategories(listContainer, search.value.toLowerCase()));
    container.appendChild(search);

    // Category list
    const listContainer = document.createElement('div');
    container.appendChild(listContainer);
    renderCategories(listContainer, '');
  }

  function renderCategories(container, filter) {
    container.innerHTML = '';
    const groups = getCategories(filter);

    // Sort: "Sections" first, then alphabetical
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
        item.innerHTML = '<div class="dk-block-item-name">' + escapeHtml(block.name) + '</div>'
          + (block.description ? '<div class="dk-block-item-desc">' + escapeHtml(block.description) + '</div>' : '');
        item.addEventListener('click', () => {
          if (selectedBlock && selectedBlock.file === block.file) {
            // Toggle off — deselect
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
  function getManifest() { return manifest; }

  return { load, fetchBlockContent, renderPanel, getSelected, clearSelection, getManifest };
})();
