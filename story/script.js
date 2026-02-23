/* ============================================
   THE SAINTS: RESISTANCE IN LIGHT
   Tap-through narrative controller
   Mobile-first, iOS/Android compatible
   ============================================ */

(function () {
    'use strict';

    const totalBeats = 10;
    let currentBeat = 1;
    let isTransitioning = false;

    // DOM elements
    const progressBar = document.getElementById('progressBar');
    const navHint = document.getElementById('navHint');
    const restartBtn = document.getElementById('restartBtn');

    // --- Navigation ---

    function goToBeat(beatNumber) {
        if (isTransitioning || beatNumber < 1 || beatNumber > totalBeats) return;
        if (beatNumber === currentBeat) return;

        isTransitioning = true;

        // Deactivate current beat
        const currentEl = document.getElementById('beat-' + currentBeat);
        if (currentEl) {
            currentEl.classList.remove('active');
            // Reset scroll position on beat 10 when leaving
            if (currentBeat === 10) {
                currentEl.scrollTop = 0;
            }
        }

        // Activate new beat
        currentBeat = beatNumber;
        const nextEl = document.getElementById('beat-' + currentBeat);
        if (nextEl) {
            nextEl.classList.add('active');
            triggerAnimations(nextEl);
        }

        // Update progress bar
        updateProgress();

        // Update nav hint
        updateNavHint();

        // Allow next transition after animation completes
        setTimeout(function () {
            isTransitioning = false;
        }, 900);
    }

    function nextBeat() {
        if (currentBeat < totalBeats) {
            goToBeat(currentBeat + 1);
        }
    }

    function prevBeat() {
        if (currentBeat > 1) {
            goToBeat(currentBeat - 1);
        }
    }

    function restart() {
        isTransitioning = false;
        // Deactivate current beat
        var currentEl = document.getElementById('beat-' + currentBeat);
        if (currentEl) {
            currentEl.classList.remove('active');
            if (currentBeat === 10) {
                currentEl.scrollTop = 0;
            }
        }
        currentBeat = 1;
        var firstEl = document.getElementById('beat-1');
        if (firstEl) {
            firstEl.classList.add('active');
            triggerAnimations(firstEl);
        }
        updateProgress();
        updateNavHint();
        // Scroll to top for beat 10 cleanup
        window.scrollTo(0, 0);
    }

    // --- Progress ---

    function updateProgress() {
        var percent = (currentBeat / totalBeats) * 100;
        progressBar.style.width = percent + '%';
    }

    // --- Nav Hint ---

    function updateNavHint() {
        if (currentBeat === totalBeats) {
            navHint.classList.add('hidden');
        } else {
            navHint.classList.remove('hidden');
        }
    }

    // --- Animations ---

    function triggerAnimations(beatEl) {
        var animated = beatEl.querySelectorAll(
            '[class*="delay-"], .text-whisper, .text-main, .text-disruption, ' +
            '.text-resolution, .text-question, .saint-image-container, .saint-text, ' +
            '.seducer-image-container, .seducer-text, .video-container, .clown-grid, ' +
            '.refusal-after, .refusal-text, .triptych-container, .close-links, .reference-section'
        );
        for (var i = 0; i < animated.length; i++) {
            animated[i].style.animation = 'none';
            animated[i].offsetHeight; // force reflow
            animated[i].style.animation = '';
        }
    }

    // --- Helpers ---

    function isInteractiveElement(el) {
        return el.closest('a, button, iframe, .speech-link, .close-links, .reference-section');
    }

    // --- Click / Tap to advance ---

    document.addEventListener('click', function (e) {
        if (isInteractiveElement(e.target)) return;
        nextBeat();
    });

    // --- Keyboard navigation ---

    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            nextBeat();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevBeat();
        }
    });

    // --- Touch / Swipe support ---

    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        if (isInteractiveElement(e.target)) return;

        var touchEndX = e.changedTouches[0].screenX;
        var touchEndY = e.changedTouches[0].screenY;
        var deltaX = touchEndX - touchStartX;
        var deltaY = touchEndY - touchStartY;
        var elapsed = Date.now() - touchStartTime;

        // Quick tap (< 300ms, minimal movement)
        if (elapsed < 300 && Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
            nextBeat();
            return;
        }

        // Horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX < 0) {
                nextBeat();
            } else {
                prevBeat();
            }
        }
    }, { passive: true });

    // --- Restart Button ---

    if (restartBtn) {
        restartBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            restart();
        });
    }

    // --- Prevent double-tap zoom on iOS ---

    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // --- Initialize ---

    updateProgress();
    updateNavHint();

    // Trigger initial beat animations
    var firstBeat = document.getElementById('beat-1');
    if (firstBeat) {
        triggerAnimations(firstBeat);
    }

})();
