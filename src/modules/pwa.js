// PWA Module - Service Worker Registration & Install Prompt
export function initPWA() {
    registerServiceWorker();
    initInstallPrompt();
}

// Register Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.log('❌ Service Worker registration failed:', error);
                });
        });
    }
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification glass';
    notification.innerHTML = `
        <p>🎵 Nueva versión disponible</p>
        <button onclick="window.location.reload()" class="btn-update">Actualizar</button>
    `;
    document.body.appendChild(notification);

    // Auto-hide after 10 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 10000);
}

// Install Prompt
let deferredPrompt;

function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed successfully!');
        deferredPrompt = null;
        hideInstallButton();
    });
}

function showInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.id = 'install-pwa-btn';
    installBtn.className = 'install-pwa-btn btn btn-primary';
    installBtn.innerHTML = `
        <span>📱 Instalar App</span>
    `;
    installBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 999;
        box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        animation: pulse 2s infinite;
    `;

    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installBtn.remove();
    });

    document.body.appendChild(installBtn);
}

function hideInstallButton() {
    const installBtn = document.getElementById('install-pwa-btn');
    if (installBtn) installBtn.remove();
}

// Add pulse animation for install button
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .update-notification {
        position: fixed;
        top: 100px;
        right: 30px;
        z-index: 9999;
        padding: 1.5rem;
        border-radius: 12px;
        background: rgba(212, 175, 55, 0.95);
        color: var(--primary);
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        animation: slideIn 0.3s ease;
        transition: opacity 0.3s ease;
    }
    
    .update-notification p {
        margin: 0;
        font-weight: 600;
    }
    
    .btn-update {
        padding: 0.5rem 1rem;
        background: var(--primary);
        color: var(--accent);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: transform 0.2s;
    }
    
    .btn-update:hover {
        transform: scale(1.05);
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @media (max-width: 768px) {
        .install-pwa-btn {
            bottom: 20px !important;
            right: 20px !important;
            font-size: 0.9rem;
        }
        
        .update-notification {
            right: 20px;
            left: 20px;
            max-width: calc(100% - 40px);
        }
    }
`;
document.head.appendChild(style);
