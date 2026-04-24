const ADMIN_PASSWORD = "ufocases123";

const loginWrap = document.getElementById("admin-login");
const protectedWrap = document.getElementById("admin-protected");
const passwordInput = document.getElementById("admin-password");
const loginBtn = document.getElementById("admin-login-btn");
const signoutBtn = document.getElementById("admin-signout-btn");
const listEl = document.getElementById("admin-list");

// LOAD CASES
async function loadCases() {
  listEl.innerHTML = "Loading...";

  const res = await fetch(
    window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?select=*&order=created_at.desc&_=" +
      Date.now(),
    {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`,
        "Cache-Control": "no-cache"
      }
    }
  );

  const data = await res.json();

  listEl.innerHTML = "";

  if (!data.length) {
    listEl.innerHTML = "<p>No pending cases.</p>";
    return;
  }

  data.forEach((item) => {
    let media = "";

    if (item.media_url) {
      if (item.media_type?.startsWith("video")) {
        media = `<video src="${item.media_url}" controls></video>`;
      } else {
        media = `<img src="${item.media_url}" />`;
      }
    }

    const card = document.createElement("div");

    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.location}</p>
      <p>Status: ${item.status}</p>

      ${media}

      <button data-action="approve" data-id="${item.id}">Approve</button>
      <button data-action="reject" data-id="${item.id}">Reject</button>
      <button data-action="delete" data-id="${item.id}">Delete</button>
      <hr>
    `;

    listEl.appendChild(card);
  });
}

// UPDATE STATUS
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

  loadCases();
}

// DELETE
async function deleteCase(id) {
  if (!confirm("Delete this case?")) return;

  // get file path
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

  // delete file
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

  // delete DB row
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

  loadCases();
}

// LOGIN
function unlockAdmin() {
  if (passwordInput.value !== ADMIN_PASSWORD) return;

  sessionStorage.setItem("admin", "yes");
  loginWrap.style.display = "none";
  protectedWrap.style.display = "block";

  loadCases();
}

// LOGOUT
function lockAdmin() {
  sessionStorage.removeItem("admin");
  location.reload();
}

loginBtn.onclick = unlockAdmin;
signoutBtn.onclick = lockAdmin;

// BUTTON HANDLER
listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.dataset.action === "approve") updateCase(id, "approved");
  if (btn.dataset.action === "reject") updateCase(id, "rejected");
  if (btn.dataset.action === "delete") deleteCase(id);
});

// AUTO LOGIN
if (sessionStorage.getItem("admin")) {
  loginWrap.style.display = "none";
  protectedWrap.style.display = "block";
  loadCases();
}
