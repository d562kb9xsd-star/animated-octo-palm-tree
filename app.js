const { createClient } = supabase;

const supabaseClient = createClient(
  window.UFO_APP_CONFIG.supabaseUrl,
  window.UFO_APP_CONFIG.supabaseAnonKey
);

async function loadStats() {
  const { data, error } = await supabaseClient
    .from("cases")
    .select("*");

  if (error) {
    console.error("Error loading stats:", error);
    return;
  }

  const approved = data.filter(c => c.status === "approved");
  const withMedia = approved.filter(c => c.media_url);
  const locations = approved.filter(c => c.location);

  document.getElementById("approved-count").textContent = approved.length;
  document.getElementById("media-count").textContent = withMedia.length;
  document.getElementById("location-count").textContent = locations.length;
}

async function loadCases() {
  const { data, error } = await supabaseClient
    .from("cases")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading cases:", error);
    return;
  }

  const container = document.getElementById("cases-container");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(c => {
    const div = document.createElement("div");
    div.style.padding = "16px";
    div.style.marginBottom = "12px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "8px";
    div.style.background = "#111";
    div.style.color = "#fff";

    div.innerHTML = `
      <h3>${c.title}</h3>
      <p>${c.description || ""}</p>
      <small>${c.location || ""}</small>
    `;

    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadStats();
  loadCases();
});
