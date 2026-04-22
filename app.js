window.addEventListener("load", async () => {
  const debug = document.getElementById("debug");

  function log(msg) {
    if (debug) debug.textContent = msg;
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;

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
      log(`HTTP error: ${res.status}`);
      return;
    }

    const data = await res.json();

    const approvedRows = data.filter(
      r => String(r.status || "").trim().toLowerCase() === "approved"
    );

    document.getElementById("approved-count").textContent = approvedRows.length;
    document.getElementById("media-count").textContent =
      approvedRows.filter(r => r.media_url && String(r.media_url).trim() !== "" && r.media_url !== "EMPTY").length;
    document.getElementById("location-count").textContent =
      new Set(approvedRows.map(r => r.location).filter(Boolean)).size;

    log(`WORKING - rows: ${data.length}`);
  } catch (err) {
    log(`ERROR: ${err.message}`);
  }
});
