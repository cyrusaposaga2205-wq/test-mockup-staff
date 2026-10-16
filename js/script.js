document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const viewModal = {
        backdrop: document.getElementById("viewModalBackdrop"),
        close: document.getElementById("viewModalClose"),
        closeBtn: document.getElementById("viewModalCloseBtn"),
        editSwitchBtn: document.getElementById("viewModalEditSwitchBtn")
    };

    const editModal = {
        backdrop: document.getElementById("editModalBackdrop"),
        close: document.getElementById("editModalClose"),
        discardBtn: document.getElementById("editModalDiscardBtn"),
        form: document.getElementById("editBookingForm")
    };

    function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.append(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /* Modal Toggle Functions */
   function openViewModal(data) {
        if (!viewModal.backdrop) return;
        
        // Populate view fields
        document.getElementById("viewModalBookingId").textContent = `Booking #${data.bookingId || "2026-8671"}`;
        document.getElementById("viewModalPackage").textContent = data.packageName || "Private Oslob Tour";
        document.getElementById("viewModalDeparture").textContent = data.time || "5:00 AM";
        document.getElementById("viewModalGuestName").textContent = data.leadGuest || "Dadas Santos";
        document.getElementById("viewModalGuests").textContent = `${data.guests || "2"} Adults`;
        document.getElementById("viewModalBookingType").textContent = data.type || "Exclusive";
        
        // Update top status badge dynamically (e.g., Pending vs Confirmed)
        const headerBadge = document.getElementById("viewModalConfirmedBadge");
        if (headerBadge) {
            const currentStatus = data.status || "Confirmed";
            headerBadge.textContent = currentStatus;
            headerBadge.className = `status ${currentStatus.toLowerCase()}`;
        }

        // Keep pending or explicitly unpaid bookings as partially paid
        const isPending = data.status === "Pending";
        const isFullyPaid = !isPending && (data.leadGuest === "Maria Santos" || data.leadGuest === "Ana Garcia" || (data.rowIndex % 2 === 1));
        
        const paymentBadge = document.getElementById("viewModalPaymentStatusBadge");
        const paidPrice = document.getElementById("viewModalPaidPrice");
        const balanceLabel = document.getElementById("viewModalBalanceLabel");
        const balancePrice = document.getElementById("viewModalBalancePrice");

        if (paymentBadge && paidPrice && balanceLabel && balancePrice) {
            if (isFullyPaid) {
                paymentBadge.className = "status fully-paid";
                paymentBadge.textContent = "Fully Paid";
                paidPrice.textContent = "₱8,400.00";
                balanceLabel.className = "text-success";
                balanceLabel.textContent = "Balance";
                balancePrice.className = "text-success";
                balancePrice.textContent = "₱0.00";
            } else {
                paymentBadge.className = "status partially-paid";
                paymentBadge.textContent = "Partially Paid";
                paidPrice.textContent = "₱4,200.00";
                balanceLabel.className = "text-danger";
                balanceLabel.textContent = "Balance";
                balancePrice.className = "text-danger";
                balancePrice.textContent = "₱4,200.00";
            }
        }

        // Hide Tour Status in View Modal for upcoming tours
        const tourStatusGroup = document.getElementById("viewModalTourStatus")?.closest(".detail-group");
        if (tourStatusGroup) {
            tourStatusGroup.style.display = data.isUpcoming ? "none" : "block";
        }

        viewModal.backdrop.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeViewModal() {
        if (viewModal.backdrop) {
            viewModal.backdrop.hidden = true;
            document.body.classList.remove("modal-open");
        }
    }

    function openEditModal(data) {
        if (!editModal.backdrop) return;

        // Populate edit fields
        document.getElementById("editModalTitle").textContent = "Edit Booking";
        document.getElementById("editModalSubtitle").textContent = data.isUpcoming ? "Upcoming Tours · Staff Dashboard" : "Today's Tours · Staff Dashboard";
        document.getElementById("editModalInfoTag").textContent = `${data.packageName || "Private Oslob Tour"} · ${data.time || "5:00 AM"}`;
        document.getElementById("editModalBookingNumberTag").textContent = `#${data.bookingId || "2026-8671"}`;
        
        document.getElementById("editInfoBookingNum").textContent = `#${data.bookingId || "2026-8671"}`;
        document.getElementById("editInfoBookingType").textContent = data.type || "Exclusive";
        document.getElementById("editInfoPackage").textContent = data.packageName || "Private Oslob Tour";
        document.getElementById("editInfoDeparture").textContent = data.time || "5:00 AM";
        
        document.getElementById("editGuestName").value = data.leadGuest || "Dadas Santos";
        document.getElementById("editGuestCount").value = data.guests || 2;

        // Configure Booking Status options based on whether it is an upcoming tour
        const bookingStatusSelect = document.getElementById("editBookingStatus");
        if (bookingStatusSelect) {
            if (data.isUpcoming) {
                bookingStatusSelect.innerHTML = `
                    // <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                `;
            } else {
                bookingStatusSelect.innerHTML = `
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                `;
            }
        }

        // Hide Tour Status in Edit Modal for upcoming tours
        const tourStatusGroup = document.getElementById("editTourStatus")?.closest(".form-group");
        if (tourStatusGroup) {
            tourStatusGroup.style.display = data.isUpcoming ? "none" : "flex";
        }
        
        editModal.backdrop.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeEditModal() {
        if (editModal.backdrop) {
            editModal.backdrop.hidden = true;
            document.body.classList.remove("modal-open");
        }
    }

    /* Event Listeners for Modals */
    viewModal.close?.addEventListener("click", closeViewModal);
    viewModal.closeBtn?.addEventListener("click", closeViewModal);
    viewModal.editSwitchBtn?.addEventListener("click", () => {
        closeViewModal();
        openEditModal({ isUpcoming: false });
    });

    editModal.close?.addEventListener("click", closeEditModal);
    editModal.discardBtn?.addEventListener("click", closeEditModal);

    editModal.form?.addEventListener("submit", (e) => {
        e.preventDefault();
        closeEditModal();
        showToast("Booking details saved successfully.", "success");
    });

    const deleteModal = {
        backdrop: document.getElementById("deleteModalBackdrop"),
        close: document.getElementById("deleteModalClose"),
        cancelBtn: document.getElementById("deleteModalCancelBtn"),
        confirmBtn: document.getElementById("deleteModalConfirmBtn")
    };

    let targetRowToDelete = null;

    function openDeleteModal(row) {
        if (!deleteModal.backdrop) return;
        targetRowToDelete = row;
        deleteModal.backdrop.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeDeleteModal() {
        if (deleteModal.backdrop) {
            deleteModal.backdrop.hidden = true;
            document.body.classList.remove("modal-open");
        }
    }

    deleteModal.close?.addEventListener("click", () => {
        closeDeleteModal();
        targetRowToDelete = null;
    });

    deleteModal.cancelBtn?.addEventListener("click", () => {
        closeDeleteModal();
        targetRowToDelete = null;
    });
    
    deleteModal.confirmBtn?.addEventListener("click", () => {
        if (targetRowToDelete) {
            const rowToRemove = targetRowToDelete;
            closeDeleteModal();
            rowToRemove.remove();
            targetRowToDelete = null;
            showToast("Booking deleted successfully.", "success");
        } else {
            closeDeleteModal();
        }
    });

    /* Table Button Handlers */
    document.addEventListener("click", event => {
        const viewBtn = event.target.closest(".view-btn");
        const editBtn = event.target.closest(".edit-btn");
        const deleteBtn = event.target.closest(".delete-btn");

        if (viewBtn) {
            const row = viewBtn.closest("tr");
            const rowIndex = Array.from(row.parentNode.children).indexOf(row);
            const isUpcoming = Boolean(viewBtn.closest("#upcomingToursTable"));
            const data = {
                time: row.querySelectorAll("td")[0]?.textContent?.trim(),
                packageName: row.querySelectorAll("td")[1]?.textContent?.trim(),
                leadGuest: row.querySelectorAll("td")[2]?.textContent?.trim(),
                guests: row.querySelectorAll("td")[3]?.textContent?.trim(),
                type: row.querySelectorAll("td")[4]?.textContent?.trim(),
                status: row.querySelectorAll("td")[5]?.textContent?.trim(),
                bookingId: "2026-8671",
                rowIndex,
                isUpcoming
            };
            openViewModal(data);
        }

        if (editBtn) {
            const row = editBtn.closest("tr");
            const isUpcoming = Boolean(editBtn.closest("#upcomingToursTable"));
            const data = {
                time: row.querySelectorAll("td")[0]?.textContent?.trim(),
                packageName: row.querySelectorAll("td")[1]?.textContent?.trim(),
                leadGuest: row.querySelectorAll("td")[2]?.textContent?.trim(),
                guests: row.querySelectorAll("td")[3]?.textContent?.trim(),
                type: row.querySelectorAll("td")[4]?.textContent?.trim(),
                status: row.querySelectorAll("td")[5]?.textContent?.trim(),
                bookingId: "2026-8671",
                isUpcoming
            };
            openEditModal(data);
        }

        if (deleteBtn) {
            const row = deleteBtn.closest("tr");
            openDeleteModal(row);
        }
    });

    /* Sidebar Mobile Toggle */
    const sidebarToggle = document.getElementById("mobileMenu");
    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", () => {
            document.body.classList.toggle("sidebar-hidden");
        });
    }

    // Notification Dropdown
    const notificationBtn = document.getElementById("notificationButton");
    const notificationDropdown = document.getElementById("notificationDropdown");

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationDropdown.hidden = !notificationDropdown.hidden;
        });

        document.addEventListener("click", (e) => {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.hidden = true;
            }
        });
    }

    // Global Search Filter for Dashboard Tables
    const globalSearch = document.getElementById("globalSearch");

    if (globalSearch) {
        globalSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const tables = [
                document.getElementById("toursTable"), 
                document.getElementById("upcomingToursTable")
            ];
            
            tables.forEach(table => {
                if (!table) return;
                const dataRows = table.querySelectorAll("tbody tr:not(.empty-row)");
                const emptyRow = table.querySelector("tbody tr.empty-row");
                let visibleCount = 0;

                dataRows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    if (!query || rowText.includes(query)) {
                        row.style.display = "";
                        visibleCount++;
                    } else {
                        row.style.display = "none";
                    }
                });

                if (emptyRow) {
                    emptyRow.hidden = visibleCount > 0;
                }
            });
        });
    }
});