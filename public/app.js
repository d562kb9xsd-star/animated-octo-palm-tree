const cfg = window.UFO_APP_CONFIG || {};
const hasKeys = cfg.supabaseUrl && cfg.supabaseUrl !== 'YOUR_SUPABASE_URL' && cfg.supabaseAnonKey && cfg.supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';
const supabaseClient = hasKeys ? window.supabaseClient.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setSiteName() {
  qsa('[data-site-name]').forEach(el => el.textContent = cfg.siteName || 'UFO Archive Pro');
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderMedia(caseItem) {
  if (!caseItem.media_url) return '';
  if (caseItem.type === 'video') return `<video class="media" controls src="${caseItem.media_url}"></video>`;
  if (caseItem.type === 'image') return `<img class="media" src="${caseItem.media_url}" alt="${escapeHtml(caseItem.title)}">`;
  return `<a class="button button-secondary inline-button" href="${caseItem.media_url}" target="_blank" rel="noreferrer">Open attachment</a>`;
}

function caseCard(caseItem, admin = false) {
  return `
    <article class="glass case-card" data-id="${caseItem.id}">
      <div class="card-top">
        <div>
          <div class="badges">
            <span class="badge">${escapeHtml(caseItem.type)}</span>
            <span class="badge badge-${escapeHtml(caseItem.status)}">${escapeHtml(caseItem.status)}</span>
          </div>
          <h3>${escapeHtml(caseItem.title)}</h3>
          <p class="meta">${escapeHtml(caseItem.location)} • ${formatDate(caseItem.date_observed || caseItem.created_at)}</p>
        </div>
      </div>
      <p>${escapeHtml(caseItem.summary || '')}</p>
      ${renderMedia(caseItem)}
      ${(caseItem.tags || []).length ? `<div class="badges">${caseItem.tags.map(t => `<span class="badge">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      <div class="card-actions">
        <button class="button button-secondary" data-view="${caseItem.id}">View details</button>
        ${admin ? `
          <button class="button button-secondary" data-approve="${caseItem.id}">Approve</button>
          <button class="button button-secondary" data-reject="${caseItem.id}">Reject</button>
          <button class="button button-danger" data-delete="${caseItem.id}">Delete</button>
        ` : ''}
      </div>
    </article>
  `;
}

function caseDetails(caseItem) {
  return `
    <div class="case-detail">
      <div class="badges">
        <span class="badge">${escapeHtml(caseItem.type)}</span>
        <span class="badge badge-${escapeHtml(caseItem.status)}">${escapeHtml(caseItem.status)}</span>
        <span class="badge">${escapeHtml(caseItem.location)}</span>
      </div>
      <h2>${escapeHtml(caseItem.title)}</h2>
      <p class="meta">Observed: ${formatDate(caseItem.date_observed || caseItem.created_at)}</p>
      <p>${escapeHtml(caseItem.summary || '')}</p>
      ${renderMedia(caseItem)}
      ${caseItem.description ? `<h3>Description</h3><p>${escapeHtml(caseItem.description)}</p>` : ''}
      ${caseItem.case_study ? `<h3>Case study</h3><p>${escapeHtml(caseItem.case_study).replace(/\n/g, '<br>')}</p>` : ''}
      ${caseItem.submitter_email ? `<p class="meta">Submitter email: ${escapeHtml(caseItem.submitter_email)}</p>` : ''}
    </div>
  `;
}

function showNotice(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('error', isError);
}

async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabaseClient.auth.getUser();
  return data.user || null;
}

async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  const { data, error } = await supabaseClient.from('profiles').select('role').eq('id', user.id).single();
  if (error) return false;
  return data.role === 'admin';
}

async function uploadMedia(file) {
  if (!file) return { path: '', url: '' };
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { data, error } = await supabaseClient.storage.from('ufo-media').upload(safeName, file, { upsert: false });
  if (error) throw error;
  const { data: pub } = supabaseClient.storage.from('ufo-media').getPublicUrl(data.path);
  return { path: data.path, url: pub.publicUrl };
}

async function loadArchive() {
  const root = qs('#archive-results');
  if (!root) return;
  if (!supabase) {
    root.innerHTML = '<div class="glass empty-state">Add your Supabase keys in <code>config.js</code> to load live data.</div>';
    return;
  }

  const search = (qs('#search')?.value || '').toLowerCase().trim();
  const type = qs('#type-filter')?.value || 'all';

  let query = supabaseClient.from('cases').select('*').eq('status', 'approved').order('created_at', { ascending: false });
  if (type !== 'all') query = query.eq('type', type);
  const { data, error } = await query;
  if (error) {
    root.innerHTML = `<div class="glass empty-state">${escapeHtml(error.message)}</div>`;
    return;
  }

  const filtered = (data || []).filter(item => {
    if (!search) return true;
    return [item.title, item.location, item.summary, item.description, item.case_study, ...(item.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  if (!filtered.length) {
    root.innerHTML = '<div class="glass empty-state">No approved cases match that search.</div>';
    return;
  }
  root.innerHTML = filtered.map(item => caseCard(item)).join('');
  bindDetailButtons(filtered);
}

function bindDetailButtons(items) {
  qsa('[data-view]').forEach(btn => {
    btn.onclick = () => {
      const selected = items.find(item => item.id === btn.dataset.view);
      if (!selected) return;
      qs('#case-modal-content').innerHTML = caseDetails(selected);
      qs('#case-modal')?.classList.remove('hidden');
    };
  });
}

function bindModalClose() {
  qsa('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => qs('#case-modal')?.classList.add('hidden'));
  });
}

async function handleSubmit() {
  const form = qs('#submit-form');
  if (!form) return;
  const notice = qs('#submit-notice');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabase) {
      showNotice(notice, 'Add your Supabase keys in config.js first.', true);
      return;
    }
    try {
      showNotice(notice, 'Uploading and saving your case...');
      const formData = new FormData(form);
      const file = formData.get('media');
      const upload = file && file.size ? await uploadMedia(file) : { path: '', url: '' };
      const tags = String(formData.get('tags') || '').split(',').map(v => v.trim()).filter(Boolean);
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

async function handleAdmin(loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = qs('#admin-email')?.value;
  const password = qs('#admin-password')?.value;

  if (!supabaseClient) {
    showNotice(notice, 'Supabase not configured', true);
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showNotice(notice, error.message, true);
    return;
  }

  showNotice(notice, 'Login successful');
  
  loginView.classList.add('hidden');
  adminView.classList.remove('hidden');

  renderAdminCases();
});) {
  const loginView = qs('#login-view');
  const adminView = qs('#admin-view');
  const loginForm = qs('#admin-login-form');
  const notice = qs('#admin-notice');
  const logout = qs('#logout-button');
  const listRoot = qs('#admin-cases');
  if (!loginView || !adminView) return;

  async function renderAdminCases() {
    const { data, error } = await supabaseClient.from('cases').select('*').order('created_at', { ascending: false });
    if (error) {
      listRoot.innerHTML = `<div class="glass empty-state">${escapeHtml(error.message)}</div>`;
      return;
    }
    listRoot.innerHTML = data.map(item => caseCard(item, true)).join('');
    bindDetailButtons(data);

    qsa('[data-approve]').forEach(btn => btn.onclick = () => updateStatus(btn.dataset.approve, 'approved'));
    qsa('[data-reject]').forEach(btn => btn.onclick = () => updateStatus(btn.dataset.reject, 'rejected'));
    qsa('[data-delete]').forEach(btn => btn.onclick = () => deleteCase(btn.dataset.delete));
  }

  async function updateStatus(id, status) {
    const { error } = await supabaseClient.from('cases').update({ status }).eq('id', id);
    if (error) return showNotice(notice, error.message, true);
    showNotice(notice, `Case ${status}.`);
    renderAdminCases();
  }

  async function deleteCase(id) {
    const { data: item } = await supabaseClient.from('cases').select('media_path').eq('id', id).single();
    if (item?.media_path) await supabaseClient.storage.from('ufo-media').remove([item.media_path]);
    const { error } = await supabaseClient.from('cases').delete().eq('id', id);
    if (error) return showNotice(notice, error.message, true);
    showNotice(notice, 'Case deleted.');
    renderAdminCases();
  }

  async function refreshAuthView() {
    if (!supabase) {
      loginView.classList.remove('hidden');
      adminView.classList.add('hidden');
      showNotice(notice, 'Add your Supabase keys in config.js first.', true);
      return;
    }
    const admin = await isAdmin();
    loginView.classList.toggle('hidden', admin);
    adminView.classList.toggle('hidden', !admin);
    if (admin) renderAdminCases();
  }

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const email = qs('#admin-email').value;
      const password = qs('#admin-password').value;
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!(await isAdmin())) throw new Error('Signed in, but this account is not marked as an admin in profiles.');
      showNotice(notice, 'Signed in.');
      refreshAuthView();
    } catch (error) {
      showNotice(notice, error.message || 'Login failed.', true);
    }
  });

  logout?.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    refreshAuthView();
  });

  refreshAuthView();
}

function bindArchiveFilters() {
  qs('#search')?.addEventListener('input', loadArchive);
  qs('#type-filter')?.addEventListener('change', loadArchive);
}

setSiteName();
bindModalClose();
bindArchiveFilters();
loadArchive();
handleSubmit();
handleAdmin();
