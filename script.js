document.addEventListener('DOMContentLoaded', () => {
// console.log('[OPANAF DEBUG] DOMContentLoaded. Script is running.');
    // =========================================================================
    //  FUNCTION DEFINITIONS
    // =========================================================================

    /**
     * Fetches and injects HTML content into a specified element.
     */
    const loadComponent = (url, elementId) => {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${url}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const element = document.getElementById(elementId);
                if (element) {
                    element.innerHTML = data;
                }
            })
            .catch(error => console.error(`Error loading component from ${url}:`, error));
    };

    /**
     * Comprehensive theme management system
     */
    const themeManager = {
        initialized: false,
        
        // Initialize theme system
        init() {
            if (this.initialized) {
                // console.log('[THEME] Already initialized, skipping...');
                return;
            }
            
            // console.log('[THEME] Initializing theme system...');
            this.applyTheme();
            this.watchSystemPreference();
            this.initialized = true;
        },

        // Get current theme preference
        getTheme() {
            if ('theme' in localStorage) {
                return localStorage.theme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        },

        // Apply theme to document
        applyTheme(theme = null) {
            const targetTheme = theme || this.getTheme();
            const isDark = targetTheme === 'dark';
            
            // console.log(`[THEME] Applying theme: ${targetTheme}`);
            
            // Remove both classes completely, then add the correct one
            const htmlElement = document.documentElement;
            htmlElement.classList.remove('dark', 'light');
            
            // Force a reflow to ensure the removal takes effect
            htmlElement.offsetHeight;
            
            // Add the target theme class
            htmlElement.classList.add(targetTheme);
            
            // Add debug attribute to help verify theme application
            htmlElement.setAttribute('data-theme', targetTheme);
            
            // Store preference (always store when explicitly changing theme)
            localStorage.theme = targetTheme;
            
            // console.log(`[THEME] Final classes: ${htmlElement.className}`);
            // console.log(`[THEME] Data theme: ${htmlElement.getAttribute('data-theme')}`);
            
            // Update all theme toggle buttons and icons
            this.updateThemeControls(isDark);
            
            // Force a style recalculation to ensure theme applies
            document.documentElement.style.display = 'none';
            document.documentElement.offsetHeight; // Trigger reflow
            document.documentElement.style.display = '';
        },

        // Update all theme toggle controls
        updateThemeControls(isDark) {
            const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
            const sunIcons = document.querySelectorAll('.sun-icon');
            const moonIcons = document.querySelectorAll('.moon-icon');

            // console.log(`[THEME] Updating ${themeToggleBtns.length} toggle buttons`);
            
            sunIcons.forEach(icon => icon.classList.toggle('hidden', isDark));
            moonIcons.forEach(icon => icon.classList.toggle('hidden', !isDark));
        },

        // Toggle between light and dark themes
        toggle() {
            const currentTheme = this.getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            // console.log(`[THEME] Toggling from ${currentTheme} to ${newTheme}`);
            
            // Store theme immediately
            localStorage.setItem('theme', newTheme);
            
            // Apply theme directly like the test page
            const htmlElement = document.documentElement;
            htmlElement.classList.remove('dark', 'light');
            htmlElement.offsetHeight; // Force reflow
            htmlElement.classList.add(newTheme);
            htmlElement.setAttribute('data-theme', newTheme);
            
            // console.log(`[THEME] Toggle complete - classes: ${htmlElement.className}`);
            
            // Update button states
            this.updateThemeControls(newTheme === 'dark');
        },

        // Watch for system preference changes
        watchSystemPreference() {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!('theme' in localStorage)) {
                    // console.log('[THEME] System preference changed, applying new theme');
                    this.applyTheme();
                }
            });
        },

        // Attach event listeners to theme toggle buttons
        attachEventListeners() {
            const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
            // console.log(`[THEME] Attaching listeners to ${themeToggleBtns.length} buttons`);
            
            // Remove any existing listeners first
            themeToggleBtns.forEach((btn) => {
                btn.removeEventListener('click', this.handleToggleClick);
            });
            
            // Bind the toggle function to maintain 'this' context
            this.handleToggleClick = (e) => {
                e.preventDefault();
                // console.log(`[THEME] Toggle button clicked`);
                
                // Use the same logic as the test page force buttons
                const currentTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                // console.log(`[THEME] Switching from ${currentTheme} to ${newTheme}`);
                
                // Store and apply theme immediately
                localStorage.setItem('theme', newTheme);
                
                // Apply like the test page
                const htmlElement = document.documentElement;
                htmlElement.classList.remove('dark', 'light');
                htmlElement.offsetHeight; // Force reflow
                htmlElement.classList.add(newTheme);
                htmlElement.setAttribute('data-theme', newTheme);
                
                // console.log(`[THEME] Applied classes: ${htmlElement.className}`);
                
                // Update button states
                this.updateThemeControls(newTheme === 'dark');
            };
            
            themeToggleBtns.forEach((btn) => {
                btn.addEventListener('click', this.handleToggleClick);
            });

            // Sync theme controls
            this.updateThemeControls(this.getTheme() === 'dark');
        }
    };

    /**
     * Initializes all event listeners for interactive elements.
     */
    const initializeInteractiveElements = () => {
        // console.log('[OPANAF DEBUG] Initializing interactive elements...');
        
        // Initialize theme system with event listeners
        themeManager.attachEventListeners();

        // --- Mobile Menu ---
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                const isExpanded = mobileMenu.classList.toggle('hidden');
                mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            });
            mobileMenu.querySelectorAll('a, button').forEach(item => {
                item.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                });
            });
        }

        // --- Programs Dropdown ---
        const dropdownContainer = document.getElementById('programs-dropdown-container');
        const dropdownButton = document.getElementById('programs-dropdown-button');
        const dropdown = document.getElementById('programs-dropdown');
        if (dropdownContainer && dropdownButton && dropdown) {
            let dropdownTimeout;
            const openDropdown = () => {
                clearTimeout(dropdownTimeout);
                dropdown.classList.remove('hidden');
                dropdownButton.setAttribute('aria-expanded', 'true');
            };
            const closeDropdown = () => {
                dropdownTimeout = setTimeout(() => {
                    dropdown.classList.add('hidden');
                    dropdownButton.setAttribute('aria-expanded', 'false');
                }, 200);
            };
            dropdownButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const isCurrentlyHidden = dropdown.classList.toggle('hidden');
                dropdownButton.setAttribute('aria-expanded', !isCurrentlyHidden);
            });
            dropdownContainer.addEventListener('mouseenter', openDropdown);
            dropdownContainer.addEventListener('mouseleave', closeDropdown);
            document.addEventListener('click', (e) => {
                if (!dropdownContainer.contains(e.target)) {
                    dropdown.classList.add('hidden');
                    dropdownButton.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // --- Modal Logic ---
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modal-content');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const openModalBtns = document.querySelectorAll('.join-us-btn');

        if (modal && modalContent && closeModalBtn) {
            const openModal = () => {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                setTimeout(() => modalContent.classList.remove('scale-95'), 10);
                closeModalBtn.focus();
            };
            const closeModal = () => {
                modalContent.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }, 200);
            };
            openModalBtns.forEach(btn => btn.addEventListener('click', openModal));
            closeModalBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
            });
        }

        // --- Coming Soon Modal Logic ---
        const comingSoonModal = document.getElementById('coming-soon-modal');
        const closeComingSoonBtn = document.getElementById('close-coming-soon-btn');

        if (comingSoonModal && closeComingSoonBtn) {
            const openComingSoonModal = (featureName = 'this feature', timeline = 'Q1 2025') => {
                // Update modal content
                document.getElementById('cs-feature-name').value = featureName;
                document.getElementById('cs-timeline').textContent = timeline;
                
                // Show modal
                comingSoonModal.classList.remove('hidden');
                comingSoonModal.classList.add('flex');
                setTimeout(() => {
                    const modalContent = comingSoonModal.querySelector('.bg-white, .dark\\:bg-slate-800');
                    modalContent.classList.remove('scale-95');
                    modalContent.classList.add('scale-100');
                }, 10);
            };

            const closeComingSoonModal = () => {
                const modalContent = comingSoonModal.querySelector('.bg-white, .dark\\:bg-slate-800');
                modalContent.classList.add('scale-95');
                modalContent.classList.remove('scale-100');
                setTimeout(() => {
                    comingSoonModal.classList.add('hidden');
                    comingSoonModal.classList.remove('flex');
                }, 200);
            };

            // Event listeners
            closeComingSoonBtn.addEventListener('click', closeComingSoonModal);
            comingSoonModal.addEventListener('click', (e) => {
                if (e.target === comingSoonModal) closeComingSoonModal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !comingSoonModal.classList.contains('hidden')) closeComingSoonModal();
            });

            // Expose function globally for other scripts to use
            window.showComingSoonModal = openComingSoonModal;

            // Handle form submission
            const comingSoonForm = comingSoonModal.querySelector('form');
            if (comingSoonForm) {
                comingSoonForm.addEventListener('submit', (e) => {
                    e.preventDefault(); // Prevent actual form submission for now
                    
                    // Get form data
                    const formData = new FormData(comingSoonForm);
                    const email = formData.get('email');
                    const feature = formData.get('feature');
                    
                    // Basic validation
                    if (!email || !email.includes('@')) {
                        showNotification('Please enter a valid email address.', 'error');
                        return;
                    }
                    
                    // Simulate form submission (you can replace this with actual Netlify form submission)
                    const submitBtn = comingSoonForm.querySelector('button[type="submit"]');
                    const originalText = submitBtn.textContent;
                    submitBtn.textContent = 'Submitting...';
                    submitBtn.disabled = true;
                    
                    setTimeout(() => {
                        // Reset form
                        comingSoonForm.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        
                        closeComingSoonModal();
                        
                        // Show success message
                        showNotification(`Thanks! We'll notify you at ${email} when ${feature} is ready.`, 'success');
                        
                        // Optional: Store email for analytics (localStorage for demo)
                        const emails = JSON.parse(localStorage.getItem('comingSoonEmails') || '[]');
                        emails.push({ email, feature, timestamp: new Date().toISOString() });
                        localStorage.setItem('comingSoonEmails', JSON.stringify(emails));
                    }, 1500);
                });
            }
        }
        
        // Notification system for user feedback
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
            const icon = type === 'success' ? 'check' : type === 'error' ? 'x' : 'info';
            
            notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
            notification.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 inline mr-2"></i>${message}`;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
                // Initialize Lucide icons for the notification
                if (window.lucide) {
                    lucide.createIcons();
                }
            }, 100);
            
            // Auto remove after 4 seconds
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => notification.remove(), 300);
            }, 4000);
        }

        // --- FAQ Toggle Functionality ---
        const faqToggles = document.querySelectorAll('.faq-toggle');
        faqToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const content = toggle.nextElementSibling;
                const icon = toggle.querySelector('i[data-lucide="chevron-down"]');
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !isExpanded);
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
            });
        });

        // --- Donation Amount Selector ---
        const donationOptions = document.querySelectorAll('.donation-option');
        const donationAmountInput = document.getElementById('donation-amount');
        if(donationOptions.length > 0 && donationAmountInput) {
            donationOptions.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    donationAmountInput.value = button.textContent.replace('$', '');
                    donationOptions.forEach(opt => opt.classList.remove('bg-cyan-600', 'text-white'));
                    button.classList.add('bg-cyan-600', 'text-white');
                });
            });
            donationAmountInput.addEventListener('input', () => {
                 donationOptions.forEach(opt => opt.classList.remove('bg-cyan-600', 'text-white'));
            });
        }
        
        // --- Smooth Scrolling for Anchor Links ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.length > 1) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // --- Basic Form Validation ---
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                }
                form.classList.add('was-validated');
            });
        });
    };

    /**
     * Finds the current page and adds an 'active' style to the corresponding nav link.
     */
    const setActiveNavLink = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('#header-placeholder a');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('font-semibold', 'text-cyan-600', 'dark:text-cyan-400');
                if(link.closest('#programs-dropdown')) {
                    const programsButton = document.getElementById('programs-dropdown-button');
                    if (programsButton) {
                        programsButton.classList.add('text-cyan-600', 'dark:text-cyan-400');
                    }
                }
            }
        });
    };

    /**
     * Initializes the Intersection Observer for scroll animations.
     */
    const initializeScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('.fade-in-on-scroll');
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));
    };

    /**
     * Initializes the auto-hiding sticky header functionality.
     */
    const initializeStickyHeader = () => {
        const header = document.getElementById('header');
        if (!header) return;
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll <= 50) {
                header.classList.remove('shadow-lg', '-translate-y-full');
                return;
            }
            if (currentScroll > lastScroll && !header.classList.contains('-translate-y-full')) {
                header.classList.add('-translate-y-full');
            } else if (currentScroll < lastScroll && header.classList.contains('-translate-y-full')) {
                header.classList.remove('-translate-y-full');
                header.classList.add('shadow-lg');
            }
            lastScroll = currentScroll;
        });
    };

    /**
     * Creates and manages the scroll progress bar at the top of the page.
     */
    const initializeScrollProgressBar = () => {
        const progressBar = document.createElement('div');
        progressBar.className = 'h-1 bg-cyan-600 fixed top-0 left-0 z-[60] transition-all duration-150 ease-out';
        progressBar.style.width = '0%';
        document.body.prepend(progressBar);
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        });
    };

    /**
     * Creates and manages the "Back to Top" button.
     */
    const initializeBackToTopButton = () => {
        const backToTopButton = document.createElement('button');
        backToTopButton.setAttribute('aria-label', 'Go to top of page');
        backToTopButton.className = 'fixed bottom-8 right-8 p-3 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 z-40 scale-0';
        backToTopButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>';
        document.body.appendChild(backToTopButton);
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('scale-0');
            } else {
                backToTopButton.classList.add('scale-0');
            }
        });
    };

    // =========================================================================
    //  EXECUTION LOGIC
    // =========================================================================
    
    // Initialize theme system immediately (before loading components)
    // console.log('[OPANAF DEBUG] Starting execution logic.');
    themeManager.init();
    
    // Initialize features that can run immediately
    initializeScrollProgressBar();
    
    const headerPromise = loadComponent('header.html', 'header-placeholder');
    const footerPromise = loadComponent('footer.html', 'footer-placeholder');

    Promise.all([headerPromise, footerPromise]).then(() => {
        // console.log('[OPANAF DEBUG] Header and Footer loaded successfully.');
        lucide.createIcons();
        
        // Re-initialize theme controls now that header/footer are loaded
        themeManager.attachEventListeners();
        
        initializeInteractiveElements();
        setActiveNavLink();
        initializeScrollAnimations();
        initializeStickyHeader();
        initializeBackToTopButton();
    });
});