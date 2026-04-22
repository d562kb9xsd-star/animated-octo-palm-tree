(async () => {
  try {
    console.log("Connecting to Supabase...");

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
      console.error("ERROR:", res.status, text);
      return;
    }

    const data = await res.json();
    console.log("Loaded cases:", data);

    const container = document.getElementById("archive-list");

    if (!container) {
      console.error("archive-list div not found!");
      return;
    }

    container.innerHTML = "";

    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "case";

      div.innerHTML = `
        <h3>${item.title || "No title"}</h3>
        <p><strong>Location:</strong> ${item.location || "Unknown"}</p>
        <p>${item.summary || ""}</p>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.error("JS Error:", err);
  }
})();
