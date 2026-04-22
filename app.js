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
        .select("status, media_url, location");

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      const approved = data.filter(row => row.status === "approved").length;
      const withMedia = data.filter(
        row => row.media_url && row.media_url !== "EMPTY"
      ).length;
      const locations = new Set(
        data
          .filter(row => row.status === "approved" && row.location)
          .map(row => row.location)
      ).size;

      document.getElementById("approved-count").textContent = approved;
      document.getElementById("media-count").textContent = withMedia;
      document.getElementById("location-count").textContent = locations;
    } catch (err) {
      console.error("App error:", err);
    }
  }

  loadStats();
}
