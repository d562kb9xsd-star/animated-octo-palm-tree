const cfg = window.UFO_APP_CONFIG;

const supabase = window.supabase.createClient(
  cfg.supabaseUrl,
  cfg.supabaseAnonKey
);

async function loadStats() {
  try {
    const { data, error } = await supabase
      .from("cases")
      .select("*");

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    const approved = data.filter(c => c.status === "approved").length;
    const media = data.filter(c => c.media_url).length;
    const locations = data.filter(c => c.location).length;

    document.getElementById("approved").innerText = approved;
    document.getElementById("media").innerText = media;
    document.getElementById("locations").innerText = locations;

  } catch (err) {
    console.error("Error:", err);
  }
}

loadStats();
