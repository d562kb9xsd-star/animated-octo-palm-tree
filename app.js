(async () => {
  const container = document.getElementById("archive-list");

  if (!container) {
    document.body.insertAdjacentHTML(
      "beforeend",
      "<p style='color:red;padding:20px;'>archive-list div not found</p>"
    );
    return;
  }

  container.innerHTML = "<p style='padding:20px;'>Loading archive…</p>";

  try {
    const url =
      window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?select=*&order=created_at.desc";

    const res = await fetch(url, {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + window.UFO_APP_CONFIG.supabaseAnonKey,
        "Content-Type": "application/json"
      }
    });

    const text = await res.text();

    if (!res.ok) {
      container.innerHTML = `
        <div style="padding:20px;color:#ffb4b4;">
          <h3>Fetch failed</h3>
          <p>Status: ${res.status}</p>
          <pre style="white-space:pre-wrap;">${text}</pre>
        </div>
      `;
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      container.innerHTML = `
        <div style="padding:20px;color:#ffb4b4;">
          <h3>Response was not valid JSON</h3>
          <pre style="white-space:pre-wrap;">${text}</pre>
        </div>
      `;
      return;
    }

    if (!Array.isArray(data)) {
      container.innerHTML = `
        <div style="padding:20px;color:#ffb4b4;">
          <h3>Unexpected response</h3>
          <pre style="white-space:pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
      return;
    }

    if (data.length === 0) {
      container.innerHTML = `
        <div style="padding:20px;">
          <h3>No rows returned</h3>
          <p>Supabase connection worked, but the query returned 0 records.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="padding:20px;">
        <p><strong>Rows returned:</strong> ${data.length}</p>
      </div>
    ` + data.map(item => `
      <div class="case">
        <h3>${item.title || "Untitled report"}</h3>
        <p><strong>Status:</strong> ${item.status || "none"}</p>
        <p><strong>Location:</strong> ${item.location || "Unknown"}</p>
        <p><strong>Date:</strong> ${item.date_observed || item.created_at || "Unknown"}</p>
        <p>${item.summary || item.description || ""}</p>
      </div>
    `).join("");

  } catch (err) {
    container.innerHTML = `
      <div style="padding:20px;color:#ffb4b4;">
        <h3>JavaScript error</h3>
        <pre style="white-space:pre-wrap;">${err.message}</pre>
      </div>
    `;
  }
})();
