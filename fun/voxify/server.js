const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const app = express();
const port = 3000;

let ttsClient = null;

function initTTSClient() {
    try {
        // Option 1: Umgebungsvariable
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            ttsClient = new TextToSpeechClient();
            console.log('✅ Google TTS: Credentials aus GOOGLE_APPLICATION_CREDENTIALS');
            return true;
        }

        // Option 2: Lokale JSON-Datei
        const credPath = path.join(__dirname, 'google-credentials.json');
        if (fs.existsSync(credPath)) {
            process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
            ttsClient = new TextToSpeechClient();
            console.log(`✅ Google TTS: Credentials aus ${credPath}`);
            return true;
        }

        console.log('❌ Google TTS: Keine Credentials gefunden!');
        console.log('   📦 Lösungen:');
        console.log('   1. GOOGLE_APPLICATION_CREDENTIALS Umgebungsvariable setzen');
        console.log('   2. google-credentials.json in Projektordner legen');
        return false;
    } catch (error) {
        console.error('❌ Google TTS Fehler:', error.message);
        return false;
    }
}

// TTS initialisieren
const ttsAvailable = initTTSClient();

// ============================================================
// EXPRESS SETUP
// ============================================================

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// ROUTES
// ============================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({
        ttsAvailable: ttsAvailable,
        message: ttsAvailable ? '✅ Google TTS bereit' : '❌ Google TTS nicht konfiguriert'
    });
});

// ============================================================
// PODCAST GENERIEREN
// ============================================================

app.post('/api/generate-podcast', async (req, res) => {
    if (!ttsAvailable) {
        return res.status(500).json({
            error: 'Google TTS nicht konfiguriert. Bitte google-credentials.json im Projektordner ablegen.'
        });
    }

    try {
        const { dialogs, hostVoice, guestVoice, speed, pauseDuration, mood } = req.body;

        if (!dialogs || !Array.isArray(dialogs) || dialogs.length === 0) {
            return res.status(400).json({ error: 'Keine Dialoge gefunden' });
        }

        console.log(`🎙️ Generiere Podcast mit ${dialogs.length} Dialogen...`);

        // Google TTS Client
        const client = new TextToSpeechClient();

        // Audio-Parts sammeln (Base64)
        const audioParts = [];

        for (let i = 0; i < dialogs.length; i++) {
            const dialog = dialogs[i];
            const voice = dialog.speaker === 'host' ? hostVoice : guestVoice;
            const text = dialog.text;

            console.log(`   🔊 Dialog ${i+1}: ${dialog.speaker} (${voice}) - ${text.substring(0, 50)}...`);

            // Google TTS Request
            const request = {
                input: { text: text },
                voice: {
                    languageCode: voice.split('-').slice(0, 2).join('-'),
                    name: voice
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: speed,
                    pitch: mood === 'enthusiastic' ? 2.0 : 
                           mood === 'calm' ? -2.0 :
                           mood === 'professional' ? 0.5 :
                           mood === 'friendly' ? 1.5 : 0.0
                }
            };

            // TTS aufrufen
            const [response] = await client.synthesizeSpeech(request);
            const audioBase64 = response.audioContent.toString('base64');
            audioParts.push({
                speaker: dialog.speaker,
                base64: audioBase64,
                text: dialog.text
            });

            // Pause zwischen Dialogen (außer beim letzten)
            if (i < dialogs.length - 1 && pauseDuration > 0) {
                // Stille generieren (als Base64)
                const silence = await generateSilence(pauseDuration);
                audioParts.push({
                    speaker: 'pause',
                    base64: silence,
                    text: `[Pause ${pauseDuration}s]`
                });
            }
        }

        // Alle Audio-Parts zu einem MP3 zusammenfügen
        console.log('🔗 Füge Audio zusammen...');

        // Temp-Dateien für FFmpeg
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const timestamp = Date.now();
        const partFiles = [];

        for (let i = 0; i < audioParts.length; i++) {
            const part = audioParts[i];
            if (part.speaker === 'pause') {
                // Pause als separate Datei
                const pauseFile = path.join(tempDir, `pause_${timestamp}_${i}.mp3`);
                const buffer = Buffer.from(part.base64, 'base64');
                fs.writeFileSync(pauseFile, buffer);
                partFiles.push(pauseFile);
            } else {
                const partFile = path.join(tempDir, `part_${timestamp}_${i}.mp3`);
                const buffer = Buffer.from(part.base64, 'base64');
                fs.writeFileSync(partFile, buffer);
                partFiles.push(partFile);
            }
        }

        // FFmpeg: Alle Teile zu einer Datei zusammenfügen
        const outputFile = path.join(tempDir, `podcast_${timestamp}.mp3`);

        // Filter für FFmpeg (concat)
        const concatFilter = partFiles.map((f, i) => `[${i}:0]`).join('');

        // Liste der Input-Dateien
        let inputArgs = '';
        for (const f of partFiles) {
            inputArgs += ` -i "${f}"`;
        }

        // FFmpeg Befehl
        const filterComplex = `"${concatFilter}concat=n=${partFiles.length}:v=0:a=1[out]"`;
        const cmd = `ffmpeg${inputArgs} -filter_complex ${filterComplex} -map "[out]" -y "${outputFile}"`;

        console.log(`🔧 FFmpeg Befehl: ${cmd}`);

        // FFmpeg ausführen
        await new Promise((resolve, reject) => {
            exec(cmd, { timeout: 60000 }, (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ FFmpeg Fehler:', stderr);
                    reject(new Error('FFmpeg Fehler: ' + stderr));
                } else {
                    resolve();
                }
            });
        });

        // Temp-Dateien löschen
        for (const f of partFiles) {
            try { fs.unlinkSync(f); } catch (e) {}
        }

        // Audio-URL zurückgeben
        const audioUrl = `/temp/podcast_${timestamp}.mp3`;

        // Erfolg
        res.json({
            success: true,
            audioUrl: audioUrl,
            duration: dialogs.length,
            parts: audioParts.length,
            fileSize: fs.statSync(outputFile).size
        });

        // Audio nach 5 Minuten löschen
        setTimeout(() => {
            try { fs.unlinkSync(outputFile); } catch (e) {}
        }, 5 * 60 * 1000);

    } catch (error) {
        console.error('❌ Podcast Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// HELPER: GENERATE SILENCE (als MP3)
// ============================================================

async function generateSilence(duration) {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const silenceFile = path.join(__dirname, 'temp', `silence_${timestamp}.mp3`);

        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        // FFmpeg: Stille generieren
        const cmd = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -q:a 9 -acodec libmp3lame "${silenceFile}" -y`;

        exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            // Datei in Base64 umwandeln
            const buffer = fs.readFileSync(silenceFile);
            const base64 = buffer.toString('base64');

            // Temp löschen
            try { fs.unlinkSync(silenceFile); } catch (e) {}

            resolve(base64);
        });
    });
}

// ============================================================
// TEMP FILES SERVEN
// ============================================================

app.get('/temp/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'temp', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Datei nicht gefunden');
    }
});

// ============================================================
// SERVER START
// ============================================================

app.listen(port, () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   🎙️ VOXIFY - KI Podcast Generator                         ║');
    console.log('║   Dein Skript → Natürlicher Podcast                        ║');
    console.log('║                                                            ║');
    console.log(`║   🌐 http://localhost:${port}                               ║`);
    console.log('║                                                            ║');

    if (ttsAvailable) {
        console.log('║   ✅ Google TTS: Verbunden                              ║');
        console.log('║   🎤 4M Zeichen/Monat gratis                           ║');
    } else {
        console.log('║   ❌ Google TTS: NICHT verbunden                        ║');
        console.log('║   📦 google-credentials.json in Projektordner legen    ║');
        console.log('║   📦 Oder GOOGLE_APPLICATION_CREDENTIALS setzen        ║');
    }

    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});