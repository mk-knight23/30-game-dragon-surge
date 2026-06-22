import { GAME_CONSTANTS } from '@/utils/constants'

/**
 * Difficulty ramp. Speed and obstacle spawn frequency grow with score,
 * following a fair curve: fast early gains that flatten via a soft cap so
 * the game stays playable at high scores.
 */

export const DIFFICULTY = {
  /** Score at which difficulty is considered "ramped" for curve shaping. */
  RAMP_SCORE: 4000,
  /** Lowest per-frame obstacle spawn probability (start of run). */
  MIN_SPAWN_CHANCE: 0.012,
  /** Highest per-frame obstacle spawn probability (late run). */
  MAX_SPAWN_CHANCE: 0.045,
} as const

/**
 * Returns scroll speed for a given score. Uses a smooth curve that rises
 * quickly at first then approaches MAX_SPEED asymptotically (fair, never
 * jumps abruptly).
 */
export function speedForScore(score: number): number {
  const { INITIAL_SPEED, MAX_SPEED } = GAME_CONSTANTS
  const clamped = Math.max(0, score)
  // Diminishing-returns curve: progress in [0,1) approaching 1.
  const progress = clamped / (clamped + DIFFICULTY.RAMP_SCORE)
  const speed = INITIAL_SPEED + (MAX_SPEED - INITIAL_SPEED) * progress
  return Math.min(MAX_SPEED, speed)
}

/**
 * Per-frame probability of spawning an obstacle, scaling with score on the
 * same diminishing-returns curve between MIN and MAX spawn chance.
 */
export function spawnChanceForScore(score: number): number {
  const { MIN_SPAWN_CHANCE, MAX_SPAWN_CHANCE, RAMP_SCORE } = DIFFICULTY
  const clamped = Math.max(0, score)
  const progress = clamped / (clamped + RAMP_SCORE)
  return MIN_SPAWN_CHANCE + (MAX_SPAWN_CHANCE - MIN_SPAWN_CHANCE) * progress
}

/** Level derived from score (1-based), one level per 1000m. */
export function levelForScore(score: number): number {
  return Math.floor(Math.max(0, score) / 1000) + 1
}
