import { tetrominos } from './constants';
import './style.css';
import { PlayField, Tetromino, TetrominoName } from './types';
import {
  assertNotNull,
  assertNotUndefined,
  generatePlayField,
  increaseScore,
  isValidMove,
  randomGenerator,
  renderPlayField,
  renderTetromino,
  rotate,
} from './utils';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next') as HTMLCanvasElement;
const nextContext = nextCanvas.getContext('2d');
const tetrominoGenerator = randomGenerator();

const tetrominoQueue: TetrominoName[] = [
  tetrominoGenerator.next().value as TetrominoName,
  tetrominoGenerator.next().value as TetrominoName,
];

const playField: PlayField = generatePlayField();
let count = 0;
let currentTetromino = getNextTetromino();
let rAF: number | null = null;
let gameOver = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore') ?? '0', 10);

document.getElementById('record')!.textContent = `Record: ${highScore}`;

function getNextTetromino(): Tetromino {
  tetrominoQueue.push(tetrominoGenerator.next().value as TetrominoName);
  const name = tetrominoQueue.shift();
  assertNotUndefined(name);
  const matrix = tetrominos[name];

  // I и O стартуют с середины, остальные — чуть левее
  const col = playField[0].length / 2 - Math.ceil(matrix[0].length / 2);

  // I начинает с 21 строки (смещение -1), а все остальные — со строки 22 (смещение -2)
  const row = name === 'I' ? -1 : -2;

  return {
    name,
    matrix,
    row,
    col,
  };
}

function clearRows(): number {
  let clearedRowsCount = 0;

  for (let row = playField.length - 1; row >= 0; ) {
    if (playField[row].every((cell) => !!cell)) {
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playField[r].length; c++) {
          playField[r][c] = playField[r - 1][c];
        }
      }

      clearedRowsCount++;
    } else {
      row--;
    }
  }

  return clearedRowsCount;
}

function placeTetromino() {
  for (let row = 0; row < currentTetromino.matrix.length; row++) {
    for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
      if (currentTetromino.matrix[row][col]) {
        // если край фигуры после установки вылезает за границы поля, то игра закончилась
        if (currentTetromino.row + row < 0) {
          return showGameOver();
        }
        // если всё в порядке, то записываем в массив игрового поля нашу фигуру
        playField[currentTetromino.row + row][currentTetromino.col + col] =
          currentTetromino.name;
      }
    }
  }

  const clearedRowsCount = clearRows();
  score = increaseScore(score, clearedRowsCount);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore.toString());
  }

  document.getElementById('score')!.textContent = `Score: ${score}`;
  document.getElementById('record')!.textContent = `Record: ${highScore}`;

  currentTetromino = getNextTetromino();
}

function showGameOver() {
  assertNotNull(context);

  if (rAF) {
    cancelAnimationFrame(rAF);
  }
  gameOver = true;
  context.fillStyle = 'black';
  context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '24px "Press Start 2P", monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
}

// главный цикл игры
function loop() {
  rAF = requestAnimationFrame(loop);
  assertNotNull(context);

  context.clearRect(0, 0, canvas.width, canvas.height);

  renderPlayField(context, playField);

  // рисуем текущую фигуру
  if (currentTetromino) {
    // фигура сдвигается вниз каждые 35 кадров
    if (++count > 35) {
      currentTetromino.row++;
      count = 0;

      // если движение закончилось — рисуем фигуру в поле и проверяем, можно ли удалить строки
      if (
        !isValidMove(
          playField,
          currentTetromino.matrix,
          currentTetromino.row,
          currentTetromino.col
        )
      ) {
        currentTetromino.row--;
        placeTetromino();
      }
    }

    assertNotNull(context);
    renderTetromino(context, currentTetromino);
    assertNotNull(nextContext);

    // рисуем следующую фигуру
    const nextTetrominoName = tetrominoQueue[0];
    const nextTetrominoMatrix = tetrominos[nextTetrominoName];

    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    renderTetromino(nextContext, {
      name: nextTetrominoName,
      matrix: nextTetrominoMatrix,
      row: 0,
      col: 0,
    });
  }
}

document.addEventListener('keydown', function (e) {
  // если игра закончилась — сразу выходим
  if (gameOver) return;

  // стрелки влево и вправо
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const col =
      e.key === 'ArrowLeft'
        ? // если влево, то уменьшаем индекс в столбце, если вправо — увеличиваем
          currentTetromino.col - 1
        : currentTetromino.col + 1;

    // если так ходить можно, то запоминаем текущее положение
    if (
      isValidMove(playField, currentTetromino.matrix, currentTetromino.row, col)
    ) {
      currentTetromino.col = col;
    }
  }

  // стрелка вверх — поворот
  if (e.key === 'ArrowUp') {
    // поворачиваем фигуру на 90 градусов
    const matrix = rotate(currentTetromino.matrix);
    // если так ходить можно — запоминаем
    if (
      isValidMove(playField, matrix, currentTetromino.row, currentTetromino.col)
    ) {
      currentTetromino.matrix = matrix;
    }
  }

  // стрелка вниз — ускорить падение
  if (e.key === 'ArrowDown') {
    // смещаем фигуру на строку вниз
    const row = currentTetromino.row + 1;
    // если опускаться больше некуда — запоминаем новое положение
    if (
      !isValidMove(
        playField,
        currentTetromino.matrix,
        row,
        currentTetromino.col
      )
    ) {
      currentTetromino.row = row - 1;
      // ставим на место и смотрим на заполненные ряды
      placeTetromino();
      return;
    }
    // запоминаем строку, куда стала фигура
    currentTetromino.row = row;
  }
});

// старт игры
rAF = requestAnimationFrame(loop);
