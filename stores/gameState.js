// stores/gameState.js
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    entities: {},
    drawables: [],
    score: 0,
    gameOver: false
  }),
  actions: {
    updateState(newState) {
      this.entities = newState.entities;
      this.drawables = newState.drawables;
    },
    addScore(points) {
      this.score += points;
    },
    resetScore() {
      this.score = 0;
    },
    setGameOver(value) {
      this.gameOver = value;
    },
    resetGame() {
      this.entities = {};
      this.drawables = [];
      this.score = 0;
      this.gameOver = false;
    }
  }
});
