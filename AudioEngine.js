/**
 * AudioEngine.js
 * Core Web Audio API pipeline and master routing engine for WAVEX-STUDIO.
 */

export class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.masterEqLow = null;
        this.masterEqMid = null;
        this.masterEqHi = null;
        this.isPlaying = false;
        this.bpm = 120;
        this.sampleRate = 44100;
        this.listeners = new Set();
    }

    /**
     * Initializes or resumes the Web Audio Context.
     * Must be triggered by a user gesture (e.g. Play button click).
     */
    async init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.sampleRate = this.ctx.sampleRate;

            // Master Chain Nodes
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.9;

            this.masterEqLow = this.ctx.createBiquadFilter();
            this.masterEqLow.type = 'lowshelf';
            this.masterEqLow.frequency.value = 320;

            this.masterEqMid = this.ctx.createBiquadFilter();
            this.masterEqMid.type = 'peaking';
            this.masterEqMid.frequency.value = 1000;
            this.masterEqMid.Q.value = 0.5;

            this.masterEqHi = this.ctx.createBiquadFilter();
            this.masterEqHi.type = 'highshelf';
            this.masterEqHi.frequency.value = 3200;

            // Connect Master Chain Pipeline: Low -> Mid -> Hi -> Master Gain -> Destination
            this.masterEqLow.connect(this.masterEqMid);
            this.masterEqMid.connect(this.masterEqHi);
            this.masterEqHi.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);
        }

        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        return this.ctx;
    }

    /**
     * Set Master Volume Level (0.0 to 1.2)
     */
    setMasterVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(value, this.ctx.currentTime);
        }
    }

    /**
     * Set Master Equalizer Band Gains in dB (-12 to +12)
     */
    setMasterEQ(band, dbValue) {
        if (!this.ctx) return;
        const time = this.ctx.currentTime;
        if (band === 'low' && this.masterEqLow) {
            this.masterEqLow.gain.setValueAtTime(dbValue, time);
        } else if (band === 'mid' && this.masterEqMid) {
            this.masterEqMid.gain.setValueAtTime(dbValue, time);
        } else if (band === 'hi' && this.masterEqHi) {
            this.masterEqHi.gain.setValueAtTime(dbValue, time);
        }
    }

    /**
     * Set Session Tempo (BPM)
     */
    setBPM(bpm) {
        this.bpm = Math.max(20, Math.min(300, bpm));
        this._notifyListeners('bpmChange', this.bpm);
    }

    /**
     * Returns the master EQ input node so individual channel tracks can connect to it.
     */
    getMasterInputNode() {
        return this.masterEqLow;
    }

    /**
     * Get Current Audio Context Time in seconds
     */
    getCurrentTime() {
        return this.ctx ? this.ctx.currentTime : 0;
    }

    // Event Listener system for state updates
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    _notifyListeners(event, data) {
        this.listeners.forEach(cb => cb(event, data));
    }
}

// Singleton export
export const audioEngine = new AudioEngine();
