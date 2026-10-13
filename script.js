/* ==========================================================
   NEXUS CRM - COMPLETE ENTERPRISE FRONTEND APPLICATION SCRIPT
   ========================================================== */

// Global Application State
let db = {
    currentUser: { name: "Admin User", email: "admin@nexus.com", role: "Admin" },
    customers: [],
    leads: [],
    interactions: [],
    users: [],
    settings: { darkMode: false }
};

let charts = {
    growth: null,
    leadStatus: null
};

// Default Sample Seed Data
const sampleData = {
    customers: [
        { id: "CUST-1001", name: "Aarav Sharma", email: "aarav.sharma@example.com", mobile: "9876543210", company: "Acme Corp", bldg: "#42, Tech Park", street: "MG Road", city: "Bengaluru", state: "Karnataka", pin: "560001", country: "India", status: "Active", date: "2026-01-15", notes: "Key enterprise client for cloud solutions." },
        { id: "CUST-1002", name: "Priya Patel", email: "priya.patel@innotech.in", mobile: "9812345678", company: "InnoTech Solutions", bldg: "Tower B, 4th Floor", street: "S.G. Highway", city: "Ahmedabad", state: "Gujarat", pin: "380015", country: "India", status: "Active", date: "2026-02-01", notes: "Interested in upgrading software license." },
        { id: "CUST-1003", name: "Vikram Singh", email: "vikram@apexlogistics.co.in", mobile: "9711223344", company: "Apex Logistics", bldg: "Plot 12", street: "Industrial Area", city: "Delhi", state: "Delhi", pin: "110020", country: "India", status: "Inactive", date: "2026-02-10", notes: "Contract paused for quarterly review." }
    ],
    leads: [
        { id: "LEAD-501", name: "Neha Gupta", email: "neha.g@zylker.com", mobile: "9988776655", company: "Zylker Inc", source: "Website", value: 12000, status: "Qualified", assigned: "admin@nexus.com", date: "2026-03-01", followup: "2026-04-15", notes: "Requesting live software demo." },
        { id: "LEAD-502", name: "Rohan Verma", email: "rohan@vertextech.org", mobile: "9654321098", company: "Vertex Tech", source: "Referral", value: 8500, status: "Proposal", assigned: "manager@nexus.com", date: "2026-03-05", followup: "2026-04-18", notes: "Sent customized pricing proposal." }
    ],
    interactions: [
        { id: "INT-901", target: "Aarav Sharma", type: "Phone Call", datetime: "2026-03-10T10:30", subject: "Cloud Migration Check", desc: "Discussed deployment timelines and server specifications.", outcome: "Successfully deployed server cluster.", followup: "2026-04-20", user: "admin@nexus.com" },
        { id: "INT-902", target: "Neha Gupta", type: "Meeting", datetime: "2026-03-12T14:00", subject: "Initial Pitch", desc: "Demonstrated NexusCRM core features.", outcome: "Lead qualified for proposal stage.", followup: "2026-04-15", user: "manager@nexus.com" }
    ],
    users: [
        { id: "U-1", name: "Admin User", email: "admin@nexus.com", role: "Admin", status: "Active" },
        { id: "U-2", name: "Manager User", email: "manager@nexus.com", role: "Manager", status: "Active" },
        { id: "U-3", name: "Agent User", email: "agent@nexus.com", role: "Agent", status: "Active" }
    ]
};

// Initialization on load
document.addEventListener("DOMContentLoaded", () => {
    loadLocalStorageData();
    launchApp();
});

function loadLocalStorageData() {
    const savedDb = localStorage.getItem("nexus_crm_db");
    if (savedDb) {
        try {
            db = JSON.parse(savedDb);
        } catch (e) {
            console.error("Error parsing local storage, restoring defaults.", e);
            resetDemoData();
        }
    } else {
        resetDemoData();
    }
}

function saveToLocalStorage() {
    localStorage.setItem("nexus_crm_db", JSON.stringify(db));
}

function resetDemoData() {
    db.customers = JSON.parse(JSON.stringify(sampleData.customers));
    db.leads = JSON.parse(JSON.stringify(sampleData.leads));
    db.interactions = JSON.parse(JSON.stringify(sampleData.interactions));
    db.users = JSON.parse(JSON.stringify(sampleData.users));
    saveToLocalStorage();
    showToast("Demo data reset successfully!", "success");
    initDashboard();
}

function clearAllData() {
    if (confirm("Are you sure you want to clear all CRM data?")) {
        db.customers = [];
        db.leads = [];
        db.interactions = [];
        saveToLocalStorage();
        showToast("All data cleared.", "warning");
        initDashboard();
    }
}

function launchApp() {
    document.getElementById("current-user-name").textContent = db.currentUser.name;
    document.getElementById("current-user-avatar").textContent = db.currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase();

    applyTheme(db.settings.darkMode);
    switchSection('dashboard');
}

/* ==========================================================
   NAVIGATION & UI CONTROLS
   ========================================================== */

function switchSection(sectionId) {
    document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => item.classList.remove("active"));

    const targetSec = document.getElementById(`sec-${sectionId}`);
    if (targetSec) targetSec.classList.add("active");

    const targetNav = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
    if (targetNav) targetNav.classList.add("active");

    // Render respective section module
    if (sectionId === 'dashboard') initDashboard();
    if (sectionId === 'customers') renderCustomersTable();
    if (sectionId === 'leads') renderLeadsTable();
    if (sectionId === 'interactions') renderInteractionsTable();
    if (sectionId === 'reports') renderReportsAnalytics();
    if (sectionId === 'users') renderUsersTable();
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function toggleProfileMenu() {
    document.getElementById("profile-menu").classList.toggle("show");
}

function toggleDarkMode(isDark) {
    db.settings.darkMode = isDark;
    saveToLocalStorage();
    applyTheme(isDark);
}

function applyTheme(isDark) {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) themeSwitch.checked = isDark;
}

/* ==========================================================
   STRICT VALIDATIONS (EMAIL & INDIAN MOBILE)
   ========================================================== */

function validateEmail(email) {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return false;
    if (email.includes("..")) return false;
    return true;
}

function validateEmailInput(inputEl) {
    const val = inputEl.value.trim();
    const errEl = document.getElementById(`${inputEl.id}-err`) || document.getElementById(`${inputEl.id}-error`);
    if (!val) {
        if (errEl) errEl.textContent = "Please enter your email address.";
        return false;
    }
    if (!validateEmail(val)) {
        if (errEl) errEl.textContent = "Please enter a valid email address (e.g., name@example.com).";
        return false;
    }
    if (errEl) errEl.textContent = "";
    return true;
}

function validateMobileIndian(mobile) {
    if (!mobile) return false;
    const cleanMobile = mobile.replace(/[\s+()-]/g, "");
    const indRegex = /^(?:91)?[6-9]\d{9}$/;
    return indRegex.test(cleanMobile);
}

function validateMobileInput(inputEl) {
    const val = inputEl.value.trim();
    const errEl = document.getElementById(`${inputEl.id}-err`) || document.getElementById(`${inputEl.id}-error`);
    if (!val) {
        if (errEl) errEl.textContent = "Please enter your mobile number.";
        return false;
    }
    if (!validateMobileIndian(val)) {
        if (errEl) errEl.textContent = "Enter a valid 10-digit Indian mobile number beginning with 6, 7, 8, or 9.";
        return false;
    }
    if (errEl) errEl.textContent = "";
    return true;
}

/* ==========================================================
   DASHBOARD MODULE & CHARTS
   ========================================================== */

function initDashboard() {
    const totalCust = db.customers.length;
    const activeCust = db.customers.filter(c => c.status === "Active").length;
    const totalLeads = db.leads.length;
    const convertedLeads = db.leads.filter(l => l.status === "Converted").length;

    let pendingFollowups = 0;
    let overdueFollowups = 0;
    const today = new Date().toISOString().split("T")[0];

    db.leads.forEach(l => {
        if (l.followup && l.status !== "Converted" && l.status !== "Lost") {
            if (l.followup > today) pendingFollowups++;
            else overdueFollowups++;
        }
    });

    document.getElementById("stat-total-customers").textContent = totalCust;
    document.getElementById("stat-active-customers").textContent = activeCust;
    document.getElementById("stat-total-leads").textContent = totalLeads;
    document.getElementById("stat-converted-leads").textContent = convertedLeads;
    document.getElementById("stat-pending-followups").textContent = pendingFollowups;
    document.getElementById("stat-overdue-followups").textContent = overdueFollowups;

    renderDashboardTables();
    renderDashboardCharts();
}

function renderDashboardTables() {
    const custTbody = document.querySelector("#dashboard-customer-table tbody");
    custTbody.innerHTML = db.customers.slice(-5).reverse().map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.company || 'N/A'}</td>
            <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
            <td>${c.date}</td>
        </tr>
    `).join('') || `<tr><td colspan="4" style="text-align:center;">No customers found.</td></tr>`;

    const intTbody = document.querySelector("#dashboard-interaction-table tbody");
    intTbody.innerHTML = db.interactions.slice(-5).reverse().map(i => `
        <tr>
            <td><strong>${i.target}</strong></td>
            <td>${i.type}</td>
            <td>${i.datetime.replace('T', ' ')}</td>
            <td>${i.outcome || 'Pending'}</td>
        </tr>
    `).join('') || `<tr><td colspan="4" style="text-align:center;">No interactions logged.</td></tr>`;
}

function renderDashboardCharts() {
    const growthCtx = document.getElementById("customerGrowthChart").getContext("2d");
    if (charts.growth) charts.growth.destroy();

    charts.growth = new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Customers',
                data: [5, 12, 18, totalCustomersCount() + 10, totalCustomersCount() + 15, totalCustomersCount() + 22],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const leadCtx = document.getElementById("leadStatusChart").getContext("2d");
    if (charts.leadStatus) charts.leadStatus.destroy();

    const statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];
    const counts = statuses.map(s => db.leads.filter(l => l.status === s).length);

    charts.leadStatus = new Chart(leadCtx, {
        type: 'doughnut',
        data: {
            labels: statuses,
            datasets: [{
                data: counts,
                backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#065f46', '#ef4444']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function totalCustomersCount() {
    return db.customers.length;
}

/* ==========================================================
   CUSTOMER MANAGEMENT MODULE (CRUD & PROFILE)
   ========================================================== */

function openCustomerModal(editId = null) {
    document.getElementById("customer-form").reset();
    document.getElementById("cust-edit-id").value = "";
    document.getElementById("customer-modal-title").textContent = "Add New Customer";

    if (editId) {
        const cust = db.customers.find(c => c.id === editId);
        if (cust) {
            document.getElementById("customer-modal-title").textContent = "Edit Customer";
            document.getElementById("cust-edit-id").value = cust.id;
            document.getElementById("cust-name").value = cust.name;
            document.getElementById("cust-email").value = cust.email;
            document.getElementById("cust-mobile").value = cust.mobile;
            document.getElementById("cust-company").value = cust.company || '';
            document.getElementById("cust-bldg").value = cust.bldg || '';
            document.getElementById("cust-street").value = cust.street || '';
            document.getElementById("cust-city").value = cust.city || '';
            document.getElementById("cust-state").value = cust.state || '';
            document.getElementById("cust-pin").value = cust.pin || '';
            document.getElementById("cust-country").value = cust.country || 'India';
            document.getElementById("cust-status").value = cust.status;
            document.getElementById("cust-notes").value = cust.notes || '';
        }
    }
    document.getElementById("customer-modal").classList.add("show");
}

function closeCustomerModal() {
    document.getElementById("customer-modal").classList.remove("show");
}

function saveCustomer(e) {
    e.preventDefault();
    const editId = document.getElementById("cust-edit-id").value;
    const email = document.getElementById("cust-email").value.trim();
    const mobile = document.getElementById("cust-mobile").value.trim();

    if (!validateEmail(email)) {
        showToast("Please provide a valid email address.", "error");
        return;
    }
    if (!validateMobileIndian(mobile)) {
        showToast("Please provide a valid 10-digit Indian mobile number.", "error");
        return;
    }

    const customerData = {
        id: editId || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        name: document.getElementById("cust-name").value.trim(),
        email: email,
        mobile: mobile,
        company: document.getElementById("cust-company").value.trim(),
        bldg: document.getElementById("cust-bldg").value.trim(),
        street: document.getElementById("cust-street").value.trim(),
        city: document.getElementById("cust-city").value.trim(),
        state: document.getElementById("cust-state").value.trim(),
        pin: document.getElementById("cust-pin").value.trim(),
        country: document.getElementById("cust-country").value.trim() || 'India',
        status: document.getElementById("cust-status").value,
        date: editId ? (db.customers.find(c => c.id === editId)?.date || new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
        notes: document.getElementById("cust-notes").value.trim()
    };

    if (editId) {
        const index = db.customers.findIndex(c => c.id === editId);
        if (index !== -1) db.customers[index] = customerData;
        showToast("Customer updated successfully!", "success");
    } else {
        db.customers.push(customerData);
        showToast("Customer added successfully!", "success");
    }

    saveToLocalStorage();
    closeCustomerModal();
    renderCustomersTable();
    initDashboard();
}

function renderCustomersTable() {
    const search = (document.getElementById("customer-search")?.value || "").toLowerCase();
    const statusFilter = document.getElementById("customer-status-filter")?.value || "";
    const sortBy = document.getElementById("customer-sort-by")?.value || "newest";

    let filtered = db.customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search) || 
                              c.email.toLowerCase().includes(search) || 
                              (c.company && c.company.toLowerCase().includes(search)) ||
                              (c.city && c.city.toLowerCase().includes(search));
        const matchesStatus = statusFilter ? c.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === 'oldest') filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'company') filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));

    const tbody = document.querySelector("#full-customers-table tbody");
    if (!tbody) return;

    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td><code>${c.id}</code></td>
            <td><strong><a href="#" onclick="viewCustomerProfile('${c.id}')">${c.name}</a></strong></td>
            <td>${c.company || 'N/A'}</td>
            <td>${c.email}</td>
            <td>${c.mobile}</td>
            <td>${c.city || 'N/A'}, ${c.state || ''}</td>
            <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
            <td>
                <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.8rem;" onclick="openCustomerModal('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="deleteCustomer('${c.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="8" style="text-align:center;">No matching customer records found.</td></tr>`;
}

function deleteCustomer(id) {
    if (confirm("Are you sure you want to delete this customer record?")) {
        db.customers = db.customers.filter(c => c.id !== id);
        saveToLocalStorage();
        renderCustomersTable();
        initDashboard();
        showToast("Customer deleted successfully.", "warning");
    }
}

function viewCustomerProfile(id) {
    const cust = db.customers.find(c => c.id === id);
    if (!cust) return;

    const relatedInteractions = db.interactions.filter(i => i.target === cust.name);

    const body = document.getElementById("customer-profile-content");
    body.innerHTML = `
        <div style="display:flex; gap:20px; align-items:center; margin-bottom:20px;">
            <div class="avatar-badge" style="width:60px; height:60px; font-size:1.5rem;">${cust.name.split(" ").map(n=>n[0]).join("")}</div>
            <div>
                <h2>${cust.name}</h2>
                <p style="color:var(--text-muted);">${cust.company || 'Independent'} | Added on ${cust.date}</p>
                <span class="badge badge-${cust.status.toLowerCase()}">${cust.status}</span>
            </div>
        </div>
        <div class="form-grid" style="background:var(--bg-main); padding:15px; border-radius:8px; margin-bottom:20px;">
            <div><strong>Email:</strong> ${cust.email}</div>
            <div><strong>Mobile:</strong> ${cust.mobile}</div>
            <div><strong>Address:</strong> ${cust.bldg}, ${cust.street}, ${cust.city}, ${cust.state} - ${cust.pin}, ${cust.country}</div>
            <div><strong>Notes:</strong> ${cust.notes || 'None'}</div>
        </div>
        <h4>Interaction History</h4>
        <div class="table-responsive" style="margin-top:10px;">
            <table class="data-table">
                <thead><tr><th>Type</th><th>Date</th><th>Subject</th><th>Outcome</th></tr></thead>
                <tbody>
                    ${relatedInteractions.map(i => `<tr><td>${i.type}</td><td>${i.datetime.replace('T',' ')}</td><td>${i.subject}</td><td>${i.outcome}</td></tr>`).join('') || '<tr><td colspan="4" style="text-align:center;">No recorded interactions.</td></tr>'}
                </tbody>
            </table>
        </div>
        <div class="modal-footer" style="margin-top:20px;">
            <button class="btn btn-secondary" onclick="closeCustomerProfileModal()">Close</button>
            <button class="btn btn-primary" onclick="openCustomerModal('${cust.id}'); closeCustomerProfileModal();">Edit Profile</button>
        </div>
    `;
    document.getElementById("customer-profile-modal").classList.add("show");
}

function closeCustomerProfileModal() {
    document.getElementById("customer-profile-modal").classList.remove("show");
}

/* ==========================================================
   LEAD MANAGEMENT MODULE
   ========================================================== */

function openLeadModal(editId = null) {
    document.getElementById("lead-form").reset();
    document.getElementById("lead-edit-id").value = "";
    document.getElementById("lead-modal-title").textContent = "Add Sales Lead";

    if (editId) {
        const lead = db.leads.find(l => l.id === editId);
        if (lead) {
            document.getElementById("lead-modal-title").textContent = "Edit Sales Lead";
            document.getElementById("lead-edit-id").value = lead.id;
            document.getElementById("lead-name").value = lead.name;
            document.getElementById("lead-email").value = lead.email;
            document.getElementById("lead-mobile").value = lead.mobile;
            document.getElementById("lead-company").value = lead.company || '';
            document.getElementById("lead-source").value = lead.source;
            document.getElementById("lead-value").value = lead.value;
            document.getElementById("lead-status").value = lead.status;
            document.getElementById("lead-followup").value = lead.followup || '';
            document.getElementById("lead-notes").value = lead.notes || '';
        }
    }
    document.getElementById("lead-modal").classList.add("show");
}

function closeLeadModal() {
    document.getElementById("lead-modal").classList.remove("show");
}

function saveLead(e) {
    e.preventDefault();
    const editId = document.getElementById("lead-edit-id").value;
    const email = document.getElementById("lead-email").value.trim();
    const mobile = document.getElementById("lead-mobile").value.trim();
    const status = document.getElementById("lead-status").value;

    if (!validateEmail(email)) {
        showToast("Please provide a valid email address.", "error");
        return;
    }
    if (!validateMobileIndian(mobile)) {
        showToast("Please provide a valid 10-digit Indian mobile number.", "error");
        return;
    }

    const leadData = {
        id: editId || `LEAD-${Math.floor(500 + Math.random() * 500)}`,
        name: document.getElementById("lead-name").value.trim(),
        email: email,
        mobile: mobile,
        company: document.getElementById("lead-company").value.trim(),
        source: document.getElementById("lead-source").value,
        value: parseFloat(document.getElementById("lead-value").value) || 0,
        status: status,
        assigned: db.currentUser.email,
        date: editId ? (db.leads.find(l => l.id === editId)?.date || new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0],
        followup: document.getElementById("lead-followup").value,
        notes: document.getElementById("lead-notes").value.trim()
    };

    if (status === "Converted") {
        db.customers.push({
            id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
            name: leadData.name,
            email: leadData.email,
            mobile: leadData.mobile,
            company: leadData.company,
            bldg: "Converted Lead Address",
            street: "",
            city: "Bengaluru",
            state: "Karnataka",
            pin: "560001",
            country: "India",
            status: "Active",
            date: new Date().toISOString().split("T")[0],
            notes: `Converted from Lead ID: ${leadData.id}. ${leadData.notes}`
        });
        showToast("Lead successfully converted to Customer!", "success");
    }

    if (editId) {
        const index = db.leads.findIndex(l => l.id === editId);
        if (index !== -1) db.leads[index] = leadData;
        showToast("Lead updated successfully!", "success");
    } else {
        db.leads.push(leadData);
        showToast("Lead added successfully!", "success");
    }

    saveToLocalStorage();
    closeLeadModal();
    renderLeadsTable();
    initDashboard();
}

function renderLeadsTable() {
    const search = (document.getElementById("lead-search")?.value || "").toLowerCase();
    const statusFilter = document.getElementById("lead-status-filter")?.value || "";

    let filtered = db.leads.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(search) || 
                              l.email.toLowerCase().includes(search) || 
                              (l.company && l.company.toLowerCase().includes(search));
        const matchesStatus = statusFilter ? l.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const tbody = document.querySelector("#full-leads-table tbody");
    if (!tbody) return;

    tbody.innerHTML = filtered.map(l => `
        <tr>
            <td><code>${l.id}</code></td>
            <td><strong>${l.name}</strong></td>
            <td>${l.company || 'N/A'}</td>
            <td>${l.source}</td>
            <td>$${l.value.toLocaleString()}</td>
            <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
            <td>${l.followup || 'None'}</td>
            <td>
                <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.8rem;" onclick="openLeadModal('${l.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="deleteLead('${l.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="8" style="text-align:center;">No matching sales leads found.</td></tr>`;
}

function deleteLead(id) {
    if (confirm("Delete this sales lead?")) {
        db.leads = db.leads.filter(l => l.id !== id);
        saveToLocalStorage();
        renderLeadsTable();
        initDashboard();
        showToast("Lead deleted.", "warning");
    }
}

/* ==========================================================
   INTERACTION ACTIVITY LOG MODULE
   ========================================================== */

function openInteractionModal() {
    const selectEl = document.getElementById("int-target");
    selectEl.innerHTML = db.customers.map(c => `<option value="${c.name}">Customer: ${c.name} (${c.company || 'Ind.'})</option>`).join('') +
                         db.leads.map(l => `<option value="${l.name}">Lead: ${l.name} (${l.company || 'Ind.'})</option>`).join('');

    document.getElementById("interaction-form").reset();
    document.getElementById("int-datetime").value = new Date().toISOString().slice(0, 16);
    document.getElementById("interaction-modal").classList.add("show");
}

function closeInteractionModal() {
    document.getElementById("interaction-modal").classList.remove("show");
}

function saveInteraction(e) {
    e.preventDefault();
    const interaction = {
        id: `INT-${Math.floor(900 + Math.random() * 100)}`,
        target: document.getElementById("int-target").value,
        type: document.getElementById("int-type").value,
        datetime: document.getElementById("int-datetime").value,
        subject: document.getElementById("int-subject").value.trim(),
        desc: document.getElementById("int-desc").value.trim(),
        outcome: document.getElementById("int-outcome").value.trim(),
        followup: document.getElementById("int-followup").value,
        user: db.currentUser.email
    };

    db.interactions.push(interaction);
    saveToLocalStorage();
    closeInteractionModal();
    renderInteractionsTable();
    initDashboard();
    showToast("Interaction logged successfully!", "success");
}

function renderInteractionsTable() {
    const search = (document.getElementById("interaction-search")?.value || "").toLowerCase();
    const typeFilter = document.getElementById("interaction-type-filter")?.value || "";

    let filtered = db.interactions.filter(i => {
        const matchesSearch = i.target.toLowerCase().includes(search) || 
                              i.subject.toLowerCase().includes(search) || 
                              (i.outcome && i.outcome.toLowerCase().includes(search));
        const matchesType = typeFilter ? i.type === typeFilter : true;
        return matchesSearch && matchesType;
    });

    const tbody = document.querySelector("#full-interactions-table tbody");
    if (!tbody) return;

    tbody.innerHTML = filtered.map(i => `
        <tr>
            <td><code>${i.id}</code></td>
            <td><strong>${i.target}</strong></td>
            <td>${i.type}</td>
            <td>${i.datetime.replace('T', ' ')}</td>
            <td>${i.subject}</td>
            <td>${i.outcome || 'N/A'}</td>
            <td>${i.followup || 'None'}</td>
            <td>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="deleteInteraction('${i.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="8" style="text-align:center;">No interaction records found.</td></tr>`;
}

function deleteInteraction(id) {
    if (confirm("Delete this interaction record?")) {
        db.interactions = db.interactions.filter(i => i.id !== id);
        saveToLocalStorage();
        renderInteractionsTable();
        initDashboard();
        showToast("Interaction deleted.", "warning");
    }
}

/* ==========================================================
   REPORTS, PDF, EXCEL & DATA IMPORT
   ========================================================== */

function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("NexusCRM - Executive Business Report", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} by ${db.currentUser.name}`, 14, 28);

    doc.autoTable({
        startY: 35,
        head: [['Customer ID', 'Full Name', 'Company', 'Email', 'Mobile', 'Status']],
        body: db.customers.map(c => [c.id, c.name, c.company || 'N/A', c.email, c.mobile, c.status]),
    });

    doc.save(`NexusCRM_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast("PDF Report generated successfully!", "success");
}

function exportCustomersExcel() {
    const worksheet = XLSX.utils.json_to_sheet(db.customers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, "NexusCRM_Customers.xlsx");
    showToast("Customer Excel export complete.", "success");
}

function exportLeadsExcel() {
    const worksheet = XLSX.utils.json_to_sheet(db.leads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "NexusCRM_Leads.xlsx");
    showToast("Leads Excel export complete.", "success");
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = document.getElementById("import-file-type").value;
    const reader = new FileReader();

    reader.onload = function(evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

            let successCount = 0;
            let rejectedCount = 0;

            rows.forEach((row) => {
                const email = row.email || row.Email;
                const mobile = row.mobile || row.Mobile || row.phone;
                const name = row.name || row.Name || row.full_name;

                if (name && validateEmail(email) && validateMobileIndian(String(mobile))) {
                    if (fileType === 'customers') {
                        db.customers.push({
                            id: `CUST-IMP-${Math.floor(100 + Math.random() * 900)}`,
                            name: name,
                            email: email,
                            mobile: String(mobile),
                            company: row.company || row.Company || 'Imported Corp',
                            bldg: row.bldg || 'N/A',
                            street: row.street || 'N/A',
                            city: row.city || 'Bengaluru',
                            state: row.state || 'Karnataka',
                            pin: row.pin || '560001',
                            country: 'India',
                            status: 'Active',
                            date: new Date().toISOString().split("T")[0],
                            notes: 'Imported via Excel/CSV spreadsheet.'
                        });
                    } else {
                        db.leads.push({
                            id: `LEAD-IMP-${Math.floor(100 + Math.random() * 900)}`,
                            name: name,
                            email: email,
                            mobile: String(mobile),
                            company: row.company || 'Imported Corp',
                            source: 'Spreadsheet Import',
                            value: parseFloat(row.value || 5000),
                            status: 'New',
                            assigned: db.currentUser.email,
                            date: new Date().toISOString().split("T")[0],
                            followup: '',
                            notes: 'Imported via spreadsheet.'
                        });
                    }
                    successCount++;
                } else {
                    rejectedCount++;
                }
            });

            saveToLocalStorage();
            document.getElementById("import-feedback").innerHTML = `
                <div style="color:var(--success);">Successfully imported: ${successCount} records.</div>
                <div style="color:var(--danger);">Rejected (invalid email/mobile/name): ${rejectedCount} rows.</div>
            `;
            showToast(`Import completed: ${successCount} added, ${rejectedCount} rejected.`, "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to parse spreadsheet file.", "error");
        }
    };
    reader.readAsArrayBuffer(file);
}

function renderReportsAnalytics() {
    const totalPipelineValue = db.leads.reduce((sum, l) => sum + (l.status !== 'Converted' && l.status !== 'Lost' ? l.value : 0), 0);
    const box = document.getElementById("pipeline-summary-box");
    box.innerHTML = `
        <p><strong>Active Pipeline Deal Value:</strong> $${totalPipelineValue.toLocaleString()}</p>
        <p><strong>Total Registered Customers:</strong> ${db.customers.length}</p>
        <p><strong>Total Leads Tracked:</strong> ${db.leads.length}</p>
        <p><strong>Total Interactions Logged:</strong> ${db.interactions.length}</p>
    `;
}

/* ==========================================================
   USER MANAGEMENT MODULE
   ========================================================== */

function openUserModal() {
    document.getElementById("user-form").reset();
    document.getElementById("user-modal").classList.add("show");
}

function closeUserModal() {
    document.getElementById("user-modal").classList.remove("show");
}

function saveUser(e) {
    e.preventDefault();
    const email = document.getElementById("u-email").value.trim();
    if (!validateEmail(email)) {
        showToast("Invalid user email address.", "error");
        return;
    }

    const newUser = {
        id: `U-${Date.now()}`,
        name: document.getElementById("u-name").value.trim(),
        email: email,
        role: document.getElementById("u-role").value,
        status: document.getElementById("u-status").value
    };

    db.users.push(newUser);
    saveToLocalStorage();
    closeUserModal();
    renderUsersTable();
    showToast("Demonstration user added successfully!", "success");
}

function renderUsersTable() {
    const tbody = document.querySelector("#users-table tbody");
    if (!tbody) return;

    tbody.innerHTML = db.users.map(u => `
        <tr>
            <td><code>${u.id}</code></td>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td><span class="badge badge-new">${u.role}</span></td>
            <td><span class="badge badge-${u.status.toLowerCase()}">${u.status}</span></td>
            <td>
                ${u.email !== 'admin@nexus.com' ? `<button class="btn btn-danger" style="padding:4px 8px; font-size:0.8rem;" onclick="deleteUser('${u.id}')"><i class="fa-solid fa-trash"></i></button>` : 'Protected'}
            </td>
        </tr>
    `).join('');
}

function deleteUser(id) {
    if (confirm("Remove user account?")) {
        db.users = db.users.filter(u => u.id !== id);
        saveToLocalStorage();
        renderUsersTable();
        showToast("User removed.", "warning");
    }
}

/* ==========================================================
   GLOBAL SEARCH & TOAST NOTIFICATIONS
   ========================================================== */

function handleGlobalSearch(query) {
    if (!query || query.length < 2) return;
    const q = query.toLowerCase();
    const match = db.customers.find(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    if (match) {
        switchSection('customers');
        document.getElementById("customer-search").value = match.name;
        renderCustomersTable();
    }
}

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}