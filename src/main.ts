import './style.css';

const canvas = document.getElementById('tetris') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;
context.scale(30, 30); // Увеличиваем масштаб для удобства

const ROWS: number = 20;
const COLUMNS: number = 10;
const board: number[][] = Array.from({ length: ROWS }, () =>
  Array(COLUMNS).fill(0)
);

type Tetromino = number[][];

const tetrominoes: Record<string, Tetromino> = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

interface Piece {
  shape: Tetromino;
  x: number;
  y: number;
}

let currentPiece: Piece = { shape: tetrominoes.L, x: 3, y: -3 };

function drawMatrix(matrix: Tetromino, offset: { x: number; y: number }) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'blue';
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(currentPiece.shape, { x: currentPiece.x, y: currentPiece.y });
}

function drop() {
  currentPiece.y++;
  draw();
}

document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') currentPiece.x--;
  if (event.key === 'ArrowRight') currentPiece.x++;
  if (event.key === 'ArrowDown') drop();
  draw();
});

setInterval(drop, 1000);
