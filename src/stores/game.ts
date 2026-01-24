import { defineStore } from 'pinia'

export type GameStatus = 'idle' | 'playing' | 'gameover'

export const useGameStore = defineStore('game', {
  state: () => ({
    status: 'idle' as GameStatus,
    score: 0,
    highScore: parseInt(localStorage.getItem('dragon-highscore') || '0'),
    speed: 5,
    distance: 0,
    isJumping: false,
    isInvincible: false
  }),
  actions: {
    startGame() {
      this.status = 'playing'
      this.score = 0
      this.distance = 0
      this.speed = 5
    },
    incrementScore(val: number) {
      this.score += val
      if (this.score > this.highScore) {
        this.highScore = val
        localStorage.setItem('dragon-highscore', this.highScore.toString())
      }
    },
    gameOver() {
      this.status = 'gameover'
    }
  }
})
