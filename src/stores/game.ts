import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameStatus } from '@/types'
import { STORAGE_KEYS, GAME_CONSTANTS } from '@/utils/constants'
import { speedForScore, levelForScore } from '@/game/difficulty'

function loadHighScore(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE)
  const parsed = parseInt(raw || '0', 10)
  return Number.isFinite(parsed) ? parsed : 0
}

export const useGameStore = defineStore('game', () => {
  const status = ref<GameStatus>('idle')
  const score = ref(0)
  const highScore = ref(loadHighScore())
  const speed = ref<number>(GAME_CONSTANTS.INITIAL_SPEED)
  const lives = ref<number>(GAME_CONSTANTS.INITIAL_LIVES)
  const level = ref(1)

  // Run history (formerly the redundant gameStore.ts), used by Stats view.
  const scores = ref<number[]>([])
  const gamesPlayed = ref(0)

  const isPlaying = computed(() => status.value === 'playing')
  const isGameOver = computed(() => status.value === 'gameover')
  const isIdle = computed(() => status.value === 'idle')
  const isPaused = computed(() => status.value === 'paused')

  const formattedScore = computed(() => `${score.value}m`)
  const averageScore = computed(() =>
    scores.value.length > 0
      ? Math.round(scores.value.reduce((a, b) => a + b, 0) / scores.value.length)
      : 0,
  )

  function startGame(): void {
    status.value = 'playing'
    score.value = 0
    speed.value = GAME_CONSTANTS.INITIAL_SPEED
    lives.value = GAME_CONSTANTS.INITIAL_LIVES
    level.value = 1
  }

  function pauseGame(): void {
    status.value = status.value === 'paused' ? 'playing' : 'paused'
  }

  function persistHighScore(): void {
    if (score.value > highScore.value) {
      highScore.value = score.value
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.value.toString())
    }
  }

  function gameOver(): void {
    status.value = 'gameover'
    persistHighScore()
    scores.value.push(score.value)
    gamesPlayed.value += 1
  }

  function resetGame(): void {
    status.value = 'idle'
    score.value = 0
    speed.value = GAME_CONSTANTS.INITIAL_SPEED
    lives.value = GAME_CONSTANTS.INITIAL_LIVES
    level.value = 1
  }

  /** Set the absolute score (engine is the source of truth for distance). */
  function setScore(value: number): void {
    score.value = value
    level.value = levelForScore(value)
    speed.value = speedForScore(value)
  }

  function addScore(points: number): void {
    setScore(score.value + points)
  }

  function loseLife(): void {
    lives.value--
    if (lives.value <= 0) {
      gameOver()
    }
  }

  return {
    status,
    score,
    highScore,
    speed,
    lives,
    level,
    scores,
    gamesPlayed,
    isPlaying,
    isGameOver,
    isIdle,
    isPaused,
    formattedScore,
    averageScore,
    startGame,
    pauseGame,
    gameOver,
    resetGame,
    setScore,
    addScore,
    loseLife,
    persistHighScore,
  }
})
