// Timer data structure
let timers = [];
let nextTimerID = 1;  // Counter for unique IDs

// Create initial default timer
function createTimer(name, durationMinutes) {
    return {
        id: nextTimerID++,           // Unique ID, then increment counter
        name: name,                   // User-facing name
        duration: durationMinutes * 60,  // Total time in seconds
        timeLeft: durationMinutes * 60,  // Current countdown value
        isRunning: false,             // Currently counting down?
        timerID: null,                // setInterval reference
        alarmInterval: null           // Alarm repeat interval
    };
}

// Initialize with one default timer
timers.push(createTimer('Focus Timer', 5));

const displayElement = document.getElementById('display');
const startButton = document.getElementById('startBtn');

// Helper: Get the current (first) timer
// For now, we only work with timers[0]
// Later, we'll work with multiple timers
function getCurrentTimer() {
    return timers[0];
}

// Helper: Update a timer's display
function updateTimerDisplay(timer) {
    displayElement.textContent = formatTime(timer.timeLeft);
}

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

// === VIBRATION ALERT ===

// Function to trigger vibration
function vibrateAlert() {
    // Check if device supports vibration
    if ('vibrate' in navigator) {
        console.log('Vibration API is available');
        
        // Try to vibrate
        const result = navigator.vibrate([500, 200, 500]);
        console.log('Vibrate result:', result);
        
        if (result) {
            console.log('Vibration triggered successfully');
        } else {
            console.log('Vibration call returned false');
        }
    } else {
        console.log('Vibration API not supported on this device/browser');
    }
}

// === ALARM SYSTEM ===

let alarmInterval = null; // Track repeating alarm
const dismissButton = document.getElementById('dismissBtn');

// Function to flash the screen
function flashScreen() {
    const container = document.querySelector('.container');
    
    // Add flash class
    container.style.backgroundColor = '#FF3B30';
    container.style.transition = 'background-color 0.3s';
    
    // Reset after brief moment
    setTimeout(function() {
        container.style.backgroundColor = 'white';
    }, 300);
}

// Function to start the alarm (repeating sound + vibration)
function startAlarm() {
    console.log('Alarm started - repeating every 2 seconds');
    
    // Show dismiss button
    dismissButton.style.display = 'block';
    
    // Change page title (visible in browser tab)
    document.title = '⏰ TIME\'S UP!';
    
    // Flash the screen
    flashScreen();
    
    // Play sound and vibrate immediately
    playAlertSound();
    vibrateAlert();
    
    // Then repeat every 2 seconds
    alarmInterval = setInterval(function() {
        playAlertSound();
        vibrateAlert();
    }, 2000); // 2000ms = 2 seconds
}

// Function to stop the alarm
function stopAlarm() {
    console.log('Alarm dismissed');
    
    // Stop repeating
    if (alarmInterval !== null) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
    
    // Hide dismiss button
    dismissButton.style.display = 'none';
    
    // Reset page title
    document.title = 'Focus Timer';
}

// Listen for dismiss button click
dismissButton.addEventListener('click', function() {
    stopAlarm();
});

// === TIMER FUNCTIONS ===

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function tick() {
    const timer = getCurrentTimer();
    
    // Countdown
    timer.timeLeft = timer.timeLeft - 1;
    updateTimerDisplay(timer);
    
    // Check if finished
    if (timer.timeLeft <= 0) {
        clearInterval(timer.timerID);
        timer.timerID = null;
        timer.isRunning = false;
        startButton.textContent = 'Start';
        
        // Start the alarm
        startAlarm();
        
        console.log('Timer finished!');
    }
}

// Set initial display
updateTimerDisplay(getCurrentTimer());

// === START/PAUSE BUTTON ===

startButton.addEventListener('click', function() {
    const timer = getCurrentTimer();
    
    if (timer.isRunning) {
        // PAUSE
        clearInterval(timer.timerID);
        timer.timerID = null;
        timer.isRunning = false;
        startButton.textContent = 'Resume';
        console.log('Timer paused at', timer.timeLeft, 'seconds');
    } else {
        // If timer finished, reset it
        if (timer.timeLeft <= 0) {
            timer.timeLeft = timer.duration;  // Reset to original duration
            updateTimerDisplay(timer);
        }
        
        // START or RESUME
        timer.isRunning = true;
        startButton.textContent = 'Pause';
        console.log('Timer starting from', timer.timeLeft, 'seconds');
        
        // Run first tick immediately
        tick();
        
        // Then continue ticking every second
        timer.timerID = setInterval(tick, 1000);
    }
});

// === RESET BUTTON ===

const resetButton = document.getElementById('resetBtn');

resetButton.addEventListener('click', function() {
    const timer = getCurrentTimer();
    
    // Stop the alarm if it's going
    stopAlarm();
    
    // Stop the timer if running
    if (timer.isRunning) {
        clearInterval(timer.timerID);
        timer.timerID = null;
        timer.isRunning = false;
    }
    
    // Reset to original duration
    timer.timeLeft = timer.duration;
    updateTimerDisplay(timer);
    startButton.textContent = 'Start';
    console.log('Timer reset to', formatTime(timer.duration));
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
    const timer = getCurrentTimer();
    
    // Clear any previous errors
    clearError();
    
    // Don't allow changing time while timer is running
    if (timer.isRunning) {
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
    // Update both duration and timeLeft
    timer.duration = minutes * 60;
    timer.timeLeft = minutes * 60;
    updateTimerDisplay(timer);
    
    console.log(`Timer set to ${minutes} minutes (${timer.timeLeft} seconds)`);
}

// Listen for Set button click
setButton.addEventListener('click', setCustomTime);

// Listen for Enter key in input field
minutesInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        setCustomTime();
    }
});

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

// === ADD TIMER FUNCTIONALITY ===

const addTimerBtn = document.getElementById('addTimerBtn');
const timerForm = document.getElementById('timerForm');
const createTimerBtn = document.getElementById('createTimerBtn');
const cancelTimerBtn = document.getElementById('cancelTimerBtn');
const timerNameInput = document.getElementById('timerName');
const timerDurationInput = document.getElementById('timerDuration');
const formErrorElement = document.getElementById('formError');

// Show the form when "Add Timer" is clicked
addTimerBtn.addEventListener('click', function() {
    timerForm.style.display = 'block';
    timerNameInput.value = '';  // Clear previous values
    timerDurationInput.value = '';
    formErrorElement.textContent = '';  // Clear errors
    timerNameInput.focus();  // Focus on name input
});

// Hide the form when "Cancel" is clicked
cancelTimerBtn.addEventListener('click', function() {
    timerForm.style.display = 'none';
    formErrorElement.textContent = '';
});

// Create new timer when "Create Timer" is clicked
createTimerBtn.addEventListener('click', function() {
    // Get values
    const name = timerNameInput.value.trim();
    const durationStr = timerDurationInput.value.trim();
    
    // Clear previous errors
    formErrorElement.textContent = '';
    
    // Validate name
    if (name === '') {
        formErrorElement.textContent = 'Please enter a timer name';
        return;
    }
    
    // Validate duration
    if (durationStr === '') {
        formErrorElement.textContent = 'Please enter a duration';
        return;
    }
    
    const duration = Number(durationStr);
    
    if (isNaN(duration)) {
        formErrorElement.textContent = 'Duration must be a number';
        return;
    }
    
    if (!Number.isInteger(duration)) {
        formErrorElement.textContent = 'Duration must be a whole number';
        return;
    }
    
    if (duration < 1) {
        formErrorElement.textContent = 'Duration must be at least 1 minute';
        return;
    }
    
    if (duration > 999) {
        formErrorElement.textContent = 'Duration cannot exceed 999 minutes';
        return;
    }
    
    // ALL VALIDATION PASSED - Create the timer
    const newTimer = createTimer(name, duration);
    timers.push(newTimer);
    
    console.log('Timer created:', newTimer);
    console.log('All timers:', timers);
    
    // Hide the form
    timerForm.style.display = 'none';
    
    // Show success feedback (optional)
    alert(`Timer "${name}" created for ${duration} minutes!`);
});