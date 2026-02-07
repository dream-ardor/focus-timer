// Timer data structure
let timers = [];
let nextTimerID = 1;

// Create initial default timer
function createTimer(name, durationMinutes) {
    return {
        id: nextTimerID++,
        name: name,
        duration: durationMinutes * 60,
        timeLeft: durationMinutes * 60,
        isRunning: false,
        timerID: null,
        alarmInterval: null
    };
}
//load saved timers or create default
const savedTimers = loadTimers();

if (savedTimers.length > 0) {
    timers = savedTimers;
    //Update nextTimerID to avoid ID conflicts
    const maxID = Math.max(...timers.map(t => t.id));
    nextTimerID = maxID + 1;
} else {
    //no saved timers, create default
    timers.push(createTimer('Focus Timer', 5));
    saveTimers();
}

// === PERSISTENCE ===

// Save timers to localStorage
function saveTimers() {
    try {
        // Create a cleaned version without runtime state
        const timersToSave = timers.map(timer => ({
            id: timer.id,
            name: timer.name,
            duration: timer.duration,
            timeLeft: timer.timeLeft
            // Omit: isRunning, timerID, alarmInterval
        }));
        
        localStorage.setItem('focus-timers', JSON.stringify(timersToSave));
        console.log('Timers saved to localStorage');
    } catch (error) {
        console.error('Failed to save timers:', error);
        // If localStorage is full or unavailable, fail gracefully
    }
}

// Load timers from localStorage
function loadTimers() {
    try {
        const saved = localStorage.getItem('focus-timers');
        
        if (!saved) {
            console.log('No saved timers found');
            return [];
        }
        
        const parsed = JSON.parse(saved);
        
        // Reconstruct full timer objects with runtime state
        const loadedTimers = parsed.map(saved => ({
            id: saved.id,
            name: saved.name,
            duration: saved.duration,
            timeLeft: saved.timeLeft,
            isRunning: false,      // Always start stopped
            timerID: null,
            alarmInterval: null
        }));
        
        console.log('Timers loaded from localStorage:', loadedTimers.length);
        return loadedTimers;
    } catch (error) {
        console.error('Failed to load timers:', error);
        return [];  // Return empty array on error
    }
}

// === AUDIO ALERT ===

const BEEP_SOUND = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dyvm==';

let isMuted = false;

function playAlertSound() {
    if (isMuted) {
        console.log('Alert muted by user');
        return;
    }
    
    // Create new audio element for each play
    // This avoids conflicts when multiple timers alarm simultaneously
    const sound = new Audio(BEEP_SOUND);
    
    const playPromise = sound.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => console.log('Alert sound played successfully'))
            .catch(error => {
                console.warn('Could not play alert sound:', error);
            });
    }
}

// === VIBRATION ALERT ===

function vibrateAlert() {
    if ('vibrate' in navigator) {
        const result = navigator.vibrate([500, 200, 500]);
        console.log('Vibration triggered:', result);
    } else {
        console.log('Vibration not supported');
    }
}

// === ALARM SYSTEM ===

const dismissButton = document.getElementById('dismissBtn');
if (dismissButton) {
    dismissButton.addEventListener('click', stopAlarm);
}

function flashScreen() {
    const container = document.querySelector('.container');
    container.style.backgroundColor = '#FF3B30';
    container.style.transition = 'background-color 0.3s';
    
    setTimeout(function() {
        container.style.backgroundColor = 'white';
    }, 300);
}

function startAlarm(timerID) {
    const timer = findTimer(timerID);
    if (!timer) return;
    console.log('Alarm started');
   //stop any existing timer for this alarm 
    if(timer.alarmInterval) {
        clearInterval(timer.alarmInterval);
    }


    dismissButton.style.display = 'block';
    document.title = '⏰ TIME\'S UP!';
    flashScreen();
    
    playAlertSound();
    vibrateAlert();
    
    timer.alarmInterval = setInterval(function() {
        playAlertSound();
        vibrateAlert();
    }, 2000);
}

function stopAlarm() {
   timers.forEach(timer => {
    if(timer.alarmInterval){
        clearInterval(timer.alarmInterval);
        timer.alarmInterval = null;
    }
   });
    
    dismissButton.style.display = 'none';
    document.title = 'Focus Timer';
}

// === TIMER FUNCTIONS ===

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Find timer by ID
function findTimer(id) {
    return timers.find(t => t.id === id);
}

// Tick function for a specific timer
// Tick function for a specific timer
function tick(timerID) {
    const timer = findTimer(timerID);
    if (!timer) return;
    
    timer.timeLeft = timer.timeLeft - 1;
    renderTimers(); // Re-render to update display
    
    // Save every 10 seconds to preserve progress
    if (timer.timeLeft % 10 === 0) {
        saveTimers();
        console.log('💾 Progress saved at', formatTime(timer.timeLeft));
    }
    
    if (timer.timeLeft <= 0) {
        clearInterval(timer.timerID);
        timer.timerID = null;
        timer.isRunning = false;
        
        saveTimers(); // Save when finished
        
        startAlarm(timer.id);
        renderTimers(); // Re-render to show stopped state
        
        console.log('Timer finished:', timer.name);
    }
}

// === DYNAMIC UI RENDERING ===

const timersContainer = document.getElementById('timersContainer');

// Render all timers
function renderTimers() {
    // Clear container
    timersContainer.innerHTML = '';
    
    // If no timers, show empty state
    if (timers.length === 0) {
        timersContainer.innerHTML = `
            <div class="empty-state">
                <p>No timers yet</p>
                <p>Click "+ Add Timer" to create one</p>
            </div>
        `;
        return;
    }
    
    // Create card for each timer
    timers.forEach(timer => {
        const card = createTimerCard(timer);
        timersContainer.appendChild(card);
    });
}

// Create HTML element for one timer
function createTimerCard(timer) {
    // Create card container
    const card = document.createElement('div');
    card.className = 'timer-card';
    if (timer.isRunning) {
        card.classList.add('running');
    }
    
    // Timer header (name)
    const header = document.createElement('div');
    header.className = 'timer-header';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'timer-name';
    nameEl.textContent = timer.name;
    
    header.appendChild(nameEl);
    
    // Timer display (countdown)
    const display = document.createElement('div');
    display.className = 'timer-display';
    display.textContent = formatTime(timer.timeLeft);

    // Progress bar
const progressContainer = document.createElement('div');
progressContainer.className = 'progress-container';

const progressBar = document.createElement('div');
progressBar.className = 'progress-bar';

// Calculate progress percentage
const elapsed = timer.duration - timer.timeLeft;
const progress = (elapsed / timer.duration) * 100;
progressBar.style.width = progress + '%';

// Color based on progress
if (progress < 33) {
    // Green (early stage)
    progressBar.style.background = 'linear-gradient(90deg, #34C759 0%, #30D158 100%)';
} else if (progress < 66) {
    // Blue (middle stage)
    progressBar.style.background = 'linear-gradient(90deg, #007AFF 0%, #0051D5 100%)';
} else {
    // Orange/Red (final stage)
    progressBar.style.background = 'linear-gradient(90deg, #FF9500 0%, #FF3B30 100%)';
}

// Progress text
const progressText = document.createElement('div');
progressText.className = 'progress-text';
// Show both percentage and time remaining
progressText.textContent = Math.round(progress) + '% • ' + formatTime(timer.timeLeft) + ' left';

progressContainer.appendChild(progressBar);
progressContainer.appendChild(progressText);
    
    // Controls
    const controls = document.createElement('div');
    controls.className = 'timer-controls';
    
    // Start/Pause button
    const startPauseBtn = document.createElement('button');
    startPauseBtn.className = timer.isRunning ? 'pause-btn' : 'start-btn';
    startPauseBtn.textContent = timer.isRunning ? 'Pause' : 'Start';
    startPauseBtn.dataset.id = timer.id;
    startPauseBtn.dataset.action = 'startPause';
    
    // Reset button
    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-btn';
    resetBtn.textContent = 'Reset';
    resetBtn.dataset.id = timer.id;
    resetBtn.dataset.action = 'reset';
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.id = timer.id;
    deleteBtn.dataset.action = 'delete';
    
    controls.appendChild(startPauseBtn);
    controls.appendChild(resetBtn);
    controls.appendChild(deleteBtn);
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(display);
    card.appendChild(progressContainer);
    card.appendChild(controls);
    
    return card;
}

// === EVENT DELEGATION ===

// Single listener for all timer buttons
timersContainer.addEventListener('click', function(event) {
    const button = event.target;
    
    // Check if a button was clicked
    if (!button.dataset.action) return;
    
    const timerID = parseInt(button.dataset.id);
    const action = button.dataset.action;
    
    if (action === 'startPause') {
        handleStartPause(timerID);
    } else if (action === 'reset') {
        handleReset(timerID);
    } else if (action === 'delete') {
        handleDelete(timerID);
    }
});

// Handle Start/Pause
function handleStartPause(timerID) {
    const timer = findTimer(timerID);
    if (!timer) return;
    
    if (timer.isRunning) {
        // PAUSE
        clearInterval(timer.timerID);
        timer.timerID = null;
        timer.isRunning = false;
        console.log('Timer paused:', timer.name);
    } else {
        // START or RESUME
        if (timer.timeLeft <= 0) {
            timer.timeLeft = timer.duration;
        }
        
        timer.isRunning = true;
        console.log('Timer started:', timer.name);
        
        // First tick immediately
        tick(timer.id);
        
        // Then every second
        timer.timerID = setInterval(() => tick(timer.id), 1000);
    }
    
    renderTimers();
}

// Handle Reset
function handleReset(timerID) {
    const timer = findTimer(timerID);
    if (!timer) return;
    
    stopAlarm();
    
    if (timer.isRunning) {
        clearInterval(timer.timerID);
        timer.timerID = null;
        timer.isRunning = false;
    }
    
    timer.timeLeft = timer.duration;
    console.log('Timer reset:', timer.name);

    saveTimers();
    
    renderTimers();
}

// Handle Delete
function handleDelete(timerID) {
    const timer = findTimer(timerID);
    if (!timer) return;
    
    // Confirm deletion
    const confirmDelete = confirm(`Delete timer "${timer.name}"?`);
    if (!confirmDelete) return;
    
    // Stop timer if running
    if (timer.isRunning) {
        clearInterval(timer.timerID);
    }
    
    // Remove from array
    timers = timers.filter(t => t.id !== timerID);
    
    console.log('Timer deleted:', timer.name);

    saveTimers();
    
    renderTimers();
}

// === MUTE TOGGLE ===

const muteButton = document.getElementById('muteBtn');

muteButton.addEventListener('click', function() {
    isMuted = !isMuted;
    
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

addTimerBtn.addEventListener('click', function() {
    timerForm.style.display = 'block';
    timerNameInput.value = '';
    timerDurationInput.value = '';
    formErrorElement.textContent = '';
    timerNameInput.focus();
});

cancelTimerBtn.addEventListener('click', function() {
    timerForm.style.display = 'none';
    formErrorElement.textContent = '';
});

createTimerBtn.addEventListener('click', function() {
    const name = timerNameInput.value.trim();
    const durationStr = timerDurationInput.value.trim();
    
    formErrorElement.textContent = '';
    
    if (name === '') {
        formErrorElement.textContent = 'Please enter a timer name';
        return;
    }
    
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
    
    // Create timer
    const newTimer = createTimer(name, duration);
    timers.push(newTimer);
    
    console.log('Timer created:', newTimer);

    saveTimers();
    
    // Hide form and re-render
    timerForm.style.display = 'none';
    renderTimers();
});

// === INITIAL RENDER ===

renderTimers();