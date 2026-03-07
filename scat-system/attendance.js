document.addEventListener("DOMContentLoaded", () => {
  const currentUser = (localStorage.getItem("scat_student_current") || "").trim().toLowerCase();

  // logout (student key)
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("scat_student_current");
    window.location.href = "login.html";
  });

  const bar = document.getElementById("programBar");
  const grid = document.getElementById("cardsGrid");

  if (!currentUser) {
    if (bar) bar.textContent = "No user logged in.";
    if (grid) grid.innerHTML = `<div class="empty">No schedule to show.</div>`;
    return;
  }

  // profile
  let profile = {};
  try { profile = JSON.parse(localStorage.getItem(`scat_user_${currentUser}`) || "{}"); } catch { }
  const program = (profile.program || "—").toString().trim();

  const full = {
    BSCS: "Bachelor of Science in Computer Science",
    BSIT: "Bachelor of Science in Information Technology",
  };

  // schedules (support both keys)
  const AKEY = `scat_schedules_${currentUser}`;
  const BKEY = `scat_student_schedules_${currentUser}`;

  function safeParse(raw, fallback) { try { return JSON.parse(raw); } catch { return fallback; } }

  const a = safeParse(localStorage.getItem(AKEY) || "[]", []);
  const b = safeParse(localStorage.getItem(BKEY) || "[]", []);
  const map = new Map();
  [...a, ...b].forEach(x => { if (x?.id) map.set(String(x.id), x); });
  const list = Array.from(map.values());

  const semester = (list[0] && list[0].semester) ? list[0].semester : "—";
  if (bar) bar.textContent = `${full[program] || program} | ${semester}`;

  function formatTime(t) {
    if (!t) return "—";
    const [hh, mm] = t.split(":").map(Number);
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
  }

  if (!list.length) {
    if (grid) {
      grid.innerHTML = `
        <div class="empty">
          No subjects yet. Go to <b>Schedule</b> and add your schedule first.
        </div>
      `;
    }
    return;
  }

  grid.innerHTML = "";
  list.forEach((s) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="cardTitle">${s.subjectCode || ""} ${s.subjectName || "Subject"}</div>
      <span class="tag">${s.day || "—"}</span>
      <div class="slot">
        <div>
          ${formatTime(s.startTime)} - ${formatTime(s.endTime)}
          <small>Room: ${s.room || "—"}</small>
        </div>
        <div class="chev">›</div>
      </div>
    `;
    // ✅ ADD ONLY: Global lock check
    function safeParse(raw, fallback) { try { return JSON.parse(raw); } catch { return fallback; } }
    function dateToMs(mmddyyyy) {
      const parts = String(mmddyyyy || "").split("/").map(n => parseInt(n, 10));
      const mm = parts[0], dd = parts[1], yy = parts[2];
      if (!mm || !dd || !yy) return 0;
      return new Date(yy, mm - 1, dd).getTime();
    }

    const clearMap = safeParse(localStorage.getItem("scat_admin_osas_student_clear") || "{}", {});
    const clearedAt = clearMap[currentUser]?.clearedAt || 0;
    const attObj = safeParse(localStorage.getItem(`scat_attendance_${currentUser}`) || "{}", {});

    let locked = false;
    for (const sid of Object.keys(attObj || {})) {
      const rows = Array.isArray(attObj[sid]) ? attObj[sid] : [];
      let abs = 0;
      for (const r of rows) {
        if (String(r?.status || "").toUpperCase() !== "ABSENT") continue;
        const t = dateToMs(r?.date);
        if (clearedAt && t && t <= clearedAt) continue;
        abs++;
        if (abs >= 3) { locked = true; break; }
      }
      if (locked) break;
    }

    if (locked) {
      // show message and stop clicks
      if (grid) {
        grid.innerHTML = `
      <div class="empty">
        <b>Attendance Tracking is temporarily disabled.</b><br>
        Please go to OSAS/Admin for clearance.
      </div>
    `;
      }
      return; // ✅ stops rendering subject cards (no changes to your existing code below)
    }
    div.addEventListener("click", () => {
      window.location.href = `attendance-view.html?id=${encodeURIComponent(s.id)}`;
    });
    grid.appendChild(div);
  });
});