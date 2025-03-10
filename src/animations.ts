import { cellSize, colCount, colors, rowCount } from './constants';
import { TetrominoName } from './types';
import { randomGenerator } from './utils';

export function gameOverAnimation(
  context: CanvasRenderingContext2D,
  callback: () => void
) {
  let previousTime = 0;
  const delay = 100;
  let row = rowCount - 1;
  const tetrominoGenerator = randomGenerator();

  function showGameOver() {
    context.fillStyle = 'white';
    context.fillStyle = 'white';
    context.font = '32px "Press Start 2P", monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      'GAME OVER',
      context.canvas.width / 2,
      context.canvas.height / 2
    );
  }

  function loop(timestamp: number) {
    if (row < 0) {
      return callback();
    }

    if (timestamp > previousTime + delay) {
      previousTime = timestamp;

      for (let col = 0; col < colCount; col++) {
        const tetrominoName = tetrominoGenerator.next().value as TetrominoName;
        context.fillStyle = colors[tetrominoName];

        context.fillRect(
          col * cellSize,
          row * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }

      if (row === 0) {
        showGameOver();
      }

      row--;
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
