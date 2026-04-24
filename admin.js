const ADMIN_PASSWORD = "ufocases123";

const loginWrap = document.getElementById("admin-login");
const protectedWrap = document.getElementById("admin-protected");
const passwordInput = document.getElementById("admin-password");
const loginBtn = document.getElementById("admin-login-btn");
const signoutBtn = document.getElementById("admin-signout-btn");
const listEl = document.getElementById("admin-list");

function media(item) {
  if (!item.media_url) return "";
  return item.media_type?.startsWith("video")
    ? `<video src="${item.media_url}" controls></video>`
    : `<img src="${item.media_url}" />`;
}

async function loadCases() {
  listEl.innerHTML = "Loading...";

  const res = await fetch(
    window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?select=*&order=created_at.desc",
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

  data.forEach((c) => {
    const div = document.createElement("div");

    div.className = "case";

    div.innerHTML = `
      <h3>${c.title}</h3>
      <p>${c.location}</p>
      <p>Status: ${c.status}</p>
      ${media(c)}
      <button data-a="approve" data-id="${c.id}">Approve</button>
      <button data-a="reject" data-id="${c.id}">Reject</button>
      <button class="danger" data-a="delete" data-id="${c.id}">Delete</button>
    `;

    listEl.appendChild(div);
  });
}

async function update(id, status) {
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

async function del(id) {
  if (!confirm("Delete?")) return;

  const r = await fetch(
    window.UFO_APP_CONFIG.supabaseUrl +
      `/rest/v1/cases?id=eq.${id}&select=media_path`,
    {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`
      }
    }
  );

  const d = await r.json();
  const path = d[0]?.media_path;

  if (path) {
    await fetch(
      window.UFO_APP_CONFIG.supabaseUrl +
        `/storage/v1/object/ufo-media/${path}`,
      {
        method: "DELETE",
        headers: {
          apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
          Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`
        }
      }
    );
  }

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

loginBtn.onclick = () => {
  if (passwordInput.value.trim() !== ADMIN_PASSWORD) return;

  sessionStorage.setItem("admin", "yes");
  loginWrap.style.display = "none";
  protectedWrap.style.display = "block";
  loadCases();
};

signoutBtn.onclick = () => {
  sessionStorage.removeItem("admin");
  location.reload();
};

listEl.onclick = (e) => {
  const b = e.target.closest("button");
  if (!b) return;

  const id = b.dataset.id;

  if (b.dataset.a === "approve") update(id, "approved");
  if (b.dataset.a === "reject") update(id, "rejected");
  if (b.dataset.a === "delete") del(id);
};

if (sessionStorage.getItem("admin")) {
  loginWrap.style.display = "none";
  protectedWrap.style.display = "block";
  loadCases();
}
