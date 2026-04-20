const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;

const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

async function loadStats() {
  try {
    const { data, error } = await supabaseClient
      .from("cases")
      .select("*")
      .eq("status", "approved");

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    const approved = data.length;
    const withMedia = data.filter(c => c.media_url).length;
    const locations = new Set(data.map(c => c.location)).size;

    document.getElementById("approved-count").textContent = approved;
    document.getElementById("media-count").textContent = withMedia;
    document.getElementById("location-count").textContent = locations;

  } catch (err) {
    console.error("App error:", err);
  }
}

loadStats();
