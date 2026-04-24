// ===== CONFIG =====
const ADMIN_PASSWORD = "ufocases123";

// ===== ELEMENTS =====
const loginWrap = document.getElementById("admin-login");
const protectedWrap = document.getElementById("admin-protected");
const passwordInput = document.getElementById("admin-password");
const loginBtn = document.getElementById("admin-login-btn");
const loginStatus = document.getElementById("admin-login-status");
const signoutBtn = document.getElementById("admin-signout-btn");
const listEl = document.getElementById("admin-list");
const statusEl = document.getElementById("admin-status");

// ===== HELPERS =====
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function mediaHtml(item) {
  if (!item.media_url) return "";

  const url = escapeHtml(item.media_url);
  const type = item.media_type || "";

  if (type.startsWith("video")) {
    return `<video src="${url}" controls></video>`;
  }

  return `<img src="${url}" />`;
}

// ===== LOAD CASES =====
async function loadPending() {
  statusEl.textContent = "Loading cases...";
  listEl.innerHTML = "";

  const url =
    window.UFO_APP_CONFIG.supabaseUrl +
    "/rest/v1/cases?select=*&order=created_at.desc";

  const res = await fetch(url, {
    headers: {
      apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`
    }
  });

  const data = await res.json();

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "case";

    card.innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.location)}</p>
      <p>Status: ${item.status}</p>

      ${mediaHtml(item)}

      <button data-action="approve" data-id="${item.id}">Approve</button>
      <button data-action="reject" data-id="${item.id}">Reject</button>
      <button data-action="delete" data-id="${item.id}">Delete</button>
      <hr>
    `;

    listEl.appendChild(card);
  });
}

// ===== UPDATE STATUS =====
async function updateCase(id, status) {
  await fetch(
    window.UFO_APP_CONFIG.supabaseUrl +
      `/rest/v1/cases?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    }
  );

  loadPending();
}

// ===== DELETE CASE =====
async function deleteCase(id) {
  if (!confirm("Delete this case?")) return;

  // get media path first
  const res = await fetch(
    window.UFO_APP_CONFIG.supabaseUrl +
      `/rest/v1/cases?id=eq.${id}&select=media_path`,
    {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`
      }
    }
  );

  const data = await res.json();

  const mediaPath = data[0]?.media_path;

  // delete file from storage
  if (mediaPath) {
    await fetch(
      window.UFO_APP_CONFIG.supabaseUrl +
        `/storage/v1/object/ufo-media/${mediaPath}`,
      {
        method: "DELETE",
        headers: {
          apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
          Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`
        }
      }
    );
  }

  // delete record
  await fetch(
    window.UFO_APP_CONFIG.supabaseUrl +
      `/rest/v1/cases?id=eq.${id}`,
    {
      method: "DELETE",
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`
      }
    }
  );

  loadPending();
}

// ===== LOGIN =====
function unlockAdmin() {
  const entered = passwordInput.value.trim();

  if (entered !== ADMIN_PASSWORD) {
    loginStatus.textContent = "Wrong password.";
    return;
  }

  sessionStorage.setItem("ufo_admin_unlocked", "yes");

  loginWrap.style.display = "none";
  protectedWrap.style.display = "block";

  loadPending();
}

// ===== LOGOUT =====
function lockAdmin() {
  sessionStorage.removeItem("ufo_admin_unlocked");

  protectedWrap.style.display = "none";
  loginWrap.style.display = "block";
}

// ===== EVENTS =====
loginBtn.addEventListener("click", unlockAdmin);

signoutBtn.addEventListener("click", lockAdmin);

listEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "approve") updateCase(id, "approved");
  if (action === "reject") updateCase(id, "rejected");
  if (action === "delete") deleteCase(id);
});

// ===== AUTO LOGIN =====
if (sessionStorage.getItem("ufo_admin_unlocked")) {
  loginWrap.style.display = "none";
  protectedWrap.style.display = "block";
  loadPending();
}
