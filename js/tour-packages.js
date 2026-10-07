document.addEventListener("DOMContentLoaded", () => {

    if (window.lucide) {
        window.lucide.createIcons();
    }

    /* =========================
       ACTION DIALOG & MODALS
    ========================== */

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

        const controls = new Map();
        (options.fields || []).forEach((field, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = "modal-field";
            const label = document.createElement("label");
            const id = `actionModalField${index}`;
            label.htmlFor = id;
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

            control.id = id;
            control.name = field.name || id;
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

        dialogOnConfirm = () => options.onConfirm?.(Object.fromEntries([...controls].map(([name, ctrl]) => [name, ctrl.value])));

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
        const invalid = [...actionDialog.body.querySelectorAll("input, select, textarea")].find(control => !control.checkValidity());
        if (invalid) {
            invalid.reportValidity();
            return;
        }
        closeModal(true);
    });

    actionDialog.backdrop?.addEventListener("click", event => {
        if (event.target === actionDialog.backdrop) closeModal();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (!actionDialog.backdrop?.hidden) closeModal();
            else if (document.getElementById("packageModal")?.classList.contains("show")) document.getElementById("cancelModal")?.click();
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

    /* =========================
       SIDEBAR & DOM ELEMENTS
    ========================== */

    const sidebarToggle = document.getElementById("mobileMenu");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            const isHidden = document.body.classList.toggle("sidebar-hidden");
            const action = isHidden ? "Show" : "Hide";
            sidebarToggle.setAttribute("aria-expanded", String(!isHidden));
            sidebarToggle.setAttribute("aria-label", `${action} sidebar`);
            sidebarToggle.title = `${action} sidebar`;
        });
    }

    const modal = document.getElementById("packageModal");
    const openPackageModalButton = document.getElementById("openAddModal");
    const closePackageModalButton = document.getElementById("closeModal");
    const cancelPackageModalButton = document.getElementById("cancelModal");
    const form = document.getElementById("packageForm");
    const searchInput = document.getElementById("globalSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const packageGrid = document.getElementById("packageGrid");
    const packageCount = document.getElementById("packageCount");
    const emptyState = document.getElementById("emptyState");
    const packageImageInput = document.getElementById("packageImage");
    const notificationButton = document.getElementById("notificationButton");
    const logoutButton = document.getElementById("logoutButton");

    function showImageFallback(image) {
        if (!image) return;
        const imageArea = image.closest(".package-image");
        image.style.display = "none";

        if (imageArea && !imageArea.querySelector(".image-fallback")) {
            const fallback = document.createElement("div");
            fallback.className = "image-fallback";
            fallback.textContent = "Image unavailable";
            imageArea.appendChild(fallback);
        }
    }

    function handleImageError(event) {
        if (event.target instanceof HTMLImageElement) {
            showImageFallback(event.target);
        }
    }

    document.addEventListener("error", handleImageError, true);

    document.querySelectorAll(".sidebar-logo img, .package-image img").forEach(image => {
        if (image.complete && image.naturalWidth === 0) {
            showImageFallback(image);
        }
    });

    /* =========================
       ADD PACKAGE MODAL TOGGLES
    ========================== */

    openPackageModalButton?.addEventListener("click", () => {
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        modal.classList.add("show");
        modal.querySelector("input, select, textarea")?.focus();
    });

    function closePackageModal() {
        modal.classList.remove("show");
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        form.reset();
        openPackageModalButton.focus();
    }

    closePackageModalButton?.addEventListener("click", closePackageModal);
    cancelPackageModalButton?.addEventListener("click", closePackageModal);

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closePackageModal();
        }
    });

    /* =========================
       SEARCH + FILTER
    ========================== */

    function filterPackages() {
        const search = searchInput.value.toLowerCase().trim();
        const category = categoryFilter.value;
        const status = statusFilter.value;
        const cards = document.querySelectorAll(".package-card");
        let visibleCount = 0;

        cards.forEach(card => {
            const name = (card.dataset.name || "").toLowerCase();
            const cardCategory = card.dataset.category;
            const cardStatus = card.dataset.status;

            const matchesSearch = name.includes(search);
            const matchesCategory = category === "all" || cardCategory === category;
            const matchesStatus = status === "all" || cardStatus === status;

            if (matchesSearch && matchesCategory && matchesStatus) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        packageCount.textContent = visibleCount;
        emptyState.style.display = visibleCount === 0 ? "block" : "none";
    }

    searchInput?.addEventListener("input", filterPackages);
    categoryFilter?.addEventListener("change", filterPackages);
    statusFilter?.addEventListener("change", filterPackages);

    /* =========================
       DELEGATED EVENT LISTENERS
    ========================== */

    document.addEventListener("click", event => {

        // 1. Menu Ellipsis Toggle
        const menuButton = event.target.closest(".image-menu");
        if (menuButton) {
            event.stopPropagation();
            const menu = menuButton.nextElementSibling;
            document.querySelectorAll(".card-menu").forEach(item => {
                if (item !== menu) item.classList.remove("show");
            });
            menu?.classList.toggle("show");
            return;
        }

        // Close menus on outside click
        if (!event.target.closest(".card-menu")) {
            document.querySelectorAll(".card-menu").forEach(menu => menu.classList.remove("show"));
        }

        // 2. Edit Package Button
        const editButton = event.target.closest(".edit-btn");
        if (editButton) {
            event.preventDefault();
            event.stopPropagation();

            const card = editButton.closest(".package-card");
            if (!card) return;

            editButton.closest(".card-menu")?.classList.remove("show");

            const packageName = card.dataset.name;
            const nameField = card.querySelector(".package-body h2");
            const descriptionField = card.querySelector(".package-body p");
            const priceField = card.querySelector(".package-footer strong");

            openModal({
                title: "Edit Tour Package",
                subtitle: "Update the package details.",
                fields: [
                    { name: "name", label: "Package name", value: packageName, required: true },
                    { name: "description", label: "Description", type: "textarea", value: descriptionField?.textContent?.trim() || "", required: true },
                    { name: "price", label: "Price per person", type: "number", value: priceField?.textContent.replace(/[^0-9.]/g, "") || "", required: true }
                ],
                confirmLabel: "Save Changes",
                onConfirm: values => {
                    const name = values.name.trim();
                    card.dataset.name = name;
                    if (nameField) nameField.textContent = name;
                    if (descriptionField) descriptionField.textContent = values.description;
                    if (priceField) priceField.textContent = `₱${Number(values.price).toLocaleString()}`;
                    filterPackages();
                    showToast("Tour package updated.", "success");
                }
            });
            return;
        }

        // 3. Delete Package Button
        const deleteButton = event.target.closest(".delete-btn");
        if (deleteButton) {
            event.preventDefault();
            event.stopPropagation();

            const card = deleteButton.closest(".package-card");
            if (!card) return;

            const packageName = card.dataset.name;
            openConfirm({
                title: "Delete Tour Package",
                message: `Are you sure you want to delete "${packageName}"? This action cannot be undone.`,
                confirmLabel: "Delete Package",
                onConfirm: () => {
                    const image = card.querySelector("img");
                    if (image?.src.startsWith("blob:")) {
                        URL.revokeObjectURL(image.src);
                    }
                    card.remove();
                    filterPackages();
                    showToast("Tour package deleted successfully.", "success");
                }
            });
            return;
        }

        // 4. View Details Button
        const viewButton = event.target.closest(".view-btn");
        if (viewButton) {
            event.preventDefault();
            event.stopPropagation();

            const card = viewButton.closest(".package-card");
            if (!card) return;

            const packageName = card.dataset.name;
            openModal({
                title: packageName,
                subtitle: "Tour package details",
                message: card.querySelector(".package-body p")?.textContent?.trim() || "No description available.",
                cancelLabel: null,
                confirmLabel: "Close"
            });
            return;
        }
    });

    /* =========================
       CREATE / ADD PACKAGE
    ========================== */

    function createIcon(name) {
        const icon = document.createElement("i");
        icon.dataset.lucide = name;
        icon.setAttribute("aria-hidden", "true");
        return icon;
    }

    function createTextElement(tagName, className, text) {
        const element = document.createElement(tagName);
        element.className = className;
        element.textContent = text;
        return element;
    }

    function createPackageCard({ name, category, status, price, pax, duration, description, imageFile }) {
        const card = document.createElement("article");
        card.className = "package-card";
        card.dataset.category = category;
        card.dataset.status = status;
        card.dataset.name = name;

        const imageArea = document.createElement("div");
        imageArea.className = "package-image";

        if (imageFile) {
            const image = document.createElement("img");
            image.src = URL.createObjectURL(imageFile);
            image.alt = name;
            imageArea.append(image);
        } else {
            imageArea.append(createTextElement("div", "image-fallback", "Image unavailable"));
        }

        imageArea.append(
            createTextElement("span", `status ${status}`, status === "active" ? "Active" : "Inactive")
        );

        const menuButton = createTextElement("button", "image-menu", "");
        menuButton.type = "button";
        menuButton.setAttribute("aria-label", `Actions for ${name}`);
        menuButton.append(createIcon("ellipsis"));

        const menu = document.createElement("div");
        menu.className = "card-menu";

        const editBtn = createTextElement("button", "edit-btn", "Edit");
        editBtn.type = "button";
        editBtn.prepend(createIcon("pencil"));

        const deleteBtn = createTextElement("button", "delete-btn", "Delete");
        deleteBtn.type = "button";
        deleteBtn.prepend(createIcon("trash-2"));

        menu.append(editBtn, deleteBtn);
        imageArea.append(menuButton, menu);

        const body = document.createElement("div");
        body.className = "package-body";
        body.append(
            createTextElement("div", "package-category", category.toUpperCase()),
            createTextElement("h2", "", name),
            createTextElement("p", "", description)
        );

        const info = document.createElement("div");
        info.className = "package-info";

        const durationItem = createTextElement("span", "", duration);
        durationItem.prepend(createIcon("clock-3"));

        const capacityItem = createTextElement("span", "", `Up to ${pax} pax`);
        capacityItem.prepend(createIcon("users"));
        info.append(durationItem, capacityItem);

        const footer = document.createElement("div");
        footer.className = "package-footer";

        const priceBlock = document.createElement("div");
        priceBlock.append(
            createTextElement("small", "", "Starting at "),
            createTextElement("strong", "", `₱${Number(price).toLocaleString()}`),
            createTextElement("small", "", " / person")
        );

        const viewBtn = createTextElement("button", "view-btn", "View Details");
        viewBtn.type = "button";

        footer.append(priceBlock, viewBtn);
        body.append(info, footer);
        card.append(imageArea, body);

        return card;
    }

    form?.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("packageName").value.trim();
        const category = document.getElementById("packageCategory").value;
        const status = document.getElementById("packageStatus").value;
        const price = document.getElementById("packagePrice").value;
        const pax = document.getElementById("packagePax").value;
        const duration = document.getElementById("packageDuration").value;
        const description = document.getElementById("packageDescription").value;
        const imageFile = packageImageInput.files[0];

        const card = createPackageCard({
            name,
            category,
            status,
            price,
            pax,
            duration,
            description,
            imageFile
        });

        packageGrid.prepend(card);
        window.lucide?.createIcons();

        closePackageModal();
        filterPackages();
        showToast("Tour package added successfully.", "success");
    });

    /* =========================
       NOTIFICATION & LOGOUT
    ========================== */

    notificationButton?.addEventListener("click", () => {
        showToast("You have 2 new notifications.", "info");
    });

    logoutButton?.addEventListener("click", () => {
        openConfirm({
            title: "Log Out",
            message: "Are you sure you want to log out?",
            confirmLabel: "Log Out",
            onConfirm: () => showToast("You have been logged out.", "info")
        });
    });

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