<template>
  <div
    class="bg-transparent-white-9 dark:bg-transparent-dark-7 absolute left-0 top-0 flex h-full w-full cursor-none items-center justify-center px-8 backdrop-blur-[2px] dark:backdrop-blur-[3px]"
  >
    <div class="flex flex-col items-center gap-3">
      <img :src="dragAreaImageSource" alt="Drag Area" />
      <div class="text-desktop-subhead-small text-text-primary-light dark:text-text-primary-dark">{{ $T('Drag files here to upload') }}</div>
      <div class="text-desktop-body-medium text-text-tertiary-light dark:text-text-tertiary-dark max-w-[300px] text-center">
        {{ $T('Supports PDF, Word, PowerPoint, Text, Markdown, JPG, JPEG, PNG, up to 50MB in size.') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dragAreaImageSourceLight from 'client/assets/import-files/images/dialog-copilot/copilot-dialog-file-drag-area-light.svg?url'
import dragAreaImageSourceDark from 'client/assets/import-files/images/dialog-copilot/copilot-dialog-file-drag-area-dark.svg?url'
import { useAppStore } from 'client/store/app-store'
import { computed } from 'vue'

const appStore = useAppStore()
const dragAreaImageSource = computed(() => {
  return appStore.appearance === 'dark' ? dragAreaImageSourceDark : dragAreaImageSourceLight
})
</script>
