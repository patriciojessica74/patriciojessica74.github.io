document.addEventListener("DOMContentLoaded", () => {
  const currentUser = (localStorage.getItem("scat_student_current") || "").trim().toLowerCase();
  if (!currentUser) { window.location.href = "dashboard.html"; return; }

  const CATALOG_KEY = "scat_subject_catalog";
  const PROF_KEY = "scat_prof_list";
  const ADMIN_ENROLL_KEY = "scat_admin_enrollments";

  // ✅ IMPORTANT: support both schedule keys (because your other pages use different keys)
  const SCHEDULE_KEY_A = `scat_schedules_${currentUser}`;
  const SCHEDULE_KEY_B = `scat_student_schedules_${currentUser}`;

  const el = (id) => document.getElementById(id);
  const msg = el("msg");

  function show(text, ok = false) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = ok ? "#0b7a1d" : "#b00000";
  }

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }
  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSubjectCode(obj) {
    return String(obj?.code ?? obj?.subjectCode ?? "").toUpperCase().trim();
  }
  function getSubjectName(obj) {
    return String(obj?.name ?? obj?.subjectName ?? "").trim();
  }
  function getRoom(obj) {
    return String(obj?.room ?? "").trim();
  }

  // student profile (for program/year/section)
  function loadStudentProfile() {
    let p = {};
    try { p = JSON.parse(localStorage.getItem(`scat_user_${currentUser}`) || "{}"); } catch { }
    if (!p || Object.keys(p).length === 0) {
      try { p = JSON.parse(localStorage.getItem(`scat_student_${currentUser}`) || "{}"); } catch { }
    }
    return p || {};
  }

  function entryIdFor(obj) {
    return `${currentUser}__${obj.subjectCode}__${obj.day}__${obj.startTime}`;
  }

  // ✅ Load schedules from BOTH keys and merge (no duplicates by id)
  function loadScheduleList() {
    const a = loadJSON(SCHEDULE_KEY_A, []);
    const b = loadJSON(SCHEDULE_KEY_B, []);
    const map = new Map();

    for (const it of [...a, ...b]) {
      if (!it) continue;
      const id = String(it.id || "").trim();
      if (!id) continue;
      map.set(id, it);
    }

    return Array.from(map.values());
  }

  // ✅ Save schedules to BOTH keys (keeps all pages consistent)
  function saveScheduleList(list) {
    saveJSON(SCHEDULE_KEY_A, list);
    saveJSON(SCHEDULE_KEY_B, list);
  }

  // Admin enrollments
  function syncToAdminEnrollments(obj) {
    const all = loadJSON(ADMIN_ENROLL_KEY, []);
    const sp = loadStudentProfile();
    const id = entryIdFor(obj);

    const adminEntry = {
      id,
      studentEmail: currentUser,
      studentName: sp.fullname || "Student",
      studentProgram: sp.program || "",
      studentYear: sp.year || "",
      studentSection: sp.section || "",
      studentClass: `${sp.program || ""} ${sp.year || ""} - ${sp.section || ""}`.trim(),

      subjectId: obj.id,
      subjectCode: obj.subjectCode,
      subjectName: obj.subjectName,
      room: obj.room,
      day: obj.day,
      startTime: obj.startTime,
      endTime: obj.endTime,
      semester: obj.semester,

      professorEmail: obj.professor,
      updatedAt: Date.now()
    };

    const idx = all.findIndex(x => String(x.id) === String(id));
    if (idx >= 0) all[idx] = adminEntry;
    else all.push(adminEntry);

    saveJSON(ADMIN_ENROLL_KEY, all);
  }

  function removeFromAdminEnrollments(oldObj) {
    const all = loadJSON(ADMIN_ENROLL_KEY, []);
    const oldId = `${currentUser}__${oldObj.subjectCode}__${oldObj.day}__${oldObj.startTime}`;
    saveJSON(ADMIN_ENROLL_KEY, all.filter(x => String(x.id) !== String(oldId)));
  }

  // Professor inbox
  function removeInboxEntry(oldObj) {
    const profEmail = String(oldObj.professor || "").toLowerCase().trim();
    if (!profEmail) return;

    const INBOX_KEY = `scat_prof_inbox_${profEmail}`;
    let inbox = loadJSON(INBOX_KEY, []);

    const oldId = `${currentUser}__${oldObj.subjectCode}__${oldObj.day}__${oldObj.startTime}`;
    inbox = inbox.filter(x => String(x.id) !== String(oldId));
    saveJSON(INBOX_KEY, inbox);
  }

  function syncToProfessorInbox(obj) {
    const profEmail = String(obj.professor || "").toLowerCase().trim();
    if (!profEmail) return;

    const INBOX_KEY = `scat_prof_inbox_${profEmail}`;
    const inbox = loadJSON(INBOX_KEY, []);
    const sp = loadStudentProfile();
    const id = entryIdFor(obj);

    const newEntry = {
      id,
      studentEmail: currentUser,
      studentName: sp.fullname || "Student",
      studentProgram: sp.program || "",
      studentYear: sp.year || "",
      studentSection: sp.section || "",
      studentClass: `${sp.program || ""} ${sp.year || ""} - ${sp.section || ""}`.trim(),

      subjectId: obj.id,
      subjectCode: obj.subjectCode,
      subjectName: obj.subjectName,
      room: obj.room,
      day: obj.day,
      startTime: obj.startTime,
      endTime: obj.endTime,
      semester: obj.semester,

      professorEmail: profEmail,
      updatedAt: Date.now()
    };

    const idx = inbox.findIndex(x => String(x.id) === String(id));
    if (idx >= 0) inbox[idx] = newEntry;
    else inbox.push(newEntry);

    saveJSON(INBOX_KEY, inbox);
  }

  // Form params
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  let list = loadScheduleList();
  let item = editId ? list.find(s => String(s.id) === String(editId)) : null;

  function loadCatalog() {
    return loadJSON(CATALOG_KEY, []);
  }

  function renderSubjectCodes(selectedCode = "") {
    const sel = el("subjectCode");
    if (!sel) return;

    sel.innerHTML = `<option value="" disabled>Select Subject Code</option>`;

    const catalog = loadCatalog()
      .filter(s => getSubjectCode(s))
      .sort((a, b) => getSubjectCode(a).localeCompare(getSubjectCode(b)));

    catalog.forEach(s => {
      const code = getSubjectCode(s);
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${code} — ${getSubjectName(s)}`;
      if (selectedCode && code === String(selectedCode).toUpperCase().trim()) opt.selected = true;
      sel.appendChild(opt);
    });

    if (!catalog.length) show("No subjects in admin catalog yet. Ask admin to add subjects.", false);
  }

  function applySubjectDetails(code) {
    const codeKey = String(code || "").toUpperCase().trim();
    const catalog = loadCatalog();
    const found = catalog.find(s => getSubjectCode(s) === codeKey);

    if (!found) {
      if (el("subjecCode")) el("subjectName").value = "";
      if (el("room")) el("room").value = "";
      return;
    }

    if (el("subjectCode")) el("subjectName").value = getSubjectName(found);
    if (el("room")) el("room").value = getRoom(found);
  }

  function renderProfessors(selectedEmail = "") {
    const sel = el("professor");
    if (!sel) return;

    sel.innerHTML = `<option value="" disabled>Select Professor</option>`;

    const profs = loadJSON(PROF_KEY, [])
      .filter(p => (p.email || "").trim() !== "")
      .sort((a, b) => String(a.fullname || "").localeCompare(String(b.fullname || "")));

    profs.forEach(p => {
      const email = String(p.email || "").toLowerCase().trim();
      const opt = document.createElement("option");
      opt.value = email;
      opt.textContent = p.fullname || p.username || p.email || "Professor";
      if (selectedEmail && email === String(selectedEmail).toLowerCase().trim()) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function readForm() {
    return {
      id: item?.id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      subjectCode: (el("subjectCode")?.value || "").trim().toUpperCase(),
      subjectName: (el("subjectName")?.value || "").trim(),
      professor: (el("professor")?.value || "").trim().toLowerCase(),
      room: (el("room")?.value || "").trim(),
      day: (el("day")?.value || "").trim(),
      semester: (el("semester")?.value || "").trim(),
      startTime: (el("startTime")?.value || "").trim(),
      endTime: (el("endTime")?.value || "").trim()
    };
  }

  // ✅ Conflict check
  function timeToMin(t) {
    const raw = String(t || "").trim();
    if (!raw) return NaN;

    // Case 1: "HH:MM" (24h) from <input type="time">
    const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      const hh = Number(m24[1]);
      const mm = Number(m24[2]);
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN;
      return hh * 60 + mm;
    }

    const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m12) {
      let hh = Number(m12[1]);
      const mm = Number(m12[2]);
      const ap = String(m12[3] || "").toUpperCase();

      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN;
      if (hh < 1 || hh > 12 || mm < 0 || mm > 59) return NaN;

      // convert to 24h
      if (ap === "AM") {
        if (hh === 12) hh = 0;
      } else {
        if (hh !== 12) hh += 12;
      }
      return hh * 60 + mm;
    }

    return NaN;
  }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  function norm(x) { return String(x ?? "").trim().toLowerCase(); }
  function normSem(v) {
    const s = norm(v);
    if (s === "1" || s.includes("1st")) return "1";
    if (s === "2" || s.includes("2nd")) return "2";
    return s;
  }

  function findScheduleConflict(data, list) {
    const dDay = norm(data.day);
    const dSem = normSem(data.semester);
    const dStart = timeToMin(data.startTime);
    const dEnd = timeToMin(data.endTime);

    if (!dDay || !dSem || !Number.isFinite(dStart) || !Number.isFinite(dEnd)) return null;

    for (const s of (list || [])) {
      if (!s) continue;
      if (String(s.id) === String(data.id)) continue; // ignore itself

      if (normSem(s.semester) !== dSem) continue;
      if (norm(s.day) !== dDay) continue;

      const sStart = timeToMin(s.startTime);
      const sEnd = timeToMin(s.endTime);
      if (!Number.isFinite(sStart) || !Number.isFinite(sEnd)) continue;

      if (overlaps(dStart, dEnd, sStart, sEnd)) return s;
    }
    return null;
  }

  // INIT
  renderSubjectCodes(item?.subjectCode || "");
  renderProfessors(item?.professor || "");

  if (item) {
    if (el("subjectCode")) el("subjectCode").value = String(item.subjectCode || "").toUpperCase().trim();
    applySubjectDetails(item.subjectCode);

    if (el("professor")) el("professor").value = String(item.professor || "").toLowerCase().trim();
    if (el("day")) el("day").value = item.day || "";
    if (el("semester")) el("semester").value = item.semester || "";
    if (el("startTime")) el("startTime").value = item.startTime || "";
    if (el("endTime")) el("endTime").value = item.endTime || "";
  } else {
    if (el("deleteBtn")) el("deleteBtn").style.display = "none";
  }

  el("subjectCode")?.addEventListener("change", (e) => applySubjectDetails(e.target.value));

  // SAVE
  el("saveBtn")?.addEventListener("click", (e) => {
    e.preventDefault();

    // reload latest list (in case other page updated)
    list = loadScheduleList();

    const data = readForm();

    // required fields first
    if (!data.subjectCode) return show("Please select Subject Code.");
    if (!data.subjectName || !data.room) return show("Subject Name/Room missing. Ask admin to add complete subject details.");
    if (!data.professor) return show("Please select Professor.");
    if (!data.day) return show("Please select Day.");
    if (!data.semester) return show("Please select Semester.");
    if (!data.startTime || !data.endTime) return show("Please select Start and End Time.");

    // validate time order
    const startMin = timeToMin(data.startTime);
    const endMin = timeToMin(data.endTime);
    if (!Number.isFinite(startMin) || !Number.isFinite(endMin)) return show("Invalid time.");
    if (endMin <= startMin) return show("End Time must be later than Start Time.");

    // conflict check
    const conflict = findScheduleConflict(data, list);
    if (conflict) {
      const conflictInfo =
        `${(conflict.subjectCode || "").toUpperCase()} ${conflict.subjectName || "Subject"} ` +
        `(${conflict.startTime}–${conflict.endTime})`;
      return show(`Schedule conflict! You already have ${conflictInfo} on ${conflict.day} (${conflict.semester}).`);
    }

    // if editing and key fields changed -> remove old inbox/admin record
    if (item) {
      const changed =
        norm(item.professor) !== norm(data.professor) ||
        String(item.subjectCode || "").toUpperCase().trim() !== data.subjectCode ||
        norm(item.day) !== norm(data.day) ||
        String(item.startTime || "").trim() !== data.startTime.trim();

      if (changed) {
        removeInboxEntry(item);
        removeFromAdminEnrollments(item);
      }

      list = list.map(s => (String(s.id) === String(editId) ? data : s));
    } else {
      list.push(data);
    }

    // Save
    saveScheduleList(list);

    syncToProfessorInbox(data);
    syncToAdminEnrollments(data);

    show("Saved!", true);
    setTimeout(() => window.location.href = "schedule.html", 350);
  });
  // CANCEL
  el("cancelBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "schedule.html";
  });

  // DELETE
  el("deleteBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!item) return;
    if (!confirm("Delete this subject?")) return;

    list = loadScheduleList().filter(s => String(s.id) !== String(editId));
    saveScheduleList(list);

    removeInboxEntry(item);
    removeFromAdminEnrollments(item);

    window.location.href = "schedule.html";
  });

  // LOGOUT
  el("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("scat_student_current");
    window.location.href = "login.html";
  });
});