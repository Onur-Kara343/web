// ============================================================
// STATE
// ============================================================

let audioBlob = null;
let podcastScript = '';
let isProcessing = false;

// ============================================================
// CHAR COUNTER
// ============================================================

document.getElementById('scriptInput').addEventListener('input', function() {
    const count = this.value.length;
    document.getElementById('charCount').textContent = `${count} Zeichen`;
});

// ============================================================
// SLIDER UPDATES
// ============================================================

document.getElementById('speed').addEventListener('input', function() {
    document.getElementById('speedValue').textContent = this.value + 'x';
});

document.getElementById('pause').addEventListener('input', function() {
    document.getElementById('pauseValue').textContent = this.value + 's';
});

// ============================================================
// FILE UPLOAD
// ============================================================

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('scriptInput').value = e.target.result;
            const count = e.target.result.length;
            document.getElementById('charCount').textContent = `${count} Zeichen`;
        };
        reader.readAsText(file);
    }
});

// ============================================================
// LOAD EXAMPLE
// ============================================================

function loadExample() {
    const example = `Host: Willkommen zu einer neuen Folge von "Voxify" – dem Podcast, der aus deinen Ideen Geschichten macht!

Gast: Hallo! Schön, dabei zu sein.

Host: Heute sprechen wir über künstliche Intelligenz und wie sie die Art und Weise verändert, wie wir Inhalte erstellen.

Gast: Absolut. KI-Tools sind heute zugänglicher denn je. Man braucht keine teure Ausrüstung mehr, um einen professionellen Podcast zu produzieren.

Host: Genau. Mit Voxify kannst du einfach dein Skript eingeben und bekommst sofort einen natürlichen Podcast mit zwei verschiedenen Stimmen.

Gast: Das ist der Wahnsinn! Wie funktioniert das technisch?

Host: Wir nutzen Google Cloud Text-to-Speech mit neuronalen Stimmen. Die klingen extrem natürlich – nicht wie diese roboterhaften Stimmen von früher.

Gast: Und das beste: Die ersten 4 Millionen Zeichen pro Monat sind komplett kostenlos!

Host: Exakt. Also: Worauf wartest du? Schreib dein Skript und lass Voxify deinen Podcast erstellen!

Gast: Los geht's!`;

    document.getElementById('scriptInput').value = example;
    document.getElementById('charCount').textContent = `${example.length} Zeichen`;
    document.getElementById('status').className = 'status';
    document.getElementById('status').textContent = '✅ Beispiel geladen! Jetzt Podcast generieren.';
}

// ============================================================
// RESET
// ============================================================

function resetAll() {
    document.getElementById('scriptInput').value = '';
    document.getElementById('charCount').textContent = '0 Zeichen';
    document.getElementById('player').style.display = 'none';
    document.getElementById('status').className = 'status';
    document.getElementById('status').textContent = '📝 Schreibe dein Skript oder lade ein Beispiel';
    audioBlob = null;
    podcastScript = '';
    isProcessing = false;
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('generateBtn').textContent = '🎙️ Podcast generieren';
}

// ============================================================
// GENERATE PODCAST
// ============================================================

async function generatePodcast() {
    if (isProcessing) return;

    const script = document.getElementById('scriptInput').value.trim();
    if (!script) {
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = '❌ Bitte schreibe ein Skript oder lade ein Beispiel!';
        return;
    }

    // Status updaten
    isProcessing = true;
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Audio wird generiert...';
    document.getElementById('status').className = 'status loading';
    document.getElementById('status').textContent = `⏳ Audio wird generiert…`;

    try {
        const language = document.getElementById('language').value;
        const speed = parseFloat(document.getElementById('speed').value);
        const pauseDuration = parseFloat(document.getElementById('pause').value);

        const response = await fetch('/api/generate-podcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: script,
                language: language,
                speed: speed,
                pauseDuration: pauseDuration
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Generieren');
        }

        const data = await response.json();

        // Audio laden
        const audioResponse = await fetch(data.audioUrl);
        audioBlob = await audioResponse.blob();

        const player = document.getElementById('player');
        player.style.display = 'block';
        const audioPlayer = document.getElementById('audioPlayer');
        const url = URL.createObjectURL(audioBlob);
        audioPlayer.src = url;
        audioPlayer.load();

        // Transkript speichern (ganzer Text)
        podcastScript = script;

        document.getElementById('status').className = 'status success';
        document.getElementById('status').textContent = `✅ Audio erfolgreich generiert! (${data.parts} Teile, ${Math.round(audioBlob.size / 1024)} KB)`;

        btn.textContent = '🎙️ Podcast generieren';
        btn.disabled = false;
        isProcessing = false;

    } catch (error) {
        document.getElementById('status').className = 'status error';
        document.getElementById('status').textContent = `❌ Fehler: ${error.message}`;
        btn.textContent = '🎙️ Podcast generieren';
        btn.disabled = false;
        isProcessing = false;
        console.error('Podcast Fehler:', error);
    }
}

// ============================================================
// DOWNLOAD PODCAST
// ============================================================

function downloadPodcast() {
    if (!audioBlob) {
        alert('❌ Kein Podcast zum Download verfügbar!');
        return;
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(audioBlob);
    link.download = `podcast_${new Date().toISOString().slice(0,10)}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================================
// SHOW TRANSCRIPT
// ============================================================

function showTranscript() {
    const display = document.getElementById('transcriptDisplay');
    if (display.style.display === 'block') {
        display.style.display = 'none';
        return;
    }

    if (!podcastScript) {
        display.textContent = 'Kein Transkript verfügbar.';
        display.style.display = 'block';
        return;
    }

    display.innerHTML = podcastScript.replace(/\n/g, '<br>');
    display.style.display = 'block';
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generatePodcast();
    }
});