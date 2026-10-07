document.addEventListener("DOMContentLoaded", () => {

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const actionDialog = {
        backdrop: document.getElementById("actionModalBackdrop"), title: document.getElementById("actionModalTitle"), subtitle: document.getElementById("actionModalSubtitle"), body: document.getElementById("actionModalBody"), close: document.getElementById("actionModalClose"), cancel: document.getElementById("actionModalCancel"), confirm: document.getElementById("actionModalConfirm")
    };
    let dialogOnConfirm = null;
    let dialogReturnFocus = null;
    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer"); if (!container) return;
        const icons = { info: "info", success: "circle-check", error: "circle-x", warning: "triangle-alert" };
        const toast = document.createElement("div"); toast.className = `toast ${icons[type] ? type : "info"}`; toast.setAttribute("role", "status");
        const icon = document.createElement("i"); icon.dataset.lucide = icons[type] || icons.info; icon.setAttribute("aria-hidden", "true");
        const text = document.createElement("span"); text.textContent = message; toast.append(icon, text); container.append(toast); window.lucide?.createIcons();
        requestAnimationFrame(() => toast.classList.add("show")); window.setTimeout(() => { toast.classList.remove("show"); window.setTimeout(() => toast.remove(), 300); }, 3000);
    }
    function closeModal(confirmed = false) {
        if (!actionDialog.backdrop || actionDialog.backdrop.hidden) return;
        actionDialog.backdrop.hidden = true; actionDialog.backdrop.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open");
        const callback = dialogOnConfirm; const focusTarget = dialogReturnFocus; dialogOnConfirm = null; dialogReturnFocus = null;
        if (confirmed) callback?.(); focusTarget?.focus?.();
    }
    function openModal(options = {}) {
        if (!actionDialog.backdrop) return; if (!actionDialog.backdrop.hidden) closeModal();
        dialogReturnFocus = document.activeElement; actionDialog.title.textContent = options.title || "Action"; actionDialog.subtitle.textContent = options.subtitle || ""; actionDialog.body.replaceChildren();
        if (options.message) { const message = document.createElement("p"); message.className = "modal-message"; message.textContent = options.message; actionDialog.body.append(message); }
        const controls = new Map();
        (options.fields || []).forEach((field, index) => {
            const wrapper = document.createElement("div"); wrapper.className = "modal-field"; const label = document.createElement("label"); const id = `actionModalField${index}`; label.htmlFor = id; label.textContent = field.label;
            let control;
            if (field.type === "textarea") control = document.createElement("textarea");
            else if (field.type === "select") { control = document.createElement("select"); (field.options || []).forEach(item => { const option = document.createElement("option"); option.value = typeof item === "string" ? item : item.value; option.textContent = typeof item === "string" ? item : item.label; control.append(option); }); }
            else { control = document.createElement("input"); control.type = field.type || "text"; }
            control.id = id; control.name = field.name || id; control.value = field.value ?? ""; control.required = Boolean(field.required); control.readOnly = Boolean(field.readOnly); if (field.placeholder) control.placeholder = field.placeholder;
            controls.set(control.name, control); wrapper.append(label, control); actionDialog.body.append(wrapper);
        });
        actionDialog.cancel.textContent = options.cancelLabel || "Cancel"; actionDialog.cancel.hidden = options.cancelLabel === null; actionDialog.confirm.textContent = options.confirmLabel || "Continue"; actionDialog.confirm.hidden = options.confirmLabel === null; actionDialog.confirm.className = options.confirmClass || "primary-button";
        dialogOnConfirm = () => options.onConfirm?.(Object.fromEntries([...controls].map(([name, control]) => [name, control.value])));
        actionDialog.backdrop.hidden = false; actionDialog.backdrop.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); requestAnimationFrame(() => (actionDialog.body.querySelector("input, select, textarea") || actionDialog.close).focus());
    }
    function openConfirm(options = {}) { openModal({ ...options, cancelLabel: options.cancelLabel || "No", confirmLabel: options.confirmLabel || "Yes, Continue", confirmClass: options.confirmClass || "danger-button" }); }
    actionDialog.close?.addEventListener("click", () => closeModal()); actionDialog.cancel?.addEventListener("click", () => closeModal());
    actionDialog.confirm?.addEventListener("click", () => { const invalid = [...actionDialog.body.querySelectorAll("input, select, textarea")].find(control => !control.checkValidity()); if (invalid) { invalid.reportValidity(); return; } closeModal(true); });
    actionDialog.backdrop?.addEventListener("click", event => { if (event.target === actionDialog.backdrop) closeModal(); });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") { if (!actionDialog.backdrop?.hidden) closeModal(); else if (document.getElementById("packageModal")?.classList.contains("show")) document.getElementById("cancelModal")?.click(); }
        const target = event.target;
        if (event.key === "/" && actionDialog.backdrop?.hidden && !target?.matches?.("input, textarea, select, [contenteditable='true']")) { const search = document.getElementById("globalSearch"); if (search) { event.preventDefault(); search.focus(); } }
    });


    /* =========================
       SIDEBAR TOGGLE
    ========================== */

    const sidebarToggle =
        document.getElementById("mobileMenu");

    if (sidebarToggle) {

        sidebarToggle.addEventListener("click", () => {

            const isHidden =
                document.body.classList.toggle("sidebar-hidden");

            const action = isHidden ? "Show" : "Hide";

            sidebarToggle.setAttribute("aria-expanded", String(!isHidden));
            sidebarToggle.setAttribute("aria-label", action + " sidebar");
            sidebarToggle.title = action + " sidebar";

        });

    }


    /* =========================
       NAV LINKS
    ========================== */

    /* =========================
       SETTINGS NAVIGATION
    ========================== */

    const settingsNavItems =
        document.querySelectorAll(".settings-nav-item");

    const settingsSections =
        document.querySelectorAll(".settings-section");

    settingsNavItems.forEach(item => {

        item.addEventListener("click", () => {

            const sectionId =
                item.dataset.section;

            settingsNavItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            settingsSections.forEach(sec => {
                sec.classList.toggle("active", sec.id === sectionId);
            });

            // Re-render lucide icons in the newly active section
            if (window.lucide) {
                window.lucide.createIcons();
            }

        });

    });


    /* =========================
       THEME SELECTOR
    ========================== */

    const themeOptions =
        document.querySelectorAll(".theme-option");

    themeOptions.forEach(option => {

        option.addEventListener("click", () => {

            themeOptions.forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            const theme = option.dataset.theme;

            document.body.dataset.theme = theme;

            if (theme === "dark") {
                document.body.classList.add("theme-dark");
            } else {
                document.body.classList.remove("theme-dark");
            }

            console.log("Theme set to:", theme);

        });

    });


    /* =========================
       ACCENT COLOR
    ========================== */

    const colorOptions =
        document.querySelectorAll(".color-option");

    colorOptions.forEach(option => {

        option.addEventListener("click", () => {

            colorOptions.forEach(o => o.classList.remove("active"));
            option.classList.add("active");

            const color = option.dataset.color;

            document.documentElement.style.setProperty("--blue", color);

            console.log("Accent color set to:", color);

        });

    });


    /* =========================
       SAVE ALL
    ========================== */

    const saveAllButton =
        document.getElementById("saveAllButton");

    if (saveAllButton) {

        saveAllButton.addEventListener("click", () => {

            // Collect all input values (stub)
            const inputs =
                document.querySelectorAll(
                    ".settings-section input, .settings-section select, .settings-section textarea"
                );

            const settings = {};

            inputs.forEach(input => {

                const key =
                    input.id || input.dataset.setting;

                if (!key) return;

                if (input.type === "checkbox") {
                    settings[key] = input.checked;
                } else {
                    settings[key] = input.value;
                }

            });

            console.log("Saved settings:", settings);

            showToast("All settings saved successfully.", "success");

        });

    }


    /* =========================
       PROFILE — UPLOAD PHOTO
    ========================== */

    const uploadPhotoButton =
        document.getElementById("uploadPhotoButton");

    if (uploadPhotoButton) {

        uploadPhotoButton.addEventListener("click", () => {

            openModal({
                title: "Upload Profile Photo",
                subtitle: "Choose an image from your device.",
                fields: [{ name: "photo", label: "Photo file", type: "file", required: true }],
                confirmLabel: "Upload Photo",
                onConfirm: () => showToast("Photo upload is not connected yet.", "info")
            });

        });

    }


    /* =========================
       PROFILE — REMOVE PHOTO
    ========================== */

    const removePhotoButton =
        document.getElementById("removePhotoButton");

    if (removePhotoButton) {

        removePhotoButton.addEventListener("click", () => {

            openConfirm({
                title: "Remove Profile Photo",
                message: "Are you sure you want to remove your profile photo?",
                confirmLabel: "Remove Photo",
                onConfirm: () => showToast("Profile photo removed.", "success")
            });

        });

    }


    /* =========================
       SECURITY — UPDATE PASSWORD
    ========================== */

    const updatePasswordButton =
        document.getElementById("updatePasswordButton");

    if (updatePasswordButton) {

        updatePasswordButton.addEventListener("click", () => {

            const current =
                document.getElementById("currentPassword").value.trim();

            const newPass =
                document.getElementById("newPassword").value.trim();

            const confirmPass =
                document.getElementById("confirmPassword").value.trim();

            if (!current || !newPass || !confirmPass) {
                showToast("Please fill in all password fields.", "error");
                return;
            }

            if (newPass !== confirmPass) {
                showToast("New passwords do not match.", "error");
                return;
            }

            if (newPass.length < 8) {
                showToast("Password must be at least 8 characters.", "error");
                return;
            }

            showToast("Password updated successfully.", "success");

            // Clear fields
            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";

        });

    }


    /* =========================
       NOTIFICATIONS
    ========================== */

    const notificationButton =
        document.getElementById("notificationButton");

    if (notificationButton) {

        notificationButton.addEventListener("click", () => {

            showToast("You have 3 new notifications.", "info");

        });

    }


    /* =========================
       LOGOUT
    ========================== */

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            openConfirm({
                title: "Log Out",
                message: "Are you sure you want to log out?",
                confirmLabel: "Log Out",
                onConfirm: () => {
                    showToast("Logging out...", "info");
                // window.location.href = "login.html";
                }
            });

        });

    }


    /* =========================
       ADMIN PROFILE
    ========================== */

    const adminProfile =
        document.querySelector(".admin-profile");

    if (adminProfile) {

        adminProfile.addEventListener("click", () => {

            openModal({ title: "Staff Profile", subtitle: "Signed in as staff", message: "Jonas Reyes", cancelLabel: null, confirmLabel: "Close" });

        });

    }


    /* =========================
       SEARCH (filter visible form groups)
    ========================== */

    const searchInput =
        document.getElementById("globalSearch");

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const keyword =
                searchInput.value.toLowerCase().trim();

            const groups =
                document.querySelectorAll(
                    ".settings-section.active .form-group"
                );

            groups.forEach(group => {

                const text =
                    group.innerText.toLowerCase();

                group.style.display =
                    text.includes(keyword) ? "" : "none";

            });

        });

    }

});

/* =========================
   TINYMCE RICH TEXT EDITORS
========================== */
function initRichTextEditors() {
    if (window.tinymce) {
        tinymce.init({
            selector: '#termsEditor, #privacyEditor',
            height: 280,
            menubar: false,
            plugins: 'lists link code preview wordcount',
            toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link code preview',
            content_style: 'body { font-family: "Poppins", sans-serif; font-size: 13px; color: #18324c; }',
            setup: function (editor) {
                editor.on('change', function () {
                    editor.save(); // Sync editor content back to standard textarea
                });
            }
        });
    }
}

// Call on page load
initRichTextEditors();

/* =========================
   SAVE BUSINESS SETTINGS
========================== */
document.getElementById("saveBusinessSettingsBtn")?.addEventListener("click", () => {
    // Save TinyMCE content to textareas
    if (window.tinymce) {
        tinymce.triggerSave();
    }

    const businessData = {
        name: document.getElementById("businessName")?.value,
        email: document.getElementById("businessEmail")?.value,
        phone: document.getElementById("businessPhone")?.value,
        address: document.getElementById("businessAddress")?.value,
        terms: document.getElementById("termsEditor")?.value,
        privacy: document.getElementById("privacyEditor")?.value
    };

    console.log("Saved Business Info:", businessData);
    showToast("Business information and policies updated successfully!", "success");
});

 /* =========================
       LOGOUT
    ========================== */

    document.getElementById("logoutButton")
        ?.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                showToast("Logging out...", "success");
            }
        });