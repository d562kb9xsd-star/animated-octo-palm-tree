const cfg = window.UFO_APP_CONFIG || {};
const hasKeys =
  cfg.supabaseUrl &&
  cfg.supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  cfg.supabaseAnonKey &&
  cfg.supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = hasKeys
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showNotice(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.toggle('error', isError);
}

function renderMedia(caseItem) {
  if (!caseItem.media_url) return '';

  if (caseItem.type === 'video') {
    return `<video class="media" controls src="${caseItem.media_url}"></video>`;
  }

  if (caseItem.type === 'image') {
    return `<img class="media" src="${caseItem.media_url}" alt="${escapeHtml(caseItem.title || '')}">`;
  }

  return `<a class="button button-secondary" href="${caseItem.media_url}" target="_blank" rel="noreferrer">Open attachment</a>`;
}

function getCaseUrl(id) {
  return `case.html?id=${encodeURIComponent(id)}`;
}

async function getCurrentUser() {
  if (!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getUser();
  return data.user || null;
}

async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) return false;
  return data.role === 'admin';
}

async function uploadMedia(file) {
  if (!file) return { path: '', url: '' };

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { data, error } = await supabaseClient
    .storage
    .from('ufo-media')
    .upload(safeName, file, { upsert: false });

  if (error) throw error;

  const { data: pub } = supabaseClient
    .storage
    .from('ufo-media')
    .getPublicUrl(data.path);

  return { path: data.path, url: pub.publicUrl };
}

function caseDetails(caseItem) {
  return `
    <div class="case-detail">
      <div class="badges">
        <span class="badge">${escapeHtml(caseItem.type || '')}</span>
        <span class="badge badge-${escapeHtml(caseItem.status || 'approved')}">${escapeHtml(caseItem.status || 'approved')}</span>
        ${caseItem.location ? `<span class="badge">${escapeHtml(caseItem.location)}</span>` : ''}
      </div>
      <h2>${escapeHtml(caseItem.title || 'Untitled')}</h2>
      <p class="meta">Observed: ${formatDate(caseItem.date_observed || caseItem.created_at)}</p>
      <p>${escapeHtml(caseItem.summary || '')}</p>
      ${renderMedia(caseItem)}
      ${caseItem.description ? `<h3>Description</h3><p>${escapeHtml(caseItem.description).replace(/\n/g, '<br>')}</p>` : ''}
      ${caseItem.case_study ? `<h3>Case study</h3><p>${escapeHtml(caseItem.case_study).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="card-actions">
        <a class="button button-primary" href="${getCaseUrl(caseItem.id)}">Open full case page</a>
      </div>
    </div>
  `;
}

function bindModalClose() {
  qsa('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => qs('#case-modal')?.classList.add('hidden'));
  });
}

function bindDetailButtons(items) {
  qsa('[data-view]').forEach((btn) => {
    btn.onclick = () => {
      const selected = items.find((item) => String(item.id) === String(btn.dataset.view));
      if (!selected) return;

      const content = qs('#case-modal-content');
      if (content) content.innerHTML = caseDetails(selected);

      qs('#case-modal')?.classList.remove('hidden');
    };
  });
}

async function fetchApprovedCases(limit = null) {
  if (!supabaseClient) return { data: [], error: new Error('Supabase not configured') };

  let query = supabaseClient
    .from('cases')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  return await query;
}

async function loadHome() {
  const featuredRoot = qs('#featured-case');
  const latestRoot = qs('#home-latest-cases');
  if (!featuredRoot && !latestRoot) return;
  if (!supabaseClient) return;

  const { data, error } = await fetchApprovedCases(8);

  if (error) {
    if (featuredRoot) featuredRoot.innerHTML = `<div class="glass empty-state">${escapeHtml(error.message)}</div>`;
    if (latestRoot) latestRoot.innerHTML = `<div class="glass empty-state">${escapeHtml(error.message)}</div>`;
    return;
  }

  const items = data || [];
  const featured = items[0];
  const latest = items.slice(1, 7);

  const approvedEl = qs('#stat-approved');
  const mediaEl = qs('#stat-media');
  const locationsEl = qs('#stat-locations');

  if (approvedEl) approvedEl.textContent = items.length;
  if (mediaEl) mediaEl.textContent = items.filter(i => i.media_url).length;
  if (locationsEl) locationsEl.textContent = new Set(items.map(i => i.location).filter(Boolean)).size;

  if (featuredRoot) {
    if (!featured) {
      featuredRoot.innerHTML = `<div class="glass empty-state">No approved case files yet.</div>`;
    } else {
      featuredRoot.innerHTML = `
        <article class="glass case-card">
          <div class="badges">
            <span class="badge">${escapeHtml(featured.type || '')}</span>
            <span class="badge badge-approved">approved</span>
          </div>
          <h3>${escapeHtml(featured.title || 'Untitled')}</h3>
          <p class="meta">${escapeHtml(featured.location || 'Unknown location')} • ${formatDate(featured.date_observed || featured.created_at)}</p>
          <p>${escapeHtml(featured.summary || '')}</p>
          ${renderMedia(featured)}
          <div class="card-actions">
            <a class="button button-primary" href="${getCaseUrl(featured.id)}">Open case file</a>
            <a class="button button-secondary" href="archive.html">Browse archive</a>
          </div>
        </article>
      `;
    }
  }

  if (latestRoot) {
    if (!latest.length) {
      latestRoot.innerHTML = `<div class="glass empty-state">Approve more cases to populate this section.</div>`;
    } else {
      latestRoot.innerHTML = latest.map((item) => `
        <article class="glass case-card">
          <div class="badges">
            <span class="badge">${escapeHtml(item.type || '')}</span>
            <span class="badge badge-approved">approved</span>
          </div>
          <h3>${escapeHtml(item.title || 'Untitled')}</h3>
          <p class="meta">${escapeHtml(item.location || 'Unknown location')} • ${formatDate(item.date_observed || item.created_at)}</p>
          <p>${escapeHtml(item.summary || '')}</p>
          ${renderMedia(item)}
          <div class="card-actions">
            <a class="button button-primary" href="${getCaseUrl(item.id)}">Open case file</a>
          </div>
        </article>
      `).join('');
    }
  }
}

async function loadArchive() {
  const root = qs('#archive-results');
  if (!root) return;

  if (!supabaseClient) {
    root.innerHTML = '<div class="glass empty-state">Add your Supabase keys in config.js to load live data.</div>';
    return;
  }

  const search = (qs('#search')?.value || '').toLowerCase().trim();
  const type = qs('#type-filter')?.value || 'all';

  let query = supabaseClient
    .from('cases')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (type !== 'all') query = query.eq('type', type);

  const { data, error } = await query;

  if (error) {
    root.innerHTML = `<div class="glass empty-state">${escapeHtml(error.message)}</div>`;
    return;
  }

  const filtered = (data || []).filter((item) => {
    if (!search) return true;

    return [
      item.title,
      item.location,
      item.summary,
      item.description,
      item.case_study,
      ...(item.tags || [])
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  if (!filtered.length) {
    root.innerHTML = '<div class="glass empty-state">No approved cases match that search.</div>';
    return;
  }

  root.innerHTML = filtered.map((item) => `
    <article class="glass case-card">
      <div class="badges">
        <span class="badge">${escapeHtml(item.type || '')}</span>
        <span class="badge badge-approved">approved</span>
      </div>
      <h3>${escapeHtml(item.title || 'Untitled')}</h3>
      <p class="meta">${escapeHtml(item.location || 'Unknown location')} • ${formatDate(item.date_observed || item.created_at)}</p>
      <p>${escapeHtml(item.summary || '')}</p>
      ${renderMedia(item)}
      <div class="card-actions">
        <button class="button button-secondary" data-view="${item.id}">Quick view</button>
        <a class="button button-primary" href="${getCaseUrl(item.id)}">Full case page</a>
      </div>
    </article>
  `).join('');

  bindDetailButtons(filtered);
}

async function loadMapView() {
  const root = qs('#map-results');
  if (!root) return;
  if (!supabaseClient) return;

  const { data, error } = await fetchApprovedCases();

  if (error) {
    root.innerHTML = `<div class="glass empty-state">${escapeHtml(error.message)}</div>`;
    return;
  }

  const items = data || [];
  const groups = {};

  items.forEach((item) => {
    const key = item.location?.trim() || 'Unknown location';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const locations = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

  if (!locations.length) {
    root.innerHTML = `<div class="glass empty-state">No approved cases with location data yet.</div>`;
    return;
  }

  root.innerHTML = locations.map(([location, cases]) => `
    <article class="glass map-card">
      <div class="eyebrow">${cases.length} case${cases.length > 1 ? 's' : ''}</div>
      <h3 style="margin-top:12px;">${escapeHtml(location)}</h3>
      <div class="map-list">
        ${cases.slice(0, 6).map((item) => `
          <a href="${getCaseUrl(item.id)}">
            <strong>${escapeHtml(item.title || 'Untitled')}</strong>
            <div class="meta">${formatDate(item.date_observed || item.created_at)} · ${escapeHtml(item.type || '')}</div>
          </a>
        `).join('')}
      </div>
    </article>
  `).join('');
}

async function loadCasePage() {
  const root = qs('#case-page-content');
  if (!root) return;
  if (!supabaseClient) {
    root.innerHTML = `<div class="glass empty-state">Supabase is not configured.</div>`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    root.innerHTML = `<div class="glass empty-state">No case ID was provided.</div>`;
    return;
  }

  const { data, error } = await supabaseClient
    .from('cases')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();

  if (error || !data) {
    root.innerHTML = `<div class="glass empty-state">Case not found.</div>`;
    return;
  }

  root.innerHTML = `
    <article class="glass case-page-card">
      <div class="eyebrow">Released public case file</div>
      <div class="badges" style="margin-top:14px;">
        <span class="badge">${escapeHtml(data.type || '')}</span>
        <span class="badge badge-approved">approved</span>
        ${data.location ? `<span class="badge">${escapeHtml(data.location)}</span>` : ''}
      </div>

      <h1>${escapeHtml(data.title || 'Untitled')}</h1>
      <p class="meta">Observed: ${formatDate(data.date_observed || data.created_at)}</p>

      <div class="case-page-body">
        <div class="case-page-section">
          <h3>Summary</h3>
          <p>${escapeHtml(data.summary || 'No summary provided.').replace(/\n/g, '<br>')}</p>
        </div>

        ${data.media_url ? `
          <div class="case-page-section">
            <h3>Evidence</h3>
            ${renderMedia(data)}
          </div>
        ` : ''}

        ${data.description ? `
          <div class="case-page-section">
            <h3>Detailed description</h3>
            <p>${escapeHtml(data.description).replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}

        ${data.case_study ? `
          <div class="case-page-section">
            <h3>Case notes / witness report</h3>
            <p>${escapeHtml(data.case_study).replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}

        ${(data.tags || []).length ? `
          <div class="case-page-section">
            <h3>Tags</h3>
            <div class="badges">
              ${(data.tags || []).map(tag => `<span class="badge">#${escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="card-actions">
          <a class="button button-secondary" href="archive.html">Back to archive</a>
          <a class="button button-secondary" href="map.html">Open map</a>
        </div>
      </div>
    </article>
  `;
}

async function handleSubmit() {
  const form = qs('#submit-form');
  if (!form) return;

  const notice = qs('#submit-notice');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!supabaseClient) {
      showNotice(notice, 'Add your Supabase keys in config.js first.', true);
      return;
    }

    try {
      showNotice(notice, 'Uploading and saving your case...');

      const formData = new FormData(form);
      const file = formData.get('media');
      const upload = file && file.size ? await uploadMedia(file) : { path: '', url: '' };
      const tags = String(formData.get('tags') || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      const user = await getCurrentUser();

      const payload = {
        title: String(formData.get('title') || '').trim(),
        type: String(formData.get('type') || '').trim(),
        date_observed: formData.get('date_observed') || null,
        location: String(formData.get('location') || '').trim(),
        summary: String(formData.get('summary') || '').trim(),
        description: String(formData.get('description') || '').trim(),
        case_study: String(formData.get('case_study') || '').trim(),
        tags,
        media_path: upload.path,
        media_url: upload.url,
        status: 'pending',
        submitter_email: String(formData.get('submitter_email') || '').trim() || null,
        created_by: user?.id || null
      };

      const { error } = await supabaseClient.from('cases').insert(payload);
      if (error) throw error;

      form.reset();
      showNotice(notice, 'Submission received. It is now pending review.');
    } catch (error) {
      showNotice(notice, error.message || 'Submission failed.', true);
    }
  });
}

async function handleAdmin() {
  const loginView = qs('#login-view');
  const adminView = qs('#admin-view');
  const loginForm = qs('#admin-login-form');
  const notice = qs('#admin-notice');
  const logout = qs('#logout-button');
  const listRoot = qs('#admin-cases');

  if (!loginView || !adminView || !loginForm) return;

  let currentAdminFilter = 'pending';

  async function renderAdminCases() {
    let query = supabaseClient
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (currentAdminFilter !== 'all') {
      query = query.eq('status', currentAdminFilter);
    }

    const { data, error } = await query;

    if (error) {
      showNotice(notice, error.message, true);
      return;
    }

    if (!listRoot) return;

    window.adminCases = data || [];

    const toolbar = `
      <div class="glass archive-toolbar">
        <button class="button ${currentAdminFilter === 'pending' ? '' : 'button-secondary'}" onclick="window.setAdminFilter('pending')">Pending</button>
        <button class="button ${currentAdminFilter === 'approved' ? '' : 'button-secondary'}" onclick="window.setAdminFilter('approved')">Approved</button>
        <button class="button ${currentAdminFilter === 'rejected' ? '' : 'button-secondary'}" onclick="window.setAdminFilter('rejected')">Rejected</button>
        <button class="button ${currentAdminFilter === 'all' ? '' : 'button-secondary'}" onclick="window.setAdminFilter('all')">All</button>
      </div>
    `;

    const cards = (data || []).map((item) => `
      <article class="glass case-card">
        <div class="badges">
          <span class="badge">${escapeHtml(item.type || '')}</span>
          <span class="badge badge-${escapeHtml(item.status || 'pending')}">${escapeHtml(item.status || 'pending')}</span>
        </div>
        <h3>${escapeHtml(item.title || 'Untitled')}</h3>
        <p class="meta">${escapeHtml(item.location || 'Unknown location')} • ${formatDate(item.date_observed || item.created_at)}</p>
        <p>${escapeHtml(item.description || item.summary || '')}</p>
        ${item.media_url ? renderMedia(item) : ''}
        <div class="card-actions">
          <button class="button" onclick="window.updateCaseStatus('${item.id}', 'approved')">Approve</button>
          <button class="button button-secondary" onclick="window.updateCaseStatus('${item.id}', 'rejected')">Reject</button>
          <button class="button button-secondary" onclick="window.viewAdminCase('${item.id}')">View</button>
          <button class="button button-danger" onclick="window.deleteAdminCase('${item.id}')">Delete</button>
        </div>
      </article>
    `).join('');

    listRoot.innerHTML = toolbar + ((data || []).length
      ? `<div class="cases-grid">${cards}</div>`
      : `<div class="glass empty-state">No ${escapeHtml(currentAdminFilter)} cases found.</div>`);
  }

  async function updateStatus(id, status) {
    const { error } = await supabaseClient
      .from('cases')
      .update({ status })
      .eq('id', id);

    if (error) {
      showNotice(notice, error.message, true);
      return;
    }

    showNotice(notice, `Case ${status}.`);
    await renderAdminCases();
  }

  async function deleteCase(id) {
    const { data: item } = await supabaseClient
      .from('cases')
      .select('media_path')
      .eq('id', id)
      .maybeSingle();

    if (item?.media_path) {
      await supabaseClient.storage.from('ufo-media').remove([item.media_path]);
    }

    const { error } = await supabaseClient
      .from('cases')
      .delete()
      .eq('id', id);

    if (error) {
      showNotice(notice, error.message, true);
      return;
    }

    showNotice(notice, 'Case deleted.');
    await renderAdminCases();
  }

  window.updateCaseStatus = updateStatus;
  window.deleteAdminCase = deleteCase;
  window.setAdminFilter = async function (filter) {
    currentAdminFilter = filter;
    await renderAdminCases();
  };

  window.viewAdminCase = function (id) {
    const selected = (window.adminCases || []).find((item) => String(item.id) === String(id));
    if (!selected) return;

    const content = qs('#case-modal-content');
    if (content) content.innerHTML = caseDetails(selected);

    qs('#case-modal')?.classList.remove('hidden');
  };

  async function refreshAuthView() {
    if (!supabaseClient) {
      loginView.classList.remove('hidden');
      adminView.classList.add('hidden');
      showNotice(notice, 'Supabase not configured', true);
      return;
    }

    const admin = await isAdmin();
    loginView.classList.toggle('hidden', admin);
    adminView.classList.toggle('hidden', !admin);

    if (admin) {
      await renderAdminCases();
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = qs('#admin-email')?.value?.trim();
    const password = qs('#admin-password')?.value;

    if (!supabaseClient) {
      showNotice(notice, 'Supabase not configured', true);
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      showNotice(notice, error.message, true);
      return;
    }

    const user = data?.user;
    if (!user) {
      showNotice(notice, 'Login failed', true);
      return;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      showNotice(notice, profileError.message, true);
      return;
    }

    if (!profile || profile.role !== 'admin') {
      showNotice(notice, `Signed in, but no admin profile matched this user. UID: ${user.id}`, true);
      return;
    }

    showNotice(notice, 'Signed in.');
    loginView.classList.add('hidden');
    adminView.classList.remove('hidden');
    await renderAdminCases();
  });

  logout?.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    adminView.classList.add('hidden');
    loginView.classList.remove('hidden');
    if (notice) notice.classList.add('hidden');
  });

  await refreshAuthView();
}

function bindArchiveFilters() {
  qs('#search')?.addEventListener('input', loadArchive);
  qs('#type-filter')?.addEventListener('change', loadArchive);
}

bindModalClose();
bindArchiveFilters();
loadHome();
loadArchive();
loadMapView();
loadCasePage();
handleSubmit();
handleAdmin();
