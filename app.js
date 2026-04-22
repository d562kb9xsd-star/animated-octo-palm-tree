window.addEventListener("load", async () => {
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function showDebug(message) {
    const box = document.getElementById("debug-box");
    if (box) box.textContent = message;
  }

  try {
    if (!window.UFO_APP_CONFIG) {
      showDebug("Missing config.js");
      return;
    }

    const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;

    if (!supabaseUrl || !supabaseAnonKey) {
      showDebug("Config is incomplete");
      return;
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/cases?select=status,media_url,location`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`
        }
      }
    );

    if (!res.ok) {
      showDebug(`HTTP error: ${res.status}`);
      return;
    }

    const data = await res.json();

    const approvedRows = data.filter(
      row => String(row.status || "").trim().toLowerCase() === "approved"
    );

    const approved = approvedRows.length;
    const media = approvedRows.filter(
      row => row.media_url && String(row.media_url).trim() !== "" && row.media_url !== "EMPTY"
    ).length;
    const locations = new Set(
      approvedRows
        .map(row => row.location)
        .filter(v => v && String(v).trim() !== "")
    ).size;

    setText("approved-count", approved);
    setText("media-count", media);
    setText("location-count", locations);

    showDebug(
      "Connected OK\n" +
      `Total rows: ${data.length}\n` +
      `Approved rows: ${approved}\n` +
      `Rows with media: ${media}\n` +
      `Unique locations: ${locations}`
    );
  } catch (err) {
    showDebug(`ERROR: ${err.message}`);
  }
});
