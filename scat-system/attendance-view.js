document.addEventListener("DOMContentLoaded", () => {
    // ---------- helpers ----------
    function safeParse(raw, fallback) { try { return JSON.parse(raw); } catch { return fallback; } }
    function norm(s) { return String(s || "").trim(); }
    function normLower(s) { return norm(s).toLowerCase(); }

    function formatTime(t) {
        t = norm(t);
        if (!t) return "—";
        if (/[AP]M/i.test(t)) return t; // already 12h
        const m = t.match(/^(\d{1,2})\s*:\s*(\d{2})$/);
        if (!m) return t;
        let hh = Number(m[1]);
        const mm = m[2];
        const ap = hh >= 12 ? "PM" : "AM";
        hh = hh % 12; if (hh === 0) hh = 12;
        return `${hh}:${mm} ${ap}`;
    }

    // ---------- current user (DO NOT force lowercase only) ----------
    const rawUser = norm(localStorage.getItem("scat_student_current"));
    const currentUserLower = rawUser.toLowerCase();

    // logout
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("scat_student_current");
        window.location.href = "login.html";
    });

    if (!rawUser) {
        window.location.href = "login.html";
        return;
    }

    // ---------- subject id from URL ----------
    const params = new URLSearchParams(window.location.search);
    const subjectId = norm(params.get("id"));
    if (!subjectId) {
        window.location.href = "attendance.html";
        return;
    }

    // ---------- ensure tbody exists (auto-fix HTML) ----------
    const table = document.querySelector("table.table") || document.querySelector("table");
    let tbody = document.getElementById("tbody");

    if (!tbody && table) {
        tbody = document.createElement("tbody");
        tbody.id = "tbody";
        table.appendChild(tbody);
    }

    // ---------- load schedules (try BOTH casing keys) ----------
    function loadSchedulesFor(email) {
        const A = `scat_schedules_${email}`;
        const B = `scat_student_schedules_${email}`;
        const a = safeParse(localStorage.getItem(A) || "[]", []);
        const b = safeParse(localStorage.getItem(B) || "[]", []);
        const map = new Map();
        [...a, ...b].forEach(s => { if (s?.id != null) map.set(String(s.id), s); });
        return Array.from(map.values());
    }

    // Try raw email key first, then lowercase key
    let schedules = loadSchedulesFor(rawUser);
    if (!schedules.length) schedules = loadSchedulesFor(currentUserLower);

    // Find the subject by ID
    const subject = schedules.find(s => String(s.id) === subjectId);

    // ---------- set header (support different IDs safely) ----------
    const subjectTitleEl =
        document.getElementById("subjectCodeTitle") ||
        document.getElementById("headTitle") ||
        document.querySelector(".headTitle");

    const subjectLineEl = document.getElementById("subjectLine");
    const dayLineEl = document.getElementById("dayLine");
    const timeLineEl = document.getElementById("timeLine");

    if (subject) {
        if (subjectTitleEl) subjectTitleEl.textContent = subject.subjectCode || "SUBJECT";
        if (subjectLineEl) subjectLineEl.textContent = `Subject: ${subject.subjectName || "—"}`;
        if (dayLineEl) dayLineEl.textContent = `📅 ${subject.day || "—"}`;
        if (timeLineEl) {
            const timeRange = `${formatTime(subject.startTime)} - ${formatTime(subject.endTime)}`;
            timeLineEl.textContent = `🕘 ${timeRange}`;
        }
    } else {
        // If schedule not found, still show something (prevents blank "—" forever)
        if (subjectTitleEl) subjectTitleEl.textContent = "—";
        if (subjectLineEl) subjectLineEl.textContent = "Subject: —";
        if (dayLineEl) dayLineEl.textContent = "📅 —";
        if (timeLineEl) timeLineEl.textContent = "🕘 —";
    }

    // ---------- load student attendance ----------
    // IMPORTANT: try BOTH casing keys so it matches how prof saved it
    function loadStudentAttendance(email) {
        const key = `scat_attendance_${email}`;
        return safeParse(localStorage.getItem(key) || "{}", {});
    }

    let all = loadStudentAttendance(rawUser);
    if (!Object.keys(all).length) all = loadStudentAttendance(currentUserLower);

    const rows = Array.isArray(all[subjectId]) ? all[subjectId] : [];

    // sort by date MM/DD/YYYY
    rows.sort((a, b) => {
        const pa = String(a.date || "").split("/").map(Number);
        const pb = String(b.date || "").split("/").map(Number);
        const da = new Date(pa[2] || 0, (pa[0] || 1) - 1, pa[1] || 1).getTime();
        const db = new Date(pb[2] || 0, (pb[0] || 1) - 1, pb[1] || 1).getTime();
        return da - db;
    });

    // ---------- render ----------
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!rows.length) {
        tbody.innerHTML = `
        <tr class="rowBlock">
          <td colspan="6" class="emptyCell">No attendance records yet.</td>
        </tr>
      `;
    } else {
        rows.forEach(r => {
            const st = String(r.status || "").toLowerCase();
            const presentClass = st === "present" ? "badge present" : "badge dim";
            const absentClass = st === "absent" ? "badge absent" : "badge dim";
            const lateClass = st === "late" ? "badge late" : "badge dim";

            const tr = document.createElement("tr");
            tr.className = "rowBlock";
            tr.innerHTML = `
          <td class="cell">${r.professor || "—"}</td>
          <td class="cell">
            <div class="statusGroup">
              <span class="${presentClass}">✓ PRESENT</span>
              <span class="${absentClass}">✗ ABSENT</span>
              <span class="${lateClass}">⏰ LATE</span>
            </div>
          </td>
          <td class="cell">${r.timeIn || "—"}</td>
          <td class="cell">${r.date || "—"}</td>
          <td class="cell">${r.note ? r.note : "—"}</td>
          <td class="chevCell"></td>
        `;
            tbody.appendChild(tr);
        });
    }

    // ---------- CSV download ----------
    document.getElementById("downloadBtn")?.addEventListener("click", () => {
        const header = ["Professor", "Status", "Time in", "Date", "Note"];
        const lines = [header.join(",")];

        rows.forEach(r => {
            lines.push([
                String(r.professor || "").replaceAll(",", " "),
                String(r.status || "").replaceAll(",", " "),
                String(r.timeIn || "").replaceAll(",", " "),
                String(r.date || "").replaceAll(",", " "),
                String(r.note || "").replaceAll(",", " ")
            ].join(","));
        });

        const filename = (subject?.subjectCode || "attendance") + ".csv";
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    });
});