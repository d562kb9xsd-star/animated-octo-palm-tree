(async () => {

  const container = document.getElementById("archive-list");

  // Safety check
  if (!container) {
    console.error("archive-list div not found");
    return;
  }

  try {
    console.log("Connecting to Supabase...");

    const url = window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?status=eq.approved&order=created_at.desc";

    const res = await fetch(url, {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + window.UFO_APP_CONFIG.supabaseAnonKey,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      container.innerHTML = `<p style="color:red;">Error ${res.status}: ${errorText}</p>`;
      return;
    }

    const data = await res.json();

    console.log("Data received:", data);

    if (!data || data.length === 0) {
      container.innerHTML = "<p>No approved UFO reports found.</p>";
      return;
    }

    // Render cases
    container.innerHTML = data.map(item => `
      <div class="case">
        <h3>${item.title || "Untitled report"}</h3>
        <p><strong>Location:</strong> ${item.location || "Unknown"}</p>
        <p><strong>Date:</strong> ${item.date_observed || "Unknown"}</p>
        <p>${item.description || ""}</p>
      </div>
    `).join("");

    console.log("SUCCESS: UFO reports loaded");

  } catch (err) {
    console.error("Fetch error:", err);
    container.innerHTML = "<p style='color:red;'>Failed to load UFO reports.</p>";
  }

})();
