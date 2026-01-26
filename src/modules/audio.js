export function initAudio() {
    initPiano();
}

function initPiano() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = {
        'a': 261.63, // C
        's': 293.66, // D
        'd': 329.63, // E
        'f': 349.23, // F
        'g': 392.00, // G
        'h': 440.00, // A
        'j': 493.88, // B
        'k': 523.25, // C (high)
        'l': 587.33  // D (high)
    };

    const noteNames = {
        'a': 'Do', 's': 'Re', 'd': 'Mi', 'f': 'Fa',
        'g': 'Sol', 'h': 'La', 'j': 'Si', 'k': 'Do', 'l': 'Re'
    };

    let pianoIndicator = null;

    function playNote(frequency, noteName) {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        showPianoIndicator(noteName);
    }

    function showPianoIndicator(noteName) {
        if (!pianoIndicator) {
            pianoIndicator = document.createElement('div');
            pianoIndicator.className = 'piano-key-indicator';
            document.body.appendChild(pianoIndicator);
        }

        pianoIndicator.textContent = `🎹 ${noteName}`;
        pianoIndicator.classList.add('active');

        setTimeout(() => {
            pianoIndicator.classList.remove('active');
        }, 500);
    }

    document.addEventListener('keydown', (e) => {
        // Prevent piano when typing in forms
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }

        const key = e.key.toLowerCase();
        if (notes[key] && !e.repeat) {
            playNote(notes[key], noteNames[key]);
        }
    });
}
