Document.addEventListener("DOMContentLoaded", () => {
    const profEmail = (localStorage.getItem("scat_prof_current") || "").trim().toLowerCase();
    if (!profEmail) { window.location.href = "../login.php"; return; }

    const ADMIN_KEY = "scat_admin_enrollments";

    const params = new URLSearchParams(window.location.search);
    let subjectCode = String(params.get("code") || "").trim().toUpperCase();
    let semVal = String(params.get("sem") || "").trim();

    if (!semVal) semVal = String(localStorage.getItem("scat_prof_sem_selected") || "2");

    if (!subjectCode) {
        const savedCode = String(localStorage.getItem("scat_prof_last_att_code") || "").trim().toUpperCase();
        const savedSem = String(localStorage.getItem("scat_prof_last_att_sem") || "").trim();
        if (savedCode) subjectCode = savedCode;
        if (savedSem) semVal = savedSem;
    }

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

    pageTitle.textContent = subjectCode ? `Courses for ${subjectCode}` : "Attendance Tracking";

    if (!subjectCode) {
        emptyBox.style.display = "block";
        emptyBox.textContent = "Open a subject from Schedule to view courses.";
        return;
    }

    const all = safeJSON(localStorage.getItem(ADMIN_KEY));

    const items = all.filter(e =>
        String(e.professorEmail || "").toLowerCase() === profEmail &&
        String(e.subjectCode || "").toUpperCase() === subjectCode &&
        normalizeSemester(e.semester) === String(semVal)
    );

    const map = {};
    for (const it of items) {
        const program = String(it.program || it.studentProgram || "").toUpperCase().trim();
        const year = String(it.year || it.studentYear || "").toUpperCase().trim();
        const section = String(it.section || it.studentSection || "").toUpperCase().trim();

        if (!program) continue;

        const key = `${program}|${year}|${section}`;

        map[key] ??= { program, year, section, rows: [] };
        map[key].rows.push(it);
    }

    const keys = Object.keys(map).sort();
    tbody.innerHTML = "";

    if (!keys.length) {
        emptyBox.style.display = "block";
    } else {
        emptyBox.style.display = "none";

        for (const k of keys) {
            const g = map[k];

            const unique = new Set(
                g.rows.map(x => String(x.studentEmail || x.studentName || "").trim().toLowerCase()).filter(Boolean)
            );

            const tr = document.createElement("tr");
            tr.className = "rowClickable";
            tr.innerHTML = `
          <td>${esc(g.program)}</td>
          <td>${esc(g.year)}</td>
          <td>${esc(g.section)}</td>
          <td>${esc(String(unique.size))}</td>
          <td class="colArrow">›</td>
        `;

            tr.addEventListener("click", () => {
                window.location.href =
                    `prof-attendance-list.php?code=${encodeURIComponent(subjectCode)}&course=${encodeURIComponent(k)}&sem=${encodeURIComponent(String(semVal))}`;
            });

            tbody.appendChild(tr);
        }
    }

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("scat_prof_current");
        window.location.href = "../login.php";
    });
});