<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useStatsStore } from '@/stores/stats'
import {
  X,
  Volume2,
  Music,
  Layers,
  Monitor,
  Trophy,
  BarChart3,
  RotateCcw,
} from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  showHelp: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:showHelp', value: boolean): void
}>()

const settingsStore = useSettingsStore()
const statsStore = useStatsStore()

const showSettings = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const showHelp = computed({
  get: () => props.showHelp,
  set: (value) => emit('update:showHelp', value),
})

function closeSettings(): void {
  showSettings.value = false
}

function resetStats(): void {
  if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
    statsStore.resetStats()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="showSettings" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closeSettings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div class="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <h2 id="settings-title" class="text-xl font-bold text-white uppercase tracking-wider">
              Settings
            </h2>
            <button 
              @click="closeSettings"
              class="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close settings"
            >
              <X :size="20" class="text-white" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <section aria-labelledby="sound-heading">
              <h3 id="sound-heading" class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Audio
              </h3>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Volume2 :size="18" class="text-slate-400" />
                    <span class="text-white">Sound Effects</span>
                  </div>
                  <button 
                    @click="settingsStore.toggleSound()"
                    class="toggle-neon"
                    :class="settingsStore.settings.soundEnabled ? 'toggle-neon-checked' : 'bg-white/5'"
                    role="switch"
                    :aria-checked="settingsStore.settings.soundEnabled"
                  >
                    <span 
                      class="toggle-neon-thumb"
                      :class="settingsStore.settings.soundEnabled ? 'toggle-neon-thumb-checked' : ''"
                    ></span>
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Music :size="18" class="text-slate-400" />
                    <span class="text-white">Background Music</span>
                  </div>
                  <button 
                    @click="settingsStore.toggleMusic()"
                    class="toggle-neon"
                    :class="settingsStore.settings.musicEnabled ? 'toggle-neon-checked' : 'bg-white/5'"
                    role="switch"
                    :aria-checked="settingsStore.settings.musicEnabled"
                  >
                    <span 
                      class="toggle-neon-thumb"
                      :class="settingsStore.settings.musicEnabled ? 'toggle-neon-thumb-checked' : ''"
                    ></span>
                  </button>
                </div>
              </div>
            </section>

            <section aria-labelledby="game-heading">
              <h3 id="game-heading" class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Gameplay
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-arcade text-dragon-cyan mb-2 tracking-widest uppercase">DIFFICULTY_PROTOCOL</label>
                  <div class="flex gap-2">
                    <button 
                      v-for="diff in ['easy', 'normal', 'hard']" 
                      :key="diff"
                      @click="settingsStore.setDifficulty(diff as 'easy' | 'normal' | 'hard')"
                      class="flex-1 py-3 px-4 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest transition-all border"
                      :class="settingsStore.settings.difficulty === diff 
                        ? 'bg-magma text-white border-magma shadow-[0_0_15px_#FF4D00]' 
                        : 'bg-obsidian text-bone/40 border-white/10 hover:border-magma/50 hover:text-bone'"
                    >
                      {{ diff }}
                    </button>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Layers :size="18" class="text-slate-400" />
                    <span class="text-white">Show Particles</span>
                  </div>
                  <button 
                    @click="settingsStore.toggleParticles()"
                    class="toggle-neon"
                    :class="settingsStore.settings.showParticles ? 'toggle-neon-checked' : 'bg-white/5'"
                    role="switch"
                    :aria-checked="settingsStore.settings.showParticles"
                  >
                    <span 
                      class="toggle-neon-thumb"
                      :class="settingsStore.settings.showParticles ? 'toggle-neon-thumb-checked' : ''"
                    ></span>
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <Monitor :size="18" class="text-slate-400" />
                    <span class="text-white">Show HUD</span>
                  </div>
                  <button 
                    @click="settingsStore.toggleHUD()"
                    class="toggle-neon"
                    :class="settingsStore.settings.showHUD ? 'toggle-neon-checked' : 'bg-white/5'"
                    role="switch"
                    :aria-checked="settingsStore.settings.showHUD"
                  >
                    <span 
                      class="toggle-neon-thumb"
                      :class="settingsStore.settings.showHUD ? 'toggle-neon-thumb-checked' : ''"
                    ></span>
                  </button>
                </div>
              </div>
            </section>

            <section aria-labelledby="stats-heading">
              <h3 id="stats-heading" class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Statistics
              </h3>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="glass-panel p-4 text-center border border-magma/20">
                  <BarChart3 :size="20" class="text-magma mx-auto mb-2" />
                  <p class="text-2xl font-game text-bone">{{ statsStore.stats.totalGames }}</p>
                  <p class="text-[8px] uppercase tracking-widest text-bone/40 font-mono">Runs</p>
                </div>
                
                <div class="glass-panel p-4 text-center border border-neon-sulphur/20">
                  <Trophy :size="20" class="text-neon-sulphur mx-auto mb-2" />
                  <p class="text-2xl font-game text-bone">{{ statsStore.stats.bestScore }}m</p>
                  <p class="text-[8px] uppercase tracking-widest text-bone/40 font-mono">Apex Dist</p>
                </div>
                
                <div class="glass-panel p-4 text-center border border-dragon-cyan/20">
                  <p class="text-2xl font-game text-dragon-cyan">{{ statsStore.stats.averageScore }}m</p>
                  <p class="text-[8px] uppercase tracking-widest text-bone/40 font-mono">Avg Depth</p>
                </div>
                
                <div class="glass-panel p-4 text-center border border-red-500/20">
                  <p class="text-2xl font-game text-red-500">{{ statsStore.stats.totalObstacles }}</p>
                  <p class="text-[8px] uppercase tracking-widest text-bone/40 font-mono">Contacts</p>
                </div>
              </div>

              <button 
                @click="resetStats"
                class="w-full mt-4 py-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw :size="16" />
                Reset Statistics
              </button>
            </section>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div 
        v-if="showHelp" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showHelp = false"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        <div class="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <h2 id="help-title" class="text-xl font-bold text-white uppercase tracking-wider">
              How to Play
            </h2>
            <button 
              @click="showHelp = false"
              class="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close help"
            >
              <X :size="20" class="text-white" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <div class="space-y-4">
              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-jurassic-glow/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-jurassic-glow font-game text-xs">GO</span>
                </div>
                <div>
                  <h4 class="text-white font-bold mb-1">Start Game</h4>
                  <p class="text-slate-400 text-sm">Press Space or click the Execute Run button.</p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-jurassic-leaf/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-jurassic-leaf font-game text-xs">↑</span>
                </div>
                <div>
                  <h4 class="text-white font-bold mb-1">Jump</h4>
                  <p class="text-slate-400 text-sm">Press Up Arrow or W to jump over obstacles.</p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-jurassic-volcano/20 flex items-center justify-center flex-shrink-0">
                  <span class="text-jurassic-volcano font-game text-xs">X</span>
                </div>
                <div>
                  <h4 class="text-white font-bold mb-1">Avoid Obstacles</h4>
                  <p class="text-slate-400 text-sm">Don't hit the red volcanic rocks!</p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy :size="20" class="text-amber-500" />
                </div>
                <div>
                  <h4 class="text-white font-bold mb-1">Score Points</h4>
                  <p class="text-slate-400 text-sm">Run as far as you can to set a new record!</p>
                </div>
              </div>
            </div>

            <div class="glass-panel p-4">
              <h4 class="text-white font-bold mb-3">Keyboard Shortcuts</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Start Game</span>
                  <kbd class="px-2 py-1 bg-white/10 rounded text-white font-mono">Space</kbd>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Jump</span>
                  <kbd class="px-2 py-1 bg-white/10 rounded text-white font-mono">↑ W</kbd>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Pause</span>
                  <kbd class="px-2 py-1 bg-white/10 rounded text-white font-mono">Esc</kbd>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Toggle Sound</span>
                  <kbd class="px-2 py-1 bg-white/10 rounded text-white font-mono">M</kbd>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Toggle Theme</span>
                  <kbd class="px-2 py-1 bg-white/10 rounded text-white font-mono">T</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@reference "../../style.css";
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .glass-panel,
.modal-leave-active .glass-panel {
  transition: transform 0.3s ease;
}

.modal-enter-from .glass-panel,
.modal-leave-to .glass-panel {
  transform: scale(0.95) translateY(20px);
}

.toggle-neon {
  @apply relative inline-flex h-6 w-11 items-center rounded-none transition-colors duration-300;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-neon-checked {
  @apply bg-magma/40 border-magma;
}

.toggle-neon-thumb {
  @apply inline-block h-4 w-4 transform rounded-none bg-bone transition-transform duration-300;
}

.toggle-neon-thumb-checked {
  @apply translate-x-6 bg-magma shadow-[0_0_10px_#FF4D00];
}
</style>
