(() => {
  const host = document.querySelector('#app-detail');
  if (!host) return;
  const missing = document.querySelector('#detail-not-found');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeAccent = (value) => /^#[\da-f]{6}$/i.test(value || '') ? value : '#00e6f6';
  const pretty = (value) => ({windows:'Windows',android:'Android'}[value] || value);
  const showMissing = () => { host.hidden = true; missing.hidden = false; };
  const id = new URLSearchParams(location.search).get('id');
  if (!id || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) { showMissing(); return; }
  Promise.all([
    fetch(`catalog/listings/${encodeURIComponent(id)}/listing.json`).then((response) => { if (!response.ok) throw new Error('listing'); return response.json(); }),
    fetch(`catalog/listings/${encodeURIComponent(id)}/permissions.json`).then((response) => response.ok ? response.json() : {permissions:[], network_policy:'Not specified'}),
    fetch(`catalog/listings/${encodeURIComponent(id)}/description.md`).then((response) => response.ok ? response.text() : '') ,
    fetch('catalog/categories.json').then((response) => response.ok ? response.json() : [])
  ]).then(([app, permissions, description, categories]) => {
    const category = categories.find((item) => item.id === app.category)?.label || 'Uncategorized';
    const platforms = Object.entries(app.platforms || {}).filter(([, info]) => info?.supported).map(([platform]) => pretty(platform));
    const permissionList = Array.isArray(permissions.permissions) ? permissions.permissions : [];
    const permissionHtml = permissionList.length
      ? `<ul class="detail-list">${permissionList.map((permission) => `<li><code class="permission-key">${esc(permission)}</code></li>`).join('')}</ul>`
      : '<p>No app permissions are claimed in this sample listing.</p>';
    const tags = (app.tags || []).map((tag) => `<span class="tag-pill">${esc(tag)}</span>`).join('');
    const highlights = (app.highlights || []).map((item) => `<li>${esc(item)}</li>`).join('');
    const workflow = (app.workflow || []).map((item) => `<li>${esc(item)}</li>`).join('');
    const desc = String(description || '').split(/\r?\n/).map((line) => line.replace(/^#\s*/, '').replace(/\*\*/g, '').trim()).filter(Boolean).slice(1).join(' ');
    const about = desc || app.summary || '';
    const network = permissions.network_policy || 'Not specified';
    const access = app.access || {};
    const accessNote = access.verification_required === false
      ? 'No user or bot verification is required for this sample.'
      : 'Access policy is configured by the publisher.';
    const release = app.sample || app.release_status === 'sample-not-released' || !app.distribution?.download_url
      ? 'Sample listing only — there is no published package or download URL yet.'
      : 'A published release is listed for this app.';
    document.title = `${app.name} · Muse AI App Store`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `${app.summary} Category: ${category}. Inspect workflow, supported platforms, and permissions.`;
    host.innerHTML = `
      <section class="detail-top" style="--app-accent:${safeAccent(app.accent)}">
        <a class="back-link" href="store.html">← All apps</a>
        <div class="detail-hero">
          <div><div class="eyebrow">${esc(app.label || 'Focused tool')}</div><h1>${esc(app.name)}</h1><p>${esc(app.summary)}</p>
            <div class="detail-badges"><span class="category-pill">${esc(category)}</span><span class="status-pill">Free sample</span><span class="status-pill">Version ${esc(app.version || '—')}</span></div>
          </div>
          <img class="detail-mark" src="catalog/${esc(app.icon || `listings/${id}/icon.svg`)}" alt="${esc(app.name)} app icon">
        </div>
      </section>
      <section class="section detail-layout">
        <div class="detail-main">
          <article class="detail-panel"><h2>What it’s for</h2><p>${esc(app.best_for || app.summary)}</p>${about && about !== app.best_for ? `<p>${esc(about)}</p>` : ''}</article>
          <article class="detail-panel"><h2>How it fits into a workflow</h2>${workflow ? `<ol class="workflow-list">${workflow}</ol>` : '<p>Workflow details have not been supplied.</p>'}</article>
          <article class="detail-panel"><h2>What makes this listing distinct</h2><ul class="detail-list">${highlights || `<li>${esc(app.summary)}</li>`}</ul></article>
          <article class="detail-panel"><h2>Search tags</h2><div class="app-tags">${tags || '<span class="tag-pill">No tags supplied</span>'}</div></article>
        </div>
        <aside class="detail-aside" aria-label="Listing facts">
          <article class="detail-panel"><h2>At a glance</h2><dl class="facts"><div><dt>Category</dt><dd>${esc(category)}</dd></div><div><dt>Platforms</dt><dd>${platforms.map(esc).join(' · ') || 'Not specified'}</dd></div><div><dt>Version</dt><dd>${esc(app.version || '—')}</dd></div><div><dt>Access</dt><dd>${esc(accessNote)}</dd></div></dl></article>
          <article class="detail-panel"><h2>Permissions & network</h2>${permissionHtml}<p class="tiny"><strong>Network policy:</strong> ${esc(network)}</p><p class="detail-footer-note">Permission declarations describe the sample listing and should be reviewed before a real release.</p></article>
          <article class="detail-panel"><h2>Release status</h2><div class="release-state">${esc(release)}</div><p class="detail-footer-note">This page is a catalog listing, not an embedded app or live product preview.</p></article>
          <div class="detail-actions"><a class="button secondary" href="store.html">Back to all apps</a></div>
        </aside>
      </section>`;
    host.setAttribute('aria-busy', 'false');
  }).catch(showMissing);
})();
