import { deletingAnimation, gameOverAnimation } from './animations';
import deletingSound from './assets/sounds/delete.mp3';
import dropSound from './assets/sounds/drop.mp3';
import gameOverSound from './assets/sounds/game-over.mp3';
import levelUpSound from './assets/sounds/level-up.mp3';
import { buttonLabels, GameStatus, tetrominos } from './constants';
import GameState from './game-state';
import soundManager from './sound-manager';
import storageManager from './storage-manager';
import './style.css';
import { PlayField, Tetromino, TetrominoName } from './types';
import {
  assertNotNull,
  assertNotUndefined,
  findMaxValidRow,
  generatePlayField,
  getDelay,
  isValidMove,
  randomGenerator,
  renderPauseIcon,
  renderPlayField,
  renderTetromino,
  renderTetrominoShadow,
  rotate,
} from './utils';

const startButton = document.getElementById('start') as HTMLButtonElement;
const pauseButton = document.getElementById('pause') as HTMLButtonElement;
const muteButton = document.getElementById('mute') as HTMLButtonElement;

function game() {
  const gameState = new GameState();
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
  let highScore = storageManager.highScore;
  let previousTime = 0;
  let previousLevel = gameState.level;

  document.getElementById('record')!.textContent = `Record: ${highScore}`;

  soundManager.loadSound('drop', dropSound);
  soundManager.loadSound('game-over', gameOverSound);
  soundManager.loadSound('deleting', deletingSound);
  soundManager.loadSound('level-up', levelUpSound);

  updateMuteButton();

  gameState.subscribe(() => {
    if (gameState.level > previousLevel) {
      previousLevel = gameState.level;
      soundManager.playSound('level-up');
    }
  });

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
      gameState.setStatus(GameStatus.Animation);
      soundManager.playSound('deleting');
      assertNotNull(context);
      deletingAnimation(context, deletingRowIndexes, playField, () => {
        removeFullRows(deletingRowIndexes);
        gameState.setStatus(GameStatus.Running);
        requestAnimationFrame(loop);
      });
    }

    return deletingRowIndexes.length;
  }

  function handleMuteClick() {
    soundManager.toggleMute();
    updateMuteButton();
    muteButton.blur();
  }

  function updateMuteButton() {
    muteButton.innerText = soundManager.isMuted ? '🔇' : '🔊';
  }

  function finishGame() {
    soundManager.playSound('game-over');
    gameState.setStatus(GameStatus.Animation);
    assertNotNull(context);

    gameOverAnimation(context, () => {
      gameState.setStatus(GameStatus.GameOver);
      requestAnimationFrame(loop);
    });

    document.removeEventListener('keydown', handleKeydown);
    pauseButton.removeEventListener('click', togglePause);
    muteButton.removeEventListener('click', handleMuteClick);
    startButton.style.display = 'inherit';
    pauseButton.style.display = 'none';
  }

  function placeTetromino() {
    for (let row = 0; row < currentTetromino.matrix.length; row++) {
      for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
        if (currentTetromino.matrix[row][col]) {
          // если край фигуры после установки вылезает за границы поля, то игра закончилась
          if (currentTetromino.row + row < 0) {
            return finishGame();
          }
          // если всё в порядке, то записываем в массив игрового поля нашу фигуру
          playField[currentTetromino.row + row][currentTetromino.col + col] =
            currentTetromino.name;
        }
      }
    }

    const clearedRowsCount = clearRows();
    gameState.updateScore(clearedRowsCount);

    if (gameState.score > highScore) {
      highScore = gameState.score;
      localStorage.setItem('highScore', highScore.toString());
    }

    document.getElementById('score')!.textContent = `Score: ${gameState.score}`;
    document.getElementById('record')!.textContent = `Record: ${highScore}`;
    document.getElementById('level')!.textContent = `Level: ${gameState.level}`;

    requestAnimationFrame(() => {
      currentTetromino = getNextTetromino();
    });
  }

  function update() {
    console.log(soundManager.isMuted);

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

  function draw() {
    const nextTetrominoName = tetrominoQueue[0];
    const nextTetrominoMatrix = tetrominos[nextTetrominoName];

    assertNotNull(context);
    assertNotNull(nextContext);

    context.clearRect(0, 0, canvas.width, canvas.height);

    renderPlayField(context, playField);
    renderTetromino(context, currentTetromino);
    renderTetrominoShadow(context, currentTetromino, playField);

    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    renderTetromino(nextContext, {
      name: nextTetrominoName,
      matrix: nextTetrominoMatrix,
      row: 0,
      col: 0,
    });
  }

  function loop(timestamp: number) {
    if (gameState.status === GameStatus.Paused) {
      assertNotNull(context);
      renderPauseIcon(context);
      return;
    }

    if (gameState.status !== GameStatus.Running) {
      return;
    }

    draw();

    if (timestamp - previousTime > getDelay(gameState.level)) {
      previousTime = timestamp;
      currentTetromino.row++;
      update();
    }

    requestAnimationFrame(loop);
  }

  function togglePause() {
    if (gameState.status === GameStatus.Paused) {
      gameState.setStatus(GameStatus.Running);
      requestAnimationFrame(loop);
      pauseButton.innerText = buttonLabels.pause;
    } else {
      gameState.setStatus(GameStatus.Paused);
      pauseButton.innerText = buttonLabels.resume;
    }
  }

  function softDrop() {
    const row = currentTetromino.row + 1;

    if (
      !isValidMove(
        playField,
        currentTetromino.matrix,
        row,
        currentTetromino.col
      )
    ) {
      currentTetromino.row = row - 1;

      return;
    }
    currentTetromino.row = row;
  }

  function hardDrop() {
    soundManager.playSound('drop');
    currentTetromino.row = findMaxValidRow(currentTetromino, playField);
  }

  function rotateCurrentTetromino() {
    const matrix = rotate(currentTetromino.matrix);
    if (
      isValidMove(playField, matrix, currentTetromino.row, currentTetromino.col)
    ) {
      currentTetromino.matrix = matrix;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      togglePause();
    }

    if (gameState.status !== GameStatus.Running) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const col =
        e.key === 'ArrowLeft'
          ? currentTetromino.col - 1
          : currentTetromino.col + 1;

      if (
        isValidMove(
          playField,
          currentTetromino.matrix,
          currentTetromino.row,
          col
        )
      ) {
        currentTetromino.col = col;
      }
    }

    if (e.key === 'ArrowUp') {
      rotateCurrentTetromino();
    }

    if (e.key === 'ArrowDown') {
      softDrop();
    }

    if (e.key === ' ') {
      hardDrop();
    }
  }

  document.addEventListener('keydown', handleKeydown);
  pauseButton.addEventListener('click', togglePause);
  muteButton.addEventListener('click', handleMuteClick);

  gameState.setStatus(GameStatus.Running);
  requestAnimationFrame(loop);
}

startButton.addEventListener('click', () => {
  game();
  startButton.style.display = 'none';
  pauseButton.style.display = 'inherit';
});
