/**
 * BGM 및 효과음 재생.
 * BGM: Web Audio API 60bpm 베이스 루프.
 * 클릭/포인트: public/audio/ MP3 (선택). Web Audio SFX: 틱, 띵동, 도장, ATM, 리롤, 팡파르.
 */

const BASE = typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/';
const AUDIO = (name: string) => `${BASE}audio/${name}`;

const STORAGE_KEY_BGM = 'joop_bgm_muted';
const STORAGE_KEY_SFX = 'joop_sfx_muted';

function getStoredBgmMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_BGM) === 'true';
  } catch { return false; }
}
function getStoredSfxMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SFX) === 'true';
  } catch { return false; }
}

let bgmMuted = getStoredBgmMuted();
let sfxMuted = getStoredSfxMuted();

export function isBGMMuted(): boolean { return bgmMuted; }
export function isSFXMuted(): boolean { return sfxMuted; }

export function setBGMMuted(muted: boolean): void {
  bgmMuted = muted;
  try { localStorage.setItem(STORAGE_KEY_BGM, String(muted)); } catch { /* ignore */ }
  if (muted) pauseBGM();
}

export function setSFXMuted(muted: boolean): void {
  sfxMuted = muted;
  try { localStorage.setItem(STORAGE_KEY_SFX, String(muted)); } catch { /* ignore */ }
}

// ── Web Audio Context (싱글톤) ─────────────────────────────────────────────

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return audioContext;
}

function resumeContext(): void {
  const ctx = getAudioContext();
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
}

// ── BGM: 파일(bgm.mp3 / bgm.wav) 우선, 없으면 60bpm 베이스 루프 ─────────────────

const BPM = 60;
const BEAT_DURATION = 60 / BPM; // 1초
const LOOP_BEATS = 4;
const LOOP_DURATION = BEAT_DURATION * LOOP_BEATS; // 4초
const BASS_FREQ = 55; // A1 근처
const BGM_GAIN = 0.18;

let bgmGain: GainNode | null = null;
let bgmNextStartTime = 0;
let bgmScheduled = false;
let bgmAudio: HTMLAudioElement | null = null; // 파일 BGM 재생 중일 때

function scheduleBassLoop(): void {
  const ctx = getAudioContext();
  if (!ctx || !bgmGain) return;
  const now = ctx.currentTime;
  if (bgmNextStartTime < now) bgmNextStartTime = now;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(BASS_FREQ, bgmNextStartTime);
  osc.frequency.setValueAtTime(BASS_FREQ * 1.25, bgmNextStartTime + BEAT_DURATION);
  osc.frequency.setValueAtTime(BASS_FREQ, bgmNextStartTime + BEAT_DURATION * 2);
  osc.frequency.setValueAtTime(BASS_FREQ * 1.5, bgmNextStartTime + BEAT_DURATION * 3);
  osc.connect(bgmGain);
  osc.start(bgmNextStartTime);
  osc.stop(bgmNextStartTime + LOOP_DURATION);
  bgmNextStartTime += LOOP_DURATION;
  const timeUntilNextLoop = (bgmNextStartTime - ctx.currentTime) * 1000;
  setTimeout(() => {
    if (bgmScheduled) scheduleBassLoop();
  }, Math.max(0, timeUntilNextLoop));
}

function playBGMFromOscillator(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(BGM_GAIN, ctx.currentTime);
  gain.connect(ctx.destination);
  bgmGain = gain;
  bgmScheduled = true;
  scheduleBassLoop();
}

export function playBGM(): void {
  try {
    if (bgmMuted) return;
    resumeContext();
    if (bgmAudio || bgmGain) return; // 이미 재생 중

    // 1) 파일 BGM 시도: bgm.mp3 → bgm.wav (없으면 오실레이터)
    const tryFile = (filename: string, next: () => void) => {
      const audio = new Audio(AUDIO(filename));
      audio.volume = BGM_GAIN;
      audio.loop = true;
      audio.addEventListener('canplaythrough', () => {
        if (bgmAudio || bgmGain) return;
        audio.play().then(() => { bgmAudio = audio; }).catch(next);
      }, { once: true });
      audio.addEventListener('error', next, { once: true });
      audio.load();
    };

    tryFile('bgm.mp3', () => {
      tryFile('bgm.wav', () => playBGMFromOscillator());
    });
  } catch {
    playBGMFromOscillator();
  }
}

export function pauseBGM(): void {
  try {
    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
      bgmAudio = null;
    }
    bgmScheduled = false;
    bgmGain = null;
    bgmNextStartTime = 0;
  } catch {
    // ignore
  }
}

export function setBGMVolume(volume: number): void {
  try {
    const v = Math.max(0, Math.min(1, volume));
    if (bgmAudio) {
      bgmAudio.volume = v * BGM_GAIN;
    }
    if (bgmGain) {
      const ctx = getAudioContext();
      if (ctx) bgmGain.gain.setValueAtTime(v * BGM_GAIN, ctx.currentTime);
    }
  } catch {
    // ignore
  }
}

// ── 타이머 틱 (1초마다, 마지막 3초는 긴장 버전) ─────────────────────────────

export function playTick(isUrgent: boolean): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  resumeContext();
  const freq = isUrgent ? 1200 : 800;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

// ── 낙찰 띵동 (C5–E5 밝은 두 음) ──────────────────────────────────────────

const C5 = 523.25;
const E5 = 659.25;

export function playDingDong(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  resumeContext();
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.35, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  g.connect(ctx.destination);

  const o1 = ctx.createOscillator();
  o1.type = 'sine';
  o1.frequency.setValueAtTime(C5, t);
  o1.connect(g);
  o1.start(t);
  o1.stop(t + 0.2);

  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.setValueAtTime(E5, t + 0.15);
  o2.connect(g);
  o2.start(t + 0.15);
  o2.stop(t + 0.45);
}

// ── 입찰 완료 도장 (쾅) ─────────────────────────────────────────────────────

export function playStamp(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  resumeContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

// ── 노이즈 버퍼 (효과음용) ─────────────────────────────────────────────────

function createNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * durationSeconds;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1);
  return buffer;
}

// ── 돈 더 쓸 때 ATM (드르륵 + 툭) ───────────────────────────────────────────

export function playATM(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  resumeContext();
  const t = ctx.currentTime;
  const buf = createNoiseBuffer(ctx, 0.12);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, t);
  filter.Q.setValueAtTime(2, t);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.12);
  // 툭
  setTimeout(() => {
    if (!ctx) return;
    const click = ctx.createOscillator();
    const g = ctx.createGain();
    click.type = 'sine';
    click.frequency.setValueAtTime(600, ctx.currentTime);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    click.connect(g);
    g.connect(ctx.destination);
    click.start(ctx.currentTime);
    click.stop(ctx.currentTime + 0.04);
  }, 80);
}

// ── 리롤 신문/전단지 넘기는 소리 ───────────────────────────────────────────

export function playPaperRustle(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  resumeContext();
  const t = ctx.currentTime;
  const buf = createNoiseBuffer(ctx, 0.2);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, t);
  filter.Q.setValueAtTime(1, t);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + 0.2);
}

// ── 최종 우승 팡파르 (아파트 인터폰 스타일) ───────────────────────────────────

const G5 = 783.99;

export function playFanfare(): void {
  if (sfxMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  resumeContext();
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.4, t + 0.03);
  g.gain.setValueAtTime(0.4, t + 0.5);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1);
  g.connect(ctx.destination);

  const notes = [C5, E5, G5];
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t + i * 0.18);
    o.connect(g);
    o.start(t + i * 0.18);
    o.stop(t + 1.2);
  });
}

// ── 기존 MP3 기반 (클릭/포인트) ─────────────────────────────────────────────

function playOneShot(filename: string, volume = 0.7): void {
  try {
    const a = new Audio(AUDIO(filename));
    a.volume = volume;
    a.play().catch(() => {});
  } catch {
    // ignore
  }
}

export function playClick(): void {
  if (sfxMuted) return;
  playOneShot('click.mp3');
}

const pointDebounceMs = 500;
let lastPointTime = 0;

export function playPoint(): void {
  if (sfxMuted) return;
  const now = Date.now();
  if (now - lastPointTime < pointDebounceMs) return;
  lastPointTime = now;
  playOneShot('point.mp3');
}
