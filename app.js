(async () => {
  const container = document.getElementById("archive-list");

  function showMessage(msg) {
    if (container) {
      container.innerHTML = `<p style="color:#aaa;">${msg}</p>`;
    }
  }

  try {
    showMessage("Loading UFO reports...");

    const url = window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?status=eq.approved&order=created_at.desc";

    const res = await fetch(url, {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + window.UFO_APP_CONFIG.supabaseAnonKey
      }
    });

    if (!res.ok) {
      const text = await res.text();
      showMessage("Error: " + text);
      return;
    }

    const data = await res.json();

    if (!data.length) {
      showMessage("No approved UFO cases yet.");
      return;
    }

    container.innerHTML = "";

    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "case";

      div.innerHTML = `
        <h3>${item.title || "Untitled"}</h3>
        <p><strong>Location:</strong> ${item.location || "Unknown"}</p>
        <p>${item.summary || ""}</p>
      `;

      container.appendChild(div);
    });

  } catch (e) {
    showMessage("Connection error: " + e.message);
  }
})();
