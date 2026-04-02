<template>
  <div class="contents">
    <template v-if="isDesktop">
      <slot name="desktop"></slot>
    </template>

    <template v-else-if="$slots['mobile']">
      <slot name="mobile"></slot>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useWindowResize } from 'client/composables/window-resize'
import { BREAK_POINTS } from 'client/constants'

const props = withDefaults(
  defineProps<{
    breakpoint?: number // optional breakpoint for mobile view, default is 768px
  }>(),
  {
    breakpoint: BREAK_POINTS.sm, // Default breakpoint for mobile view
  },
)
const { windowWidth } = useWindowResize()

const isDesktop = computed(() => {
  return windowWidth.value >= props.breakpoint
})
</script>
