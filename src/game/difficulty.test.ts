import { describe, it, expect } from 'vitest'
import { speedForScore, spawnChanceForScore, levelForScore, DIFFICULTY } from './difficulty'
import { GAME_CONSTANTS } from '@/utils/constants'

describe('speedForScore', () => {
  it('starts at INITIAL_SPEED at score 0', () => {
    expect(speedForScore(0)).toBe(GAME_CONSTANTS.INITIAL_SPEED)
  })

  it('is monotonically increasing', () => {
    let prev = speedForScore(0)
    for (let score = 100; score <= 20000; score += 500) {
      const next = speedForScore(score)
      expect(next).toBeGreaterThanOrEqual(prev)
      prev = next
    }
  })

  it('never exceeds MAX_SPEED', () => {
    expect(speedForScore(10_000_000)).toBeLessThanOrEqual(GAME_CONSTANTS.MAX_SPEED)
  })
})

describe('spawnChanceForScore', () => {
  it('begins at MIN_SPAWN_CHANCE', () => {
    expect(spawnChanceForScore(0)).toBeCloseTo(DIFFICULTY.MIN_SPAWN_CHANCE, 5)
  })

  it('increases with score and stays below MAX_SPAWN_CHANCE', () => {
    const low = spawnChanceForScore(500)
    const high = spawnChanceForScore(10000)
    expect(high).toBeGreaterThan(low)
    expect(high).toBeLessThanOrEqual(DIFFICULTY.MAX_SPAWN_CHANCE)
  })
})

describe('levelForScore', () => {
  it('is level 1 below 1000m and increments each 1000m', () => {
    expect(levelForScore(0)).toBe(1)
    expect(levelForScore(999)).toBe(1)
    expect(levelForScore(1000)).toBe(2)
    expect(levelForScore(3500)).toBe(4)
  })
})
