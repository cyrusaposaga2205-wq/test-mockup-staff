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
       PERIOD SELECTOR
    ========================== */

    const periodTabs =
        document.querySelectorAll(".period-tab");

    const periodData = {

        "7d": {
            revenue: "₱482,340",
            bookings: "248",
            guests: "892",
            bars: [42, 68, 55, 80, 92, 76, 60],
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        },

        "30d": {
            revenue: "₱1,924,500",
            bookings: "1,024",
            guests: "3,580",
            bars: [65, 72, 60, 78, 85, 90, 70, 82, 74, 88],
            labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10"]
        },

        "90d": {
            revenue: "₱5,782,300",
            bookings: "3,012",
            guests: "10,240",
            bars: [58, 65, 72, 80, 88, 75, 82, 90, 85, 78, 92, 88],
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },

        "1y": {
            revenue: "₱22,458,900",
            bookings: "12,480",
            guests: "41,320",
            bars: [55, 62, 70, 78, 84, 82, 88, 92, 86, 90, 94, 98],
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        }

    };


    function renderChart(period) {

        const data = periodData[period];

        if (!data) return;

        const chart =
            document.getElementById("revenueChart");

        if (!chart) return;

        chart.replaceChildren();
        data.bars.forEach((value, index) => {
            const column = document.createElement("div");
            column.className = "chart-col";
            const bar = document.createElement("div");
            bar.className = "chart-bar";
            bar.style.height = `${value}%`;
            const label = document.createElement("span");
            label.textContent = data.labels[index] || "";
            column.append(bar, label);
            chart.append(column);
        });
    }

    function updateKPIs(period) {
        const data = periodData[period];
        if (!data) return;
        const values = document.querySelectorAll(".kpi-value");
        if (values[0]) values[0].textContent = data.revenue;
        if (values[1]) values[1].textContent = data.bookings;
        if (values[2]) values[2].textContent = data.guests;
    }


    periodTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            periodTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const period = tab.dataset.period;

            renderChart(period);
            updateKPIs(period);

        });

    });


    /* =========================
       SEARCH (highlights matching transactions)
    ========================== */

    const searchInput =
        document.getElementById("globalSearch");

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            const keyword =
                searchInput.value.toLowerCase().trim();

            const rows =
                document.querySelectorAll(
                    "#transactionsTable tbody tr"
                );

            rows.forEach(row => {

                const text =
                    row.innerText.toLowerCase();

                row.style.display =
                    text.includes(keyword) ? "" : "none";

            });

        });

    }


    /* =========================
       EXPORT
    ========================== */

    const exportButton =
        document.getElementById("exportReportButton");

    if (exportButton) {

        exportButton.addEventListener("click", () => {

            showToast("Report export is not connected yet.", "info");

        });

    }


    /* =========================
       CHART BAR CLICK
    ========================== */

    document.addEventListener("click", (event) => {

        const bar = event.target.closest(".chart-bar");

        if (bar) {

            openModal({
                title: "Revenue Detail",
                subtitle: "Selected chart value",
                message: `Revenue: ${bar.style.height} of peak`,
                cancelLabel: null,
                confirmLabel: "Close"
            });

        }

    });


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

    renderChart("7d");

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