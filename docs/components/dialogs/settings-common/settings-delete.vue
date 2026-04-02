<template>
  <div class="flex flex-col items-start gap-3">
    <span class="text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
      {{ heading }}
    </span>
    <div class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
      <span class="text-red-500">{{ $T('Warning') }}: </span>
      <span>{{ tips }}</span>
    </div>
    <fw-button :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" theme="danger" @click="$emit('delete')">
      {{ deleteButtonText }}
    </fw-button>
  </div>
</template>

<script setup lang="ts">
import { useWindowResize } from 'client/composables/window-resize'

defineProps<{
  heading: string
  tips: string
  deleteButtonText: string
}>()

defineEmits<{
  (e: 'delete'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()
</script>
