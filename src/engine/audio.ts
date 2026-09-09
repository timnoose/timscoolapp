/**
 * Retro audio: synthesized SFX and a tiny chiptune sequencer (no audio files needed).
 * Audio only starts after a user gesture (call `unlock()` from a click/keypress).
 */
type NoteEvent = [note: string | null, beats: number];

const NOTE_INDEX: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function freq(note: string): number {
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) return 440;
  const semis = NOTE_INDEX[m[1]] + (parseInt(m[2], 10) - 4) * 12 - 9;
  return 440 * Math.pow(2, semis / 12);
}
function parse(seq: string): NoteEvent[] {
  return seq.trim().split(/\s+/).map((tok) => {
    const [n, b] = tok.split(':');
    return [n === '-' ? null : n, b ? parseFloat(b) : 1];
  });
}

interface Song { bpm: number; lead: NoteEvent[]; bass: NoteEvent[]; leadWave: OscillatorType; bassWave: OscillatorType; leadGain: number; perc?: boolean }

const SONGS: Record<string, Song> = {
  title: { bpm: 112, leadWave: 'square', bassWave: 'triangle', leadGain: 0.05,
    lead: parse('E4:1 G4:1 A4:1 B4:2 A4:1 G4:1 E4:1 D4:2 E4:1 G4:1 A4:2 B4:2 D5:2 B4:1 A4:1 G4:2 E4:2 D4:2 E4:4'),
    bass: parse('E2:2 E2:2 C2:2 C2:2 D2:2 D2:2 E2:2 E2:2 A2:2 A2:2 G2:2 G2:2 D2:2 D2:2 E2:2 E2:2') },
  town: { bpm: 126, leadWave: 'square', bassWave: 'triangle', leadGain: 0.045, perc: true,
    lead: parse('G4:1 A4:1 B4:1 D5:1 B4:1 A4:1 G4:2 E4:1 G4:1 A4:2 D4:1 E4:1 G4:2 G4:1 A4:1 B4:1 D5:1 E5:2 D5:1 B4:1 A4:2 G4:1 A4:1 G4:4'),
    bass: parse('G2:1 G2:1 D3:1 G2:1 C3:1 C3:1 G2:1 C3:1 D3:1 D3:1 A2:1 D3:1 G2:1 G2:1 D3:1 G2:1 G2:1 G2:1 D3:1 G2:1 E2:1 E2:1 B2:1 E2:1 C3:1 C3:1 D3:1 D3:1 G2:2 G2:2') },
  church: { bpm: 96, leadWave: 'triangle', bassWave: 'sine', leadGain: 0.05,
    lead: parse('C5:2 E5:2 G5:3 E5:1 F5:2 E5:2 D5:4 E5:2 G5:2 A5:3 G5:1 F5:2 D5:2 C5:4'),
    bass: parse('C3:4 C3:4 F2:4 G2:4 C3:4 F2:4 G2:4 C3:4') },
  coffee: { bpm: 108, leadWave: 'triangle', bassWave: 'triangle', leadGain: 0.05, perc: true,
    lead: parse('A4:1 C5:1 E5:1 D5:1 C5:2 A4:2 G4:1 A4:1 C5:2 B4:1 A4:1 G4:2 A4:1 C5:1 E5:1 G5:1 E5:2 D5:2 C5:1 D5:1 E5:2 A4:4'),
    bass: parse('A2:2 E3:2 A2:2 E3:2 F2:2 C3:2 G2:2 D3:2 A2:2 E3:2 A2:2 E3:2 F2:2 C3:2 G2:2 A2:2') },
  city: { bpm: 100, leadWave: 'square', bassWave: 'triangle', leadGain: 0.035,
    lead: parse('D4:2 F4:2 A4:2 F4:2 D4:2 E4:2 F4:4 C4:2 E4:2 G4:2 E4:2 C4:2 D4:2 E4:4'),
    bass: parse('D2:4 D2:4 A2:4 A2:4 C2:4 C2:4 G2:4 G2:4') },
  encounter: { bpm: 150, leadWave: 'square', bassWave: 'sawtooth', leadGain: 0.045, perc: true,
    lead: parse('E5:0.5 E5:0.5 -:0.5 E5:0.5 C5:0.5 E5:1 G5:2 G4:2 C5:1 G4:1 E4:1 A4:1 B4:1 A#4:0.5 A4:0.5 G4:1 E5:1 G5:1 A5:2 F5:0.5 G5:0.5 E5:1 C5:0.5 D5:0.5 B4:2'),
    bass: parse('E2:0.5 E2:0.5 E2:1 E2:0.5 E2:0.5 E2:1 C2:1 C2:1 G2:1 G2:1 A2:1 A2:1 B2:1 B2:1 C2:1 C2:1 F2:1 F2:1 G2:1 G2:1 E2:1 E2:1 E2:1 E2:1') },
  ending: { bpm: 104, leadWave: 'triangle', bassWave: 'sine', leadGain: 0.06,
    lead: parse('G4:1 B4:1 D5:2 G5:2 F#5:1 E5:1 D5:2 E5:1 D5:1 B4:2 A4:2 G4:1 A4:1 B4:2 D5:2 E5:1 D5:1 B4:2 A4:1 B4:1 G4:4'),
    bass: parse('G2:4 D3:4 E2:4 C3:4 G2:4 D3:4 C3:4 G2:4') },
  worship: { bpm: 84, leadWave: 'triangle', bassWave: 'sine', leadGain: 0.06, perc: true,
    lead: parse('G4:2 B4:1 D5:1 D5:2 C5:1 B4:1 A4:2 B4:1 C5:1 B4:4 G4:2 B4:1 D5:1 E5:2 D5:1 C5:1 B4:2 A4:1 G4:1 A4:4 D5:2 D5:1 E5:1 D5:2 B4:1 G4:1 A4:2 B4:1 A4:1 G4:6 -:2'),
    bass: parse('G2:4 G2:4 C3:4 D3:4 G2:4 E2:4 C3:4 D3:4 G2:4 D3:4 C3:4 D3:4 G2:4 G2:4 G2:4 G2:4') },
  wrestling: { bpm: 140, leadWave: 'sawtooth', bassWave: 'square', leadGain: 0.04, perc: true,
    lead: parse('A3:1 A3:1 C4:1 A3:1 D4:1 C4:1 A3:2 A3:1 A3:1 C4:1 D4:1 E4:2 D4:1 C4:1 A3:1 A3:1 C4:1 A3:1 G3:1 A3:1 C4:2 E4:1 D4:1 C4:1 D4:1 A3:4'),
    bass: parse('A2:1 A2:1 A2:1 A2:1 A2:1 A2:1 A2:1 A2:1 A2:1 A2:1 A2:1 A2:1 E2:1 E2:1 E2:1 E2:1 A2:1 A2:1 A2:1 A2:1 G2:1 G2:1 G2:1 G2:1 F2:1 F2:1 E2:1 E2:1 A2:2 A2:2') },
};

export class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  musicGain: GainNode | null = null;
  muted = false;
  private current: string | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private leadPos = 0;
  private bassPos = 0;
  private percPos = 0;
  private unlocked = false;

  unlock(): void {
    if (this.unlocked) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.9;
      this.musicGain.connect(this.master);
      this.unlocked = true;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (this.current) { const c = this.current; this.current = null; this.play(c); }
      if (this.rainWanted) this.rain(true);
    } catch { /* audio unavailable */ }
  }

  setMute(m: boolean): void {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 1;
  }

  /** Dialogue typing blip at a per-speaker pitch (Hz). */
  blip(freq = 720): void {
    if (!this.ctx || !this.master || this.muted) return;
    const c = this.ctx; const t = c.currentTime;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = freq < 350 ? 'sawtooth' : 'square';
    o.frequency.setValueAtTime(freq * 1.25, t);
    o.frequency.exponentialRampToValueAtTime(freq, t + 0.03);
    g.gain.setValueAtTime(0.03, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + 0.05);
  }

  private rainSrc: AudioBufferSourceNode | null = null;
  private rainWanted = false;
  /** Soft looping rain (filtered noise) for rainy days outdoors. */
  rain(on: boolean): void {
    this.rainWanted = on;
    if (!this.ctx || !this.master) return;
    if (on && !this.rainSrc) {
      const c = this.ctx;
      const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < d.length; i++) { last = last * 0.92 + (Math.random() * 2 - 1) * 0.08; d[i] = last * 4; }
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 1400;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 1.2);
      src.connect(filt).connect(g).connect(this.master);
      src.start();
      this.rainSrc = src;
    } else if (!on && this.rainSrc) {
      try { this.rainSrc.stop(); } catch { /* already stopped */ }
      this.rainSrc = null;
    }
  }

  // ---------------- SFX ----------------
  sfx(name: string): void {
    if (!this.ctx || !this.master || this.muted) return;
    const c = this.ctx;
    const t = c.currentTime;
    const beep = (f0: number, f1: number, dur: number, type: OscillatorType = 'square', gain = 0.08, delay = 0) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t + delay);
      o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + delay + dur);
      g.gain.setValueAtTime(gain, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.connect(g).connect(this.master!);
      o.start(t + delay);
      o.stop(t + delay + dur + 0.02);
    };
    const noise = (dur: number, gain = 0.06, delay = 0) => {
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = c.createBufferSource();
      s.buffer = buf;
      const g = c.createGain();
      g.gain.value = gain;
      s.connect(g).connect(this.master!);
      s.start(t + delay);
    };
    switch (name) {
      case 'blip': beep(900, 700, 0.03, 'square', 0.03); break;
      case 'confirm': beep(660, 990, 0.08, 'square', 0.06); break;
      case 'cancel': beep(500, 300, 0.1, 'square', 0.05); break;
      case 'move': beep(700, 700, 0.03, 'square', 0.03); break;
      case 'bump': beep(160, 90, 0.08, 'triangle', 0.08); break;
      case 'door': beep(300, 500, 0.08, 'square', 0.05); beep(500, 800, 0.1, 'square', 0.05, 0.08); break;
      case 'coin': beep(1200, 1200, 0.06, 'square', 0.06); beep(1600, 1600, 0.12, 'square', 0.06, 0.07); break;
      case 'lose': beep(400, 200, 0.25, 'sawtooth', 0.06); break;
      case 'quest': beep(523, 523, 0.1, 'square', 0.06); beep(659, 659, 0.1, 'square', 0.06, 0.1); beep(784, 784, 0.1, 'square', 0.06, 0.2); beep(1047, 1047, 0.25, 'square', 0.07, 0.3); break;
      case 'hit': noise(0.12, 0.08); beep(200, 100, 0.12, 'square', 0.06); break;
      case 'super': beep(400, 1200, 0.15, 'square', 0.07); noise(0.15, 0.05); beep(800, 1600, 0.2, 'square', 0.06, 0.12); break;
      case 'weak': beep(300, 250, 0.15, 'triangle', 0.05); break;
      case 'heal': beep(600, 900, 0.12, 'sine', 0.07); beep(900, 1200, 0.15, 'sine', 0.07, 0.1); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => beep(f, f, 0.15, 'square', 0.06, i * 0.12)); beep(1319, 1319, 0.4, 'square', 0.07, 0.5); break;
      case 'fail': [400, 350, 300, 200].forEach((f, i) => beep(f, f * 0.9, 0.18, 'sawtooth', 0.05, i * 0.16)); break;
      case 'alert': beep(880, 880, 0.08, 'square', 0.06); beep(880, 880, 0.08, 'square', 0.06, 0.15); break;
      case 'bell': beep(1568, 1500, 0.6, 'sine', 0.08); beep(2093, 2000, 0.6, 'sine', 0.04, 0.02); break;
      case 'save': beep(700, 1000, 0.08, 'sine', 0.06); beep(1000, 1400, 0.1, 'sine', 0.06, 0.09); break;
      case 'thud': noise(0.2, 0.1); beep(120, 50, 0.2, 'triangle', 0.1); break;
      case 'step': noise(0.025, 0.018); break;
      case 'stepIn': beep(170, 120, 0.03, 'triangle', 0.02); break;
      case 'honk': beep(392, 392, 0.12, 'sawtooth', 0.05); beep(494, 494, 0.12, 'sawtooth', 0.05); break;
      case 'chirp': beep(2400, 3000, 0.05, 'sine', 0.025); beep(2800, 2300, 0.06, 'sine', 0.02, 0.09); break;
      default: beep(600, 600, 0.05, 'square', 0.04);
    }
  }

  // ---------------- Music ----------------
  play(name: string): void {
    if (this.current === name) return;
    this.stop();
    this.current = name;
    if (!this.ctx || !this.musicGain) return; // starts once unlocked
    const song = SONGS[name];
    if (!song) return;
    this.leadPos = 0; this.bassPos = 0; this.percPos = 0;
    this.nextTime = this.ctx.currentTime + 0.05;
    const beat = 60 / song.bpm;
    let leadT = this.nextTime;
    let bassT = this.nextTime;
    let percT = this.nextTime;
    const schedule = () => {
      if (!this.ctx || this.current !== name) return;
      const horizon = this.ctx.currentTime + 0.6;
      while (leadT < horizon) {
        const [n, b] = song.lead[this.leadPos % song.lead.length];
        if (n) this.tone(n, leadT, b * beat * 0.9, song.leadWave, song.leadGain);
        leadT += b * beat;
        this.leadPos++;
      }
      while (bassT < horizon) {
        const [n, b] = song.bass[this.bassPos % song.bass.length];
        if (n) this.tone(n, bassT, b * beat * 0.85, song.bassWave, 0.05);
        bassT += b * beat;
        this.bassPos++;
      }
      if (song.perc) {
        while (percT < horizon) {
          const step = this.percPos % 4;
          if (step === 0) this.kick(percT);
          if (step === 2) this.hat(percT);
          percT += beat;
          this.percPos++;
        }
      }
    };
    schedule();
    this.timer = window.setInterval(schedule, 200);
  }

  stop(): void {
    if (this.timer !== null) { clearInterval(this.timer); this.timer = null; }
    this.current = null;
  }

  get nowPlaying(): string | null { return this.current; }

  private tone(note: string, at: number, dur: number, type: OscillatorType, gain: number): void {
    if (!this.ctx || !this.musicGain) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq(note);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(gain, at + 0.01);
    g.gain.setValueAtTime(gain, at + Math.max(0.02, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(this.musicGain);
    o.start(at);
    o.stop(at + dur + 0.01);
  }
  private kick(at: number): void {
    if (!this.ctx || !this.musicGain) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, at);
    o.frequency.exponentialRampToValueAtTime(40, at + 0.12);
    g.gain.setValueAtTime(0.12, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.14);
    o.connect(g).connect(this.musicGain);
    o.start(at); o.stop(at + 0.16);
  }
  private hat(at: number): void {
    if (!this.ctx || !this.musicGain) return;
    const c = this.ctx;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.04), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = c.createBufferSource();
    s.buffer = buf;
    const g = c.createGain();
    g.gain.value = 0.025;
    s.connect(g).connect(this.musicGain);
    s.start(at);
  }
}

export const audio = new AudioEngine();
