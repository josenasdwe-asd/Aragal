import musicData from '../data/music.json';

// Music Section Filtering
export function initMusicFilters() {
    renderMusicItems();
    setupFilters();
}

function renderMusicItems() {
    const musicGrid = document.getElementById('music-grid');
    if (!musicGrid) return;

    musicGrid.innerHTML = musicData.map((item, index) => `
        <div class="glass music-item reveal" data-genre="${item.genre}" style="transition-delay: ${index * 0.1}s;">
            ${item.badge ? `<span class="badge-new music-badge-inline">${item.badge}</span>` : ''}
            <h3 class="music-category">${item.category}</h3>
            <h4 class="music-title">${item.title}</h4>

            <iframe class="music-iframe"
                src="${item.spotifyUrl}"
                width="100%" height="152" frameBorder="0" allowfullscreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Reproductor de Spotify para ${item.title}"></iframe>
            <p class="music-description">${item.description}</p>
            ${item.forWho ? `<p class="music-meta"><strong>Para quién:</strong> ${item.forWho}</p>` : ''}
            ${item.whyNow ? `<p class="music-meta"><strong>Recomendado cuando:</strong> ${item.whyNow}</p>` : ''}
        </div>
    `).join('');
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const musicItems = document.querySelectorAll('.music-item');

    if (!filterBtns.length || !musicItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked button
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter music items
            musicItems.forEach(item => {
                if (filter === 'all' || item.dataset.genre === filter) {
                    item.style.display = 'block';
                    item.classList.add('reveal-active');
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}
