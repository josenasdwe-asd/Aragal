import { hexToRgb } from './utils.js';

export class AudioPlayer {
    constructor() {
        this.audioContext = null;
        this.audioElement = null;
        this.sourceNode = null;
        this.analyser = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.currentTrack = null;
        this.canvas = null;
        this.canvasCtx = null;
        this.animationId = null;
        this.dataArray = null;
    }

    init() {
        // 1. Inject HTML Structure
        this.createUI();

        // 2. Create Audio Element (hidden)
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = "anonymous";
        
        // 3. Setup Event Listeners
        this.audioElement.addEventListener('ended', () => this.onTrackEnd());
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.audioElement.addEventListener('error', () => {
            console.error('No se pudo cargar el archivo de audio:', this.audioElement.src);
            if (this.trackTitle) {
                this.trackTitle.textContent = 'No se pudo cargar la demo de audio';
            }
        });
        
        // 4. Setup Visualizer Canvas
        this.canvas = document.getElementById('audio-visualizer-overlay');
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = 300;
            this.canvasCtx = this.canvas.getContext('2d');
            window.addEventListener('resize', () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = 300;
            });
        }

        // 5. Initialize UI Controls
        this.playBtn = document.getElementById('player-play-btn');
        this.prevBtn = document.getElementById('player-prev-btn');
        this.nextBtn = document.getElementById('player-next-btn');
        this.progressBar = document.getElementById('player-progress-bar');
        this.progressContainer = document.getElementById('player-progress-container');
        this.playerContainer = document.getElementById('player-container');
        this.trackTitle = document.getElementById('player-title');
        this.trackArtist = document.getElementById('player-artist');
        this.coverImg = document.getElementById('player-cover-img');

        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        if (this.progressContainer) {
            this.progressContainer.addEventListener('click', (e) => this.seek(e));
        }

        // Close button (optional)
        const closeBtn = document.getElementById('player-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.pause();
                this.playerContainer.classList.remove('active');
            });
        }
    }

    createUI() {
        const container = document.getElementById('player-container');
        if (!container) return;

        container.innerHTML = `
            <div class="glass player-content">
                <div class="player-info">
                    <div class="player-cover-container">
                        <img src="/assets/images/logo-art.png" alt="Cover" id="player-cover-img" class="player-cover">
                        <div class="player-vinyl-center"></div>
                    </div>
                    <div class="player-text">
                        <h4 id="player-title">Selecciona una canción</h4>
                        <p id="player-artist">ARAGAL</p>
                    </div>
                </div>

                <div class="player-controls-wrapper">
                    <div class="player-controls">
                        <button id="player-prev-btn" class="ctrl-btn">⏮</button>
                        <button id="player-play-btn" class="ctrl-btn play-btn">▶</button>
                        <button id="player-next-btn" class="ctrl-btn">⏭</button>
                    </div>
                    <div class="progress-area" id="player-progress-container">
                        <div class="progress-bar" id="player-progress-bar"></div>
                    </div>
                </div>

                <button id="player-close-btn" class="close-player">×</button>
                
                <!-- Mini Visualizer Overlay -->
                <canvas id="audio-visualizer-overlay" class="hidden"></canvas>
            </div>
        `;
    }

    initAudioContext() {
        if (!this.audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create Nodes
            this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
            this.analyser = this.audioContext.createAnalyser();
            this.gainNode = this.audioContext.createGain();

            // Connect Nodes: Source -> Analyser -> Gain -> Destination
            this.sourceNode.connect(this.analyser);
            this.analyser.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);

            // Configure Analyser
            this.analyser.fftSize = 256;
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    loadTrack(track) {
        if (!track) return;

        this.currentTrack = track;
        this.audioElement.src = track.audioUrl; // Expecting local path like '/assets/audio/song.mp3'
        
        // Update UI
        if (this.trackTitle) this.trackTitle.textContent = track.title;
        if (this.trackArtist) this.trackArtist.textContent = track.artist || 'ARAGAL';
        if (this.coverImg) this.coverImg.src = track.cover || '/assets/images/logo-art.png';
        if (this.playerContainer) this.playerContainer.classList.add('active');

        // Auto play
        this.play();
    }

    play() {
        this.initAudioContext();
        
        this.audioElement.play()
            .then(() => {
                this.isPlaying = true;
                this.updatePlayButton();
                if (this.canvas) this.canvas.classList.remove('hidden');
                this.startVisualizer();
                if (this.playerContainer) {
                    const cover = this.playerContainer.querySelector('.player-cover');
                    if (cover) cover.classList.add('playing');
                }
            })
            .catch(error => console.error("Playback failed:", error));
    }

    pause() {
        this.audioElement.pause();
        this.isPlaying = false;
        this.updatePlayButton();
        cancelAnimationFrame(this.animationId);
        if (this.canvas) this.canvas.classList.add('hidden');
        if (this.canvasCtx && this.canvas) {
            this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.playerContainer) {
            const cover = this.playerContainer.querySelector('.player-cover');
            if (cover) cover.classList.remove('playing');
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            if (this.currentTrack) {
                this.play();
            }
        }
    }

    seek(e) {
        if (!this.currentTrack) return;
        const width = this.progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = this.audioElement.duration;
        this.audioElement.currentTime = (clickX / width) * duration;
    }

    updateProgress() {
        if (!this.progressBar) return;
        const { duration, currentTime } = this.audioElement;
        const progressPercent = (currentTime / duration) * 100;
        this.progressBar.style.width = `${progressPercent}%`;
    }

    updatePlayButton() {
        if (this.playBtn) {
            this.playBtn.innerHTML = this.isPlaying ? '&#10074;&#10074;' : '&#9658;'; // Pause || / Play ►
        }
    }

    onTrackEnd() {
        this.isPlaying = false;
        this.updatePlayButton();
        // Here you could trigger next track logic
    }

    startVisualizer() {
        if (!this.canvasCtx || !this.analyser) return;

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);

            this.analyser.getByteFrequencyData(this.dataArray);

            this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const barWidth = (this.canvas.width / this.analyser.frequencyBinCount) * 2.5;
            let barHeight;
            let x = 0;
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#d4af37';
            const rgb = hexToRgb(accentColor) || { r: 212, g: 175, b: 55 };

            for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
                barHeight = this.dataArray[i] / 2;

                // Create gradient
                const gradient = this.canvasCtx.createLinearGradient(0, 300, 0, 300 - barHeight);

                gradient.addColorStop(0, accentColor); 
                gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

                this.canvasCtx.fillStyle = gradient;
                this.canvasCtx.fillRect(x, this.canvas.height - barHeight * 1.5, barWidth, barHeight * 1.5);

                x += barWidth + 1;
            }
        };

        draw();
    }
}

// Singleton instance
export const player = new AudioPlayer();
