// Main Entry Point
import { initUI, updateScrollProgress } from './modules/ui.js';
import { initVisuals } from './modules/visuals.js';
import { initAudio } from './modules/audio.js';
import { initForm } from './modules/form.js';
import { initGallery } from './modules/gallery.js';
import { initRotatingSubtitle } from './modules/hero.js';
import { initMusicFilters } from './modules/music.js';
import { initContent } from './modules/content.js';
import { throttle } from './modules/utils.js';
import './style.css'; // Vite allows importing CSS directly

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ARAGAL Application Initializing...');

    initUI();
    initVisuals();
    initAudio(); // Piano experimental por teclado
    initForm();
    initContent(); // Dynamic content (Collaborations & News)
    initGallery(); // Gallery (now uses JSON)
    initRotatingSubtitle(); // Hero enhancements
    initMusicFilters(); // Music filtering (Spotify + metadata)

    // Throttled Scroll Listener for global UI updates
    window.addEventListener('scroll', throttle(() => {
        updateScrollProgress();
    }, 16));

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    console.log('🎵 ARAGAL Ready!');
});
