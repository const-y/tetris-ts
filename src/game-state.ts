import { GameStatus } from './constants';
import { increaseScore } from './utils';
import { StorageManager } from './storage-manager';

class GameState {
  score = 0;
  highScore: number;
  level = 1;
  linesCleared = 0;
  status = GameStatus.Paused;
  observers: (() => void)[] = [];
  storageManager: StorageManager;

  constructor(storageManager: StorageManager) {
    this.storageManager = storageManager;
    this.highScore = storageManager.highScore;
  }

  reset() {
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.status = GameStatus.Paused;
  }

  subscribe(observer: () => void) {
    this.observers.push(observer);
  }

  notify() {
    this.observers.forEach((observer) => observer());
  }

  updateScore(clearedRows: number) {
    this.score = increaseScore(this.score, clearedRows);
    this.linesCleared += clearedRows;
    this.level = Math.floor(this.linesCleared / 10) + 1;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.storageManager.setHighScore(this.highScore);
    }

    this.notify();
  }

  setStatus(status: GameStatus) {
    this.status = status;
    this.notify();
  }
}

export default GameState;
