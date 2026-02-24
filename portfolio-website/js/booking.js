/* ================================
   Booking System JavaScript
   نظام حجز المواعيد
   ================================ */

// Booking System Configuration
const BookingSystem = {
    // Service prices and durations
    services: {
        consultation: { name: 'استشارة عامة', price: 150, duration: 30 },
        technical: { name: 'استشارة تقنية', price: 250, duration: 60 },
        business: { name: 'استشارة أعمال', price: 350, duration: 90 },
        training: { name: 'تدريب شخصي', price: 500, duration: 120 }
    },
    
    // Available time slots
    timeSlots: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
    
    // Booking duration in minutes
    slotDuration: 60,
    
    // Current state
    currentDate: new Date(),
    selectedDate: null,
    selectedTime: null,
    selectedService: null,
    
    // Unavailable dates ( weekends - example)
    unavailableDates: [],
    
    // Initialize the booking system
    init() {
        this.renderCalendar();
        this.setupEventListeners();
        this.loadBookings();
    },
    
    // Render the calendar
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        document.getElementById('currentMonthYear').textContent = `${monthNames[month]} ${year}`;
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        // Previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = prevMonthDays - i;
            calendarDays.appendChild(day);
        }
        
        // Current month days
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDayDate = new Date(year, month, day);
            
            // Check if date is in the past
            if (currentDayDate < today.setHours(0, 0, 0, 0)) {
                dayElement.classList.add('disabled');
            }
            // Check if it's today
            else if (this.isToday(year, month, day)) {
                dayElement.classList.add('today');
            }
            // Check if date is unavailable (weekend example)
            else if (this.isUnavailable(year, month, day)) {
                dayElement.classList.add('unavailable');
            }
            // Check if fully booked
            else if (this.isFullyBooked(year, month, day)) {
                dayElement.classList.add('unavailable');
            }
            // Make it clickable
            else {
                dayElement.addEventListener('click', () => this.selectDate(year, month, day));
            }
            
            calendarDays.appendChild(dayElement);
        }
        
        // Next month days to fill the grid
        const remainingDays = 42 - (firstDay + totalDays);
        for (let i = 1; i <= remainingDays; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = i;
            calendarDays.appendChild(day);
        }
    },
    
    // Check if date is today
    isToday(year, month, day) {
        const today = new Date();
        return year === today.getFullYear() && 
               month === today.getMonth() && 
               day === today.getDate();
    },
    
    // Check if date is unavailable (Friday = 5, Saturday = 6)
    isUnavailable(year, month, day) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        // Make Friday and Saturday unavailable
        return dayOfWeek === 5 || dayOfWeek === 6;
    },
    
    // Check if date is fully booked
    isFullyBooked(year, month, day) {
        const bookings = this.getBookings();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Count bookings for this date
        const bookingsForDate = bookings.filter(b => b.date === dateStr);
        
        // If all time slots are booked
        return bookingsForDate.length >= this.timeSlots.length;
    },
    
    // Select a date
    selectDate(year, month, day) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked day
        const dayElement = event.target;
        dayElement.classList.add('selected');
        
        // Set selected date
        this.selectedDate = new Date(year, month, day);
        
        // Update selected date text
        const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        document.getElementById('selectedDateText').textContent = 
            `${dayNames[this.selectedDate.getDay()]}، ${dayNames[this.selectedDate.getDate()]} ${monthNames[this.selectedDate.getMonth()]}`;
        
        // Update time slots
        this.updateTimeSlots();
        
        // Update booking summary
        this.updateBookingSummary();
    },
    
    // Update time slots availability
    updateTimeSlots() {
        const timeSlotsContainer = document.getElementById('timeSlots');
        const noDateMessage = document.getElementById('noDateMessage');
        
        if (!this.selectedDate) {
            timeSlotsContainer.style.display = 'none';
            noDateMessage.style.display = 'block';
            return;
        }
        
        timeSlotsContainer.style.display = 'grid';
        noDateMessage.style.display = 'none';
        
        const bookings = this.getBookings();
        const dateStr = this.formatDate(this.selectedDate);
        const bookedTimes = bookings
            .filter(b => b.date === dateStr && b.status !== 'cancelled')
            .map(b => b.time);
        
        // Update each time slot
        document.querySelectorAll('.time-slot').forEach(slot => {
            const time = slot.dataset.time;
            
            // Reset classes
            slot.classList.remove('selected', 'disabled', 'unavailable');
            
            // Check if time is booked
            if (bookedTimes.includes(time)) {
                slot.classList.add('unavailable');
                slot.innerHTML = '<span>' + this.formatTime(time) + ' (محجوز)</span>';
            } else {
                slot.classList.remove('unavailable');
                slot.innerHTML = '<span>' + this.formatTime(time) + '</span>';
                slot.addEventListener('click', () => this.selectTime(time));
            }
        });
    },
    
    // Select time slot
    selectTime(time) {
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked time
        const timeSlot = document.querySelector(`.time-slot[data-time="${time}"]`);
        timeSlot.classList.add('selected');
        
        this.selectedTime = time;
        
        // Update booking summary
        this.updateBookingSummary();
    },
    
    // Update booking summary
    updateBookingSummary() {
        const dateStr = document.getElementById('summaryDate');
        const timeStr = document.getElementById('summaryTime');
        const serviceStr = document.getElementById('summaryService');
        const priceStr = document.getElementById('summaryPrice');
        
        // Update date
        if (this.selectedDate) {
            const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'جمعة', 'السبت'];
            const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                              'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            dateStr.textContent = `${dayNames[this.selectedDate.getDay()]}، ${this.selectedDate.getDate()} ${monthNames[this.selectedDate.getMonth()]}`;
        } else {
            dateStr.textContent = '-';
        }
        
        // Update time
        if (this.selectedTime) {
            timeStr.textContent = this.formatTime(this.selectedTime);
        } else {
            timeStr.textContent = '-';
        }
        
        // Update service
        const serviceSelect = document.getElementById('selectedService');
        if (serviceSelect.value) {
            const service = this.services[serviceSelect.value];
            serviceStr.textContent = service.name;
            priceStr.textContent = service.price + ' ريال';
        } else {
            serviceStr.textContent = '-';
            priceStr.textContent = '-';
        }
    },
    
    // Format time from 24h to 12h format
    formatTime(time) {
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
    
    // Format date to YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Previous month button
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        // Next month button
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        
        // Service selection
        document.getElementById('selectedService').addEventListener('change', (e) => {
            this.selectedService = e.target.value;
            this.updateBookingSummary();
            this.updateServiceSelection();
        });
        
        // Service card selection
        document.querySelectorAll('.btn-select-service').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.service-card');
                const serviceId = card.dataset.service;
                
                // Update select dropdown
                document.getElementById('selectedService').value = serviceId;
                this.selectedService = serviceId;
                
                // Update visual selection
                document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                
                // Scroll to booking section
                document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
                
                // Update summary
                this.updateBookingSummary();
            });
        });
        
        // Booking form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBooking();
        });
        
        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Close modal on outside click
        document.getElementById('successModal').addEventListener('click', (e) => {
            if (e.target.id === 'successModal') {
                this.closeModal();
            }
        });
    },
    
    // Update service card selection
    updateServiceSelection() {
        document.querySelectorAll('.service-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.service === this.selectedService) {
                card.classList.add('selected');
            }
        });
    },
    
    // Submit booking
    submitBooking() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Create booking object
        const booking = {
            id: Date.now(),
            date: this.formatDate(this.selectedDate),
            time: this.selectedTime,
            service: this.selectedService,
            serviceName: this.services[this.selectedService].name,
            price: this.services[this.selectedService].price,
            customer: {
                name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                phone: document.getElementById('customerPhone').value,
                notes: document.getElementById('bookingNotes').value
            },
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Save booking
        const bookings = this.getBookings();
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Show success modal
        this.showSuccessModal(booking);
        
        // Reset form
        this.resetForm();
    },
    
    // Validate form
    validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.input-group input, .input-group select, .input-group textarea').forEach(el => {
            el.style.borderColor = '';
        });
        
        // Validate name
        const name = document.getElementById('customerName').value.trim();
        if (!name || name.length < 2) {
            this.showError('customerName', 'الرجاء إدخال اسم صحيح');
            isValid = false;
        }
        
        // Validate email
        const email = document.getElementById('customerEmail').value.trim();
        if (!email || !this.isValidEmail(email)) {
            this.showError('customerEmail', 'الرجاء إدخال بريد إلكتروني صحيح');
            isValid = false;
        }
        
        // Validate phone
        const phone = document.getElementById('customerPhone').value.trim();
        if (!phone || phone.length < 10) {
            this.showError('customerPhone', 'الرجاء إدخال رقم هاتف صحيح');
            isValid = false;
        }
        
        // Validate service
        const service = document.getElementById('selectedService').value;
        if (!service) {
            alert('الرجاء اختيار خدمة');
            isValid = false;
        }
        
        // Validate date and time
        if (!this.selectedDate) {
            alert('الرجاء اختيار تاريخ');
            isValid = false;
        }
        
        if (!this.selectedTime) {
            alert('الرجاء اختيار وقت');
            isValid = false;
        }
        
        return isValid;
    },
    
    // Show error message
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(fieldId + 'Error');
        
        if (field) {
            field.parentElement.style.borderColor = '#EF4444';
        }
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    },
    
    // Validate email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Show success modal
    showSuccessModal(booking) {
        const modal = document.getElementById('successModal');
        const detailsContainer = document.getElementById('modalBookingDetails');
        
        // Format date for display
        const dateParts = booking.date.split('-');
        const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        detailsContainer.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">رقم الحجز:</span>
                <span class="detail-value">#${booking.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">التاريخ:</span>
                <span class="detail-value">${displayDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">الوقت:</span>
                <span class="detail-value">${this.formatTime(booking.time)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">الخدمة:</span>
                <span class="detail-value">${booking.serviceName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">السعر:</span>
                <span class="detail-value">${booking.price} ريال</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">الاسم:</span>
                <span class="detail-value">${booking.customer.name}</span>
            </div>
        `;
        
        modal.classList.add('active');
    },
    
    // Close modal
    closeModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('active');
        
        // Reset selections
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Re-render calendar to show new booking
        this.renderCalendar();
        this.updateTimeSlots();
        this.updateBookingSummary();
    },
    
    // Reset form
    resetForm() {
        document.getElementById('bookingForm').reset();
        document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedService = null;
        this.renderCalendar();
        this.updateBookingSummary();
    },
    
    // Get bookings from localStorage
    getBookings() {
        return JSON.parse(localStorage.getItem('bookings') || '[]');
    },
    
    // Load bookings (for testing)
    loadBookings() {
        // You can pre-populate with some test data if needed
        console.log('Bookings loaded:', this.getBookings());
    }
};

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    BookingSystem.init();
});

// Export for use in other files
window.BookingSystem = BookingSystem;
