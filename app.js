(async () => {
  const container = document.getElementById("archive-list");

  function log(msg) {
    console.log(msg);
    if (container) {
      container.innerHTML = `<p style="color:#aaa;">${msg}</p>`;
    }
  }

  try {
    log("Loading approved UFO cases...");

    const url =
      window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?status=eq.approved&select=*";

    const res = await fetch(url, {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + window.UFO_APP_CONFIG.supabaseAnonKey
      }
    });

    console.log("Response status:", res.status);

    if (!res.ok) {
      const text = await res.text();
      log("ERROR: " + text);
      return;
    }

    const data = await res.json();
    console.log("DATA:", data);

    if (!data || data.length === 0) {
      log("No approved UFO cases found.");
      return;
    }

    container.innerHTML = "";

    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "case";

      div.innerHTML = `
        <h3>${item.title || "Untitled"}</h3>
        <p><strong>Location:</strong> ${item.location || "Unknown"}</p>
        <p>${item.description || item.summary || ""}</p>
      `;

      container.appendChild(div);
    });

    console.log("Rendered successfully");

  } catch (err) {
    console.error(err);
    log("Connection error: " + err.message);
  }
})();
