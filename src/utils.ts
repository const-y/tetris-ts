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
