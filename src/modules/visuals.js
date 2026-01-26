import { hexToRgb } from './utils.js';

export function initVisuals() {
    initParallax();
    initObservables();
    initParticles();
    initAudioVisualizer();
    initCursorTrail();
    initTextScramble();
    initLiquidDistortion();
}

// Parallax Effect
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    if (hero && heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = Math.max(0, 1 - (scrolled / 500));
        });
    }
}

// Intersection Observer for Reveal
function initObservables() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    function observeExistingReveals() {
        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });
    }

    observeExistingReveals();

    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (!(node instanceof HTMLElement)) return;

                if (node.classList.contains('reveal')) {
                    revealObserver.observe(node);
                }

                node.querySelectorAll('.reveal').forEach(el => {
                    revealObserver.observe(el);
                });
            });
        });
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Ambient Particles & Constellations
function initParticles() {
    const particlesCanvas = document.getElementById('particles-canvas');
    if (!particlesCanvas) return;

    try {
        const ctx = particlesCanvas.getContext('2d');
        let particles = [];
        let animationFrameId;
        let mouseX = 0;
        let mouseY = 0;
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d4af37';
        const rgb = hexToRgb(accentColor) || { r: 212, g: 175, b: 55 };

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function resizeCanvas() {
            particlesCanvas.width = window.innerWidth;
            particlesCanvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * particlesCanvas.width;
                this.y = Math.random() * particlesCanvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > particlesCanvas.width) this.x = 0;
                if (this.x < 0) this.x = particlesCanvas.width;
                if (this.y > particlesCanvas.height) this.y = 0;
                if (this.y < 0) this.y = particlesCanvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles with adaptive count based on device
        particles = [];
        const isMobile = window.innerWidth < 768;
        const isLowEndDevice = navigator.hardwareConcurrency <= 4 ||
            (navigator.deviceMemory && navigator.deviceMemory < 4);

        let particleCount;
        if (isLowEndDevice && isMobile) {
            // Very low count for low-end mobile
            particleCount = Math.floor((particlesCanvas.width * particlesCanvas.height) / 50000);
        } else if (isMobile) {
            // Reduced count for regular mobile
            particleCount = Math.floor((particlesCanvas.width * particlesCanvas.height) / 30000);
        } else {
            // Desktop count
            particleCount = Math.floor((particlesCanvas.width * particlesCanvas.height) / 15000);
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

            // Draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw constellation lines
            particles.forEach((p1, i) => {
                const distToMouse = Math.hypot(p1.x - mouseX, p1.y - mouseY);

                if (distToMouse < 150) {
                    particles.slice(i + 1).forEach(p2 => {
                        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

                        if (dist < 100) {
                            const opacity = (1 - dist / 100) * 0.3;
                            ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    });
                }
            });

            animationFrameId = requestAnimationFrame(animateParticles);
        }

        animateParticles();

        // Respect Reduced Motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            cancelAnimationFrame(animationFrameId);
            particlesCanvas.classList.add('hidden');
        }

        // Visibility API
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else if (!prefersReducedMotion.matches) {
                animateParticles();
            }
        });

    } catch (e) {
        console.error('Particle error', e);
    }
}

// Audio Visualizer (Simulated)
function initAudioVisualizer() {
    const audioCanvas = document.getElementById('audio-visualizer');
    if (!audioCanvas) return;

    try {
        const audioCtx = audioCanvas.getContext('2d');
        let audioAnimationId;

        function resizeAudioCanvas() {
            audioCanvas.width = audioCanvas.offsetWidth;
            audioCanvas.height = audioCanvas.offsetHeight;
        }
        resizeAudioCanvas();
        window.addEventListener('resize', resizeAudioCanvas);

        const barCount = 64; // Reduced for wider, more separated bars
        const bars = Array.from({ length: barCount }, () => ({
            height: Math.random() * 100,
            targetHeight: Math.random() * 100,
            speed: Math.random() * 2 + 1
        }));

        function animateVisualizer() {
            audioCtx.clearRect(0, 0, audioCanvas.width, audioCanvas.height);
            const barWidth = audioCanvas.width / barCount;
            const centerY = audioCanvas.height / 2;

            // Pre-calculate gradient (optimization)
            const gradient = audioCtx.createLinearGradient(0, centerY - 100, 0, centerY + 100);
            
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d4af37';
            const rgb = hexToRgb(accentColor) || { r: 212, g: 175, b: 55 };

            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

            audioCtx.fillStyle = gradient;

            bars.forEach((bar, i) => {
                bar.height += (bar.targetHeight - bar.height) * 0.1;
                if (Math.abs(bar.targetHeight - bar.height) < 1) {
                    bar.targetHeight = Math.random() * 100;
                }

                const x = i * barWidth;
                const barHeight = (bar.height / 100) * (audioCanvas.height * 0.5); // Increased height factor (bigger)

                // Optimization: Use single fillStyle
                // Increased gap: barWidth - 8 (more separation)
                audioCtx.fillRect(x + 4, centerY - barHeight, barWidth - 8, barHeight * 2);
            });

            audioAnimationId = requestAnimationFrame(animateVisualizer);
        }

        // Always animate for now to ensure visibility/debugging, or just stop animation but keep canvas
        animateVisualizer();

        // Optional: Log purely for debugging
        console.log('🎵 Audio Visualizer Started');

    } catch (e) {
        console.error('Visualizer error', e);
    }
}

// Cursor Trail
function initCursorTrail() {
    // Skip on touch devices for better UX
    if (window.matchMedia('(pointer: coarse)').matches) {
        return;
    }

    let lastNoteTime = 0;
    const noteDelay = 100;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastNoteTime > noteDelay) {
            createMusicNote(e.clientX, e.clientY);
            lastNoteTime = now;
        }
    });
}

function createMusicNote(x, y) {
    const notes = ['♪', '♫', '♬', '♩', '♭', '♮', '♯'];
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d4af37';
    const rgb = hexToRgb(accentColor) || { r: 212, g: 175, b: 55 };
    const colors = [accentColor, '#ffffff', '#ffd700', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`];

    const note = document.createElement('div');
    note.className = 'music-note';
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    note.style.left = x + 'px';
    note.style.top = y + 'px';
    note.style.color = colors[Math.floor(Math.random() * colors.length)];

    document.body.appendChild(note);
    setTimeout(() => note.remove(), 2000);
}

// Text Scramble
function initTextScramble() {
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }

        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];

            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 20); // Reduced from 40
                const end = start + Math.floor(Math.random() * 20); // Reduced from 40
                this.queue.push({ from, to, start, end });
            }

            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }

        update() {
            let output = '';
            let complete = 0;

            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];

                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble-char">${char}</span>`;
                } else {
                    output += from;
                }
            }

            this.el.innerHTML = output;

            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }

        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.scrambled) {
                const fx = new TextScramble(entry.target);
                const originalText = entry.target.innerText;
                entry.target.innerText = '';

                setTimeout(() => {
                    fx.setText(originalText);
                    entry.target.dataset.scrambled = 'true';
                }, 200);

                scrambleObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('h1, h2').forEach(el => {
        if (!el.classList.contains('gradient-text')) {
            scrambleObserver.observe(el);
        }
    });
}

// Liquid Distortion
function initLiquidDistortion() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            item.style.setProperty('--mouse-x', `${x}%`);
            item.style.setProperty('--mouse-y', `${y}%`);
        });

        item.addEventListener('mouseleave', () => {
            item.style.setProperty('--mouse-x', '50%');
            item.style.setProperty('--mouse-y', '50%');
        });
    });
}
