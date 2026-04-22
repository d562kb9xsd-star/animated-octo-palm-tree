(async () => {
  const debug = document.getElementById("debug");

  function log(msg) {
    debug.textContent = msg;
  }

  try {
    log("Connecting...");

    const url = window.UFO_APP_CONFIG.supabaseUrl + "/rest/v1/cases";

    const res = await fetch(url, {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + window.UFO_APP_CONFIG.supabaseAnonKey
      }
    });

    if (!res.ok) {
      const text = await res.text();
      log("ERROR " + res.status + ":\n" + text);
      return;
    }

    const data = await res.json();

    document.getElementById("approved").textContent = data.length;
    document.getElementById("media").textContent = data.length;
    document.getElementById("locations").textContent = data.length;

    log("SUCCESS - Connected to Supabase");
  } catch (e) {
    log("ERROR: " + e.message);
  }
})();
