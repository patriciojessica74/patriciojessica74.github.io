document.addEventListener("DOMContentLoaded", () => {
  const currentUser = (localStorage.getItem("scat_student_current") || "").trim().toLowerCase();
  if (!currentUser) { window.location.href = "login.html"; return; }

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  const KEY = `scat_schedules_${currentUser}`;
  const wrap = document.getElementById("cardsGrid");
  if (!wrap) return;

  let list = [];
  try { list = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { list = []; }

  // header info
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem(`scat_user_${currentUser}`) || "{}"); } catch { }

  const program = profile.program || "—";
  const year = profile.year || "—";
  const section = profile.section || "—";

  const titleEl = document.getElementById("pageTitle");
  const barEl = document.getElementById("programBar");

  if (titleEl) titleEl.textContent = `${program} ${year} - ${section}`;
  const semester = (list[0] && list[0].semester) ? list[0].semester : "—";
  if (barEl) barEl.textContent = `Semester: ${semester}`;

  if (!list.length) {
    wrap.innerHTML = `<div class="empty">No schedule yet. Click <b>Update Your Schedule</b>.</div>`;
    return;
  }

  wrap.innerHTML = "";

  list.forEach(item => {
    const day = String(item.day || "").trim();          // ✅ trim
    const isToday = day.toLowerCase() === todayName;    // ✅ compare properly
    const badgeText = isToday ? "Today" : (day || "—");

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="cardTitle">${(item.subjectName || "SUBJECT").toUpperCase()}</div>

      <div class="dayTag ${isToday ? "today" : ""}">${badgeText}</div>

      <div class="slot">
        <div>
          ${item.startTime || ""} - ${item.endTime || ""}
          <small>Room: ${item.room || "—"}</small>
        </div>
        <div class="cardArrow">›</div>
      </div>
    `;

    card.addEventListener("click", () => {
      window.location.href = "schedule-edit.html";
    });

    wrap.appendChild(card);
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("scat_student_current");
    window.location.href = "login.html";
  });
});