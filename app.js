(async () => {
  const container = document.getElementById("archive-list");

  container.innerHTML = "Loading...";

  try {
    const url =
      window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?status=eq.approved&select=*&order=created_at.desc&_=" +
      Date.now(); // 🔥 breaks cache

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`,
        "Cache-Control": "no-cache"
      }
    });

    const data = await res.json();

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = "<p>No approved UFO cases.</p>";
      return;
    }

    data.forEach((item) => {
      let media = "";

      if (item.media_url) {
        if (item.media_type?.startsWith("video")) {
          media = `<video src="${item.media_url}" controls style="max-width:100%"></video>`;
        } else {
          media = `<img src="${item.media_url}" style="max-width:100%" />`;
        }
      }

      const card = document.createElement("div");

      card.innerHTML = `
        <h3>${item.title}</h3>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Date:</strong> ${item.date_observed}</p>
        <p>${item.summary}</p>
        ${media}
        <hr>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "Error loading data";
  }
})();
