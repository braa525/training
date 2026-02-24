/* ================================
   Database Utility - نظام قاعدة البيانات
   Uses localStorage for data persistence
   ================================ */

// Database Configuration
const DB = {
    // Storage Keys
    KEYS: {
        BOOKINGS: 'bookingSystem_bookings',
        USERS: 'bookingSystem_users',
        SERVICES: 'bookingSystem_services',
        SETTINGS: 'bookingSystem_settings',
        CURRENT_USER: 'bookingSystem_currentUser'
    },

    // Initialize default data
    init() {
        this.initServices();
        this.initDefaultAdmin();
        console.log('✅ Database initialized successfully');
    },

    // Initialize default services
    initServices() {
        const existingServices = this.getServices();
        if (existingServices.length === 0) {
            const defaultServices = [
                { id: 'consultation', name: 'استشارة عامة', price: 150, duration: 30, icon: 'fa-comments' },
                { id: 'technical', name: 'استشارة تقنية', price: 250, duration: 60, icon: 'fa-laptop-code' },
                { id: 'business', name: 'استشارة أعمال', price: 350, duration: 90, icon: 'fa-briefcase' },
                { id: 'training', name: 'تدريب شخصي', price: 500, duration: 120, icon: 'fa-chalkboard-teacher' }
            ];
            localStorage.setItem(this.KEYS.SERVICES, JSON.stringify(defaultServices));
        }
    },

    // Initialize default admin user
    initDefaultAdmin() {
        const users = this.getUsers();
        const adminExists = users.find(u => u.role === 'admin');
        
        if (!adminExists) {
            const adminUser = {
                id: 1,
                firstName: 'مدير',
                lastName: 'النظام',
                email: 'admin@booking.com',
                password: 'admin123',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            users.push(adminUser);
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
            console.log('✅ Default admin user created');
        }
    },

    // ================================
    // BOOKINGS OPERATIONS
    // ================================

    // Get all bookings
    getBookings() {
        return JSON.parse(localStorage.getItem(this.KEYS.BOOKINGS) || '[]');
    },

    // Get booking by ID
    getBookingById(id) {
        const bookings = this.getBookings();
        return bookings.find(b => b.id === parseInt(id));
    },

    // Add new booking
    addBooking(booking) {
        const bookings = this.getBookings();
        const newBooking = {
            id: Date.now(),
            ...booking,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        bookings.push(newBooking);
        localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
        return newBooking;
    },

    // Update booking
    updateBooking(id, updates) {
        const bookings = this.getBookings();
        const index = bookings.findIndex(b => b.id === parseInt(id));
        if (index !== -1) {
            bookings[index] = { ...bookings[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(bookings));
            return bookings[index];
        }
        return null;
    },

    // Delete booking
    deleteBooking(id) {
        const bookings = this.getBookings();
        const filtered = bookings.filter(b => b.id !== parseInt(id));
        localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(filtered));
    },

    // Get bookings by date
    getBookingsByDate(date) {
        const bookings = this.getBookings();
        return bookings.filter(b => b.date === date && b.status !== 'cancelled');
    },

    // Get bookings by status
    getBookingsByStatus(status) {
        const bookings = this.getBookings();
        return bookings.filter(b => b.status === status);
    },

    // Get today's bookings
    getTodayBookings() {
        const today = new Date().toISOString().split('T')[0];
        return this.getBookingsByDate(today);
    },

    // Get this week's bookings
    getWeekBookings() {
        const bookings = this.getBookings();
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        
        return bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= weekStart;
        });
    },

    // Check if time slot is available
    isTimeSlotAvailable(date, time) {
        const bookings = this.getBookings();
        return !bookings.some(b => 
            b.date === date && 
            b.time === time && 
            b.status !== 'cancelled'
        );
    },

    // Get booked times for a date
    getBookedTimes(date) {
        const bookings = this.getBookingsByDate(date);
        return bookings.map(b => b.time);
    },

    // ================================
    // USERS OPERATIONS
    // ================================

    // Get all users
    getUsers() {
        return JSON.parse(localStorage.getItem(this.KEYS.USERS) || '[]');
    },

    // Get user by ID
    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === parseInt(id));
    },

    // Add new user
    addUser(user) {
        const users = this.getUsers();
        const newUser = {
            id: Date.now(),
            ...user,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
        return newUser;
    },

    // Update user
    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
            return users[index];
        }
        return null;
    },

    // Delete user
    deleteUser(id) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== parseInt(id));
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(filtered));
    },

    // Find user by email
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email === email);
    },

    // Check if email exists
    emailExists(email) {
        return this.findUserByEmail(email) !== undefined;
    },

    // ================================
    // AUTHENTICATION
    // ================================

    // Login
    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const { password: _, ...safeUser } = user;
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(safeUser));
            return safeUser;
        }
        return null;
    },

    // Logout
    logout() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    // Get current user
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.KEYS.CURRENT_USER) || 'null');
    },

    // Check if logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Check if admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // ================================
    // SERVICES OPERATIONS
    // ================================

    // Get all services
    getServices() {
        return JSON.parse(localStorage.getItem(this.KEYS.SERVICES) || '[]');
    },

    // Get service by ID
    getServiceById(id) {
        const services = this.getServices();
        return services.find(s => s.id === id);
    },

    // Add service
    addService(service) {
        const services = this.getServices();
        const newService = {
            id: Date.now().toString(),
            ...service
        };
        services.push(newService);
        localStorage.setItem(this.KEYS.SERVICES, JSON.stringify(services));
        return newService;
    },

    // Update service
    updateService(id, updates) {
        const services = this.getServices();
        const index = services.findIndex(s => s.id === id);
        if (index !== -1) {
            services[index] = { ...services[index], ...updates };
            localStorage.setItem(this.KEYS.SERVICES, JSON.stringify(services));
            return services[index];
        }
        return null;
    },

    // Delete service
    deleteService(id) {
        const services = this.getServices();
        const filtered = services.filter(s => s.id !== id);
        localStorage.setItem(this.KEYS.SERVICES, JSON.stringify(filtered));
    },

    // ================================
    // STATISTICS
    // ================================

    // Get statistics
    getStatistics() {
        const bookings = this.getBookings();
        const users = this.getUsers();
        
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled');
        
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
        const pendingBookings = bookings.filter(b => b.status === 'pending');
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
        const completedBookings = bookings.filter(b => b.status === 'completed');
        
        // Calculate revenue
        const totalRevenue = bookings
            .filter(b => b.status !== 'cancelled')
            .reduce((sum, b) => sum + (b.price || 0), 0);
        
        // Get unique customers
        const uniqueCustomers = [...new Set(bookings.map(b => b.customer?.email))].length;
        
        // Weekly bookings
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weeklyBookings = bookings.filter(b => new Date(b.date) >= weekStart);
        
        // Completion rate
        const completionRate = bookings.length > 0 
            ? Math.round((completedBookings.length / bookings.length) * 100) 
            : 0;

        return {
            totalBookings: bookings.length,
            todayBookings: todayBookings.length,
            confirmedBookings: confirmedBookings.length,
            pendingBookings: pendingBookings.length,
            cancelledBookings: cancelledBookings.length,
            completedBookings: completedBookings.length,
            totalCustomers: uniqueCustomers,
            totalRevenue: totalRevenue,
            weeklyBookings: weeklyBookings.length,
            completionRate: completionRate
        };
    },

    // ================================
    // EXPORT/IMPORT
    // ================================

    // Export data
    exportData() {
        const data = {
            bookings: this.getBookings(),
            users: this.getUsers(),
            services: this.getServices(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    // Import data
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.bookings) localStorage.setItem(this.KEYS.BOOKINGS, JSON.stringify(data.bookings));
            if (data.users) localStorage.setItem(this.KEYS.USERS, JSON.stringify(data.users));
            if (data.services) localStorage.setItem(this.KEYS.SERVICES, JSON.stringify(data.services));
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    // Clear all data
    clearAllData() {
        localStorage.removeItem(this.KEYS.BOOKINGS);
        localStorage.removeItem(this.KEYS.USERS);
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        this.init(); // Reinitialize with defaults
    }
};

// Initialize database on load
document.addEventListener('DOMContentLoaded', () => {
    DB.init();
});

// Export to global
window.DB = DB;
