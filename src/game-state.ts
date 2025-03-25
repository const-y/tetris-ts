import { GameStatus } from './constants';
import { increaseScore } from './utils';

class GameState {
  score = 0;
  level = 1;
  linesCleared = 0;
  status = GameStatus.Paused;
  observers: (() => void)[] = [];

  subscribe(observer: () => void) {
    this.observers.push(observer);
  }

  notify() {
    this.observers.forEach((observer) => observer());
  }

  updateScore(clearedRows: number) {
    this.score = increaseScore(this.score, clearedRows);
    this.linesCleared += clearedRows;
    this.level = Math.floor(this.score / 1000) + 1;
    this.notify();
  }

  setStatus(status: GameStatus) {
    this.status = status;
    this.notify();
  }
}

export default GameState;
