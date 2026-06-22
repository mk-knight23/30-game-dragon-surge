import { GAME_CONSTANTS } from '@/utils/constants'
import { speedForScore, spawnChanceForScore } from './difficulty'

/**
 * Pure, framework-free game engine for the endless runner.
 *
 * All state lives in a plain object and is advanced one frame at a time via
 * `step()`. Randomness and collision events are injected/returned so the
 * engine is fully deterministic and unit-testable without a canvas or DOM.
 */

export type PowerUpType = 'shield' | 'magnet'

export interface Obstacle {
  x: number
  width: number
  height: number
  warning: boolean
  scored: boolean
}

export interface Coin {
  x: number
  y: number
  value: number
  collected: boolean
}

export interface PowerUp {
  x: number
  y: number
  type: PowerUpType
  collected: boolean
}

export interface Player {
  y: number
  velocity: number
  width: number
  height: number
  isJumping: boolean
  jumpCount: number
}

export interface GameState {
  player: Player
  obstacles: Obstacle[]
  coins: Coin[]
  powerUps: PowerUp[]
  score: number
  speed: number
  /** Frames remaining of active shield, 0 when inactive. */
  shieldFrames: number
  /** Frames remaining of active coin magnet, 0 when inactive. */
  magnetFrames: number
}

/** Events emitted by a single `step()` for the renderer/audio to react to. */
export interface StepEvents {
  collisions: number
  coinsCollected: Coin[]
  powerUpsCollected: PowerUp[]
  nearMisses: number
  shieldBlocked: boolean
}

export const ENGINE = {
  GROUND_Y: GAME_CONSTANTS.GROUND_Y,
  PLAYER_X: 100,
  GRAVITY: GAME_CONSTANTS.GRAVITY,
  FIRST_JUMP_VELOCITY: 15,
  DOUBLE_JUMP_VELOCITY: 12,
  MAX_JUMPS: 2,
  SPAWN_X: 850,
  WARNING_CLEAR_X: 780,
  POWERUP_DURATION_FRAMES: 360, // ~6s at 60fps
  MAGNET_RADIUS: 180,
  MAGNET_PULL: 6,
  COIN_VALUE: 50,
  NEAR_MISS_GAP: 14,
} as const

export function createInitialState(): GameState {
  return {
    player: {
      y: 0,
      velocity: 0,
      width: GAME_CONSTANTS.PLAYER_WIDTH,
      height: GAME_CONSTANTS.PLAYER_HEIGHT,
      isJumping: false,
      jumpCount: 0,
    },
    obstacles: [],
    coins: [],
    powerUps: [],
    score: 0,
    speed: GAME_CONSTANTS.INITIAL_SPEED,
    shieldFrames: 0,
    magnetFrames: 0,
  }
}

/**
 * Apply a jump to the player. Supports ground jump + one double jump.
 * Returns true if the jump was performed.
 */
export function jump(player: Player): boolean {
  const canDouble = player.jumpCount < ENGINE.MAX_JUMPS
  if (!player.isJumping) {
    player.isJumping = true
    player.jumpCount = 1
    player.velocity = ENGINE.FIRST_JUMP_VELOCITY
    return true
  }
  if (canDouble) {
    player.jumpCount += 1
    player.velocity = ENGINE.DOUBLE_JUMP_VELOCITY
    return true
  }
  return false
}

/** Axis-aligned bounding-box overlap test in canvas screen-space. */
export function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

/** Player bounding box in screen-space (top-left origin). */
function playerBox(player: Player) {
  const top = ENGINE.GROUND_Y - player.y - player.height
  return { x: ENGINE.PLAYER_X, y: top, w: player.width, h: player.height }
}

/**
 * Detect collision between the player and an obstacle. Obstacles sit on the
 * ground; collision happens when the player overlaps horizontally and has not
 * cleared the obstacle height.
 */
export function collidesWithObstacle(player: Player, obs: Obstacle): boolean {
  if (obs.warning) return false
  const p = playerBox(player)
  const obsTop = ENGINE.GROUND_Y - obs.height
  return rectsOverlap(p.x, p.y, p.w, p.h, obs.x, obsTop, obs.width, obs.height)
}

/**
 * Advance the simulation one frame.
 *
 * @param state  mutable game state (mutated in place for perf; callers that
 *               need immutability should clone before calling)
 * @param rng    deterministic random source returning [0,1)
 */
export function step(state: GameState, rng: () => number = Math.random): StepEvents {
  const events: StepEvents = {
    collisions: 0,
    coinsCollected: [],
    powerUpsCollected: [],
    nearMisses: 0,
    shieldBlocked: false,
  }

  const { player } = state

  // --- Difficulty ramp ---
  state.speed = speedForScore(state.score)

  // --- Player physics ---
  player.y += player.velocity
  player.velocity -= ENGINE.GRAVITY
  if (player.y <= 0) {
    player.y = 0
    player.velocity = 0
    player.isJumping = false
    player.jumpCount = 0
  }

  // --- Power-up timers ---
  if (state.shieldFrames > 0) state.shieldFrames -= 1
  if (state.magnetFrames > 0) state.magnetFrames -= 1

  // --- Spawning ---
  if (rng() < spawnChanceForScore(state.score)) {
    const height = 30 + rng() * 40
    const width = 30 + rng() * 30
    state.obstacles.push({ x: ENGINE.SPAWN_X, width, height, warning: true, scored: false })

    if (rng() < 0.4) {
      state.coins.push({
        x: ENGINE.SPAWN_X + width / 2,
        y: height + 40 + rng() * 60,
        value: ENGINE.COIN_VALUE,
        collected: false,
      })
    }
    // Rarer power-up spawn.
    if (rng() < 0.08) {
      state.powerUps.push({
        x: ENGINE.SPAWN_X,
        y: height + 70 + rng() * 50,
        type: rng() < 0.5 ? 'shield' : 'magnet',
        collected: false,
      })
    }
  }

  // --- Obstacles ---
  for (const obs of state.obstacles) {
    obs.x -= state.speed
    if (obs.warning && obs.x < ENGINE.WARNING_CLEAR_X) obs.warning = false

    if (collidesWithObstacle(player, obs)) {
      if (state.shieldFrames > 0) {
        state.shieldFrames = 0
        events.shieldBlocked = true
        obs.warning = true // neutralize so it doesn't re-trigger this frame
        obs.x = -200 // push off-screen for cleanup
      } else {
        events.collisions += 1
        obs.x = -200
      }
    } else if (
      !obs.warning && !obs.scored &&
      obs.x + obs.width < ENGINE.PLAYER_X
    ) {
      // Cleared an obstacle: count a near-miss if the jump was tight.
      obs.scored = true
      const clearance = player.y - obs.height
      if (clearance >= 0 && clearance <= ENGINE.NEAR_MISS_GAP) {
        events.nearMisses += 1
      }
    }
  }
  state.obstacles = state.obstacles.filter((o) => o.x > -100)

  // --- Coins (with magnet pull) ---
  const magnetActive = state.magnetFrames > 0
  const p = playerBox(player)
  const playerCx = p.x + p.w / 2
  const playerCy = p.y + p.h / 2

  for (const coin of state.coins) {
    if (coin.collected) continue
    coin.x -= state.speed

    const coinCy = ENGINE.GROUND_Y - coin.y
    if (magnetActive) {
      const dx = playerCx - coin.x
      const dy = playerCy - coinCy
      const dist = Math.hypot(dx, dy)
      if (dist < ENGINE.MAGNET_RADIUS && dist > 0) {
        coin.x += (dx / dist) * ENGINE.MAGNET_PULL
        coin.y -= (dy / dist) * ENGINE.MAGNET_PULL
      }
    }

    const coinBottom = ENGINE.GROUND_Y - coin.y
    if (rectsOverlap(p.x, p.y, p.w, p.h, coin.x - 15, coinBottom - 20, 30, 20)) {
      coin.collected = true
      state.score += coin.value
      events.coinsCollected.push(coin)
    }
  }
  state.coins = state.coins.filter((c) => c.x > -50 && !c.collected)

  // --- Power-ups ---
  for (const pu of state.powerUps) {
    if (pu.collected) continue
    pu.x -= state.speed
    const puBottom = ENGINE.GROUND_Y - pu.y
    if (rectsOverlap(p.x, p.y, p.w, p.h, pu.x - 18, puBottom - 18, 36, 36)) {
      pu.collected = true
      if (pu.type === 'shield') state.shieldFrames = ENGINE.POWERUP_DURATION_FRAMES
      else state.magnetFrames = ENGINE.POWERUP_DURATION_FRAMES
      events.powerUpsCollected.push(pu)
    }
  }
  state.powerUps = state.powerUps.filter((pu) => pu.x > -50 && !pu.collected)

  // --- Distance score ---
  state.score += 1

  return events
}
