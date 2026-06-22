<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { useAudio } from '@/composables/useAudio'
import {
  Trophy,
  Zap,
  Activity,
  ChevronUp,
  Settings,
  Shield,
  Magnet,
} from 'lucide-vue-next'
import SettingsPanel from '@/components/ui/SettingsPanel.vue'
import {
  createInitialState,
  jump as engineJump,
  step as engineStep,
  ENGINE,
  type GameState,
} from '@/game/engine'

const gameStore = useGameStore()
const settingsStore = useSettingsStore()
useKeyboardControls()
const audio = useAudio()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const CANVAS_W = 800
const CANVAS_H = 400

// Authoritative game state lives in the pure engine.
let state: GameState = createInitialState()

// Render-only state.
const playerTrail = ref<Array<{ y: number; alpha: number }>>([])
const scorePopups = ref<Array<{ x: number; y: number; value: number; life: number }>>([])
const particles = ref<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([])
// Parallax layers: far -> near. speedFactor scales with engine scroll speed.
const parallax = ref([
  { offset: 0, speedFactor: 0.15 },
  { offset: 0, speedFactor: 0.4 },
  { offset: 0, speedFactor: 0.85 },
])
const coinRotation = ref(0)

const shieldActive = computed(() => state.shieldFrames > 0)
const magnetActive = computed(() => state.magnetFrames > 0)
const shieldOn = ref(false)
const magnetOn = ref(false)

let animationId: number | null = null

const isMobile = ref(false)
const showSettings = ref(false)
const showHelp = ref(false)

const backgroundClass = computed(() => {
  if (gameStore.isGameOver) return 'bg-red-950/20'
  if (gameStore.isPaused) return 'bg-amber-950/20'
  return 'bg-obsidian'
})

function handleResize(): void {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  handleResize()
  settingsStore.initializeTheme()
  audio.initializeSounds()

  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    draw()
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  stopGame()
})

watch(() => gameStore.status, (newStatus) => {
  if (newStatus === 'playing') {
    startGame()
  } else {
    stopGame()
  }
})

function jump(): void {
  if (gameStore.status !== 'playing') return
  if (engineJump(state.player)) {
    audio.playJump()
  }
}

function startGame(): void {
  audio.playStart()
  gameStore.startGame()
  state = createInitialState()
  playerTrail.value = []
  scorePopups.value = []
  particles.value = []
  if (animationId === null) gameLoop()
}

function stopGame(): void {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

function spawnBurst(x: number, y: number, color: string, count = 10): void {
  if (!settingsStore.settings.showParticles) return
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1 + Math.random() * 3
    particles.value.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      color,
    })
  }
}

function gameLoop(): void {
  if (gameStore.status !== 'playing') {
    animationId = null
    return
  }

  const events = engineStep(state)

  // Sync store (score is engine-authoritative).
  gameStore.setScore(state.score)
  shieldOn.value = shieldActive.value
  magnetOn.value = magnetActive.value

  // Parallax offsets scale with current scroll speed.
  parallax.value.forEach((layer) => {
    layer.offset = (layer.offset - state.speed * layer.speedFactor) % CANVAS_W
  })

  // Player trail.
  if (state.player.y > 5 || state.player.isJumping) {
    playerTrail.value.unshift({ y: state.player.y, alpha: 0.6 })
    if (playerTrail.value.length > 5) playerTrail.value.pop()
  }

  // React to engine events.
  if (events.collisions > 0) {
    audio.playCrash()
    gameStore.loseLife()
    if (gameStore.lives <= 0) {
      audio.playGameOver()
      stopGame()
      return
    }
  }
  if (events.shieldBlocked) {
    spawnBurst(ENGINE.PLAYER_X + state.player.width / 2, ENGINE.GROUND_Y - state.player.y - 30, '#00F3FF', 18)
  }
  for (const coin of events.coinsCollected) {
    const cy = ENGINE.GROUND_Y - coin.y
    scorePopups.value.push({ x: coin.x, y: cy - 20, value: coin.value, life: 1 })
    spawnBurst(coin.x, cy, '#E6FB04', 12)
  }
  for (const pu of events.powerUpsCollected) {
    spawnBurst(pu.x, ENGINE.GROUND_Y - pu.y, pu.type === 'shield' ? '#00F3FF' : '#FF4DD8', 16)
  }
  if (events.nearMisses > 0) {
    spawnBurst(ENGINE.PLAYER_X + state.player.width, ENGINE.GROUND_Y - state.player.y - 20, '#FF4D00', 8)
  }

  // Milestone popups every 100m.
  if (state.score > 0 && state.score % 100 === 0) {
    scorePopups.value.push({
      x: ENGINE.PLAYER_X + state.player.width / 2,
      y: ENGINE.GROUND_Y - state.player.y - 80,
      value: 100,
      life: 1,
    })
  }

  // Update render-only effects.
  coinRotation.value += 0.1
  scorePopups.value = scorePopups.value.filter((p) => {
    p.y -= 1
    p.life -= 0.02
    return p.life > 0
  })
  particles.value = particles.value.filter((p) => {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15
    p.life -= 0.03
    return p.life > 0
  })

  draw()
  animationId = requestAnimationFrame(gameLoop)
}

function draw(): void {
  if (!ctx || !canvasRef.value) return
  const canvas = canvasRef.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const groundY = ENGINE.GROUND_Y

  // --- Parallax background layers (far to near) ---
  drawParallax(ctx, canvas, groundY)

  // Ground.
  ctx.fillStyle = '#0F0F1A'
  ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY)
  ctx.strokeStyle = '#FF4D00'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(canvas.width, groundY)
  ctx.stroke()

  // Player trail.
  playerTrail.value.forEach((trail, index) => {
    const scale = 1 - index * 0.15
    const offsetX = (state.player.width * (1 - scale)) / 2
    ctx!.globalAlpha = trail.alpha * 0.5
    ctx!.fillStyle = '#00F3FF'
    ctx!.shadowColor = '#00F3FF'
    ctx!.shadowBlur = 15
    ctx!.fillRect(
      ENGINE.PLAYER_X + offsetX,
      groundY - trail.y - state.player.height * scale,
      state.player.width * scale,
      state.player.height * scale,
    )
    trail.alpha -= 0.05
  })
  playerTrail.value = playerTrail.value.filter((t) => t.alpha > 0)

  // Player.
  ctx.globalAlpha = 1
  ctx.fillStyle = '#00F3FF'
  ctx.shadowColor = '#00F3FF'
  ctx.shadowBlur = 20
  const px = ENGINE.PLAYER_X
  const py = groundY - state.player.y - state.player.height
  ctx.fillRect(px, py, state.player.width, state.player.height)
  ctx.shadowBlur = 0

  // Shield aura.
  if (state.shieldFrames > 0) {
    ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 120) * 0.2
    ctx.strokeStyle = '#00F3FF'
    ctx.lineWidth = 3
    ctx.shadowColor = '#00F3FF'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.arc(px + state.player.width / 2, py + state.player.height / 2, state.player.width, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }

  // Obstacles.
  state.obstacles.forEach((obs) => {
    if (obs.warning) {
      const alpha = 0.4 + Math.sin(Date.now() / 100) * 0.3
      ctx!.globalAlpha = alpha
      ctx!.fillStyle = '#FF4D00'
      ctx!.shadowColor = '#FF4D00'
      ctx!.shadowBlur = 20
      ctx!.beginPath()
      ctx!.moveTo(canvas.width - 40, groundY - obs.height - 20)
      ctx!.lineTo(canvas.width - 10, groundY - obs.height / 2)
      ctx!.lineTo(canvas.width - 40, groundY + 10)
      ctx!.closePath()
      ctx!.fill()
      ctx!.globalAlpha = 1
    } else {
      const gradient = ctx!.createLinearGradient(obs.x, groundY - obs.height, obs.x, groundY)
      gradient.addColorStop(0, '#FF4D00')
      gradient.addColorStop(1, '#991b1b')
      ctx!.fillStyle = gradient
      ctx!.shadowColor = '#FF4D00'
      ctx!.shadowBlur = 15
      ctx!.fillRect(obs.x, groundY - obs.height, obs.width, obs.height)
    }
  })
  ctx.shadowBlur = 0

  // Coins.
  state.coins.forEach((coin) => {
    if (coin.collected) return
    const scale = 0.8 + Math.sin(coinRotation.value) * 0.2
    const coinY = groundY - coin.y
    ctx!.fillStyle = '#E6FB04'
    ctx!.shadowColor = '#E6FB04'
    ctx!.shadowBlur = 15
    ctx!.beginPath()
    ctx!.ellipse(coin.x, coinY, 12 * scale, 15, 0, 0, Math.PI * 2)
    ctx!.fill()
    ctx!.shadowBlur = 0
  })

  // Power-ups.
  state.powerUps.forEach((pu) => {
    if (pu.collected) return
    const puY = groundY - pu.y
    const isShield = pu.type === 'shield'
    ctx!.fillStyle = isShield ? '#00F3FF' : '#FF4DD8'
    ctx!.shadowColor = isShield ? '#00F3FF' : '#FF4DD8'
    ctx!.shadowBlur = 20
    ctx!.globalAlpha = 0.7 + Math.sin(Date.now() / 150) * 0.3
    ctx!.beginPath()
    ctx!.arc(pu.x, puY, 16, 0, Math.PI * 2)
    ctx!.fill()
    ctx!.globalAlpha = 1
    ctx!.shadowBlur = 0
    ctx!.fillStyle = '#0F0F1A'
    ctx!.font = '900 16px "Space Mono"'
    ctx!.textAlign = 'center'
    ctx!.textBaseline = 'middle'
    ctx!.fillText(isShield ? 'S' : 'M', pu.x, puY)
    ctx!.textBaseline = 'alphabetic'
  })

  // Particles.
  particles.value.forEach((p) => {
    ctx!.globalAlpha = Math.max(0, p.life)
    ctx!.fillStyle = p.color
    ctx!.shadowColor = p.color
    ctx!.shadowBlur = 8
    ctx!.beginPath()
    ctx!.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2)
    ctx!.fill()
  })
  ctx.globalAlpha = 1
  ctx.shadowBlur = 0

  // Score popups.
  scorePopups.value.forEach((popup) => {
    ctx!.globalAlpha = popup.life
    ctx!.fillStyle = '#00F3FF'
    ctx!.shadowColor = '#00F3FF'
    ctx!.shadowBlur = 10
    ctx!.font = '900 24px "Space Mono"'
    ctx!.textAlign = 'center'
    ctx!.fillText(`+${popup.value}`, popup.x, popup.y)
    ctx!.globalAlpha = 1
  })
  ctx.shadowBlur = 0
}

function drawParallax(c: CanvasRenderingContext2D, canvas: HTMLCanvasElement, groundY: number): void {
  // Layer 0: distant mountains.
  const colors = ['rgba(40, 20, 60, 0.55)', 'rgba(80, 30, 70, 0.6)', 'rgba(120, 40, 50, 0.65)']
  parallax.value.forEach((layer, i) => {
    const baseH = 70 + i * 35
    const peakW = 220 - i * 50
    c.fillStyle = colors[i]
    for (let x = layer.offset - peakW; x < canvas.width + peakW; x += peakW) {
      c.beginPath()
      c.moveTo(x, groundY)
      c.lineTo(x + peakW / 2, groundY - baseH)
      c.lineTo(x + peakW, groundY)
      c.closePath()
      c.fill()
    }
  })

  // Drifting ash/neon particles tied to parallax for extra depth.
  if (settingsStore.settings.showParticles) {
    parallax.value.forEach((layer, i) => {
      c.fillStyle = i % 2 === 0 ? `rgba(255, 77, 0, ${0.12 - i * 0.03})` : `rgba(0, 243, 255, ${0.12 - i * 0.03})`
      for (let x = layer.offset; x < canvas.width; x += 150 * (i + 1)) {
        c.beginPath()
        c.arc(x, groundY - 90 - i * 50, 1 + i, 0, Math.PI * 2)
        c.fill()
      }
    })
  }
}

// Exposed for keyboard composable.
;(globalThis as { handleJump?: () => void }).handleJump = jump
</script>

<template>
  <div
    class="h-screen w-screen flex flex-col overflow-hidden font-sans transition-colors duration-500"
    :class="backgroundClass"
    role="application"
    aria-label="Dragon Surge Game"
  >
    <!-- CRT Scanline Overlay -->
    <div class="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-10">
      <div class="h-full w-full animate-scanline bg-[linear-gradient(to_bottom,transparent_50%,black_50%)] bg-[length:100%_4px]"></div>
    </div>

    <nav class="h-20 lg:h-24 border-b border-magma/20 px-7 lg:px-11 flex items-center justify-between relative z-10 bg-obsidian/80 backdrop-blur-xl">
      <div class="flex items-center space-x-3 text-white">
        <div class="bg-magma p-2 rounded-none rotate-3 shadow-[0_0_20px_#FF4D00]">
          <Zap class="text-white" :size="20" fill="currentColor" />
        </div>
        <h1 class="arcade-title text-3xl lg:text-4xl">
          DRAGON_<span class="text-magma">SURGE</span>
        </h1>
      </div>

      <div class="flex items-center space-x-4 lg:space-x-6 text-white">
        <div class="hidden lg:flex items-center space-x-4">
          <div v-for="i in 3" :key="i"
               class="w-3 h-3 rounded-none transition-all duration-300"
               :class="i <= gameStore.lives ? 'bg-magma shadow-[0_0_10px_#FF4D00]' : 'bg-white/10'">
          </div>
        </div>

        <div class="glass-panel px-4 lg:px-6 py-2 lg:py-2.5 flex items-center space-x-3 lg:space-x-4">
          <Trophy :size="14" class="text-neon-sulphur" />
          <span class="text-[10px] lg:text-xs font-arcade tracking-widest uppercase">BEST: {{ gameStore.highScore }}</span>
        </div>

        <div class="flex gap-1 lg:gap-2">
          <button
            @click="showSettings = true"
            class="p-2 lg:p-3 rounded-none hover:bg-magma/20 transition-colors border border-transparent hover:border-magma"
            aria-label="Open settings"
          >
            <Settings :size="16" class="text-white" />
          </button>
        </div>
      </div>
    </nav>

    <main class="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative z-10">
      <div class="relative glass-panel p-3 lg:p-4 border-2 border-magma/30 shadow-[0_0_100px_rgba(255,77,0,0.1)] w-full max-w-[832px]">
        <canvas
          ref="canvasRef"
          :width="CANVAS_W"
          :height="CANVAS_H"
          class="bg-obsidian/60 border border-white/5 w-full h-auto shadow-inner touch-none select-none cursor-pointer"
          role="img"
          aria-label="Dragon game canvas. Tap or press space to jump."
          @pointerdown.prevent="jump"
        ></canvas>

        <div v-if="gameStore.isIdle"
             class="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/80 backdrop-blur-xl space-y-8">
          <div class="text-center space-y-4 animate-pulse-magma">
            <h2 class="arcade-title">
              READY_TO<br/>SURGE?
            </h2>
            <p class="text-[10px] lg:text-xs font-mono font-black uppercase text-magma tracking-[0.4em]">
              NEURAL_LINK: ESTABLISHED
            </p>
            <p class="text-[10px] lg:text-xs font-mono font-black uppercase text-neon-sulphur tracking-[0.3em]">
              BEST: {{ gameStore.highScore }}m
            </p>
          </div>
          <button
            @click="startGame"
            class="btn-arcade text-dragon-cyan border-dragon-cyan hover:bg-dragon-cyan/10"
            autofocus
          >
            [ INITIATE_RUN ]
          </button>
          <p class="text-[8px] lg:text-[10px] font-mono uppercase text-bone/40 tracking-widest text-center">
            TAP / CLICK / SPACE TO JUMP &middot; DOUBLE-JUMP IN AIR
          </p>
        </div>

        <div v-if="gameStore.isPaused"
             class="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/90 backdrop-blur-xl space-y-6">
          <h2 class="arcade-title text-magma animate-glitch">SYSTEM_PAUSED</h2>
          <button
            @click="gameStore.pauseGame()"
            class="btn-arcade text-bone border-bone hover:bg-white/10"
          >
            RESUME_THREAD
          </button>
        </div>

        <div v-if="gameStore.isGameOver"
             class="absolute inset-0 flex flex-col items-center justify-center bg-obsidian/95 backdrop-blur-2xl space-y-8">
          <div class="text-center space-y-4">
            <h2 class="arcade-title text-magma animate-glitch">DATA_FRACTURED</h2>
            <p class="text-xs lg:text-sm font-mono font-black uppercase text-bone tracking-widest">
              TELEMETRY_TERMINATED: {{ gameStore.score }}m
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="glass-panel p-4 border border-dragon-cyan/30">
              <p class="text-[8px] uppercase tracking-widest text-dragon-cyan">PEAK</p>
              <p class="text-2xl font-game text-bone">{{ gameStore.highScore }}</p>
            </div>
            <div class="glass-panel p-4 border border-magma/30">
              <p class="text-[8px] uppercase tracking-widest text-magma">LVL</p>
              <p class="text-2xl font-game text-bone">{{ gameStore.level }}</p>
            </div>
          </div>

          <button
            @click="startGame"
            class="btn-arcade text-dragon-cyan border-dragon-cyan hover:bg-dragon-cyan/10 shadow-[0_0_20px_rgba(0,243,255,0.3)]"
          >
            REBOOT_CORE
          </button>
        </div>

        <div v-if="gameStore.isPlaying && settingsStore.settings.showHUD"
             class="absolute top-4 lg:top-8 left-4 lg:left-8 p-4 bg-obsidian/80 backdrop-blur-xl border border-magma/30 flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-magma animate-pulse"></span>
            <span class="text-[8px] font-mono font-black uppercase text-bone/50 tracking-widest">DEPTH_SYNC</span>
          </div>
          <span class="text-3xl font-mono font-black text-bone text-glow-magma">
            {{ String(gameStore.score).padStart(6, '0') }}
          </span>
        </div>

        <!-- Active power-up indicators -->
        <div v-if="gameStore.isPlaying" class="absolute top-4 lg:top-8 right-4 lg:right-8 flex gap-2">
          <div v-if="shieldOn" class="glass-panel p-2 border border-dragon-cyan/50 flex items-center gap-1 text-dragon-cyan animate-pulse" aria-label="Shield active">
            <Shield :size="16" />
          </div>
          <div v-if="magnetOn" class="glass-panel p-2 border border-pink-400/50 flex items-center gap-1 text-pink-400 animate-pulse" aria-label="Coin magnet active">
            <Magnet :size="16" />
          </div>
        </div>
      </div>

      <div v-if="gameStore.isPlaying" class="mt-8 lg:mt-12 md:hidden">
        <button
          @touchstart.prevent="jump"
          @click="jump"
          class="w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-white active:bg-jurassic-glow transition-all pointer-events-auto"
          aria-label="Jump"
        >
          <ChevronUp :size="32" />
        </button>
      </div>
    </main>

    <footer class="h-16 lg:h-20 border-t border-white/5 px-6 lg:px-10 flex items-center justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] lg:tracking-[0.5em] text-slate-700 italic">
      <div class="flex items-center space-x-4 lg:space-x-6">
        <span class="flex items-center gap-2">
          <Activity :size="10" /> Engine: Reactive-Vue
        </span>
        <span class="w-1 h-1 bg-slate-800 rounded-full hidden lg:block"></span>
        <span class="hidden lg:block">Core v2.0-Production</span>
      </div>
      <p>© 2026 Made by MK — Built by Musharraf Kazi</p>
    </footer>

    <SettingsPanel v-model:show="showSettings" v-model:showHelp="showHelp" />
  </div>
</template>
