export type TetrominoName = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type Matrix<T = number> = T[][];

export interface Tetromino {
  name: TetrominoName;
  matrix: Matrix;
  row: number;
  col: number;
}

export type PlayField = Matrix<TetrominoName | 0>;
