<template>
  <div class="flex size-full items-center justify-center bg-fill-surfaceDesktop-light dark:bg-fill-surfaceDesktop-dark">
    <div class="flex flex-col items-center gap-6">
      <no-history-image :width="96" :height="96" />
      <span class="px-2 text-center text-desktop-body-large text-text-quaternary-light dark:text-text-quaternary-dark max-w-sm:max-w-[240px]">{{
        $T('No history versions of this map are currently available.')
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import NoHistoryImage from 'client/assets/import-files/images/snapshot-dialog/no-history.svg'
</script>
