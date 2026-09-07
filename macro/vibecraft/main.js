// ============================================================
// 1. TONE.JS SETUP
// ============================================================

// ----- DRUMS (wie vorher) -----
const kickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.2 },
}).toDestination();

const snareSynth = new Tone.NoiseSynth({
    noise: { type: "white", playbackRate: 0.2 },
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1 },
}).toDestination();

const hihatSynth = new Tone.NoiseSynth({
    noise: { type: "white", playbackRate: 0.5 },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.02 },
}).toDestination();

const clapSynth = new Tone.NoiseSynth({
    noise: { type: "white", playbackRate: 0.3 },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.1 },
}).toDestination();

// ----- INSTRUMENTE (neu!) -----
// Klavier (PolySynth für Akkorde)
const pianoSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 1.0 },
}).toDestination();

// Gitarre (mit etwas Delay für realistischen Sound)
const guitarSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.8 },
}).toDestination();
const guitarDelay = new Tone.FeedbackDelay(0.3, 0.3).toDestination();
guitarSynth.connect(guitarDelay);

// Bass (MonoSynth für dicken Sound)
const bassSynth = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    filter: { frequency: 400, type: "lowpass" },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.5 },
}).toDestination();

// Streicher (Pad)
const stringsSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 2.0 },
}).toDestination();
const stringsReverb = new Tone.Reverb(2.0).toDestination();
stringsSynth.connect(stringsReverb);

// ----- GESANG (Mikrofon) -----
let mic = null;
let micRecorder = null;
let recordedAudio = null;
let isRecording = false;

// ============================================================
// 2. STATE (erweitert)
// ============================================================
const state = {
    tempo: 120,
    currentStep: 0,
    isPlaying: false,
    tracks: {
        // Drums
        kick: new Array(16).fill(0),
        snare: new Array(16).fill(0),
        hihat: new Array(16).fill(0),
        clap: new Array(16).fill(0),
        // Instrumente (Noten als MIDI-Zahlen)
        piano: new Array(16).fill(null).map(() => []), // mehrere Noten pro Step
        guitar: new Array(16).fill(null).map(() => []),
        bass: new Array(16).fill(null).map(() => []),
        strings: new Array(16).fill(null).map(() => []),
    },
    // Gespeicherte Gesangsaufnahmen
    vocals: null,
};

// ============================================================
// 3. DOM REFS (erweitert)
// ============================================================
const stepContainers = {
    kick: document.getElementById('kickSteps'),
    snare: document.getElementById('snareSteps'),
    hihat: document.getElementById('hihatSteps'),
    clap: document.getElementById('clapSteps'),
    piano: document.getElementById('pianoSteps'),
    guitar: document.getElementById('guitarSteps'),
    bass: document.getElementById('bassSteps'),
    strings: document.getElementById('stringsSteps'),
};

const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const tempoSlider = document.getElementById('tempoSlider');
const tempoDisplay = document.getElementById('tempoDisplay');
const beatNameInput = document.getElementById('beatNameInput');
const saveBtn = document.getElementById('saveBtn');
const beatList = document.getElementById('beatList');

// Neue Buttons für Instrumente
const instrumentBtns = {
    piano: document.getElementById('pianoBtn'),
    guitar: document.getElementById('guitarBtn'),
    bass: document.getElementById('bassBtn'),
    strings: document.getElementById('stringsBtn'),
};

// Gesangs-Controls
const recordBtn = document.getElementById('recordBtn');
const playVocalsBtn = document.getElementById('playVocalsBtn');
const clearVocalsBtn = document.getElementById('clearVocalsBtn');

// ============================================================
// 4. BUILD SEQUENCER GRID (erweitert)
// ============================================================
function buildGrid() {
    const trackNames = ['kick', 'snare', 'hihat', 'clap', 'piano', 'guitar', 'bass', 'strings'];
    trackNames.forEach((trackName) => {
        const container = stepContainers[trackName];
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 16; i++) {
            const step = document.createElement('div');
            step.className = 'step';
            step.dataset.track = trackName;
            step.dataset.index = i;
            
            if (trackName === 'kick' || trackName === 'snare' || trackName === 'hihat' || trackName === 'clap') {
                // Drum-Tracks: On/Off
                if (state.tracks[trackName][i] === 1) {
                    step.classList.add(`active-${trackName}`);
                    step.classList.add('active');
                }
                step.addEventListener('click', () => toggleDrumStep(trackName, i));
            } else {
                // Instrument-Tracks: Klick öffnet Noten-Editor
                const notes = state.tracks[trackName][i] || [];
                if (notes.length > 0) {
                    step.classList.add('active');
                    step.classList.add(`active-${trackName}`);
                    step.textContent = notes.length;
                }
                step.addEventListener('click', () => openNoteEditor(trackName, i, step));
            }
            container.appendChild(step);
        }
    });
}

// ============================================================
// 5. DRUM LOGIC (wie vorher)
// ============================================================
function toggleDrumStep(trackName, index) {
    state.tracks[trackName][index] = state.tracks[trackName][index] === 1 ? 0 : 1;
    updateGrid();
}

// ============================================================
// 6. INSTRUMENT LOGIC (neu!)
// ============================================================
let selectedTrack = null;
let selectedStep = null;
let selectedStepElement = null;

function openNoteEditor(trackName, index, element) {
    selectedTrack = trackName;
    selectedStep = index;
    selectedStepElement = element;
    
    const notes = state.tracks[trackName][index] || [];
    const noteStr = notes.join(', ');
    const newNotes = prompt(`Noten für ${trackName} an Step ${index+1} (MIDI-Nummern, mit Komma getrennt):\n\nBeispiel: 60 = C4, 62 = D4, 64 = E4\n\nAktuell: ${noteStr || 'leer'}`, noteStr);
    
    if (newNotes !== null) {
        const parsed = newNotes.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0 && n < 128);
        state.tracks[trackName][index] = parsed;
        updateGrid();
    }
}

// ============================================================
// 7. PLAYBACK (erweitert mit Instrumenten)
// ============================================================
let loop = null;

function startPlayback() {
    if (state.isPlaying) return;
    
    Tone.start().then(() => {
        console.log('🔊 Audio gestartet!');
    });
    
    Tone.Transport.bpm.value = state.tempo;
    state.currentStep = 0;
    state.isPlaying = true;
    
    loop = new Tone.Loop((time) => {
        playStep(state.currentStep, time);
        highlightStep(state.currentStep);
        state.currentStep = (state.currentStep + 1) % 16;
    }, '16n');
    
    loop.start(0);
    Tone.Transport.start();
    playBtn.textContent = '⏸ Pause';
}

function stopPlayback() {
    state.isPlaying = false;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    if (loop) {
        loop.stop();
        loop = null;
    }
    playBtn.textContent = '▶ Play';
    clearHighlight();
}

function playStep(stepIndex, time) {
    // ---- DRUMS ----
    if (state.tracks.kick[stepIndex] === 1) {
        kickSynth.triggerAttackRelease('C1', '8n', time);
    }
    if (state.tracks.snare[stepIndex] === 1) {
        snareSynth.triggerAttackRelease('8n', time);
    }
    if (state.tracks.hihat[stepIndex] === 1) {
        hihatSynth.triggerAttackRelease('16n', time);
    }
    if (state.tracks.clap[stepIndex] === 1) {
        clapSynth.triggerAttackRelease('8n', time);
    }
    
    // ---- INSTRUMENTE ----
    // Piano
    const pianoNotes = state.tracks.piano[stepIndex] || [];
    if (pianoNotes.length > 0) {
        const noteNames = pianoNotes.map(n => Tone.Frequency(n, 'midi').toNote());
        pianoSynth.triggerAttackRelease(noteNames, '8n', time);
    }
    
    // Gitarre
    const guitarNotes = state.tracks.guitar[stepIndex] || [];
    if (guitarNotes.length > 0) {
        const noteNames = guitarNotes.map(n => Tone.Frequency(n, 'midi').toNote());
        guitarSynth.triggerAttackRelease(noteNames, '8n', time);
    }
    
    // Bass
    const bassNotes = state.tracks.bass[stepIndex] || [];
    if (bassNotes.length > 0) {
        const noteName = Tone.Frequency(bassNotes[0], 'midi').toNote();
        bassSynth.triggerAttackRelease(noteName, '8n', time);
    }
    
    // Streicher
    const stringsNotes = state.tracks.strings[stepIndex] || [];
    if (stringsNotes.length > 0) {
        const noteNames = stringsNotes.map(n => Tone.Frequency(n, 'midi').toNote());
        stringsSynth.triggerAttackRelease(noteNames, '4n', time);
    }
}

function highlightStep(stepIndex) {
    const trackNames = ['kick', 'snare', 'hihat', 'clap', 'piano', 'guitar', 'bass', 'strings'];
    trackNames.forEach((trackName) => {
        const container = stepContainers[trackName];
        if (!container) return;
        const steps = container.children;
        for (let i = 0; i < 16; i++) {
            if (steps[i]) steps[i].classList.remove('playing');
        }
        if (steps[stepIndex]) {
            steps[stepIndex].classList.add('playing');
        }
    });
}

function clearHighlight() {
    const trackNames = ['kick', 'snare', 'hihat', 'clap', 'piano', 'guitar', 'bass', 'strings'];
    trackNames.forEach((trackName) => {
        const container = stepContainers[trackName];
        if (!container) return;
        const steps = container.children;
        for (let i = 0; i < 16; i++) {
            if (steps[i]) steps[i].classList.remove('playing');
        }
    });
}

// ============================================================
// 8. GESANGSAUFNAHME (neu!)
// ============================================================
async function setupMic() {
    if (mic) return;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mic = new Tone.UserMedia();
        await mic.open();
        console.log('🎤 Mikrofon bereit!');
        recordBtn.disabled = false;
        recordBtn.textContent = '🎤 Aufnehmen';
    } catch (err) {
        console.error('❌ Mikrofon-Fehler:', err);
        alert('Bitte erlaube den Zugriff auf das Mikrofon!');
    }
}

function toggleRecording() {
    if (!mic) {
        setupMic().then(() => toggleRecording());
        return;
    }
    
    if (isRecording) {
        // Stoppe Aufnahme
        micRecorder.stop();
        isRecording = false;
        recordBtn.textContent = '🎤 Aufnehmen';
        recordBtn.style.background = '#4CAF50';
        console.log('⏹ Aufnahme gestoppt');
    } else {
        // Starte Aufnahme
        micRecorder = new Tone.Recorder();
        mic.connect(micRecorder);
        micRecorder.start();
        isRecording = true;
        recordBtn.textContent = '⏹ Stopp';
        recordBtn.style.background = '#f44336';
        console.log('⏺ Aufnahme gestartet...');
        
        // Automatisch nach 30 Sekunden stoppen
        setTimeout(() => {
            if (isRecording) toggleRecording();
        }, 30000);
    }
}

async function playVocals() {
    if (!recordedAudio) {
        alert('Keine Aufnahme vorhanden!');
        return;
    }
    
    const player = new Tone.Player(recordedAudio).toDestination();
    await Tone.start();
    player.start();
    console.log('▶ Gesang abgespielt');
}

function clearVocals() {
    recordedAudio = null;
    if (micRecorder) {
        micRecorder.stop();
        micRecorder.dispose();
        micRecorder = null;
    }
    isRecording = false;
    recordBtn.textContent = '🎤 Aufnehmen';
    recordBtn.style.background = '#4CAF50';
    console.log('🗑 Gesang gelöscht');
}

// ============================================================
// 9. TEMPO
// ============================================================
tempoSlider.addEventListener('input', (e) => {
    state.tempo = parseInt(e.target.value);
    tempoDisplay.textContent = state.tempo;
    if (state.isPlaying) {
        Tone.Transport.bpm.value = state.tempo;
    }
});

// ============================================================
// 10. BUTTON CONTROLS
// ============================================================
playBtn.addEventListener('click', () => {
    if (state.isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
});

stopBtn.addEventListener('click', () => {
    stopPlayback();
    state.currentStep = 0;
    highlightStep(0);
});

clearBtn.addEventListener('click', () => {
    if (state.isPlaying) stopPlayback();
    const trackNames = ['kick', 'snare', 'hihat', 'clap'];
    trackNames.forEach((trackName) => {
        state.tracks[trackName] = new Array(16).fill(0);
    });
    // Instrumente leeren
    ['piano', 'guitar', 'bass', 'strings'].forEach((trackName) => {
        state.tracks[trackName] = new Array(16).fill(null).map(() => []);
    });
    updateGrid();
    clearHighlight();
    clearVocals();
});

// Instrument-Buttons (fügen vordefinierte Akkorde hinzu)
instrumentBtns.piano?.addEventListener('click', () => addChordToSelected('piano'));
instrumentBtns.guitar?.addEventListener('click', () => addChordToSelected('guitar'));
instrumentBtns.bass?.addEventListener('click', () => addChordToSelected('bass'));
instrumentBtns.strings?.addEventListener('click', () => addChordToSelected('strings'));

function addChordToSelected(trackName) {
    const chord = prompt('Akkord als MIDI-Noten (kommagetrennt):\n\nC-Dur = 60,64,67\nC-Moll = 60,63,67\nC7 = 60,64,67,70', '60,64,67');
    if (!chord) return;
    const notes = chord.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0 && n < 128);
    if (notes.length === 0) return;
    
    // Füge Akkord zu allen Steps hinzu, die gerade markiert sind
    const allSteps = document.querySelectorAll(`#${trackName}Steps .step`);
    allSteps.forEach((step, idx) => {
        if (step.classList.contains('active')) {
            state.tracks[trackName][idx] = [...notes];
        }
    });
    updateGrid();
}

// Gesangs-Buttons
recordBtn?.addEventListener('click', toggleRecording);
playVocalsBtn?.addEventListener('click', playVocals);
clearVocalsBtn?.addEventListener('click', clearVocals);

// ============================================================
// 11. LOCALSTORAGE (erweitert)
// ============================================================
function saveBeat() {
    const name = beatNameInput.value.trim() || 'Unnamed Beat';
    const beatData = {
        id: Date.now(),
        name: name,
        tempo: state.tempo,
        tracks: JSON.parse(JSON.stringify(state.tracks)),
        // Vocals können wir nicht als Text speichern, aber wir könnten sie als Base64 speichern
        // Für jetzt: Nur die Tracks
        createdAt: new Date().toISOString(),
    };

    const allBeats = JSON.parse(localStorage.getItem('beats') || '[]');
    allBeats.push(beatData);
    localStorage.setItem('beats', JSON.stringify(allBeats));

    beatNameInput.value = '';
    renderBeatList();
    alert(`✅ Beat "${name}" gespeichert!`);
}

function loadBeat(id) {
    const allBeats = JSON.parse(localStorage.getItem('beats') || '[]');
    const beat = allBeats.find(b => b.id === id);
    if (!beat) return;

    if (state.isPlaying) stopPlayback();

    state.tempo = beat.tempo;
    tempoSlider.value = beat.tempo;
    tempoDisplay.textContent = beat.tempo;

    const trackNames = ['kick', 'snare', 'hihat', 'clap', 'piano', 'guitar', 'bass', 'strings'];
    trackNames.forEach((trackName) => {
        if (beat.tracks[trackName]) {
            state.tracks[trackName] = JSON.parse(JSON.stringify(beat.tracks[trackName]));
        }
    });

    updateGrid();
    clearHighlight();
    alert(`✅ Beat "${beat.name}" geladen!`);
}

function deleteBeat(id) {
    if (!confirm('Beat wirklich löschen?')) return;
    let allBeats = JSON.parse(localStorage.getItem('beats') || '[]');
    allBeats = allBeats.filter(b => b.id !== id);
    localStorage.setItem('beats', JSON.stringify(allBeats));
    renderBeatList();
}

function renderBeatList() {
    const allBeats = JSON.parse(localStorage.getItem('beats') || '[]');
    beatList.innerHTML = '';

    if (allBeats.length === 0) {
        beatList.innerHTML = '<li class="empty-message">Noch keine Beats gespeichert.</li>';
        return;
    }

    allBeats.sort((a, b) => b.id - a.id);
    allBeats.forEach((beat) => {
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'beat-name';
        nameSpan.textContent = `${beat.name} (${beat.tempo} BPM)`;
        nameSpan.addEventListener('click', () => loadBeat(beat.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', () => deleteBeat(beat.id));

        li.appendChild(nameSpan);
        li.appendChild(deleteBtn);
        beatList.appendChild(li);
    });
}

// ============================================================
// 12. UPDATE GRID (erweitert)
// ============================================================
function updateGrid() {
    const trackNames = ['kick', 'snare', 'hihat', 'clap', 'piano', 'guitar', 'bass', 'strings'];
    trackNames.forEach((trackName) => {
        const container = stepContainers[trackName];
        if (!container) return;
        const steps = container.children;
        
        for (let i = 0; i < 16; i++) {
            const step = steps[i];
            if (!step) continue;
            step.classList.remove('active', `active-${trackName}`);
            step.textContent = '';
            
            if (trackName === 'kick' || trackName === 'snare' || trackName === 'hihat' || trackName === 'clap') {
                // Drum-Tracks
                const isActive = state.tracks[trackName][i] === 1;
                if (isActive) {
                    step.classList.add('active', `active-${trackName}`);
                }
            } else {
                // Instrument-Tracks
                const notes = state.tracks[trackName][i] || [];
                if (notes.length > 0) {
                    step.classList.add('active', `active-${trackName}`);
                    step.textContent = notes.length; // Zeige Anzahl der Noten
                }
            }
        }
    });
}

// ============================================================
// 13. INIT
// ============================================================
buildGrid();
renderBeatList();

// Mikrofon automatisch initialisieren
setupMic();

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        playBtn.click();
    }
    if (e.key === 'r' || e.key === 'R') {
        if (recordBtn) recordBtn.click();
    }
});

console.log('🎵 Music Maker ready!');
console.log('💡 Drücke Space zum Play/Pause');
console.log('🎤 Drücke R zum Aufnehmen/Stoppen');
console.log('🎹 Instrumente: Klick auf Step öffnet Noten-Editor');