document.addEventListener("DOMContentLoaded", () => {
    const currentUser = (localStorage.getItem("scat_student_current") || "").trim();

    if (!currentUser) return;

    const raw = localStorage.getItem(`scat_user_${currentUser}`);
    if (!raw) return;

    let profile;
    try { profile = JSON.parse(raw); } catch { return; }

    // readonly fields
    document.getElementById("eUsername").textContent = `Username: ${profile.username || "—"}`;
    document.getElementById("eName").textContent = `Name: ${profile.fullname || "—"}`;
    document.getElementById("eStudentId").textContent = `Student ID: ${profile.studentid || "—"}`;
    document.getElementById("eProgram").textContent = `Program: ${profile.program || "—"}`;
    document.getElementById("eEmail").textContent = `Email: ${profile.email || "—"}`;

    // editable fields
    const yearSelect = document.getElementById("editYear");
    const sectionSelect = document.getElementById("editSection");
    if (profile.year) yearSelect.value = profile.year;
    if (profile.section) sectionSelect.value = profile.section;

    // image
    const imgEl = document.getElementById("profileImage");
    if (imgEl && profile.profile_image) imgEl.src = profile.profile_image;

    // save
    const saveBtn = document.getElementById("saveBtn");
    const saveMsg = document.getElementById("saveMsg");

    saveBtn.addEventListener("click", () => {
        profile.year = yearSelect.value;
        profile.section = sectionSelect.value;

        localStorage.setItem(`scat_user_${currentUser}`, JSON.stringify(profile));

        saveMsg.textContent = "Saved!";

        setTimeout(() => {
            window.location.href = "profile.html";
        }, 800);
    });


    // upload photo
    const avatarBtn = document.getElementById("avatarBtn");
    const avatarUpload = document.getElementById("avatarUpload");

    if (avatarBtn && avatarUpload && imgEl) {
        avatarBtn.addEventListener("click", () => avatarUpload.click());

        avatarUpload.addEventListener("change", () => {
            const file = avatarUpload.files && avatarUpload.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;

                // show preview
                imgEl.src = base64;

                // update profile object
                profile.profile_image = base64;

                // save to localStorage
                localStorage.setItem(`scat_user_${currentUser}`, JSON.stringify(profile));
            };

            reader.readAsDataURL(file);
        });

    }
    //LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("scat_current_user");
            window.location.href = "login.html";
        });
    }
});
