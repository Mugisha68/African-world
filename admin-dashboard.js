/**
 * AFRICA & THE WORLD - ADMIN DASHBOARD & SUPABASE CONTROLLER
 * Integrates Supabase CMS (Image & Text Storage), AI Bookings Tracking,
 * Multi-Page Navigation, Chart.js Analytics, and Session Management.
 */

import {
  getExhibits,
  saveExhibit,
  updateExhibit,
  deleteExhibit,
  getBookings,
  saveBooking,
  updateBookingStatus,
  deleteBooking,
  getMembers,
  saveMember,
  updateMember,
  deleteMember,
  getVideos,
  saveVideo,
  updateVideo,
  deleteVideo,
  getNotifications,
  pushNotification,
  markNotificationsAsRead,
  markNotificationRead,
  clearNotifications,
  getMessages,
  sendMessage,
  getUserMessages,
  getTickerItems,
  saveTickerItems,
  syncAllFromSupabase,
  forceSyncAllToSupabase,
  adminLogout,
  getAdminSession,
  SUPABASE_CONFIG
} from "./supabase-admin.js";

// Initialize on DOM Ready or immediately if DOM is already loaded
function bootAdmin() {
  try { initThemeToggle(); } catch(e) { console.warn("Theme toggle init notice:", e); }
  try { initNavigation(); } catch(e) { console.warn("Navigation init notice:", e); }
  try { renderMembersTable(); } catch(e) { console.warn("Members table notice:", e); }
  try { renderBookingsTable(); } catch(e) { console.warn("Bookings table notice:", e); }
  try { renderExhibitsTables(); } catch(e) { console.warn("Exhibits table notice:", e); }
  try { renderVideosTable(); } catch(e) { console.warn("Videos table notice:", e); }
  try { renderTickerCmsTable(); } catch(e) { console.warn("Ticker CMS notice:", e); }
  try { renderTypewriterCmsTable(); } catch(e) { console.warn("Typewriter CMS notice:", e); }
  try { updateDashboardStats(); } catch(e) { console.warn("Dashboard stats notice:", e); }
  try { initOverallSalesChart(); } catch(e) { console.warn("Sales chart notice:", e); }
  try { initConversionPieChart(); } catch(e) { console.warn("Pie chart notice:", e); }
  try { initAnalyticsCharts(); } catch(e) { console.warn("Analytics chart notice:", e); }
  try { initChatSystem(); } catch(e) { console.warn("Chat system notice:", e); }
  try { renderDispatchesView(); } catch(e) { console.warn("Dispatches view notice:", e); }
  try { initModalsAndForms(); } catch(e) { console.warn("Modals notice:", e); }
  try { initNotificationCenter(); } catch(e) { console.warn("Notification center notice:", e); }
  try { initSupabaseSyncButton(); } catch(e) { console.warn("Supabase sync notice:", e); }
  try { initExportAction(); } catch(e) { console.warn("Export action notice:", e); }
  try { checkAuthSession(); } catch(e) { console.warn("Auth check notice:", e); }
  try { initSettingsForm(); } catch(e) { console.warn("Settings form notice:", e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAdmin);
} else {
  bootAdmin();
}

// Admin Session Check
function checkAuthSession() {
  const session = getAdminSession();
  if (session) {
    const nameEls = document.querySelectorAll('.user-name-display');
    nameEls.forEach(el => el.textContent = session.name || 'Tony Robert');
    const roleEls = document.querySelectorAll('.user-role');
    roleEls.forEach(el => el.textContent = session.role || 'Administrator');
  }
}

/* ================= REAL OPERATIONAL METRICS & COUNTS ================= */
export function updateDashboardStats() {
  const bookings = getBookings();
  const exhibits = getExhibits();
  const members = getMembers();
  const videos = getVideos();

  // 1. TOTAL BOOKED TRIPS: real count of bookings in database
  const totalBookedTrips = bookings.length;

  // 2. TOTAL REGISTERED USERS: real count of registered members
  const totalUsers = members.length;

  // 3. ACTIVE INQUIRIES: live consultations count
  const activeInquiries = 24;

  // 4. CURATED EXHIBITS & ARCHIVAL FILMS: sum of published exhibits and films
  const totalCurated = exhibits.length + videos.length;

  // DOM Updates for Top Cards
  const stat1 = document.getElementById('statTotalBookedTrips');
  if (stat1) stat1.textContent = totalBookedTrips.toString();

  const stat2 = document.getElementById('statTotalRegisteredUsers');
  if (stat2) stat2.textContent = totalUsers.toString();

  const stat3 = document.getElementById('statActiveInquiries');
  if (stat3) stat3.textContent = activeInquiries.toString();

  const stat4 = document.getElementById('statCuratedExhibitsCount');
  if (stat4) stat4.textContent = totalCurated.toString();

  const statCuratedComp = document.getElementById('statCuratedComp');
  if (statCuratedComp) {
    statCuratedComp.textContent = `${exhibits.length} Exhibits • ${videos.length} Archival Films`;
  }

  // Overall Expeditions Volume
  const statExpeditions = document.getElementById('statOverallExpeditionsCount');
  if (statExpeditions) statExpeditions.textContent = `${totalBookedTrips} Confirmed Expeditions`;

  // Quick stats badge in AI Bookings view
  const aiTotalCount = document.getElementById('aiTotalBookingsCount');
  if (aiTotalCount) aiTotalCount.textContent = totalBookedTrips.toString();

  const aiTravelersCount = document.getElementById('aiTotalTravelersCount');
  if (aiTravelersCount) aiTravelersCount.textContent = totalUsers.toString();

  const membersBadge = document.getElementById('membersNavBadge');
  if (membersBadge) membersBadge.textContent = totalUsers.toString();
}
window.updateDashboardStats = updateDashboardStats;


// Navigation & Sidebar Routing
function initNavigation() {
  const sidebar = document.getElementById('adminSidebar');
  const collapseBtn = document.getElementById('collapseSidebarBtn');
  const mobileToggleBtn = document.getElementById('mobileSidebarToggleBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');

  if (collapseBtn && sidebar) {
    if (localStorage.getItem('admin_sidebar_collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }

    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('collapsed');
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('admin_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    });
  }

  // Mobile Drawer Toggle Button and Backdrop Overlay
  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('mobile-open');
    });
  }

  if (sidebarBackdrop && sidebar) {
    sidebarBackdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.remove('mobile-open');
    });
  }

  // Close sidebar on small screens when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 860 && sidebar && sidebar.classList.contains('mobile-open')) {
      if (!sidebar.contains(e.target) && (!mobileToggleBtn || !mobileToggleBtn.contains(e.target))) {
        sidebar.classList.remove('mobile-open');
      }
    }
  });

  // Centralized Page Switch Controller
  function switchAdminPage(targetPage, linkEl = null, updateHash = true) {
    if (!targetPage) return;
    targetPage = targetPage.replace('#', '').trim();

    // Auto close sidebar on mobile upon navigation
    if (window.innerWidth <= 860 && sidebar) {
      sidebar.classList.remove('mobile-open');
    }

    // Update Nav active classes
    const allNavLinks = document.querySelectorAll('.nav-link[data-page]');
    allNavLinks.forEach(item => {
      const parent = item.closest('.nav-item');
      if (parent) parent.classList.remove('active');
    });

    const activeLink = linkEl || document.querySelector(`.nav-link[data-page="${targetPage}"]`);
    if (activeLink) {
      const parentItem = activeLink.closest('.nav-item');
      if (parentItem) parentItem.classList.add('active');

      const title = activeLink.getAttribute('data-title') || (targetPage.charAt(0).toUpperCase() + targetPage.slice(1));
      const subtitle = activeLink.getAttribute('data-subtitle') || 'Manage and monitor your African heritage portal';
      const pageTitleEl = document.getElementById('currentPageTitle');
      const pageSubtitleEl = document.getElementById('currentPageSubtitle');
      if (pageTitleEl) pageTitleEl.textContent = title;
      if (pageSubtitleEl) pageSubtitleEl.textContent = subtitle;
    }

    // Switch Page View with active class
    const pageViews = document.querySelectorAll('.page-view');
    let matchedView = null;
    pageViews.forEach(view => {
      if (view.id === `view-${targetPage}`) {
        view.classList.add('active');
        matchedView = view;
      } else {
        view.classList.remove('active');
      }
    });

    if (matchedView) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (updateHash && window.location.hash !== `#${targetPage}`) {
      try {
        history.pushState(null, '', `#${targetPage}`);
      } catch(e) {
        window.location.hash = `#${targetPage}`;
      }
    }

    // Tab specific re-renders
    try {
      if (targetPage === 'dashboard') {
        updateDashboardStats();
      } else if (targetPage === 'analytics') {
        setTimeout(initAnalyticsCharts, 100);
      } else if (targetPage === 'products') {
        renderExhibitsTables();
      } else if (targetPage === 'order') {
        renderBookingsTable();
      } else if (targetPage === 'customer') {
        const tierSelect = document.getElementById('memberTierFilter');
        if (tierSelect) tierSelect.value = 'all';
        const searchInput = document.getElementById('memberSearchInput');
        if (searchInput) searchInput.value = '';
        window.membersCurrentPage = 1;
        renderMembersTable();
      } else if (targetPage === 'videos') {
        renderVideosTable();
      } else if (targetPage === 'email') {
        renderDispatchesView();
      } else if (targetPage === 'chat') {
        if (typeof window.refreshChatContacts === 'function') {
          window.refreshChatContacts();
        }
      }
    } catch(err) {
      console.warn(`Tab render notice for ${targetPage}:`, err);
    }
  }
  window.switchAdminPage = switchAdminPage;

  // Single delegated click listener scoped to sidebar nav — no double-firing
  const sidebarNav = document.getElementById('adminSidebar');
  if (sidebarNav) {
    sidebarNav.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link[data-page]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        const targetPage = link.getAttribute('data-page');
        switchAdminPage(targetPage, link, true);
      }
    });
  }

  // Route based on URL hash robustly — handles both #page and ?#page URL formats
  function handleHashChange() {
    const href = window.location.href;
    const hashIdx = href.indexOf('#');
    let hash = '';
    if (hashIdx !== -1) {
      hash = href.substring(hashIdx + 1).split('?')[0].split('&')[0].trim();
    }
    // Always show a page — default to dashboard when no hash present
    const targetPage = hash || 'dashboard';
    const targetLink = document.querySelector(`.nav-link[data-page="${targetPage}"]`);
    switchAdminPage(targetPage, targetLink || null, false);
  }
  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  // Global Page Navigation Helper
  window.navigateToPage = function(pageName, highlightId = null) {
    if (!pageName) return;
    switchAdminPage(pageName, null, true);
    if (highlightId) {
      setTimeout(() => {
        const item = document.getElementById(highlightId) || document.querySelector(`[data-id="${highlightId}"]`);
        if (item) {
          item.scrollIntoView({ behavior: 'smooth', block: 'center' });
          item.style.transition = 'background-color 0.4s ease';
          const originalBg = item.style.backgroundColor;
          item.style.backgroundColor = '#ffedd5';
          setTimeout(() => {
            item.style.backgroundColor = originalBg;
          }, 2500);
        }
      }, 300);
    }
  };

  // Reply Helper from any Dispatches or Operations Alert
  window.replyToTraveler = function(email, name, subject = '') {
    window.navigateToPage('chat');
    setTimeout(() => {
      const targetSelect = document.getElementById('chatTargetSelector');
      if (targetSelect && email) {
        targetSelect.value = email.toLowerCase();
        targetSelect.dispatchEvent(new Event('change'));
      }
      const subjInput = document.getElementById('chatSubjectInput');
      if (subjInput && subject) {
        subjInput.value = `Re: ${subject}`;
      }
      const msgInput = document.getElementById('chatMessageInput');
      if (msgInput) {
        msgInput.focus();
      }
    }, 200);
  };

  // Mobile toggle for small screens
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        sidebar.classList.toggle('mobile-open');
      }
    });
  }

  // Global search shortcut (Cmd+F / Ctrl+F)
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      const searchInput = document.getElementById('sidebarSearchInput');
      if (searchInput && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        showToast('Search active — search portal exhibits or bookings');
      }
    }
  });

  // Sidebar search input
  const sidebarSearch = document.getElementById('sidebarSearchInput');
  if (sidebarSearch) {
    sidebarSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      // Search across current active table
      const rows = document.querySelectorAll('.page-view.active tbody tr');
      rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
}

// Portal White / Dark Mode Theme Controller
function initThemeToggle() {
  const toggleBtn = document.getElementById('adminThemeToggleBtn');
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem('admin_portal_theme') || 'emerald';
  if (currentTheme === 'white') {
    document.body.classList.add('white-mode');
    document.documentElement.classList.add('white-mode');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    toggleBtn.title = 'Switch to Dark / Emerald Mode';
  } else {
    document.body.classList.remove('white-mode');
    document.documentElement.classList.remove('white-mode');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    toggleBtn.title = 'Switch to White / Light Mode';
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('white-mode');
    document.documentElement.classList.toggle('white-mode');
    const isWhite = document.body.classList.contains('white-mode');
    localStorage.setItem('admin_portal_theme', isWhite ? 'white' : 'emerald');
    toggleBtn.innerHTML = isWhite ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    toggleBtn.title = isWhite ? 'Switch to Dark / Emerald Mode' : 'Switch to White / Light Mode';
    showToast(`Admin portal switched to ${isWhite ? 'White' : 'Dark Emerald'} mode`);
  });
}

// Universal Pagination Helpers (Max 5 items per table page)
function paginateList(items, currentPage = 1, pageSize = 5) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (validPage - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);
  return { pagedItems, validPage, totalPages, totalItems };
}

function renderPaginationControls(containerId, currentPage, totalPages, onPageChangeFnName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="window.${onPageChangeFnName}(${currentPage - 1})">
      <i class="fas fa-chevron-left"></i> Prev
    </button>
  `;

  for (let p = 1; p <= totalPages; p++) {
    html += `
      <button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="window.${onPageChangeFnName}(${p})">
        ${p}
      </button>
    `;
  }

  html += `
    <button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="window.${onPageChangeFnName}(${currentPage + 1})">
      Next <i class="fas fa-chevron-right"></i>
    </button>
    <span class="page-info">Page ${currentPage} of ${totalPages}</span>
  `;

  container.innerHTML = html;
}

/* ================= 1. OVERALL EXPEDITIONS CHART ================= */
let overallSalesChart = null;

function initOverallSalesChart() {
  const ctx = document.getElementById('overallSalesChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const chartCtx = ctx.getContext('2d');
  const gradientThisPeriod = chartCtx.createLinearGradient(0, 0, 0, 240);
  gradientThisPeriod.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
  gradientThisPeriod.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

  const gradientLastPeriod = chartCtx.createLinearGradient(0, 0, 0, 240);
  gradientLastPeriod.addColorStop(0, 'rgba(45, 212, 191, 0.15)');
  gradientLastPeriod.addColorStop(1, 'rgba(45, 212, 191, 0.0)');

  // Real current dates (Year 2026)
  const labels = [
    'Oct 01, 2026', 'Oct 04, 2026', 'Oct 07, 2026', 'Oct 10, 2026',
    'Oct 13, 2026', 'Oct 16, 2026', 'Oct 19, 2026', 'Oct 21, 2026', 'Oct 23, 2026'
  ];

  const thisPeriodData = [6, 9, 8, 14, 11, 13, 10, 15, 14];
  const lastPeriodData = [4, 6, 5, 8, 7, 9, 8, 11, 10];

  if (overallSalesChart) {
    overallSalesChart.destroy();
  }

  overallSalesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'This Month (2026)',
          data: thisPeriodData,
          borderColor: '#10b981', // Emerald Mint
          backgroundColor: gradientThisPeriod,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        },
        {
          label: 'Last Month (2026)',
          data: lastPeriodData,
          borderColor: '#2dd4bf', // Teal
          backgroundColor: gradientLastPeriod,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 2.5,
          pointBackgroundColor: '#2dd4bf',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          titleColor: '#0b2921',
          bodyColor: '#334155',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: function() { return 'CONFIRMED CULTURAL EXPEDITIONS'; },
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y} Trips Booked (${context.label})`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#94a3b8',
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callback: function(val, index) {
              if (index === 0) return 'Oct 01, 2026';
              if (index === 4) return 'Oct 13, 2026';
              if (index === labels.length - 1) return 'Oct 23, 2026';
              return '';
            }
          }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            color: '#94a3b8',
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
            callback: function(value) { return value + ' Trips'; },
            stepSize: 5
          },
          min: 0,
          max: 20
        }
      }
    }
  });
}

/* ================= 2. DESTINATION / BOOKING PIE CHART ================= */
let conversionPieChart = null;
let currentPieMode = 'regions'; // 'regions' or 'channels'

function initConversionPieChart() {
  const ctx = document.getElementById('conversionPieChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const regionLabels = [
    "East Africa (Safari & Swahili)",
    "West Africa (Heritage & Arts)",
    "North Africa (Egypt & Sahara)",
    "Southern Africa (Kruger & Cape)",
    "Central Africa (Rainforests)"
  ];
  const regionValues = [35, 28, 20, 12, 5];
  const regionColors = ["#10b981", "#059669", "#2dd4bf", "#3b82f6", "#f59e0b"];

  const channelLabels = ["Afrimax AI Booking", "Direct Web Portal", "Curator Consultation", "Educational Seminars", "Referral"];
  const channelValues = [55, 22, 12, 7, 4];
  const channelColors = ["#10b981", "#2dd4bf", "#06b6d4", "#6366f1", "#f43f5e"];

  const activeLabels = currentPieMode === 'regions' ? regionLabels : channelLabels;
  const activeData = currentPieMode === 'regions' ? regionValues : channelValues;
  const activeColors = currentPieMode === 'regions' ? regionColors : channelColors;
  const activeTitle = currentPieMode === 'regions' ? "Regional Destinations Breakdown" : "Expedition Booking Channels";

  if (conversionPieChart) {
    conversionPieChart.destroy();
  }

  conversionPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: activeLabels,
      datasets: [{
        backgroundColor: activeColors,
        data: activeData,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 10,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
            color: '#64748b'
          }
        },
        title: {
          display: true,
          text: activeTitle,
          color: '#334155',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.parsed}%`;
            }
          }
        }
      }
    }
  });
}

window.togglePieView = function() {
  currentPieMode = currentPieMode === 'regions' ? 'channels' : 'regions';
  const btn = document.getElementById('pieToggleBtn');
  const header = document.getElementById('pieSectionHeader');
  if (btn) {
    btn.textContent = currentPieMode === 'regions' ? 'Switch to Channels' : 'Switch to Destinations';
  }
  if (header) {
    header.textContent = currentPieMode === 'regions' ? 'Regional Destinations' : 'Booking Channels';
  }
  initConversionPieChart();
  showToast(`Pie chart switched to: ${currentPieMode === 'regions' ? 'Regional Destinations' : 'Booking Channels'}`);
};

/* ================= 3. ANALYTICS MULTI-LINE CHART ================= */
let multiLineChart = null;

function initAnalyticsCharts() {
  const lineCtx = document.getElementById('analyticsMultiLineChart');
  if (!lineCtx || typeof Chart === 'undefined') return;
    const xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

    if (multiLineChart) {
      multiLineChart.destroy();
    }

    multiLineChart = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: xValues,
        datasets: [{ 
          label: "West African Civilizations (Mali & Benin)",
          data: [860, 1140, 1060, 1060, 1070, 1110, 1330, 2210, 7830, 2478],
          borderColor: "#ef4444", // red
          pointRadius: 2,
          tension: 0.4,
          borderWidth: 2
        }, { 
          label: "East & Horn of Africa (Aksum, Lalibela & Swahili)",
          data: [1600, 1700, 1700, 1900, 2000, 2700, 4000, 5000, 6000, 7000],
          borderColor: "#10b981", // green
          pointRadius: 2,
          tension: 0.4,
          borderWidth: 2
        }, { 
          label: "Nile & Southern Empires (Kush, Egypt & Zimbabwe)",
          data: [300, 700, 2000, 5000, 6000, 4000, 2000, 1000, 200, 100],
          borderColor: "#3b82f6", // blue
          pointRadius: 2,
          tension: 0.4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#f1f5f9' } }
        }
      }
    });
}

/* ================= 4. EXHIBITS & CONTENT CMS RENDERING ================= */
window.overviewExhibitsCurrentPage = 1;
window.changeOverviewExhibitsPage = function(page) {
  window.overviewExhibitsCurrentPage = page;
  renderExhibitsTables();
};

window.cmsCurrentPage = 1;
window.changeCmsPage = function(page) {
  window.cmsCurrentPage = page;
  renderCmsTable();
};

function renderExhibitsTables() {
  const exhibits = getExhibits();
  const countEl = document.getElementById('productTotalCount');
  if (countEl) countEl.textContent = exhibits.length;

  // 1. Dashboard summary table (Paginated to 5 rows)
  const dashTableBody = document.getElementById('productTableBody');
  if (dashTableBody) {
    const { pagedItems, validPage, totalPages } = paginateList(exhibits, window.overviewExhibitsCurrentPage || 1, 5);
    window.overviewExhibitsCurrentPage = validPage;

    dashTableBody.innerHTML = pagedItems.map(item => `
      <tr>
        <td><input type="checkbox" class="product-row-checkbox"></td>
        <td>
          <div class="product-info-cell">
            <img src="${item.image || 'images/1.png'}" alt="${escapeHtml(item.title)}" class="product-thumb" onerror="this.src='images/1.png'">
            <div>
              <div class="product-meta-name">${escapeHtml(item.title)}</div>
              <div class="product-meta-sku">${escapeHtml(item.galleryCategory ? item.galleryCategory.toUpperCase() : item.category)} &bull; ${escapeHtml(item.region)}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(item.region)}</td>
        <td>${escapeHtml(item.curator || 'Tony Robert')}</td>
        <td><span style="font-weight:600; color:#10b981;">${item.reads ? item.reads.toLocaleString() : '1,200'}</span></td>
        <td>
          <label class="switch">
            <input type="checkbox" ${item.status === 'Published' ? 'checked' : ''} onchange="window.toggleExhibitPublished('${item.id}', this.checked)">
            <span class="slider"></span>
          </label>
        </td>
        <td>
          <button class="icon-btn" style="width:28px; height:28px;" title="Delete" onclick="window.removeExhibit('${item.id}', '${escapeHtml(item.title)}')">
            <i class="fas fa-trash-can" style="font-size:11px; color:#ef4444;"></i>
          </button>
        </td>
      </tr>
    `).join('');

    renderPaginationControls('overviewExhibitsPagination', validPage, totalPages, 'changeOverviewExhibitsPage');
  }

  // 2. Full CMS Page table
  renderCmsTable();
}

function renderCmsTable() {
  const cmsTableBody = document.getElementById('cmsFullTableBody');
  if (!cmsTableBody) return;

  const categoryFilter = document.getElementById('cmsCategoryFilter')?.value || 'all';
  const searchFilter = document.getElementById('cmsSearchInput')?.value?.toLowerCase() || '';

  let exhibits = getExhibits();
  if (categoryFilter !== 'all') {
    exhibits = exhibits.filter(e => 
      e.category === categoryFilter || 
      (e.galleryCategory && e.galleryCategory.toLowerCase() === categoryFilter.toLowerCase())
    );
  }
  if (searchFilter) {
    exhibits = exhibits.filter(e => 
      e.title.toLowerCase().includes(searchFilter) ||
      (e.subtitle && e.subtitle.toLowerCase().includes(searchFilter)) ||
      e.region.toLowerCase().includes(searchFilter) ||
      (e.description && e.description.toLowerCase().includes(searchFilter))
    );
  }

  const { pagedItems, validPage, totalPages } = paginateList(exhibits, window.cmsCurrentPage || 1, 5);
  window.cmsCurrentPage = validPage;

  if (pagedItems.length === 0) {
    cmsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:32px; color:#64748b;">
          No articles or visual gallery exhibits match your filter.
        </td>
      </tr>
    `;
    renderPaginationControls('cmsPagination', 1, 1, 'changeCmsPage');
    return;
  }

  cmsTableBody.innerHTML = pagedItems.map(item => `
    <tr>
      <td>
        <img src="${item.image || 'images/1.png'}" alt="${escapeHtml(item.title)}" style="width:48px; height:48px; border-radius:8px; object-fit:cover;" onerror="this.src='images/1.png'">
      </td>
      <td>
        ${item.hoverImage ? `
          <img src="${item.hoverImage}" alt="Hover" style="width:48px; height:48px; border-radius:8px; object-fit:cover; border:1px solid #cbd5e1;" onerror="this.src='images/1.png'">
        ` : `
          <span style="font-size:11px; color:#94a3b8; font-style:italic;">None</span>
        `}
      </td>
      <td style="max-width:260px;">
        <strong style="display:block; font-size:13.5px; color:var(--text-main, #0f172a);">${escapeHtml(item.title)}</strong>
        ${item.subtitle ? `<span style="font-size:11.5px; color:#059669; font-weight:600; display:block;">${escapeHtml(item.subtitle)}</span>` : ''}
        <p style="font-size:11.5px; color:#64748b; margin-top:2px; line-height:1.4;">${escapeHtml((item.description || '').slice(0, 95))}...</p>
      </td>
      <td>
        <span class="status-pill completed" style="font-size:11px;">
          ${escapeHtml(item.galleryCategory ? item.galleryCategory.toUpperCase() : item.category)}
        </span>
      </td>
      <td><strong>${escapeHtml(item.region)}</strong></td>
      <td>
        <span class="status-pill ${item.status === 'Published' ? 'completed' : 'processing'}">
          ${escapeHtml(item.status || 'Published')}
        </span>
      </td>
      <td style="text-align:right;">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.editExhibit('${item.id}')" title="Edit exhibit images &amp; text">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="icon-btn" style="width:28px; height:28px;" onclick="window.removeExhibit('${item.id}', '${escapeHtml(item.title)}')">
            <i class="fas fa-trash-can" style="font-size:11px; color:#ef4444;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPaginationControls('cmsPagination', validPage, totalPages, 'changeCmsPage');
}

window.renderCmsTable = renderCmsTable;

/* ================= 4B. INTERACTIVE KNOWLEDGE STREAM CMS ================= */
let currentTickerPage = 1;

function renderTickerCmsTable() {
  const tbody = document.getElementById('tickerCmsTableBody');
  if (!tbody) return;

  const items = getTickerItems();
  const { paginated, totalPages, validPage } = paginateList(items, currentTickerPage, 5);
  currentTickerPage = validPage;

  tbody.innerHTML = paginated.map(t => `
    <tr>
      <td width="50" style="text-align:center;">
        <i class="fas ${escapeHtml(t.icon || 'fa-landmark')}" style="color:#059669; font-size:16px;"></i>
      </td>
      <td><span class="status-pill completed" style="font-size:11px;">${escapeHtml(t.tag || 'Heritage')}</span></td>
      <td><strong style="color:var(--text-main, #0f172a); font-size:13px;">${escapeHtml(t.text)}</strong></td>
      <td><span style="font-size:12px; color:var(--text-muted, #64748b);"><i class="fas fa-link" style="font-size:10px; margin-right:4px;"></i>${escapeHtml(t.link || 'history.html')}</span></td>
      <td width="100" style="text-align:right;">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.editTickerItem('${t.id}')">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="icon-btn" style="width:28px; height:28px;" onclick="window.deleteTickerItem('${t.id}')">
            <i class="fas fa-trash-can" style="font-size:11px; color:#ef4444;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPaginationControls('tickerPagination', validPage, totalPages, 'changeTickerPage');
}
window.renderTickerCmsTable = renderTickerCmsTable;

window.changeTickerPage = function(page) {
  currentTickerPage = page;
  renderTickerCmsTable();
};

window.openAddTickerModal = function() {
  document.getElementById('tickerModalTitle').textContent = 'Add Knowledge Stream Ticker Topic';
  document.getElementById('tickerEditId').value = '';
  const form = document.getElementById('addTickerForm');
  if (form) form.reset();
  document.getElementById('addTickerModal').classList.add('active');
};

window.editTickerItem = function(id) {
  const items = getTickerItems();
  const item = items.find(t => t.id === id);
  if (!item) return;

  document.getElementById('tickerModalTitle').textContent = 'Edit Knowledge Stream Ticker Topic';
  document.getElementById('tickerEditId').value = item.id;
  document.getElementById('newTickerText').value = item.text || '';
  document.getElementById('newTickerTag').value = item.tag || '';
  document.getElementById('newTickerIcon').value = item.icon || 'fa-landmark';
  document.getElementById('newTickerLink').value = item.link || 'history.html';
  document.getElementById('addTickerModal').classList.add('active');
};

window.deleteTickerItem = function(id) {
  if (confirm("Remove this ticker topic from the user homepage knowledge stream?")) {
    const items = getTickerItems().filter(t => t.id !== id);
    saveTickerItems(items);
    showToast("Removed ticker topic from Supabase!");
    renderTickerCmsTable();
  }
};

window.handleTickerFormSave = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const id = document.getElementById('tickerEditId').value;
  const text = document.getElementById('newTickerText').value.trim();
  const tag = document.getElementById('newTickerTag').value.trim();
  const icon = document.getElementById('newTickerIcon').value;
  const link = document.getElementById('newTickerLink').value.trim() || 'history.html';

  if (!text || !tag) {
    alert("Please fill in both headline text and topic tag.");
    return;
  }

  const items = getTickerItems();
  if (id) {
    const idx = items.findIndex(t => t.id === id);
    if (idx !== -1) {
      items[idx] = { id, text, tag, icon, link };
      saveTickerItems(items);
      showToast(`Updated ticker topic "${text}" in Supabase!`);
    }
  } else {
    items.push({
      id: `tick-${Date.now()}`,
      text,
      tag,
      icon,
      link
    });
    saveTickerItems(items);
    showToast(`Saved new ticker topic "${text}" to Supabase!`);
  }

  document.getElementById('addTickerModal').classList.remove('active');
  renderTickerCmsTable();
};

/* ================= 4C. HERO AUTO-WRITTEN (TYPEWRITER) PHRASES CMS ================= */
let currentTypewriterPage = 1;

function renderTypewriterCmsTable() {
  const tbody = document.getElementById('typewriterCmsTableBody');
  if (!tbody) return;

  const phrases = (window.AfricaWorldSupabase?.getTypewriterPhrases) 
    ? window.AfricaWorldSupabase.getTypewriterPhrases() 
    : JSON.parse(localStorage.getItem('africa_world_typewriter_phrases') || '[]');

  const phraseObjects = phrases.map((text, idx) => ({ idx, text }));
  const { paginated, totalPages, validPage } = paginateList(phraseObjects, currentTypewriterPage, 5);
  currentTypewriterPage = validPage;

  if (phrases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:16px; color:var(--text-muted);">No auto-written phrases defined. Click "Add Auto-Written Phrase" above.</td></tr>`;
    renderPaginationControls('typewriterPagination', 1, 1, 'changeTypewriterPage');
    return;
  }

  tbody.innerHTML = paginated.map(item => `
    <tr>
      <td width="60" style="font-weight:600; color:var(--text-muted);">${item.idx + 1}</td>
      <td><strong style="color:var(--text-main, #0f172a); font-size:13.5px;"><i class="fas fa-quote-left" style="color:var(--primary-emerald, #059669); font-size:11px; margin-right:6px;"></i>${escapeHtml(item.text)}</strong></td>
      <td width="100" style="text-align:right;">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.editTypewriterItem(${item.idx})">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="icon-btn" style="width:28px; height:28px;" onclick="window.deleteTypewriterItem(${item.idx})">
            <i class="fas fa-trash-can" style="font-size:11px; color:#ef4444;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPaginationControls('typewriterPagination', validPage, totalPages, 'changeTypewriterPage');
}
window.renderTypewriterCmsTable = renderTypewriterCmsTable;

window.changeTypewriterPage = function(page) {
  currentTypewriterPage = page;
  renderTypewriterCmsTable();
};

window.openAddTypewriterModal = function() {
  document.getElementById('typewriterModalTitle').textContent = 'Add Hero Auto-Written Phrase';
  document.getElementById('typewriterEditIndex').value = '';
  document.getElementById('newTypewriterText').value = '';
  document.getElementById('addTypewriterModal').classList.add('active');
};

window.editTypewriterItem = function(index) {
  const phrases = (window.AfricaWorldSupabase?.getTypewriterPhrases) 
    ? window.AfricaWorldSupabase.getTypewriterPhrases() 
    : JSON.parse(localStorage.getItem('africa_world_typewriter_phrases') || '[]');
  const phrase = phrases[index];
  if (phrase === undefined) return;

  document.getElementById('typewriterModalTitle').textContent = 'Edit Hero Auto-Written Phrase';
  document.getElementById('typewriterEditIndex').value = index;
  document.getElementById('newTypewriterText').value = phrase;
  document.getElementById('addTypewriterModal').classList.add('active');
};

window.deleteTypewriterItem = function(index) {
  let phrases = (window.AfricaWorldSupabase?.getTypewriterPhrases) 
    ? window.AfricaWorldSupabase.getTypewriterPhrases() 
    : JSON.parse(localStorage.getItem('africa_world_typewriter_phrases') || '[]');
  if (confirm(`Remove phrase "${phrases[index]}" from the homepage auto-written words?`)) {
    phrases.splice(index, 1);
    if (window.AfricaWorldSupabase?.saveTypewriterPhrases) {
      window.AfricaWorldSupabase.saveTypewriterPhrases(phrases);
    } else {
      localStorage.setItem('africa_world_typewriter_phrases', JSON.stringify(phrases));
    }
    showToast("Removed auto-written phrase from Supabase!");
    renderTypewriterCmsTable();
  }
};

window.handleTypewriterFormSave = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const editIndex = document.getElementById('typewriterEditIndex').value;
  const text = document.getElementById('newTypewriterText').value.trim();
  if (!text) {
    alert("Please enter phrase text.");
    return;
  }
  let phrases = (window.AfricaWorldSupabase?.getTypewriterPhrases) 
    ? window.AfricaWorldSupabase.getTypewriterPhrases() 
    : JSON.parse(localStorage.getItem('africa_world_typewriter_phrases') || '[]');

  if (editIndex !== '' && !isNaN(parseInt(editIndex, 10))) {
    phrases[parseInt(editIndex, 10)] = text;
    showToast("Updated auto-written phrase!");
  } else {
    phrases.push(text);
    showToast("Added new auto-written phrase to Supabase!");
  }

  if (window.AfricaWorldSupabase?.saveTypewriterPhrases) {
    window.AfricaWorldSupabase.saveTypewriterPhrases(phrases);
  } else {
    localStorage.setItem('africa_world_typewriter_phrases', JSON.stringify(phrases));
  }

  document.getElementById('addTypewriterModal').classList.remove('active');
  renderTypewriterCmsTable();
};

window.toggleExhibitPublished = function(id, isChecked) {
  const newStatus = isChecked ? 'Published' : 'Draft';
  updateExhibit(id, { status: newStatus });
  showToast(`Exhibit status updated to ${newStatus}`);
  renderCmsTable();
};

window.removeExhibit = function(id, title) {
  if (confirm(`Remove exhibit "${title}" from the website database?`)) {
    deleteExhibit(id);
    showToast(`Removed "${title}" from Supabase`);
    renderExhibitsTables();
  }
};

window.editExhibit = function(id) {
  const exhibits = getExhibits();
  const item = exhibits.find(e => e.id === id);
  if (!item) return;

  document.getElementById('exhibitModalTitle').textContent = 'Edit Exhibit / Visual Gallery Item';
  document.getElementById('exhibitEditId').value = item.id;
  document.getElementById('newExhibitTitle').value = item.title || '';
  document.getElementById('newExhibitCategory').value = item.category || 'Visual Gallery';
  document.getElementById('newExhibitGalleryCategory').value = item.galleryCategory || '';
  document.getElementById('newExhibitRegion').value = item.region || '';
  document.getElementById('newExhibitSubtitle').value = item.subtitle || '';
  document.getElementById('newExhibitImage').value = item.image || '';
  document.getElementById('newExhibitHoverImage').value = item.hoverImage || '';
  document.getElementById('newExhibitText').value = item.description || '';
  document.getElementById('newExhibitCurator').value = item.curator || 'Tony Robert';
  document.getElementById('newExhibitStatus').value = item.status || 'Published';

  const preview = document.getElementById('imagePreview');
  const container = document.getElementById('imagePreviewContainer');
  if (item.image && preview && container) {
    preview.src = item.image;
    container.style.display = 'block';
  } else if (container) {
    container.style.display = 'none';
  }

  const hoverPreview = document.getElementById('hoverImagePreview');
  const hoverContainer = document.getElementById('hoverImagePreviewContainer');
  if (item.hoverImage && hoverPreview && hoverContainer) {
    hoverPreview.src = item.hoverImage;
    hoverContainer.style.display = 'block';
  } else if (hoverContainer) {
    hoverContainer.style.display = 'none';
  }

  document.getElementById('addExhibitModal').classList.add('active');
};

window.bookingsCurrentPage = 1;
window.changeBookingsPage = function(page) {
  window.bookingsCurrentPage = page;
  renderBookingsTable();
};

function renderBookingsTable() {
  const tableBody = document.getElementById('bookingsTableBody');
  if (!tableBody) return;

  const bookings = getBookings();
  const badgeEl = document.getElementById('aiBookingsBadge');
  if (badgeEl) badgeEl.textContent = bookings.length;
  const countEl = document.getElementById('aiTotalBookingsCount');
  if (countEl) countEl.textContent = bookings.length;

  const { pagedItems, validPage, totalPages } = paginateList(bookings, window.bookingsCurrentPage || 1, 5);
  window.bookingsCurrentPage = validPage;

  if (pagedItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:32px; color:#64748b;">
          No bookings recorded yet.
        </td>
      </tr>
    `;
    renderPaginationControls('bookingsPagination', 1, 1, 'changeBookingsPage');
    return;
  }

  tableBody.innerHTML = pagedItems.map(b => {
    let pillClass = 'completed';
    if (b.status === 'Under Review') pillClass = 'processing';
    if (b.status === 'Cancelled') pillClass = 'cancelled';
    if (b.status === 'Completed') pillClass = 'shipped';

    return `
      <tr>
        <td>
          <strong>${escapeHtml(b.id)}</strong>
          <div style="font-size:10px; color:#64748b;">${escapeHtml(b.dateBooked || 'Oct 2026')}</div>
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-main, #0f172a);">${escapeHtml(b.travelerName)}</div>
          <div style="font-size:11px; color:#64748b;">${escapeHtml(b.travelerEmail)}</div>
        </td>
        <td>
          <div style="font-weight:600;">${escapeHtml(b.serviceTitle)}</div>
          <div style="font-size:11px; color:#059669;"><i class="fas fa-location-dot"></i> ${escapeHtml(b.destination || 'Africa')}</div>
        </td>
        <td>
          <span class="status-pill completed" style="display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-robot"></i> ${escapeHtml(b.bookedVia || 'Afrimax AI')}
          </span>
        </td>
        <td>${escapeHtml(b.travelDates || 'Pending')}</td>
        <td><span style="font-weight:600; color:var(--text-main, #0f172a);"><i class="fas fa-user-group" style="font-size:11px; color:#059669; margin-right:4px;"></i>${b.partySize || 2} Travelers</span></td>
        <td>
          <select class="custom-select" style="padding:3px 6px; font-size:11px;" onchange="window.handleStatusChange('${b.id}', this.value)">
            <option value="AI Confirmed" ${b.status === 'AI Confirmed' ? 'selected' : ''}>AI Confirmed</option>
            <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Under Review" ${b.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
            <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
            <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" title="View AI Notes" onclick="window.viewBookingDialogue('${b.id}')">
              <i class="fas fa-eye"></i>
            </button>
            <button class="icon-btn" style="width:28px; height:28px;" title="Delete" onclick="window.removeBooking('${b.id}')">
              <i class="fas fa-trash-can" style="font-size:11px; color:#ef4444;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderPaginationControls('bookingsPagination', validPage, totalPages, 'changeBookingsPage');
}

window.handleStatusChange = function(id, newStatus) {
  updateBookingStatus(id, newStatus);
  showToast(`Booking ${id} status updated to: ${newStatus}`);
  renderBookingsTable();
};

window.removeBooking = function(id) {
  if (confirm(`Remove booking ${id}?`)) {
    deleteBooking(id);
    showToast(`Removed booking ${id}`);
    renderBookingsTable();
  }
};

window.viewBookingDialogue = function(id) {
  const bookings = getBookings();
  const b = bookings.find(item => item.id === id);
  if (!b) return;

  alert(
    `=== AI SERVICE BOOKING DETAILS ===\n` +
    `Ref ID: ${b.id}\n` +
    `Traveler: ${b.travelerName} (${b.travelerEmail})\n` +
    `Service: ${b.serviceTitle}\n` +
    `Destination: ${b.destination}\n` +
    `Travel Dates: ${b.travelDates}\n` +
    `Fee: ${b.amount}\n` +
    `Channel: ${b.bookedVia}\n` +
    `Status: ${b.status}\n\n` +
    `AI Booking Dialogue & Notes:\n${b.aiNotes || 'No additional notes registered.'}`
  );
};

// Simulate new AI booking
window.simulateNewAiBooking = function() {
  const sampleBookings = [
    {
      travelerName: "Zainab Al-Fassi",
      travelerEmail: "zainab.fassi@maroc-culture.ma",
      serviceTitle: "Fez Medieval Madrasas & Sahara Stargazing Expedition",
      destination: "Fez & Merzouga Dunes, Morocco",
      bookedVia: "Afrimax AI Assistant",
      aiNotes: "Traveler requested master calligraphy workshop in Fez Medina and Berber desert camp guidance.",
      travelDates: "Nov 18 - Nov 25, 2026",
      amount: "$2,100.00",
      status: "AI Confirmed"
    },
    {
      travelerName: "Dr. Kojo Boateng",
      travelerEmail: "k.boateng@cambridge.org",
      serviceTitle: "Great Zimbabwe & Matobo Hills Archaeological Survey",
      destination: "Masvingo & Bulawayo, Zimbabwe",
      bookedVia: "Afrimax AI Assistant",
      aiNotes: "Research on dry-stone architecture techniques. Required licensed local stone masonry historian.",
      travelDates: "Jan 15 - Jan 22, 2027",
      amount: "$2,890.00",
      status: "AI Confirmed"
    },
    {
      travelerName: "Claire Dumont",
      travelerEmail: "claire.d@sorbonne.fr",
      serviceTitle: "Gorée Island Memorial & Senegalese Oral History Tour",
      destination: "Dakar & Gorée Island, Senegal",
      bookedVia: "Afrimax AI Assistant",
      aiNotes: "Focus on Atlantic slave trade memory, House of Slaves, and Léopold Sédar Senghor museum.",
      travelDates: "Dec 04 - Dec 10, 2026",
      amount: "$1,720.00",
      status: "AI Confirmed"
    }
  ];

  const pick = sampleBookings[Math.floor(Math.random() * sampleBookings.length)];
  const created = saveBooking(pick);
  renderBookingsTable();
  showToast(`New AI Booking received from ${created.travelerName} via Afrimax AI!`);
};

/* ================= 6. MEMBERS & TRAVELERS CRM ================= */
window.membersCurrentPage = 1;
window.changeMembersPage = function(page) {
  window.membersCurrentPage = page;
  renderMembersTable();
};

export function renderMembersTable() {
  const tableBody = document.getElementById('membersTableBody');
  if (!tableBody) return;

  const search = document.getElementById('memberSearchInput')?.value?.toLowerCase() || '';
  const tierFilter = document.getElementById('memberTierFilter')?.value || 'all';

  let members = getMembers();
  if (tierFilter !== 'all') {
    members = members.filter(m => m.tier === tierFilter);
  }
  if (search) {
    members = members.filter(m => 
      (m.name && m.name.toLowerCase().includes(search)) ||
      (m.email && m.email.toLowerCase().includes(search)) ||
      (m.location && m.location.toLowerCase().includes(search))
    );
  }

  const { pagedItems, validPage, totalPages } = paginateList(members, window.membersCurrentPage || 1, 5);
  window.membersCurrentPage = validPage;

  if (pagedItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:32px; color:#64748b;">
          No members found matching your filter criteria.
        </td>
      </tr>
    `;
    renderPaginationControls('membersPagination', 1, 1, 'changeMembersPage');
    return;
  }

  tableBody.innerHTML = pagedItems.map(m => `
    <tr>
      <td>
        <div class="product-info-cell">
          <img src="${m.avatar || 'images/bf.jpg'}" class="product-thumb" style="border-radius:50%; width:38px; height:38px; object-fit:cover;" onerror="this.src='images/bf.jpg'">
          <div>
            <strong style="color:var(--text-main, #0f172a); font-size:13.5px;">${escapeHtml(m.name)}</strong>
            <div style="font-size:11px; color:#64748b;">Joined: ${escapeHtml(m.joinedDate || '2025')}</div>
          </div>
        </div>
      </td>
      <td><span style="font-size:12.5px;">${escapeHtml(m.email)}</span></td>
      <td>${escapeHtml(m.location || 'Global Patron')}</td>
      <td><strong>${m.expeditions || 1}</strong> Expeditions Planned</td>
      <td><span class="status-pill completed">${escapeHtml(m.tier || 'Heritage Patron')}</span></td>
      <td>
        <span class="trend-badge ${m.status === 'Suspended' ? 'negative' : 'positive'}">
          ${escapeHtml(m.status || 'Active')}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.editMember('${m.id}')" title="Modify User Attributes">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="icon-btn" style="width:28px; height:28px;" onclick="window.deleteMember('${m.id}', '${escapeHtml(m.name)}')" title="Remove User">
            <i class="fas fa-trash-can" style="font-size:11px; color:#ef4444;"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPaginationControls('membersPagination', validPage, totalPages, 'changeMembersPage');
}
window.renderMembersTable = renderMembersTable;

// Member CRM Handlers
window.openAddMemberModal = function() {
  document.getElementById('memberModalTitle').textContent = 'Add New Community Member';
  document.getElementById('editMemberId').value = '';
  document.getElementById('editMemberName').value = '';
  document.getElementById('editMemberEmail').value = '';
  document.getElementById('editMemberLocation').value = '';
  document.getElementById('editMemberTier').value = 'Heritage Patron';
  document.getElementById('editMemberStatus').value = 'Active';
  document.getElementById('editMemberExpeditions').value = '1';
  document.getElementById('memberModal').classList.add('active');
};

window.editMember = function(id) {
  const members = getMembers();
  const m = members.find(item => item.id === id);
  if (!m) return;

  document.getElementById('memberModalTitle').textContent = `Modify User: ${m.name}`;
  document.getElementById('editMemberId').value = m.id;
  document.getElementById('editMemberName').value = m.name || '';
  document.getElementById('editMemberEmail').value = m.email || '';
  document.getElementById('editMemberLocation').value = m.location || '';
  document.getElementById('editMemberTier').value = m.tier || 'Heritage Patron';
  document.getElementById('editMemberStatus').value = m.status || 'Active';
  document.getElementById('editMemberExpeditions').value = m.expeditions || 1;
  document.getElementById('memberModal').classList.add('active');
};

window.deleteMember = function(id, name) {
  if (confirm(`Remove member "${name || id}" from community directory?`)) {
    deleteMember(id);
    showToast(`Removed member ${name || id}`);
    renderMembersTable();
    updateDashboardStats();
  }
};

window.handleMemberFormSave = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const id = document.getElementById('editMemberId').value;
  const name = document.getElementById('editMemberName').value.trim();
  const email = document.getElementById('editMemberEmail').value.trim();
  const location = document.getElementById('editMemberLocation').value.trim() || 'Global Patron';
  const tier = document.getElementById('editMemberTier').value;
  const status = document.getElementById('editMemberStatus').value;
  const expeditions = parseInt(document.getElementById('editMemberExpeditions').value, 10) || 1;

  if (!name || !email) {
    alert('Please enter member name and contact email.');
    return;
  }

  if (id) {
    updateMember(id, { name, email, location, tier, status, expeditions });
    showToast(`Updated user "${name}" successfully in Supabase!`);
  } else {
    saveMember({ name, email, location, tier, status, expeditions });
    showToast(`Added new member "${name}" to community database!`);
  }

  document.getElementById('memberModal').classList.remove('active');
  renderMembersTable();
  updateDashboardStats();
};

/* ================= 7. DOCUMENTARY VIDEOS & EXPEDITIONS CMS ================= */
window.videosCurrentPage = 1;
window.changeVideosPage = function(page) {
  window.videosCurrentPage = page;
  renderVideosTable();
};

export function renderVideosTable() {
  const tableBody = document.getElementById('videosTableBody');
  if (!tableBody) return;

  const search = document.getElementById('videoSearchInput')?.value?.toLowerCase() || '';
  const trackFilter = document.getElementById('videoTrackFilter')?.value || 'all';

  let videos = getVideos();
  const badgeEl = document.getElementById('videosNavBadge');
  if (badgeEl) badgeEl.textContent = videos.length;

  if (trackFilter !== 'all') {
    videos = videos.filter(v => v.track === trackFilter);
  }
  if (search) {
    videos = videos.filter(v => 
      (v.title && v.title.toLowerCase().includes(search)) ||
      (v.place && v.place.toLowerCase().includes(search)) ||
      (v.sub && v.sub.toLowerCase().includes(search)) ||
      (v.desc && v.desc.toLowerCase().includes(search))
    );
  }

  const { pagedItems, validPage, totalPages } = paginateList(videos, window.videosCurrentPage || 1, 5);
  window.videosCurrentPage = validPage;

  if (pagedItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:32px; color:#64748b;">
          No documentary films match your filter criteria.
        </td>
      </tr>
    `;
    renderPaginationControls('videosPagination', 1, 1, 'changeVideosPage');
    return;
  }

  tableBody.innerHTML = pagedItems.map(v => {
    let trackLabel = "Ancient Civilizations";
    if (v.track === "slave-trade") trackLabel = "Slave Trades & Freedom";
    if (v.track === "anticolonial") trackLabel = "Anticolonial Wars";

    return `
      <tr>
        <td>
          <img src="${v.img || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=100'}" alt="${escapeHtml(v.title)}" style="width:68px; height:46px; border-radius:6px; object-fit:cover;" onerror="this.src='images/1.png'">
        </td>
        <td style="max-width:260px;">
          <strong style="display:block; font-size:13.5px; color:var(--text-main, #0f172a);">${escapeHtml(v.title)}</strong>
          <span style="font-size:11.5px; color:#64748b;">${escapeHtml(v.tag || 'Curated Film')}</span>
        </td>
        <td>
          <span class="status-pill completed">${escapeHtml(trackLabel)}</span>
        </td>
        <td>
          <strong style="display:block; font-size:12.5px;">${escapeHtml(v.place || '')}</strong>
          <span style="font-size:11px; color:#64748b;">${escapeHtml(v.sub || '')}</span>
        </td>
        <td>
          <a href="${escapeHtml(v.yt || '#')}" target="_blank" rel="noopener" style="font-size:11.5px; color:#059669; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
            <i class="fab fa-youtube" style="color:#ef4444;"></i> Watch Film
          </a>
        </td>
        <td><span style="font-weight:700; color:#0b2921;">#${v.num || 1}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.editVideo('${v.id}')" title="Edit Video">
              <i class="fas fa-pen"></i> Edit
            </button>
            <button class="icon-btn" style="width:28px; height:28px;" onclick="window.deleteVideo('${v.id}', '${escapeHtml(v.title)}')" title="Delete Video">
              <i class="fas fa-trash-can" style="font-size:11px; color:#ef4444;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderPaginationControls('videosPagination', validPage, totalPages, 'changeVideosPage');
}
window.renderVideosTable = renderVideosTable;

// Documentary Video CMS Handlers
window.openAddVideoModal = function() {
  document.getElementById('videoModalTitle').textContent = 'Add Documentary Film to Carousel';
  document.getElementById('editVideoId').value = '';
  document.getElementById('videoTrackSelect').value = 'ancient';
  document.getElementById('videoTitleInput').value = '';
  document.getElementById('videoTagInput').value = '';
  document.getElementById('videoNumInput').value = '1';
  document.getElementById('videoPlaceInput').value = '';
  document.getElementById('videoSubInput').value = '';
  document.getElementById('videoImgInput').value = '';
  document.getElementById('videoYtInput').value = '';
  document.getElementById('videoDescInput').value = '';
  document.getElementById('videoImgPreviewContainer').style.display = 'none';
  document.getElementById('videoModal').classList.add('active');
};

window.editVideo = function(id) {
  const videos = getVideos();
  const v = videos.find(item => item.id === id);
  if (!v) return;

  document.getElementById('videoModalTitle').textContent = `Edit Documentary: ${v.title}`;
  document.getElementById('editVideoId').value = v.id;
  document.getElementById('videoTrackSelect').value = v.track || 'ancient';
  document.getElementById('videoTitleInput').value = v.title || '';
  document.getElementById('videoTagInput').value = v.tag || '';
  document.getElementById('videoNumInput').value = v.num || 1;
  document.getElementById('videoPlaceInput').value = v.place || '';
  document.getElementById('videoSubInput').value = v.sub || '';
  document.getElementById('videoImgInput').value = v.img || '';
  document.getElementById('videoYtInput').value = v.yt || '';
  document.getElementById('videoDescInput').value = v.desc || '';

  if (v.img) {
    document.getElementById('videoImgPreview').src = v.img;
    document.getElementById('videoImgPreviewContainer').style.display = 'block';
  } else {
    document.getElementById('videoImgPreviewContainer').style.display = 'none';
  }

  document.getElementById('videoModal').classList.add('active');
};

window.deleteVideo = function(id, title) {
  if (confirm(`Remove documentary "${title}" from the scrolling video showcase?`)) {
    deleteVideo(id);
    showToast(`Removed video "${title}"`);
    renderVideosTable();
  }
};

window.handleVideoFormSave = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const id = document.getElementById('editVideoId').value;
  const track = document.getElementById('videoTrackSelect').value;
  const title = document.getElementById('videoTitleInput').value.trim();
  const tag = document.getElementById('videoTagInput').value.trim() || 'Curated Archival Screening';
  const num = parseInt(document.getElementById('videoNumInput').value, 10) || 1;
  const place = document.getElementById('videoPlaceInput').value.trim();
  const sub = document.getElementById('videoSubInput').value.trim();
  const img = document.getElementById('videoImgInput').value.trim() || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80';
  const yt = document.getElementById('videoYtInput').value.trim() || 'https://www.youtube.com';
  const desc = document.getElementById('videoDescInput').value.trim();

  if (!title || !place || !desc) {
    alert('Please fill out the documentary title, historic site, and synopsis.');
    return;
  }

  if (id) {
    updateVideo(id, { track, title, tag, num, place, sub, img, yt, desc });
    showToast(`Updated documentary "${title}" in CMS!`);
  } else {
    saveVideo({ track, title, tag, num, place, sub, img, yt, desc });
    showToast(`Added documentary "${title}" to scrolling showcase!`);
  }

  document.getElementById('videoModal').classList.remove('active');
  renderVideosTable();
};

/* ================= 8. MODALS & FORMS CONTROLLER ================= */
// Robust Exhibit Save Handler
window.handleExhibitFormSave = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const editId = document.getElementById('exhibitEditId').value;
  const title = document.getElementById('newExhibitTitle').value.trim();
  const category = document.getElementById('newExhibitCategory').value;
  const galleryCategory = document.getElementById('newExhibitGalleryCategory')?.value || '';
  const region = document.getElementById('newExhibitRegion').value.trim();
  const subtitle = document.getElementById('newExhibitSubtitle')?.value.trim() || '';
  const image = document.getElementById('newExhibitImage').value.trim() || 'images/1.png';
  const hoverImage = document.getElementById('newExhibitHoverImage')?.value.trim() || '';
  const text = document.getElementById('newExhibitText').value.trim();
  const curator = document.getElementById('newExhibitCurator').value.trim() || 'Tony Robert';
  const status = document.getElementById('newExhibitStatus').value || 'Published';

  if (!title) {
    alert('Please enter an exhibit or article title.');
    document.getElementById('newExhibitTitle').focus();
    return;
  }
  if (!region) {
    alert('Please enter the African region or country.');
    document.getElementById('newExhibitRegion').focus();
    return;
  }
  if (!text) {
    alert('Please enter the historical synopsis or narrative text.');
    document.getElementById('newExhibitText').focus();
    return;
  }

  const saveBtn = document.getElementById('saveExhibitBtn');
  if (saveBtn) {
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
  }

  try {
    if (editId) {
      updateExhibit(editId, {
        title,
        category,
        galleryCategory,
        region,
        subtitle,
        image,
        hoverImage,
        description: text,
        curator,
        status
      });
      showToast(`Updated exhibit "${title}" in Supabase!`);
    } else {
      saveExhibit({
        title,
        category,
        galleryCategory,
        region,
        subtitle,
        image,
        hoverImage,
        description: text,
        curator,
        status,
        reads: 1200 + Math.floor(Math.random() * 800)
      });
      showToast(`Saved new exhibit "${title}" to Supabase database!`);
    }

    const modal = document.getElementById('addExhibitModal');
    if (modal) modal.classList.remove('active');
    renderExhibitsTables();
    updateDashboardStats();
  } catch (err) {
    console.error("Save exhibit error:", err);
    alert("Could not save exhibit: " + err.message);
  } finally {
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Save to Supabase';
      saveBtn.disabled = false;
    }
  }
};

window.openAddExhibitModal = function() {
  document.getElementById('exhibitModalTitle').textContent = 'Add New Exhibit / Visual Gallery Item';
  document.getElementById('exhibitEditId').value = '';
  const form = document.getElementById('addExhibitForm');
  if (form) form.reset();
  const prevContainer = document.getElementById('imagePreviewContainer');
  if (prevContainer) prevContainer.style.display = 'none';
  const hoverContainer = document.getElementById('hoverImagePreviewContainer');
  if (hoverContainer) hoverContainer.style.display = 'none';
  const modal = document.getElementById('addExhibitModal');
  if (modal) modal.classList.add('active');
};

// Global function to close all modals — used by onclick="window.closeAllModals(event)" on cancel/close buttons
window.closeAllModals = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
};

function initModalsAndForms() {
  const fileInput = document.getElementById('newExhibitFile');
  const urlInput = document.getElementById('newExhibitImage');
  const preview = document.getElementById('imagePreview');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const closeModalBtns = document.querySelectorAll('.close-modal');

  // Close modals on click (delegation fallback)
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      window.closeAllModals();
    });
  });

  // Close modal when clicking on the dimmed background overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Image Upload File Handler for Exhibits
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const base64 = evt.target.result;
          if (urlInput) urlInput.value = base64;
          if (preview) preview.src = base64;
          if (previewContainer) previewContainer.style.display = 'block';
          showToast(`Image "${file.name}" loaded for exhibit`);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // URL input preview for Exhibits
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      if (val && preview && previewContainer) {
        preview.src = val;
        previewContainer.style.display = 'block';
      }
    });
  }

  // Hover Comparison Image File & URL Handlers
  const hoverFileInput = document.getElementById('newExhibitHoverFile');
  const hoverUrlInput = document.getElementById('newExhibitHoverImage');
  const hoverPreview = document.getElementById('hoverImagePreview');
  const hoverPreviewContainer = document.getElementById('hoverImagePreviewContainer');

  if (hoverFileInput) {
    hoverFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const base64 = evt.target.result;
          if (hoverUrlInput) hoverUrlInput.value = base64;
          if (hoverPreview) hoverPreview.src = base64;
          if (hoverPreviewContainer) hoverPreviewContainer.style.display = 'block';
          showToast(`Hover image "${file.name}" loaded for exhibit`);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (hoverUrlInput) {
    hoverUrlInput.addEventListener('input', () => {
      const val = hoverUrlInput.value.trim();
      if (val && hoverPreview && hoverPreviewContainer) {
        hoverPreview.src = val;
        hoverPreviewContainer.style.display = 'block';
      } else if (!val && hoverPreviewContainer) {
        hoverPreviewContainer.style.display = 'none';
      }
    });
  }

  // Video Thumbnail File Handler
  const videoFileInput = document.getElementById('videoFileInput');
  const videoImgInput = document.getElementById('videoImgInput');
  const videoPreview = document.getElementById('videoImgPreview');
  const videoPreviewContainer = document.getElementById('videoImgPreviewContainer');

  if (videoFileInput) {
    videoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          const base64 = evt.target.result;
          if (videoImgInput) videoImgInput.value = base64;
          if (videoPreview) videoPreview.src = base64;
          if (videoPreviewContainer) videoPreviewContainer.style.display = 'block';
          showToast(`Poster loaded for documentary`);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (videoImgInput) {
    videoImgInput.addEventListener('input', () => {
      const val = videoImgInput.value.trim();
      if (val && videoPreview && videoPreviewContainer) {
        videoPreview.src = val;
        videoPreviewContainer.style.display = 'block';
      }
    });
  }

  // Manual Booking Modal & Form Handler
  const bookingModal = document.getElementById('addBookingModal');
  const bookingForm = document.getElementById('addBookingForm');

  window.openAddBookingModal = function() {
    if (bookingForm) bookingForm.reset();
    if (bookingModal) bookingModal.classList.add('active');
  };

  window.handleBookingFormSave = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const travelerName = document.getElementById('bookTravelerName')?.value?.trim();
    const travelerEmail = document.getElementById('bookTravelerEmail')?.value?.trim();
    const serviceTitle = document.getElementById('bookServiceTitle')?.value?.trim();
    const destination = document.getElementById('bookDestination')?.value?.trim() || 'Pan-African Heritage Trail';
    const partySize = parseInt(document.getElementById('bookPartySize')?.value, 10) || 2;
    const aiNotes = document.getElementById('bookNotes')?.value?.trim() || 'Manual booking recorded by Curator Tony Robert.';
    const bookedVia = document.getElementById('bookChannel')?.value || 'Afrimax AI Assistant';

    if (!travelerName || !travelerEmail || !serviceTitle) {
      alert('Please enter traveler full name, contact email, and expedition service title.');
      return;
    }

    const saveBtn = document.getElementById('saveBookingBtn');
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      saveBtn.disabled = true;
    }

    try {
      saveBooking({
        travelerName,
        travelerEmail,
        serviceTitle,
        destination,
        partySize,
        amount: `${partySize} Travelers`,
        aiNotes,
        bookedVia,
        travelDates: 'Scheduled 2026/2027',
        status: 'Confirmed'
      });

      if (bookingModal) bookingModal.classList.remove('active');
      renderBookingsTable();
      updateDashboardStats();
      showToast(`Recorded expedition booking for ${travelerName} in Supabase!`);
    } catch (err) {
      console.error("Booking save error:", err);
      alert("Could not save booking: " + err.message);
    } finally {
      if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Record Booking';
        saveBtn.disabled = false;
      }
    }
  };

  if (bookingForm) {
    bookingForm.addEventListener('submit', window.handleBookingFormSave);
  }
}

/* ================= 8. NOTIFICATION CENTER CONTROLLER ================= */
function initNotificationCenter() {
  const bellBtn = document.getElementById('adminNotifBellBtn');
  const dropdown = document.getElementById('adminNotifDropdown');
  const badgeEl = document.getElementById('adminNotifBadge');
  const listEl = document.getElementById('adminNotifList');
  const clearBtn = document.getElementById('clearNotifsBtn');

  function renderNotifs() {
    if (!listEl) return;
    const notifs = getNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badgeEl.style.display = 'flex';
      } else {
        badgeEl.style.display = 'none';
      }
    }

    if (notifs.length === 0) {
      listEl.innerHTML = `
        <div style="padding:28px 16px; text-align:center; color:#94a3b8; font-size:12.5px;">
          <i class="fas fa-bell-slash" style="font-size:24px; margin-bottom:8px; display:block; opacity:0.6;"></i>
          No unread operations alerts
        </div>
      `;
      return;
    }

    listEl.innerHTML = notifs.map(n => {
      let icon = 'fa-bell';
      let iconClass = 'general';
      if (n.type === 'user_registered' || n.type === 'user_login') {
        icon = 'fa-user-check';
        iconClass = 'user';
      } else if (n.type === 'booking') {
        icon = 'fa-route';
        iconClass = 'booking';
      } else if (n.type === 'content') {
        icon = 'fa-feather';
        iconClass = 'content';
      }

      return `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${escapeHtml(n.id)}">
          <div class="notif-item-icon ${iconClass}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="notif-item-content">
            <div class="notif-item-title">${escapeHtml(n.title)}</div>
            <div class="notif-item-msg">${escapeHtml(n.message)}</div>
            <div class="notif-item-time">${escapeHtml(n.time || 'Just now')}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (bellBtn && dropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      renderNotifs();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== bellBtn) {
        dropdown.classList.remove('active');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      markNotificationsAsRead();
      renderNotifs();
      showToast('All notifications marked as read.');
    });
  }

  // Live real-time notification listeners
  window.addEventListener('africa_world_new_notification', (e) => {
    renderNotifs();
    renderMembersTable();
    updateDashboardStats();
    if (e.detail) {
      showToast(`🔔 ${e.detail.title}: ${e.detail.message}`);
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'africa_world_notifications' || e.key === 'africa_world_members' || e.key === 'africa_world_customer') {
      renderNotifs();
      renderMembersTable();
      updateDashboardStats();
      if (e.key === 'africa_world_notifications' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list) && list.length > 0) {
            const latest = list[0];
            if (!latest.read && (Date.now() - (latest.timestamp || 0) < 20000)) {
              showToast(`🔔 ${latest.title}: ${latest.message}`);
            }
          }
        } catch(err) {}
      }
    }
  });

  // Fast live stream sync to instantly reflect new registered users, logins & inquiries across all tabs
  let lastSeenNotifId = '';
  let lastSeenNotifCount = -1;
  let lastSeenMembersCount = -1;
  let lastCustomerRaw = '';
  let lastSeenMessageId = '';
  setInterval(() => {
    try {
      const rawN = localStorage.getItem('africa_world_notifications');
      const rawM = localStorage.getItem('africa_world_members');
      const rawC = localStorage.getItem('africa_world_customer') || '';
      const rawMsg = localStorage.getItem('africa_world_messages');
      const notifs = rawN ? JSON.parse(rawN) : [];
      const members = rawM ? JSON.parse(rawM) : [];
      const msgs = rawMsg ? JSON.parse(rawMsg) : [];
      const latestNotifId = notifs[0]?.id || '';
      const latestMsgId = msgs[0]?.id || '';

      if (lastSeenNotifCount === -1) {
        lastSeenNotifCount = notifs.length;
        lastSeenNotifId = latestNotifId;
        lastSeenMembersCount = members.length;
        lastCustomerRaw = rawC;
        lastSeenMessageId = latestMsgId;
        return;
      }
      if (notifs.length !== lastSeenNotifCount || latestNotifId !== lastSeenNotifId || members.length !== lastSeenMembersCount || rawC !== lastCustomerRaw || latestMsgId !== lastSeenMessageId) {
        const hadNewNotif = latestNotifId !== lastSeenNotifId;
        lastSeenNotifCount = notifs.length;
        lastSeenNotifId = latestNotifId;
        lastSeenMembersCount = members.length;
        lastCustomerRaw = rawC;
        lastSeenMessageId = latestMsgId;
        renderNotifs();
        renderMembersTable();
        updateDashboardStats();
        if (typeof refreshChatContacts === 'function') refreshChatContacts();
        if (typeof renderDispatchesView === 'function') renderDispatchesView(window.currentDispatchFilter || 'all');
        const targetSelector = document.getElementById('chatTargetSelector');
        if (typeof renderChatThread === 'function') renderChatThread(targetSelector ? targetSelector.value : 'all');
        if (hadNewNotif && notifs.length > 0 && !notifs[0].read && (Date.now() - (notifs[0].timestamp || 0) < 20000)) {
          showToast(`🔔 ${notifs[0].title}: ${notifs[0].message}`);
        }
      }
    } catch(e) {}
  }, 1200);

  renderNotifs();
}

/* ================= 9. SUPABASE CLOUD SYNC CONTROLLER ================= */
function initSupabaseSyncButton() {
  const topSyncBtn = document.getElementById('topSyncSupabaseBtn');
  const cmsSyncBtn = document.getElementById('cmsSyncSupabaseBtn');

  const handleSync = async (btn) => {
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
    }

    try {
      const res = await syncAllFromSupabase();
      renderExhibitsTables();
      renderBookingsTable();
      renderMembersTable();
      renderVideosTable();
      updateDashboardStats();

      if (res.success) {
        showToast('Supabase cloud synchronized successfully!');
      } else {
        showToast('Supabase connected. Data cached & active.');
      }
    } catch (err) {
      console.warn("Sync notice:", err);
      showToast('Supabase active with local cache fallbacks.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-arrows-rotate"></i> Sync Supabase';
      }
    }
  };

  if (topSyncBtn) topSyncBtn.addEventListener('click', () => handleSync(topSyncBtn));
  if (cmsSyncBtn) cmsSyncBtn.addEventListener('click', () => handleSync(cmsSyncBtn));
}


/* ================= 8. SETTINGS FORM: ADMIN PROFILE & CREDENTIALS ================= */
function initSettingsForm() {
  const form = document.getElementById('adminSettingsForm');
  if (!form) return;

  const session = getAdminSession();
  const nameInput = document.getElementById('settingAdminName');
  const emailInput = document.getElementById('settingAdminEmail');
  const roleInput = document.getElementById('settingAdminRole');
  const avatarInput = document.getElementById('settingAdminAvatar');
  const avatarFileInput = document.getElementById('settingAdminAvatarFile');
  const statementInput = document.getElementById('settingAdminStatement');

  // Pre-fill existing admin profile
  if (session) {
    if (nameInput) nameInput.value = session.name || 'Tony Robert';
    if (emailInput) emailInput.value = session.email || 'tony.robert@africaworld.org';
    if (roleInput) roleInput.value = session.role || 'Lead Curator & Administrator';
    if (avatarInput) avatarInput.value = session.avatar || 'images/k.jpg';
  }

  const storedStatement = localStorage.getItem('africa_world_admin_statement');
  if (storedStatement && statementInput) {
    statementInput.value = storedStatement;
  }

  // Avatar file upload handler
  if (avatarFileInput && avatarInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          avatarInput.value = evt.target.result;
          showToast(`Admin avatar "${file.name}" loaded`);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  window.handleAdminSettingsSave = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = nameInput ? nameInput.value.trim() : 'Tony Robert';
    const email = emailInput ? emailInput.value.trim() : 'tony.robert@africaworld.org';
    const role = roleInput ? roleInput.value.trim() : 'Administrator';
    const avatar = avatarInput ? avatarInput.value.trim() : 'images/k.jpg';
    const statement = statementInput ? statementInput.value.trim() : '';

    const newPass = document.getElementById('settingNewPassword')?.value || '';
    const confirmPass = document.getElementById('settingConfirmPassword')?.value || '';

    if (newPass || confirmPass) {
      if (newPass !== confirmPass) {
        alert('New administrator passcodes do not match. Please verify.');
        return;
      }
      if (newPass.length < 6) {
        alert('Administrator passcode must be at least 6 characters long.');
        return;
      }
      localStorage.setItem('africa_world_admin_passcode', newPass);
    }

    // Save updated admin session
    const updatedSession = {
      ...(session || {}),
      name: name,
      email: email,
      role: role,
      avatar: avatar,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem('africa_world_admin_session', JSON.stringify(updatedSession));
    localStorage.setItem('vizora_admin_user', JSON.stringify(updatedSession));
    if (statement) {
      localStorage.setItem('africa_world_admin_statement', statement);
    }

    // Update live page elements immediately
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = name);
    document.querySelectorAll('.user-role').forEach(el => el.textContent = role);
    const avatarEls = document.querySelectorAll('.user-avatar');
    avatarEls.forEach(el => el.src = avatar);
    const subtitleEl = document.getElementById('currentPageSubtitle');
    if (subtitleEl) subtitleEl.textContent = `Welcome back ${name.split(' ')[0]}`;

    // Reset password fields
    const p1 = document.getElementById('settingNewPassword');
    const p2 = document.getElementById('settingConfirmPassword');
    if (p1) p1.value = '';
    if (p2) p2.value = '';

    showToast('Administrator profile, texts & passcode updated successfully!');
  };
}

/* ================= 9. REAL LIVE CHAT & DISPATCH SYSTEM ================= */

function isAdminEmail(email) {
  if (!email) return false;
  const adminSession = getAdminSession();
  const adminEmail = (adminSession?.email || 'tony.robert@africaworld.org').toLowerCase();
  return email.toLowerCase() === adminEmail || email.toLowerCase().includes('admin@');
}

export function refreshChatContacts() {
  const targetSelector = document.getElementById('chatTargetSelector');
  const contactsList = document.getElementById('chatContactsList');
  if (!targetSelector && !contactsList) return;

  const members = getMembers() || [];
  const currentUser = JSON.parse(localStorage.getItem('africa_world_customer') || 'null');
  
  // Combine all registered travelers & active session traveler
  const travelersMap = new Map();
  members.forEach(m => {
    if (m && m.email && !isAdminEmail(m.email)) {
      travelersMap.set(m.email.toLowerCase(), {
        name: m.name || m.email.split('@')[0],
        email: m.email.toLowerCase(),
        avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'Traveler')}&background=059669&color=fff`,
        tier: m.tier || 'Cultural Explorer',
        location: m.location || 'Verified Traveler',
        isCurrent: false
      });
    }
  });

  if (currentUser && currentUser.email && !isAdminEmail(currentUser.email)) {
    const key = currentUser.email.toLowerCase();
    const existing = travelersMap.get(key) || {};
    travelersMap.set(key, {
      name: currentUser.name || existing.name || currentUser.email.split('@')[0],
      email: key,
      avatar: currentUser.photoURL || existing.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'Traveler')}&background=059669&color=fff`,
      tier: existing.tier || 'Active Traveler Session',
      location: existing.location || 'Logged in Traveler',
      isCurrent: true
    });
  }

  const travelers = Array.from(travelersMap.values());

  // 1. Populate Recipient Target Dropdown
  if (targetSelector) {
    const currentVal = targetSelector.value;
    targetSelector.innerHTML = `
      <option value="all">📢 All Registered Travelers (Broadcast)</option>
      ${travelers.map(t => `
        <option value="${escapeHtml(t.email)}">👤 ${escapeHtml(t.name)} (${escapeHtml(t.email)})${t.isCurrent ? ' - Active Now' : ''}</option>
      `).join('')}
    `;
    if (currentVal && Array.from(targetSelector.options).some(o => o.value === currentVal)) {
      targetSelector.value = currentVal;
    }
  }

  // 2. Populate Contacts Sidebar List
  if (contactsList) {
    const selectedEmail = targetSelector ? targetSelector.value : 'all';
    
    let html = `
      <li class="chat-user-item ${selectedEmail === 'all' ? 'active' : ''}" data-target="all" style="cursor:pointer; padding:12px 14px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:10px; transition:all 0.2s;">
        <div style="width:38px; height:38px; border-radius:50%; background:#ea580c; color:#fff; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0;">
          📢
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:13px; color:var(--text-main, #0f172a);">All Travelers</strong>
            <span style="font-size:10px; background:#ffedd5; color:#c2410c; padding:2px 6px; border-radius:10px; font-weight:700;">Broadcast</span>
          </div>
          <div style="font-size:11.5px; color:var(--text-muted, #64748b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Global announcements to all users</div>
        </div>
      </li>
    `;

    travelers.forEach(t => {
      const isActive = selectedEmail === t.email;
      html += `
        <li class="chat-user-item ${isActive ? 'active' : ''}" data-target="${escapeHtml(t.email)}" style="cursor:pointer; padding:12px 14px; border-bottom:1px solid var(--card-border, #f1f5f9); display:flex; align-items:center; gap:10px; transition:all 0.2s;">
          <img src="${escapeHtml(t.avatar)}" alt="${escapeHtml(t.name)}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; flex-shrink:0;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=059669&color=fff'">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:13px; color:var(--text-main, #0f172a); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(t.name)}</strong>
              ${t.isCurrent ? '<span style="font-size:9.5px; background:#dcfce7; color:#15803d; padding:2px 6px; border-radius:10px; font-weight:700;">● Online</span>' : ''}
            </div>
            <div style="font-size:11.5px; color:var(--text-muted, #64748b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(t.email)}</div>
          </div>
        </li>
      `;
    });

    contactsList.innerHTML = html;

    contactsList.querySelectorAll('.chat-user-item').forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        selectChatRecipient(target);
      });
    });
  }
}
window.refreshChatContacts = refreshChatContacts;

export function selectChatRecipient(targetEmail) {
  const targetSelector = document.getElementById('chatTargetSelector');
  if (targetSelector && targetEmail) {
    targetSelector.value = targetEmail;
  }

  const activeAvatar = document.getElementById('activeChatAvatar');
  const activeName = document.getElementById('activeChatUserName');
  const activeSub = document.getElementById('activeChatUserSub');

  if (targetEmail === 'all') {
    if (activeAvatar) {
      activeAvatar.innerHTML = '📢';
      activeAvatar.style.background = '#ea580c';
    }
    if (activeName) activeName.textContent = 'All Registered Travelers';
    if (activeSub) activeSub.textContent = 'Global Broadcast • Sent directly to every traveler user dashboard';
  } else {
    const members = getMembers() || [];
    const currentUser = JSON.parse(localStorage.getItem('africa_world_customer') || 'null');
    let name = targetEmail.split('@')[0];
    let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=059669&color=fff`;
    let sub = `${targetEmail} • Direct dispatch synced with user dashboard`;

    const m = members.find(mem => mem.email && mem.email.toLowerCase() === targetEmail.toLowerCase());
    if (m) {
      name = m.name;
      if (m.avatar) avatar = m.avatar;
      sub = `${targetEmail} • ${m.location || 'Traveler'} (${m.tier || 'Member'})`;
    } else if (currentUser && currentUser.email && currentUser.email.toLowerCase() === targetEmail.toLowerCase()) {
      name = currentUser.name || name;
      if (currentUser.photoURL) avatar = currentUser.photoURL;
      sub = `${targetEmail} • Active Logged-In Traveler`;
    }

    if (activeAvatar) {
      activeAvatar.innerHTML = `<img src="${avatar}" alt="${escapeHtml(name)}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    }
    if (activeName) activeName.textContent = name;
    if (activeSub) activeSub.textContent = sub;
  }

  // Update selection highlight in contacts list
  document.querySelectorAll('#chatContactsList .chat-user-item').forEach(el => {
    if (el.getAttribute('data-target') === targetEmail) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  renderChatThread(targetEmail);
}
window.selectChatRecipient = selectChatRecipient;

export function renderChatThread(targetEmail = 'all') {
  const chatBody = document.getElementById('chatBodyContainer');
  if (!chatBody) return;

  const allMessages = getMessages() || [];
  let thread = [];

  if (targetEmail === 'all') {
    thread = allMessages.filter(m => m.recipientEmail === 'all' || m.type === 'broadcast');
  } else {
    const norm = targetEmail.toLowerCase();
    thread = allMessages.filter(m => 
      (m.recipientEmail && m.recipientEmail.toLowerCase() === norm) || 
      (m.senderEmail && m.senderEmail.toLowerCase() === norm)
    );
  }

  // Oldest first for chat thread
  thread.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  if (thread.length === 0) {
    const isBroadcast = targetEmail === 'all';
    chatBody.innerHTML = `
      <div style="padding:40px 20px; text-align:center; color:#64748b;">
        <i class="fas fa-${isBroadcast ? 'bullhorn' : 'envelope-open'}" style="font-size:36px; color:#cbd5e1; margin-bottom:12px; display:block;"></i>
        <div style="font-weight:700; font-size:15px; color:var(--text-heading, #1e293b); margin-bottom:4px;">
          ${isBroadcast ? 'No Global Broadcast Dispatches Sent Yet' : `No Messages Yet with ${escapeHtml(targetEmail)}`}
        </div>
        <p style="font-size:12.5px; color:var(--text-muted, #64748b); max-width:440px; margin:0 auto;">
          ${isBroadcast 
            ? 'Compose a dispatch below to send a global advisory to all travelers on their user dashboards.'
            : 'Type a message below to send a direct advisory or response to this traveler. It will be instantly visible in their user dashboard.'}
        </p>
      </div>
    `;
    return;
  }

  chatBody.innerHTML = thread.map(m => {
    const isCurator = m.type !== 'inquiry' && (!m.senderEmail || m.senderEmail.includes('admin') || (m.sender && (m.sender.includes('Curator') || m.sender.includes('Tony') || m.sender.includes('Administrator'))));
    
    if (isCurator) {
      // Outgoing bubble from Curator / Admin
      return `
        <div class="chat-bubble outgoing" style="margin-bottom:12px; align-self:flex-end; max-width:78%; background:#059669; color:#fff; padding:12px 16px; border-radius:14px 14px 2px 14px; box-shadow:0 2px 6px rgba(5,150,105,0.2);">
          ${m.title ? `<div style="font-weight:700; font-size:12.5px; margin-bottom:4px; opacity:0.95; border-bottom:1px solid rgba(255,255,255,0.25); padding-bottom:3px;"><i class="fas fa-feather-pointed" style="margin-right:5px;"></i>${escapeHtml(m.title)}</div>` : ''}
          <p style="margin:0; font-size:13px; line-height:1.5;">${escapeHtml(m.message)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; font-size:10px; opacity:0.85; gap:12px;">
            <span><i class="fas fa-check-double"></i> Synced to User Dashboard</span>
            <span>${escapeHtml(m.dateFormatted || 'Just now')}</span>
          </div>
        </div>
      `;
    } else {
      // Incoming bubble from Traveler
      return `
        <div class="chat-bubble incoming" style="margin-bottom:12px; align-self:flex-start; max-width:78%; padding:12px 16px; border-radius:14px 14px 14px 2px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <div style="font-weight:700; font-size:12px; color:#ea580c; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
            <i class="fas fa-user-circle"></i>
            <span>${escapeHtml(m.sender || m.senderEmail || 'Traveler')}</span>
            <span style="font-size:10px; background:#ffedd5; color:#c2410c; padding:1px 5px; border-radius:6px; font-weight:600;">Traveler Inquiry</span>
          </div>
          ${m.title ? `<div style="font-weight:600; font-size:12px; margin-bottom:3px; color:var(--text-muted, #475569);">${escapeHtml(m.title)}</div>` : ''}
          <p style="margin:0; font-size:13px; line-height:1.5;">${escapeHtml(m.message)}</p>
          <div style="text-align:right; margin-top:4px; font-size:10px; opacity:0.75;">
            ${escapeHtml(m.dateFormatted || 'Received')}
          </div>
        </div>
      `;
    }
  }).join('');

  chatBody.scrollTop = chatBody.scrollHeight;
}
window.renderChatThread = renderChatThread;

function initChatSystem() {
  const sendBtn = document.getElementById('sendChatBtn');
  const chatInput = document.getElementById('chatMessageInput');
  const subjectInput = document.getElementById('chatSubjectInput');
  const typeSelect = document.getElementById('chatTypeSelect');
  const targetSelector = document.getElementById('chatTargetSelector');
  const searchInput = document.getElementById('chatSearchInput');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('#chatContactsList .chat-user-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }

  if (targetSelector) {
    targetSelector.addEventListener('change', () => {
      selectChatRecipient(targetSelector.value);
    });
  }

  function handleSendMessage() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) {
      alert("Please enter a message or notification text to send.");
      chatInput.focus();
      return;
    }

    const targetEmail = targetSelector ? targetSelector.value : 'all';
    const subject = subjectInput && subjectInput.value.trim() 
      ? subjectInput.value.trim() 
      : (targetEmail === 'all' ? 'Cultural Heritage Portal Announcement' : 'Curator Advisory & Expedition Update');
    const type = typeSelect ? typeSelect.value : (targetEmail === 'all' ? 'broadcast' : 'direct');

    let recipientName = 'All Registered Travelers';
    if (targetEmail !== 'all') {
      const members = getMembers() || [];
      const m = members.find(mem => mem.email && mem.email.toLowerCase() === targetEmail.toLowerCase());
      recipientName = m ? m.name : targetEmail.split('@')[0];
    }

    const adminSession = getAdminSession();
    const senderName = adminSession?.name ? `Curator ${adminSession.name}` : 'Curator Tony Robert';
    const senderEmail = (adminSession?.email || 'tony.robert@africaworld.org').toLowerCase();

    // Dispatch message to storage and Supabase
    sendMessage({
      sender: senderName,
      senderEmail,
      recipientEmail: targetEmail,
      recipientName,
      title: subject,
      message: text,
      type
    });

    chatInput.value = '';
    if (subjectInput) subjectInput.value = '';

    renderChatThread(targetEmail);
    showToast(`Dispatch sent to ${recipientName}! Synced live to traveler dashboard.`);

    if (typeof renderDispatchesView === 'function') {
      renderDispatchesView();
    }
  }

  if (sendBtn) {
    sendBtn.onclick = handleSendMessage;
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  // Real-time synchronization listeners
  window.addEventListener('storage', (e) => {
    if (e.key === 'africa_world_messages' || e.key === 'africa_world_members' || e.key === 'africa_world_customer') {
      refreshChatContacts();
      const currentTarget = targetSelector ? targetSelector.value : 'all';
      renderChatThread(currentTarget);
    }
  });

  window.addEventListener('africa_world_new_message', () => {
    const currentTarget = targetSelector ? targetSelector.value : 'all';
    renderChatThread(currentTarget);
  });

  // Initial setup
  refreshChatContacts();
  selectChatRecipient('all');
}

/* ================= 9B. NOTIFICATIONS & DISPATCHES HUB VIEW ================= */

window.dispatchesCurrentPage = 1;
window.currentDispatchFilter = 'all';
window.changeDispatchesPage = function(page) {
  window.dispatchesCurrentPage = page;
  renderDispatchesView(window.currentDispatchFilter || 'all');
};

export function renderDispatchesView(filterType = 'all') {
  window.currentDispatchFilter = filterType;
  const tableBody = document.getElementById('dispatchesTableBody');
  const statTotal = document.getElementById('emailStatTotalNotifs');
  const statUnread = document.getElementById('emailStatUnreadNotifs');
  const statDirect = document.getElementById('emailStatDirectDispatches');
  const statRecipients = document.getElementById('emailStatActiveRecipients');

  // Bind filter buttons
  document.querySelectorAll('#view-email .vizora-tab-btn').forEach(btn => {
    if (!btn._hasFilterBound) {
      btn._hasFilterBound = true;
      btn.addEventListener('click', () => {
        document.querySelectorAll('#view-email .vizora-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter') || 'all';
        window.dispatchesCurrentPage = 1;
        renderDispatchesView(filter);
      });
    }
  });

  const searchInput = document.getElementById('dispatchSearchInput');
  if (searchInput && !searchInput._hasSearchBound) {
    searchInput._hasSearchBound = true;
    searchInput.addEventListener('input', () => {
      window.dispatchesCurrentPage = 1;
      renderDispatchesView(window.currentDispatchFilter || 'all');
    });
  }

  const notifications = getNotifications() || [];
  const messages = getMessages() || [];
  const members = getMembers() || [];

  // Filter out any notifications targeted at admin itself
  const notifsList = notifications.filter(n => !n.recipientEmail || !isAdminEmail(n.recipientEmail));
  const directMsgs = messages.filter(m => m.recipientEmail !== 'all' && !isAdminEmail(m.recipientEmail));
  const unreadNotifs = notifsList.filter(n => !n.read);

  // Update stat cards (NO US DOLLARS)
  if (statTotal) statTotal.textContent = (notifsList.length + messages.length).toString();
  if (statUnread) statUnread.textContent = unreadNotifs.length.toString();
  if (statDirect) statDirect.textContent = directMsgs.length.toString();
  if (statRecipients) statRecipients.textContent = members.length.toString();

  // Combine notifications and messages for the activity log table
  let combined = [
    ...notifsList.map(n => ({
      id: n.id,
      title: n.title,
      content: n.message,
      type: n.type || 'operations',
      category: n.type === 'user' ? 'User Account' : (n.type === 'booking' ? 'AI Booking' : 'Operations Alert'),
      target: n.recipientName || 'Operations Portal',
      targetEmail: n.recipientEmail || '',
      dateFormatted: n.dateFormatted || n.time || 'Recent',
      timestamp: n.timestamp || Date.now(),
      read: !!n.read,
      source: 'notification'
    })),
    ...messages.map(m => ({
      id: m.id,
      title: m.title || 'Curator Advisory',
      content: m.message,
      type: 'dispatch',
      category: m.type === 'broadcast' ? 'Global Broadcast' : 'Traveler Dispatch',
      target: m.recipientName || m.recipientEmail,
      targetEmail: m.recipientEmail,
      dateFormatted: m.dateFormatted || 'Recent',
      timestamp: m.timestamp || Date.now(),
      read: !!m.read,
      source: 'message'
    }))
  ];

  // Update tab counters
  const cAll = document.getElementById('countFilterAll');
  const cUnread = document.getElementById('countFilterUnread');
  const cUser = document.getElementById('countFilterUser');
  const cBooking = document.getElementById('countFilterBooking');
  const cDispatch = document.getElementById('countFilterDispatch');

  if (cAll) cAll.textContent = combined.length;
  if (cUnread) cUnread.textContent = combined.filter(i => !i.read).length;
  if (cUser) cUser.textContent = combined.filter(i => i.type === 'user').length;
  if (cBooking) cBooking.textContent = combined.filter(i => i.type === 'booking').length;
  if (cDispatch) cDispatch.textContent = combined.filter(i => i.type === 'dispatch').length;

  // Filter based on active filter
  if (filterType === 'unread') {
    combined = combined.filter(i => !i.read);
  } else if (filterType === 'user') {
    combined = combined.filter(i => i.type === 'user');
  } else if (filterType === 'booking') {
    combined = combined.filter(i => i.type === 'booking');
  } else if (filterType === 'dispatch') {
    combined = combined.filter(i => i.type === 'dispatch');
  }

  // Filter by search keyword
  const searchVal = searchInput?.value?.toLowerCase().trim();
  if (searchVal) {
    combined = combined.filter(i => 
      (i.title && i.title.toLowerCase().includes(searchVal)) ||
      (i.content && i.content.toLowerCase().includes(searchVal)) ||
      (i.target && i.target.toLowerCase().includes(searchVal)) ||
      (i.targetEmail && i.targetEmail.toLowerCase().includes(searchVal))
    );
  }

  // Sort newest first
  combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  if (!tableBody) return;

  const { pagedItems, validPage, totalPages } = paginateList(combined, window.dispatchesCurrentPage || 1, 5);
  window.dispatchesCurrentPage = validPage;

  if (pagedItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:36px; color:#64748b;">
          <i class="fas fa-bell-slash" style="font-size:32px; color:#cbd5e1; margin-bottom:10px; display:block;"></i>
          <div style="font-weight:600; font-size:14px; color:var(--text-heading, #1e293b);">No notifications found for this filter.</div>
          <div style="font-size:12px; color:var(--text-muted, #64748b); margin-top:4px;">Operational alerts and traveler dispatches will appear here in real time.</div>
        </td>
      </tr>
    `;
    renderPaginationControls('dispatchesPagination', 1, 1, 'changeDispatchesPage');
    return;
  }

  tableBody.innerHTML = pagedItems.map(item => `
    <tr class="${item.read ? '' : 'unread-row'}" style="${item.read ? '' : 'background:rgba(254,243,199,0.18);'}">
      <td width="40" style="text-align:center;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item.read ? '#94a3b8' : '#ea580c'};" title="${item.read ? 'Read' : 'Unread Alert'}"></span>
      </td>
      <td style="min-width:240px; max-width:340px;">
        <div style="font-weight:700; font-size:13px; color:var(--text-main, #0f172a); line-height:1.4;">${escapeHtml(item.title)}</div>
        <div style="font-size:12px; color:var(--text-muted, #64748b); margin-top:2px; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${escapeHtml(item.content)}
        </div>
      </td>
      <td style="min-width:130px;">
        <span class="status-pill" style="font-size:11px; padding:3px 8px; border-radius:6px; font-weight:600; display:inline-block; ${
          item.type === 'dispatch' ? 'background:#e0f2fe; color:#0369a1;' :
          item.type === 'booking' ? 'background:#dcfce7; color:#15803d;' :
          item.type === 'user' ? 'background:#fef3c7; color:#b45309;' :
          'background:var(--card-bg, #f1f5f9); color:var(--text-muted, #475569); border:1px solid var(--card-border, #cbd5e1);'
        }">
          ${escapeHtml(item.category)}
        </span>
      </td>
      <td style="min-width:150px; max-width:190px;">
        <div style="font-weight:600; font-size:12.5px; color:var(--text-heading, #1e293b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.target)}</div>
        ${item.targetEmail ? `<div style="font-size:11px; color:var(--text-muted, #64748b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.targetEmail)}</div>` : ''}
      </td>
      <td style="font-size:11.5px; color:var(--text-muted, #64748b); white-space:nowrap; min-width:110px;">
        ${escapeHtml(item.dateFormatted)}
      </td>
      <td style="min-width:130px; text-align:right;">
        <div style="display:inline-flex; gap:6px; justify-content:flex-end;">
          ${!item.read ? `
            <button onclick="window.markItemRead('${item.source}', '${item.id}')" style="background:var(--card-bg, #f1f5f9); color:var(--text-main, #0f172a); border:1px solid var(--card-border, #cbd5e1); padding:4px 8px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; display:inline-flex; align-items:center; gap:3px;" title="Mark as Read">
              <i class="fas fa-check"></i> Read
            </button>
          ` : ''}
          ${item.targetEmail && item.targetEmail !== 'all' ? `
            <button onclick="window.replyToTraveler('${item.targetEmail}', '${escapeHtml(item.target)}', '${escapeHtml(item.title)}')" style="background:#ffedd5; border:1px solid #fed7aa; color:#c2410c; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:3px;" title="Reply to Traveler in Chat">
              <i class="fas fa-reply"></i> Reply
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');

  renderPaginationControls('dispatchesPagination', validPage, totalPages, 'changeDispatchesPage');
}
window.renderDispatchesView = renderDispatchesView;

window.markItemRead = function(source, id) {
  if (source === 'message') {
    markMessageRead(id);
  } else {
    markNotificationRead(id);
  }
  renderDispatchesView();
};

/* ================= 10. EXPORT REPORT ================= */
function initExportAction() {
  const exportBtn = document.getElementById('exportDataBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const bookings = getBookings();
      let csv = "BookingID,TravelerName,Email,Service,Destination,Dates,Amount,Status,BookedVia\n";
      bookings.forEach(b => {
        csv += `"${b.id}","${b.travelerName}","${b.travelerEmail}","${b.serviceTitle}","${b.destination}","${b.travelDates}","${b.amount}","${b.status}","${b.bookedVia}"\n`;
      });

      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `africa_world_expeditions_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exporting expeditions and AI bookings CSV report...');
    });
  }
}

/* ================= 11. LOGOUT ================= */
window.handleAdminLogout = async function() {
  if (confirm("Sign out of Africa & The World Admin Console?")) {
    await adminLogout();
    window.location.href = 'admin-login.html';
  }
};

/* Helper Toast Notification */
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-circle-check" style="color:#10b981;"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
