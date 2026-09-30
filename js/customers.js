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
        const container = document.getElementById("toastContainer");
        if (!container) return;
        const icons = { info: "info", success: "circle-check", error: "circle-x", warning: "triangle-alert" };
        const toast = document.createElement("div");
        toast.className = `toast ${icons[type] ? type : "info"}`;
        toast.setAttribute("role", "status");
        const icon = document.createElement("i");
        icon.dataset.lucide = icons[type] || icons.info;
        icon.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.textContent = message;
        toast.append(icon, text);
        container.append(toast);
        window.lucide?.createIcons();
        requestAnimationFrame(() => toast.classList.add("show"));
        window.setTimeout(() => { toast.classList.remove("show"); window.setTimeout(() => toast.remove(), 300); }, 3000);
    }
    function closeModal(confirmed = false) {
        if (!actionDialog.backdrop || actionDialog.backdrop.hidden) return;
        actionDialog.backdrop.hidden = true;
        actionDialog.backdrop.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        const callback = dialogOnConfirm;
        const focusTarget = dialogReturnFocus;
        dialogOnConfirm = null;
        dialogReturnFocus = null;
        if (confirmed) callback?.();
        focusTarget?.focus?.();
    }
    function openModal(options = {}) {
        if (!actionDialog.backdrop) return;
        if (!actionDialog.backdrop.hidden) closeModal();
        dialogReturnFocus = document.activeElement;
        actionDialog.title.textContent = options.title || "Action";
        actionDialog.subtitle.textContent = options.subtitle || "";
        actionDialog.body.replaceChildren();
        if (options.message) { const message = document.createElement("p"); message.className = "modal-message"; message.textContent = options.message; actionDialog.body.append(message); }
        const controls = new Map();
        (options.fields || []).forEach((field, index) => {
            const wrapper = document.createElement("div"); wrapper.className = "modal-field";
            const label = document.createElement("label"); const id = `actionModalField${index}`; label.htmlFor = id; label.textContent = field.label;
            let control;
            if (field.type === "textarea") control = document.createElement("textarea");
            else if (field.type === "select") { control = document.createElement("select"); (field.options || []).forEach(item => { const option = document.createElement("option"); option.value = typeof item === "string" ? item : item.value; option.textContent = typeof item === "string" ? item : item.label; control.append(option); }); }
            else { control = document.createElement("input"); control.type = field.type || "text"; }
            control.id = id; control.name = field.name || id; control.value = field.value ?? ""; control.required = Boolean(field.required); control.readOnly = Boolean(field.readOnly); if (field.placeholder) control.placeholder = field.placeholder;
            controls.set(control.name, control); wrapper.append(label, control); actionDialog.body.append(wrapper);
        });
        actionDialog.cancel.textContent = options.cancelLabel || "Cancel"; actionDialog.cancel.hidden = options.cancelLabel === null;
        actionDialog.confirm.textContent = options.confirmLabel || "Continue"; actionDialog.confirm.hidden = options.confirmLabel === null; actionDialog.confirm.className = options.confirmClass || "primary-button";
        dialogOnConfirm = () => options.onConfirm?.(Object.fromEntries([...controls].map(([name, control]) => [name, control.value])));
        actionDialog.backdrop.hidden = false; actionDialog.backdrop.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
        requestAnimationFrame(() => (actionDialog.body.querySelector("input, select, textarea") || actionDialog.close).focus());
    }
    function openConfirm(options = {}) { openModal({ ...options, cancelLabel: options.cancelLabel || "No", confirmLabel: options.confirmLabel || "Yes, Continue", confirmClass: options.confirmClass || "danger-button" }); }
    actionDialog.close?.addEventListener("click", () => closeModal());
    actionDialog.cancel?.addEventListener("click", () => closeModal());
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

    const table =
        document.getElementById("customersTable");

    const tbody =
        table.querySelector("tbody");

    const rows =
        Array.from(tbody.querySelectorAll("tr"));

    const emptyState =
        document.getElementById("emptyState");

    const filterTabs =
        document.querySelectorAll(".filter-tab");

    const searchInput =
        document.getElementById("globalSearch");

    const sortSelect =
        document.getElementById("sortSelect");

    const addCustomerButton =
        document.getElementById("addCustomerButton");


    /* =========================
       MINI STATS
    ========================== */

    function updateStats() {

        const counts = {
            total: 0,
            new: 0,
            returning: 0,
            vip: 0
        };

        rows.forEach(row => {

            if (!row.parentNode) return;

            counts.total++;

            const status = row.dataset.status;

            if (status in counts) counts[status]++;

        });

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set("statTotal", counts.total);
        set("statNew", counts.new);
        set("statReturning", counts.returning);
        set("statTop", counts.vip);

    }


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

        rows.forEach(row => {

            if (!row.parentNode) return;

            const status = row.dataset.status;
            const text = row.innerText.toLowerCase();

            const matchesFilter =
                currentFilter === "all" ||
                status === currentFilter;

            const matchesSearch =
                !keyword || text.includes(keyword);

            if (matchesFilter && matchesSearch) {
                row.style.display = "";
                visibleCount++;
            } else {
                row.style.display = "none";
            }

        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }

    }


    function applySort() {

        const sorted = [...rows].sort((a, b) => {

            const nameA = (a.dataset.name || "").toLowerCase();
            const nameB = (b.dataset.name || "").toLowerCase();

            const bookingsA = Number(a.dataset.bookings);
            const bookingsB = Number(b.dataset.bookings);

            const dateA = new Date(a.dataset.created);
            const dateB = new Date(b.dataset.created);

            switch (currentSort) {

                case "oldest":
                    return dateA - dateB;

                case "name-asc":
                    return nameA.localeCompare(nameB);

                case "name-desc":
                    return nameB.localeCompare(nameA);

                case "bookings-high":
                    return bookingsB - bookingsA;

                case "newest":
                default:
                    return dateB - dateA;

            }

        });

        sorted.forEach(row => tbody.appendChild(row));

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
       ROW ACTIONS
    ========================== */

    document.querySelectorAll(".view-button").forEach(button => {

        button.addEventListener("click", () => {

            const row =
                button.closest("tr");

            const name =
                row.querySelector(".customer-cell strong")
                    .textContent
                    .trim();

            openModal({ title: "Customer Details", subtitle: "Customer record", message: name, cancelLabel: null, confirmLabel: "Close" });

        });

    });


    document.querySelectorAll(".edit-button").forEach(button => {

        button.addEventListener("click", () => {

            const row =
                button.closest("tr");

            const name =
                row.querySelector(".customer-cell strong")
                    .textContent
                    .trim();

            openModal({
                title: "Edit Customer",
                subtitle: "Customer details",
                message: `Update the customer record for ${name}.`,
                fields: [{ name: "name", label: "Customer name", value: name, required: true }],
                confirmLabel: "Save Changes",
                onConfirm: () => showToast("Customer changes are ready to save.", "success")
            });

        });

    });


    document.querySelectorAll(".delete-button").forEach(button => {

        button.addEventListener("click", () => {

            const row =
                button.closest("tr");

            const name =
                row.querySelector(".customer-cell strong")
                    .textContent
                    .trim();

            openConfirm({
                title: "Delete Customer",
                message: `Delete ${name}? This action cannot be undone.`,
                confirmLabel: "Delete Customer",
                onConfirm: () => {
                row.remove();

                const index = rows.indexOf(row);
                if (index > -1) rows.splice(index, 1);

                applyFilters();
                updateStats();
                showToast("Customer deleted.", "success");
                }
            });

        });

    });


    /* =========================
       ADD CUSTOMER
    ========================== */

    if (addCustomerButton) {

        addCustomerButton.addEventListener("click", () => {

            openModal({
                title: "Add Customer",
                subtitle: "Enter the customer details.",
                fields: [
                    { name: "name", label: "Full name", required: true },
                    { name: "email", label: "Email address", type: "email", required: true },
                    { name: "phone", label: "Phone number", type: "tel", required: true }
                ],
                confirmLabel: "Add Customer",
                onConfirm: () => showToast("Customer details captured.", "success")
            });

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

    updateStats();
    applySort();
    applyFilters();

});