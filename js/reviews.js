document.addEventListener("DOMContentLoaded", () => {

    if (window.lucide) {
        window.lucide.createIcons();
    }

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

    /* =========================
       SIDEBAR TOGGLE
    ========================== */

    const sidebarToggle = document.getElementById("mobileMenu");

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            const isHidden = document.body.classList.toggle("sidebar-hidden");
            const action = isHidden ? "Show" : "Hide";
            sidebarToggle.setAttribute("aria-expanded", String(!isHidden));
            sidebarToggle.setAttribute("aria-label", action + " sidebar");
            sidebarToggle.title = action + " sidebar";
        });
    }

    /* =========================
       ELEMENTS & STATE
    ========================== */

    const list = document.getElementById("reviewsList");
    const cards = Array.from(document.querySelectorAll(".review-card"));
    const emptyState = document.getElementById("emptyState");
    const filterTabs = document.querySelectorAll(".filter-tab");
    const searchInput = document.getElementById("globalSearch");
    const sortSelect = document.getElementById("sortSelect");
    const exportButton = document.getElementById("exportReviewsButton");

    // Modal elements
    const deleteModal = document.getElementById("deleteModal");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    let cardPendingDelete = null;

    let currentFilter = "all";
    let currentSort = "newest";

    // Dynamic state renderer for badges and action buttons
    function updateCardStatus(card, newStatus) {
        card.dataset.status = newStatus;

        // 1. Top status badge
        let topBar = card.querySelector(".review-card-top-bar");
        if (!topBar) {
            topBar = document.createElement("div");
            topBar.className = "review-card-top-bar";
            card.prepend(topBar);
        }

        const badgeConfigs = {
            pending: { label: "Pending", icon: "clock", class: "pending" },
            approved: { label: "Approved", icon: "check-circle", class: "approved" },
            hidden: { label: "Hidden", icon: "eye-off", class: "hidden-status" }
        };

        const config = badgeConfigs[newStatus] || badgeConfigs.pending;

        topBar.innerHTML = `
            <span class="review-status-badge ${config.class}">
                <i data-lucide="${config.icon}" aria-hidden="true"></i> ${config.label}
            </span>
        `;

        // 2. Left status area & Right action buttons based on exact status
        const statusArea = card.querySelector(".review-status-area");
        const actionsContainer = card.querySelector(".review-actions");

        if (newStatus === "approved") {
            // APPROVED STATE:
            // Left: Green "Added to landing page" message tag
            if (statusArea) {
                statusArea.innerHTML = `
                    <span class="review-tag added-landing-msg">
                        <i data-lucide="check" aria-hidden="true"></i> Added to landing page
                    </span>
                `;
            }
            // Right: Hide Eye Icon only
            if (actionsContainer) {
                actionsContainer.innerHTML = `
                    <button class="icon-button hide-button" type="button" title="Hide Review">
                        <i data-lucide="eye-off" aria-hidden="true"></i>
                    </button>
                `;
            }
        } 
        else if (newStatus === "hidden") {
            // HIDDEN STATE:
            // Left: Empty (capsules removed)
            if (statusArea) {
                statusArea.innerHTML = "";
            }
            // Right: "Republish review" button + Trash button
            if (actionsContainer) {
                actionsContainer.innerHTML = `
                    <button class="text-button republish-button" type="button">
                        <i data-lucide="refresh-cw" aria-hidden="true"></i>
                        <span>Republish review</span>
                    </button>
                    <button class="icon-button delete-button" type="button" title="Archive / Delete Review">
                        <i data-lucide="trash-2" aria-hidden="true"></i>
                    </button>
                `;
            }
        } 
        else {
            // PENDING STATE (DEFAULT):
            // Left: Empty (capsules removed)
            if (statusArea) {
                statusArea.innerHTML = "";
            }
            // Right: "Add to landing page" button + Trash button
            if (actionsContainer) {
                actionsContainer.innerHTML = `
                    <button class="text-button approve-button" type="button">
                        <i data-lucide="check-circle" aria-hidden="true"></i>
                        <span>Add to landing page</span>
                    </button>
                    <button class="icon-button delete-button" type="button" title="Archive / Delete Review">
                        <i data-lucide="trash-2" aria-hidden="true"></i>
                    </button>
                `;
            }
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // Initialize all cards on load
    cards.forEach(card => {
        const initialStatus = card.dataset.status || "pending";
        updateCardStatus(card, initialStatus);
    });

    /* =========================
       FILTER + SEARCH + SORT
    ========================== */

    function applyFilters() {
        const keyword = (searchInput?.value || "").toLowerCase().trim();
        let visibleCount = 0;

        cards.forEach(card => {
            if (!card.parentNode) return;

            const rating = card.dataset.rating;
            const text = card.innerText.toLowerCase();

            let matchesFilter = true;

            if (currentFilter !== "all") {
                matchesFilter = rating === currentFilter;
            }

            const matchesSearch = !keyword || text.includes(keyword);

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
                case "oldest": return dateA - dateB;
                case "highest": return ratingB - ratingA;
                case "lowest": return ratingA - ratingB;
                case "newest":
                default: return dateB - dateA;
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
       STATUS ACTION LISTENERS
    ========================== */

    document.addEventListener("click", (e) => {
        // 1. "Add to landing page" Click -> Transition to Approved
        const approveBtn = e.target.closest(".approve-button");
        if (approveBtn) {
            const card = approveBtn.closest(".review-card");
            updateCardStatus(card, "approved");
            showToast("Review approved & published to landing page!", "success");
            applyFilters();
            return;
        }

        // 2. Hide Eye Button Click -> Transition from Approved to Hidden
        const hideBtn = e.target.closest(".hide-button");
        if (hideBtn) {
            const card = hideBtn.closest(".review-card");
            updateCardStatus(card, "hidden");
            showToast("Review hidden from landing page", "warning");
            applyFilters();
            return;
        }

        // 3. "Republish review" Click -> Transition from Hidden to Approved
        const republishBtn = e.target.closest(".republish-button");
        if (republishBtn) {
            const card = republishBtn.closest(".review-card");
            updateCardStatus(card, "approved");
            showToast("Review republished to landing page!", "success");
            applyFilters();
            return;
        }

        // 4. Trash Button Click -> Open Confirmation Modal
        const deleteBtn = e.target.closest(".delete-button");
        if (deleteBtn) {
            cardPendingDelete = deleteBtn.closest(".review-card");
            if (deleteModal) {
                deleteModal.hidden = false;
            }
        }
    });

    // Modal Confirmation Handlers
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            if (cardPendingDelete) {
                cardPendingDelete.remove();
                const index = cards.indexOf(cardPendingDelete);
                if (index > -1) cards.splice(index, 1);
                showToast("Review archived successfully.", "info");
                applyFilters();
            }
            if (deleteModal) deleteModal.hidden = true;
            cardPendingDelete = null;
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", () => {
            if (deleteModal) deleteModal.hidden = true;
            cardPendingDelete = null;
        });
    }

    // Close modal on background overlay click
    if (deleteModal) {
        deleteModal.addEventListener("click", (e) => {
            if (e.target === deleteModal) {
                deleteModal.hidden = true;
                cardPendingDelete = null;
            }
        });
    }

    /* =========================
       OTHER ACTIONS
    ========================== */

    if (exportButton) {
        exportButton.addEventListener("click", () => {
            showToast("Review export is not connected yet.", "info");
        });
    }

    const notificationButton = document.getElementById("notificationButton");
    if (notificationButton) {
        notificationButton.addEventListener("click", () => {
            showToast("You have 3 new notifications.", "info");
        });
    }

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                showToast("Logging out...", "success");
            }
        });
    }

    /* =========================
       INIT
    ========================== */

    applySort();
    applyFilters();
});