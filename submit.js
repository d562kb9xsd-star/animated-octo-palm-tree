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

      let mediaUrl = null;
      const fileInput = document.getElementById("file");
      const file = fileInput.files[0];

      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;

        const uploadRes = await fetch(
          `${supabaseUrl}/storage/v1/object/ufo-media/${fileName}`,
          {
            method: "POST",
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
              "Content-Type": file.type || "application/octet-stream",
              "x-upsert": "false"
            },
            body: file
          }
        );

        const uploadText = await uploadRes.text();
        if (!uploadRes.ok) {
          log(`Upload failed (${uploadRes.status})\n${uploadText}`);
          return;
        }

        mediaUrl = `${supabaseUrl}/storage/v1/object/public/ufo-media/${fileName}`;
      }

      const payload = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        location: document.getElementById("location").value.trim(),
        media_url: mediaUrl,
        status: "pending"
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/cases`, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      if (!res.ok) {
        log(`Submit failed (${res.status})\n${text}`);
        return;
      }

      form.reset();
      log("Success. Report submitted as pending with photo upload.");
    } catch (err) {
      log("Error: " + err.message);
    }
  });
})();
