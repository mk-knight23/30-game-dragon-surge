/**
 * Dragon Evolution System
 * Evolve your dragon through stages and forms
 */

import { ref, computed } from 'vue'

export type DragonElement = 'fire' | 'ice' | 'lightning' | 'earth' | 'shadow' | 'divine'

export interface DragonStage {
  name: string
  level: number
  health: number
  attack: number
  defense: number
  speed: number
  abilities: string[]
  appearance: DragonAppearance
}

export interface DragonAppearance {
  size: number
  color: string
  wingSpan: number
  features: string[]
}

export interface EvolutionPath {
  id: string
  name: string
  element: DragonElement
  stages: DragonStage[]
  requirements: EvolutionRequirement[]
}

export interface EvolutionRequirement {
  type: 'level' | 'boss' | 'item' | 'gold' | 'experience'
  value: number | string
  description: string
}

export class DragonEvolutionSystem {
  private currentElement = ref<DragonElement>('fire')
  private currentStage = ref(0)
  private dragonLevel = ref(1)
  private experience = ref(0)
  private unlockedElements = ref<Set<DragonElement>>(new Set(['fire']))

  private evolutionPaths: EvolutionPath[] = [
    {
      id: 'fire_dragon',
      name: 'Fire Dragon',
      element: 'fire',
      stages: [
        {
          name: 'Fire Hatchling',
          level: 1,
          health: 100,
          attack: 20,
          defense: 10,
          speed: 15,
          abilities: ['Ember Breath', 'Heat Aura'],
          appearance: { size: 1, color: '#ff4500', wingSpan: 2, features: ['small flames'] }
        },
        {
          name: 'Flame Drake',
          level: 10,
          health: 500,
          attack: 50,
          defense: 25,
          speed: 30,
          abilities: ['Fire Ball', 'Flame Shield', 'Heat Aura'],
          appearance: { size: 2, color: '#ff6347', wingSpan: 4, features: ['flowing mane', 'glowing eyes'] }
        },
        {
          name: 'Inferno Dragon',
          level: 25,
          health: 1500,
          attack: 100,
          defense: 50,
          speed: 50,
          abilities: ['Inferno Breath', 'Magma Storm', 'Flame Shield', 'Phoenix Rising'],
          appearance: { size: 4, color: '#ff0000', wingSpan: 8, features: ['magma veins', 'burning aura', 'crown of fire'] }
        },
        {
          name: 'Fire God Dragon',
          level: 50,
          health: 5000,
          attack: 200,
          defense: 100,
          speed: 80,
          abilities: ['World Burner', 'Supernova', 'Immortal Flame', 'Phoenix Rebirth', 'Solar Flare'],
          appearance: { size: 8, color: '#ff8c00', wingSpan: 16, features: ['solar corona', 'divine flames', 'ancient runes'] }
        }
      ],
      requirements: [
        { type: 'level', value: 10, description: 'Reach level 10' },
        { type: 'boss', value: 'flame_guardian', description: 'Defeat Infernus' }
      ]
    },
    {
      id: 'ice_dragon',
      name: 'Ice Dragon',
      element: 'ice',
      stages: [
        {
          name: 'Frost Hatchling',
          level: 1,
          health: 120,
          attack: 15,
          defense: 15,
          speed: 20,
          abilities: ['Frost Breath', 'Cold Aura'],
          appearance: { size: 1, color: '#00bfff', wingSpan: 2, features: ['ice crystals'] }
        },
        {
          name: 'Glacial Drake',
          level: 10,
          health: 600,
          attack: 40,
          defense: 40,
          speed: 35,
          abilities: ['Ice Spike', 'Blizzard', 'Cold Aura'],
          appearance: { size: 2, color: '#87ceeb', wingSpan: 4, features: ['frost scales', 'icy breath'] }
        },
        {
          name: 'Absolute Zero Dragon',
          level: 25,
          health: 1800,
          attack: 80,
          defense: 80,
          speed: 60,
          abilities: ['Freezing Breath', 'Ice Age', 'Glacier Shield', 'Crystal Prison'],
          appearance: { size: 4, color: '#e0ffff', wingSpan: 8, features: ['permafrost', 'aurora aura', 'diamond scales'] }
        },
        {
          name: 'Eternal Frost Dragon',
          level: 50,
          health: 6000,
          attack: 150,
          defense: 150,
          speed: 100,
          abilities: ['Absolute Zero', 'Eternal Winter', 'Time Freeze', 'Mirror Image', 'Avalanche'],
          appearance: { size: 8, color: '#f0f8ff', wingSpan: 16, features: ['divine ice', 'frost crown', 'eternal aura'] }
        }
      ],
      requirements: [
        { type: 'level', value: 20, description: 'Reach level 20' },
        { type: 'boss', value: 'frost_queen', description: 'Defeat Cryos' }
      ]
    },
    {
      id: 'lightning_dragon',
      name: 'Lightning Dragon',
      element: 'lightning',
      stages: [
        {
          name: 'Spark Hatchling',
          level: 1,
          health: 90,
          attack: 25,
          defense: 8,
          speed: 25,
          abilities: ['Spark', 'Static Field'],
          appearance: { size: 1, color: '#ffd700', wingSpan: 2, features: ['electric sparks'] }
        },
        {
          name: 'Thunder Drake',
          level: 10,
          health: 450,
          attack: 70,
          defense: 20,
          speed: 50,
          abilities: ['Lightning Bolt', 'Thunder Clap', 'Static Field'],
          appearance: { size: 2, color: '#ffff00', wingSpan: 4, features: ['charged scales', 'electric aura'] }
        },
        {
          name: 'Storm Dragon',
          level: 25,
          health: 1200,
          attack: 120,
          defense: 40,
          speed: 80,
          abilities: ['Chain Lightning', 'Tornado', 'Thunder Storm', 'Speed of Light'],
          appearance: { size: 4, color: '#00ffff', wingSpan: 8, features: ['storm clouds', 'lightning crown', 'thunder wings'] }
        },
        {
          name: 'Celestial Lightning Dragon',
          level: 50,
          health: 4500,
          attack: 250,
          defense: 60,
          speed: 150,
          abilities: ['Divine Thunder', 'Lightning Cascade', 'Teleport', 'Time dilation', 'Storm God'],
          appearance: { size: 8, color: '#e6e6fa', wingSpan: 16, features: ['celestial lightning', 'divine speed', 'thunder halo'] }
        }
      ],
      requirements: [
        { type: 'level', value: 30, description: 'Reach level 30' },
        { type: 'boss', value: 'thlord_king', description: 'Defeat Voltarus' }
      ]
    },
    {
      id: 'shadow_dragon',
      name: 'Shadow Dragon',
      element: 'shadow',
      stages: [
        {
          name: 'Shadow Hatchling',
          level: 1,
          health: 80,
          attack: 30,
          defense: 5,
          speed: 30,
          abilities: ['Shadow Sneak', 'Dark Vision'],
          appearance: { size: 1, color: '#2f2f2f', wingSpan: 2, features: ['dark mist'] }
        },
        {
          name: 'Void Drake',
          level: 10,
          health: 400,
          attack: 80,
          defense: 15,
          speed: 55,
          abilities: ['Shadow Strike', 'Void Walk', 'Dark Vision'],
          appearance: { size: 2, color: '#1a1a1a', wingSpan: 4, features: ['shadow form', 'purple eyes'] }
        },
        {
          name: 'Abyss Dragon',
          level: 25,
          health: 1000,
          attack: 150,
          defense: 30,
          speed: 90,
          abilities: ['Devour Soul', 'Shadow Realm', 'Phase Shift', 'Life Drain'],
          appearance: { size: 4, color: '#0a0a0a', wingSpan: 8, features: ['void aura', 'soul tendrils', 'dark crown'] }
        },
        {
          name: 'Eternal Shadow Dragon',
          level: 50,
          health: 3500,
          attack: 300,
          defense: 50,
          speed: 120,
          abilities: ['Oblivion', 'Eternal Darkness', 'Soul Harvest', 'Dimension Rift', 'Death Incarnate'],
          appearance: { size: 8, color: '#000000', wingSpan: 16, features: ['void god', 'death aura', 'shadow realm'] }
        }
      ],
      requirements: [
        { type: 'level', value: 40, description: 'Reach level 40' },
        { type: 'boss', value: 'shadow_emperor', description: 'Defeat Umbra' }
      ]
    },
    {
      id: 'divine_dragon',
      name: 'Divine Dragon',
      element: 'divine',
      stages: [
        {
          name: 'Blessed Hatchling',
          level: 1,
          health: 150,
          attack: 20,
          defense: 20,
          speed: 20,
          abilities: ['Heal', 'Blessing'],
          appearance: { size: 1, color: '#ffd700', wingSpan: 2, features: ['golden aura'] }
        },
        {
          name: 'Sacred Drake',
          level: 10,
          health: 700,
          attack: 60,
          defense: 60,
          speed: 40,
          abilities: ['Holy Light', 'Divine Shield', 'Heal', 'Blessing'],
          appearance: { size: 2, color: '#fffacd', wingSpan: 4, features: ['golden scales', 'halo'] }
        },
        {
          name: 'Seraph Dragon',
          level: 25,
          health: 2000,
          attack: 100,
          defense: 100,
          speed: 70,
          abilities: ['Divine Judgment', 'Resurrection', 'Holy Sanctuary', 'Purification', 'Blessing'],
          appearance: { size: 4, color: '#fff8dc', wingSpan: 8, features: ['six wings', 'divine light', 'golden crown'] }
        },
        {
          name: 'God Dragon',
          level: 50,
          health: 10000,
          attack: 200,
          defense: 200,
          speed: 100,
          abilities: ['Creation', 'Destruction', 'Eternity', 'Omnipotence', 'Divine Intervention'],
          appearance: { size: 10, color: '#ffffff', wingSpan: 20, features: ['divine form', 'infinite light', 'creator aura'] }
        }
      ],
      requirements: [
        { type: 'level', value: 50, description: 'Reach level 50' },
        { type: 'boss', value: 'dragon_god', description: 'Defeat Draconis' }
      ]
    }
  ]

  /**
   * Add experience
   */
  addExperience(amount: number): void {
    this.experience.value += amount
    this.checkLevelUp()
  }

  /**
   * Check for level up
   */
  private checkLevelUp(): void {
    const expNeeded = this.getExperienceNeeded()
    while (this.experience.value >= expNeeded && this.dragonLevel.value < 50) {
      this.experience.value -= expNeeded
      this.dragonLevel.value++
      this.checkEvolution()
    }
  }

  /**
   * Check if evolution is possible
   */
  private checkEvolution(): void {
    const path = this.getCurrentPath()
    if (!path) return

    for (let i = path.stages.length - 1; i >= 0; i--) {
      if (this.dragonLevel.value >= path.stages[i].level && this.currentStage.value < i) {
        this.currentStage.value = i
        break
      }
    }
  }

  /**
   * Get current dragon stats
   */
  getCurrentStats(): DragonStage | null {
    const path = this.getCurrentPath()
    if (!path) return null

    const stage = path.stages[this.currentStage.value]
    const levelBonus = (this.dragonLevel.value - stage.level) * 0.1

    return {
      ...stage,
      health: Math.round(stage.health * (1 + levelBonus)),
      attack: Math.round(stage.attack * (1 + levelBonus)),
      defense: Math.round(stage.defense * (1 + levelBonus)),
      speed: Math.round(stage.speed * (1 + levelBonus))
    }
  }

  /**
   * Get current evolution path
   */
  getCurrentPath(): EvolutionPath | null {
    return this.evolutionPaths.find(p => p.element === this.currentElement.value) || null
  }

  /**
   * Change dragon element
   */
  changeElement(element: DragonElement): boolean {
    if (!this.unlockedElements.value.has(element)) return false

    this.currentElement.value = element
    this.currentStage.value = 0
    this.checkEvolution()

    return true
  }

  /**
   * Unlock new element
   */
  unlockElement(element: DragonElement): void {
    this.unlockedElements.value.add(element)
  }

  /**
   * Get experience needed for next level
   */
  getExperienceNeeded(): number {
    return this.dragonLevel.value * 100
  }

  /**
   * Get evolution progress
   */
  getEvolutionProgress(): { current: number; max: number; percentage: number } {
    const path = this.getCurrentPath()
    if (!path) return { current: 0, max: 1, percentage: 0 }

    const current = this.currentStage.value
    const max = path.stages.length - 1

    return {
      current,
      max,
      percentage: Math.round((current / max) * 100)
    }
  }

  /**
   * Get all unlocked elements
   */
  getUnlockedElements(): DragonElement[] {
    return Array.from(this.unlockedElements.value)
  }

  /**
   * Get all evolution paths
   */
  getAllPaths(): EvolutionPath[] {
    return this.evolutionPaths.map(p => ({ ...p }))
  }

  /**
   * Get current dragon appearance
   */
  getAppearance(): DragonAppearance | null {
    const stats = this.getCurrentStats()
    return stats?.appearance || null
  }

  /**
   * Get current abilities
   */
  getAbilities(): string[] {
    const stats = this.getCurrentStats()
    return stats?.abilities || []
  }

  /**
   * Reset to starting dragon
   */
  resetDragon(): void {
    this.currentElement.value = 'fire'
    this.currentStage.value = 0
    this.dragonLevel.value = 1
    this.experience.value = 0
    this.unlockedElements.value = new Set(['fire'])
  }
}

// Singleton instance
let evolutionInstance: DragonEvolutionSystem | null = null

export function getDragonEvolutionSystem(): DragonEvolutionSystem {
  if (!evolutionInstance) {
    evolutionInstance = new DragonEvolutionSystem()
  }
  return evolutionInstance
}

/**
 * Hook for using dragon evolution in Vue components
 */
export function useDragonEvolution() {
  const system = getDragonEvolutionSystem()

  return {
    currentStats: computed(() => system.getCurrentStats()),
    currentElement: computed(() => system.currentElement.value),
    dragonLevel: computed(() => system.dragonLevel.value),
    experience: computed(() => system.experience.value),
    evolutionProgress: computed(() => system.getEvolutionProgress()),
    unlockedElements: computed(() => system.getUnlockedElements()),
    appearance: computed(() => system.getAppearance()),
    abilities: computed(() => system.getAbilities()),

    addExperience: system.addExperience.bind(system),
    changeElement: system.changeElement.bind(system),
    unlockElement: system.unlockElement.bind(system),
    getExperienceNeeded: system.getExperienceNeeded.bind(system),
    getAllPaths: system.getAllPaths.bind(system),
    resetDragon: system.resetDragon.bind(system)
  }
}
