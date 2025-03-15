const soundManager = {
  sounds: new Map<string, HTMLAudioElement>(),

  loadSound(name: string, url: string) {
    const audio = new Audio(url);
    audio.load();
    this.sounds.set(name, audio);
  },

  playSound(name: string, volume: number = 1.0, loop: boolean = false) {
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
};

export default soundManager;
