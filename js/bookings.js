document.addEventListener("DOMContentLoaded", () => {

    if (window.lucide) {
        window.lucide.createIcons();
    }

    const actionDialog = {
        backdrop: document.getElementById("actionModalBackdrop"),
        title: document.getElementById("actionModalTitle"),
        subtitle: document.getElementById("actionModalSubtitle"),
        body: document.getElementById("actionModalBody"),
        close: document.getElementById("actionModalClose"),
        cancel: document.getElementById("actionModalCancel"),
        confirm: document.getElementById("actionModalConfirm")
    };
    let dialogOnConfirm = null;
    let dialogReturnFocus = null;

    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const iconNames = {
            info: "info",
            success: "circle-check",
            error: "circle-x",
            warning: "triangle-alert"
        };
        const toast = document.createElement("div");
        toast.className = `toast ${iconNames[type] ? type : "info"}`;
        toast.setAttribute("role", "status");
        const icon = document.createElement("i");
        icon.dataset.lucide = iconNames[type] || iconNames.info;
        icon.setAttribute("aria-hidden", "true");
        const text = document.createElement("span");
        text.textContent = message;
        toast.append(icon, text);
        container.append(toast);
        window.lucide?.createIcons();
        requestAnimationFrame(() => toast.classList.add("show"));
        window.setTimeout(() => {
            toast.classList.remove("show");
            window.setTimeout(() => toast.remove(), 300);
        }, 3000);
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

        if (options.message) {
            const message = document.createElement("p");
            message.className = "modal-message";
            message.textContent = options.message;
            actionDialog.body.append(message);
        }

        const fields = options.fields || [];
        const controls = new Map();
        fields.forEach((field, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = "modal-field";
            const label = document.createElement("label");
            const fieldId = `actionModalField${index}`;
            label.htmlFor = fieldId;
            label.textContent = field.label;
            let control;
            if (field.type === "textarea") {
                control = document.createElement("textarea");
            } else if (field.type === "select") {
                control = document.createElement("select");
                (field.options || []).forEach(item => {
                    const option = document.createElement("option");
                    option.value = typeof item === "string" ? item : item.value;
                    option.textContent = typeof item === "string" ? item : item.label;
                    control.append(option);
                });
            } else {
                control = document.createElement("input");
                control.type = field.type || "text";
            }
            control.id = fieldId;
            control.name = field.name || fieldId;
            control.value = field.value ?? "";
            control.required = Boolean(field.required);
            control.readOnly = Boolean(field.readOnly);
            if (field.placeholder) control.placeholder = field.placeholder;
            controls.set(control.name, control);
            wrapper.append(label, control);
            actionDialog.body.append(wrapper);
        });

        actionDialog.cancel.textContent = options.cancelLabel || "Cancel";
        actionDialog.cancel.hidden = options.cancelLabel === null;
        actionDialog.confirm.textContent = options.confirmLabel || "Continue";
        actionDialog.confirm.hidden = options.confirmLabel === null;
        actionDialog.confirm.className = options.confirmClass || "primary-button";
        dialogOnConfirm = () => options.onConfirm?.(
            Object.fromEntries([...controls].map(([name, control]) => [name, control.value]))
        );
        actionDialog.backdrop.hidden = false;
        actionDialog.backdrop.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        requestAnimationFrame(() => (actionDialog.body.querySelector("input, select, textarea") || actionDialog.close).focus());
    }

    function openConfirm(options = {}) {
        openModal({
            ...options,
            cancelLabel: options.cancelLabel || "No",
            confirmLabel: options.confirmLabel || "Yes, Continue",
            confirmClass: options.confirmClass || "danger-button"
        });
    }

    actionDialog.close?.addEventListener("click", () => closeModal());
    actionDialog.cancel?.addEventListener("click", () => closeModal());
    actionDialog.confirm?.addEventListener("click", () => {
        const invalidControl = [...actionDialog.body.querySelectorAll("input, select, textarea")].find(control => !control.checkValidity());
        if (invalidControl) { invalidControl.reportValidity(); return; }
        closeModal(true);
    });
    actionDialog.backdrop?.addEventListener("click", event => {
        if (event.target === actionDialog.backdrop) closeModal();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (!document.getElementById("editBookingBackdrop")?.hidden) closeBookingModal(document.getElementById("editBookingBackdrop"));
            else if (!document.getElementById("bookingDetailsBackdrop")?.hidden) closeBookingModal(document.getElementById("bookingDetailsBackdrop"));
            else if (!actionDialog.backdrop?.hidden) closeModal();
            else if (document.getElementById("packageModal")?.classList.contains("show")) {
                document.getElementById("cancelModal")?.click();
            }
        }
        const target = event.target;
        if (event.key === "/" && actionDialog.backdrop?.hidden && !target?.matches?.("input, textarea, select, [contenteditable='true']")) {
            const search = document.getElementById("globalSearch");
            if (search) {
                event.preventDefault();
                search.focus();
            }
        }
    });

    const bookingDetailsBackdrop = document.getElementById("bookingDetailsBackdrop");
    const editBookingBackdrop = document.getElementById("editBookingBackdrop");
    const editBookingForm = document.getElementById("editBookingForm");
    const detailSaveButton = document.getElementById("saveBookingDetails");
    let activeBookingRow = null;
    let bookingModalReturnFocus = null;
    const guideNames = ["Patrick Reyes", "Sofia Lim", "Carlos Flores", "Unassigned"];
    const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"];

    function bookingDateDisplay(value) {
        if (!value) return "Not set";
        const date = new Date(`${value}T12:00:00`);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }

    function bookingDateTimeDisplay(value) {
        if (!value) return "Not recorded";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    }

    function getBookingData(row) {
        const cells = row?.cells || [];
        const amount = Number(row?.dataset.amount || cells[5]?.textContent.replace(/[^0-9.]/g, "") || 0);
        return {
            id: row?.dataset.id || cells[0]?.querySelector("strong")?.textContent.trim() || "",
            customer: row?.dataset.customer || cells[1]?.textContent.trim() || "",
            email: row?.dataset.email || "",
            phone: row?.dataset.phone || "",
            location: row?.dataset.location || "",
            emergencyName: row?.dataset.emergencyName || "",
            emergencyPhone: row?.dataset.emergencyPhone || "",
            package: row?.dataset.package || cells[2]?.textContent.trim() || "",
            tourDate: row?.dataset.tourDate || "",
            duration: row?.dataset.duration || "",
            pax: row?.dataset.pax || cells[4]?.textContent.trim() || "",
            tourTime: row?.dataset.tourTime || "",
            meetingPoint: row?.dataset.meetingPoint || "",
            guide: row?.dataset.guide || "Unassigned",
            status: row?.dataset.status || "pending",
            amount,
            paid: Number(row?.dataset.paid || 0),
            paymentMethod: row?.dataset.paymentMethod || "Cash",
            notes: row?.dataset.notes || "",
            created: row?.dataset.created || ""
        };
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value || "Not provided";
    }

    function updatePaymentStatus(row) {
        const amount = Number(row.dataset.amount || 0);
        const paid = Number(row.dataset.paid || 0);
        row.dataset.paymentStatus = paid <= 0 ? "Unpaid" : paid >= amount ? "Paid" : "Partial";
    }

    function updateRowStatus(row, status) {
        if (!bookingStatuses.includes(status)) return;
        row.dataset.status = status;
        const statusBadge = row.cells[6]?.querySelector(".status");
        if (statusBadge) {
            statusBadge.className = `status ${status}`;
            statusBadge.textContent = status[0].toUpperCase() + status.slice(1);
        }
    }

    function renderBookingTimeline(row) {
        const status = row.dataset.status;
        const paid = Number(row.dataset.paid || 0);
        const guide = row.dataset.guide || "Unassigned";
        const tourDate = row.dataset.tourDate;
        const completed = status === "completed";
        const tourHasPassed = tourDate && new Date(`${tourDate}T12:00:00`) < new Date();
        const paymentReceived = row.dataset.paymentReceived;
        const guideAssigned = row.dataset.guideAssigned;
        const completedAt = row.dataset.completed;
        const steps = [
            { key: "created", done: true, text: bookingDateTimeDisplay(row.dataset.created) },
            { key: "payment", done: paid > 0, text: paid > 0 ? `${formatCurrency(paid)} · ${bookingDateTimeDisplay(paymentReceived)}` : "Awaiting payment" },
            { key: "guide", done: guide !== "Unassigned", text: guide !== "Unassigned" ? `${guide} · ${bookingDateTimeDisplay(guideAssigned)}` : "Guide not assigned" },
            { key: "tour", done: completed || tourHasPassed, text: `${bookingDateDisplay(tourDate)} · ${row.dataset.tourTime || "Time not set"}` },
            { key: "completed", done: completed, text: completed ? bookingDateTimeDisplay(completedAt) : "Awaiting tour completion" }
        ];
        const currentIndex = completed || status === "cancelled" ? -1 : steps.findIndex(step => !step.done);
        steps.forEach((details, index) => {
            const item = bookingDetailsBackdrop.querySelector(`[data-timeline-step="${details.key}"]`);
            if (!item) return;
            item.dataset.state = details.done ? "done" : (index === currentIndex ? "current" : "pending");
            const target = item.querySelector("small");
            if (target) target.textContent = details.text;
        });
    }

    function formatCurrency(value) {
        return `₱${Number(value || 0).toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
    }

    function updatePaymentView(row) {
        const data = getBookingData(row);
        const balance = Math.max(data.amount - data.paid, 0);
        const progress = data.amount > 0 ? Math.min(Math.round((data.paid / data.amount) * 100), 100) : 0;
        setText("detailAmount", formatCurrency(data.amount));
        setText("detailPaid", formatCurrency(data.paid));
        setText("detailBalance", formatCurrency(balance));
        setText("detailPaymentMethod", data.paymentMethod);
        setText("detailPaymentStatus", row.dataset.paymentStatus || "Unpaid");
        const balanceNode = document.getElementById("detailBalance");
        if (balanceNode) balanceNode.className = `amount-balance ${balance > 0 ? "due" : "clear"}`;
        const progressNode = document.getElementById("paymentProgress");
        if (progressNode) progressNode.setAttribute("aria-valuenow", String(progress));
        const progressFill = document.getElementById("paymentProgressFill");
        if (progressFill) progressFill.style.width = `${progress}%`;
        setText("paymentProgressText", `${progress}% paid`);
    }

    function populateBookingDetails(row) {
        const data = getBookingData(row);
        setText("detailBookingId", data.id);
        setText("detailPackageName", data.package);
        setText("detailCustomer", data.customer);
        setText("detailEmail", data.email);
        setText("detailPhone", data.phone);
        setText("detailLocation", data.location);
        setText("detailEmergency", `${data.emergencyName} · ${data.emergencyPhone}`);
        setText("detailPackage", data.package);
        setText("detailTourDate", bookingDateDisplay(data.tourDate));
        setText("detailDuration", data.duration);
        setText("detailPax", data.pax);
        setText("detailMeetingPoint", data.meetingPoint);
        const guideSelect = document.getElementById("detailGuide");
        if (guideSelect) {
            if (!guideNames.includes(data.guide)) {
                const option = document.createElement("option");
                option.textContent = data.guide;
                guideSelect.insertBefore(option, guideSelect.firstChild);
            }
            guideSelect.value = data.guide;
        }
        const notes = document.getElementById("detailNotes");
        if (notes) notes.value = data.notes;
        bookingDetailsBackdrop.querySelectorAll(".status-pill").forEach(pill => {
            const active = pill.dataset.status === data.status;
            pill.classList.toggle("active", active);
            pill.setAttribute("aria-pressed", String(active));
        });
        updatePaymentStatus(row);
        updatePaymentView(row);
        renderBookingTimeline(row);
        if (detailSaveButton) detailSaveButton.hidden = true;
    }

    function openBookingModal(modal, returnFocus = document.activeElement) {
        if (!modal) return;
        bookingModalReturnFocus = returnFocus;
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        window.lucide?.createIcons();
        modal.querySelector("button, input, select, textarea")?.focus();
    }

    function closeBookingModal(modal, restoreFocus = true) {
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        if (bookingDetailsBackdrop.hidden && editBookingBackdrop.hidden && actionDialog.backdrop?.hidden) {
            document.body.classList.remove("modal-open");
        }
        if (restoreFocus) bookingModalReturnFocus?.focus?.();
    }

    function showBookingDetails(row, trigger) {
        activeBookingRow = row;
        populateBookingDetails(row);
        openBookingModal(bookingDetailsBackdrop, trigger);
    }

    function fillEditBookingForm(row) {
        const data = getBookingData(row);
        const values = {
            editBookingId: data.id,
            editCustomer: data.customer,
            editEmail: data.email,
            editPhone: data.phone,
            editLocation: data.location,
            editPackage: data.package,
            editTourDate: data.tourDate,
            editPax: data.pax,
            editAmount: data.amount,
            editPaid: data.paid,
            editPaymentMethod: data.paymentMethod,
            editGuide: data.guide,
            editStatus: data.status,
            editNotes: data.notes
        };
        Object.entries(values).forEach(([id, value]) => {
            const control = document.getElementById(id);
            if (control) control.value = value;
        });
        if (!guideNames.includes(data.guide)) {
            const guideSelect = document.getElementById("editGuide");
            const option = document.createElement("option");
            option.textContent = data.guide;
            guideSelect?.insertBefore(option, guideSelect.firstChild);
        }
    }

    function updateBookingRow(row, values) {
        const amount = Number(values.amount);
        const paid = Number(values.paid);
        row.dataset.customer = values.customer.trim();
        row.dataset.email = values.email.trim();
        row.dataset.phone = values.phone.trim();
        row.dataset.location = values.location.trim();
        row.dataset.package = values.package.trim();
        row.dataset.tourDate = values.tourDate;
        row.dataset.pax = values.pax;
        row.dataset.amount = String(amount);
        row.dataset.paid = String(paid);
        row.dataset.paymentMethod = values.paymentMethod;
        row.dataset.guide = values.guide;
        row.dataset.notes = values.notes;
        updatePaymentStatus(row);
        updateRowStatus(row, values.status);
        if (row.cells[1]) row.cells[1].textContent = row.dataset.customer;
        if (row.cells[2]) row.cells[2].textContent = row.dataset.package;
        if (row.cells[3]) row.cells[3].textContent = bookingDateDisplay(row.dataset.tourDate);
        if (row.cells[4]) row.cells[4].textContent = row.dataset.pax;
        if (row.cells[5]) row.cells[5].textContent = formatCurrency(amount);
        updateStats();
        applyFilters();
    }

    document.querySelectorAll(".view-button").forEach(button => {
        button.type = "button";
        button.title = "View details";
        button.setAttribute("aria-label", "View booking details");
        button.addEventListener("click", () => showBookingDetails(button.closest("tr"), button));
    });

    document.getElementById("closeBookingDetails")?.addEventListener("click", () => closeBookingModal(bookingDetailsBackdrop));
    document.getElementById("closeBookingDetailsFooter")?.addEventListener("click", () => closeBookingModal(bookingDetailsBackdrop));
    bookingDetailsBackdrop?.addEventListener("click", event => {
        if (event.target === bookingDetailsBackdrop) closeBookingModal(bookingDetailsBackdrop);
    });

    bookingDetailsBackdrop?.querySelectorAll(".status-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            if (!activeBookingRow) return;
            updateRowStatus(activeBookingRow, pill.dataset.status);
            bookingDetailsBackdrop.querySelectorAll(".status-pill").forEach(statusPill => {
                const active = statusPill.dataset.status === activeBookingRow.dataset.status;
                statusPill.classList.toggle("active", active);
                statusPill.setAttribute("aria-pressed", String(active));
            });
            renderBookingTimeline(activeBookingRow);
            showToast(`Status updated to ${pill.textContent.trim()}.`, "success");
        });
    });

    [document.getElementById("detailGuide"), document.getElementById("detailNotes")].forEach(control => {
        control?.addEventListener("input", () => { if (detailSaveButton) detailSaveButton.hidden = false; });
        control?.addEventListener("change", () => { if (detailSaveButton) detailSaveButton.hidden = false; });
    });

    detailSaveButton?.addEventListener("click", () => {
        if (!activeBookingRow) return;
        activeBookingRow.dataset.guide = document.getElementById("detailGuide").value;
        activeBookingRow.dataset.notes = document.getElementById("detailNotes").value;
        renderBookingTimeline(activeBookingRow);
        detailSaveButton.hidden = true;
        showToast("Booking details saved.", "success");
    });

    document.getElementById("editBookingFromDetails")?.addEventListener("click", event => {
        if (!activeBookingRow) return;
        fillEditBookingForm(activeBookingRow);
        closeBookingModal(bookingDetailsBackdrop, false);
        openBookingModal(editBookingBackdrop, activeBookingRow.querySelector(".edit-button") || event.currentTarget);
    });

    document.querySelectorAll(".edit-button").forEach(button => {
        button.addEventListener("click", () => {
            activeBookingRow = button.closest("tr");
            fillEditBookingForm(activeBookingRow);
            openBookingModal(editBookingBackdrop, button);
        });
    });

    document.getElementById("closeEditBooking")?.addEventListener("click", () => closeBookingModal(editBookingBackdrop));
    document.getElementById("cancelEditBooking")?.addEventListener("click", () => closeBookingModal(editBookingBackdrop));
    editBookingBackdrop?.addEventListener("click", event => {
        if (event.target === editBookingBackdrop) closeBookingModal(editBookingBackdrop);
    });

    editBookingForm?.addEventListener("submit", event => {
        event.preventDefault();
        const controls = [...editBookingForm.querySelectorAll("input[required], select[required], textarea[required]")];
        const invalidControl = controls.find(control => !control.checkValidity());
        if (invalidControl) { invalidControl.reportValidity(); return; }
        const values = Object.fromEntries(new FormData(editBookingForm).entries());
        if (Number(values.paid) > Number(values.amount)) {
            showToast("Amount paid cannot exceed the total amount.", "error");
            document.getElementById("editPaid")?.focus();
            return;
        }
        const row = [...rows].find(item => item.dataset.id === values.id);
        if (!row) { showToast("This booking could not be found.", "error"); return; }
        updateBookingRow(row, values);
        closeBookingModal(editBookingBackdrop);
        showToast("Booking updated successfully", "success");
    });

    document.getElementById("printInvoice")?.addEventListener("click", () => window.print());
    document.getElementById("emailCustomer")?.addEventListener("click", () => {
        if (!activeBookingRow?.dataset.email) { showToast("No customer email is available.", "warning"); return; }
        window.location.href = `mailto:${encodeURIComponent(activeBookingRow.dataset.email)}?subject=${encodeURIComponent(`Booking ${activeBookingRow.dataset.id}`)}`;
    });
    document.getElementById("sendReminder")?.addEventListener("click", () => {
        if (!activeBookingRow) return;
        showToast(`Reminder prepared for ${activeBookingRow.dataset.customer}.`, "success");
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
        document.getElementById("bookingsTable");

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

    const addBookingButton =
        document.getElementById("addBookingButton");


    /* =========================
       MINI STATS
    ========================== */

    function updateStats() {

        const counts = {
            total: 0,
            pending: 0,
            confirmed: 0,
            completed: 0
        };

        rows.forEach(row => {

            if (!row.parentNode) return;

            counts.total++;

            const status = row.dataset.status;

            if (status in counts) {
                counts[status]++;
            }

        });

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set("statTotal", counts.total);
        set("statPending", counts.pending);
        set("statConfirmed", counts.confirmed);
        set("statCompleted", counts.completed);

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

            const amountA = Number(a.dataset.amount);
            const amountB = Number(b.dataset.amount);

            const dateA = new Date(a.dataset.created);
            const dateB = new Date(b.dataset.created);

            switch (currentSort) {

                case "oldest":
                    return dateA - dateB;

                case "amount-high":
                    return amountB - amountA;

                case "amount-low":
                    return amountA - amountB;

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

    document.querySelectorAll(".delete-button").forEach(button => {

        button.addEventListener("click", () => {

            const row =
                button.closest("tr");

            const id =
                row.querySelector("strong").textContent.trim();

            openConfirm({
                title: "Delete Booking",
                message: `Delete booking ${id}? This action cannot be undone.`,
                confirmLabel: "Delete Booking",
                onConfirm: () => {
                row.remove();

                // Remove from the rows array too
                const index = rows.indexOf(row);
                if (index > -1) rows.splice(index, 1);

                applyFilters();
                updateStats();
                showToast("Booking deleted.", "success");
                }
            });

        });

    });


    /* =========================
       ADD BOOKING
    ========================== */

    if (addBookingButton) {

        addBookingButton.addEventListener("click", () => {

            openModal({
                title: "New Booking",
                subtitle: "Enter the guest and trip details.",
                fields: [
                    { name: "guest", label: "Guest name", required: true },
                    { name: "tour", label: "Tour package", required: true },
                    { name: "date", label: "Travel date", type: "date", required: true }
                ],
                confirmLabel: "Create Booking",
                onConfirm: () => showToast("Booking details captured.", "success")
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

            openModal({
                title: "Staff Profile",
                subtitle: "Signed in as staff",
                message: "Jonas Reyes",
                cancelLabel: null,
                confirmLabel: "Close"
            });

        });

    }


    /* =========================
       INIT
    ========================== */

    updateStats();
    applySort();
    applyFilters();

});