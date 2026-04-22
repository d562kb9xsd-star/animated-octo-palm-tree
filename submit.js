(function () {
  const form = document.getElementById("report-form");
  const debug = document.getElementById("debug");

  function log(msg) {
    if (debug) debug.textContent = String(msg);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;

      const payload = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        media_url: document.getElementById("media_url").value.trim() || null,
        status: "pending"
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/cases`, {
        method: "POST",
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text();

      if (!res.ok) {
        log(`Submit failed (${res.status})\n${text}`);
        return;
      }

      form.reset();
      log("Success. Report submitted as pending.");
    } catch (err) {
      log("Error: " + err.message);
    }
  });
})();
