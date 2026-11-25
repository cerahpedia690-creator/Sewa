// Procedural Web Audio API retro pixel-art sound synthesizer (no external audio assets required)

class SoundFX {
  private ctx: AudioContext | null = null;
  public muted = false;
  public volume = 0.45;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    gainScale = 0.25,
    delay = 0,
    slideTo?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
    }

    const peak = Math.max(0.001, this.volume * gainScale);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  click() {
    this.playTone(580, 0.055, 'triangle', 0.18, 0, 720);
  }

  coin() {
    this.playTone(987.77, 0.08, 'square', 0.16, 0);
    this.playTone(1318.51, 0.16, 'square', 0.18, 0.07);
  }

  build() {
    this.playTone(180, 0.09, 'sawtooth', 0.22, 0, 110);
    this.playTone(260, 0.11, 'triangle', 0.22, 0.08, 340);
  }

  repair() {
    this.playTone(420, 0.06, 'triangle', 0.2, 0);
    this.playTone(640, 0.1, 'triangle', 0.2, 0.06);
  }

  alert() {
    this.playTone(440, 0.12, 'triangle', 0.22, 0);
    this.playTone(554.37, 0.12, 'triangle', 0.22, 0.11);
    this.playTone(659.25, 0.22, 'triangle', 0.25, 0.22);
  }

  levelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.14, 'square', 0.18, idx * 0.085);
    });
  }

  error() {
    this.playTone(220, 0.12, 'sawtooth', 0.18, 0, 140);
  }
}

export const soundFX = new SoundFX();
