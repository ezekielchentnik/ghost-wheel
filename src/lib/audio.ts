// Game audio on the native Web Audio API: looping background music with a
// low-pass "muffle" while paused, track switching, mute, and one-shot FX.

export const TRACKS = [
    { name: 'More Puzzle Madness', url: '/more-puzzle-madness.ogg' },
    { name: 'Pixel City Cruising', url: '/pixel-city-cruising.ogg' },
    { name: 'Future Grunge', url: '/future-grunge.ogg' },
]

const FX = {
    crash: '/bonk.mp3',
    powerup: '/power-up-21.mp3',
}

let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let lowPass: BiquadFilterNode | null = null;
let musicSource: AudioBufferSourceNode | null = null;
let startingMusic: Promise<void> | null = null;

let musicMuted = true; // music starts off; players opt in via a mute button
let distorted = false;
let trackIndex = 0;

const buffers = new Map<string, Promise<AudioBuffer>>();

function ensureContext(): AudioContext {
    if (!ctx) {
        ctx = new AudioContext();
        musicGain = ctx.createGain();
        lowPass = ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.value = 400;
        lowPass.connect(ctx.destination);
    }
    // Autoplay policy: the context may start suspended until a user gesture.
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function loadBuffer(url: string): Promise<AudioBuffer> {
    let p = buffers.get(url);
    if (!p) {
        p = fetch(url)
            .then((r) => r.arrayBuffer())
            .then((b) => ensureContext().decodeAudioData(b));
        buffers.set(url, p);
    }
    return p;
}

function applyRouting() {
    if (!ctx || !musicGain || !lowPass) return;
    musicGain.disconnect();
    musicGain.connect(distorted ? lowPass : ctx.destination);
}

async function startMusic() {
    const c = ensureContext();
    const buffer = await loadBuffer(TRACKS[trackIndex].url);
    if (musicSource) {
        try { musicSource.stop(); } catch {}
        musicSource.disconnect();
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(musicGain!);
    musicGain!.gain.value = musicMuted ? 0 : 1;
    applyRouting();
    src.start();
    musicSource = src;
}

export function currentTrackName(): string {
    return TRACKS[trackIndex].name;
}

export function isMusicMuted(): boolean {
    return musicMuted;
}

// Mute can be toggled from more than one place (intro modal, dashboard);
// listeners keep every mute button's icon in sync.
const muteListeners = new Set<(muted: boolean) => void>();

export function onMuteChange(cb: (muted: boolean) => void): () => void {
    muteListeners.add(cb);
    return () => muteListeners.delete(cb);
}

export function toggleMusicMuted(): boolean {
    musicMuted = !musicMuted;
    if (musicGain) {
        musicGain.gain.value = musicMuted ? 0 : 1;
    }
    muteListeners.forEach((cb) => cb(musicMuted));
    return musicMuted;
}

/** Switch to the next background track (keeps mute/muffle state). */
export async function toggleMusicTrack(): Promise<string> {
    trackIndex = (trackIndex + 1) % TRACKS.length;
    if (musicSource) {
        await startMusic();
    }
    return currentTrackName();
}

export async function playBackground(distort: boolean) {
    distorted = distort;
    if (!musicSource) {
        // Guard against concurrent first calls creating two looping sources.
        if (!startingMusic) {
            startingMusic = startMusic().finally(() => {
                startingMusic = null;
            });
        }
        await startingMusic;
    } else {
        applyRouting();
    }
}

export async function playFX(name: keyof typeof FX = 'crash') {
    const c = ensureContext();
    const buffer = await loadBuffer(FX[name]);
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(c.destination);
    src.start();
}
