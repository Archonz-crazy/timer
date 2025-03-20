const { ipcRenderer } = require('electron');

interface TimerState {
    time: number;
    isRunning: boolean;
}

class Timer {
    private time: number = 0;
    private isRunning: boolean = false;
    private interval: ReturnType<typeof setInterval> | null = null;
    private timeElement: HTMLElement;
    private startStopButton: HTMLElement;
    private resetButton: HTMLElement;
    private togglePinButton: HTMLElement;

    constructor() {
        this.timeElement = document.getElementById('time')!;
        this.startStopButton = document.getElementById('startStop')!;
        this.resetButton = document.getElementById('reset')!;
        this.togglePinButton = document.getElementById('togglePin')!;
        
        this.setupEventListeners();
        this.loadState();
    }

    private setupEventListeners() {
        this.startStopButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.togglePinButton.addEventListener('click', () => {
            ipcRenderer.send('toggle-always-on-top');
        });
    }

    private async loadState() {
        try {
            const savedState = await ipcRenderer.invoke('get-timer-state') as TimerState | undefined;
            if (savedState) {
                this.time = savedState.time;
                this.isRunning = savedState.isRunning;
                this.updateDisplay();
                if (this.isRunning) {
                    this.startTimer();
                }
            }
        } catch (error) {
            console.error('Error loading timer state:', error);
        }
    }

    private saveState() {
        const state: TimerState = {
            time: this.time,
            isRunning: this.isRunning
        };
        ipcRenderer.send('save-timer-state', state);
    }

    private toggleTimer() {
        if (this.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    }

    private startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startStopButton.textContent = 'Stop';
            this.interval = setInterval(() => {
                this.time++;
                this.updateDisplay();
                this.saveState();
            }, 1000);
        }
    }

    private stopTimer() {
        this.isRunning = false;
        this.startStopButton.textContent = 'Start';
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.saveState();
    }

    private resetTimer() {
        this.stopTimer();
        this.time = 0;
        this.updateDisplay();
        this.saveState();
    }

    private updateDisplay() {
        const hours = Math.floor(this.time / 3600);
        const minutes = Math.floor((this.time % 3600) / 60);
        const seconds = this.time % 60;
        
        this.timeElement.textContent = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
}

// Initialize the timer when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Timer();
}); 