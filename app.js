window.addEventListener("load", async () => {

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function showDebug(message) {
    let box = document.getElementById("debug-box");
    if (!box) {
      box = document.createElement("pre");
      box.id = "debug-box";
      box.style.marginTop = "20px";
      box.style.padding = "12px";
      box.style.border = "1px solid #ccc";
      box.style.background = "#f7f7f7";
      box.style.whiteSpace = "pre-wrap";
      document.body.appendChild(box);
    }
    box.textContent = message;
  }

  try {
    if (!window.UFO_APP_CONFIG) {
      showDebug("❌ Missing config.js");
      return;
    }

    if (!window.supabase) {
      showDebug("❌ Supabase script not loaded");
      return;
    }

    const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;

    const client = window.supabase.createClient(
      supabaseUrl,
      supabaseAnonKey
    );

    const { data, error } = await client
      .from("cases")
      .select("status, media_url, location");

    if (error) {
      showDebug("❌ Supabase error:\n" + JSON.stringify(error, null, 2));
      return;
    }

    const approvedRows = (data || []).filter(
      row => String(row.status || "").toLowerCase() === "approved"
    );

    const approved = approvedRows.length;

    const media = approvedRows.filter(
      row => row.media_url && row.media_url !== "EMPTY"
    ).length;

    const locations = new Set(
      approvedRows
        .map(r => r.location)
        .filter(Boolean)
    ).size;

    setText("approved-count", approved);
    setText("media-count", media);
    setText("location-count", locations);

    showDebug(
      "✅ Connected successfully\n\n" +
      "Total rows: " + data.length + "\n" +
      "Approved: " + approved + "\n" +
      "With media: " + media + "\n" +
      "Locations: " + locations
    );

  } catch (err) {
    showDebug("❌ App crash:\n" + err.message);
  }
});
