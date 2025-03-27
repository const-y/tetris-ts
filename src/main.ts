import deletingSound from './assets/sounds/delete.mp3';
import dropSound from './assets/sounds/drop.mp3';
import gameOverSound from './assets/sounds/game-over.mp3';
import levelUpSound from './assets/sounds/level-up.mp3';
import ScoreBoard from './components/score-board';
import { GameStatus } from './constants';
import Game from './game';
import GameState from './game-state';
import soundManager from './sound-manager';
import storageManager from './storage-manager';
import './style.css';

const startButton = document.getElementById('start') as HTMLButtonElement;
const pauseButton = document.getElementById('pause') as HTMLButtonElement;
const muteButton = document.getElementById('mute') as HTMLButtonElement;
const scoreBoardContainer = document.getElementById('labels') as HTMLDivElement;
const gameState = new GameState(storageManager);
const game = new Game(gameState, soundManager);
new ScoreBoard(scoreBoardContainer, gameState);

soundManager.loadSound('drop', dropSound);
soundManager.loadSound('game-over', gameOverSound);
soundManager.loadSound('deleting', deletingSound);
soundManager.loadSound('level-up', levelUpSound);

let previousLevel = gameState.level;

gameState.subscribe(() => {
  if (gameState.level > previousLevel) {
    previousLevel = gameState.level;
    soundManager.playSound('level-up');
  }
});

function updateMuteButton() {
  muteButton.innerText = soundManager.isMuted ? '🔇' : '🔊';
}

function updateButtons() {
  if (gameState.status === GameStatus.GameOver) {
    pauseButton.style.display = 'none';
    startButton.style.display = 'inherit';
  }
  if (gameState.status === GameStatus.Running) {
    pauseButton.style.display = 'inherit';
    pauseButton.innerText = 'Pause';
  }
  if (gameState.status === GameStatus.Paused) {
    pauseButton.style.display = 'inherit';
    pauseButton.innerText = 'Resume';
  }
}

gameState.subscribe(updateButtons);

function handleMuteClick() {
  soundManager.toggleMute();
  updateMuteButton();
  muteButton.blur();
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    game.togglePause();
  }

  if (gameState.status !== GameStatus.Running) return;

  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    game.moveCurrentTetromino(e.key === 'ArrowLeft' ? 'left' : 'right');
  }

  if (e.key === 'ArrowUp') {
    game.rotateCurrentTetromino();
  }

  if (e.key === 'ArrowDown') {
    game.softDrop();
  }

  if (e.key === ' ') {
    game.hardDrop();
  }
}

function handlePauseClick() {
  game.togglePause();
}

document.addEventListener('keydown', handleKeydown);
pauseButton.addEventListener('click', handlePauseClick);
muteButton.addEventListener('click', handleMuteClick);

startButton.addEventListener('click', () => {
  game.start();
  startButton.style.display = 'none';
  pauseButton.style.display = 'inherit';
});

updateMuteButton();
