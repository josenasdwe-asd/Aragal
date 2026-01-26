import galleryData from '../data/gallery.json';

export function initGallery() {
    renderGalleryGrid();
    initLightbox();
    initImageLoader();
}

function renderGalleryGrid() {
    const galleryContainer = document.querySelector('.gallery-grid');
    if (!galleryContainer) return;

    galleryContainer.innerHTML = galleryData.map((item, index) => `
        <div class="gallery-item glass reveal" style="transition-delay: ${index * 0.1}s;" data-index="${index}"
            role="button" tabindex="0" aria-label="Ver imagen de ${item.caption}">
            <img src="${item.src}" alt="${item.alt || item.caption}" 
                width="800" height="450" loading="lazy">
            <div class="gallery-overlay">
                <p class="gallery-caption">${item.caption}</p>
            </div>
        </div>
    `).join('');

    // Event Delegation for Gallery Items
    galleryContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item) {
            const index = parseInt(item.dataset.index, 10);
            openLightbox(index);
        }
    });

    // Keyboard support for opening
    galleryContainer.addEventListener('keydown', (e) => {
        const item = e.target.closest('.gallery-item');
        if (item && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const index = parseInt(item.dataset.index, 10);
            openLightbox(index);
        }
    });
}

function initLightbox() {
    const galleryImages = galleryData;
    let currentImageIndex = 0;
    const lightbox = document.getElementById('lightbox');

    if (!lightbox) return;

    // Internal function to open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        lightbox.classList.add('show');
        updateLightboxContent();
        lightbox.focus(); // Set focus to lightbox for accessibility
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        resetZoom();
    }

    function changeImage(n) {
        currentImageIndex += n;
        if (currentImageIndex >= galleryImages.length) {
            currentImageIndex = 0;
        } else if (currentImageIndex < 0) {
            currentImageIndex = galleryImages.length - 1;
        }
        updateLightboxContent();
        resetZoom();
    }

    function updateLightboxContent() {
        const img = document.getElementById('lightbox-img');
        const caption = document.getElementById('lightbox-caption');
        const data = galleryImages[currentImageIndex];

        if (img) img.src = data.src;
        if (caption) caption.innerText = data.caption;
    }

    // Zoom functionality
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightboxImg) {
        lightboxImg.addEventListener('click', function () {
            this.classList.toggle('zoomed');
        });
    }

    function resetZoom() {
        if (lightboxImg) lightboxImg.classList.remove('zoomed');
    }

    // Event Listeners for Lightbox Controls
    lightbox.addEventListener('click', function (e) {
        if (e.target === this || e.target.classList.contains('close-lightbox')) {
            closeLightbox();
        }
    });

    // Navigation Buttons
    const prevBtn = lightbox.querySelector('.prev');
    const nextBtn = lightbox.querySelector('.next');
    const closeBtn = lightbox.querySelector('.close-lightbox');

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); changeImage(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); changeImage(1); });
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('show')) return;
        
        switch(e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowLeft': changeImage(-1); break;
            case 'ArrowRight': changeImage(1); break;
        }
    });

    // Touch gesture support for swipe navigation
    let touchStartX = 0;
    
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const minSwipeDistance = 50;

        if (Math.abs(diff) > minSwipeDistance) {
            if (diff > 0) changeImage(1); // Swipe Left -> Next
            else changeImage(-1); // Swipe Right -> Prev
        }
    }, { passive: true });
}

function initImageLoader() {
    document.querySelectorAll('.bio-image-container img, .gallery-item img').forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function () {
                this.classList.add('loaded');
            });
        }
    });
}
