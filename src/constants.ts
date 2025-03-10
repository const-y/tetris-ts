import { Matrix, TetrominoName } from './types';

export const rowCount = 20;
export const colCount = 10;
export const cellSize = 32;

export const tetrominos: Record<TetrominoName, Matrix> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const colors: Record<TetrominoName, string> = {
  I: '#d5615a',
  O: '#cd8144',
  T: '#c59b23',
  S: '#5ad561',
  Z: '#40c2b1',
  J: '#00aee6',
  L: '#615ad5',
};

export enum GameStatus {
  Running,
  Paused,
  GameOver,
  Animation,
}
