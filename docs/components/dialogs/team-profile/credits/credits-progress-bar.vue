<script setup lang="ts">
import { computed } from 'vue'
import { $T } from 'client/library/translation'
import BaseTooltip from 'client/components/base/tooltip.vue'

export interface CreditSegment {
  type: 'purchased' | 'granted' | 'free'
  remainder: number
  total: number
  color: string
}

const props = defineProps<{
  segments: CreditSegment[]
}>()

const totalCredits = computed(() => props.segments.reduce((sum, seg) => sum + seg.total, 0))

const segmentStyles = computed(() => {
  return props.segments
    .filter(segment => segment.remainder > 0)
    .map(segment => {
      return {
        width: `${(segment.remainder / totalCredits.value) * 100}%`,
        color: segment.color,
        remainder: segment.remainder,
        total: segment.total,
        type: segment.type,
      }
    })
})

const getCreditTypeLabel = (type: string) => {
  const labels = {
    purchased: $T('Add-on credits'),
    granted: $T('Subscription credits'),
    free: $T('Free credits'),
  }
  return labels[type] || type
}
</script>

<template>
  <div
    class="bg-mask-overlay-s-light shadow-elevation-b1-light dark:bg-mask-overlay-s-dark dark:shadow-elevation-b1-dark relative h-3 w-full shrink-0 rounded"
  >
    <div class="absolute left-0 top-0 flex h-full w-full gap-px overflow-hidden rounded">
      <base-tooltip
        v-for="(style, index) in segmentStyles"
        :key="index"
        :delay="200"
        align="top"
        class="block h-full"
        :style="{ width: style.width }"
      >
        <div class="h-full w-full transition-opacity hover:opacity-90" :style="{ backgroundColor: style.color }">
          <span class="invisible">.</span>
        </div>
        <template #tooltip>
          <div class="flex flex-col items-center">
            <div class="text-desktop-caption-small text-light-grey-10 dark:text-text-tertiary-dark">
              {{ getCreditTypeLabel(style.type) }}
            </div>
            <div class="text-desktop-caption text-white">{{ style.remainder.toFixed(1) }}/{{ style.total.toFixed(1) }}</div>
          </div>
        </template>
      </base-tooltip>
    </div>
  </div>
</template>
