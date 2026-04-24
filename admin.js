(async () => {
  const container = document.getElementById("archive-list");

  const res = await fetch(
    window.UFO_APP_CONFIG.supabaseUrl +
      "/rest/v1/cases?status=eq.approved&select=*&order=created_at.desc",
    {
      headers: {
        apikey: window.UFO_APP_CONFIG.supabaseAnonKey,
        Authorization: `Bearer ${window.UFO_APP_CONFIG.supabaseAnonKey}`,
        "Cache-Control": "no-cache"
      }
    }
  );

  const data = await res.json();

  container.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");

    let media = "";

    if (item.media_url) {
      if (item.media_type?.startsWith("video")) {
        media = `<video src="${item.media_url}" controls></video>`;
      } else {
        media = `<img src="${item.media_url}" />`;
      }
    }

    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.location}</p>
      <p>${item.summary}</p>
      ${media}
      <hr>
    `;

    container.appendChild(card);
  });
})();
