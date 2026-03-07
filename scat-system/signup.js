document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    if (!form) return;

    const getVal = (id) => (document.getElementById(id)?.value || "").trim();

    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const passError = document.getElementById("password-error");

    // ✅ PWD enable/disable
    const pwdRadio = document.getElementById("status-pwd");
    const pwdSelect = document.getElementById("pwd_type");
    const statusRadios = document.querySelectorAll('input[name="status"]');

    function updatePwdSelect() {
        const isPwd = pwdRadio && pwdRadio.checked;
        if (pwdSelect) {
            pwdSelect.disabled = !isPwd;
            if (!isPwd) pwdSelect.selectedIndex = 0; // reset to "Select disability"
        }
    }

    statusRadios.forEach(r => r.addEventListener("change", updatePwdSelect));
    updatePwdSelect();

    // ✅ live password match check
    function checkPasswordMatch() {
        if (!password || !confirmPassword || !passError) return true;

        const p1 = password.value.trim();
        const p2 = confirmPassword.value.trim();

        if (p2 === "") {
            passError.style.display = "none";
            return true;
        }

        if (p1 !== p2) {
            passError.style.display = "inline";
            return false;
        }

        passError.style.display = "none";
        return true;
    }

    password?.addEventListener("input", checkPasswordMatch);
    confirmPassword?.addEventListener("input", checkPasswordMatch);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Read required fields
        const username = getVal("username");
        const fullname = getVal("fullname");
        const studentid = getVal("studentid");
        const program = getVal("program");
        const year = getVal("year");
        const section = getVal("section");
        const emailRaw = getVal("email");
        const email = emailRaw.toLowerCase();
        const pass = password?.value.trim() || "";
        const con = confirmPassword?.value.trim() || "";

        // Validate required fields (your HTML already has required, but JS checks too)
        if (!username || !fullname || !studentid || !program || !year || !section || !email || !pass || !con) {
            alert("Please complete all required fields.");
            return;
        }

        if (!checkPasswordMatch()) {
            alert("Passwords do not match.");
            return;
        }

        // Status (optional)
        const status = document.querySelector('input[name="status"]:checked')?.value || "";
        const pwd_type = status === "pwd" ? (pwdSelect?.value || "") : "";

        if (status === "pwd" && !pwd_type) {
            alert("Please select a disability type for PWD.");
            return;
        }

        const profile = {
            username,
            fullname,
            email,
            studentid,
            program,
            year,
            section,
            password: pass,
            status,       // optional
            pwd_type,     // optional
            profile_image: ""
        };

        try {
            //Save student profile
            localStorage.setItem(`scat_user_${email}`, JSON.stringify(profile));

            //Set student session so dashboard recognizes login
            localStorage.setItem("scat_student_current", email);

            //Redirect
            window.location.href = "dashboard.html";
        } catch (err) {
            console.error(err);
            alert("Failed to save account. Please try again.");
        }
    });
});