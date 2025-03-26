import storageManager from '../storage-manager';
import GameState from '../game-state';
import Label from './label';

class ScoreBoard {
  level: Label;
  score: Label;
  highScore: Label;
  lines: Label;

  constructor(
    private readonly container: HTMLElement,
    private readonly gameState: GameState
  ) {
    this.level = new Label(this.container, {
      label: 'Level',
      value: 1,
    });

    this.score = new Label(this.container, {
      label: 'Score',
      value: 0,
    });

    this.highScore = new Label(this.container, {
      label: 'Record',
      value: 0,
    });

    this.lines = new Label(this.container, {
      label: 'Lines',
      value: 0,
    });

    this.gameState.subscribe(() => this.update());
    this.update();
  }

  update() {
    this.level.update({ value: this.gameState.level });
    this.score.update({ value: this.gameState.score });
    this.highScore.update({ value: storageManager.highScore });
    this.lines.update({ value: this.gameState.linesCleared });
  }

  destroy() {
    this.level.destroy();
    this.score.destroy();
    this.highScore.destroy();
    this.lines.destroy();
  }
}

export default ScoreBoard;
