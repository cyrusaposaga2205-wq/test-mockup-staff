
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

    const modal =
        document.getElementById("packageModal");

    const openPackageModalButton =
        document.getElementById("openAddModal");

    const closePackageModalButton =
        document.getElementById("closeModal");

    const cancelPackageModalButton =
        document.getElementById("cancelModal");

    const form =
        document.getElementById("packageForm");

    const searchInput =
        document.getElementById("globalSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    const packageGrid =
        document.getElementById("packageGrid");

    const packageCount =
        document.getElementById("packageCount");

    const emptyState =
        document.getElementById("emptyState");

    const packageImageInput =
        document.getElementById("packageImage");

    const notificationButton =
        document.getElementById("notificationButton");

    const logoutButton =
        document.getElementById("logoutButton");

    function showImageFallback(image) {
        image.hidden = true;

        if (image.closest(".sidebar-logo")) return;

        const imageArea = image.closest(".package-image");
        if (!imageArea || imageArea.querySelector(".image-fallback")) return;

        const fallback = document.createElement("span");
        fallback.className = "image-fallback";
        fallback.textContent = "Image unavailable";
        imageArea.append(fallback);
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
       OPEN MODAL
    ========================== */

    openPackageModalButton.addEventListener("click", () => {
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        modal.classList.add("show");
        modal.querySelector("input, select, textarea")?.focus();
    });


    /* =========================
       CLOSE MODAL
    ========================== */

    function closePackageModal() {

        modal.classList.remove("show");
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        form.reset();
        openPackageModalButton.focus();

    }


    closePackageModalButton.addEventListener(
        "click",
        closePackageModal
    );


    cancelPackageModalButton.addEventListener(
        "click",
        closePackageModal
    );


    /* =========================
       CLICK OUTSIDE MODAL
    ========================== */

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            closePackageModal();

        }

    });


    /* =========================
       SEARCH + FILTER
    ========================== */

    function filterPackages() {

        const search =
            searchInput.value
                .toLowerCase()
                .trim();

        const category =
            categoryFilter.value;

        const status =
            statusFilter.value;

        const cards =
            document.querySelectorAll(
                ".package-card"
            );

        let visibleCount = 0;


        cards.forEach(card => {

            const name =
                card.dataset.name
                    .toLowerCase();

            const cardCategory =
                card.dataset.category;

            const cardStatus =
                card.dataset.status;


            const matchesSearch =
                name.includes(search);

            const matchesCategory =
                category === "all" ||
                cardCategory === category;

            const matchesStatus =
                status === "all" ||
                cardStatus === status;


            if (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            ) {

                card.style.display = "";

                visibleCount++;

            } else {

                card.style.display = "none";

            }

        });


        packageCount.textContent =
            visibleCount;


        if (visibleCount === 0) {

            emptyState.style.display = "block";

        } else {

            emptyState.style.display = "none";

        }

    }


    searchInput.addEventListener(
        "input",
        filterPackages
    );


    categoryFilter.addEventListener(
        "change",
        filterPackages
    );


    statusFilter.addEventListener(
        "change",
        filterPackages
    );


    /* =========================
       CARD MENU
    ========================== */

    document.addEventListener("click", event => {
        const menuButton = event.target.closest(".image-menu");

        if (menuButton) {
            event.stopPropagation();

            const menu = menuButton.nextElementSibling;

            document.querySelectorAll(".card-menu").forEach(item => {
                if (item !== menu) item.classList.remove("show");
            });

            menu.classList.toggle("show");
            return;
        }

        if (!event.target.closest(".card-menu")) {
            document.querySelectorAll(".card-menu").forEach(menu => {
                menu.classList.remove("show");
            });
        }
    });


    /* =========================
       DELETE PACKAGE
    ========================== */

    document.addEventListener(
        "click",
        event => {

            const deleteButton = event.target.closest(".delete-btn");

            if (deleteButton) {

                const card =
                    deleteButton.closest(
                        ".package-card"
                    );


                const packageName =
                    card.dataset.name;


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

            }

        }
    );


    /* =========================
       EDIT PACKAGE
    ========================== */

    document.addEventListener(
        "click",
        event => {

            const editButton = event.target.closest(".edit-btn");

            if (editButton) {

                const card =
                    editButton.closest(
                        ".package-card"
                    );


                const packageName =
                    card.dataset.name;


                const nameField = card.querySelector(".package-body h2");
                const descriptionField = card.querySelector(".package-body p");
                const priceField = card.querySelector(".package-footer strong");
                openModal({
                    title: "Edit Tour Package",
                    subtitle: "Update the package details.",
                    fields: [
                        { name: "name", label: "Package name", value: packageName, required: true },
                        { name: "description", label: "Description", type: "textarea", value: descriptionField?.textContent || "", required: true },
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

            }

        }
    );


    /* =========================
       VIEW DETAILS
    ========================== */

    document.addEventListener(
        "click",
        event => {

            const viewButton = event.target.closest(".view-btn");

            if (viewButton) {

                const card =
                    viewButton.closest(
                        ".package-card"
                    );


                const packageName =
                    card.dataset.name;


                openModal({
                    title: packageName,
                    subtitle: "Tour package details",
                    message: card.querySelector(".package-body p")?.textContent || "No description available.",
                    cancelLabel: null,
                    confirmLabel: "Close"
                });

            }

        }
    );


    /* =========================
       ADD PACKAGE
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

    function createPackageCard({
        name,
        category,
        status,
        price,
        pax,
        duration,
        description,
        imageFile
    }) {
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
            imageArea.append(createTextElement("span", "image-fallback", "No image provided"));
        }

        imageArea.append(
            createTextElement(
                "span",
                `status ${status}`,
                status === "active" ? "Active" : "Inactive"
            )
        );

        const menuButton = createTextElement("button", "image-menu", "");
        menuButton.type = "button";
        menuButton.setAttribute("aria-label", `Actions for ${name}`);
        menuButton.append(createIcon("ellipsis"));

        const menu = document.createElement("div");
        menu.className = "card-menu";

        const editButton = createTextElement("button", "edit-btn", "Edit");
        editButton.type = "button";
        editButton.prepend(createIcon("pencil"));

        const deleteButton = createTextElement("button", "delete-btn", "Delete");
        deleteButton.type = "button";
        deleteButton.prepend(createIcon("trash-2"));

        menu.append(editButton, deleteButton);
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
            createTextElement("small", "", "Starting at"),
            createTextElement("strong", "", `₱${Number(price).toLocaleString()}`),
            createTextElement("small", "", "/ person")
        );

        const viewButton = createTextElement("button", "view-btn", "View Details");
        viewButton.type = "button";

        footer.append(priceBlock, viewButton);
        body.append(info, footer);
        card.append(imageArea, body);

        return card;
    }

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "packageName"
                    )
                    .value
                    .trim();


            const category =
                document
                    .getElementById(
                        "packageCategory"
                    )
                    .value;


            const status =
                document
                    .getElementById(
                        "packageStatus"
                    )
                    .value;


            const price =
                document
                    .getElementById(
                        "packagePrice"
                    )
                    .value;


            const pax =
                document
                    .getElementById(
                        "packagePax"
                    )
                    .value;


            const duration =
                document
                    .getElementById(
                        "packageDuration"
                    )
                    .value;


            const description =
                document
                    .getElementById(
                        "packageDescription"
                    )
                    .value;

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

            if (window.lucide) {
                window.lucide.createIcons();
            }


            closePackageModal();

            filterPackages();


            showToast("Tour package added successfully.", "success");

        }
    );


    /* =========================
       LOGOUT
    ========================== */

    if (notificationButton) {
        notificationButton.addEventListener("click", () => {
            showToast("You have 2 new notifications.", "info");
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            openConfirm({
                title: "Log Out",
                message: "Are you sure you want to log out?",
                confirmLabel: "Log Out",
                onConfirm: () => showToast("You have been logged out.", "info")
            });
        });
    }


});