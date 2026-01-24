<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './stores/game'
import { 
  Play, 
  Trophy, 
  Zap,
  Activity,
  Github,
  ChevronUp
} from 'lucide-vue-next'

const store = useGameStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

const player = ref({ y: 0, velocity: 0, width: 60, height: 60 })
const obstacles = ref<any[]>([])
const parallaxOffsets = ref([0, 0, 0, 0])

let animationId: any = null

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    draw()
  }
  window.addEventListener('keydown', handleInput)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleInput)
  cancelAnimationFrame(animationId)
})

function handleInput(e: KeyboardEvent) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    jump()
  }
}

function jump() {
  if (store.status !== 'playing' || player.value.y > 0) return
  player.value.velocity = 15
}

function startGame() {
  store.startGame()
  obstacles.value = []
  player.value.y = 0
  gameLoop()
}

function gameLoop() {
  if (store.status !== 'playing') return

  // Physics
  player.value.y += player.value.velocity
  player.value.velocity -= 0.8 // Gravity
  if (player.value.y <= 0) {
    player.value.y = 0
    player.value.velocity = 0
  }

  // Parallax logic
  parallaxOffsets.value = parallaxOffsets.value.map((o, i) => (o - store.speed * (i + 1) * 0.2) % 800)

  // Obstacle logic
  if (Math.random() < 0.02) {
    obstacles.value.push({ x: 800, width: 40, height: 40 })
  }

  obstacles.value.forEach((obs) => {
    obs.x -= store.speed
    // Collision check
    if (obs.x < 100 + player.value.width && obs.x + obs.width > 100 && 
        player.value.y < obs.height) {
      store.gameOver()
    }
  })

  obstacles.value = obstacles.value.filter(o => o.x > -100)
  
  store.incrementScore(1)
  store.speed += 0.001

  draw()
  animationId = requestAnimationFrame(gameLoop)
}

function draw() {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // Draw Ground
  ctx.fillStyle = '#1e293b'
  ctx.fillRect(0, 350, 800, 50)

  // Draw Player (Neon Green)
  ctx.shadowBlur = 20
  ctx.shadowColor = '#39ff14'
  ctx.fillStyle = '#39ff14'
  ctx.fillRect(100, 350 - player.value.y - player.value.height, player.value.width, player.value.height)

  // Draw Obstacles (Volcano Red)
  ctx.shadowColor = '#ef4444'
  ctx.fillStyle = '#ef4444'
  obstacles.value.forEach(obs => {
    ctx!.fillRect(obs.x, 350 - obs.height, obs.width, obs.height)
  })
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-jurassic-sky overflow-hidden font-sans">
    
    <!-- Parallax Background Layer -->
    <div class="absolute inset-0 z-0">
       <div v-for="(offset, i) in parallaxOffsets" :key="i"
            class="parallax-layer opacity-20"
            :style="{ 
              backgroundPositionX: offset + 'px', 
              backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.1) 95%)',
              backgroundSize: (100 * (i + 1)) + 'px 100%' 
            }">
       </div>
    </div>

    <!-- Top Navigation -->
    <nav class="h-24 border-b border-white/5 px-10 flex items-center justify-between relative z-10 bg-black/20 backdrop-blur-md">
       <div class="flex items-center space-x-3 text-white">
          <div class="bg-amber-500 p-2 rounded-xl rotate-3 shadow-lg shadow-amber-500/20">
             <Zap class="text-black" :size="24" fill="currentColor" />
          </div>
          <h1 class="text-2xl font-display font-black tracking-tighter uppercase italic">Dragon<span class="text-amber-500">Surge</span></h1>
       </div>

       <div class="flex items-center space-x-6 text-white">
          <div class="glass-panel px-6 py-2.5 flex items-center space-x-4">
             <Trophy :size="16" class="text-amber-500" />
             <span class="text-xs font-black tracking-widest uppercase">Apex: {{ store.highScore }}</span>
          </div>
          <a href="https://github.com/mk-knight23/33-Dragon-Game-JS" target="_blank" class="p-3 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
             <Github :size="20" />
          </a>
       </div>
    </nav>

    <main class="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
       
       <div class="relative glass-panel p-4 border-2 border-white/10 shadow-[0_0_100px_rgba(251,191,36,0.05)]">
          <canvas ref="canvasRef" width="800" height="400" class="bg-black/40 rounded-2xl"></canvas>
          
          <!-- HUD Overlays -->
          <div v-if="store.status === 'idle'" class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl space-y-8">
             <div class="text-center space-y-2">
                <h2 class="text-4xl font-display font-black uppercase text-white tracking-tighter leading-none italic">Initiate <br/> Sequence</h2>
                <p class="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Neural Link Stable</p>
             </div>
             <button @click="startGame" class="btn-jurassic border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black pointer-events-auto">
                Execute Run
             </button>
          </div>

          <div v-if="store.status === 'gameover'" class="absolute inset-0 flex flex-col items-center justify-center bg-red-950/60 backdrop-blur-md rounded-2xl space-y-8">
             <div class="text-center space-y-2">
                <h2 class="text-5xl font-display font-black text-red-500 tracking-tighter italic uppercase leading-none">Fractured</h2>
                <p class="text-xs font-black uppercase text-white tracking-widest">Final Data Chunk: {{ store.score }}</p>
             </div>
             <button @click="startGame" class="btn-jurassic border-white text-white hover:bg-white hover:text-black pointer-events-auto">
                Reset Matrix
             </button>
          </div>

          <!-- Score HUD -->
          <div v-if="store.status === 'playing'" class="absolute top-8 left-8 p-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/5 flex flex-col">
             <span class="text-[8px] font-black uppercase text-slate-500 tracking-widest">Signal Depth</span>
             <span class="text-xl font-mono font-black text-amber-500 tracking-tighter">{{ store.score }}m</span>
          </div>
       </div>

       <!-- Mobile Controls Overlay -->
       <div v-if="store.status === 'playing'" class="mt-12 md:hidden">
          <button @touchstart="jump" class="w-24 h-24 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-white active:bg-amber-500 transition-all pointer-events-auto">
             <ChevronUp :size="40" />
          </button>
       </div>

    </main>

    <!-- Footer Stats -->
    <footer class="h-20 border-t border-white/5 px-10 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.5em] text-slate-700 italic">
       <div class="flex items-center space-x-6">
          <span class="flex items-center gap-2"><Activity :size="10" /> Engine: Reactive-Vue</span>
          <span class="w-1 h-1 bg-slate-800 rounded-full"></span>
          <span>Core v2.0-Production</span>
       </div>
       <p>© 2026 Primeval Dynamics.</p>
    </footer>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.font-game {
  font-family: 'Press Start 2P', cursive;
}
canvas {
  image-rendering: pixelated;
}
</style>
