/* ================================
   Smart Student Portal - JavaScript
   بوابة الطلاب الذكية
   ================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ================================
    // Mobile Menu Toggle
    // ================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Change icon
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close menu when clicking on a link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            if (navLinks) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    });
    
    // ================================
    // Header Scroll Effect
    // ================================
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // ================================
    // Theme Toggle (Dark/Light Mode)
    // ================================
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const body = document.body;
            const icon = this.querySelector('i');
            
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            }
        });
        
        // Check saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }
    
    // ================================
    // Smooth Scrolling for Navigation Links
    // ================================
    const navLinksAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    
    navLinksAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ================================
    // Active Link Highlighting on Scroll
    // ================================
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href') && li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });
    });
    
    // ================================
    // Testimonials Slider
    // ================================
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slider = document.getElementById('testimonialsSlider');
    
    if (slider && prevBtn && nextBtn) {
        let scrollAmount = 0;
        
        nextBtn.addEventListener('click', function() {
            scrollAmount += 350;
            if (scrollAmount > slider.scrollWidth - slider.clientWidth) {
                scrollAmount = 0;
            }
            slider.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
        
        prevBtn.addEventListener('click', function() {
            scrollAmount -= 350;
            if (scrollAmount < 0) {
                scrollAmount = slider.scrollWidth - slider.clientWidth;
            }
            slider.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
    
    // ================================
    // FAQ Accordion
    // ================================
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const icon = this.querySelector('i');
            
            // Toggle current item
            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                answer.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            } else {
                answer.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }
            
            // Close other items
            faqQuestions.forEach(otherQuestion => {
                const otherItem = otherQuestion.parentElement;
                if (otherItem !== faqItem && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherQuestion.querySelector('i');
                    otherAnswer.style.display = 'none';
                    otherIcon.classList.remove('fa-minus');
                    otherIcon.classList.add('fa-plus');
                }
            });
        });
    });
    
    // ================================
    // Contact Form Validation
    // ================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Reset errors
            clearErrors();
            
            // Validation
            let isValid = true;
            
            if (!name || name.length < 2) {
                showError('name', 'الرجاء إدخال اسم صحيح');
                isValid = false;
            }
            
            if (!email || !isValidEmail(email)) {
                showError('email', 'الرجاء إدخال بريد إلكتروني صحيح');
                isValid = false;
            }
            
            if (!message || message.length < 10) {
                showError('message', 'الرجاء إدخال رسالة صحيحة (10 أحرف على الأقل)');
                isValid = false;
            }
            
            if (isValid) {
                // Show success message
                showSuccessMessage('شكراً لك! تم إرسال رسالتنا بنجاح. سنتواصل معك قريباً.');
                
                // Reset form
                contactForm.reset();
                
                // Save to localStorage
                saveContactForm({ name, email, message, date: new Date().toISOString() });
            }
        });
    }
    
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(fieldId + 'Error');
        
        if (field) {
            field.style.borderColor = 'var(--danger-color)';
        }
        
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    }
    
    function clearErrors() {
        const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
        
        const errorSpans = document.querySelectorAll('.error-message');
        errorSpans.forEach(span => {
            span.textContent = '';
        });
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showSuccessMessage(message) {
        // Create success alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        alertDiv.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--accent-color), #059669);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(alertDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    
    function saveContactForm(data) {
        let forms = JSON.parse(localStorage.getItem('contactForms') || '[]');
        forms.push(data);
        localStorage.setItem('contactForms', JSON.stringify(forms));
    }
    
    // ================================
    // Login/Register Form
    // ================================
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authSuccess = document.getElementById('authSuccess');
    
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update tabs
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update forms
            if (loginForm && registerForm && authSuccess) {
                if (tabName === 'login') {
                    loginForm.classList.add('active');
                    registerForm.classList.remove('active');
                    authSuccess.classList.remove('active');
                } else {
                    loginForm.classList.remove('active');
                    registerForm.classList.add('active');
                    authSuccess.classList.remove('active');
                }
            }
        });
    });
    
    // Login Form
    const loginFormElement = document.getElementById('loginFormElement');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            // Clear errors
            clearLoginErrors();
            
            let isValid = true;
            
            if (!email || !isValidEmail(email)) {
                showLoginError('loginEmail', 'الرجاء إدخال بريد إلكتروني صحيح');
                isValid = false;
            }
            
            if (!password || password.length < 6) {
                showLoginError('loginPassword', 'الرجاء إدخال كلمة مرور صحيحة');
                isValid = false;
            }
            
            if (isValid) {
                // Check stored users
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    // Login successful
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    showAuthSuccess('تم تسجيل دخولك بنجاح!', 'dashboard.html');
                } else {
                    // Show error
                    showLoginError('loginPassword', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
                }
            }
        });
    }
    
    // Register Form
    const registerFormElement = document.getElementById('registerFormElement');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Clear errors
            clearRegisterErrors();
            
            let isValid = true;
            
            if (!firstName || firstName.length < 2) {
                showRegisterError('firstName', 'الرجاء إدخال اسم صحيح');
                isValid = false;
            }
            
            if (!lastName || lastName.length < 2) {
                showRegisterError('lastName', 'الرجاء إدخال اسم عائلة صحيح');
                isValid = false;
            }
            
            if (!email || !isValidEmail(email)) {
                showRegisterError('registerEmail', 'الرجاء إدخال بريد إلكتروني صحيح');
                isValid = false;
            }
            
            if (!password || password.length < 6) {
                showRegisterError('registerPassword', 'الرجاء إدخال كلمة مرور (6 أحرف على الأقل)');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                showRegisterError('confirmPassword', 'كلمات المرور غير متطابقة');
                isValid = false;
            }
            
            if (!terms) {
                alert('الرجاء الموافقة على الشروط والأحكام');
                isValid = false;
            }
            
            if (isValid) {
                // Check if email already exists
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const existingUser = users.find(u => u.email === email);
                
                if (existingUser) {
                    showRegisterError('registerEmail', 'البريد الإلكتروني مستخدم already');
                } else {
                    // Create new user
                    const newUser = {
                        id: Date.now(),
                        firstName,
                        lastName,
                        email,
                        password,
                        educationLevel: document.getElementById('educationLevel')?.value || 'student',
                        createdAt: new Date().toISOString()
                    };
                    
                    users.push(newUser);
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(newUser));
                    
                    // Show success
                    showAuthSuccess('تم إنشاء حسابك بنجاح!', 'dashboard.html');
                }
            }
        });
        
        // Password strength indicator
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', function() {
                updatePasswordStrength(this.value);
            });
        }
    }
    
    function updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        const percentage = (strength / 5) * 100;
        strengthBar.style.width = percentage + '%';
        
        if (strength <= 2) {
            strengthBar.style.background = 'var(--danger-color)';
            strengthText.textContent = 'ضعيفة';
            strengthText.style.color = 'var(--danger-color)';
        } else if (strength <= 3) {
            strengthBar.style.background = 'var(--warning-color)';
            strengthText.textContent = 'متوسطة';
            strengthText.style.color = 'var(--warning-color)';
        } else {
            strengthBar.style.background = 'var(--accent-color)';
            strengthText.textContent = 'قوية';
            strengthText.style.color = 'var(--accent-color)';
        }
    }
    
    function showLoginError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(fieldId + 'Error');
        
        if (field) field.style.borderColor = 'var(--danger-color)';
        if (errorSpan) errorSpan.textContent = message;
    }
    
    function clearLoginErrors() {
        const inputs = loginFormElement.querySelectorAll('input');
        inputs.forEach(input => input.style.borderColor = '');
        
        const errors = loginFormElement.querySelectorAll('.error-message');
        errors.forEach(e => e.textContent = '');
    }
    
    function showRegisterError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.getElementById(fieldId + 'Error');
        
        if (field) field.style.borderColor = 'var(--danger-color)';
        if (errorSpan) errorSpan.textContent = message;
    }
    
    function clearRegisterErrors() {
        const inputs = registerFormElement.querySelectorAll('input, select');
        inputs.forEach(input => input.style.borderColor = '');
        
        const errors = registerFormElement.querySelectorAll('.error-message');
        errors.forEach(e => e.textContent = '');
    }
    
    function showAuthSuccess(message, redirectUrl) {
        const successMessage = document.getElementById('successMessage');
        const successButton = document.getElementById('successButton');
        
        if (loginForm) loginForm.classList.remove('active');
        if (registerForm) registerForm.classList.remove('active');
        if (authSuccess) {
            authSuccess.classList.add('active');
            if (successMessage) successMessage.textContent = message;
            
            if (successButton) {
                successButton.onclick = function() {
                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    } else {
                        window.location.reload();
                    }
                };
            }
        }
    }
    
    // Toggle password visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
    
    // ================================
    // User Dropdown
    // ================================
    const userBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', function() {
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!userBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }
    
    // ================================
    // Dashboard Stats Animation
    // ================================
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const count = parseInt(target.dataset.count);
                    animateNumber(target, 0, count, 2000);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    function animateNumber(element, start, end, duration) {
        let startTime = null;
        
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        }
        
        requestAnimationFrame(step);
    }
    
    // ================================
    // Scroll Animation - Fade In Elements
    // ================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observe cards
    const cards = document.querySelectorAll('.feature-card, .service-card, .project-card, .team-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
        fadeObserver.observe(card);
    });
    
    // Add animation class styles
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    
    // ================================
    // Back to Top Button
    // ================================
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        box-shadow: 0 5px 20px rgba(79, 70, 229, 0.4);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
    `;
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    backToTop.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    backToTop.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    // ================================
    // Console Welcome Message
    // ================================
    console.log('%c 🌟 بوابة الطلاب الذكية 🌟 ', 'background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 15px 25px; font-size: 18px; border-radius: 10px;');
    console.log('%c مرحباً بك في بوابة الطلاب الذكية! 🎓 ', 'color: #4F46E5; font-size: 14px;');
    console.log('%c تم تطوير هذا الموقع باستخدام HTML, CSS, JavaScript فقط ', 'color: #7C3AED; font-size: 12px;');
    console.log('%c هل أنت مستعد لتعلم البرمجة؟ 🚀 ', 'color: #10B981; font-size: 12px;');
});
