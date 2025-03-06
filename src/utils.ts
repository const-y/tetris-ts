import { cellSize, colors } from './constants';
import { Matrix, PlayField, Tetromino, TetrominoName } from './types';

export function assertNotNull<T>(
  value: T | null,
  message = 'Value cannot be null'
): asserts value is T {
  if (value === null) {
    throw new Error(message);
  }
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
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

export function generateSequence(): TetrominoName[] {
  const tetrominoSequence: TetrominoName[] = [];
  const sequence: TetrominoName[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }

  return tetrominoSequence;
}

export function generatePlayField(
  rowCount: number = 20,
  colCount: number = 10
): PlayField {
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
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
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
