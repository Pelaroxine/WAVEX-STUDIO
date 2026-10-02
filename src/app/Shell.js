/**
 * Shell.js
 * Application Shell controller linking header transport controls and view rendering.
 */

import { audioEngine } from '../audio/AudioEngine.js';

class Shell {
    constructor() {
        this.btnPlay = document.getElementById('btnPlay');
        this.btnStop = document.getElementById('btnStop');
        this.playIcon = document.getElementById('playIcon');
        this.bpmValue = document.getElementById('bpmValue');
        this.workspaceContainer = document.getElementById('workspaceContainer');
        this.tabs = document.querySelectorAll('.tab-btn');

        this.initEventListeners();
    }

    initEventListeners() {
        // Transport Play / Pause Toggle
        this.btnPlay.addEventListener('click', async () => {
            await audioEngine.init();

            audioEngine.isPlaying = !audioEngine.isPlaying;
            if (audioEngine.isPlaying) {
                this.btnPlay.classList.add('playing');
                this.playIcon.textContent = '⏸';
            } else {
                this.btnPlay.classList.remove('playing');
                this.playIcon.textContent = '▶';
            }
        });

        // Transport Stop
        this.btnStop.addEventListener('click', () => {
            audioEngine.isPlaying = false;
            this.btnPlay.classList.remove('playing');
            this.playIcon.textContent = '▶';
        });

        // Tab View Router
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderView(e.target.dataset.view);
            });
        });

        // Initial view load
        this.renderView('mixer');
    }

    renderView(viewName) {
        if (viewName === 'mixer') {
            this.workspaceContainer.innerHTML = `
                <div style="padding: 20px; color: var(--text-muted);">
                    <h3 style="color: var(--accent-cyan); margin-bottom: 10px;">MIXER VIEW</h3>
                    <p>Audio Engine core initialized and ready. Proceeding to Track Node & Mixer component integration...</p>
                </div>
            `;
        } else if (viewName === 'playlist') {
            this.workspaceContainer.innerHTML = `<div style="padding: 20px; color: var(--text-muted);"><h3>PLAYLIST VIEW</h3><p>Timeline & arrangement grid.</p></div>`;
        } else if (viewName === 'pianoroll') {
            this.workspaceContainer.innerHTML = `<div style="padding: 20px; color: var(--text-muted);"><h3>PIANO ROLL VIEW</h3><p>MIDI grid editor.</p></div>`;
        }
    }
}

// Initialize Application Shell
document.addEventListener('DOMContentLoaded', () => {
    window.appShell = new Shell();
});
