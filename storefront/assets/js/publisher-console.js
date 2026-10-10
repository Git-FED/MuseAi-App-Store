(() => {
  const form = document.querySelector('#publisher-form');
  if (!form) return;
  const $ = (id) => document.getElementById(id);
  const output = $('json-output');
  const download = $('download-json');
  const iconInput = $('app-icon');
  const bannerInput = $('app-banner');
  const packageInput = $('package-file');
  let listing = null;
  let bannerUrl = '';

  const selected = (select) => [...select.selectedOptions].map((option) => option.value);
  const safeUrl = (value) => { try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'github.com' ? value : null; } catch (_) { return null; } };
  const digest = async (file) => file && crypto?.subtle ? [...new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()))].map((b) => b.toString(16).padStart(2, '0')).join('') : null;
  const renderImage = (file) => { if (!file) return; if (bannerUrl) URL.revokeObjectURL(bannerUrl); bannerUrl = URL.createObjectURL(file); $('preview-art').style.backgroundImage = `url(${bannerUrl})`; $('preview-art').classList.add('has-image'); $('preview-art').textContent = ''; };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const repo = safeUrl($('github-repo').value.trim());
    const release = safeUrl($('github-release').value.trim());
    if (!repo || !release) { alert('Use HTTPS github.com URLs for both the repository and release.'); return; }
    const packageHash = await digest(packageInput.files[0]);
    listing = {
      schema_version: '1.0', app_id: $('app-id').value.trim(), name: $('app-name').value.trim(), version: $('app-version').value.trim(), summary: $('app-summary').value.trim(),
      publisher: { github_username: 'OWNER_GITHUB_USERNAME', publication_control: 'owner-only' },
      tier: $('app-tier').value, sample: $('app-tier').value === 'free', verification_required: $('app-tier').value !== 'free',
      platforms: Object.fromEntries(selected($('app-platforms')).map((platform) => [platform, { supported: true, requirements_document: `installation/${platform}/README.md` }])),
      category: $('app-category').value.trim() || 'utilities', tags: $('app-tags').value.split(',').map((x) => x.trim()).filter(Boolean),
      permissions: $('app-permissions').value.split(',').map((x) => x.trim()).filter(Boolean),
      distribution: { provider: 'github', repository: repo.replace('https://github.com/', ''), release_url: release, download_url: release, sha256: packageHash },
      access: { verification_required: $('app-tier').value !== 'free', github_account_required: $('app-tier').value !== 'free', approved_email_required: $('app-tier').value !== 'free', human_terms_acceptance_required: false, agent_terms_acceptance_required: false },
      muse_attribution: { agent_name: 'Muse', creation_record: 'muse-attribution.json', listing_attribution_required: true, package_attribution_required: true }
    };
    $('preview-name').textContent = listing.name; $('preview-summary').textContent = listing.summary;
    $('preview-meta').textContent = `${listing.tier === 'free' ? '100% free sample' : 'Subscriber'} · ${Object.keys(listing.platforms).join(' · ')} · ${packageHash ? 'SHA-256 calculated' : 'No package hash selected'}`;
    output.textContent = JSON.stringify(listing, null, 2); download.disabled = false;
    renderImage(bannerInput.files[0]);
  });
  download.addEventListener('click', () => { if (!listing) return; const blob = new Blob([JSON.stringify(listing, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${listing.app_id}-listing.json`; link.click(); URL.revokeObjectURL(link.href); });
  bannerInput.addEventListener('change', () => renderImage(bannerInput.files[0]));
  $('clear-form').addEventListener('click', () => { form.reset(); output.textContent = '{}'; download.disabled = true; listing = null; $('preview-name').textContent = 'Your app'; $('preview-summary').textContent = 'Fill in the form to preview the public card.'; $('preview-meta').textContent = 'No listing generated yet.'; $('preview-art').style.backgroundImage = ''; $('preview-art').textContent = 'Image preview'; });
})();
