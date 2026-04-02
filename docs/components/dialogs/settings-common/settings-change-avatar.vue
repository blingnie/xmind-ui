<template>
  <div class="flex flex-col items-start gap-4">
    <span class="inline-block text-mobile-subhead-small text-text-primary-light dark:text-text-primary-dark sm:text-desktop-subhead-small">
      {{ $T('Icon') }}
    </span>
    <div class="relative flex items-center gap-3">
      <div class="!h-[44px] !w-[44px] shrink-0">
        <fw-image-container :src="currentAvatar" class="h-full w-full" />
      </div>
      <div class="text-mobile-caption-header text-text-tertiary-light dark:text-text-tertiary-dark sm:text-desktop-caption-header">
        <span>{{ tip }}</span>
      </div>
      <div class="ml-6 flex h-full flex-1 items-center justify-end">
        <fw-button :size="isPhoneSizeViewportWidth ? 'large' : 'medium'" theme="default" :disabled="!!isUploadDisabled" @click="handleClickUpload">{{
          $T('Upload')
        }}</fw-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $T } from 'client/library/translation'
import { debounce } from 'utils/misc'
import { useWindowResize } from 'client/composables/window-resize'

defineProps<{
  isUploadDisabled?: boolean
  currentAvatar: string
  tip: string
}>()

const emit = defineEmits<{
  (e: 'upload'): void
}>()

const { isPhoneSizeViewportWidth } = useWindowResize()

const handleClickUpload = debounce(() => {
  emit('upload')
}, 200)
</script>
