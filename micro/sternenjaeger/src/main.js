(function() {
    'use strict';

    // ============================================
    // ELEMENTE
    // ============================================
    const gameContainer = document.getElementById('gameContainer');
    const gameArea = document.getElementById('gameArea');
    const starTarget = document.getElementById('starTarget');
    const scoreValue = document.getElementById('scoreValue');
    const timerValue = document.getElementById('timerValue');
    const progressFill = document.getElementById('progressFill');
    const gameHint = document.getElementById('gameHint');
    const startBtn = document.getElementById('startBtn');
    const overlay = document.getElementById('jumpscareOverlay');
    const audioElement = document.getElementById('scarySound');

    // ============================================
    // KONFIGURATION
    // ============================================
    const TOTAL_STARS = 5;
    const TIME_LIMIT = 5.0;
    const JUMPSCARE_AT = 5;

    // ============================================
    // VARIABLEN
    // ============================================
    let score = 0;
    let timeLeft = TIME_LIMIT;
    let gameRunning = false;
    let timerInterval = null;
    let soundPlayed = false;

    // ============================================
    // 1️⃣ VIBRATION
    // ============================================
    function vibratePhone() {
        if (navigator.vibrate) {
            navigator.vibrate([200, 80, 200, 80, 500]);
            setTimeout(() => {
                navigator.vibrate([100, 50, 100, 50, 300]);
            }, 600);
        }
    }

    // ============================================
    // 2️⃣ SOUND – NUR ABSPIELEN
    // ============================================
    function playScarySound() {
        if (!audioElement) return;
        try {
            audioElement.currentTime = 0;
            audioElement.volume = 1.0;
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(function(err) {
                    console.warn('Sound konnte nicht abgespielt werden:', err);
                });
            }
        } catch (e) {
            console.warn('Sound-Fehler:', e);
        }
    }

    // ============================================
    // 3️⃣ BILD LADEN
    // ============================================
    function loadJumpscareImage() {
        return new Promise(function(resolve) {
            const img = document.createElement('img');
            img.src = 'src/assets/jumpscare.jpg?t=' + Date.now();
            img.alt = 'Jumpscare';

            img.onload = function() { resolve(img); };
            img.onerror = function() {
                const fallback = document.createElement('div');
                fallback.style.cssText = 'color:#ff0000;font-size:80px;font-weight:bold;font-family:Impact;text-align:center;text-shadow:0 0 40px #ff0000;';
                fallback.innerText = '💀 BOO! 💀';
                resolve(fallback);
            };
        });
    }

    // ============================================
    // 4️⃣ JUMPSCARE – ALLES GLEICHZEITIG!
    // ============================================
    async function triggerJumpscare() {
        if (soundPlayed) return;
        soundPlayed = true;

        // Timer stoppen
        stopTimer();
        gameRunning = false;

        // ---------- ALLES SOFORT & GLEICHZEITIG ----------
        // 1. Overlay aktivieren + Flackern + Bild
        overlay.classList.add('active');
        overlay.classList.add('flash-white');

        // 2. Sound SOFORT abspielen
        playScarySound();

        // 3. Vibration SOFORT
        vibratePhone();

        // 4. Bild SOFORT laden und anzeigen
        try {
            const imageElement = await loadJumpscareImage();
            overlay.appendChild(imageElement);
        } catch (error) {
            const fallback = document.createElement('div');
            fallback.style.cssText = 'color:#ff0000;font-size:80px;font-weight:bold;font-family:Impact;text-align:center;text-shadow:0 0 40px #ff0000;z-index:10000;position:relative;';
            fallback.innerText = '💀 BOO! 💀';
            overlay.appendChild(fallback);
        }

        // 5. Nach dem Flackern → schwarzes Dauerflackern
        setTimeout(function() {
            overlay.classList.remove('flash-white');
            overlay.classList.add('flash-black');
        }, 1200);

        // 6. Spiel ausblenden
        gameContainer.style.transition = 'opacity 0.3s';
        gameContainer.style.opacity = '0';
        setTimeout(function() {
            gameContainer.style.display = 'none';
        }, 350);
    }

    // ============================================
    // 5️⃣ STERN BEWEGEN
    // ============================================
    function moveStar() {
        const areaRect = gameArea.getBoundingClientRect();
        const starSize = 80;
        const padding = 20;

        const maxX = areaRect.width - starSize - padding;
        const maxY = areaRect.height - starSize - padding - 60;

        const randomX = padding + Math.random() * maxX;
        const randomY = padding + 60 + Math.random() * maxY;

        starTarget.style.left = randomX + 'px';
        starTarget.style.top = randomY + 'px';
        starTarget.style.transition = 'left 0.25s ease, top 0.25s ease';
    }

    // ============================================
    // 6️⃣ TIMER
    // ============================================
    function startTimer() {
        const startTime = Date.now();
        timerInterval = setInterval(function() {
            const elapsed = (Date.now() - startTime) / 1000;
            timeLeft = Math.max(0, TIME_LIMIT - elapsed);
            timerValue.textContent = timeLeft.toFixed(1) + 's';

            if (timeLeft <= 2) {
                timerValue.style.color = '#ef4444';
            } else if (timeLeft <= 4) {
                timerValue.style.color = '#f59e0b';
            } else {
                timerValue.style.color = '#facc15';
            }

            if (timeLeft <= 0) {
                stopTimer();
                if (gameRunning) {
                    gameRunning = false;
                    gameHint.textContent = '⏰ Zeit abgelaufen! Versuch es nochmal!';
                    starTarget.classList.add('hidden');
                    startBtn.disabled = false;
                    startBtn.textContent = 'NOCHMAL SPIELEN';
                }
            }
        }, 100);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // ============================================
    // 7️⃣ STERN GEKLICKT
    // ============================================
    function onStarClick(e) {
        e.preventDefault();
        if (!gameRunning) return;

        score++;
        scoreValue.textContent = score + ' / ' + TOTAL_STARS;

        const progress = (score / TOTAL_STARS) * 100;
        progressFill.style.width = progress + '%';

        // ---------- 5. STERN = JUMPSCARE SOFORT! ----------
        if (score >= JUMPSCARE_AT) {
            gameRunning = false;
            stopTimer();
            gameHint.textContent = '💀 ERWISCHT...';
            starTarget.classList.add('hidden');
            triggerJumpscare();
            return;
        }

        gameHint.textContent = 'Weiter! Noch ' + (TOTAL_STARS - score) + ' Sterne!';
        moveStar();
    }

    // ============================================
    // 8️⃣ SPIEL STARTEN
    // ============================================
    function startGame() {
        score = 0;
        soundPlayed = false;
        timeLeft = TIME_LIMIT;
        gameRunning = true;

        scoreValue.textContent = '0 / ' + TOTAL_STARS;
        timerValue.textContent = TIME_LIMIT.toFixed(1) + 's';
        timerValue.style.color = '#facc15';
        progressFill.style.width = '0%';
        gameHint.textContent = 'Klicke auf den Stern!';
        starTarget.classList.remove('hidden');

        setTimeout(function() {
            moveStar();
        }, 50);

        stopTimer();
        startTimer();

        startBtn.disabled = true;
        startBtn.textContent = 'LÄUFT...';

        starTarget.removeEventListener('click', onStarClick);
        starTarget.addEventListener('click', onStarClick);
    }

    // ============================================
    // 9️⃣ START BUTTON
    // ============================================
    startBtn.addEventListener('click', function() {
        startGame();
    });

    // ============================================
    // ESC DEAKTIVIEREN
    // ============================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') e.preventDefault();
    });

    console.log('⭐ Sternenjäger – 5 Sterne in 5 Sekunden!');
    console.log('💀 Viel Glück...');
})();