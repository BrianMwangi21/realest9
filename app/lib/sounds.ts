/**
 * Sound Effects Manager
 * Uses Web Audio API for game sounds
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be suspended
    }
  }

  playCorrect() {
    // Ascending chime
    this.playTone(523, 0.1, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 100); // E5
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200); // G5
  }

  playWrong() {
    // Descending buzz
    this.playTone(200, 0.3, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(150, 0.4, 'sawtooth', 0.15), 150);
  }

  playTick() {
    // Subtle tick for timer
    this.playTone(800, 0.05, 'sine', 0.05);
  }

  playGameStart() {
    // Epic start sound
    this.playTone(330, 0.2, 'square', 0.15);
    setTimeout(() => this.playTone(440, 0.2, 'square', 0.15), 200);
    setTimeout(() => this.playTone(550, 0.3, 'square', 0.2), 400);
    setTimeout(() => this.playTone(880, 0.5, 'sine', 0.25), 700);
  }

  playGameOver() {
    // Victory fanfare
    this.playTone(523, 0.2, 'sine', 0.2);
    setTimeout(() => this.playTone(659, 0.2, 'sine', 0.2), 200);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.2), 400);
    setTimeout(() => this.playTone(1047, 0.5, 'sine', 0.3), 600);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }
}

export const soundManager = new SoundManager();
