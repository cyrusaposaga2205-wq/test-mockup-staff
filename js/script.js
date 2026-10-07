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
            else { control = document.createElement("input"); control.type = field.type === "files" ? "file" : (field.type || "text"); }
            control.id = id; control.name = field.name || id; if (control.type !== "file") control.value = field.value ?? ""; control.required = Boolean(field.required); control.readOnly = Boolean(field.readOnly); if (field.placeholder) control.placeholder = field.placeholder;
            controls.set(control.name, control);
            if (field.type === "files") {
                control.multiple = field.multiple !== false;
                control.accept = field.accept || "image/*";
                control.className = "modal-file-input";
                const dropZone = document.createElement("div");
                dropZone.className = "modal-dropzone";
                dropZone.tabIndex = 0;
                dropZone.setAttribute("role", "button");
                dropZone.setAttribute("aria-label", "Choose images or drop them here");
                const dropIcon = document.createElement("i");
                dropIcon.dataset.lucide = "image-up";
                dropIcon.setAttribute("aria-hidden", "true");
                const dropText = document.createElement("span");
                dropText.textContent = "Drop images here or browse";
                dropZone.append(dropIcon, dropText);
                const previews = document.createElement("div");
                previews.className = "modal-previews";
                const renderPreviews = files => {
                    previews.replaceChildren();
                    Array.from(files).forEach(file => {
                        if (!file.type.startsWith("image/")) return;
                        const reader = new FileReader();
                        reader.addEventListener("load", () => {
                            const image = document.createElement("img");
                            image.src = String(reader.result);
                            image.alt = file.name;
                            previews.append(image);
                        });
                        reader.readAsDataURL(file);
                    });
                };
                dropZone.addEventListener("click", () => control.click());
                dropZone.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); control.click(); }
                });
                dropZone.addEventListener("dragover", event => { event.preventDefault(); dropZone.classList.add("is-dragging"); });
                dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-dragging"));
                dropZone.addEventListener("drop", event => {
                    event.preventDefault();
                    dropZone.classList.remove("is-dragging");
                    if (event.dataTransfer?.files) {
                        control.files = event.dataTransfer.files;
                        renderPreviews(control.files);
                    }
                });
                control.addEventListener("change", () => renderPreviews(control.files));
                wrapper.append(label, dropZone, control, previews);
            } else {
                wrapper.append(label, control);
            }
            actionDialog.body.append(wrapper);
        });
        actionDialog.cancel.textContent = options.cancelLabel || "Cancel"; actionDialog.cancel.hidden = options.cancelLabel === null; actionDialog.confirm.textContent = options.confirmLabel || "Continue"; actionDialog.confirm.hidden = options.confirmLabel === null; actionDialog.confirm.className = options.confirmClass || "primary-button";
        dialogOnConfirm = () => options.onConfirm?.(Object.fromEntries([...controls].map(([name, control]) => [name, control.type === "file" ? Array.from(control.files || []) : control.value])));
        window.lucide?.createIcons();
        actionDialog.backdrop.hidden = false; actionDialog.backdrop.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); requestAnimationFrame(() => (actionDialog.body.querySelector("input:not(.modal-file-input), select, textarea") || actionDialog.body.querySelector(".modal-dropzone") || actionDialog.close).focus());
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
       CURRENT DATE
    ========================== */

    const currentDate =
        document.getElementById("currentDate");

    if (currentDate) {

        const today = new Date();

        currentDate.textContent =
            today.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );
    }


    /* =========================
       SIDEBAR VISIBILITY
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
       SIDEBAR NAVIGATION
    ========================== */

    /* =========================
       GLOBAL SEARCH
    ========================== */

    const searchInput =
        document.getElementById("globalSearch");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const searchValue =
                    searchInput.value
                        .toLowerCase()
                        .trim();

                const rows =
                    document.querySelectorAll(
                        "#toursTable tbody tr"
                    );

                rows.forEach(row => {

                    const rowText =
                        row.innerText.toLowerCase();

                    if (
                        rowText.includes(searchValue)
                    ) {

                        row.style.display = "";

                    } else {

                        row.style.display = "none";

                    }

                });

            }
        );

    }


    /* =========================
       NOTIFICATIONS
    ========================== */

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                showToast("You have 2 new notifications.", "info");

            }
        );

    }

/* =========================
   QUICK ACTIONS
========================== */

const quickActions =
    document.querySelectorAll(
        ".quick-action"
    );

quickActions.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const action = button.dataset.action;
            if (action === "View Bookings") { window.location.href = "bookings.html"; return; }
            if (action === "View Reviews") { window.location.href = "reviews.html"; return; }

            if (action === "Add Customer") {
                openModal({
                    title: "Add Customer",
                    subtitle: "Enter the customer details.",
                    fields: [
                        { name: "name", label: "Full name", required: true },
                        { name: "email", label: "Email address", type: "email", required: true },
                        { name: "phone", label: "Phone number", type: "tel", required: true }
                    ],
                    confirmLabel: "Add Customer",
                    onConfirm: () => showToast("Customer storage is not connected in this prototype.", "info")
                });
                return;
            }

            if (action === "Assign Tour Guide") {
                const tourOptions = [...document.querySelectorAll("#toursTable tbody tr")].map(row => {
                    const cells = row.querySelectorAll("td");
                    const reference = row.querySelector("strong")?.textContent.trim() || "";
                    return { value: reference, label: `${reference} - ${cells[1]?.textContent.trim() || "Tour"}` };
                });
                const guideName = document.querySelector(".admin-mini strong")?.textContent.trim() || "Staff member";
                openModal({
                    title: "Assign Tour Guide",
                    subtitle: "Choose a tour and guide.",
                    fields: [
                        { name: "tour", label: "Tour", type: "select", options: [{ value: "", label: "Select a tour" }, ...tourOptions], required: true },
                        { name: "guide", label: "Tour guide", type: "select", options: [{ value: guideName, label: guideName }], required: true }
                    ],
                    confirmLabel: "Assign Guide",
                    onConfirm: () => showToast("Guide assignment is not connected to a booking service.", "info")
                });
                return;
            }

            if (action === "Upload Photos") {
                openModal({
                    title: "Upload Photos",
                    subtitle: "Choose one or more tour images.",
                    fields: [{ name: "photos", label: "Photos", type: "files", accept: "image/*", multiple: true, required: true }],
                    confirmLabel: "Upload Photos",
                    onConfirm: values => showToast(`${values.photos.length} photo${values.photos.length === 1 ? "" : "s"} selected. Upload storage is not connected.`, "info")
                });
                return;
            }

            openModal({
                title: "Check Messages",
                subtitle: "Compose a message to a staff member.",
                fields: [
                    { name: "recipient", label: "Recipient", required: true },
                    { name: "message", label: "Message", type: "textarea", required: true }
                ],
                confirmLabel: "Send Message",
                onConfirm: () => showToast("Messaging is not connected in this prototype.", "info")
            });

        }
    );

});
    /* =========================
       VIEW TOUR DETAILS
    ========================== */

    const editButtons =
        document.querySelectorAll(
            ".edit-button"
        );

    editButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tourName =
                    button
                        .closest(".package-row")
                        .querySelector(
                            ".package-info strong"
                        )
                        .textContent
                        .trim();

                openModal({
                    title: "Tour Details",
                    subtitle: "Assigned tour",
                    message: tourName,
                    cancelLabel: null,
                    confirmLabel: "Close"
                });

            }
        );

    });


    /* =========================
       LOGOUT
    ========================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                openConfirm({
                    title: "Log Out",
                    message: "Are you sure you want to log out?",
                    confirmLabel: "Log Out",
                    onConfirm: () => {
                        showToast("Logging out...", "info");
                    // Later:
                    // window.location.href =
                    // "login.html";
                    }
                });

            }
        );

    }


    /* =========================
       STAFF PROFILE
    ========================== */

    const adminProfile =
        document.querySelector(
            ".admin-profile"
        );

    if (adminProfile) {

        adminProfile.addEventListener(
            "click",
            () => {

                openModal({ title: "Staff Profile", subtitle: "Signed in as staff", message: "Jonas Reyes", cancelLabel: null, confirmLabel: "Close" });

            }
        );

    }

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