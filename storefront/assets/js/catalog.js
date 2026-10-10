(() => {
  const grid = document.querySelector('#catalog-grid');
  if (!grid) return;
  const search = document.querySelector('#catalog-search');
  const filters = document.querySelector('#category-filters');
  const empty = document.querySelector('#catalog-empty');
  const error = document.querySelector('#catalog-error');
  const resultCount = document.querySelector('#result-count');
  const counts = document.querySelector('#catalog-counts');
  let apps = [];
  let categories = [];
  let selected = 'all';
  const featured = new Set(['muse-hash', 'muse-verify', 'muse-catalog-lint', 'prompt-vault', 'feed-watcher']);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeAccent = (value) => /^#[\da-f]{6}$/i.test(value || '') ? value : '#00e6f6';
  const categoryName = (id) => categories.find((item) => item.id === id)?.label || 'Uncategorized';
  const visibleApps = () => apps.filter((app) => featured.has(app.id));
  const appCard = (app) => {
    const tags = (app.tags || []).slice(0, 4).map((tag) => `<span class="tag-pill">${esc(tag)}</span>`).join('');
    const platforms = (app.platforms || []).map((x) => ({windows:'Windows',android:'Android'}[x] || x)).join(' · ') || 'Platforms not specified';
    return `<article class="app-card" style="--app-accent:${safeAccent(app.accent)}">
      <div class="app-card-top"><img class="app-mark" src="catalog/${esc(app.icon)}" alt="${esc(app.name)} app icon" loading="lazy"><span class="app-card-label">${esc(app.label || 'Focused tool')}</span></div>
      <h3 class="app-title">${esc(app.name)}</h3><p class="app-card-summary">${esc(app.summary)}</p>
      <p class="app-card-note">${esc(app.card_note || app.best_for || '')}</p>
      <div class="app-card-meta"><span class="category-pill">${esc(categoryName(app.category))}</span><span class="status-pill">Free sample</span><span class="status-pill">${esc(platforms)}</span></div>
      <div class="app-tags" aria-label="Search tags">${tags}</div>
      <div class="app-card-footer"><span class="app-version">Version ${esc(app.version || '—')} · Not released</span><a class="button secondary" href="app.html?id=${encodeURIComponent(app.id)}" aria-label="View ${esc(app.name)} details">View details</a></div>
    </article>`;
  };
  const render = () => {
    const term = search.value.trim().toLocaleLowerCase();
    const list = visibleApps().filter((app) => {
      const categoryMatch = selected === 'all' || app.category === selected;
      const searchable = [app.name, app.summary, app.label, app.best_for, app.card_note, app.category, ...(app.tags || [])].join(' ').toLocaleLowerCase();
      return categoryMatch && (!term || searchable.includes(term));
    });
    grid.innerHTML = list.map(appCard).join('');
    grid.setAttribute('aria-busy', 'false');
    resultCount.textContent = `${list.length} ${list.length === 1 ? 'app' : 'apps'} shown`;
    empty.hidden = list.length !== 0;
  };
  const renderFilters = () => {
    const activeCategories = categories.filter((category) => visibleApps().some((app) => app.category === category.id));
    const all = [{id:'all', label:'All apps'}].concat(activeCategories);
    filters.innerHTML = all.map((category) => {
      const n = category.id === 'all' ? visibleApps().length : visibleApps().filter((app) => app.category === category.id).length;
      return `<button type="button" class="category-filter" data-category="${esc(category.id)}" aria-pressed="${selected === category.id}">${esc(category.label)}<span class="filter-count">${n}</span></button>`;
    }).join('');
  };
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    selected = button.dataset.category;
    renderFilters();
    render();
  });
  search.addEventListener('input', render);
  document.querySelector('#clear-filters').addEventListener('click', () => {
    selected = 'all'; search.value = ''; renderFilters(); render(); search.focus();
  });
  Promise.all([fetch('catalog/index.json').then((response) => { if (!response.ok) throw new Error(); return response.json(); }), fetch('catalog/categories.json').then((response) => { if (!response.ok) throw new Error(); return response.json(); })])
    .then(([catalog, categoryData]) => {
      apps = catalog;
      categories = categoryData;
      const shown = visibleApps();
      counts.innerHTML = `<span class="count-pill">${shown.length} focused apps</span><span class="count-pill">${categories.filter((category) => shown.some((app) => app.category === category.id)).length} categories</span><span class="count-pill">Every listing shows its permission profile</span>`;
      renderFilters(); render();
    })
    .catch(() => { grid.setAttribute('aria-busy', 'false'); error.hidden = false; });
})();
