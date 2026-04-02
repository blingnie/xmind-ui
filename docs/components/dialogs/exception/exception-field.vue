<script setup lang="ts">
const { label = '' } = defineProps<{ label?: string }>()
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <label class="w-[108px] shrink-0 text-left text-mobile-body-medium sm:w-[120px] sm:text-desktop-body-medium">{{ label }}</label>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
