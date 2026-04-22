const cfg = window.UFO_APP_CONFIG;

const supabase = window.supabase.createClient(
  cfg.supabaseUrl,
  cfg.supabaseAnonKey
);

async function loadStats() {
  const { data, error } = await supabase
    .from("cases")
    .select("status, media_url, location");

  if (error) {
    console.error(error);
    return;
  }

  console.log("DATA:", data); // 👈 THIS IS KEY

  const approved = data.filter(x => x.status === "approved").length;
  const media = data.filter(x => x.media_url && x.media_url !== "EMPTY").length;
  const locations = data.filter(x => x.location).length;

  document.getElementById("approved").innerText = approved;
  document.getElementById("media").innerText = media;
  document.getElementById("locations").innerText = locations;
}

loadStats();
