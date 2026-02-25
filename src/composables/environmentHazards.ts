/**
 * Environment Hazards
 * Dangerous environmental effects that affect gameplay
 */

export type HazardType =
  | 'lava_pool'
  | 'ice_storm'
  | 'lightning_field'
  | 'poison_cloud'
  | 'earthquake'
  | 'tornado'

export interface Hazard {
  id: string
  type: HazardType
  name: string
  description: string
  damage: number
  effect: HazardEffect
  duration: number // milliseconds
  radius: number
  position: { x: number; y: number }
  active: boolean
}

export interface HazardEffect {
  type: 'damage' | 'slow' | 'stun' | 'dot' | 'pushback' | 'pull'
  value: number
  interval: number // milliseconds
}

export class EnvironmentHazardSystem {
  private hazards = ref<Map<string, Hazard>>(new Map())
  private hazardEffects = ref<Map<string, { effect: HazardEffect; endTime: number }>>(new Map())

  /**
   * Spawn a hazard
   */
  spawnHazard(
    type: HazardType,
    position: { x: number; y: number },
    duration: number = 10000
  ): Hazard {
    const hazard: Hazard = {
      id: this.generateId(),
      type,
      name: this.getHazardName(type),
      description: this.getHazardDescription(type),
      damage: this.getHazardDamage(type),
      effect: this.getHazardEffect(type),
      duration,
      radius: this.getHazardRadius(type),
      position,
      active: true
    }

    this.hazards.value.set(hazard.id, hazard)

    // Auto-remove after duration
    setTimeout(() => {
      this.removeHazard(hazard.id)
    }, duration)

    return hazard
  }

  /**
   * Remove a hazard
   */
  removeHazard(hazardId: string): void {
    this.hazards.value.delete(hazardId)
    this.hazardEffects.value.delete(hazardId)
  }

  /**
   * Check if position is in hazard
   */
  isInHazard(position: { x: number; y: number }): Hazard | null {
    for (const hazard of this.hazards.value.values()) {
      if (!hazard.active) continue

      const distance = Math.sqrt(
        Math.pow(position.x - hazard.position.x, 2) +
        Math.pow(position.y - hazard.position.y, 2)
      )

      if (distance <= hazard.radius) {
        return hazard
      }
    }
    return null
  }

  /**
   * Apply hazard effects to player
   */
  applyHazardEffect(hazard: Hazard, playerHealth: number): number {
    if (!hazard.active) return playerHealth

    // Store effect for continuous damage
    this.hazardEffects.value.set(hazard.id, {
      effect: hazard.effect,
      endTime: Date.now() + hazard.duration
    })

    // Apply immediate damage
    if (hazard.effect.type === 'damage') {
      return Math.max(0, playerHealth - hazard.damage)
    }

    return playerHealth
  }

  /**
   * Update all hazard effects (call every frame)
   */
  updateEffects(playerHealth: number, playerSpeed: number): { health: number; speed: number } {
    let health = playerHealth
    let speed = playerSpeed
    const now = Date.now()

    // Remove expired effects
    for (const [hazardId, effectData] of this.hazardEffects.value.entries()) {
      if (now >= effectData.endTime) {
        this.hazardEffects.value.delete(hazardId)
        continue
      }

      const effect = effectData.effect

      // Apply damage over time
      if (effect.type === 'dot') {
        const interval = effect.interval || 1000
        if (now % interval < 20) { // Approximate check
          health = Math.max(0, health - effect.value)
        }
      }

      // Apply slow
      if (effect.type === 'slow') {
        speed = playerSpeed * (1 - effect.value / 100)
      }
    }

    return { health, speed }
  }

  /**
   * Get all active hazards
   */
  getActiveHazards(): Hazard[] {
    return Array.from(this.hazards.value.values()).filter(h => h.active)
  }

  /**
   * Clear all hazards
   */
  clearAllHazards(): void {
    this.hazards.value.clear()
    this.hazardEffects.value.clear()
  }

  /**
   * Spawn random hazards in area
   */
  spawnRandomHazards(count: number, areaSize: { width: number; height: number }): Hazard[] {
    const types: HazardType[] = ['lava_pool', 'ice_storm', 'lightning_field', 'poison_cloud']
    const spawned: Hazard[] = []

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const position = {
        x: Math.random() * areaSize.width,
        y: Math.random() * areaSize.height
      }

      spawned.push(this.spawnHazard(type, position, 5000 + Math.random() * 10000))
    }

    return spawned
  }

  private getHazardName(type: HazardType): string {
    const names: Record<HazardType, string> = {
      lava_pool: 'Lava Pool',
      ice_storm: 'Ice Storm',
      lightning_field: 'Lightning Field',
      poison_cloud: 'Poison Cloud',
      earthquake: 'Earthquake',
      tornado: 'Tornado'
    }
    return names[type]
  }

  private getHazardDescription(type: HazardType): string {
    const descriptions: Record<HazardType, string> = {
      lava_pool: 'A pool of molten lava that burns anything nearby',
      ice_storm: 'Freezing winds that slow and damage',
      lightning_field: 'Electric field that shocks repeatedly',
      poison_cloud: 'Toxic gas that damages over time',
      earthquake: 'Ground shake that pushes everything around',
      tornado: 'Powerful wind that pulls objects in'
    }
    return descriptions[type]
  }

  private getHazardDamage(type: HazardType): number {
    const damages: Record<HazardType, number> = {
      lava_pool: 50,
      ice_storm: 20,
      lightning_field: 30,
      poison_cloud: 10,
      earthquake: 40,
      tornado: 25
    }
    return damages[type]
  }

  private getHazardEffect(type: HazardType): HazardEffect {
    const effects: Record<HazardType, HazardEffect> = {
      lava_pool: { type: 'damage', value: 50, interval: 0 },
      ice_storm: { type: 'slow', value: 50, interval: 0 },
      lightning_field: { type: 'dot', value: 10, interval: 500 },
      poison_cloud: { type: 'dot', value: 5, interval: 1000 },
      earthquake: { type: 'pushback', value: 100, interval: 0 },
      tornado: { type: 'pull', value: 50, interval: 0 }
    }
    return effects[type]
  }

  private getHazardRadius(type: HazardType): number {
    const radii: Record<HazardType, number> = {
      lava_pool: 80,
      ice_storm: 150,
      lightning_field: 100,
      poison_cloud: 120,
      earthquake: 200,
      tornado: 150
    }
    return radii[type]
  }

  private generateId(): string {
    return `hazard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance
let hazardInstance: EnvironmentHazardSystem | null = null

export function getEnvironmentHazardSystem(): EnvironmentHazardSystem {
  if (!hazardInstance) {
    hazardInstance = new EnvironmentHazardSystem()
  }
  return hazardInstance
}

/**
 * Hook for using hazards in Vue components
 */
export function useEnvironmentHazards() {
  const system = getEnvironmentHazardSystem()

  return {
    activeHazards: system.getActiveHazards.bind(system),
    spawnHazard: system.spawnHazard.bind(system),
    removeHazard: system.removeHazard.bind(system),
    isInHazard: system.isInHazard.bind(system),
    applyHazardEffect: system.applyHazardEffect.bind(system),
    updateEffects: system.updateEffects.bind(system),
    clearAllHazards: system.clearAllHazards.bind(system),
    spawnRandomHazards: system.spawnRandomHazards.bind(system)
  }
}
