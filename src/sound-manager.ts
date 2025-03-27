import storageManager from './storage-manager';

const soundManager = {
  sounds: new Map<string, HTMLAudioElement>(),
  isMuted: storageManager.isMuted,

  loadSound(name: string, url: string) {
    const audio = new Audio(url);
    audio.load();
    audio.muted = this.isMuted;
    this.sounds.set(name, audio);
  },

  playSound(name: string, volume: number = 1.0, loop: boolean = false) {
    if (this.isMuted) {
      return;
    }

    const audio = this.sounds.get(name);
    if (audio) {
      this.stopSound(name);
      audio.volume = volume;
      audio.loop = loop;
      audio.play().catch(console.error);
    }
  },

  stopSound(name: string) {
    const audio = this.sounds.get(name);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  },

  mute() {
    this.isMuted = true;
    this.updateSounds();
    storageManager.setIsMuted(true);
  },

  unmute() {
    this.isMuted = false;
    this.updateSounds();
    storageManager.setIsMuted(false);
    this.updateSounds();
  },

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  },

  updateSounds() {
    this.sounds.forEach((audio) => {
      audio.muted = this.isMuted;
    });
  },
};

export type SoundManager = typeof soundManager;

export default soundManager;
