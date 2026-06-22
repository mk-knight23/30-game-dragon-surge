<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

/**
 * Reusable layered cinematic background.
 *
 * Stack (back -> front): base color -> media -> dark gradient -> scanline + magma glow.
 * Rendered BEHIND all UI (z-0, pointer-events:none) so it never competes with the
 * canvas HUD for input or visibility.
 *
 * PERFORMANCE: video is only used for "menu" / "result" screens. During live
 * gameplay we render the STATIC dragon-bg.jpg so the video decoder never competes
 * with the running canvas/RAF loop for the GPU. Video is also disabled on mobile
 * and when the user prefers reduced motion (static image fallback).
 */
const props = withDefaults(
  defineProps<{
    /** "menu" + "result" allow video; "game" forces the static image. */
    variant?: 'menu' | 'game' | 'result'
    /** Override the static media (poster + fallback) image path. */
    image?: string
    /** Override the looping video path. */
    video?: string
  }>(),
  {
    variant: 'menu',
    image: '/media/dragon-bg.jpg',
    video: '/media/dragon-loop.mp4',
  },
)

const isSmallScreen = ref(false)
const prefersReducedMotion = ref(false)

onMounted(() => {
  isSmallScreen.value = window.matchMedia('(max-width: 767px)').matches
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// Only the menu / result screens may play video, and only on capable, motion-OK clients.
const useVideo = computed(
  () =>
    props.variant !== 'game' &&
    !isSmallScreen.value &&
    !prefersReducedMotion.value,
)
</script>

<template>
  <div class="bgfx" aria-hidden="true">
    <video
      v-if="useVideo"
      class="bgfx__media"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      :poster="image"
    >
      <source :src="video" type="video/mp4" />
    </video>
    <img v-else class="bgfx__media" :src="image" alt="" decoding="async" />

    <div class="bgfx__gradient"></div>
    <div class="bgfx__scanlines"></div>
    <div class="bgfx__glow"></div>
  </div>
</template>
