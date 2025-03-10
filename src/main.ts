import { deletingAnimation, gameOverAnimation } from './animations';
import { GameStatus, tetrominos } from './constants';
import './style.css';
import { PlayField, Tetromino, TetrominoName } from './types';
import {
  assertNotNull,
  assertNotUndefined,
  generatePlayField,
  getDelay,
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
let currentTetromino = getNextTetromino();
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore') ?? '0', 10);
let previousTime = 0;
let level = 1;
let gameStatus = GameStatus.Paused;
let animationFrameId: number | null = null;

document.getElementById('record')!.textContent = `Record: ${highScore}`;

function getNextTetromino(): Tetromino {
  tetrominoQueue.push(tetrominoGenerator.next().value as TetrominoName);
  const name = tetrominoQueue.shift();
  assertNotUndefined(name);
  const matrix = tetrominos[name];
  const col = playField[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = -2;

  return {
    name,
    matrix,
    row,
    col,
  };
}

function findFullRows(): number[] {
  const fullRows: number[] = [];

  for (let row = 0; row < playField.length; row++) {
    if (playField[row].every((cell) => !!cell)) {
      fullRows.push(row);
    }
  }

  return fullRows;
}

function removeFullRows(fullRows: number[]) {
  for (let row of fullRows) {
    playField.splice(row, 1);
    playField.unshift(new Array(playField[0].length).fill(0));
  }
}

function clearRows(): number {
  const deletingRowIndexes = findFullRows();

  if (deletingRowIndexes.length > 0) {
    gameStatus = GameStatus.Animation;
    stopCurrentAnimation();
    assertNotNull(context);
    deletingAnimation(context, deletingRowIndexes, playField, () => {
      removeFullRows(deletingRowIndexes);
      gameStatus = GameStatus.Running;
      animationFrameId = requestAnimationFrame(loop);
    });
  }

  return deletingRowIndexes.length;
}

function placeTetromino() {
  for (let row = 0; row < currentTetromino.matrix.length; row++) {
    for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
      if (currentTetromino.matrix[row][col]) {
        // если край фигуры после установки вылезает за границы поля, то игра закончилась
        if (currentTetromino.row + row < 0) {
          stopCurrentAnimation();
          gameStatus = GameStatus.Animation;
          assertNotNull(context);

          return gameOverAnimation(context, () => {
            gameStatus = GameStatus.GameOver;
            animationFrameId = requestAnimationFrame(loop);
          });
        }
        // если всё в порядке, то записываем в массив игрового поля нашу фигуру
        playField[currentTetromino.row + row][currentTetromino.col + col] =
          currentTetromino.name;
      }
    }
  }

  const clearedRowsCount = clearRows();
  score = increaseScore(score, clearedRowsCount);

  if (clearedRowsCount > 0) {
    level = Math.floor(score / 1000) + 1;
  }

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore.toString());
  }

  document.getElementById('score')!.textContent = `Score: ${score}`;
  document.getElementById('record')!.textContent = `Record: ${highScore}`;
  document.getElementById('level')!.textContent = `Level: ${level}`;

  currentTetromino = getNextTetromino();

  requestAnimationFrame(() => {
    currentTetromino = getNextTetromino();
  });
}

function loop(timestamp: number) {
  if (gameStatus !== GameStatus.Running) {
    return;
  }

  assertNotNull(context);
  context.clearRect(0, 0, canvas.width, canvas.height);
  renderPlayField(context, playField);

  if (currentTetromino) {
    if (timestamp - previousTime > getDelay(level)) {
      previousTime = timestamp;
      currentTetromino.row++;

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

  animationFrameId = requestAnimationFrame(loop);
}

const startButton = document.getElementById('start') as HTMLButtonElement;
startButton.addEventListener('click', () => {
  gameStatus = GameStatus.Running;
  startButton.style.display = 'none';
  animationFrameId = requestAnimationFrame(loop);
});

document.addEventListener('keydown', function (e) {
  if (gameStatus !== GameStatus.Running) return;

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

function stopCurrentAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
}
