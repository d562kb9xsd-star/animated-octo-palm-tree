(async () => {
  const debug = document.getElementById("debug");

  function log(msg) {
    if (debug) debug.textContent = msg;
    console.log(msg);
  }

  try {
    if (!window.UFO_APP_CONFIG || !window.UFO_APP_CONFIG.supabaseUrl || !window.UFO_APP_CONFIG.supabaseAnonKey) {
      log("Missing Supabase config");
      return;
    }

    const baseUrl = window.UFO_APP_CONFIG.supabaseUrl.replace(/\/$/, "");
    const apiKey = window.UFO_APP_CONFIG.supabaseAnonKey;

    const headers = {
      apikey: apiKey,
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json"
    };

    log("Connecting...");

    const archiveUrl =
      baseUrl + "/rest/v1/cases?status=eq.approved&order=created_at.desc";

    const res = await fetch(archiveUrl, { headers });

    if (!res.ok) {
      const text = await res.text();
      log("ERROR " + res.status + ": " + text);
      return;
    }

    const data = await res.json();
    log("Loaded " + data.length + " approved case(s)");

    const approvedEl = document.getElementById("approved");
    const mediaEl = document.getElementById("media");
    const locationsEl = document.getElementById("locations");

    if (approvedEl) approvedEl.textContent = data.length;

    if (mediaEl) {
      const mediaCount = data.filter(
        item => item.media_url || item.media_path || item.media_type
      ).length;
      mediaEl.textContent = mediaCount;
    }

    if (locationsEl) {
      const uniqueLocations = new Set(
        data.map(item => (item.location || "").trim()).filter(Boolean)
      );
      locationsEl.textContent = uniqueLocations.size;
    }

    const archiveList = document.getElementById("archive-list");
    if (archiveList) {
      archiveList.innerHTML = "";

      if (!data.length) {
        archiveList.innerHTML = "<p>No approved UFO reports found.</p>";
        return;
      }

      data.forEach(item => {
        const card = document.createElement("article");
        card.className = "case-card";

        const title = item.title || "Untitled report";
        const location = item.location || "Unknown location";
        const summary = item.summary || item.description || "No summary available.";
        const dateObserved = item.date_observed || item.created_at || "";
        const mediaUrl = item.media_url || item.media_path || "";

        let mediaHtml = "";
        if (mediaUrl) {
          const lower = mediaUrl.toLowerCase();

          if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lower)) {
            mediaHtml = `<img src="${mediaUrl}" alt="${escapeHtml(title)}" style="max-width:100%;border-radius:12px;margin-top:12px;">`;
          } else if (/\.(mp4|webm|ogg|mov)$/.test(lower)) {
            mediaHtml = `
              <video controls style="max-width:100%;border-radius:12px;margin-top:12px;">
                <source src="${mediaUrl}">
              </video>
            `;
          } else {
            mediaHtml = `<p style="margin-top:12px;"><a href="${mediaUrl}" target="_blank" rel="noopener noreferrer">View attachment</a></p>`;
          }
        }

        card.innerHTML = `
          <div style="padding:20px;margin:16px 0;border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:rgba(255,255,255,0.02);">
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
              <span style="font-size:12px;padding:4px 10px;border-radius:999px;background:rgba(139,92,246,0.2);">approved</span>
              ${item.type ? `<span style="font-size:12px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,0.08);">${escapeHtml(item.type)}</span>` : ""}
            </div>

            <h3 style="margin:0 0 8px 0;">${escapeHtml(title)}</h3>
            <p style="margin:0 0 6px 0;opacity:0.85;">${escapeHtml(location)}</p>
            ${dateObserved ? `<p style="margin:0 0 12px 0;opacity:0.65;font-size:14px;">${escapeHtml(formatDate(dateObserved))}</p>` : ""}
            <p style="margin:0 0 12px 0;line-height:1.5;">${escapeHtml(summary)}</p>
            ${mediaHtml}
          </div>
        `;

        archiveList.appendChild(card);
      });
    }
  } catch (e) {
    console.error(e);
    if (debug) {
      debug.textContent = "ERROR: " + (e.message || e);
    }
  }

  function formatDate(value) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
