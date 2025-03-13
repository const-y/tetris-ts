import { cellSize, colCount, colors, rowCount } from './constants';
import { Matrix, PlayField, Tetromino, TetrominoName } from './types';

export function assertNotNull<T>(
  value: T | null,
  message = 'Value cannot be null'
): asserts value is T {
  if (value === null) {
    throw new Error(message);
  }
}

export function assertNotUndefined<T>(
  value: T | undefined,
  message = 'Value cannot be undefined'
): asserts value is T {
  if (value === undefined) {
    throw new Error(message);
  }
}

export function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function* randomGenerator() {
  let bag: TetrominoName[] = [];

  while (true) {
    if (bag.length === 0) {
      bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      bag = shuffle(bag);
    }
    yield bag.pop();
  }
}

export function rotate(matrix: Matrix): Matrix {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) => row.map((_val, j) => matrix[N - j][i]));

  return result;
}

export function isValidMove(
  playField: PlayField,
  matrix: Matrix,
  cellRow: number,
  cellCol: number
) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (
        matrix[row][col] &&
        (cellCol + col < 0 ||
          cellCol + col >= playField[0].length ||
          cellRow + row >= playField.length ||
          playField[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }
  return true;
}

export function generatePlayField(): PlayField {
  const playField: PlayField = [];

  for (let row = -2; row < rowCount; row++) {
    playField[row] = [];

    for (let col = 0; col < colCount; col++) {
      playField[row][col] = 0;
    }
  }

  return playField;
}

export function renderPlayField(
  context: CanvasRenderingContext2D,
  playField: PlayField
) {
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      if (playField[row][col]) {
        const name = playField[row][col];

        if (typeof name === 'string') {
          context.fillStyle = colors[name];
        }

        context.fillRect(
          col * cellSize,
          row * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }
    }
  }
}

export function renderTetromino(
  context: CanvasRenderingContext2D,
  tetromino: Tetromino
) {
  context.fillStyle = colors[tetromino.name];

  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        // и снова рисуем на один пиксель меньше
        context.fillRect(
          (tetromino.col + col) * cellSize,
          (tetromino.row + row) * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }
    }
  }
}

export function increaseScore(
  currentScore: number,
  clearedRowsCount: number
): number {
  // Начисляем очки (по стандарту Tetris: 1 row = 100, 2 = 300, 3 = 500, 4 = 800)
  if (clearedRowsCount > 0) {
    return currentScore + [0, 100, 300, 500, 800][clearedRowsCount];
  }

  return currentScore;
}

export function getDelay(
  level: number,
  initialDelay: number = 750,
  reductionFactor: number = 0.9,
  minDelay: number = 50
): number {
  const delay = initialDelay * Math.pow(reductionFactor, level - 1);
  return Math.max(delay, minDelay); // Ограничиваем минимальной задержкой
}

export function renderPauseIcon(context: CanvasRenderingContext2D) {
  assertNotNull(context);

  context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  const barWidth = cellSize / 2;
  const barHeight = cellSize;
  const gap = 8;

  const xCenter = context.canvas.width / 2;
  const yCenter = context.canvas.height / 2;

  context.fillStyle = '#FFF';
  context.fillRect(
    xCenter - gap / 2 - barWidth,
    yCenter - barHeight / 2,
    barWidth,
    barHeight
  );

  context.fillRect(
    xCenter + gap / 2,
    yCenter - barHeight / 2,
    barWidth,
    barHeight
  );
}
