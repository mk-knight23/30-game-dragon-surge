/**
 * Boss Battle System
 * Epic boss encounters with unique mechanics
 */

import { ref, computed } from 'vue'

export interface Boss {
  id: string
  name: string
  title: string
  level: number
  health: number
  maxHealth: number
  attack: number
  defense: number
  specialAttack: SpecialAttack
  rewards: BossRewards
  defeated: boolean
}

export interface SpecialAttack {
  name: string
  description: string
  damage: number
  cooldown: number // milliseconds
  lastUsed: number
  type: 'fire' | 'ice' | 'lightning' | 'poison' | 'ultimate'
}

export interface BossRewards {
  experience: number
  gold: number
  items: string[]
  dragonEvolution?: string
}

export interface BossPhase {
  healthThreshold: number
  attackMultiplier: number
  speedMultiplier: number
  specialAbility: string
}

export class BossBattleSystem {
  private currentBoss = ref<Boss | null>(null)
  private bossPhases = ref<BossPhase[]>([])
  private currentPhase = ref(0)
  private battleStartTime = ref(0)
  private playerHealth = ref(100)
  private bossEnraged = ref(false)

  private bosses: Boss[] = [
    {
      id: 'flame_guardian',
      name: 'Infernus',
      title: 'Flame Guardian',
      level: 10,
      health: 5000,
      maxHealth: 5000,
      attack: 150,
      defense: 50,
      specialAttack: {
        name: 'Magma Eruption',
        description: 'Unleashes devastating fire damage',
        damage: 300,
        cooldown: 15000,
        lastUsed: 0,
        type: 'fire'
      },
      rewards: {
        experience: 1000,
        gold: 500,
        items: ['Fire Scale', 'Magma Core'],
        dragonEvolution: 'fire_dragon'
      },
      defeated: false
    },
    {
      id: 'frost_queen',
      name: 'Cryos',
      title: 'Frost Queen',
      level: 20,
      health: 10000,
      maxHealth: 10000,
      attack: 200,
      defense: 80,
      specialAttack: {
        name: 'Absolute Zero',
        description: 'Freezes everything in range',
        damage: 400,
        cooldown: 20000,
        lastUsed: 0,
        type: 'ice'
      },
      rewards: {
        experience: 2500,
        gold: 1000,
        items: ['Ice Crystal', 'Frost Heart'],
        dragonEvolution: 'ice_dragon'
      },
      defeated: false
    },
    {
      id: 'thlord_king',
      name: 'Voltarus',
      title: 'Thunder Lord',
      level: 30,
      health: 15000,
      maxHealth: 15000,
      attack: 250,
      defense: 100,
      specialAttack: {
        name: 'Lightning Storm',
        description: 'Calls down devastating lightning',
        damage: 500,
        cooldown: 18000,
        lastUsed: 0,
        type: 'lightning'
      },
      rewards: {
        experience: 5000,
        gold: 2000,
        items: ['Thunder Scale', 'Lightning Essence'],
        dragonEvolution: 'lightning_dragon'
      },
      defeated: false
    },
    {
      id: 'shadow_emperor',
      name: 'Umbra',
      title: 'Shadow Emperor',
      level: 40,
      health: 25000,
      maxHealth: 25000,
      attack: 300,
      defense: 120,
      specialAttack: {
        name: 'Void Devourer',
        description: 'Consumes all light and life',
        damage: 700,
        cooldown: 25000,
        lastUsed: 0,
        type: 'ultimate'
      },
      rewards: {
        experience: 10000,
        gold: 5000,
        items: ['Shadow Fragment', 'Void Core'],
        dragonEvolution: 'shadow_dragon'
      },
      defeated: false
    },
    {
      id: 'dragon_god',
      name: 'Draconis',
      title: 'Ancient Dragon God',
      level: 50,
      health: 50000,
      maxHealth: 50000,
      attack: 400,
      defense: 150,
      specialAttack: {
        name: 'World Ender',
        description: 'Ultimate destruction',
        damage: 1000,
        cooldown: 30000,
        lastUsed: 0,
        type: 'ultimate'
      },
      rewards: {
        experience: 25000,
        gold: 10000,
        items: ['Dragon God Scale', 'Divine Essence'],
        dragonEvolution: 'divine_dragon'
      },
      defeated: false
    }
  ]

  /**
   * Start a boss battle
   */
  startBattle(bossId: string): boolean {
    const boss = this.bosses.find(b => b.id === bossId)
    if (!boss) return false

    this.currentBoss.value = { ...boss }
    this.battleStartTime.value = Date.now()
    this.playerHealth.value = 100
    this.currentPhase.value = 0
    this.bossEnraged.value = false

    // Initialize boss phases
    this.bossPhases.value = [
      { healthThreshold: 1.0, attackMultiplier: 1, speedMultiplier: 1, specialAbility: 'normal' },
      { healthThreshold: 0.7, attackMultiplier: 1.3, speedMultiplier: 1.2, specialAbility: 'aggressive' },
      { healthThreshold: 0.4, attackMultiplier: 1.6, speedMultiplier: 1.5, specialAbility: 'enraged' },
      { healthThreshold: 0.1, attackMultiplier: 2, speedMultiplier: 2, specialAbility: 'desperate' }
    ]

    return true
  }

  /**
   * Player attacks boss
   */
  playerAttack(damage: number): number {
    if (!this.currentBoss.value) return 0

    const boss = this.currentBoss.value
    const actualDamage = Math.max(1, damage - boss.defense * 0.5)
    boss.health = Math.max(0, boss.health - actualDamage)

    // Check for phase change
    this.checkPhaseChange()

    return actualDamage
  }

  /**
   * Boss attacks player
   */
  bossAttack(): number {
    if (!this.currentBoss.value) return 0

    const boss = this.currentBoss.value
    const phase = this.bossPhases.value[this.currentPhase.value]
    const actualDamage = Math.max(1, boss.attack * phase.attackMultiplier)

    this.playerHealth.value = Math.max(0, this.playerHealth.value - actualDamage)

    return Math.round(actualDamage)
  }

  /**
   * Use special attack
   */
  useSpecialAttack(): number {
    if (!this.currentBoss.value) return 0

    const boss = this.currentBoss.value
    const now = Date.now()

    if (now - boss.specialAttack.lastUsed < boss.specialAttack.cooldown) {
      return 0 // Cooldown not ready
    }

    boss.specialAttack.lastUsed = now
    const phase = this.bossPhases.value[this.currentPhase.value]
    const damage = boss.specialAttack.damage * phase.attackMultiplier

    this.playerHealth.value = Math.max(0, this.playerHealth.value - damage)

    return Math.round(damage)
  }

  /**
   * Check and update boss phase
   */
  private checkPhaseChange(): void {
    if (!this.currentBoss.value) return

    const boss = this.currentBoss.value
    const healthPercent = boss.health / boss.maxHealth

    for (let i = this.bossPhases.value.length - 1; i >= 0; i--) {
      if (healthPercent <= this.bossPhases.value[i].healthThreshold) {
        if (i > this.currentPhase.value) {
          this.currentPhase.value = i
          this.bossEnraged.value = i >= 2
        }
        break
      }
    }
  }

  /**
   * Check if boss is defeated
   */
  isBossDefeated(): boolean {
    return this.currentBoss.value?.health === 0
  }

  /**
   * Check if player is defeated
   */
  isPlayerDefeated(): boolean {
    return this.playerHealth.value === 0
  }

  /**
   * End battle and give rewards
   */
  endBattle(victory: boolean): BossRewards | null {
    if (!this.currentBoss.value) return null

    const boss = this.currentBoss.value

    if (victory) {
      // Mark boss as defeated
      const bossIndex = this.bosses.findIndex(b => b.id === boss.id)
      if (bossIndex !== -1) {
        this.bosses[bossIndex].defeated = true
      }

      const rewards = { ...boss.rewards }
      this.currentBoss.value = null
      return rewards
    }

    this.currentBoss.value = null
    return null
  }

  /**
   * Get all available bosses
   */
  getBosses(): Boss[] {
    return this.bosses.map(b => ({ ...b }))
  }

  /**
   * Get current boss
   */
  getCurrentBoss() {
    return computed(() => this.currentBoss.value)
  }

  /**
   * Get current phase
   */
  getCurrentPhase() {
    return computed(() => this.bossPhases.value[this.currentPhase.value] || null)
  }

  /**
   * Get player health
   */
  getPlayerHealth() {
    return computed(() => this.playerHealth.value)
  }

  /**
   * Get special attack cooldown progress
   */
  getSpecialAttackCooldown(): number {
    if (!this.currentBoss.value) return 0

    const boss = this.currentBoss.value
    const elapsed = Date.now() - boss.specialAttack.lastUsed
    return Math.min(1, elapsed / boss.specialAttack.cooldown)
  }

  /**
   * Get battle duration
   */
  getBattleDuration(): number {
    if (this.battleStartTime.value === 0) return 0
    return Date.now() - this.battleStartTime.value
  }

  /**
   * Check if special attack is ready
   */
  isSpecialAttackReady(): boolean {
    if (!this.currentBoss.value) return false

    const boss = this.currentBoss.value
    return Date.now() - boss.specialAttack.lastUsed >= boss.specialAttack.cooldown
  }

  /**
   * Flee from battle
   */
  fleeBattle(): boolean {
    // 50% chance to flee
    if (Math.random() < 0.5) {
      this.currentBoss.value = null
      return true
    }
    return false
  }

  /**
   * Reset all boss progress
   */
  resetProgress(): void {
    this.bosses.forEach(boss => {
      boss.defeated = false
    })
  }
}

// Singleton instance
let bossBattleInstance: BossBattleSystem | null = null

export function getBossBattleSystem(): BossBattleSystem {
  if (!bossBattleInstance) {
    bossBattleInstance = new BossBattleSystem()
  }
  return bossBattleInstance
}

/**
 * Hook for using boss battles in Vue components
 */
export function useBossBattle() {
  const system = getBossBattleSystem()

  return {
    currentBoss: system.getCurrentBoss(),
    currentPhase: system.getCurrentPhase(),
    playerHealth: system.getPlayerHealth(),

    startBattle: system.startBattle.bind(system),
    playerAttack: system.playerAttack.bind(system),
    bossAttack: system.bossAttack.bind(system),
    useSpecialAttack: system.useSpecialAttack.bind(system),
    isBossDefeated: system.isBossDefeated.bind(system),
    isPlayerDefeated: system.isPlayerDefeated.bind(system),
    endBattle: system.endBattle.bind(system),
    getBosses: system.getBosses.bind(system),
    getSpecialAttackCooldown: system.getSpecialAttackCooldown.bind(system),
    getBattleDuration: system.getBattleDuration.bind(system),
    isSpecialAttackReady: system.isSpecialAttackReady.bind(system),
    fleeBattle: system.fleeBattle.bind(system),
    resetProgress: system.resetProgress.bind(system)
  }
}
