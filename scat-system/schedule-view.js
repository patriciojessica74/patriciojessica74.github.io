document.addEventListener("DOMContentLoaded", () => {
  const currentUser = (localStorage.getItem("scat_student_current") || "").trim();

  if (!currentUser) return;

  const rawProfile = localStorage.getItem(`scat_user_${currentUser}`);
  const profile = rawProfile ? JSON.parse(rawProfile) : {};

  const classTitle = document.getElementById("classTitle");
  const classSubtitle = document.getElementById("classSubtitle");

  const program = profile.program || "—";
  const year = profile.year || "—";
  const section = profile.section || "—";

  classTitle.textContent = `${program} ${year} - ${section}`;

  const programFullMap = {
    BSCS: "Bachelor of Science in Computer Science",
    BSIT: "Bachelor of Science in Information Technology"
  };
  classSubtitle.textContent = `${programFullMap[program] || program} | ${semester}`;

  const KEY = `scat_student_schedules_${currentUser}`;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    list = [];
  }
  const semester = (list[0] && list[0].semester) ? list[0].semester : "—";

  classSubtitle.textContent = `${programFullMap[program] || program} | ${semester}`;

  const cardsWrap = document.getElementById("cardsWrap");

  function formatTime(t) {
    if (!t) return "—";
    const [hh, mm] = t.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = ((hh + 11) % 12) + 1;
    return `${hour12}:${String(mm).padStart(2, "0")} ${ampm}`;
  }

  if (!list.length) {
    cardsWrap.innerHTML = `<div class="schedCard"><b>No schedule yet.</b><div class="slot" style="margin-top:12px;">Click “Update Your Schedule”</div></div>`;
    return;
  }

  cardsWrap.innerHTML = "";
  list.forEach((s) => {
    const card = document.createElement("div");
    card.className = "schedCard";
    cdiv.innerHTML = `
      <div class="cardTitle">${item.subjectName || "Subject"}</div>
      <span class="tag">${item.day || "—"}</span>
      <div class="slot">
        <div>
          ${formatTime(item.startTime)} - ${formatTime(item.endTime)}
          <small>Room: ${item.room || "—"}</small>
        </div>
      </div>
    `;

    cardsWrap.appendChild(card);
  });
  //LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("scat_current_user");
      window.location.href = "login.html";
    });
  }
});
