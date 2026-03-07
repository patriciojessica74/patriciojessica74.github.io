// =====================================
// FILE: prof-attendance-list.js
// PURPOSE: Show students in selected course group
// SOURCE: scat_admin_enrollments
// =====================================
document.addEventListener("DOMContentLoaded", () => {

    const profEmail = (localStorage.getItem("scat_prof_current") || "").trim().toLowerCase();
    if (!profEmail) { window.location.href = "../login.php"; return; }

    const params = new URLSearchParams(window.location.search);
    const subjectCode = String(params.get("code") || "").trim().toUpperCase();
    const courseKey = String(params.get("course") || "").trim();
    const semVal = String(params.get("sem") || localStorage.getItem("scat_prof_sem_selected") || "2");

    const ADMIN_KEY = "scat_admin_enrollments";

    const tbody = document.getElementById("tbody");
    const emptyBox = document.getElementById("emptyBox");
    const pageTitle = document.getElementById("pageTitle");

    function esc(s) {
        return String(s ?? "").replace(/[&<>"']/g, m =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
        );
    }

    function normalizeSemester(v) {
        const s = String(v ?? "").toLowerCase().trim();
        if (s === "1" || s.includes("1st")) return "1";
        if (s === "2" || s.includes("2nd")) return "2";
        return "2";
    }

    function safeJSON(raw) {
        try { return JSON.parse(raw); } catch { return []; }
    }

    if (pageTitle) {
        pageTitle.textContent =
            `Students • ${subjectCode} • ${courseKey.replaceAll("|", " - ")}`;
    }

    const all = safeJSON(localStorage.getItem(ADMIN_KEY));

    // ✅ FILTER BY PROF + SUBJECT + COURSE + SEM
    const enrolled = all.filter(e =>
        String(e.professorEmail || "").toLowerCase() === profEmail &&
        String(e.subjectCode || "").toUpperCase() === subjectCode &&
        normalizeSemester(e.semester) === String(semVal) &&
        String(e.courseKey || "") === courseKey
    );

    // remove duplicate students
    const seen = new Set();
    const students = [];

    for (const e of enrolled) {
        const email = String(e.studentEmail || "").toLowerCase().trim();
        if (!email || seen.has(email)) continue;

        seen.add(email);

        students.push({
            name: e.studentName || email,
            sid: e.studentId || "",
            email
        });
    }

    students.sort((a, b) => a.name.localeCompare(b.name));

    tbody.innerHTML = "";

    if (!students.length) {
        emptyBox.style.display = "block";
        return;
    }

    emptyBox.style.display = "none";

    for (const st of students) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${esc(st.name)}</td>
        <td>${esc(st.sid || "—")}</td>
        <td>${esc(st.email)}</td>
        <td class="colArrow">›</td>
      `;

        tr.addEventListener("click", () => {
            window.location.href =
                `prof-attendance-record.php?student=${encodeURIComponent(st.email)}&code=${encodeURIComponent(subjectCode)}&sem=${encodeURIComponent(semVal)}`;
        });

        tbody.appendChild(tr);
    }

    document.getElementById("backBtn")?.addEventListener("click", () => {
        window.location.href =
            `prof-attendance.php?code=${encodeURIComponent(subjectCode)}&sem=${encodeURIComponent(semVal)}`;
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("scat_prof_current");
        window.location.href = "../login.php";
    });

});