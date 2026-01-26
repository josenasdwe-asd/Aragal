import { createConfetti, hexToRgb } from './utils.js';

export function initUI() {
    initNavbar();
    initMobileMenu();
    initScrollProgress();
    initThemeToggle();
    initEasterEgg();
    initColorPicker();
    initTimeGreeting();
}

// Dynamic Navbar Background
function initNavbar() {
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    } else {
        console.warn('Header element not found - navbar background animation disabled');
    }
}

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Scroll Progress Indicator
export function updateScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress');
    if (!scrollProgress) return;

    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;

    scrollProgress.style.width = progress + '%';
}

function initScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('load', updateScrollProgress);
        // Scroll listener is added in main.js via throttle
    } else {
        console.warn('Scroll progress element not found');
    }
}

// Dark/Light Mode Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.warn('Theme toggle button not found - dark mode toggle disabled');
        return;
    }
    const themeIcon = themeToggle?.querySelector('.theme-icon');

    const savedTheme = localStorage.getItem('aragal-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');

        if (themeIcon) {
            themeIcon.textContent = isLight ? '☀️' : '🌙';
        }

        localStorage.setItem('aragal-theme', isLight ? 'light' : 'dark');

        themeToggle.classList.add('is-animating');
        setTimeout(() => {
            themeToggle.classList.remove('is-animating');
        }, 300);
    });
}

// Easter Egg - Logo Click
function initEasterEgg() {
    let logoClickCount = 0;
    let logoClickTimeout;
    const logo = document.getElementById('logo-aragal');

    if (logo) {
        logo.addEventListener('click', () => {
            logoClickCount++;
            clearTimeout(logoClickTimeout);
            logoClickTimeout = setTimeout(() => {
                logoClickCount = 0;
            }, 2000);

            if (logoClickCount === 5) {
                logo.classList.add('easter-egg-active');
                createConfetti();

                const message = document.createElement('div');
                message.className = 'easter-egg-message';
                message.innerHTML = '🎵 ¡Descubriste el secreto de ARAGAL! 🎵<br><small>Gracias por explorar</small>';
                document.body.appendChild(message);

                setTimeout(() => {
                    message.classList.add('is-fading-out');
                    setTimeout(() => message.remove(), 500);
                    logo.classList.remove('easter-egg-active');
                }, 3000);

                logoClickCount = 0;
            }
        });
    }
}

// Interactive Color Palette Picker
function initColorPicker() {
    const colorPickerToggle = document.getElementById('color-picker-toggle');
    const colorOptions = document.getElementById('color-options');
    const colorButtons = document.querySelectorAll('.color-option');

    const savedColor = localStorage.getItem('aragal-accent-color');
    if (savedColor) {
        changeAccentColor(savedColor);
        updateActiveColorButton(savedColor);
    }

    if (colorPickerToggle) {
        colorPickerToggle.addEventListener('click', () => {
            const isActive = colorOptions.classList.toggle('active');
            colorPickerToggle.classList.toggle('is-open', isActive);
        });
    }

    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.getAttribute('data-color');
            changeAccentColor(color);
            updateActiveColorButton(color);
            localStorage.setItem('aragal-accent-color', color);
            colorOptions.classList.remove('active');
            colorPickerToggle.classList.remove('is-open');
        });
    });

    function changeAccentColor(color) {
        document.documentElement.style.setProperty('--accent', color);
        const rgb = hexToRgb(color);
        if (rgb) {
            document.documentElement.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }

    function updateActiveColorButton(color) {
        colorButtons.forEach(btn => {
            if (btn.getAttribute('data-color') === color) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Time-Based Greetings
function initTimeGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    let emoji = '';

    if (hour >= 6 && hour < 12) {
        greeting = 'Buenos días';
        emoji = '🌅';
    } else if (hour >= 12 && hour < 20) {
        greeting = 'Buenas tardes';
        emoji = '☀️';
    } else if (hour >= 20 && hour < 24) {
        greeting = 'Buenas noches';
        emoji = '🌙';
    } else {
        greeting = 'Buenas madrugadas';
        emoji = '✨';
    }

    // Add specific div if not strictly present in HTML, or just append
    // In main.js audit, this was creating a div.
    const greetingEl = document.createElement('div');
    greetingEl.className = 'time-greeting';
    greetingEl.textContent = `${emoji} ${greeting}, bienvenido a ARAGAL`;
    document.body.appendChild(greetingEl);

    setTimeout(() => {
        greetingEl.classList.add('show');
    }, 1000);

    setTimeout(() => {
        greetingEl.classList.remove('show');
        setTimeout(() => greetingEl.remove(), 500);
    }, 5000); // Show for a bit longer
}

