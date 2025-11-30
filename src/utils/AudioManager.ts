export default class AudioManager {
    private static instance: AudioManager;
    private backgroundMusic: HTMLAudioElement | null = null;
    private volume: number = 0.5;

    private constructor() {
        const savedVolume = localStorage.getItem("audio_volume");
        if (savedVolume) {
            this.volume = parseInt(savedVolume) / 100;
        }
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public playBackgroundMusic(musicName: string): void {
        if (this.backgroundMusic) {
            this.stopBackgroundMusic();
        }
        this.backgroundMusic = new Audio(`public/audio/musics/${musicName}.mp3`);
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.volume;
        this.backgroundMusic.play().catch(e => console.warn("Audio play failed:", e));
    }

    public setVolume(volume: number): void {
        this.volume = volume;
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = volume;
        }
    }

    public getVolume(): number {
        return this.volume;
    }

    public stopBackgroundMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
        }
    }

    public enableAudio(): void {
        const audio = new Audio();
        audio.play().catch(() => { });
    }

    public playSoundEffect(effectName: string): void {
        const soundEffect = new Audio(`public/audio/sounds/${effectName}.mp3`);
        soundEffect.volume = this.volume;
        soundEffect.play().catch(e => console.warn("Sound effect play failed:", e));
    }
}
