const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const googleTTS = require('google-tts-api');
const fetch = require('node-fetch');

const app = express();
const port = 3000;

// ============================================================
// PFADE
// ============================================================

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const TEMP_DIR = path.join(__dirname, 'temp');

// temp-Ordner sicherstellen
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ============================================================
// EXPRESS SETUP
// ============================================================

app.use(express.json());
app.use(express.static(FRONTEND_DIR));
app.use('/temp', express.static(TEMP_DIR));

// ============================================================
// ROUTES
// ============================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({
        ttsAvailable: true,
        message: '✅ Google TTS bereit'
    });
});

// ============================================================
// PODCAST GENERIEREN
// ============================================================

app.post('/api/generate-podcast', async (req, res) => {
    try {
        const { text, language, speed, pauseDuration } = req.body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ error: 'Kein Text zum Konvertieren gefunden' });
        }

        console.log(`🎙️ Generiere Audiobook/Podcast (Ein Sprecher)...`);

        const audioParts = [];

        const langShort = (language || 'en-US').split('-')[0];
        const chunks = splitTextIntoChunks(text, 200);

        console.log(`📄 ${chunks.length} Chunks werden verarbeitet...`);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`   🔊 Chunk ${i + 1}/${chunks.length} (${langShort}) - ${chunk.substring(0, 50)}...`);

            const url = googleTTS.getAudioUrl(chunk, {
                lang: langShort,
                slow: false,
                host: 'https://translate.google.com'
            });

            const resp = await fetch(url);
            if (!resp.ok) throw new Error('Fehler beim Abrufen der TTS-Audio-URL');
            const buffer = await resp.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');

            audioParts.push({ speaker: 'narrator', base64: base64, text: chunk });

            // Optional: kurze Pause zwischen Chunks
            if (i < chunks.length - 1 && pauseDuration > 0) {
                const silence = await generateSilence(pauseDuration);
                audioParts.push({ speaker: 'pause', base64: silence, text: `[Pause ${pauseDuration}s]` });
            }
        }

        // Alle Audio-Parts zu einem MP3 zusammenfügen
        console.log('🔗 Füge Audio zusammen...');

        const timestamp = Date.now();
        const partFiles = [];

        for (let i = 0; i < audioParts.length; i++) {
            const part = audioParts[i];
            const prefix = part.speaker === 'pause' ? 'pause' : 'part';
            const partFile = path.join(TEMP_DIR, `${prefix}_${timestamp}_${i}.mp3`);
            const buffer = Buffer.from(part.base64, 'base64');
            fs.writeFileSync(partFile, buffer);
            partFiles.push(partFile);
        }

        // FFmpeg: Alle Teile zu einer Datei zusammenfügen
        const outputFile = path.join(TEMP_DIR, `podcast_${timestamp}.mp3`);

        const concatFilter = partFiles.map((f, i) => `[${i}:0]`).join('');

        let inputArgs = '';
        for (const f of partFiles) {
            inputArgs += ` -i "${f}"`;
        }

        const filterComplex = `"${concatFilter}concat=n=${partFiles.length}:v=0:a=1[out]"`;
        const cmd = `ffmpeg${inputArgs} -filter_complex ${filterComplex} -map "[out]" -y "${outputFile}"`;

        console.log(`🔧 FFmpeg Befehl wird ausgeführt...`);

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

        res.json({
            success: true,
            audioUrl: audioUrl,
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
        const silenceFile = path.join(TEMP_DIR, `silence_${timestamp}.mp3`);

        const cmd = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${duration} -q:a 9 -acodec libmp3lame "${silenceFile}" -y`;

        exec(cmd, { timeout: 10000 }, (error) => {
            if (error) {
                reject(error);
                return;
            }

            const buffer = fs.readFileSync(silenceFile);
            const base64 = buffer.toString('base64');

            try { fs.unlinkSync(silenceFile); } catch (e) {}

            resolve(base64);
        });
    });
}

// ============================================================
// HELPER: Text in Chunks teilen
// ============================================================

function splitTextIntoChunks(text, maxLen) {
    if (!text) return [];
    const chunks = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
            chunks.push(remaining);
            break;
        }

        let idx = -1;
        const slice = remaining.slice(0, maxLen + 1);
        const lastSentence = Math.max(
            slice.lastIndexOf('. '),
            slice.lastIndexOf('! '),
            slice.lastIndexOf('? ')
        );
        if (lastSentence > -1) idx = lastSentence + 1;
        if (idx === -1) {
            const lastSpace = slice.lastIndexOf(' ');
            idx = lastSpace > -1 ? lastSpace : maxLen;
        }

        const chunk = remaining.slice(0, idx).trim();
        chunks.push(chunk);
        remaining = remaining.slice(idx).trim();
    }

    return chunks;
}

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
    console.log('║   ✅ Google TTS: Verbunden                                 ║');
    console.log('║   📁 Frontend: ../frontend                                 ║');
    console.log('║   📁 Temp:     ./temp                                      ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // FFmpeg-Check
    exec('ffmpeg -version', (err) => {
        if (err) {
            console.error('⚠️  FFmpeg ist NICHT installiert oder nicht im PATH!');
            console.error('   Ohne FFmpeg kann kein Audio zusammengefügt werden.');
            console.error('   → https://ffmpeg.org/download.html\n');
        } else {
            console.log('✅ FFmpeg gefunden\n');
        }
    });
});