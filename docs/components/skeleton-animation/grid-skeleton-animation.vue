<template>
  <file-grid-item-skeleton-animation v-for="(_, index) of Array.from({ length: count })" :key="index" />
</template>

<script setup lang="ts">
import FileGridItemSkeletonAnimation from 'client/components/skeleton-animation/new-file-grid-item-skeleton-animation.vue'

defineProps<{
  count: number
}>()
</script>
