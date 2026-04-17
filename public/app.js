const cfg = window.UFO_APP_CONFIG || {};
const hasKeys =
  cfg.supabaseUrl &&
  cfg.supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  cfg.supabaseAnonKey &&
  cfg.supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = hasKeys
  ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
  : null;

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
  qsa('[data-site-name]').forEach(el => {
    el.textContent = cfg.siteName || 'UFO Archive Pro';
  });
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function renderMedia(caseItem) {
  if (!caseItem.media_url) return '';
  if (caseItem.type === 'video') {
    return `<video class="media" controls src="${caseItem.media_url}"></video>`;
  }
  if (caseItem.type === 'image') {
    return `<img class="media" src="${caseItem.media_url}" alt="${escapeHtml(caseItem.title)}">`;
  }
  return `<a class="button button-secondary inline-button" href="${caseItem.media_url}" target="_blank" rel="noreferrer">Open attachment</a>`;
}

function showNotice(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('error', isError);
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

  const filtered = (data || []).filter(item => {
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

  root.innerHTML = filtered.map(item => `
    <article class="glass case-card" data-id="${item.id}">
      <div class="card-top">
        <div>
          <div class="badges">
            <span class="badge">${escapeHtml(item.type)}</span>
            <span class="badge badge-${escapeHtml(item.status)}">${escapeHtml(item.status)}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="meta">${escapeHtml(item.location)} • ${formatDate(item.date_observed || item.created_at)}</p>
        </div>
      </div>
      <p>${escapeHtml(item.summary || '')}</p>
      ${renderMedia(item)}
    </article>
  `).join('');
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
        .map(v => v.trim())
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

  async function updateStatus(id, status) {
  const { error } = await supabaseClient
    .from('cases')
    .update({ status })
    .eq('id', id);

  if (error) {
    alert(error.message);
    return;
  }

  await renderAdminCases();
}

    if (listRoot) {
      listRoot.innerHTML = (data || []).map(item => `
        <article class="glass case-card">
          <h3>${escapeHtml(item.title || 'Untitled')}</h3>
          <p>${escapeHtml(item.description || '')}</p>
          <p><strong>Status:</strong> ${escapeHtml(item.status || 'pending')}</p>
        </article>
      `).join('');
    }
  }

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

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

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
      showNotice(
        notice,
        `Signed in, but no admin profile matched this user. UID: ${user.id}`,
        true
      );
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
  });

  await refreshAuthView();
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
