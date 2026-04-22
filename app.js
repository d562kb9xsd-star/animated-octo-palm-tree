window.addEventListener("load", async () => {

  const debug = document.getElementById("debug");

  function log(msg) {
    debug.textContent = msg;
  }

  try {
    const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;

    const res = await fetch(
      supabaseUrl + "/rest/v1/cases?select=status,media_url,location",
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: "Bearer " + supabaseAnonKey
        }
      }
    );

    if (!res.ok) {
      log("❌ HTTP error: " + res.status);
      return;
    }

    const data = await res.json();

    const approvedRows = data.filter(r => r.status === "approved");

    const approved = approvedRows.length;

    const media = approvedRows.filter(
      r => r.media_url && r.media_url !== "EMPTY"
    ).length;

    const locations = new Set(
      approvedRows.map(r => r.location).filter(Boolean)
    ).size;

    document.getElementById("approved-count").textContent = approved;
    document.getElementById("media-count").textContent = media;
    document.getElementById("location-count").textContent = locations;

    log("✅ WORKING — rows: " + data.length);

  } catch (err) {
    log("❌ ERROR: " + err.message);
  }

});
