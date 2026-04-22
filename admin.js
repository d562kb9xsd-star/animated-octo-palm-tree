(async function () {
  const { supabaseUrl, supabaseAnonKey } = window.UFO_APP_CONFIG;
  const list = document.getElementById("list");

  async function loadPending() {
    const res = await fetch(
      supabaseUrl + "/rest/v1/cases?status=eq.pending&order=created_at.desc",
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: "Bearer " + supabaseAnonKey
        }
      }
    );

    const data = await res.json();
    list.innerHTML = "";

    if (!data.length) {
      list.innerHTML = "<p>No pending reports.</p>";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.style.background = "white";
      div.style.border = "1px solid #ccc";
      div.style.borderRadius = "10px";
      div.style.padding = "15px";
      div.style.marginBottom = "15px";

      div.innerHTML = `
        <h3>${item.title || "Untitled"}</h3>
        <p>${item.description || ""}</p>
        <p><b>Location:</b> ${item.location || ""}</p>
        ${
          item.media_url
            ? `<img src="${item.media_url}" style="max-width:300px; display:block; margin:10px 0;">`
            : ""
        }
        <button data-id="${item.id}" class="approve-btn">Approve</button>
      `;

      list.appendChild(div);
    });

    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        const res = await fetch(
          supabaseUrl + "/rest/v1/cases?id=eq." + id,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseAnonKey,
              Authorization: "Bearer " + supabaseAnonKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: "approved" })
          }
        );

        if (res.ok) {
          loadPending();
        } else {
          alert("Failed to approve");
        }
      });
    });
  }

  loadPending();
})();
