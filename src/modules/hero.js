// Hero Rotating Subtitle
export function initRotatingSubtitle() {
    const subtitle = document.getElementById('rotating-subtitle');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (!subtitle) return;

    const titles = [
        "Compositor Musical",
        "Colaborador Buena Vista Social Club",
        "Autor de Música Espiritual",
        "Productor Independiente"
    ];

    let currentIndex = 0;

    function rotateTitle() {
        subtitle.classList.add('fade-out');

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % titles.length;
            subtitle.textContent = titles[currentIndex];
            subtitle.classList.remove('fade-out');
        }, 500);
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!prefersReducedMotion.matches) {
        // Rotate every 3 seconds only if motion is not reduced
        setInterval(rotateTitle, 3000);
    }

    // Auto-hide scroll indicator after first scroll
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.classList.add('fade-out');
            }
        }, { once: true });

        // Make scroll indicator clickable
        scrollIndicator.addEventListener('click', () => {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
}
