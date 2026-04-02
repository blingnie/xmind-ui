<template>
  <div class="flex flex-col items-start gap-3">
    <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
      {{ heading }}
    </span>
    <span class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
      {{ tips }}
    </span>
    <fw-button :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" theme="default" @click="$emit('leave')">
      {{ leaveButtonText }}
    </fw-button>
  </div>
</template>

<script setup lang="ts">
import { useWindowResize } from 'client/composables/window-resize'

defineProps<{
  heading: string
  tips: string
  leaveButtonText: string
}>()

defineEmits<{
  (e: 'leave'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()
</script>
