/* ================================
   Dashboard JavaScript - لوحة التحكم
   نظام حجز المواعيد
   ================================ */

// Dashboard Module
const Dashboard = {
    // Current state
    currentPage: 'dashboard',
    currentBooking: null,
    filters: {
        status: 'all',
        date: '',
        search: ''
    },

    // Initialize dashboard
    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.checkAuth();
    },

    // Check authentication
    checkAuth() {
        if (!DB.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Setup event listeners
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.loadBookings();
            });
        }

        // Notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.showNotifications();
            });
        }

        // User dropdown
        const userBtn = document.querySelector('.user-btn');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        if (userBtn && dropdownMenu) {
            userBtn.addEventListener('click', () => {
                dropdownMenu.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!userBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Add booking button
        const addBookingBtn = document.getElementById('addBookingBtn');
        if (addBookingBtn) {
            addBookingBtn.addEventListener('click', () => {
                this.showAddBookingModal();
            });
        }

        // Modal handlers
        this.setupModalHandlers();

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
    },

    // Setup modal handlers
    setupModalHandlers() {
        // Close booking modal
        const closeBookingModal = document.getElementById('closeBookingModal');
        const cancelModalBtn = document.getElementById('cancelModalBtn');
        const bookingModal = document.getElementById('bookingModal');

        if (closeBookingModal) {
            closeBookingModal.addEventListener('click', () => this.closeModal('bookingModal'));
        }
        if (cancelModalBtn) {
            cancelModalBtn.addEventListener('click', () => this.closeModal('bookingModal'));
        }
        if (bookingModal) {
            bookingModal.addEventListener('click', (e) => {
                if (e.target.id === 'bookingModal') {
                    this.closeModal('bookingModal');
                }
            });
        }

        // Close delete modal
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const deleteModal = document.getElementById('deleteModal');

        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', () => this.closeModal('deleteModal'));
        }
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => this.closeModal('deleteModal'));
        }
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target.id === 'deleteModal') {
                    this.closeModal('deleteModal');
                }
            });
        }

        // Save booking
        const saveBookingBtn = document.getElementById('saveBookingBtn');
        if (saveBookingBtn) {
            saveBookingBtn.addEventListener('click', () => this.saveBooking());
        }

        // Confirm delete
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }
    },

    // Navigate to page
    navigateTo(page) {
        this.currentPage = page;
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            li.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar-nav a[data-page="${page}"]`);
        if (activeLink) {
            activeLink.closest('li').classList.add('active');
        }

        // Update header title
        const headerTitle = document.querySelector('.header-left h1');
        if (headerTitle) {
            const titles = {
                dashboard: 'لوحة التحكم',
                bookings: 'المواعيد',
                calendar: 'التقويم',
                services: 'الخدمات',
                customers: 'العملاء',
                reports: 'التقارير',
                settings: 'الإعدادات'
            };
            headerTitle.textContent = titles[page] || 'لوحة التحكم';
        }

        // Load page content
        this.loadPageContent(page);
    },

    // Load page content
    loadPageContent(page) {
        switch(page) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'bookings':
                this.loadBookings();
                break;
            case 'calendar':
                this.loadCalendar();
                break;
            case 'services':
                this.loadServices();
                break;
            case 'customers':
                this.loadCustomers();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    },

    // Load dashboard data
    loadDashboardData() {
        const stats = DB.getStatistics();
        
        // Update stat cards with animation
        this.animateNumber('todayBookings', stats.todayBookings);
        this.animateNumber('confirmedBookings', stats.confirmedBookings);
        this.animateNumber('pendingBookings', stats.pendingBookings);
        this.animateNumber('totalCustomers', stats.totalCustomers);
        
        // Update quick stats
        this.animateNumber('totalRevenue', stats.totalRevenue);
        this.animateNumber('weeklyBookings', stats.weeklyBookings);
        this.updateText('completionRate', stats.completionRate + '%');

        // Update notification badge
        const notificationBadge = document.getElementById('notificationCount');
        if (notificationBadge) {
            notificationBadge.textContent = stats.pendingBookings;
        }

        // Load recent bookings
        this.loadRecentBookings();

        // Load mini calendar
        this.loadMiniCalendar();
    },

    // Animate number
    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 1000;
        const start = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * (target - start) + start);
            
            element.textContent = value;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    // Update text content
    updateText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    },

    // Load recent bookings
    loadRecentBookings() {
        const bookings = DB.getBookings();
        const tableBody = document.getElementById('bookingsTableBody');
        const noBookingsMsg = document.getElementById('noBookingsMessage');
        
        if (!tableBody) return;

        // Sort by date (newest first)
        const sortedBookings = bookings.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 10);

        if (sortedBookings.length === 0) {
            tableBody.innerHTML = '';
            if (noBookingsMsg) noBookingsMsg.style.display = 'block';
            return;
        }

        if (noBookingsMsg) noBookingsMsg.style.display = 'none';

        tableBody.innerHTML = sortedBookings.map(booking => this.renderBookingRow(booking)).join('');
    },

    // Render booking row
    renderBookingRow(booking) {
        const statusClass = this.getStatusClass(booking.status);
        const statusText = this.getStatusText(booking.status);
        
        return `
            <tr>
                <td><span class="booking-id">#${booking.id}</span></td>
                <td>
                    <div class="customer-info">
                        <span class="customer-name">${booking.customer?.name || '-'}</span>
                        <span class="customer-email">${booking.customer?.email || '-'}</span>
                    </div>
                </td>
                <td>${booking.serviceName || '-'}</td>
                <td>${this.formatDate(booking.date)}</td>
                <td>${this.formatTime(booking.time)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="Dashboard.viewBooking(${booking.id})" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="Dashboard.editBooking(${booking.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="Dashboard.deleteBooking(${booking.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    // Get status class
    getStatusClass(status) {
        const classes = {
            'confirmed': 'status-confirmed',
            'pending': 'status-pending',
            'cancelled': 'status-cancelled',
            'completed': 'status-completed'
        };
        return classes[status] || '';
    },

    // Get status text
    getStatusText(status) {
        const texts = {
            'confirmed': 'مؤكد',
            'pending': 'معلق',
            'cancelled': 'ملغى',
            'completed': 'مكتمل'
        };
        return texts[status] || status;
    },

    // Format date
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format time
    formatTime(time) {
        if (!time) return '-';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        if (hour < 12) {
            return `${hour}:${minutes} صباحاً`;
        } else if (hour === 12) {
            return `${hour}:${minutes} ظهراً`;
        } else {
            return `${hour - 12}:${minutes} مساءً`;
        }
    },

    // Load mini calendar
    loadMiniCalendar() {
        const miniCalendar = document.getElementById('miniCalendar');
        if (!miniCalendar) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                           'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        // Get bookings for this month
        const bookings = DB.getBookings();
        const monthBookings = bookings.filter(b => {
            const bDate = new Date(b.date);
            return bDate.getFullYear() === year && bDate.getMonth() === month;
        });

        let html = `
            <div class="mini-calendar-header">
                <h4>${monthNames[month]} ${year}</h4>
            </div>
            <div class="mini-calendar-grid">
                <div class="day-name">أحد</div>
                <div class="day-name">إثن</div>
                <div class="day-name">ثلا</div>
                <div class="day-name">أرب</div>
                <div class="day-name">خمي</div>
                <div class="day-name">جمع</div>
                <div class="day-name">سبت</div>
        `;

        // Empty cells for days before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="day empty"></div>';
        }

        // Days of month
        for (let day = 1; day <= totalDays; day++) {
            const hasBooking = monthBookings.some(b => 
                new Date(b.date).getDate() === day
            );
            const isToday = day === today.getDate();
            
            html += `
                <div class="day ${hasBooking ? 'has-booking' : ''} ${isToday ? 'today' : ''}">
                    ${day}
                </div>
            `;
        }

        html += '</div>';
        miniCalendar.innerHTML = html;
    },

    // Load all bookings
    loadBookings() {
        let bookings = DB.getBookings();
        
        // Apply filters
        if (this.filters.status !== 'all') {
            bookings = bookings.filter(b => b.status === this.filters.status);
        }
        
        if (this.filters.date) {
            bookings = bookings.filter(b => b.date === this.filters.date);
        }
        
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            bookings = bookings.filter(b => 
                b.customer?.name?.toLowerCase().includes(search) ||
                b.customer?.email?.toLowerCase().includes(search) ||
                b.id.toString().includes(search)
            );
        }

        // Sort by date
        bookings.sort((a, b) => new Date(b.date) - new Date(a.date));

        const tableBody = document.getElementById('bookingsTableBody');
        if (!tableBody) return;

        if (bookings.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px;">
                        <i class="fas fa-calendar-times" style="font-size: 3rem; color: #9CA3AF; margin-bottom: 15px;"></i>
                        <p style="color: #6B7280;">لا توجد مواعيد</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = bookings.map(booking => this.renderBookingRow(booking)).join('');
    },

    // Load calendar page
    loadCalendar() {
        console.log('Loading calendar...');
    },

    // Load services page
    loadServices() {
        console.log('Loading services...');
    },

    // Load customers page
    loadCustomers() {
        console.log('Loading customers...');
    },

    // Load reports page
    loadReports() {
        console.log('Loading reports...');
    },

    // Load settings page
    loadSettings() {
        console.log('Loading settings...');
    },

    // Show add booking modal
    showAddBookingModal() {
        this.currentBooking = null;
        document.getElementById('modalTitle').textContent = 'إضافة حجز جديد';
        document.getElementById('bookingModalForm').reset();
        document.getElementById('bookingId').value = '';
        this.openModal('bookingModal');
    },

    // View booking
    viewBooking(id) {
        const booking = DB.getBookingById(id);
        if (!booking) return;

        // Populate modal with booking data
        document.getElementById('modalTitle').textContent = 'تفاصيل الحجز';
        document.getElementById('bookingId').value = booking.id;
        document.getElementById('modalCustomerName').value = booking.customer?.name || '';
        document.getElementById('modalCustomerPhone').value = booking.customer?.phone || '';
        document.getElementById('modalCustomerEmail').value = booking.customer?.email || '';
        document.getElementById('modalService').value = booking.service || '';
        document.getElementById('modalDate').value = booking.date || '';
        document.getElementById('modalTime').value = booking.time || '';
        document.getElementById('modalStatus').value = booking.status || 'confirmed';
        document.getElementById('modalNotes').value = booking.customer?.notes || '';

        this.openModal('bookingModal');
    },

    // Edit booking
    editBooking(id) {
        this.viewBooking(id);
        document.getElementById('modalTitle').textContent = 'تعديل الحجز';
    },

    // Delete booking
    deleteBooking(id) {
        this.currentBooking = id;
        this.openModal('deleteModal');
    },

    // Confirm delete
    confirmDelete() {
        if (this.currentBooking) {
            DB.deleteBooking(this.currentBooking);
            this.showToast('تم حذف الحجز بنجاح', 'success');
            this.loadDashboardData();
            this.loadBookings();
        }
        this.closeModal('deleteModal');
        this.currentBooking = null;
    },

    // Save booking
    saveBooking() {
        const form = document.getElementById('bookingModalForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const bookingId = document.getElementById('bookingId').value;
        const bookingData = {
            date: document.getElementById('modalDate').value,
            time: document.getElementById('modalTime').value,
            service: document.getElementById('modalService').value,
            serviceName: document.getElementById('modalService').options[document.getElementById('modalService').selectedIndex].text,
            status: document.getElementById('modalStatus').value,
            customer: {
                name: document.getElementById('modalCustomerName').value,
                phone: document.getElementById('modalCustomerPhone').value,
                email: document.getElementById('modalCustomerEmail').value,
                notes: document.getElementById('modalNotes').value
            },
            price: this.getServicePrice(document.getElementById('modalService').value)
        };

        if (bookingId) {
            // Update existing booking
            DB.updateBooking(parseInt(bookingId), bookingData);
            this.showToast('تم تحديث الحجز بنجاح', 'success');
        } else {
            // Add new booking
            DB.addBooking(bookingData);
            this.showToast('تم إضافة الحجز بنجاح', 'success');
        }

        this.closeModal('bookingModal');
        this.loadDashboardData();
        this.loadBookings();
    },

    // Get service price
    getServicePrice(serviceId) {
        const services = {
            'consultation': 150,
            'technical': 250,
            'business': 350,
            'training': 500
        };
        return services[serviceId] || 0;
    },

    // Open modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Show notifications
    showNotifications() {
        const pendingBookings = DB.getBookingsByStatus('pending');
        if (pendingBookings.length > 0) {
            this.showToast(`لديك ${pendingBookings.length} مواعيد معلقة`, 'info');
        } else {
            this.showToast('لا توجد إشعارات جديدة', 'info');
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Get toast icon
    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'times-circle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    // Logout
    logout() {
        DB.logout();
        window.location.href = 'login.html';
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

// Export to global
window.Dashboard = Dashboard;
