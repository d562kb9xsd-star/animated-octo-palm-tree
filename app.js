(async () => {
  const el = document.getElementById("archive-list");

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

  el.innerHTML = "";

  data.forEach((c) => {
    let media = "";

    if (c.media_url) {
      media = c.media_type?.startsWith("video")
        ? `<video src="${c.media_url}" controls></video>`
        : `<img src="${c.media_url}" />`;
    }

    const div = document.createElement("div");

    div.innerHTML = `
      <h3>${c.title}</h3>
      <p>${c.location}</p>
      <p>${c.summary}</p>
      ${media}
      <hr>
    `;

    el.appendChild(div);
  });
})();
