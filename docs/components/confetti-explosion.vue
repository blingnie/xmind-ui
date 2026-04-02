<template>
  <div class="pointer-events-none fixed z-modal-dialog h-0 w-0 overflow-visible" :style="wrapperStyle">
    <confetti-explosion
      v-if="isVisible"
      :particle-count="particleCount"
      :force="force"
      :duration="duration"
      :stage-width="stageWidth"
      :stage-height="stageHeight"
      :colors="colors"
    />
  </div>
</template>

<script setup lang="ts">
import { usePromiseHook } from 'utils/vue-utils'
import { ref, computed, onMounted } from 'vue'
import type { CSSProperties } from 'vue'
import ConfettiExplosion from 'vue-confetti-explosion'

const props = withDefaults(
  defineProps<{
    particleCount?: number
    force?: number
    colors?: string[]
    stageWidth?: number
    stageHeight?: number
    position?: {
      top?: string | number
      left?: string | number
    }
    duration?: number
    fromTop?: boolean
  }>(),
  {
    particleCount: 80,
    force: 0.4,
    colors: () => ['#FBA42C', '#FFE644', '#9EFB57', '#DB60F7', '#FF714E', '#46C2EF', '#FF4949'],
    stageWidth: 1000,
    stageHeight: 800,
    position: () => ({ top: '50%', left: '50%' }),
    duration: 3000,
    fromTop: false,
  },
)

const isVisible = ref(false)

const wrapperStyle = computed((): CSSProperties => {
  if (props.fromTop) {
    return {
      top: '0',
      left: '50%',
      transform: 'translateX(-50%)',
    }
  }

  return {
    top: props.position.top || '50%',
    left: props.position.left || '50%',
    transform: props.position.top === '0' ? 'translateX(-50%)' : 'translate(-50%, -50%)',
  }
})

const { resolve } = usePromiseHook()

onMounted(() => {
  isVisible.value = true

  setTimeout(() => {
    isVisible.value = false
    setTimeout(() => {
      resolve()
    }, 100)
  }, props.duration)
})
</script>
