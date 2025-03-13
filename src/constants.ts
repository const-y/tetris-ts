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
} as const;

export const colors: Record<TetrominoName, string> = {
  I: '#00aee6',
  J: '#4A90E2',
  L: '#FF9F50',
  O: '#FFC107',
  S: '#6FDA87',
  T: '#A97FFF',
  Z: '#FF6B6B',
} as const;

export enum GameStatus {
  Running,
  Paused,
  GameOver,
  Animation,
}

export const buttonLabels = {
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
} as const;
