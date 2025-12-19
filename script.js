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
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
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

    // Hero name typewriter effect
    const heroName = document.querySelector('.hero-name');
    const heroText = heroName.textContent;
    heroName.textContent = '';

    setTimeout(() => {
        let i = 0;
        const typeWriter = () => {
            if (i < heroText.length) {
                heroName.textContent += heroText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                // Remove cursor after typing is complete
                heroName.classList.remove('hero-name');
                heroName.classList.add('hero-name-no-cursor');
            }
        };
        typeWriter();
    }, 200);

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

    // Live time for Toronto
    function updateTorontoTime() {
        const now = new Date();
        const torontoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Toronto" }));
        const timeString = torontoTime.toLocaleTimeString("en-US", {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Determine if it's EST or EDT
        const jan = new Date(torontoTime.getFullYear(), 0, 1);
        const jul = new Date(torontoTime.getFullYear(), 6, 1);
        const isDST = torontoTime.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        const timezone = isDST ? 'EDT' : 'EST';

        const liveTimeElement = document.getElementById('live-time');
        if (liveTimeElement) {
            liveTimeElement.textContent = `${timeString} ${timezone}`;
        }
    }

    // Update time immediately and then every second
    updateTorontoTime();
    setInterval(updateTorontoTime, 1000);
});
