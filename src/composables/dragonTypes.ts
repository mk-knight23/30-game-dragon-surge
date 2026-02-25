/**
 * Multiple Dragon Types
 * Different dragon species with unique abilities
 */

export type DragonSpecies =
  | 'western' // Classic European dragon
  | 'eastern' // Asian serpent dragon
  | 'wyvern' // Two-legged dragon
  | 'drake' // Wingless dragon
  | 'amphiptere' // Winged serpent
  | 'hydra' // Multi-headed dragon

export interface DragonType {
  id: DragonSpecies
  name: string
  description: string
  abilities: string[]
  stats: {
    health: number
    attack: number
    defense: number
    speed: number
  }
  features: string[]
  unlockLevel: number
}

export const dragonTypes: DragonType[] = [
  {
    id: 'western',
    name: 'Western Dragon',
    description: 'The classic European dragon with four legs and wings',
    abilities: ['Fire Breath', 'Powerful Roar', 'Flight'],
    stats: { health: 100, attack: 100, defense: 100, speed: 100 },
    features: ['four legs', 'large wings', 'scaled armor'],
    unlockLevel: 1
  },
  {
    id: 'eastern',
    name: 'Eastern Dragon',
    description: 'Mystical Asian serpent dragon with magical powers',
    abilities: ['Water Control', 'Wisdom Aura', 'Flight without Wings'],
    stats: { health: 120, attack: 80, defense: 90, speed: 110 },
    features: ['serpentine body', 'antlers', 'mane', 'claws'],
    unlockLevel: 5
  },
  {
    id: 'wyvern',
    name: 'Wyvern',
    description: 'Agile two-legged dragon with venomous sting',
    abilities: ['Poison Sting', 'Aerial Dive', 'Screech'],
    stats: { health: 80, attack: 120, defense: 70, speed: 130 },
    features: ['two legs', 'large wings', 'barbed tail'],
    unlockLevel: 10
  },
  {
    id: 'drake',
    name: 'Drake',
    description: 'Powerful wingless dragon with earth-based abilities',
    abilities: ['Earth Shake', 'Stone Skin', 'Burrow'],
    stats: { health: 150, attack: 90, defense: 140, speed: 60 },
    features: ['four legs', 'no wings', 'stone scales', 'spiked back'],
    unlockLevel: 15
  },
  {
    id: 'amphiptere',
    name: 'Amphiptere',
    description: 'Winged serpent with incredible speed',
    abilities: ['Constrict', 'Hypnotic Gaze', 'Supersonic Flight'],
    stats: { health: 70, attack: 85, defense: 60, speed: 150 },
    features: ['serpentine body', 'feathered wings', 'colorful scales'],
    unlockLevel: 20
  },
  {
    id: 'hydra',
    name: 'Hydra',
    description: 'Multi-headed dragon with regenerative abilities',
    abilities: ['Multiple Heads', 'Regeneration', 'Toxic Blood'],
    stats: { health: 200, attack: 140, defense: 100, speed: 50 },
    features: ['multiple heads', 'regenerating necks', 'toxic aura'],
    unlockLevel: 30
  }
]

export function getDragonType(id: DragonSpecies): DragonType | undefined {
  return dragonTypes.find(t => t.id === id)
}

export function getUnlockedTypes(level: number): DragonType[] {
  return dragonTypes.filter(t => t.unlockLevel <= level)
}

export function getTypeModifier(type: DragonSpecies): { [key: string]: number } {
  const dragon = getDragonType(type)
  if (!dragon) return {}

  return {
    health: dragon.stats.health / 100,
    attack: dragon.stats.attack / 100,
    defense: dragon.stats.defense / 100,
    speed: dragon.stats.speed / 100
  }
}
