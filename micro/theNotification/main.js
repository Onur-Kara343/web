(function() {
    'use strict';

    const overlay = document.getElementById('jumpscareOverlay');
    const cookieBtn = document.getElementById('acceptCookies');
    const cookieBanner = document.getElementById('cookieBanner');
    const audioElement = document.getElementById('scarySound');
    const jumpscareImage = document.getElementById('jumpscareImage');

    let soundPlayed = false;

    // ========== Sound abspielen ==========
    function playScarySound() {
        if (audioElement) {
            audioElement.currentTime = 0;
            audioElement.volume = 1.0;
            audioElement.play().catch(function(err) {
                console.warn('Audio konnte nicht abgespielt werden:', err);
            });
        }
    }

    // ========== Jumpscare auslösen ==========
    function triggerJumpscare() {
        if (soundPlayed) return;
        soundPlayed = true;

        // Overlay aktivieren
        overlay.classList.add('active');

        // Sound abspielen
        playScarySound();

        // Cookie-Banner ausblenden
        if (cookieBanner) {
            cookieBanner.style.transition = 'opacity 0.3s';
            cookieBanner.style.opacity = '0';
            setTimeout(function() {
                cookieBanner.style.display = 'none';
            }, 350);
        }

        // Falls das Bild nicht geladen werden kann: Fallback-Text
        if (jumpscareImage) {
            jumpscareImage.onerror = function() {
                this.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'fallback-text';
                fallback.innerText = '💀 BOO! 💀';
                overlay.appendChild(fallback);
            };
        }
    }

    // ========== Event: Cookie-Button ==========
    cookieBtn.addEventListener('click', function(e) {
        e.preventDefault();
        triggerJumpscare();
    });

    // ========== ESC-Taste deaktivieren ==========
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
        }
    });

    console.log('🍪 Akzeptiere die Cookies... wenn du dich traust! 😈');
})();