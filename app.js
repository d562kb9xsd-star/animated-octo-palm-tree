(async () => {
  const container = document.getElementById("archive-list");

  function escapeHtml(text) {
    return text
      ? text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      : "";
  }

  function showMessage(msg) {
    if (container) {
      container.innerHTML = `<p style="color:#aaa;">${msg}</p>`;
    }
    console.log(msg);
  }

  try {
    if (!container) {
      console.error("archive-list container not found");
      return;
    }

    showMessage("Loading approved UFO cases...");

    const url =
      window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?status=eq.approved&select=*";

    const res = await fetch(url, {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization:
          "Bearer " + window.UFO_APP_CONFIG.supabaseAnonKey,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      showMessage("Error loading data: " + text);
      return;
    }

    const data = await res.json();
    console.log("DATA:", data);

    if (!data || data.length === 0) {
      showMessage("No approved UFO cases yet.");
      return;
    }

    container.innerHTML = "";

    data.forEach((item) => {
      const div = document.createElement("div");
      div.className = "case";

      // ✅ SAFE TAG HANDLING (fixes your crash)
      const tags = Array.isArray(item.tags)
        ? item.tags
        : typeof item.tags === "string" && item.tags.trim() !== ""
        ? item.tags.split(",").map((t) => t.trim())
        : [];

      const tagHtml = tags
        .map((t) => `<span class="badge">${escapeHtml(t)}</span>`)
        .join("");

      div.innerHTML = `
        <h3>${escapeHtml(item.title || "Untitled")}</h3>
        <p><strong>Location:</strong> ${escapeHtml(
          item.location || "Unknown"
        )}</p>
        <p>${escapeHtml(item.summary || item.description || "")}</p>
        <div style="margin-top:8px;">${tagHtml}</div>
      `;

      container.appendChild(div);
    });

    console.log("Rendered successfully");

  } catch (err) {
    console.error(err);
    showMessage("Connection error: " + err.message);
  }
})();
