import { colors, tetrominos } from './constants';
import './style.css';
import { Matrix, PlayField, Tetromino, TetrominoName } from './types';
import {
  assertNotNull,
  generatePlayField,
  generateSequence,
  rotate,
} from './utils';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next') as HTMLCanvasElement;
const nextContext = nextCanvas.getContext('2d');

const cellSize = 32;
// массив с последовательностями фигур, на старте — пустой
const tetrominoSequence: TetrominoName[] = [];

const playField: PlayField = generatePlayField();

// счётчик
let count = 0;
// текущая фигура в игре
let tetromino = getNextTetromino();
// следим за кадрами анимации, чтобы если что — остановить игру
let rAF: number | null = null;
// флаг конца игры, на старте — неактивный
let gameOver = false;

// получаем следующую фигуру
function getNextTetromino(): Tetromino {
  // если следующей нет — генерируем
  if (tetrominoSequence.length === 0) {
    tetrominoSequence.push(...generateSequence());
  }
  // берём первую фигуру из массива
  const name = tetrominoSequence.pop();

  if (!name) {
    throw new Error('No tetromino');
  }

  // сразу создаём матрицу, с которой мы отрисуем фигуру
  const matrix = tetrominos[name];

  // I и O стартуют с середины, остальные — чуть левее
  const col = playField[0].length / 2 - Math.ceil(matrix[0].length / 2);

  // I начинает с 21 строки (смещение -1), а все остальные — со строки 22 (смещение -2)
  const row = name === 'I' ? -1 : -2;

  // вот что возвращает функция
  return {
    name,
    matrix,
    row,
    col,
  };
}

// проверяем после появления или вращения, может ли матрица (фигура) быть в этом месте поля или она вылезет за его границы
function isValidMove(matrix: Matrix, cellRow: number, cellCol: number) {
  // проверяем все строки и столбцы
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (
        matrix[row][col] &&
        // если выходит за границы поля…
        (cellCol + col < 0 ||
          cellCol + col >= playField[0].length ||
          cellRow + row >= playField.length ||
          // …или пересекается с другими фигурами
          playField[cellRow + row][cellCol + col])
      ) {
        // то возвращаем, что нет, так не пойдёт
        return false;
      }
    }
  }
  // а если мы дошли до этого момента и не закончили раньше — то всё в порядке
  return true;
}

// когда фигура окончательна встала на своё место
function placeTetromino() {
  // обрабатываем все строки и столбцы в игровом поле
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        // если край фигуры после установки вылезает за границы поля, то игра закончилась
        if (tetromino.row + row < 0) {
          return showGameOver();
        }
        // если всё в порядке, то записываем в массив игрового поля нашу фигуру
        playField[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // проверяем, чтобы заполненные ряды очистились снизу вверх
  for (let row = playField.length - 1; row >= 0; ) {
    // если ряд заполнен
    if (playField[row].every((cell) => !!cell)) {
      // очищаем его и опускаем всё вниз на одну клетку
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playField[r].length; c++) {
          playField[r][c] = playField[r - 1][c];
        }
      }
    } else {
      // переходим к следующему ряду
      row--;
    }
  }
  // получаем следующую фигуру
  tetromino = getNextTetromino();
}

// показываем надпись Game Over
function showGameOver() {
  assertNotNull(context);

  // прекращаем всю анимацию игры
  if (rAF) {
    cancelAnimationFrame(rAF);
  }
  // ставим флаг окончания
  gameOver = true;
  // рисуем чёрный прямоугольник посередине поля
  context.fillStyle = 'black';
  context.globalAlpha = 0.75;
  context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
  // пишем надпись белым моноширинным шрифтом по центру
  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '36px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}

// главный цикл игры
function loop() {
  assertNotNull(context);

  // начинаем анимацию
  rAF = requestAnimationFrame(loop);
  // очищаем холст
  context.clearRect(0, 0, canvas.width, canvas.height);

  // рисуем игровое поле с учётом заполненных фигур
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playField[row][col]) {
        const name = playField[row][col];

        if (typeof name === 'string') {
          context.fillStyle = colors[name];
        }

        // рисуем всё на один пиксель меньше, чтобы получился эффект «в клетку»
        context.fillRect(
          col * cellSize,
          row * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }
    }
  }

  // рисуем текущую фигуру
  if (tetromino) {
    // фигура сдвигается вниз каждые 35 кадров
    if (++count > 35) {
      tetromino.row++;
      count = 0;

      // если движение закончилось — рисуем фигуру в поле и проверяем, можно ли удалить строки
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    assertNotNull(context);

    // не забываем про цвет текущей фигуры
    context.fillStyle = colors[tetromino.name];

    // отрисовываем её
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

    assertNotNull(nextContext);

    // рисуем следующую фигуру
    const nextTetrominoName = tetrominoSequence[tetrominoSequence.length - 1];
    const nextTetrominoMatrix = tetrominos[nextTetrominoName];
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextContext.fillStyle = colors[nextTetrominoName];

    // отрисовываем её
    for (let row = 0; row < nextTetrominoMatrix.length; row++) {
      for (let col = 0; col < nextTetrominoMatrix[row].length; col++) {
        if (nextTetrominoMatrix[row][col]) {
          // и снова рисуем на один пиксель меньше
          nextContext.fillRect(
            col * cellSize,
            row * cellSize,
            cellSize - 1,
            cellSize - 1
          );
        }
      }
    }
  }
}

// следим за нажатиями на клавиши
document.addEventListener('keydown', function (e) {
  // если игра закончилась — сразу выходим
  if (gameOver) return;

  // стрелки влево и вправо
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const col =
      e.key === 'ArrowLeft'
        ? // если влево, то уменьшаем индекс в столбце, если вправо — увеличиваем
          tetromino.col - 1
        : tetromino.col + 1;

    // если так ходить можно, то запоминаем текущее положение
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }

  // стрелка вверх — поворот
  if (e.key === 'ArrowUp') {
    // поворачиваем фигуру на 90 градусов
    const matrix = rotate(tetromino.matrix);
    // если так ходить можно — запоминаем
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }

  // стрелка вниз — ускорить падение
  if (e.key === 'ArrowDown') {
    // смещаем фигуру на строку вниз
    const row = tetromino.row + 1;
    // если опускаться больше некуда — запоминаем новое положение
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;
      // ставим на место и смотрим на заполненные ряды
      placeTetromino();
      return;
    }
    // запоминаем строку, куда стала фигура
    tetromino.row = row;
  }
});

// старт игры
rAF = requestAnimationFrame(loop);
