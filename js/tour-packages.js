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
            confirmClass: options.confirmClass || options.confirmButtonClass || "danger-button"
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

    const searchInput = document.getElementById("globalSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const packageGrid = document.getElementById("packageGrid");
    const packageCount = document.getElementById("packageCount");
    const emptyState = document.getElementById("emptyState");
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
       LOCALSTORAGE PACKAGE RENDERING & FILTERING
    ========================== */

    const PACKAGE_KEY = "uncleRonPackages";

    const defaultPackages = [
        {
            id: "cebu-3d2n",
            name: "3D2N Cebu Tour",
            category: "cebu",
            categoryLabel: "Cebu Tour",
            status: "active",
            price: "5098",
            maxGuests: "10",
            duration: "3 Days / 2 Nights",
            shortDescription: "Explore the beautiful beaches, waterfalls and famous attractions of Cebu.",
            cover: "images/CARD 1.jpg"
        },
        {
            id: "moalboal-badian",
            name: "Moalboal-Badian Adventure",
            category: "south",
            categoryLabel: "South Cebu",
            status: "active",
            price: "3500",
            maxGuests: "8",
            duration: "1 Day",
            shortDescription: "Experience sardine runs, canyoneering and the beautiful waterfalls of South Cebu.",
            cover: "images/CARD 2.jpg"
        },
        {
            id: "cebu-bohol-4d3n",
            name: "4D3N Cebu-Bohol Tour",
            category: "bohol",
            categoryLabel: "Cebu - Bohol",
            status: "active",
            price: "7598",
            maxGuests: "12",
            duration: "4 Days / 3 Nights",
            shortDescription: "Visit the Chocolate Hills, Loboc River and other popular destinations in Cebu and Bohol.",
            cover: "images/CARD 3.jpg"
        },
        {
            id: "cebu-city-uphill",
            name: "Cebu City & Uphill Tour",
            category: "city",
            categoryLabel: "City Tour",
            status: "active",
            price: "2500",
            maxGuests: "10",
            duration: "1 Day",
            shortDescription: "Discover Cebu's historical landmarks, churches and beautiful mountain views.",
            cover: "images/card 4.jpg"
        },
        {
            id: "oslob-whale-shark",
            name: "Oslob Whale Shark Tour",
            category: "south",
            categoryLabel: "South Cebu",
            status: "active",
            price: "4200",
            maxGuests: "8",
            duration: "1 Day",
            shortDescription: "Enjoy a memorable day exploring Oslob and its famous attractions.",
            cover: "images/card 5.jpg"
        },
        {
            id: "cebu-island-hopping",
            name: "Cebu Island Hopping",
            category: "cebu",
            categoryLabel: "Cebu Tour",
            status: "inactive",
            price: "3800",
            maxGuests: "10",
            duration: "1 Day",
            shortDescription: "Explore beautiful islands and crystal-clear waters around Cebu.",
            cover: "images/3ae9e23822f34f7c5f05c9d961d3becf.jpg"
        }
    ];

    function getPackages() {
        try {
            const stored = JSON.parse(localStorage.getItem(PACKAGE_KEY));
            if (Array.isArray(stored) && stored.length > 0) {
                return stored;
            }
        } catch {}
        
        localStorage.setItem(PACKAGE_KEY, JSON.stringify(defaultPackages));
        return defaultPackages;
    }

    let packages = getPackages();

    function renderPackages() {
        if (!packageGrid) return;
        packageGrid.innerHTML = '';

        packages.forEach(pkg => {
            const card = document.createElement('article');
            card.className = 'package-card';
            card.dataset.id = pkg.id;
            card.dataset.category = pkg.category;
            card.dataset.status = pkg.status;
            card.dataset.name = pkg.name;

            card.innerHTML = `
                <div class="package-image">
                    <img src="${pkg.cover || 'images/card-1.jpg'}" alt="${pkg.name}">
                    <span class="status ${pkg.status}">${pkg.status === 'active' ? 'Active' : 'Inactive'}</span>
                    <button class="image-menu" type="button" aria-label="Actions for ${pkg.name}"><i data-lucide="ellipsis"></i></button>
                    <div class="card-menu">
                        <button class="edit-btn" type="button"><i data-lucide="pencil"></i>Edit</button>
                        <button class="delete-btn" type="button"><i data-lucide="trash-2"></i>Delete</button>
                    </div>
                </div>
                <div class="package-body">
                    <div class="package-category">${(pkg.categoryLabel || pkg.category).toUpperCase()}</div>
                    <h2>${pkg.name}</h2>
                    <p>${pkg.shortDescription || pkg.overview || ""}</p>
                    <div class="package-info">
                        <span><i data-lucide="clock-3"></i>${pkg.duration}</span>
                        <span><i data-lucide="users"></i>Up to ${pkg.maxGuests} pax</span>
                    </div>
                    <div class="package-footer">
                        <div>
                            <small>Starting at</small>
                            <strong>₱${Number(pkg.price || 0).toLocaleString()}</strong>
                            <small>/ person</small>
                        </div>
                        <button class="view-btn" type="button">View Details</button>
                    </div>
                </div>
            `;

            packageGrid.appendChild(card);
        });

        window.lucide?.createIcons();
        filterPackages();
    }

    function filterPackages() {
        const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const category = categoryFilter ? categoryFilter.value : "all";
        const status = statusFilter ? statusFilter.value : "all";
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

        if (packageCount) packageCount.textContent = visibleCount;
        if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";
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
            const pkgId = card.dataset.id;
            location.href = 'edit-tour-package.html?id=' + pkgId;
            return;
        }

        // 3. Delete Package Button
        const deleteButton = event.target.closest(".delete-btn");
        if (deleteButton) {
            event.preventDefault();
            event.stopPropagation();

            const card = deleteButton.closest(".package-card");
            if (!card) return;

            const pkgId = card.dataset.id;
            const packageName = card.dataset.name;

            openConfirm({
                title: "Delete Tour Package",
                message: `Are you sure you want to delete "${packageName}"? This action cannot be undone.`,
                confirmLabel: "Delete Package",
                confirmClass: "primary-button delete-btn",
                onConfirm: () => {
                    packages = packages.filter(p => String(p.id) !== String(pkgId));
                    localStorage.setItem(PACKAGE_KEY, JSON.stringify(packages));
                    card.remove();
                    if (typeof filterPackages === "function") {
                        filterPackages();
                    }
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
            const pkgId = card.dataset.id;
            location.href = 'view-tour-package.html?id=' + pkgId;
            return;
        }
    });

    /* =========================
       NOTIFICATION & LOGOUT
    ========================== */

    notificationButton?.addEventListener("click", () => {
        showToast("You have 2 new notifications.", "info");
    });

    logoutButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openConfirm({
            title: "Log Out",
            message: "Are you sure you want to log out?",
            confirmLabel: "Log Out",
            onConfirm: () => showToast("You have been logged out.", "info")
        });
    });

    renderPackages();
});