<template>
  <div class="flex flex-col">
    <file-list-item-skeleton-animation
      v-for="(_, index) of Array.from({ length: rows })"
      :key="index"
      class="file-list-item-skeleton-animation uk-margin-top uk-padding-remove"
    />
  </div>
</template>

<script lang="ts" setup>
import FileListItemSkeletonAnimation from 'client/components/skeleton-animation/new-file-list-item-skeleton-animation.vue'

defineProps<{
  rows: number
}>()
</script>
