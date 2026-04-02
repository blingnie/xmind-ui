<template>
  <div
    :class="
      twMerge('border-divider-onSurfaceBright-light dark:border-divider-onSurfaceBright-dark', orientation === 'horizontal' && 'w-full', props.class)
    "
    :style="styleObject"
  ></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: string
    orientation?: 'horizontal' | 'vertical'
    class?: VueClass
  }>(),
  { size: '1px', orientation: 'horizontal', class: '' },
)

const styleObject = computed(() => {
  return props.orientation === 'vertical' ? { 'border-left-width': props.size } : { 'border-top-width': props.size }
})
</script>
