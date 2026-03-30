/**
 * Audio utility for check-in notifications
 * Uses base64 strings to ensure the app doesn't rely on external assets
 */

// A short "ping" sound for success
const SUCCESS_BASE64 = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAgD8AAIA/AAABAAgAZGF0YREAAAAAgICAgICAgICAgICAgICA';
// A short "low buzzer" sound for error
const ERROR_BASE64 = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAgD8AAIA/AAABAAgAZGF0YREAAAAAgICAgICAgICAgICAgICA';

// Note: The above are placeholders. I'll provide real, audible base64 strings.
// Using slightly longer ones for actual sound.

const CHECKIN_SUCCESS = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

/**
 * Since generating base64 waves is complex, we use a programmatic approach
 * to play a beep using the Web Audio API. This is cleaner and more reliable.
 */

export const playCheckinSuccess = () => {
    if (typeof window === 'undefined') return;
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (error) {
        console.warn('Audio check-in success sound failed:', error);
    }
};

export const playCheckinError = () => {
    if (typeof window === 'undefined') return;
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (error) {
        console.warn('Audio check-in error sound failed:', error);
    }
};
