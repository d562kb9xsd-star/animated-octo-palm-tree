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
      showDebug("Missing window.UFO_APP_CONFIG");
      return;
    }

    const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;

    if (!supabaseUrl || !supabaseAnonKey) {
      showDebug("Config is incomplete");
      return;
    }

    if (!window.supabase) {
      showDebug("Supabase library did not load");
      return;
    }

    const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await client
      .from("cases")
      .select("status, media_url, location");

    if (error) {
      showDebug("Supabase error:\n" + JSON.stringify(error, null, 2));
      return;
    }

    const approvedRows = (data || []).filter(
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
      "Total rows: " + (data ? data.length : 0) + "\n" +
      "Approved rows: " + approved + "\n" +
      "Rows with media: " + media + "\n" +
      "Unique locations: " + locations
    );
  } catch (err) {
    showDebug("App error:\n" + (err && err.message ? err.message : String(err)));
  }
});
