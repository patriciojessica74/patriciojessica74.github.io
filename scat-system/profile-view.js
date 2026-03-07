document.addEventListener("DOMContentLoaded", () => {
    const currentUser = (localStorage.getItem("scat_student_current") || "").trim();
    if (!currentUser) return;

    // ✅ use the same key your other pages use
    let raw = localStorage.getItem(`scat_user_${currentUser}`);

    // fallback (if you saved some profiles here)
    if (!raw) raw = localStorage.getItem(`scat_student_${currentUser}`);

    if (!raw) {
        console.log("User profile not found.");
        return;
    }

    let profile;
    try { profile = JSON.parse(raw); }
    catch (err) {
        console.log("Invalid JSON:", err);
        return;
    }

    document.getElementById("vUsername").textContent = `Username: ${profile.username || "—"}`;
    document.getElementById("vName").textContent = `Name: ${profile.fullname || "—"}`;
    document.getElementById("vStudentId").textContent = `Student ID: ${profile.studentid || "—"}`;
    document.getElementById("vProgram").textContent = `Program: ${profile.program || "—"}`;
    document.getElementById("vYear").textContent = `Year: ${profile.year || "—"}`;
    document.getElementById("vSection").textContent = `Section: ${profile.section || "—"}`;
    document.getElementById("vEmail").textContent = `Email: ${profile.email || "—"}`;

    const imgEl = document.getElementById("profileImage");
    if (imgEl) imgEl.src = (profile.profile_image && profile.profile_image.trim())
        ? profile.profile_image
        : "image/profile.jpeg";

    // ✅ logout removes the correct session key
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("scat_student_current");
        window.location.href = "login.html";
    });
});