const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const port = 3000;

// ============================================================
// FFMPEG FINDEN
// ============================================================

function findFFmpeg() {
    return new Promise((resolve) => {
        exec('ffmpeg -version', (error) => {
            if (!error) {
                resolve('ffmpeg');
                return;
            }
            const possiblePaths = [
                'C:/ProgramData/chocolatey/lib/ffmpeg/tools/ffmpeg/bin/ffmpeg.exe',
                'C:/ffmpeg/bin/ffmpeg.exe',
                'C:/Program Files/FFmpeg/bin/ffmpeg.exe',
                path.join(__dirname, 'ffmpeg.exe'),
            ];
            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    resolve(p);
                    return;
                }
            }
            resolve(false);
        });
    });
}

function checkYtDlp() {
    return new Promise((resolve) => {
        exec('yt-dlp --version', (error) => {
            resolve(!error);
        });
    });
}

// ============================================================
// DOWNLOAD
// ============================================================

async function downloadYouTubeAudio(url) {
    return new Promise(async (resolve, reject) => {
        const timestamp = Date.now();
        const outputPath = path.join(__dirname, 'temp', `youtube_${timestamp}.mp3`);
        
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }
        
        const ffmpegPath = await findFFmpeg();
        let ffmpegOption = '';
        if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
            ffmpegOption = `--ffmpeg-location "${ffmpegPath}"`;
        }
        
        const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 128K ` +
                    `${ffmpegOption} ` +
                    `--extractor-args "youtube:player_client=android" ` +
                    `--no-check-certificates ` +
                    `--no-cache-dir ` +
                    `-o "${outputPath}" ` +
                    `"${url}"`;
        
        console.log(`📥 Lade YouTube: ${url}`);
        
        exec(cmd, { timeout: 180000, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || 'Download fehlgeschlagen'));
                return;
            }
            if (!fs.existsSync(outputPath)) {
                reject(new Error('Audiodatei wurde nicht erstellt'));
                return;
            }
            const stats = fs.statSync(outputPath);
            if (stats.size < 10000) {
                fs.unlinkSync(outputPath);
                reject(new Error('Audiodatei ist zu klein'));
                return;
            }
            resolve({
                path: outputPath,
                size: stats.size,
                fileName: path.basename(outputPath)
            });
        });
    });
}

// ============================================================
// EXPRESS
// ============================================================

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public',  'index.html'));
});

app.get('/api/youtube-status', async (req, res) => {
    try {
        const hasYtDlp = await checkYtDlp();
        const ffmpeg = await findFFmpeg();
        const hasFFmpeg = ffmpeg !== false;
        res.json({
            online: hasYtDlp && hasFFmpeg,
            ytDlp: hasYtDlp,
            ffmpeg: hasFFmpeg,
            message: hasYtDlp && hasFFmpeg ? '✅ Alles bereit!' : '❌ Systemvoraussetzungen nicht erfüllt'
        });
    } catch (error) {
        res.json({ online: false, message: error.message });
    }
});

app.get('/api/youtube-download', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: 'Keine URL angegeben' });
    }
    try {
        const hasYtDlp = await checkYtDlp();
        const ffmpeg = await findFFmpeg();
        if (!hasYtDlp) {
            return res.status(500).json({ error: 'yt-dlp nicht installiert' });
        }
        if (ffmpeg === false) {
            return res.status(500).json({ error: 'FFmpeg nicht installiert' });
        }
        const result = await downloadYouTubeAudio(url);
        const downloadUrl = `/temp/${result.fileName}`;
        res.json({
            success: true,
            downloadUrl: downloadUrl,
            fileName: result.fileName,
            size: result.size
        });
        setTimeout(() => {
            if (fs.existsSync(result.path)) {
                fs.unlinkSync(result.path);
                console.log(`🗑️ Temp gelöscht: ${result.fileName}`);
            }
        }, 5 * 60 * 1000);
    } catch (error) {
        console.error('❌ Download Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/temp/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'temp', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Datei nicht gefunden');
    }
});

// ============================================================
// START
// ============================================================

app.listen(port, async () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   🎤 ACAPELLA REMIXER                                     ║');
    console.log('║   Instrumental + Acapella = Einzigartiger Remix           ║');
    console.log('║                                                            ║');
    console.log(`║   🌐 http://localhost:${port}                               ║`);
    console.log('║                                                            ║');
    
    const hasYtDlp = await checkYtDlp();
    const ffmpeg = await findFFmpeg();
    
    if (hasYtDlp) console.log('║   ✅ yt-dlp: installiert');
    else console.log('║   ❌ yt-dlp: NICHT installiert');
    
    if (ffmpeg) console.log('║   ✅ FFmpeg: installiert');
    else console.log('║   ❌ FFmpeg: NICHT installiert');
    
    if (hasYtDlp && ffmpeg) {
        console.log('║   🎉 ALLE SYSTEMVORAUSSETZUNGEN ERFÜLLT!');
    }
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
});