// ============================================================
// 🎤 ACAPELLA REMIXER - SCRIPT (VOLLSTÄNDIG)
// ============================================================

// ============================================================
// STATE
// ============================================================

let audioBuffers = {
    inst: null,   // Instrumental
    vocal: null   // Acapella
};

let fileNames = {
    inst: '',
    vocal: ''
};

let bpmData = {
    inst: 120,
    vocal: 120
};

let remixBlob = null;
let audioContext = null;
let isProcessing = false;
let keepOriginalTempo = false;

// ============================================================
// UPLOAD HANDLING
// ============================================================

document.querySelectorAll('.upload-box').forEach((box) => {
    const input = box.querySelector('input[type="file"]');
    const type = box.id === 'uploadInst' ? 'inst' : 'vocal';
    
    box.addEventListener('click', () => input.click());
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const label = type === 'inst' ? 'Inst' : 'Vocal';
            document.getElementById(`filename${label}`).textContent = file.name;
            fileNames[type] = file.name;
            loadAudio(file, type);
            box.classList.add('loaded');
        }
    });
    
    box.addEventListener('dragover', (e) => {
        e.preventDefault();
        box.classList.add('dragover');
    });
    
    box.addEventListener('dragleave', () => {
        box.classList.remove('dragover');
    });
    
    box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            const label = type === 'inst' ? 'Inst' : 'Vocal';
            document.getElementById(`filename${label}`).textContent = file.name;
            fileNames[type] = file.name;
            loadAudio(file, type);
            box.classList.add('loaded');
        }
    });
});

// ============================================================
// AUDIO LOADING + BPM DETEKTION (VERBESSERT)
// ============================================================

async function loadAudio(file, type) {
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const arrayBuffer = e.target.result;
            audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioBuffers[type] = audioBuffer;
            
            // 🔥 BESSERE BPM-ERKENNUNG
            const bpm = detectBPM(audioBuffer);
            bpmData[type] = bpm;
            
            const label = type === 'inst' ? 'Instrumental' : 'Acapella';
            const duration = Math.round(audioBuffer.duration);
            document.getElementById(`bpm${type.charAt(0).toUpperCase() + type.slice(1)}`).textContent = `BPM: ${bpm}`;
            
            // BPM Input aktualisieren
            document.getElementById(`bpmInput${type.charAt(0).toUpperCase() + type.slice(1)}`).value = bpm;
            
            updateBPMInfo();
            
            const status = document.getElementById('status');
            status.className = 'status';
            status.textContent = `✅ ${label} geladen (${duration}s, ${bpm} BPM)`;
            
            drawWaveform(audioBuffer, type);
            
            if (audioBuffers.inst && audioBuffers.vocal) {
                status.textContent = '🎵 Instrumental + Acapella geladen! Jetzt Remix erstellen.';
                document.getElementById('remixBtn').disabled = false;
                checkTempoMatch();
            }
        } catch (error) {
            document.getElementById('status').className = 'status error';
            document.getElementById('status').textContent = `❌ Fehler beim Laden: ${error.message}`;
        }
    };
    reader.readAsArrayBuffer(file);
}

// ============================================================
// 🔥 BESSERE BPM DETEKTION (Autocorrelation)
// ============================================================

function detectBPM(buffer) {
    try {
        const data = buffer.getChannelData(0);
        const sampleRate = buffer.sampleRate;
        
        // Downsampling für Geschwindigkeit
        const downsample = 4;
        const downsampled = [];
        for (let i = 0; i < data.length; i += downsample) {
            downsampled.push(data[i]);
        }
        
        // Autocorrelation
        const minBPM = 60;
        const maxBPM = 180;
        const minLag = Math.floor((60 / maxBPM) * sampleRate / downsample);
        const maxLag = Math.floor((60 / minBPM) * sampleRate / downsample);
        
        let bestLag = minLag;
        let bestCorr = 0;
        
        for (let lag = minLag; lag < maxLag; lag++) {
            let corr = 0;
            let count = 0;
            for (let i = 0; i < downsampled.length - lag; i += 5) {
                corr += downsampled[i] * downsampled[i + lag];
                count++;
            }
            corr = corr / count;
            if (corr > bestCorr) {
                bestCorr = corr;
                bestLag = lag;
            }
        }
        
        const bpm = 60 / (bestLag * downsample / sampleRate);
        return Math.round(Math.min(Math.max(bpm, 60), 180));
    } catch (e) {
        console.warn('BPM Detektion fehlgeschlagen:', e);
        return 120;
    }
}

// ============================================================
// BPM INFO UPDATE
// ============================================================

function updateBPMInfo() {
    const instBpm = bpmData.inst || '--';
    const vocalBpm = bpmData.vocal || '--';
    document.getElementById('instBpmDisplay').textContent = `🔵 Instrumental: ${instBpm} BPM`;
    document.getElementById('vocalBpmDisplay').textContent = `🔴 Acapella: ${vocalBpm} BPM`;
}

function checkTempoMatch() {
    const instBpm = bpmData.inst;
    const vocalBpm = bpmData.vocal;
    const matchEl = document.getElementById('tempoMatch');
    
    if (instBpm && vocalBpm) {
        const diff = Math.abs(instBpm - vocalBpm);
        if (diff < 3) {
            matchEl.textContent = '✅ Tempo passt perfekt!';
            matchEl.style.color = '#00b894';
        } else if (diff < 10) {
            matchEl.textContent = `🔄 Tempo wird angepasst (${diff} BPM Unterschied)`;
            matchEl.style.color = '#ffe66d';
        } else {
            matchEl.textContent = `⚡ Tempo wird stark angepasst (${diff} BPM Unterschied)`;
            matchEl.style.color = '#ff6b6b';
        }
    } else {
        matchEl.textContent = '⏱️ --';
    }
}

// ============================================================
// 🔥 ORIGINAL TEMPO TOGGLE
// ============================================================

function toggleOriginalTempo() {
    keepOriginalTempo = !keepOriginalTempo;
    const btn = document.getElementById('tempoToggle');
    const status = document.getElementById('status');
    
    if (keepOriginalTempo) {
        btn.textContent = '🔒 Original Tempo';
        btn.style.background = 'rgba(0,184,148,0.2)';
        btn.style.borderColor = '#00b894';
        status.textContent = '🔒 Original Tempo aktiviert - Kein Speed-Up!';
        status.className = 'status success';
    } else {
        btn.textContent = '🔓 Tempo anpassen';
        btn.style.background = 'rgba(255,255,255,0.05)';
        btn.style.borderColor = 'rgba(255,255,255,0.1)';
        status.textContent = '🔓 Tempo wird automatisch angepasst';
        status.className = 'status';
    }
}

// ============================================================
// 🔥 MANUELLE BPM KORREKTUR
// ============================================================

function setManualBPM(type) {
    const input = document.getElementById(`bpmInput${type.charAt(0).toUpperCase() + type.slice(1)}`);
    const bpm = parseInt(input.value);
    
    if (bpm >= 60 && bpm <= 180) {
        bpmData[type] = bpm;
        document.getElementById(`bpm${type.charAt(0).toUpperCase() + type.slice(1)}`).textContent = `BPM: ${bpm} (manuell)`;
        updateBPMInfo();
        checkTempoMatch();
        
        const status = document.getElementById('status');
        status.className = 'status success';
        status.textContent = `✅ BPM für ${type === 'inst' ? 'Instrumental' : 'Acapella'} auf ${bpm} gesetzt`;
    } else {
        const status = document.getElementById('status');
        status.className = 'status error';
        status.textContent = '❌ BPM muss zwischen 60 und 180 liegen!';
    }
}

// ============================================================
// WAVEFORM
// ============================================================

function drawWaveform(buffer, type) {
    const container = document.getElementById('waveform');
    const data = buffer.getChannelData(0);
    const samples = 60;
    const step = Math.floor(data.length / samples);
    const bars = container.querySelectorAll('.bar');
    
    if (bars.length === 0) {
        for (let i = 0; i < samples; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            container.appendChild(bar);
        }
    }
    
    const allBars = container.querySelectorAll('.bar');
    const color = type === 'inst' ? 
        'linear-gradient(to top, #6c5ce7, #a29bfe)' : 
        'linear-gradient(to top, #fd79a8, #e17055)';
    
    for (let i = 0; i < samples; i++) {
        let val = 0;
        const start = i * step;
        for (let j = 0; j < step; j++) {
            const idx = start + j;
            if (idx < data.length) {
                val += Math.abs(data[idx]);
            }
        }
        val = val / step;
        const height = 10 + val * 40;
        allBars[i].style.height = Math.min(height, 45) + 'px';
        allBars[i].style.background = color;
    }
}

// ============================================================
// SLIDER UPDATES
// ============================================================

document.getElementById('vocalVolume').addEventListener('input', function() {
    document.getElementById('vocalValue').textContent = this.value + '%';
});

document.getElementById('instVolume').addEventListener('input', function() {
    document.getElementById('instValue').textContent = this.value + '%';
});

document.getElementById('targetBPM').addEventListener('input', function() {
    document.getElementById('bpmValue').textContent = this.value + ' BPM';
});

// ============================================================
// RESET
// ============================================================

function resetAll() {
    audioBuffers = { inst: null, vocal: null };
    fileNames = { inst: '', vocal: '' };
    bpmData = { inst: 120, vocal: 120 };
    remixBlob = null;
    isProcessing = false;
    keepOriginalTempo = false;
    
    document.getElementById('filenameInst').textContent = 'Kein Instrumental';
    document.getElementById('filenameVocal').textContent = 'Keine Acapella';
    document.getElementById('bpmInst').textContent = 'BPM: --';
    document.getElementById('bpmVocal').textContent = 'BPM: --';
    document.getElementById('bpmInputInst').value = 120;
    document.getElementById('bpmInputVocal').value = 120;
    document.getElementById('fileInst').value = '';
    document.getElementById('fileVocal').value = '';
    document.getElementById('status').className = 'status';
    document.getElementById('status').textContent = 'Lade Instrumental + Acapella für deinen Remix';
    document.getElementById('remixBtn').disabled = true;
    document.getElementById('player').style.display = 'none';
    document.getElementById('waveform').innerHTML = '';
    document.querySelectorAll('.upload-box').forEach(box => box.classList.remove('loaded'));
    document.getElementById('instBpmDisplay').textContent = '🔵 Instrumental: -- BPM';
    document.getElementById('vocalBpmDisplay').textContent = '🔴 Acapella: -- BPM';
    document.getElementById('tempoMatch').textContent = '⏱️ --';
    
    // Tempo Toggle zurücksetzen
    const btn = document.getElementById('tempoToggle');
    btn.textContent = '🔓 Tempo anpassen';
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.borderColor = 'rgba(255,255,255,0.1)';
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
}

// ============================================================
// 🔥 REMIX CREATION - MIT ORIGINAL TEMPO OPTION
// ============================================================

async function createRemix() {
    if (isProcessing) return;
    
    const btn = document.getElementById('remixBtn');
    const status = document.getElementById('status');
    
    const instBuffer = audioBuffers.inst;
    const vocalBuffer = audioBuffers.vocal;
    
    if (!instBuffer || !vocalBuffer) {
        status.className = 'status error';
        status.textContent = '❌ Bitte Instrumental und Acapella laden!';
        return;
    }
    
    isProcessing = true;
    btn.disabled = true;
    btn.textContent = '⏳ Remix wird erstellt...';
    status.className = 'status loading';
    status.textContent = '⏳ Verarbeite Audio...';
    
    await sleep(50);
    
    try {
        const vocalVolume = parseInt(document.getElementById('vocalVolume').value) / 100;
        const instVolume = parseInt(document.getElementById('instVolume').value) / 100;
        const targetBPM = parseInt(document.getElementById('targetBPM').value);
        
        const currentInstBPM = bpmData.inst || 120;
        const currentVocalBPM = bpmData.vocal || 120;
        
        // Dauer = längere der beiden
        const duration = Math.max(instBuffer.duration, vocalBuffer.duration);
        const targetSampleRate = 22050;
        const channels = 2;
        
        const outputBuffer = new OfflineAudioContext(
            channels,
            Math.floor(duration * targetSampleRate),
            targetSampleRate
        );
        
        // Instrumental
        const instSource = outputBuffer.createBufferSource();
        instSource.buffer = instBuffer;
        
        // Acapella
        const vocalSource = outputBuffer.createBufferSource();
        vocalSource.buffer = vocalBuffer;
        
        // 🔥 TEMPO-ANPASSUNG - MIT ORIGINAL TEMPO OPTION
        if (keepOriginalTempo) {
            // ORIGINAL TEMPO - KEIN SPEED-UP!
            instSource.playbackRate.value = 1.0;
            vocalSource.playbackRate.value = 1.0;
            status.textContent = `🔒 Original Tempo - Keine Geschwindigkeitsänderung`;
        } else {
            // TEMPO ANPASSEN
            const instRatio = currentInstBPM / targetBPM;
            const vocalRatio = currentVocalBPM / targetBPM;
            
            instSource.playbackRate.value = instRatio;
            vocalSource.playbackRate.value = vocalRatio;
            
            // 🔥 PITCH KORREKTUR (verhindert "Micky Maus" Effekt)
            // Wenn playbackRate != 1, detune korrigieren
            if (instRatio !== 1) {
                instSource.detune.value = -Math.log2(instRatio) * 1200;
            }
            if (vocalRatio !== 1) {
                vocalSource.detune.value = -Math.log2(vocalRatio) * 1200;
            }
            
            status.textContent = `⏳ Tempo angepasst: ${currentInstBPM}→${targetBPM} BPM (${Math.round(instRatio*100)}%)`;
        }
        
        // Gain Nodes
        const instGain = outputBuffer.createGain();
        instGain.gain.value = instVolume;
        
        const vocalGain = outputBuffer.createGain();
        vocalGain.gain.value = vocalVolume;
        
        // Verbinden
        instSource.connect(instGain);
        vocalSource.connect(vocalGain);
        instGain.connect(outputBuffer.destination);
        vocalGain.connect(outputBuffer.destination);
        
        // Starten
        instSource.start(0);
        vocalSource.start(0);
        
        status.textContent = `⏳ Rendere Remix (${Math.round(duration)}s)...`;
        
        const renderedBuffer = await outputBuffer.startRendering();
        
        status.textContent = '⏳ Konvertiere zu WAV...';
        
        const wavBlob = bufferToWav(renderedBuffer);
        remixBlob = wavBlob;
        
        const player = document.getElementById('player');
        player.style.display = 'block';
        const audioPlayer = document.getElementById('audioPlayer');
        const url = URL.createObjectURL(wavBlob);
        audioPlayer.src = url;
        audioPlayer.load();
        
        const tempoInfo = keepOriginalTempo ? 
            '🔒 Original Tempo' : 
            `${targetBPM} BPM (${Math.round((currentInstBPM/targetBPM)*100)}%)`;
        
        status.className = 'status success';
        status.textContent = `✅ Remix erfolgreich! (${Math.round(duration)}s, ${tempoInfo})`;
        btn.textContent = '🎛️ Remix erstellen';
        btn.disabled = false;
        isProcessing = false;
        
    } catch (error) {
        status.className = 'status error';
        status.textContent = `❌ Fehler: ${error.message}`;
        btn.textContent = '🎛️ Remix erstellen';
        btn.disabled = false;
        isProcessing = false;
        console.error('Remix Fehler:', error);
    }
}

// ============================================================
// DOWNLOAD
// ============================================================

function downloadRemix() {
    if (!remixBlob) {
        alert('❌ Kein Remix zum Download verfügbar!');
        return;
    }
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(remixBlob);
    const instName = fileNames.inst ? fileNames.inst.replace(/\.[^/.]+$/, '') : 'instrumental';
    const vocalName = fileNames.vocal ? fileNames.vocal.replace(/\.[^/.]+$/, '') : 'acapella';
    link.download = `remix_${instName}_${vocalName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================================
// HELPERS
// ============================================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function bufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const length = buffer.length * numChannels * 2;
    const data = new DataView(new ArrayBuffer(44 + length));
    
    writeString(data, 0, 'RIFF');
    data.setUint32(4, 36 + length, true);
    writeString(data, 8, 'WAVE');
    writeString(data, 12, 'fmt ');
    data.setUint32(16, 16, true);
    data.setUint16(20, 1, true);
    data.setUint16(22, numChannels, true);
    data.setUint32(24, sampleRate, true);
    data.setUint32(28, sampleRate * numChannels * 2, true);
    data.setUint16(32, numChannels * 2, true);
    data.setUint16(34, 16, true);
    writeString(data, 36, 'data');
    data.setUint32(40, length, true);
    
    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = buffer.getChannelData(channel)[i];
            const int16 = Math.max(-32768, Math.min(32767, Math.round(sample * 32768)));
            data.setInt16(offset, int16, true);
            offset += 2;
        }
    }
    
    return new Blob([data], { type: 'audio/wav' });
}

function writeString(data, offset, string) {
    for (let i = 0; i < string.length; i++) {
        data.setUint8(offset + i, string.charCodeAt(i));
    }
}

// ============================================================
// YOUTUBE INTEGRATION
// ============================================================

async function checkYouTubeStatus() {
    const statusEl = document.getElementById('youtubeStatus');
    statusEl.className = 'infobox-status loading';
    statusEl.textContent = '⏳ Prüfe...';
    
    try {
        const response = await fetch('/api/youtube-status');
        const data = await response.json();
        
        if (data.online) {
            statusEl.className = 'infobox-status online';
            statusEl.textContent = '✅ Online';
        } else {
            statusEl.className = 'infobox-status offline';
            statusEl.textContent = '❌ Offline';
        }
    } catch (error) {
        statusEl.className = 'infobox-status offline';
        statusEl.textContent = '❌ Server nicht erreichbar';
    }
}

async function loadFromYouTube() {
    const input = document.getElementById('youtubeInput');
    const target = document.getElementById('youtubeTarget').value;
    const feedback = document.getElementById('youtubeFeedback');
    const btn = document.querySelector('.youtube-input-group button');
    const statusEl = document.getElementById('youtubeStatus');
    
    const url = input.value.trim();
    if (!url) {
        feedback.className = 'youtube-feedback show error';
        feedback.textContent = '❌ Bitte gib einen YouTube-Link ein!';
        return;
    }
    
    if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
        feedback.className = 'youtube-feedback show error';
        feedback.textContent = '❌ Kein gültiger YouTube-Link!';
        return;
    }
    
    btn.disabled = true;
    feedback.className = 'youtube-feedback show loading';
    feedback.textContent = '⏳ Lade von YouTube herunter...';
    statusEl.className = 'infobox-status loading';
    statusEl.textContent = '⏳ Lade...';
    
    try {
        const response = await fetch(`/api/youtube-download?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Download fehlgeschlagen');
        }
        
        const audioResponse = await fetch(data.downloadUrl);
        const blob = await audioResponse.blob();
        
        const fileName = data.fileName || `youtube_${Date.now()}.mp3`;
        const file = new File([blob], fileName, { type: blob.type || 'audio/mpeg' });
        
        const type = target === 'inst' ? 'inst' : 'vocal';
        const label = type === 'inst' ? 'Inst' : 'Vocal';
        const fileInput = document.getElementById(`file${label}`);
        const filenameEl = document.getElementById(`filename${label}`);
        const box = document.getElementById(`upload${label}`);
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        filenameEl.textContent = fileName;
        loadAudio(file, type);
        box.classList.add('loaded');
        
        feedback.className = 'youtube-feedback show success';
        feedback.textContent = `✅ "${fileName}" erfolgreich geladen (${Math.round(blob.size / 1024 / 1024)} MB)`;
        
        statusEl.className = 'infobox-status online';
        statusEl.textContent = '✅ Online';
        
    } catch (error) {
        feedback.className = 'youtube-feedback show error';
        feedback.textContent = `❌ Fehler: ${error.message}`;
        statusEl.className = 'infobox-status offline';
        statusEl.textContent = '❌ Fehler';
        console.error('YouTube Fehler:', error);
    }
    
    btn.disabled = false;
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement;
        if (active && active.tagName !== 'INPUT') {
            createRemix();
        }
    }
    if (e.key === 'Escape') {
        resetAll();
    }
});

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('youtubeInput');
    if (input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                loadFromYouTube();
            }
        });
    }
    
    checkYouTubeStatus();
});

document.getElementById('remixBtn').disabled = true;