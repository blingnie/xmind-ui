<script setup lang="ts">
export interface CreditLegendItem {
  type: 'purchased' | 'granted' | 'free'
  color: string
  label: string
}

defineProps<{
  items: CreditLegendItem[]
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <div v-for="item in items" :key="item.type" class="flex items-center gap-2">
      <div class="h-2 w-2 rounded-full" :style="{ backgroundColor: item.color }"></div>
      <span class="text-mobile-caption-1 text-text-secondary-light dark:text-text-secondary-dark sm:text-desktop-caption">
        {{ item.label }}
      </span>
    </div>
  </div>
</template>
