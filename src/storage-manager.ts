const storageManager = {
  keys: {
    highScore: 'highScore',
    isMuted: 'isMuted',
  },

  get highScore() {
    return parseInt(localStorage.getItem(this.keys.highScore) ?? '0', 10);
  },
  setHighScore(score: number) {
    localStorage.setItem(this.keys.highScore, score.toString());
  },

  get isMuted() {
    return localStorage.getItem(this.keys.isMuted) === 'true';
  },
  setIsMuted(isMuted: boolean) {
    localStorage.setItem(this.keys.isMuted, isMuted.toString());
  },
};

export default storageManager;
