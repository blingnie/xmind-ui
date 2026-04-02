<script setup lang="ts">
import { computed } from 'vue'

export interface CreditSegment {
  type: 'purchased' | 'granted' | 'free'
  remainder: number
  total: number
  color: string
  isAdvanced?: boolean
}

const props = defineProps<{
  segments: CreditSegment[]
}>()

const totalCredits = computed(() => props.segments.reduce((sum, seg) => sum + seg.total, 0))

const segmentStyles = computed(() => {
  return props.segments.map(segment => {
    return {
      width: `${(segment.remainder / totalCredits.value) * 100}%`,
      color: segment.color,
    }
  })
})
</script>

<template>
  <div
    class="relative h-[6px] w-full shrink-0 rounded-full bg-mask-overlay-s-light shadow-elevation-b1-light dark:bg-mask-overlay-s-dark dark:shadow-elevation-b1-dark"
  >
    <div class="absolute left-0 top-0 flex h-full w-full gap-px overflow-hidden rounded-full">
      <div v-for="(style, index) in segmentStyles" :key="index" class="h-full" :style="{ width: style.width, backgroundColor: style.color }"></div>
    </div>
  </div>
</template>
