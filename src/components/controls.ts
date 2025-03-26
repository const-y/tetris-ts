import GameState from '../game-state';
import Button from './button';
import { buttonLabels, GameStatus } from '../constants';

class Controls {
  startButton: Button;
  pauseButton: HTMLButtonElement;
  muteButton: HTMLButtonElement;

  constructor(
    private readonly container: HTMLElement,
    private readonly gameState: GameState
  ) {
    this.pauseButton = document.getElementById('pause') as HTMLButtonElement;
    this.muteButton = document.getElementById('mute') as HTMLButtonElement;

    this.startButton = new Button(this.container, {
      label: 'Start',
      className: 'button',
      onClick: () => {},
    });

    gameState.subscribe(() => {});
  }

  update() {
    if (this.gameState.status === GameStatus.Paused) {
      this.pauseButton.innerText = buttonLabels.resume;
    } else {
      this.pauseButton.innerText = buttonLabels.pause;
    }
  }

  destroy() {
    this.startButton.destroy();
  }
}

export default Controls;
