// audio.js — all sound is synthesised with WebAudio, so the game ships no audio
// files and works fully offline. Created lazily on the first user gesture.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.35;
    return this.muted;
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
    gain.gain.setValueAtTime(vol || 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, vol, lowpass) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass || 1200;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t);
  }

  shoot() { this.tone(720, 0.09, 'square', 0.10, 240); }
  pickup(combo) {
    const base = 520 + Math.min(combo, 8) * 60;
    this.tone(base, 0.12, 'sine', 0.18, base * 1.5);
    this.tone(base * 2, 0.08, 'sine', 0.08);
  }
  explosion() { this.noise(0.35, 0.35, 900); this.tone(120, 0.3, 'sawtooth', 0.18, 40); }
  hit() { this.noise(0.25, 0.3, 700); this.tone(200, 0.25, 'sawtooth', 0.2, 60); }
  powerup() {
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.14, 'triangle', 0.16), i * 70);
    });
  }
  levelClear() {
    [392, 523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.22, 'triangle', 0.18), i * 90);
    });
  }
  win() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.3, 'triangle', 0.18), i * 110);
    });
  }
  lose() {
    [392, 330, 262, 196].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.32, 'sawtooth', 0.12), i * 130);
    });
  }
  jump() { this.tone(180, 0.5, 'sine', 0.2, 1400); this.noise(0.4, 0.12, 2400); }

  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    // A slow, quiet bass arpeggio: A minor colours, one note per beat.
    const notes = [110, 130.81, 98, 146.83, 110, 164.81, 98, 196];
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const f = notes[this.musicStep % notes.length];
      this.musicStep++;
      this.tone(f, 0.5, 'triangle', 0.05);
      this.tone(f * 2, 0.3, 'sine', 0.03);
    }, 340);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
