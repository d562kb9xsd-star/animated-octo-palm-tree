const cfg = window.UFO_APP_CONFIG;

if (!cfg || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
  console.error("Missing Supabase config");
} else {
  const supabaseClient = window.supabase.createClient(
    cfg.supabaseUrl,
    cfg.supabaseAnonKey
  );

  async function loadStats() {
    try {
      const { data, error } = await supabaseClient
        .from("cases")
        .select("id, location, media_url, status");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      const approvedRows = (data || []).filter(
        row => String(row.status).trim().toLowerCase() === "approved"
      );

      const approved = approvedRows.length;
      const withMedia = approvedRows.filter(
        row => row.media_url && String(row.media_url).trim() !== ""
      ).length;
      const locations = new Set(
        approvedRows
          .map(row => row.location)
          .filter(value => value && String(value).trim() !== "")
      ).size;

      const approvedEl = document.getElementById("approved-count");
      const mediaEl = document.getElementById("media-count");
      const locationEl = document.getElementById("location-count");

      if (approvedEl) approvedEl.textContent = approved;
      if (mediaEl) mediaEl.textContent = withMedia;
      if (locationEl) locationEl.textContent = locations;

      console.log("Loaded rows:", data);
      console.log("Approved rows:", approvedRows);
    } catch (err) {
      console.error("App error:", err);
    }
  }

  loadStats();
}
