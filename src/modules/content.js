import collabData from '../data/collaborations.json';
import newsData from '../data/news.json';

export function initContent() {
    renderCollaborations();
    renderNews();
}

function renderCollaborations() {
    const container = document.querySelector('.collab-grid');
    if (!container) return;

    container.innerHTML = collabData.map((item) => `
        <div class="glass collab-card reveal">
            <div class="collab-content">
                <span class="artist-role">${item.role}</span>
                <h3>${item.name}</h3>
                <p class="collab-subtitle">${item.subtitle}</p>
                ${item.impact ? `<p class="collab-impact">${item.impact}</p>` : ''}
                <div class="collab-details">
                    <ul class="collab-list">
                        ${item.works.map(work => `<li>• ${work}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `).join('');

    // Add click event listener to the container for delegation
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.collab-card');
        if (card) {
            card.classList.toggle('active');
        }
    });
}

function renderNews() {
    const newsSection = document.getElementById('noticias');
    if (!newsSection) return;
    const container = newsSection.querySelector('.music-grid');
    if (!container) return;

    container.innerHTML = newsData.map((item) => `
        <div class="news-card glass reveal">
            <span class="news-date">${item.date}</span>
            <h4 class="mb-2">${item.title}</h4>
            <p class="news-description">${item.description}</p>
            ${item.url ? `<a class="btn btn-secondary news-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.urlLabel || 'Ver más'}</a>` : ''}
        </div>
    `).join('');
}
