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
       ELEMENTS
    ========================== */

    const list =
        document.getElementById("reviewsList");

    const cards =
        Array.from(document.querySelectorAll(".review-card"));

    const emptyState =
        document.getElementById("emptyState");

    const filterTabs =
        document.querySelectorAll(".filter-tab");

    const searchInput =
        document.getElementById("globalSearch");

    const sortSelect =
        document.getElementById("sortSelect");

    const exportButton =
        document.getElementById("exportReviewsButton");


    /* =========================
       FILTER + SEARCH + SORT
    ========================== */

    let currentFilter = "all";
    let currentSort = "newest";

    function applyFilters() {

        const keyword =
            (searchInput?.value || "")
                .toLowerCase()
                .trim();

        let visibleCount = 0;

        cards.forEach(card => {

            if (!card.parentNode) return;

            const rating = card.dataset.rating;
            const replied = card.dataset.replied === "true";
            const text = card.innerText.toLowerCase();

            let matchesFilter = true;

            if (currentFilter === "unreplied") {
                matchesFilter = !replied;
            } else if (currentFilter !== "all") {
                matchesFilter = rating === currentFilter;
            }

            const matchesSearch =
                !keyword || text.includes(keyword);

            if (matchesFilter && matchesSearch) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }

        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }

    }


    function applySort() {

        const sorted = [...cards].sort((a, b) => {

            const ratingA = Number(a.dataset.rating);
            const ratingB = Number(b.dataset.rating);

            const dateA = new Date(a.dataset.created);
            const dateB = new Date(b.dataset.created);

            switch (currentSort) {

                case "oldest":
                    return dateA - dateB;

                case "highest":
                    return ratingB - ratingA;

                case "lowest":
                    return ratingA - ratingB;

                case "newest":
                default:
                    return dateB - dateA;

            }

        });

        sorted.forEach(card => list.appendChild(card));

    }


    filterTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            filterTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            currentFilter = tab.dataset.filter;
            applyFilters();

        });

    });


    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }


    if (sortSelect) {
        sortSelect.addEventListener("change", () => {

            currentSort = sortSelect.value;
            applySort();

        });
    }


    /* =========================
       REPLY
    ========================== */

    document.querySelectorAll(".reply-button").forEach(button => {

        button.addEventListener("click", () => {

            const card =
                button.closest(".review-card");

            const name =
                card.querySelector(".customer-cell strong")
                    .textContent
                    .trim();

            const reply =
                prompt("Write your reply to " + name + ":");

            if (reply && reply.trim()) {

                // Remove existing reply if any
                const existing =
                    card.querySelector(".review-reply");
                if (existing) existing.remove();

                const replyBlock =
                    document.createElement("div");
                replyBlock.className = "review-reply";
                replyBlock.innerHTML = `
                    <div class="reply-label">
                        <i data-lucide="corner-down-right" aria-hidden="true"></i>
                        Admin replied
                    </div>
                    <p></p>
                `;

                replyBlock.querySelector("p").textContent = reply;

                card.appendChild(replyBlock);

                // Update replied flag
                card.dataset.replied = "true";

                // Re-render lucide icons in the new block
                if (window.lucide) {
                    window.lucide.createIcons();
                }

                applyFilters();

            }

        });

    });


    /* =========================
       DELETE REVIEW
    ========================== */

    document.querySelectorAll(".delete-button").forEach(button => {

        button.addEventListener("click", () => {

            const card =
                button.closest(".review-card");

            const name =
                card.querySelector(".customer-cell strong")
                    .textContent
                    .trim();

            openConfirm({
                title: "Delete Review",
                message: `Delete this review from ${name}? This action cannot be undone.`,
                confirmLabel: "Delete Review",
                onConfirm: () => {
                card.remove();

                const index = cards.indexOf(card);
                if (index > -1) cards.splice(index, 1);

                applyFilters();
                showToast("Review deleted.", "success");
                }
            });

        });

    });


    /* =========================
       EXPORT
    ========================== */

    if (exportButton) {

        exportButton.addEventListener("click", () => {

            showToast("Review export is not connected yet.", "info");

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
       INIT
    ========================== */

    applySort();
    applyFilters();

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