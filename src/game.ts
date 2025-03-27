import { deletingAnimation, gameOverAnimation } from './animations';
import { GameStatus, tetrominos } from './constants';
import GameState from './game-state';
import { SoundManager } from './sound-manager';
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

class Game {
  canvas: HTMLCanvasElement;
  nextCanvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  nextContext: CanvasRenderingContext2D;
  gameState: GameState;
  tetrominoGenerator: Generator<TetrominoName>;
  tetrominoQueue: TetrominoName[];
  playField: PlayField;
  currentTetromino: Tetromino;
  previousTime;
  soundManager: SoundManager;

  constructor(gameState: GameState, soundManager: SoundManager) {
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    const nextCanvas = document.getElementById('next') as HTMLCanvasElement;

    assertNotNull(canvas);
    assertNotNull(nextCanvas);

    const context = canvas.getContext('2d');
    const nextContext = nextCanvas.getContext('2d');

    assertNotNull(context);
    assertNotNull(nextContext);
    this.canvas = canvas;
    this.nextCanvas = nextCanvas;
    this.context = context;
    this.nextContext = nextContext;

    this.tetrominoGenerator = randomGenerator();
    this.gameState = gameState;
    this.tetrominoQueue = [
      this.tetrominoGenerator.next().value,
      this.tetrominoGenerator.next().value,
    ];
    this.playField = generatePlayField();
    this.currentTetromino = this.getNextTetromino();
    this.previousTime = 0;
    this.soundManager = soundManager;

    this.loop = this.loop.bind(this);
  }

  private getNextTetromino(): Tetromino {
    this.tetrominoQueue.push(this.tetrominoGenerator.next().value);
    const name = this.tetrominoQueue.shift();
    assertNotUndefined(name);
    const matrix = tetrominos[name];
    const col = this.playField[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = -2;

    return {
      name,
      matrix,
      row,
      col,
    };
  }

  private draw() {
    const nextTetrominoName = this.tetrominoQueue[0];
    const nextTetrominoMatrix = tetrominos[nextTetrominoName];

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    renderPlayField(this.context, this.playField);
    renderTetromino(this.context, this.currentTetromino);
    renderTetrominoShadow(this.context, this.currentTetromino, this.playField);

    this.nextContext.clearRect(
      0,
      0,
      this.nextCanvas.width,
      this.nextCanvas.height
    );

    renderTetromino(this.nextContext, {
      name: nextTetrominoName,
      matrix: nextTetrominoMatrix,
      row: 0,
      col: 0,
    });
  }

  private findFullRows(): number[] {
    const fullRows: number[] = [];

    for (let row = 0; row < this.playField.length; row++) {
      if (this.playField[row].every((cell) => !!cell)) {
        fullRows.push(row);
      }
    }

    return fullRows;
  }

  private removeFullRows(fullRows: number[]) {
    for (let row of fullRows) {
      this.playField.splice(row, 1);
      this.playField.unshift(new Array(this.playField[0].length).fill(0));
    }
  }

  private clearRows(): number {
    const deletingRowIndexes = this.findFullRows();

    if (deletingRowIndexes.length > 0) {
      this.gameState.setStatus(GameStatus.Animation);
      this.soundManager.playSound('deleting');
      assertNotNull(this.context);
      deletingAnimation(
        this.context,
        deletingRowIndexes,
        this.playField,
        () => {
          this.removeFullRows(deletingRowIndexes);
          this.gameState.setStatus(GameStatus.Running);
          requestAnimationFrame(this.loop);
        }
      );
    }

    return deletingRowIndexes.length;
  }

  private placeTetromino() {
    for (let row = 0; row < this.currentTetromino.matrix.length; row++) {
      for (let col = 0; col < this.currentTetromino.matrix[row].length; col++) {
        if (this.currentTetromino.matrix[row][col]) {
          // если край фигуры после установки вылезает за границы поля, то игра закончилась
          if (this.currentTetromino.row + row < 0) {
            return this.finish();
          }
          // если всё в порядке, то записываем в массив игрового поля нашу фигуру
          this.playField[this.currentTetromino.row + row][
            this.currentTetromino.col + col
          ] = this.currentTetromino.name;
        }
      }
    }

    const clearedRowsCount = this.clearRows();

    this.gameState.updateScore(clearedRowsCount);
    this.currentTetromino = this.getNextTetromino();
  }

  private update() {
    if (
      !isValidMove(
        this.playField,
        this.currentTetromino.matrix,
        this.currentTetromino.row,
        this.currentTetromino.col
      )
    ) {
      this.currentTetromino.row--;
      this.placeTetromino();
    }
  }

  private loop(timestamp: number) {
    if (this.gameState.status === GameStatus.Paused) {
      assertNotNull(this.context);
      renderPauseIcon(this.context);
      return;
    }

    if (this.gameState.status !== GameStatus.Running) {
      return;
    }

    this.draw();

    if (timestamp - this.previousTime > getDelay(this.gameState.level)) {
      this.previousTime = timestamp;
      this.currentTetromino.row++;
      this.update();
    }

    requestAnimationFrame(this.loop);
  }

  start() {
    this.gameState.reset();
    this.playField = generatePlayField();
    this.gameState.setStatus(GameStatus.Running);
    requestAnimationFrame(this.loop);
  }

  moveCurrentTetromino(direction: 'left' | 'right') {
    const col =
      direction === 'left'
        ? this.currentTetromino.col - 1
        : this.currentTetromino.col + 1;

    if (
      isValidMove(
        this.playField,
        this.currentTetromino.matrix,
        this.currentTetromino.row,
        col
      )
    ) {
      this.currentTetromino.col = col;
    }
  }

  rotateCurrentTetromino() {
    const matrix = rotate(this.currentTetromino.matrix);
    if (
      isValidMove(
        this.playField,
        matrix,
        this.currentTetromino.row,
        this.currentTetromino.col
      )
    ) {
      this.currentTetromino.matrix = matrix;
    }
  }

  togglePause() {
    if (this.gameState.status === GameStatus.Paused) {
      this.gameState.setStatus(GameStatus.Running);
      requestAnimationFrame(this.loop);
    } else {
      this.gameState.setStatus(GameStatus.Paused);
    }
  }

  softDrop() {
    const row = this.currentTetromino.row + 1;

    if (
      !isValidMove(
        this.playField,
        this.currentTetromino.matrix,
        row,
        this.currentTetromino.col
      )
    ) {
      this.currentTetromino.row = row - 1;

      return;
    }
    this.currentTetromino.row = row;
  }

  hardDrop() {
    this.soundManager.playSound('drop');
    this.currentTetromino.row = findMaxValidRow(
      this.currentTetromino,
      this.playField
    );

    this.placeTetromino();
  }

  finish() {
    this.soundManager.playSound('game-over');
    this.gameState.setStatus(GameStatus.Animation);

    gameOverAnimation(this.context, () => {
      this.gameState.setStatus(GameStatus.GameOver);
      requestAnimationFrame(this.loop);
    });
  }
}

export default Game;
