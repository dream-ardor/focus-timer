// Version 3: The correct approach with pause/resume

let timeLeft = 5;
let timerID = null;
let isRunning = false;

const displayElement = document.getElementById('display');
const startButton = document.getElementById('startBtn');

// === AUDIO ALERT ===

// Simple beep sound (base64 encoded)
const BEEP_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm==';

let isMuted = false; // Track mute state

// Create audio element
const alertSound = new Audio(BEEP_SOUND);

// Function to play alert sound
function playAlertSound() {
    if (isMuted) {
        console.log('Alert muted by user');
        return;
    }
    
    // Reset audio to beginning (in case it's already played)
    alertSound.currentTime = 0;
    
    // Attempt to play
    const playPromise = alertSound.play();
    
    // Handle the promise (could fail due to browser policies)
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log('Alert sound played successfully');
            })
            .catch(error => {
                console.warn('Could not play alert sound:', error);
                console.log('User may need to interact with page first');
            });
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
    displayElement.textContent = formatTime(timeLeft);
}

function tick() {
    timeLeft = timeLeft - 1;
    updateDisplay();
    
    if (timeLeft <= 0) {
        clearInterval(timerID);
        timerID = null;
        isRunning = false;
        startButton.textContent = 'Start';
        playAlertSound();
        console.log('Timer finished!');
    }
}

// Set initial display
updateDisplay();

startButton.addEventListener('click', function() {
    if (isRunning) {
        // PAUSE
        clearInterval(timerID);
        timerID = null;
        isRunning = false;
        startButton.textContent = 'Resume';
        minutesInput.disabled = false;
        console.log('Timer paused at', timeLeft, 'seconds');
    } else {
        if (timeLeft <= 0) {
            timeLeft = 300;
            updateDisplay();
        }
        // START or RESUME
        isRunning = true;
        startButton.textContent = 'Pause';
        minutesInput.disabled = true;
        clearError();
        console.log('Timer starting from', timeLeft, 'seconds');
        
        // Run first tick immediately (fixes the 1-second delay)
        tick();
        
        // Then continue ticking every second
        timerID = setInterval(tick, 1000);
    }
});

const resetButton = document.getElementById('resetBtn');

resetButton.addEventListener('click', function() {
    // Stop the timer if running
    if (isRunning) {
        clearInterval(timerID);
        timerID = null;
        isRunning = false;
    }
    
    // Reset everything to initial state
    timeLeft = 300;
    updateDisplay();
    startButton.textContent = 'Start';
    minutesInput.disabled = false;
    clearError();
    console.log('Timer reset to 5:00');
});

// === CUSTOM TIME INPUT ===

const minutesInput = document.getElementById('minutesInput');
const setButton = document.getElementById('setBtn');
const errorMessage = document.getElementById('errorMessage');

// Function to show error message
function showError(message) {
    errorMessage.textContent = message;
    minutesInput.classList.add('invalid');
}

// Function to clear error message
function clearError() {
    errorMessage.textContent = '';
    minutesInput.classList.remove('invalid');
}

// Function to validate and set custom time
function setCustomTime() {
    // Clear any previous errors
    clearError();
    
    // Don't allow changing time while timer is running
    if (isRunning) {
        showError('Pause the timer before changing duration');
        return;
    }
    
    // Get the input value and trim whitespace
    const input = minutesInput.value.trim();
    
    // Check if input is empty
    if (input === '') {
        showError('Please enter a number of minutes');
        return;
    }
    
    // Convert to number
    const minutes = Number(input);
    
    // Validate: Is it a number?
    if (isNaN(minutes)) {
        showError('Please enter a valid number');
        return;
    }
    
    // Validate: Is it an integer (no decimals)?
    if (!Number.isInteger(minutes)) {
        showError('Please enter whole minutes only');
        return;
    }
    
    // Validate: Minimum bound
    if (minutes < 1) {
        showError('Timer must be at least 1 minute');
        return;
    }
    
    // Validate: Maximum bound
    if (minutes > 999) {
        showError('Timer cannot exceed 999 minutes');
        return;
    }
    
    // ALL VALIDATION PASSED
    // Convert minutes to seconds and update timer
    timeLeft = minutes * 60;
    updateDisplay();
    
    console.log(`Timer set to ${minutes} minutes (${timeLeft} seconds)`);
}

// Listen for Set button click
setButton.addEventListener('click', setCustomTime);

// Listen for Enter key in input field
minutesInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        setCustomTime();
    }
});

// Disable input while timer is running
// === MUTE TOGGLE ===

const muteButton = document.getElementById('muteBtn');

muteButton.addEventListener('click', function() {
    isMuted = !isMuted; // Toggle the state
    
    if (isMuted) {
        muteButton.textContent = '🔇';
        console.log('Alert sound muted');
    } else {
        muteButton.textContent = '🔊';
        console.log('Alert sound unmuted');
    }
});