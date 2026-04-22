(async function () {
  const debug = document.getElementById("debug");

  function log(msg) {
    if (debug) debug.textContent = String(msg);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  try {
    log("Starting app...");

    if (!window.UFO_APP_CONFIG) {
      log("ERROR: config.js did not load");
      return;
    }

    const supabaseUrl = window.UFO_APP_CONFIG.supabaseUrl;
    const supabaseAnonKey = window.UFO_APP_CONFIG.supabaseAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      log("ERROR: config is incomplete");
      return;
    }

    log("Connecting to Supabase...");

    const res = await fetch(
      supabaseUrl + "/rest/v1/cases?select=status,media_url,location",
      {
        method: "GET",
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": "Bearer " + supabaseAnonKey,
          "Accept": "application/json"
        }
      }
    );

    if (!res.ok) {
      const text = await res.text();
      log("HTTP error: " + res.status + "\n" + text);
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
      approvedRows.map(row => row.location).filter(v => v && String(v).trim() !== "")
    ).size;

    setText("approved-count", approved);
    setText("media-count", media);
    setText("location-count", locations);

    log("WORKING - rows: " + data.length);
  } catch (err) {
    log("ERROR: " + (err && err.message ? err.message : String(err)));
  }
})();
