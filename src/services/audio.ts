import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

class SoundEffectsService {
  private audioCtx: any = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      } catch (e) {
        console.warn('AudioContext not available:', e);
      }
    }
  }

  private ensureContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  // Trigger Haptic
  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
    if (!this.hapticsEnabled) return;
    try {
      if (Platform.OS !== 'web') {
        if (type === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else if (type === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else if (type === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        else if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (type === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        else if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        // Web vibration API
        if (type === 'light') navigator.vibrate(20);
        else if (type === 'medium') navigator.vibrate(40);
        else if (type === 'heavy') navigator.vibrate([60, 30, 80]);
        else if (type === 'error') navigator.vibrate([100, 50, 150]);
      }
    } catch {
      // ignore
    }
  }

  // Synthesized Arcade Sound: Button Tap
  public playTap() {
    this.triggerHaptic('light');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.07);
    } catch {}
  }

  // Move Selected / Locked in
  public playSelectMove() {
    this.triggerHaptic('medium');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.16);
    } catch {}
  }

  // Countdown Tick (3, 2, 1)
  public playCountdownTick(count: number) {
    this.triggerHaptic('medium');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      const freq = count === 1 ? 880 : 587.33;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = count === 1 ? 'square' : 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.22, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    } catch {}
  }

  // Dramatic Clash / Reveal
  public playClash() {
    this.triggerHaptic('heavy');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      // Noise burst + low boom
      const bufferSize = this.audioCtx.sampleRate * 0.2;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);
      noise.start();

      // Low impact bass hit
      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.3);
      oscGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.35);
      osc.connect(oscGain);
      oscGain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.36);
    } catch {}
  }

  // Round Win Strike / Dealt Damage
  public playRoundWin() {
    this.triggerHaptic('success');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.06);
        osc.stop(this.audioCtx.currentTime + idx * 0.06 + 0.26);
      });
    } catch {}
  }

  // Round Loss / Taken Damage
  public playRoundLoss() {
    this.triggerHaptic('error');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      [349.23, 311.13, 261.63, 196.0].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.3);
      });
    } catch {}
  }

  // Critical HP Siren Ping
  public playCriticalAlert() {
    this.triggerHaptic('warning');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.26);
    } catch {}
  }

  // Epic Victory Fanfare
  public playVictoryFanfare() {
    this.triggerHaptic('success');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      const chords = [
        { f: [523.25, 659.25], t: 0.0, d: 0.15 },
        { f: [523.25, 659.25], t: 0.18, d: 0.15 },
        { f: [523.25, 659.25], t: 0.36, d: 0.15 },
        { f: [523.25, 659.25, 783.99, 1046.5], t: 0.54, d: 0.8 },
      ];
      chords.forEach((chord) => {
        chord.f.forEach((freq) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + chord.t);
          gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime + chord.t);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + chord.t + chord.d);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(this.audioCtx.currentTime + chord.t);
          osc.stop(this.audioCtx.currentTime + chord.t + chord.d + 0.02);
        });
      });
    } catch {}
  }

  // Defeat Rumble
  public playDefeat() {
    this.triggerHaptic('error');
    if (!this.soundEnabled || !this.audioCtx) return;
    this.ensureContext();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.audioCtx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.28, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.86);
    } catch {}
  }
}

export const SoundFX = new SoundEffectsService();
