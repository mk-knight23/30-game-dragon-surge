/**
 * Story Mode Cutscenes
 * Narrative cutscenes with dialogue and choices
 */

import { ref, computed } from 'vue'

export interface Cutscene {
  id: string
  title: string
  chapter: number
  scenes: Scene[]
  skippable: boolean
  completed: boolean
}

export interface Scene {
  id: string
  type: 'dialogue' | 'action' | 'choice' | 'cinematic'
  background?: string
  music?: string
  content: SceneContent
  transitions?: SceneTransition
}

export type SceneContent =
  | DialogueContent
  | ActionContent
  | ChoiceContent
  | CinematicContent

export interface DialogueContent {
  type: 'dialogue'
  speaker: string
  text: string
  portrait?: string
  mood?: 'neutral' | 'happy' | 'sad' | 'angry' | 'dramatic'
  choices?: Choice[]
}

export interface ActionContent {
  type: 'action'
  description: string
  duration: number
  effects: string[]
}

export interface ChoiceContent {
  type: 'choice'
  question: string
  choices: Choice[]
}

export interface Choice {
  text: string
  consequence?: string
  nextScene?: string
  rewards?: { type: string; value: number }[]
}

export interface CinematicContent {
  type: 'cinematic'
  description: string
  duration: number
  cameraMovement?: string
  effects?: string[]
}

export interface SceneTransition {
  type: 'fade' | 'wipe' | 'dissolve' | 'cut'
  duration: number
}

export interface StoryProgress {
  currentChapter: number
  currentScene: number
  completedChapters: Set<number>
  choices: Map<string, string>
  flags: Map<string, any>
}

export class StoryModeSystem {
  private currentCutscene = ref<Cutscene | null>(null)
  private currentSceneIndex = ref(0)
  private storyProgress = ref<StoryProgress>({
    currentChapter: 1,
    currentScene: 0,
    completedChapters: new Set(),
    choices: new Map(),
    flags: new Map()
  })

  private cutscenes: Cutscene[] = [
    {
      id: 'prologue',
      title: 'The Awakening',
      chapter: 1,
      skippable: true,
      completed: false,
      scenes: [
        {
          id: 'scene_1_1',
          type: 'cinematic',
          content: {
            type: 'cinematic',
            description: 'A young dragon hatches from an ancient egg...',
            duration: 5000,
            cameraMovement: 'zoom in',
            effects: ['light flash', 'screen shake']
          },
          transitions: { type: 'fade', duration: 1000 }
        },
        {
          id: 'scene_1_2',
          type: 'dialogue',
          content: {
            type: 'dialogue',
            speaker: 'Elder Dragon',
            text: 'At long last, the prophecy has come true. A new dragon is born.',
            portrait: 'elder_dragon',
            mood: 'dramatic'
          }
        },
        {
          id: 'scene_1_3',
          type: 'dialogue',
          content: {
            type: 'dialogue',
            speaker: 'Elder Dragon',
            text: 'But the world is in danger. Dark forces gather, and only you can stop them.',
            portrait: 'elder_dragon',
            mood: 'sad'
          }
        },
        {
          id: 'scene_1_4',
          type: 'choice',
          content: {
            type: 'choice',
            question: 'What do you do?',
            choices: [
              {
                text: 'Accept the challenge',
                consequence: 'You begin your journey with courage',
                rewards: [{ type: 'experience', value: 100 }]
              },
              {
                text: 'Ask for guidance',
                consequence: 'The elder teaches you the basics',
                rewards: [{ type: 'gold', value: 50 }]
              },
              {
                text: 'Express doubt',
                consequence: 'The elder encourages you',
                rewards: [{ type: 'health', value: 20 }]
              }
            ]
          }
        }
      ]
    },
    {
      id: 'chapter_2',
      title: 'First Flight',
      chapter: 2,
      skippable: true,
      completed: false,
      scenes: [
        {
          id: 'scene_2_1',
          type: 'action',
          content: {
            type: 'action',
            description: 'You learn to fly for the first time',
            duration: 3000,
            effects: ['wind particles', 'camera follow']
          }
        },
        {
          id: 'scene_2_2',
          type: 'dialogue',
          content: {
            type: 'dialogue',
            speaker: 'Narrator',
            text: 'As you soar through the skies, you sense danger approaching...',
            mood: 'dramatic'
          }
        },
        {
          id: 'scene_2_3',
          type: 'dialogue',
          content: {
            type: 'dialogue',
            speaker: 'Mysterious Voice',
            text: 'Young dragon... you are not welcome here. Leave now, or face my wrath!',
            portrait: 'villain',
            mood: 'angry'
          }
        }
      ]
    },
    {
      id: 'boss_intro',
      title: 'The Flame Guardian',
      chapter: 3,
      skippable: false,
      completed: false,
      scenes: [
        {
          id: 'scene_3_1',
          type: 'cinematic',
          content: {
            type: 'cinematic',
            description: 'A massive dragon emerges from the volcano...',
            duration: 4000,
            cameraMovement: 'pan up',
            effects: ['lava glow', 'heat distortion']
          }
        },
        {
          id: 'scene_3_2',
          type: 'dialogue',
          content: {
            type: 'dialogue',
            speaker: 'Infernus',
            text: 'I am Infernus, the Flame Guardian! Prove your worth, challenger!',
            portrait: 'boss_fire',
            mood: 'angry'
          }
        }
      ]
    }
  ]

  /**
   * Start a cutscene
   */
  startCutscene(cutsceneId: string): boolean {
    const cutscene = this.cutscenes.find(c => c.id === cutsceneId)
    if (!cutscene) return false

    this.currentCutscene.value = { ...cutscene }
    this.currentSceneIndex.value = 0
    return true
  }

  /**
   * Get current scene
   */
  getCurrentScene(): Scene | null {
    if (!this.currentCutscene.value) return null

    return this.currentCutscene.value.scenes[this.currentSceneIndex.value] || null
  }

  /**
   * Advance to next scene
   */
  nextScene(): boolean {
    if (!this.currentCutscene.value) return false

    this.currentSceneIndex.value++

    // Check if cutscene is complete
    if (this.currentSceneIndex.value >= this.currentCutscene.value.scenes.length) {
      this.completeCutscene()
      return false
    }

    return true
  }

  /**
   * Make a choice in current scene
   */
  makeChoice(choiceIndex: number): boolean {
    const scene = this.getCurrentScene()
    if (!scene) return false

    const content = scene.content as ChoiceContent
    if (content.type !== 'choice') return false

    const choice = content.choices[choiceIndex]
    if (!choice) return false

    // Store choice
    this.storyProgress.value.choices.set(scene.id, choice.text)

    // Apply rewards
    if (choice.rewards) {
      this.applyRewards(choice.rewards)
    }

    // Move to next scene
    return this.nextScene()
  }

  /**
   * Skip current cutscene
   */
  skipCutscene(): void {
    if (!this.currentCutscene.value || !this.currentCutscene.value.skippable) return

    this.completeCutscene()
  }

  /**
   * Complete current cutscene
   */
  private completeCutscene(): void {
    if (!this.currentCutscene.value) return

    const cutscene = this.currentCutscene.value
    cutscene.completed = true

    // Mark chapter as completed
    this.storyProgress.value.completedChapters.add(cutscene.chapter)
    this.storyProgress.value.currentChapter = cutscene.chapter + 1

    this.currentCutscene.value = null
    this.currentSceneIndex.value = 0
  }

  /**
   * Get story progress
   */
  getStoryProgress() {
    return computed(() => this.storyProgress.value)
  }

  /**
   * Get all cutscenes
   */
  getAllCutscenes(): Cutscene[] {
    return this.cutscenes.map(c => ({ ...c }))
  }

  /**
   * Get cutscenes by chapter
   */
  getCutscenesByChapter(chapter: number): Cutscene[] {
    return this.cutscenes.filter(c => c.chapter === chapter).map(c => ({ ...c }))
  }

  /**
   * Set story flag
   */
  setFlag(key: string, value: any): void {
    this.storyProgress.value.flags.set(key, value)
  }

  /**
   * Get story flag
   */
  getFlag(key: string): any {
    return this.storyProgress.value.flags.get(key)
  }

  /**
   * Check if flag is set
   */
  hasFlag(key: string): boolean {
    return this.storyProgress.value.flags.has(key)
  }

  private applyRewards(rewards: { type: string; value: number }[]): void {
    // Rewards would be applied to the game state
    console.log('Applying rewards:', rewards)
  }

  /**
   * Reset story progress
   */
  resetProgress(): void {
    this.storyProgress.value = {
      currentChapter: 1,
      currentScene: 0,
      completedChapters: new Set(),
      choices: new Map(),
      flags: new Map()
    }

    this.cutscenes.forEach(c => c.completed = false)
  }
}

// Singleton instance
let storyInstance: StoryModeSystem | null = null

export function getStoryModeSystem(): StoryModeSystem {
  if (!storyInstance) {
    storyInstance = new StoryModeSystem()
  }
  return storyInstance
}

/**
 * Hook for using story mode in Vue components
 */
export function useStoryMode() {
  const system = getStoryModeSystem()

  return {
    currentCutscene: computed(() => system.currentCutscene.value),
    currentScene: computed(() => system.getCurrentScene()),
    storyProgress: system.getStoryProgress(),

    startCutscene: system.startCutscene.bind(system),
    nextScene: system.nextScene.bind(system),
    makeChoice: system.makeChoice.bind(system),
    skipCutscene: system.skipCutscene.bind(system),
    getAllCutscenes: system.getAllCutscenes.bind(system),
    getCutscenesByChapter: system.getCutscenesByChapter.bind(system),
    setFlag: system.setFlag.bind(system),
    getFlag: system.getFlag.bind(system),
    hasFlag: system.hasFlag.bind(system),
    resetProgress: system.resetProgress.bind(system)
  }
}
