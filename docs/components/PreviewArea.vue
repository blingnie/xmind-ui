<template>
  <div :class="previewAreaClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type PreviewAreaAlign = 'center' | 'left'

interface PreviewAreaProps {
  align?: PreviewAreaAlign
  withAction?: boolean
}

const props = withDefaults(defineProps<PreviewAreaProps>(), {
  align: 'center',
  withAction: false,
})

const previewAreaClasses = computed(() => {
  return [
    'preview-area',
    props.align === 'left' && 'preview-area--left',
    props.withAction && 'preview-area--with-action',
  ].filter(Boolean).join(' ')
})
</script>

<style scoped>
.preview-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-size-m-16);
  flex-wrap: wrap;
  padding: var(--spacing-padding-6xl-48);
  background: var(--color-fill-surfacebright);
  min-height: 240px;
}

.preview-area--left {
  justify-content: flex-start;
}

.preview-area--with-action {
  position: relative;
}
</style>
