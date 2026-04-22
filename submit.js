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

      // ✅ Upload file if selected
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

        if (!uploadRes.ok) {
          const err = await uploadRes.text();
          log("Upload failed: " + err);
          return;
        }

        mediaUrl = `${supabaseUrl}/storage/v1/object/public/ufo-media/${fileName}`;
      }

      // ✅ Submit to database
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

      if (!res.ok) {
        const err = await res.text();
        log("Submit failed: " + err);
        return;
      }

      form.reset();
      log("Success. Report submitted with photo.");
    } catch (err) {
      log("Error: " + err.message);
    }
  });
})();
