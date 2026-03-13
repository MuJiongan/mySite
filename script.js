document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);

    // Set the toggle position based on current theme
    if (currentTheme === 'dark') {
        themeToggle.checked = true;
    }

    // Theme toggle event listener
    themeToggle.addEventListener('change', function () {
        if (this.checked) {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');

    mobileMenu.addEventListener('click', function () {
        const isExpanded = mobileMenu.getAttribute('aria-expanded') === 'true';
        mobileMenu.setAttribute('aria-expanded', String(!isExpanded));
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            mobileMenu.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Figurine parallax on hero mouse move
    const heroSection = document.querySelector('.hero');
    const figurineData = [
        { selector: '.figurine-coding',  dx: 22, dy: 14 },
        { selector: '.figurine-guitar',  dx: -18, dy: 10 },
        { selector: '.figurine-piano',   dx: 16, dy: -12 },
        { selector: '.figurine-gaming',  dx: -24, dy: -16 },
    ].map(d => ({ ...d, el: document.querySelector(d.selector) }));

    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const rx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const ry = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            figurineData.forEach(({ el, dx, dy }) => {
                if (!el) return;
                el.style.setProperty('--fig-x', (rx * dx).toFixed(1) + 'px');
                el.style.setProperty('--fig-y', (ry * dy).toFixed(1) + 'px');
            });
        });

        heroSection.addEventListener('mouseleave', () => {
            figurineData.forEach(({ el }) => {
                if (!el) return;
                el.style.setProperty('--fig-x', '0px');
                el.style.setProperty('--fig-y', '0px');
            });
        });
    }

    // Active nav section tracking
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    sections.forEach(section => sectionObserver.observe(section));

    // Alternative animation effects
    const animationElements = document.querySelectorAll('.fade-in-title, .reveal-text, .slide-up-text, .float-in, .animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';

                // Get delay from data attribute or default to 0
                let delay = parseInt(entry.target.dataset.delay) || 0;

                // Staggered animation for project cards if they don't have explicit delay
                if (entry.target.classList.contains('project-card') && delay === 0) {
                    const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                    // Add a base delay + staggered amount (e.g., 0ms, 100ms, 200ms)
                    delay = index * 100;
                    // Add class for CSS transition delay if needed, or just use setTimeout
                    entry.target.style.transitionDelay = `${delay}ms`;
                }

                setTimeout(() => {
                    entry.target.classList.add('animate');
                }, delay);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animationElements.forEach(element => {
        observer.observe(element);
    });

    // Live time for Pacific timezone (Vancouver)
    function updatePacificTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", {
            timeZone: "America/Vancouver",
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        const tzParts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Vancouver",
            timeZoneName: 'short'
        }).formatToParts(now);
        const tzName = tzParts.find(p => p.type === 'timeZoneName')?.value ?? 'PT';

        const liveTimeElement = document.getElementById('live-time');
        if (liveTimeElement) {
            liveTimeElement.textContent = `${timeString} ${tzName}`;
        }
    }

    // Update time immediately and then every second; pause when tab is hidden
    updatePacificTime();
    let timeInterval = setInterval(updatePacificTime, 1000);

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            clearInterval(timeInterval);
        } else {
            updatePacificTime();
            timeInterval = setInterval(updatePacificTime, 1000);
        }
    });
});
