document.addEventListener("DOMContentLoaded", () => {
  const currentUser = (localStorage.getItem("scat_student_current") || "").trim().toLowerCase();
  if (!currentUser) {
    window.location.href = "dashboard.html";
    return;
  }

  const KEY = `scat_schedules_${currentUser}`;

  function loadList() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }

  function loadStudentProfile() {
    let p = {};
    try { p = JSON.parse(localStorage.getItem(`scat_user_${currentUser}`) || "{}"); } catch { }
    if (!p || Object.keys(p).length === 0) {
      try { p = JSON.parse(localStorage.getItem(`scat_student_${currentUser}`) || "{}"); } catch { }
    }
    return p || {};
  }

  const cardsWrap = document.getElementById("cardsWrap");
  const addNewBtn = document.getElementById("addNewBtn");
  const doneBtn = document.getElementById("doneBtn");

  // header
  const prof = loadStudentProfile();
  const program = prof.program || "—";
  const year = prof.year || "—";
  const section = prof.section || "—";

  const titleEl = document.getElementById("classTitle");
  const subEl = document.getElementById("classSubtitle");
  if (titleEl) titleEl.textContent = `${program} ${year} - ${section}`;
  if (subEl) subEl.textContent = `${currentUser}`;

  function render() {
    const list = loadList();

    if (!cardsWrap) return;
    cardsWrap.innerHTML = "";

    if (!list.length) {
      cardsWrap.innerHTML = `
        <div style="background:#fff;border-radius:14px;padding:16px;font-weight:900;box-shadow:0 10px 18px rgba(0,0,0,.10);">
          No subjects yet. Click <span style="color:#8f3a36;">+ Add Subject</span>.
        </div>
      `;
      return;
    }

    // nice ordering
    list.sort((a, b) => {
      const ac = String(a.subjectCode || "").toUpperCase();
      const bc = String(b.subjectCode || "").toUpperCase();
      if (ac !== bc) return ac.localeCompare(bc);
      const ad = String(a.day || "");
      const bd = String(b.day || "");
      if (ad !== bd) return ad.localeCompare(bd);
      return String(a.startTime || "").localeCompare(String(b.startTime || ""));
    });

    list.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="cardTop">
          <div class="cardTitleText">
            ${(item.subjectName || "SUBJECT").toUpperCase()}
          </div>
          <button type="button" class="editLink" data-id="${item.id}">Edit</button>
        </div>

        <div class="cardCode">
          ${(item.subjectCode || "—").toUpperCase()}
        </div>

        <div class="cardMeta">
          ${item.day || "—"} • ${item.startTime || ""}-${item.endTime || ""} • Room: ${item.room || "—"}
        </div>

        <div class="cardMeta">
          Prof: ${item.professor || "—"}
        </div>
      `;
      card.querySelector(".editLink")?.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `subject-edit.html?id=${encodeURIComponent(item.id)}`;
      });

      card.addEventListener("click", () => {

        window.location.href = `subject-edit.html?id=${encodeURIComponent(item.id)}`;
      });

      cardsWrap.appendChild(card);
    });
  }

  addNewBtn?.addEventListener("click", () => {
    window.location.href = "subject-edit.html";
  });

  doneBtn?.addEventListener("click", () => {
    window.location.href = "schedule.html";
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("scat_student_current");
    window.location.href = "login.html";
  });

  render();
});