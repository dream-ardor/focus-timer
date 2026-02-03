# Focus Timer - Project Handoff Document

**Last Updated:** February 3, 2026  
**Developer:** Dan  
**AI Assistant:** Claude (Anthropic)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Learning Philosophy](#learning-philosophy)
3. [Technical Stack & Decisions](#technical-stack--decisions)
4. [Current Architecture](#current-architecture)
5. [File Structure](#file-structure)
6. [Data Models](#data-models)
7. [Key Functions Reference](#key-functions-reference)
8. [Known Limitations](#known-limitations)
9. [Completed Features](#completed-features)
10. [Roadmap](#roadmap)
11. [Code Standards](#code-standards)
12. [Developer Context](#developer-context)
13. [Working Protocols](#working-protocols)

---

## Project Overview

### What We're Building
A professional-grade timer/reminder application that:
- Manages multiple named timers simultaneously
- Provides persistent, multi-modal alerts (audio, vibration, visual)
- Works as a Progressive Web App (PWA) installable on mobile devices
- Demonstrates production-quality code and architecture

### Current Status
**Phase 2A Complete** - Timer creation and data management working
- Single timer display functional
- Add Timer form and validation complete
- Array-based timer storage implemented
- Ready for Phase 2B (multiple timer display)

### Tech Stack
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Deployment:** GitHub Pages (static hosting)
- **Version Control:** Git/GitHub
- **Development:** VS Code, macOS (M1 MacBook Pro)

### Why This Project
- Real-world use case (managing kids, cooking, work sessions)
- Teaches fundamental concepts that transfer to all frameworks
- Portfolio piece demonstrating systems thinking
- Foundation for future native iOS port

---

## Learning Philosophy

### Core Principles

**1. Mastery Over Speed**
- Understanding *why* code works, not just *that* it works
- Build mental models that generalize across projects
- Prioritize durable knowledge over quick features

**2. Professional Standards First**
- Defensive programming (validate all inputs)
- Graceful error handling (never crash)
- Clear naming and documentation
- Production-ready code quality

**3. Fundamentals Before Frameworks**
- Learn vanilla JavaScript deeply before React/Vue
- Understand state management before Redux
- Master async patterns before advanced libraries

**4. Ship Early, Iterate Based on Use**
- Deploy frequently
- Use the app in real scenarios
- Let real-world feedback drive features

### What Separates This Approach from "Vibe Coding"

**Vibe Coder:**
- Copies code from AI without understanding
- Moves to next feature when current one "works"
- Can't debug or modify code independently
- Chases frameworks without understanding fundamentals

**Our Approach:**
- Understands each line and can explain it
- Tests edge cases and failure modes
- Can modify and extend code confidently
- Builds transferable mental models

**Evidence of Deep Learning:**
- Built three intentionally broken timer versions to understand failure modes
- Can explain why `timerID` and `alarmInterval` must be separate
- Identifies and fixes scope issues independently
- Thinks in terms of state lifecycles and data flow

---

## Technical Stack & Decisions

### Why PWA (Not Native)
**Decision:** Start with Progressive Web App, port to native iOS later

**Reasoning:**
- Faster iteration and learning cycle
- Works across platforms (iOS, Android, desktop)
- No App Store approval delays
- Teaches web fundamentals that transfer to native development
- Can test and use immediately

**Trade-offs Accepted:**
- iOS Safari limitations (vibration, background execution)
- Screen must stay on for reliable timers
- Less "native" feel than Swift app

**Future Path:** Once web fundamentals mastered, port to Swift/SwiftUI for full iOS capabilities

### Why Vanilla JavaScript (Not React)
**Decision:** Pure JavaScript without frameworks

**Reasoning:**
- Understand state management before Redux/Context
- Learn DOM manipulation before virtual DOM
- Grasp event handling before synthetic events
- Mental models transfer to any framework later

**When to add frameworks:** After multiple timer feature complete and architecture is solid

### Why GitHub Pages
**Decision:** Static site hosting via GitHub Pages

**Reasoning:**
- Free
- Automatic deployment from Git push
- HTTPS by default (required for PWA features)
- Industry-standard workflow (Git → Deploy)

---

## Current Architecture

### High-Level Design
```
┌─────────────────────────────────────┐
│         USER INTERFACE              │
│  (HTML dynamically created from     │
│   data via renderTimers())          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         STATE MANAGEMENT            │
│  timers = [                         │
│    {id, name, duration, timeLeft,   │
│     isRunning, timerID, ...}        │
│  ]                                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      BUSINESS LOGIC                 │
│  - Timer countdown (setInterval)    │
│  - Alarm system (repeating alerts)  │
│  - Validation (user input)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      SYSTEM APIS                    │
│  - Audio API (sound alerts)         │
│  - Vibration API (haptic feedback)  │
│  - Notification API (future)        │
└─────────────────────────────────────┘
```

### Data Flow

**User Action → State Update → UI Re-render**

Example: User clicks "Start Timer"
1. Event listener captures click
2. Find timer in array by ID
3. Update timer object (`isRunning = true`)
4. Start `setInterval` for countdown
5. Re-render UI to show "Pause" button

**Key Insight:** UI is a function of state. Change state → UI updates automatically.

---

## File Structure
```
focus-timer/
├── index.html          # Main HTML (minimal, mostly dynamic)
├── style.css           # All styles
├── app.js              # All JavaScript logic
├── manifest.json       # PWA manifest
├── README.md           # Project documentation
└── PROJECT_HANDOFF.md  # This file
```

**Note:** Single-file approach for simplicity. As project grows, will refactor into modules.

---

## Data Models

### Timer Object
```javascript
{
    id: 1,                    // Unique identifier (increments)
    name: "Coffee",           // User-provided name
    duration: 240,            // Original time in seconds (4 mins)
    timeLeft: 180,            // Current countdown value (3 mins left)
    isRunning: false,         // Is timer actively counting?
    timerID: null,            // setInterval ID for countdown
    alarmInterval: null       // setInterval ID for alarm repeat
}
```

**Why this structure:**
- `id`: Allows finding/deleting specific timers
- `duration`: Needed for reset functionality
- `timeLeft` vs `duration`: Current state vs original setting
- Two interval IDs: Countdown and alarm are independent lifecycles

### Timers Array
```javascript
let timers = [
    { id: 1, name: "Focus Timer", ... },
    { id: 2, name: "Coffee", ... },
    { id: 3, name: "Workout", ... }
];
```

**CRUD Operations:**
- **Create:** `timers.push(createTimer(name, duration))`
- **Read:** `timers.find(t => t.id === targetID)`
- **Update:** Modify object properties directly
- **Delete:** `timers = timers.filter(t => t.id !== targetID)`

---

## Key Functions Reference

### Core Timer Functions

**`createTimer(name, durationMinutes)`**
- Factory function for timer objects
- Ensures consistent structure
- Auto-increments ID

**`formatTime(seconds)`**
- Converts seconds to MM:SS format
- Handles padding (e.g., 3:05 not 3:5)

**`tick()`**
- Called every second by setInterval
- Decrements timeLeft
- Checks if timer finished
- Triggers alarm if complete

**`getCurrentTimer()`** *(temporary, will be removed in Phase 2B)*
- Returns `timers[0]`
- Used during transition from single to multiple timers
- Will be replaced with proper multi-timer handling

### Alarm System

**`startAlarm()`**
- Shows dismiss button
- Changes page title
- Flashes screen
- Starts repeating audio/vibration (every 2 seconds)

**`stopAlarm()`**
- Clears alarm interval
- Hides dismiss button
- Resets page title

**Why separate from timer countdown:**
- Different lifecycles (countdown runs once, alarm repeats)
- Different intervals (1 sec vs 2 sec)
- Independent control (dismiss alarm without affecting timer)

### Validation Functions

**`showError(message)` / `clearError()`**
- Display/hide error messages
- Add/remove visual indicators (red border)

**`setCustomTime()`**
- Validates user input (empty, NaN, bounds)
- Updates timer duration and timeLeft
- Professional input validation pattern

---

## Known Limitations

### iOS PWA Constraints

**Vibration API:**
- ❌ Not supported in iOS Safari
- ✅ Works on Android Chrome
- **Workaround:** Audio alerts as primary notification
- **Note:** Will work in native iOS app (future port)

**Background Execution:**
- ⚠️ Timer stops when screen turns off
- iOS suspends JavaScript execution for battery conservation
- **Workaround:** User must keep screen on
- **Note:** Native iOS app solves this completely

**System Notifications:**
- ⚠️ Limited compared to native apps
- Notification API available but restricted
- **Workaround:** In-app visual + audio alerts

### Browser Autoplay Policies

**Audio may not play if:**
- User hasn't interacted with page yet
- Browser blocks autoplay
- **Handled:** Promise-based error catching

---

## Completed Features

### ✅ Phase 1: Single Timer Foundation
- Custom time input with validation
- Start/Pause/Reset controls
- Countdown display
- Professional error handling

### ✅ Phase 1.5: Alarm System
- Repeating audio alert (every 2 seconds)
- Vibration pattern (Android)
- Visual feedback (screen flash, title change)
- Dismiss button
- Mute toggle

### ✅ Phase 2A: Multiple Timer Data Structure
- Refactored to object-based architecture
- Timer array management
- Add Timer form with validation
- CRUD operations on timers array

---

## Roadmap

### 🔄 Phase 2B: Display Multiple Timers (IN PROGRESS)
- Dynamic UI rendering from timers array
- Each timer shows independently
- Delete button per timer
- Event delegation for dynamic elements

### ⏳ Phase 2C: Independent Timer Controls
- Each timer can start/pause/reset independently
- Multiple timers running simultaneously
- Per-timer alarm handling

### ⏳ Phase 3: Polish & UX
- Circular progress visualization
- Better sound options
- Dark mode
- Animations and transitions
- localStorage persistence (timers survive page reload)

### ⏳ Phase 4: Advanced Features
- Timer presets ("Pomodoro 25 mins", "Quick break 5 mins")
- Streak tracking
- Statistics (focus sessions this week)
- Timer groups/categories

### ⏳ Phase 5: Native iOS Port
- Learn Swift/SwiftUI
- Port timer app to native iOS
- Full background support
- System notifications
- Haptic feedback
- Widgets

---

## Code Standards

### Naming Conventions

**Variables:**
```javascript
let timerID = null;           // camelCase
const MAX_DURATION = 999;     // UPPER_SNAKE for constants
```

**Functions:**
```javascript
function formatTime() {}      // camelCase, verb-based
function getCurrentTimer() {} // get/set for accessors
```

**DOM Elements:**
```javascript
const startButton = document.getElementById('startBtn');
// Descriptive, not abbreviated (startBtn in HTML, startButton in JS)
```

### Error Handling Pattern

**Always validate inputs:**
```javascript
function setCustomTime() {
    clearError();
    
    // Check preconditions
    if (timer.isRunning) {
        showError('...');
        return;
    }
    
    // Validate input
    if (input === '') {
        showError('...');
        return;
    }
    
    // ... more validations (early returns)
    
    // Success path at end
    timer.timeLeft = minutes * 60;
}
```

**Guard clauses (early returns) over nested ifs:**
```javascript
// ✅ Good
if (error) return;
if (error2) return;
// success logic

// ❌ Avoid
if (!error) {
    if (!error2) {
        // success logic buried
    }
}
```

### Comments

**Explain WHY, not WHAT:**
```javascript
// ✅ Good
// Reset to beginning so sound can play multiple times
alertSound.currentTime = 0;

// ❌ Avoid
// Set current time to zero
alertSound.currentTime = 0;
```

**Section headers:**
```javascript
// === TIMER FUNCTIONS ===
// Groups related code
```

---

## Developer Context

### Background
- **Age:** 45
- **Location:** Ridgecrest, CA
- **Current Role:** Stay-at-home dad (2 kids: ages 6 and 1)
- **Previous Career:** Technical recruiter (HR, 10+ years in Silicon Valley)
- **Learning Goal:** Freelance/consulting, eventually build own products
- **Timeline:** Long-term mastery (12+ months), not rushing to first job

### Constraints
- **Time:** 12-14 hours/week focused work
- **Schedule:** Unpredictable (young kids, family needs)
- **Work Pattern:** Scattered daytime sessions (10-30 mins) + evening blocks (1-2 hours)
- **Interruptions:** Frequent, must design for stopping/starting

### Priorities
1. **Family first** - Work fits around kids, not vice versa
2. **Deep learning** - Understanding over features
3. **Professional quality** - Code worthy of portfolio/clients
4. **Real-world use** - Build things actually used

### Learning Style
- Prefers detailed explanations over "just make it work"
- Values understanding trade-offs and alternatives
- Appreciates honesty about limitations
- Willing to do things the "hard but correct" way
- Needs clear checkpoints for interrupted sessions

---

## Working Protocols

### Guardrails Established

**1. File Replacement Protocol**
- 🔧 PARTIAL EDIT: Adding new features, small changes
- 🔄 COMPLETE REPLACEMENT: Refactoring, structural changes
- Always labeled clearly

**2. Verify Before Continuing**
- Save → Refresh → Test → Report ("Working" or "Error: ...")
- No forward progress until current state verified

**3. Git Checkpoints**
- Commit before major changes
- Commit after completing phases
- Deploy frequently (git push)

**4. Expectation Setting**
- What we're changing (high level)
- Why we're changing it
- Type of change (partial/complete)
- How to test

**5. Debugging Protocol**
- User provides: exact error, context, expected behavior
- Assistant provides: diagnosis + complete working file
- No incremental fixes when debugging

**6. Session Checkpoints**
- End each session with: commit, deploy, test on phone
- Summary: "Today you learned X, built Y, next is Z"

### Communication Style

**From Assistant:**
- Detailed explanations of *why*
- Point out failure modes and edge cases
- Challenge assumptions when appropriate
- Explicit about uncertainty
- Structured responses (core idea first, then details)

**From Developer:**
- Ask questions when confused
- Report exact error messages
- Test thoroughly before saying "works"
- Flag if pace feels too fast/slow

---

## Emergency Recovery

### If Code Breaks Completely

**Option 1: Git Rollback**
```bash
git log                    # See commit history
git checkout <commit-id>   # Go back to working version
```

**Option 2: GitHub History**
- Go to GitHub repo
- Click on file → History
- Find last working version
- Copy code

**Option 3: Start from Known Good State**
- Refer to phase checkpoints in this document
- Rebuild from last confirmed working state

### If Handoff to New AI Assistant Needed

**Provide:**
1. This document
2. Link to GitHub repo
3. Current phase status
4. Specific issue or next goal

**Context to emphasize:**
- Learning philosophy (mastery over speed)
- Code quality standards (professional, production-ready)
- Working protocols (guardrails)
- Developer constraints (time, interruptions)

---

## Quick Reference Commands

### Git Workflow
```bash
# Status check
git status

# Commit changes
git add .
git commit -m "Description of changes"

# Deploy
git push

# View history
git log --oneline

# Rollback to previous commit
git checkout <commit-hash>
```

### Testing Checklist
- [ ] Start/Pause works
- [ ] Reset works
- [ ] Custom time input works
- [ ] Add Timer creates new timer
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

### Deployment Status
- **Repo:** https://github.com/[username]/focus-timer
- **Live URL:** https://[username].github.io/focus-timer/
- **Deployment:** Automatic on `git push` (1-2 min delay)

---

## Success Metrics

### Technical Milestones
- [x] Single timer working with all features
- [x] Refactored to object-based architecture
- [x] Timer creation form with validation
- [ ] Multiple timers displayed on screen
- [ ] Independent timer controls
- [ ] Deployed and usable on phone
- [ ] LocalStorage persistence
- [ ] Native iOS port started

### Learning Milestones
- [x] Understands state vs. display
- [x] Can debug scope issues
- [x] Explains lifecycle management
- [x] Validates inputs professionally
- [ ] Creates DOM elements dynamically
- [ ] Handles event delegation
- [ ] Persists data (localStorage)
- [ ] Ports concept to different platform (iOS)

### Portfolio Quality
- [x] Production-ready code structure
- [x] Professional error handling
- [x] Clear naming and documentation
- [ ] Clean, polished UI
- [ ] Comprehensive README
- [ ] Demo video/screenshots
- [ ] Case study write-up

---

**END OF HANDOFF DOCUMENT**

*Last Updated: February 3, 2026*
*If you're reading this to continue the project, start from the "Current Status" section to see where we left off.*