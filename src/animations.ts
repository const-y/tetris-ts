import { cellSize, colCount, colors, rowCount } from './constants';
import { TetrominoName } from './types';
import { randomGenerator } from './utils';

export function gameOverAnimation(
  context: CanvasRenderingContext2D,
  callback: () => void
) {
  let previousTime = 0;
  const delay = 25;
  let row = rowCount - 1;
  const tetrominoGenerator = randomGenerator();
  let step = 0;

  function showGameOver() {
    context.fillStyle = 'black';
    context.font = '24px "Press Start 2P", monospace';
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
      step = 1;
    }

    if (timestamp > previousTime + delay) {
      previousTime = timestamp;

      for (let col = 0; col < colCount; col++) {
        const tetrominoName = tetrominoGenerator.next().value as TetrominoName;
        if (step === 0) {
          context.fillStyle = colors[tetrominoName];
        } else {
          context.fillStyle = 'white';
        }

        context.fillRect(
          col * cellSize,
          row * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }

      if (step === 0) {
        row--;
      } else {
        row++;
      }

      if (row === rowCount - 1 && step === 1) {
        showGameOver();
        callback();
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

export function deletingAnimation(
  context: CanvasRenderingContext2D,
  rows: number[],
  callback: () => void
) {
  let previousTime = 0;
  const delay = 100;
  const repeatCount = 5;
  let repeat = 0;

  function loop(timestamp: number) {
    if (repeat > repeatCount) {
      return callback();
    }

    if (timestamp > previousTime + delay) {
      repeat++;
      previousTime = timestamp;
    }

    rows.forEach((row) => {
      context.fillStyle = repeat % 2 === 0 ? 'white' : '#FF7043';
      for (let col = 0; col < colCount; col++) {
        context.fillRect(
          col * cellSize,
          row * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
