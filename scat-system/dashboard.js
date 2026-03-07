document.addEventListener("DOMContentLoaded", () => {
  const currentUser = (localStorage.getItem("scat_student_current") || "").trim().toLowerCase();

  const nameEl = document.getElementById("dashName");
  const idEl = document.getElementById("dashId");
  const programEl = document.getElementById("dashProgram");
  const yearEl = document.getElementById("dashYear");
  const sectionEl = document.getElementById("dashSection");
  const imgEl = document.getElementById("profileImage");

  // ✅ WARNING UI container (must exist in HTML: <div id="warningBody"></div>)
  const warningBody = document.getElementById("warningBody");

  // ✅ same key used by admin
  const OSAS_CLEAR_KEY = "scat_admin_osas_student_clear";

  // If no logged user
  if (!currentUser) {
    if (nameEl) nameEl.textContent = "Name: (no user)";
    if (idEl) idEl.textContent = "Student ID: -";
    if (programEl) programEl.textContent = "Program: —";
    if (yearEl) yearEl.textContent = "Year: —";
    if (sectionEl) sectionEl.textContent = "Section: —";
    return;
  }

  // Load the profile object
  const rawProfile = localStorage.getItem(`scat_user_${currentUser}`);
  if (!rawProfile) return;

  let profile;
  try {
    profile = JSON.parse(rawProfile);
  } catch (err) {
    console.error("Invalid profile JSON:", err);
    return;
  }

  if (nameEl) nameEl.textContent = `Name: ${profile.fullname || "—"}`;
  if (idEl) idEl.textContent = `Student ID: ${profile.studentid || "—"}`;
  if (programEl) programEl.textContent = `Program: ${profile.program || "—"}`;
  if (yearEl) yearEl.textContent = `Year: ${profile.year || "—"}`;
  if (sectionEl) sectionEl.textContent = `Section: ${profile.section || "—"}`;

  if (imgEl) {
    imgEl.src = (profile.profile_image && profile.profile_image.trim() !== "")
      ? profile.profile_image
      : "image/profile.jpeg";
  }

  // OSAS WARNING + LOCK (ADD ONLY)
  function safeParse(raw, fallback) { try { return JSON.parse(raw); } catch { return fallback; } }

  // Convert MM/DD/YYYY to ms
  function dateToMs(mmddyyyy) {
    const parts = String(mmddyyyy || "").split("/").map(n => parseInt(n, 10));
    const mm = parts[0], dd = parts[1], yy = parts[2];
    if (!mm || !dd || !yy) return 0;
    return new Date(yy, mm - 1, dd).getTime();
  }

  function setWarningNone() {
    if (!warningBody) return;
    warningBody.innerHTML = `<div class="noWarn">NO WARNING TODAY</div>`;
  }

  function setWarning2(subjectCode, count) {
    if (!warningBody) return;
    warningBody.innerHTML = `
    <div class="warnCard">
      <div class="warnIcon" aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <path d="M32 6 L60 54 H4 Z" fill="none" stroke="#c40000" stroke-width="4"/>
          <path d="M32 22 v16" stroke="#c40000" stroke-width="5" stroke-linecap="round"/>
          <circle cx="32" cy="46" r="3" fill="#c40000"/>
        </svg>
      </div>
      <div class="warnText">
        You already have <b>${count}</b> absences in
        <span class="warnSubject">(${subjectCode})</span>.
        You are at risk of being referred to OSAS for this subject.
      </div>
      <div class="warnSmall">You are advised to cooperate with your teacher.</div>
    </div>
  `;
  }

  function setWarning3(subjectCode) {
    if (!warningBody) return;
    warningBody.innerHTML = `
    <div class="warnCard">
      <div class="warnIcon" aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <path d="M32 6 L60 54 H4 Z" fill="none" stroke="#c40000" stroke-width="4"/>
          <path d="M32 22 v16" stroke="#c40000" stroke-width="5" stroke-linecap="round"/>
          <circle cx="32" cy="46" r="3" fill="#c40000"/>
        </svg>
      </div>
      <div class="warnText">
        You have reached <b>3 absences</b> in
        <span class="warnSubject">(${subjectCode})</span>.
        Attendance Tracking is temporarily disabled.
      </div>
      <div class="warnSmall">Please go to OSAS/Admin for clearance.</div>
    </div>
  `;
  }

  // disable Attendance Tracking link in sidebar
  function lockAttendanceMenu(locked) {
    const link = document.querySelector('a.menuItem[href="attendance.html"]');
    if (!link) return;

    if (!locked) {
      link.style.opacity = "";
      link.style.pointerEvents = "";
      link.title = "";
      return;
    }
    link.style.opacity = "0.55";
    link.style.pointerEvents = "none";
    link.title = "Attendance Tracking disabled: 3 absences. Please go to OSAS/Admin for clearance.";
  }

  // compute worst absence across ALL subjects (global lock)
  // - counts absences AFTER admin clearedAt
  function computeWorstAbsenceAndLock() {
    // load admin clear map
    const clearMap = safeParse(localStorage.getItem(OSAS_CLEAR_KEY) || "{}", {});
    const clearedAt = clearMap[currentUser]?.clearedAt || 0;

    // load attendance object
    const attObj = safeParse(localStorage.getItem(`scat_attendance_${currentUser}`) || "{}", {});

    // load schedules for subjectCode mapping
    const sched = safeParse(localStorage.getItem(`scat_schedules_${currentUser}`) || "[]", []);
    const schedMap = new Map();
    sched.forEach(s => { if (s?.id != null) schedMap.set(String(s.id), s); });

    let worstCount = 0;
    let worstSubjectCode = "";

    for (const subjectId of Object.keys(attObj || {})) {
      const rows = Array.isArray(attObj[subjectId]) ? attObj[subjectId] : [];
      let abs = 0;

      for (const r of rows) {
        if (String(r?.status || "").toUpperCase() !== "ABSENT") continue;

        const t = dateToMs(r?.date);
        if (clearedAt && t && t <= clearedAt) continue;

        abs++;
      }

      if (abs > worstCount) {
        worstCount = abs;
        const subj = schedMap.get(String(subjectId));
        worstSubjectCode = (subj?.subjectCode || `Subject ${subjectId}`).toString().trim();
      }
    }

    const locked = worstCount >= 3;
    return { worstCount, worstSubjectCode, locked };
  }

  // PERSONAL INFO
  const personalBtn = document.querySelector(".personalBtn");
  if (personalBtn) {
    personalBtn.addEventListener("click", () => {
      window.location.href = "profile.html";
    });
  }

  // SUBJECT LIST 
  const subjectsScroll = document.getElementById("subjectsScroll");
  if (subjectsScroll) {
    const schedKey = `scat_schedules_${currentUser}`;
    let sched = [];
    try { sched = JSON.parse(localStorage.getItem(schedKey) || "[]"); } catch { sched = []; }

    if (!sched.length) {
      subjectsScroll.innerHTML = `
          <div class="emptySubject">
            No subjects yet. Go to <b>Schedule</b> and add your schedule.
          </div>
        `;
    } else {

      const unique = [];
      const seen = new Set();
      sched.forEach(s => {
        const key = `${(s.subjectCode || "").trim()}|${(s.subjectName || "").trim()}`;
        if (!seen.has(key)) { seen.add(key); unique.push(s); }
      });

      subjectsScroll.innerHTML = unique.map(s => `
          <div class="subjectCard">
            <div class="subjectText">${s.subjectCode || ""} - ${s.subjectName || "SUBJECT"}</div>
            <button class="subjectBtn" type="button" data-id="${s.id}">view</button>
          </div>
        `).join("");

      subjectsScroll.addEventListener("click", (e) => {
        const btn = e.target.closest(".subjectBtn");
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;
        window.location.href = `attendance-view.html?id=${encodeURIComponent(id)}`;
        // ✅ ADD ONLY: stop view if locked
        const osas = computeWorstAbsenceAndLock();
        if (osas.locked) {
          alert("Attendance Tracking is temporarily disabled. Please go to OSAS/Admin for clearance.");
          return;
        }
      });
    }
  }
  // run warning + lock
  const osas = computeWorstAbsenceAndLock();

  if (osas.worstCount >= 3) {
    setWarning3(osas.worstSubjectCode || "SUBJECT");
    lockAttendanceMenu(true);
  } else if (osas.worstCount === 2) {
    setWarning2(osas.worstSubjectCode || "SUBJECT", 2);
    lockAttendanceMenu(false);
  } else {
    setWarningNone();
    lockAttendanceMenu(false);
  }
  // LOGOUT
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("scat_student_current");  // correct
    window.location.href = "login.html";               // student login
  });
});